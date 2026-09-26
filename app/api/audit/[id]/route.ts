import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { runAudit } from '@/lib/audit'

export const maxDuration = 60

type Params = { params: Promise<{ id: string }> }

// GET /api/audit/[id] — fetch full audit + crawled pages
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const [auditRes, pagesRes] = await Promise.all([
      supabase.from('audits').select('*').eq('id', id).single(),
      supabase.from('audit_pages').select('*').eq('audit_id', id).order('created_at'),
    ])

    if (auditRes.error || !auditRes.data) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    return NextResponse.json({
      audit: auditRes.data,
      pages: pagesRes.data || [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/audit/[id] — re-run audit
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { data: existing } = await supabase
      .from('audits').select('url').eq('id', id).single()

    if (!existing) return NextResponse.json({ error: 'Audit not found' }, { status: 404 })

    // Delete old pages before re-running
    await supabase.from('audit_pages').delete().eq('audit_id', id)
    await supabase.from('audits').update({ status: 'running' }).eq('id', id)

    try {
      const { scores, raw_data, issues, pages } = await runAudit(existing.url)

      await supabase.from('audits').update({
        status: 'completed', scores, raw_data, issues,
      }).eq('id', id)

      if (pages && pages.length > 0) {
        await supabase.from('audit_pages').insert(
          pages.map(p => ({
            audit_id: id,
            url: p.url,
            status_code: p.status_code || null,
            title: p.title || null,
            meta_desc: p.meta_desc || null,
            h1_count: p.h1_count ?? 0,
          }))
        )
      }

      return NextResponse.json({
        id, status: 'completed', scores,
        pages_crawled: pages?.length ?? 0,
      })
    } catch (err: any) {
      await supabase.from('audits').update({
        status: 'failed', raw_data: { error: err.message },
      }).eq('id', id)
      return NextResponse.json({ id, status: 'failed', error: err.message }, { status: 422 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
