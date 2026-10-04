import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { MONTHLY_RATES } from '@/lib/entitlements'

/**
 * GET /api/admin/analytics
 *
 * What:  Single endpoint returning all data for the Admin Analytics Dashboard.
 * Why:   Gives the operator a cross-site health view — MRR, growth, leads,
 *        bookings, plan distribution, and top clients.
 * Who:   Admin only.
 * Status: Active — Phase 16
 *
 * Returns:
 *   kpis          — 7 headline numbers
 *   plan_dist     — client count by subscription plan
 *   lead_funnel   — lead count by status
 *   top_clients   — top 5 clients by MRR
 *   daily_bookings— last 30 days (label + count)
 *   daily_signups — last 30 days new clients (label + count)
 *   daily_views   — last 30 days page views (label + count)
 *   recent_clients— last 5 new clients
 */

// Helper: generate a label array for the last N days ("Sep 23")
function last30Labels(): string[] {
  const labels: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    labels.push(d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }))
  }
  return labels
}

// Helper: bucket ISO timestamps into a 30-day day array (index 0 = 30 days ago)
function bucketByDay(timestamps: string[]): number[] {
  const counts = new Array(30).fill(0)
  const now = Date.now()
  for (const ts of timestamps) {
    const diff = now - new Date(ts).getTime()
    const daysAgo = Math.floor(diff / 86_400_000)
    if (daysAgo >= 0 && daysAgo < 30) {
      counts[29 - daysAgo]++
    }
  }
  return counts
}

export async function GET() {
  try {
    const supabase = createServerClient()
    const since30  = new Date(Date.now() - 30 * 86_400_000).toISOString()

    // ── Parallel fetches ────────────────────────────────────────
    const [
      clientsRes,
      sitesRes,
      bookingsRes,
      leadsRes,
      viewsRes,
    ] = await Promise.all([
      supabase
        .from('clients')
        .select('id, name, email, subscription_plan, subscription_status, created_at')
        .order('created_at', { ascending: false }),

      supabase
        .from('sites')
        .select('id, client_id, payment_status, business_name, created_at'),

      supabase
        .from('bookings')
        .select('id, site_id, created_at, status')
        .gte('created_at', since30),

      supabase
        .from('leads')
        .select('id, status, created_at'),

      supabase
        .from('page_views')
        .select('site_id, viewed_at')
        .gte('viewed_at', since30),
    ])

    const clients  = clientsRes.data  ?? []
    const sites    = sitesRes.data    ?? []
    const bookings = bookingsRes.data ?? []
    const leads    = leadsRes.data    ?? []
    const views    = viewsRes.data    ?? []

    // ── KPIs ────────────────────────────────────────────────────
    const activeClients = clients.filter(
      (c: any) => c.subscription_status === 'active'
    )
    const trialClients = clients.filter(
      (c: any) => c.subscription_status === 'trial'
    )

    const mrr = activeClients.reduce(
      (sum: number, c: any) => sum + (MONTHLY_RATES[c.subscription_plan as string] ?? 0),
      0
    )

    const paidSites     = sites.filter((s: any) => s.payment_status === 'paid')
    const totalSetupRev = paidSites.length * 150

    const newClientsLast30 = clients.filter(
      (c: any) => new Date(c.created_at) >= new Date(since30)
    ).length

    const newBookingsLast30 = bookings.length
    const newLeadsLast30    = leads.filter(
      (l: any) => new Date(l.created_at) >= new Date(since30)
    ).length
    const totalPageViews30  = views.length

    // ── Plan distribution ───────────────────────────────────────
    const planCounts: Record<string, number> = {
      trial: 0, starter: 0, growth: 0, agency: 0, custom: 0,
    }
    for (const c of clients as any[]) {
      planCounts[c.subscription_plan] = (planCounts[c.subscription_plan] ?? 0) + 1
    }

    // ── Lead funnel ─────────────────────────────────────────────
    const leadFunnel: Record<string, number> = {
      new: 0, contacted: 0, converted: 0, closed: 0,
    }
    for (const l of leads as any[]) {
      leadFunnel[l.status] = (leadFunnel[l.status] ?? 0) + 1
    }

    // ── Top 5 clients by MRR ────────────────────────────────────
    const topClients = (clients as any[])
      .filter((c: any) => c.subscription_status === 'active')
      .map((c: any) => ({
        id:     c.id,
        name:   c.name,
        email:  c.email,
        plan:   c.subscription_plan,
        mrr:    MONTHLY_RATES[c.subscription_plan as string] ?? 0,
        sites:  sites.filter((s: any) => s.client_id === c.id).length,
      }))
      .sort((a: any, b: any) => b.mrr - a.mrr)
      .slice(0, 5)

    // ── 30-day sparkline data ───────────────────────────────────
    const labels        = last30Labels()
    const bookingCounts = bucketByDay(bookings.map((b: any) => b.created_at))
    const signupCounts  = bucketByDay(
      clients
        .filter((c: any) => new Date(c.created_at) >= new Date(since30))
        .map((c: any) => c.created_at)
    )
    const viewCounts    = bucketByDay(views.map((v: any) => v.viewed_at))

    // ── Recent 5 new clients ────────────────────────────────────
    const recentClients = (clients as any[]).slice(0, 5).map((c: any) => ({
      id:     c.id,
      name:   c.name,
      email:  c.email,
      plan:   c.subscription_plan,
      status: c.subscription_status,
      joined: c.created_at,
    }))

    return NextResponse.json({
      kpis: {
        mrr,
        arr:                mrr * 12,
        total_clients:      clients.length,
        active_clients:     activeClients.length,
        trial_clients:      trialClients.length,
        total_sites:        sites.length,
        paid_sites:         paidSites.length,
        setup_revenue:      totalSetupRev,
        new_clients_30d:    newClientsLast30,
        new_bookings_30d:   newBookingsLast30,
        new_leads_30d:      newLeadsLast30,
        page_views_30d:     totalPageViews30,
        total_leads:        leads.length,
      },
      plan_dist:      planCounts,
      lead_funnel:    leadFunnel,
      top_clients:    topClients,
      daily_labels:   labels,
      daily_bookings: bookingCounts,
      daily_signups:  signupCounts,
      daily_views:    viewCounts,
      recent_clients: recentClients,
    })
  } catch (err: any) {
    console.error('[/api/admin/analytics]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
