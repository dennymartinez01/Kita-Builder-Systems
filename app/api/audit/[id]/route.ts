import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { runAudit } from '@/lib/audit'

export const maxDuration = 60

type Params = { params: Promise<{ id: string }> }

// GET /api/audit/[id] — fetch full audit record
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    return NextResponse.json({ audit: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/audit/[id]/re-run — re-run an existing audit
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { data: existing } = await supabase
      .from('audits')
      .select('url')
      .eq('id', id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Audit not found' }, { status: 404 })

    await supabase.from('audits').update({ status: 'running' }).eq('id', id)

    try {
      const { scores, raw_data, issues } = await runAudit(existing.url)
      await supabase.from('audits').update({ status: 'completed', scores, raw_data, issues }).eq('id', id)
      return NextResponse.json({ id, status: 'completed', scores })
    } catch (err: any) {
      await supabase.from('audits').update({ status: 'failed', raw_data: { error: err.message } }).eq('id', id)
      return NextResponse.json({ id, status: 'failed', error: err.message }, { status: 422 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
