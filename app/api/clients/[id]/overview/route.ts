import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { MONTHLY_RATES } from '@/lib/entitlements'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/clients/[id]/overview
 *
 * Returns aggregated stats for a client in one round-trip:
 *   client        — base record
 *   sites         — all their sites with payment status
 *   stats         — bookings_total, customers_total, page_views_30d, coupons_active
 *   recent_events — last 10 events across their sites
 *   mrr           — monthly revenue contribution
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id: clientId } = await params
    const supabase = createServerClient()

    // 1. Client record
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (clientErr || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // 2. All their sites
    const { data: sites } = await supabase
      .from('sites')
      .select('id, slug, business_name, business_type, payment_status, published, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    const siteIds = (sites ?? []).map((s: any) => s.id)

    // 3. Stats — parallel queries across site IDs
    const [bookingsRes, customersRes, viewsRes, couponsRes, eventsRes] = await Promise.all([
      // Total bookings
      siteIds.length
        ? supabase.from('bookings').select('id', { count: 'exact', head: true }).in('site_id', siteIds)
        : Promise.resolve({ count: 0 }),

      // Total registered customers
      siteIds.length
        ? supabase.from('site_customers').select('id', { count: 'exact', head: true }).in('site_id', siteIds)
        : Promise.resolve({ count: 0 }),

      // Page views last 30 days
      (() => {
        const since = new Date()
        since.setDate(since.getDate() - 30)
        return siteIds.length
          ? supabase.from('page_views').select('id', { count: 'exact', head: true })
              .in('site_id', siteIds)
              .gte('viewed_at', since.toISOString())
          : Promise.resolve({ count: 0 })
      })(),

      // Active coupons
      siteIds.length
        ? supabase.from('coupons').select('id', { count: 'exact', head: true })
            .in('site_id', siteIds)
            .eq('active', true)
        : Promise.resolve({ count: 0 }),

      // Recent events
      siteIds.length
        ? supabase.from('events')
            .select('id, occurred_at, event_type, category, summary, severity')
            .in('site_id', siteIds)
            .order('occurred_at', { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [] }),
    ])

    // 4. Recent bookings (last 5)
    const { data: recentBookings } = siteIds.length
      ? await supabase
          .from('bookings')
          .select('id, site_id, customer_name, service_name, booking_date, booking_time, status')
          .in('site_id', siteIds)
          .order('created_at', { ascending: false })
          .limit(5)
      : { data: [] }

    const mrr = client.subscription_status === 'active'
      ? (MONTHLY_RATES[client.subscription_plan] ?? 0)
      : 0

    const paidSites = (sites ?? []).filter((s: any) => s.payment_status === 'paid').length
    const setupFeesTotal = paidSites * 150

    return NextResponse.json({
      client,
      sites:           sites ?? [],
      recent_bookings: recentBookings ?? [],
      recent_events:   (eventsRes as any).data ?? [],
      stats: {
        bookings_total:   (bookingsRes as any).count  ?? 0,
        customers_total:  (customersRes as any).count ?? 0,
        page_views_30d:   (viewsRes as any).count     ?? 0,
        coupons_active:   (couponsRes as any).count   ?? 0,
        sites_total:      (sites ?? []).length,
        sites_paid:       paidSites,
        mrr,
        setup_fees_total: setupFeesTotal,
        arr:              mrr * 12,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
