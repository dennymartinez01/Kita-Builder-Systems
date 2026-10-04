import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { HeatmapData } from '@/types/database'

type RouteContext = { params: Promise<{ siteId: string }> }

/**
 * GET /api/heatmap/[siteId]?days=30&path=/
 * Returns aggregated heatmap data for a site.
 * Aggregates click positions into a 20x20 grid.
 * Aggregates scroll depth into 10% buckets.
 */
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { siteId } = await params
    const { searchParams } = _req.nextUrl
    const days = Number(searchParams.get('days') || 30)
    const path = searchParams.get('path') || '/'

    const since = new Date()
    since.setDate(since.getDate() - days)

    const supabase = createServerClient()

    const { data: events, error } = await supabase
      .from('heatmap_events')
      .select('event_type, click_x, click_y, scroll_depth')
      .eq('site_id', siteId)
      .eq('path', path)
      .gte('recorded_at', since.toISOString())
      .limit(10000) // cap for safety

    if (error) throw error

    const clickEvents  = (events || []).filter((e: any) => e.event_type === 'click')
    const scrollEvents = (events || []).filter((e: any) => e.event_type === 'scroll')

    // ── Aggregate clicks into 20x20 grid ─────────────────────
    const GRID = 20
    const clickGrid: Record<string, number> = {}
    clickEvents.forEach((e: any) => {
      const gx = Math.min(GRID - 1, Math.floor((e.click_x  || 0) * GRID))
      const gy = Math.min(GRID - 1, Math.floor((e.click_y  || 0) * GRID))
      const key = `${gx},${gy}`
      clickGrid[key] = (clickGrid[key] || 0) + 1
    })

    const clicks = Object.entries(clickGrid).map(([key, count]) => {
      const [gx, gy] = key.split(',').map(Number)
      return {
        x:     (gx + 0.5) / GRID, // centre of cell
        y:     (gy + 0.5) / GRID,
        count,
      }
    }).sort((a, b) => b.count - a.count)

    // ── Aggregate scroll into 10% buckets ────────────────────
    const scrollBuckets: number[] = Array(10).fill(0)
    scrollEvents.forEach((e: any) => {
      const bucket = Math.min(9, Math.floor((e.scroll_depth || 0) * 10))
      scrollBuckets[bucket]++
    })

    const scroll_buckets = scrollBuckets.map((count, i) => ({
      depth: (i + 1) * 10, // bucket end %
      count,
    }))

    const avg_scroll_depth = scrollEvents.length > 0
      ? scrollEvents.reduce((s: number, e: any) => s + (e.scroll_depth || 0), 0) / scrollEvents.length
      : 0

    const result: HeatmapData = {
      clicks,
      scroll_buckets,
      total_clicks:        clickEvents.length,
      total_scroll_events: scrollEvents.length,
      avg_scroll_depth:    Math.round(avg_scroll_depth * 100) / 100,
    }

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json(
      { clicks: [], scroll_buckets: [], total_clicks: 0, total_scroll_events: 0, avg_scroll_depth: 0, error: err.message },
      { status: 500 }
    )
  }
}
