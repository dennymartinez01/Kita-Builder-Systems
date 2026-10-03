import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/unsubscribe?email=
 * Check whether an email is already suppressed.
 * Used by the /unsubscribe page to show correct state.
 */
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim()
    if (!email) return NextResponse.json({ suppressed: false })

    const supabase = createServerClient()
    const { data } = await supabase
      .from('suppression_list')
      .select('id, added_at')
      .eq('email', email)
      .single()

    return NextResponse.json({ suppressed: !!data, added_at: data?.added_at ?? null })
  } catch {
    return NextResponse.json({ suppressed: false })
  }
}

/**
 * POST /api/unsubscribe
 * Body: { email, source? }
 * Adds the email to the global suppression list.
 * Also updates the matching lead record status to 'closed'.
 * Idempotent — safe to call multiple times.
 */
export async function POST(req: NextRequest) {
  try {
    const body  = await req.json()
    const email = (body.email || '').toLowerCase().trim()
    const source = body.source || 'email_link'

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Add to suppression list (ignore if already exists)
    const { error } = await supabase
      .from('suppression_list')
      .upsert(
        { email, reason: 'unsubscribe', source },
        { onConflict: 'email', ignoreDuplicates: true }
      )

    if (error) throw new Error(error.message)

    // Mark any matching leads as closed (non-blocking)
    await supabase
      .from('leads')
      .update({ status: 'closed' } as any)
      .eq('email', email)
      .neq('status', 'closed')

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
