import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET — read current config
export async function GET() {
  try {
    const supabase = createServerClient() // uses service role key — bypasses RLS
    const { data, error } = await supabase
      .from('admin_config')
      .select('stripe_mode')
      .eq('id', 'singleton')
      .single()

    if (error) throw error
    return NextResponse.json({ stripe_mode: data?.stripe_mode ?? 'test' })
  } catch (err: any) {
    return NextResponse.json({ stripe_mode: 'test', error: err.message }, { status: 200 })
  }
}

// POST — update config
export async function POST(req: NextRequest) {
  try {
    const { stripe_mode } = await req.json()

    if (!['test', 'live'].includes(stripe_mode)) {
      return NextResponse.json({ error: 'Invalid stripe_mode. Must be "test" or "live".' }, { status: 400 })
    }

    const supabase = createServerClient() // service role — can write past RLS
    const { error } = await supabase
      .from('admin_config')
      .upsert({ id: 'singleton', stripe_mode, updated_at: new Date().toISOString() })

    if (error) throw error
    return NextResponse.json({ success: true, stripe_mode })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save config' }, { status: 500 })
  }
}
