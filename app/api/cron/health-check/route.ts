import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { logEvent } from '@/lib/events'

/**
 * GET /api/cron/health-check
 *
 * What:  Runs health checks across all clients and logs events
 *        for: expired trials, sites quiet for 30+ days, overdue payments.
 *        Designed to be called by Vercel Cron Jobs once per day.
 * Why:   Populates the event stream with system health signals so
 *        the admin gets proactive notifications without manual review.
 * Who:   Vercel cron scheduler (or manual trigger for testing).
 * Status: Active — Phase 21
 *
 * Security: Vercel automatically adds a CRON_SECRET Authorization header
 * on cron invocations. We verify it to block public access.
 */
export async function GET(req: NextRequest) {
  // Verify Vercel cron secret (set CRON_SECRET in Vercel env vars)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()
  const now      = new Date()
  const since30  = new Date(now.getTime() - 30 * 86_400_000).toISOString()

  let trialsExpired  = 0
  let sitesQuiet     = 0
  let overdueClients = 0

  try {
    // ── 1. Expired trials ────────────────────────────────────
    const { data: expiredTrials } = await supabase
      .from('clients')
      .select('id, name, email, trial_ends_at')
      .eq('subscription_status', 'trial')
      .lt('trial_ends_at', now.toISOString())

    for (const c of (expiredTrials ?? []) as any[]) {
      await logEvent({
        event_type:  'trial.expired',
        category:    'subscription',
        severity:    'warning',
        actor_type:  'system',
        actor_id:    'cron/health-check',
        client_id:   c.id,
        entity_type: 'client',
        entity_id:   c.id,
        summary:     `Trial expired for ${c.name} (${c.email}) — ${new Date(c.trial_ends_at).toLocaleDateString('en-AU')}`,
        metadata:    { trial_ends_at: c.trial_ends_at },
      })
      trialsExpired++
    }

    // ── 2. Overdue subscriptions ──────────────────────────────
    const { data: overdueList } = await supabase
      .from('clients')
      .select('id, name, email, subscription_plan')
      .eq('subscription_status', 'overdue')

    for (const c of (overdueList ?? []) as any[]) {
      await logEvent({
        event_type:  'subscription.overdue',
        category:    'subscription',
        severity:    'warning',
        actor_type:  'system',
        actor_id:    'cron/health-check',
        client_id:   c.id,
        entity_type: 'client',
        entity_id:   c.id,
        summary:     `Overdue subscription — ${c.name} (${c.email}) on ${c.subscription_plan} plan`,
        metadata:    { plan: c.subscription_plan },
      })
      overdueClients++
    }

    // ── 3. Quiet sites (no bookings in 30 days) ───────────────
    const { data: allSites } = await supabase
      .from('sites')
      .select('id, slug, business_name, client_id')
      .eq('published', true)

    const allSiteIds = (allSites ?? []).map((s: any) => s.id)

    // Sites that HAD a booking in last 30 days
    const { data: activeSiteBookings } = allSiteIds.length
      ? await supabase
          .from('bookings')
          .select('site_id')
          .in('site_id', allSiteIds)
          .gte('created_at', since30)
      : { data: [] }

    const activeSiteIds = new Set((activeSiteBookings ?? []).map((b: any) => b.site_id))

    for (const s of (allSites ?? []) as any[]) {
      if (activeSiteIds.has(s.id)) continue // has recent bookings — fine

      // Only flag sites that have a linked client (unlinked demo sites are noise)
      if (!s.client_id) continue

      await logEvent({
        event_type:  'site.quiet',
        category:    'site',
        severity:    'info',
        actor_type:  'system',
        actor_id:    'cron/health-check',
        client_id:   s.client_id,
        site_id:     s.id,
        entity_type: 'site',
        entity_id:   s.id,
        summary:     `Site quiet for 30+ days — ${s.business_name} (/${s.slug})`,
        metadata:    { slug: s.slug },
      })
      sitesQuiet++
    }

    return NextResponse.json({
      success: true,
      ran_at:  now.toISOString(),
      results: { trials_expired: trialsExpired, overdue_clients: overdueClients, quiet_sites: sitesQuiet },
    })
  } catch (err: any) {
    console.error('[/api/cron/health-check]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
