import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/campaigns?status=&limit=&offset=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') || ''
    const limit  = Number(searchParams.get('limit')  || 50)
    const offset = Number(searchParams.get('offset') || 0)

    const supabase = createServerClient()
    let query = supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ campaigns: data ?? [], total: count ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ campaigns: [], total: 0, error: err.message }, { status: 500 })
  }
}

// POST /api/campaigns — create a new campaign
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, description, subject, body_text, cta_url, cta_label = 'Learn More',
      expires_at, filter_city, filter_business_type, filter_country,
    } = body

    if (!name || !subject || !body_text || !cta_url) {
      return NextResponse.json(
        { error: 'name, subject, body_text, and cta_url are required.' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name,
        description:          description || null,
        subject,
        body_text,
        cta_url,
        cta_label,
        expires_at:           expires_at || null,
        filter_city:          filter_city || null,
        filter_business_type: filter_business_type || null,
        filter_country:       filter_country || null,
        status:               'draft',
      } as any)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ campaign: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// PATCH /api/campaigns?id= — update campaign status or content
export async function PATCH(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const body = await req.json()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('campaigns')
      .update({ ...body, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ campaign: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/campaigns?id=
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase.from('campaigns').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
