import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/admin/health
 *
 * What:  Computes health flags for every client — quiet sites,
 *        expiring/expired trials, overdue payments, no site yet.
 * Why:   Gives the operator a prioritised list of clients that
 *        need attention before they churn or complain.
 * Who:   Admin — Site Health Monitor page.
 * Status: Active — Phase 18
 */

export type HealthFlag =
  | 'trial_expiring'   // trial ends in ≤7 days
  | 'trial_expired'    // trial ended but still on trial status
  | 'quiet_site'       // no bookings in 30 days (has a site)
  | 'overdue'          // subscription_status = 'overdue'
  | 'no_site'          // active/trial client with zero sites
  | 'not_onboarded'    // onboarding_complete = false and >3 days since created

export type HealthSeverity = 'high' | 'medium' | 'low'

export interface ClientHealthRow {
  client_id:            string
  client_name:          string
  client_email:         string
  subscription_plan:    string
  subscription_status:  string
  trial_ends_at:        string | null
  onboarding_complete:  boolean
  created_at:           string
  sites:                { id: string; slug: string; business_name: string; last_booking_at: string | null }[]
  flags:                HealthFlag[]
  severity:             HealthSeverity
}

const FLAG_SEVERITY: Record<HealthFlag, HealthSeverity> = {
  trial_expired:   'high',
  overdue:         'high',
  trial_expiring:  'medium',
  quiet_site:      'medium',
  not_onboarded:   'medium',
  no_site:         'low',
}

function computeSeverity(flags: HealthFlag[]): HealthSeverity {
  if (flags.some(f => FLAG_SEVERITY[f] === 'high'))   return 'high'
  if (flags.some(f => FLAG_SEVERITY[f] === 'medium')) return 'medium'
  return 'low'
}

export async function GET() {
  try {
    const supabase = createServerClient()
    const now      = new Date()
    const since30  = new Date(now.getTime() - 30 * 86_400_000).toISOString()
    const in7Days  = new Date(now.getTime() + 7  * 86_400_000).toISOString()

    // Fetch all clients
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, email, subscription_plan, subscription_status, trial_ends_at, onboarding_complete, created_at')
      .order('created_at', { ascending: false })

    if (!clients?.length) return NextResponse.json({ rows: [], summary: emptySummary() })

    const clientIds = clients.map((c: any) => c.id)

    // Fetch all sites for these clients
    const { data: sites } = await supabase
      .from('sites')
      .select('id, slug, business_name, client_id')
      .in('client_id', clientIds)

    // Fetch most recent booking per site in last 30 days
    const siteIds = (sites ?? []).map((s: any) => s.id)
    const { data: recentBookings } = siteIds.length
      ? await supabase
          .from('bookings')
          .select('site_id, created_at')
          .in('site_id', siteIds)
          .gte('created_at', since30)
          .order('created_at', { ascending: false })
      : { data: [] }

    // Map: siteId → most recent booking date
    const lastBookingMap: Record<string, string> = {}
    for (const b of (recentBookings ?? []) as any[]) {
      if (!lastBookingMap[b.site_id]) lastBookingMap[b.site_id] = b.created_at
    }

    // Map: clientId → sites[]
    const clientSitesMap: Record<string, any[]> = {}
    for (const s of (sites ?? []) as any[]) {
      if (!clientSitesMap[s.client_id]) clientSitesMap[s.client_id] = []
      clientSitesMap[s.client_id].push({
        id:               s.id,
        slug:             s.slug,
        business_name:    s.business_name,
        last_booking_at:  lastBookingMap[s.id] ?? null,
      })
    }

    const rows: ClientHealthRow[] = []

    for (const c of clients as any[]) {
      const clientSites = clientSitesMap[c.id] ?? []
      const flags: HealthFlag[] = []

      // trial_expired: trial status but trial_ends_at is in the past
      if (
        c.subscription_status === 'trial' &&
        c.trial_ends_at &&
        new Date(c.trial_ends_at) < now
      ) flags.push('trial_expired')

      // trial_expiring: ends within 7 days (not yet expired)
      if (
        c.subscription_status === 'trial' &&
        c.trial_ends_at &&
        new Date(c.trial_ends_at) >= now &&
        new Date(c.trial_ends_at) <= new Date(in7Days)
      ) flags.push('trial_expiring')

      // overdue
      if (c.subscription_status === 'overdue') flags.push('overdue')

      // no_site: active or trial client with no sites created yet
      if (clientSites.length === 0 && ['active', 'trial'].includes(c.subscription_status)) {
        flags.push('no_site')
      }

      // quiet_site: has sites but none received a booking in 30 days
      if (clientSites.length > 0 && clientSites.every((s: any) => !s.last_booking_at)) {
        flags.push('quiet_site')
      }

      // not_onboarded: onboarding incomplete + created more than 3 days ago
      if (
        !c.onboarding_complete &&
        new Date(c.created_at).getTime() < now.getTime() - 3 * 86_400_000
      ) flags.push('not_onboarded')

      // Only include clients that have at least one flag
      if (flags.length === 0) continue

      rows.push({
        client_id:           c.id,
        client_name:         c.name,
        client_email:        c.email,
        subscription_plan:   c.subscription_plan,
        subscription_status: c.subscription_status,
        trial_ends_at:       c.trial_ends_at,
        onboarding_complete: c.onboarding_complete,
        created_at:          c.created_at,
        sites:               clientSites,
        flags,
        severity:            computeSeverity(flags),
      })
    }

    // Sort: high first, then medium, then low; within same severity by most flags
    rows.sort((a, b) => {
      const sev = { high: 0, medium: 1, low: 2 }
      const sevDiff = sev[a.severity] - sev[b.severity]
      if (sevDiff !== 0) return sevDiff
      return b.flags.length - a.flags.length
    })

    return NextResponse.json({ rows, summary: buildSummary(rows) })
  } catch (err: any) {
    console.error('[/api/admin/health]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function emptySummary() {
  return { total: 0, high: 0, medium: 0, low: 0 }
}

function buildSummary(rows: ClientHealthRow[]) {
  return {
    total:  rows.length,
    high:   rows.filter(r => r.severity === 'high').length,
    medium: rows.filter(r => r.severity === 'medium').length,
    low:    rows.filter(r => r.severity === 'low').length,
  }
}
