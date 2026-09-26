import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { runAudit, normalizeUrl } from '@/lib/audit'

export const maxDuration = 60

// POST /api/audit — create and run a new audit
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

    const normalizedUrl = normalizeUrl(url)
    const supabase = createServerClient()

    // Create audit record
    const { data: audit, error: insertError } = await supabase
      .from('audits')
      .insert({ url: normalizedUrl, status: 'queued' })
      .select()
      .single()

    if (insertError) throw new Error(`Failed to create audit: ${insertError.message}`)

    // Mark running
    await supabase.from('audits').update({ status: 'running' }).eq('id', audit.id)

    try {
      const { scores, raw_data, issues, pages } = await runAudit(normalizedUrl)

      // Save main audit record
      await supabase.from('audits').update({
        status: 'completed',
        scores,
        raw_data,
        issues,
      }).eq('id', audit.id)

      // Save crawled pages to audit_pages table
      if (pages && pages.length > 0) {
        await supabase.from('audit_pages').insert(
          pages.map(p => ({
            audit_id: audit.id,
            url: p.url,
            status_code: p.status_code || null,
            title: p.title || null,
            meta_desc: p.meta_desc || null,
            h1_count: p.h1_count ?? 0,
          }))
        )
      }

      return NextResponse.json({
        id: audit.id,
        status: 'completed',
        scores,
        pages_crawled: pages?.length ?? 0,
      })
    } catch (analysisError: any) {
      await supabase.from('audits').update({
        status: 'failed',
        raw_data: { error: analysisError.message },
      }).eq('id', audit.id)

      return NextResponse.json(
        { id: audit.id, status: 'failed', error: analysisError.message },
        { status: 422 }
      )
    }
  } catch (err: any) {
    console.error('[POST /api/audit]', err)
    return NextResponse.json({ error: err.message || 'Audit failed' }, { status: 500 })
  }
}

// GET /api/audit — list recent audits with optional search
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    let query = supabase
      .from('audits')
      .select('id, url, status, scores, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (search) {
      query = query.ilike('url', `%${search}%`)
    }

    const { data, error } = await query
    if (error) throw new Error(error.message)

    return NextResponse.json({ audits: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/audit — delete an audit by id
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase.from('audits').delete().eq('id', id)
    if (error) throw new Error(error.message)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
