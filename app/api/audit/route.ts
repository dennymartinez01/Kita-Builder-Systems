import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { runAudit, normalizeUrl } from '@/lib/audit'

export const maxDuration = 60

// POST /api/audit — create new audit and run analysis
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

    const normalizedUrl = normalizeUrl(url)
    const supabase = createServerClient()

    // Create audit record with queued status
    const { data: audit, error: insertError } = await supabase
      .from('audits')
      .insert({ url: normalizedUrl, status: 'queued' })
      .select()
      .single()

    if (insertError) throw new Error(`Failed to create audit: ${insertError.message}`)

    // Mark as running
    await supabase.from('audits').update({ status: 'running' }).eq('id', audit.id)

    // Run all analyzers (within maxDuration=60)
    try {
      const { scores, raw_data, issues } = await runAudit(normalizedUrl)

      await supabase.from('audits').update({
        status: 'completed',
        scores,
        raw_data,
        issues,
      }).eq('id', audit.id)

      return NextResponse.json({ id: audit.id, status: 'completed', scores })
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

// GET /api/audit — list recent audits
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const { data, error } = await supabase
      .from('audits')
      .select('id, url, status, scores, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return NextResponse.json({ audits: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
