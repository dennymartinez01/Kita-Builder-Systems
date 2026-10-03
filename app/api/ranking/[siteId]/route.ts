import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { calculateRank } from '@/lib/ranking'
import type { RankInput } from '@/lib/ranking'

type RouteContext = { params: Promise<{ siteId: string }> }

/**
 * GET /api/ranking/[siteId]
 * Fetches all data needed, computes rank + badges, returns result.
 * Lightweight — designed to be called on owner dashboard mount.
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { siteId } = await params
    const supabase   = createServerClient()

    const now     = new Date()
    const ago30   = new Date(now); ago30.setDate(ago30.getDate() - 30)
    const ago60   = new Date(now); ago60.setDate(ago60.getDate() - 60)

    // All queries in parallel
    const [siteRes, booksRes, bks30Res, bksPrev30Res, custRes] = await Promise.all([
      supabase.from('sites').select('id, created_at, theme_json, business_type').eq('id', siteId).single(),
      supabase.from('bookings').select('status', { count: 'exact' }).eq('site_id', siteId),
      supabase.from('bookings').select('id', { count: 'exact', head: true })
        .eq('site_id', siteId).eq('status', 'confirmed')
        .gte('booking_date', ago30.toISOString().split('T')[0]),
      supabase.from('bookings').select('id', { count: 'exact', head: true })
        .eq('site_id', siteId).eq('status', 'confirmed')
        .gte('booking_date', ago60.toISOString().split('T')[0])
        .lt('booking_date', ago30.toISOString().split('T')[0]),
      supabase.from('site_customers').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
    ])

    if (!siteRes.data) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    const site      = siteRes.data
    const themeJson = (site.theme_json as any) || {}
    const bookings  = booksRes.data || []

    const totalConfirmed = bookings.filter((b: any) => b.status === 'confirmed').length
    const totalCancelled = bookings.filter((b: any) => b.status === 'cancelled').length

    // Site completeness checks from theme_json
    const hasLogo    = !!(themeJson.logo_url)
    const hasGallery = Array.isArray(themeJson.sections)
      ? themeJson.sections.some((s: any) => s.type === 'gallery' && s.data?.images?.length > 0)
      : false
    const hasStaff   = Array.isArray(themeJson.sections)
      ? themeJson.sections.some((s: any) => s.type === 'staff')
      : false
    const hasHours   = !!(themeJson.business_hours)
    const hasAbout   = Array.isArray(themeJson.sections)
      ? themeJson.sections.some((s: any) => s.type === 'about' && s.data?.body)
      : false

    // Reviews from testimonials section
    const testimonials = Array.isArray(themeJson.sections)
      ? themeJson.sections.find((s: any) => s.type === 'testimonials')
      : null
    const reviewItems: any[]  = testimonials?.data?.items || []
    const reviewCount         = reviewItems.length
    const reviewAvgRating     = reviewCount > 0
      ? reviewItems.reduce((s: number, r: any) => s + (r.rating || 0), 0) / reviewCount
      : 0

    // Services + staff counts
    const [svcsRes, staffRes] = await Promise.all([
      supabase.from('services').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
      supabase.from('staff').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
    ])

    const input: RankInput = {
      bookings30d:         bks30Res.count ?? 0,
      bookingsPrev30d:     bksPrev30Res.count ?? 0,
      totalConfirmed,
      totalCancelled,
      registeredCustomers: custRes.count ?? 0,
      hasLogo,
      hasGallery,
      hasStaff,
      hasHours,
      hasAbout,
      createdAt:           site.created_at,
      reviewCount,
      reviewAvgRating,
      servicesCount:       svcsRes.count ?? 0,
      staffCount:          staffRes.count ?? 0,
    }

    const result = calculateRank(input)

    return NextResponse.json({
      site_id:   siteId,
      score:     result.score,
      tier:      result.tier,
      badges:    result.badges,
      breakdown: result.breakdown,
      input,     // include for debugging / future display
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
