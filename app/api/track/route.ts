import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * POST /api/track
 * Records a page view for site analytics.
 *
 * Geographic data (country/region) is derived from:
 *   1. CF-IPCountry header (Cloudflare/Vercel Edge — most reliable)
 *   2. Accept-Language header (rough locale hint — fallback only)
 *
 * Privacy-first: stores 2-letter country code only — no raw IPs.
 * Never fails silently breaks the calling site.
 */
export async function POST(req: NextRequest) {
  try {
    const { site_id, path = '/' } = await req.json()

    if (!site_id) {
      return NextResponse.json({ error: 'site_id required' }, { status: 400 })
    }

    // ── Geographic detection ──────────────────────────────
    // Priority 1: Cloudflare / Vercel Edge country header (2-letter ISO code)
    let country: string | null =
      req.headers.get('cf-ipcountry') ||           // Cloudflare
      req.headers.get('x-vercel-ip-country') ||    // Vercel Edge
      req.headers.get('x-country-code') ||         // Generic CDN
      null

    // Normalise — 'XX' is Cloudflare's code for unknown
    if (country === 'XX' || country === 'ZZ') country = null

    // Priority 2: Accept-Language header (rough locale → country guess)
    // Only used when no geo header available
    if (!country) {
      const acceptLang = req.headers.get('accept-language') || ''
      // e.g. "en-AU,en;q=0.9" → extract country part after hyphen
      const match = acceptLang.match(/[a-z]{2}-([A-Z]{2})/i)
      if (match) country = match[1].toUpperCase()
    }

    const supabase = createServerClient()
    await supabase.from('page_views').insert({
      site_id,
      path,
      ...(country ? { country } : {}),
    } as any)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    // Silently fail — analytics should never break the site
    console.error('[/api/track]', err.message)
    return NextResponse.json({ ok: false })
  }
}
