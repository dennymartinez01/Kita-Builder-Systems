import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { site_id, path = '/' } = await req.json()

    if (!site_id) {
      return NextResponse.json({ error: 'site_id required' }, { status: 400 })
    }

    const supabase = createServerClient()

    await supabase.from('page_views').insert({ site_id, path })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    // Silently fail — analytics should never break the site
    console.error('[/api/track]', err.message)
    return NextResponse.json({ ok: false })
  }
}
