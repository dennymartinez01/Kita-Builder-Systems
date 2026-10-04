import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/heatmap
 * Receives click and scroll events from client sites.
 * Batched — body can contain an array of events.
 *
 * Body: {
 *   site_id: string
 *   events: Array<{
 *     event_type: 'click' | 'scroll'
 *     click_x?: number     // 0.0-1.0
 *     click_y?: number     // 0.0-1.0
 *     scroll_depth?: number // 0.0-1.0
 *     path?: string
 *     session_id?: string
 *   }>
 * }
 *
 * Privacy: no PII collected. x/y stored as page percentages only.
 * Always returns 200 — tracking must never break the calling site.
 */
export async function POST(req: NextRequest) {
  try {
    const { site_id, events } = await req.json()
    if (!site_id || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ ok: true }) // silent ignore
    }

    // Validate + sanitise each event
    const rows = events
      .filter(e => e.event_type === 'click' || e.event_type === 'scroll')
      .slice(0, 50) // cap batch size
      .map(e => ({
        site_id,
        event_type:   e.event_type,
        click_x:      e.event_type === 'click' ? Math.max(0, Math.min(1, Number(e.click_x) || 0)) : null,
        click_y:      e.event_type === 'click' ? Math.max(0, Math.min(1, Number(e.click_y) || 0)) : null,
        scroll_depth: e.event_type === 'scroll' ? Math.max(0, Math.min(1, Number(e.scroll_depth) || 0)) : null,
        path:         (e.path || '/').substring(0, 255),
        session_id:   e.session_id ? String(e.session_id).substring(0, 64) : null,
      }))

    if (rows.length > 0) {
      await supabase.from('heatmap_events').insert(rows as any)
    }

    return NextResponse.json({ ok: true })
  } catch {
    // Always return 200 — tracking must never break the site
    return NextResponse.json({ ok: false })
  }
}
