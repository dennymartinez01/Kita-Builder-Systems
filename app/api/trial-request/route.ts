import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { logEvent, ET } from '@/lib/events'

// POST /api/trial-request — public, saves request + notifies admin
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name, email, phone, country, city,
      business_name, business_type, website, intended_use,
      trial_plan, trial_duration_days, privacy_accepted,
    } = body

    // Validate required fields
    if (!name || !email || !business_name || !business_type || !intended_use) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }
    if (!privacy_accepted) {
      return NextResponse.json({ error: 'Privacy notice must be accepted.' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Save trial request — use anon client so public RLS insert policy applies
    // But we use service client here since we need it for admin notifications
    const { data: request, error: insertErr } = await supabase
      .from('trial_requests')
      .insert({
        name,
        email,
        phone:               phone || null,
        country:             country || null,
        city:                city || null,
        business_name,
        business_type,
        website:             website || null,
        intended_use,
        trial_plan:          trial_plan || 'starter',
        trial_duration_days: trial_duration_days || 14,
        privacy_accepted:    true,
        status:              'pending',
      } as any)
      .select()
      .single()

    if (insertErr) throw new Error(insertErr.message)

    // Log event
    await logEvent({
      event_type:  'trial.request_submitted',
      category:    'client',
      severity:    'info',
      actor_type:  'customer',
      actor_id:    email,
      entity_type: 'trial_request',
      entity_id:   request.id,
      summary:     `Trial request submitted — ${business_name} (${business_type}) by ${name}`,
      metadata:    { email, business_name, business_type, trial_plan, trial_duration_days, country },
    }).catch(() => {})

    // Notify admin via email
    if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from:    'KITA Systems <onboarding@resend.dev>',
        to:      process.env.NOTIFICATION_EMAIL,
        subject: `🎯 New Trial Request — ${business_name} (${business_type})`,
        html: `
          <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;">
            <h2 style="color:#1a1a2e;margin-bottom:4px;">🎯 New Trial Request</h2>
            <p style="color:#666;margin-top:0;">Review and approve in your admin panel.</p>
            <div style="background:white;border-radius:8px;padding:20px;margin-top:16px;">
              <p style="margin:0 0 8px;font-size:14px;"><strong>Name:</strong> ${name}</p>
              <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> ${email}</p>
              ${phone ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Phone:</strong> ${phone}</p>` : ''}
              <p style="margin:0 0 8px;font-size:14px;"><strong>Business:</strong> ${business_name}</p>
              <p style="margin:0 0 8px;font-size:14px;"><strong>Type:</strong> ${business_type}</p>
              ${country ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Country:</strong> ${country}</p>` : ''}
              <p style="margin:0 0 8px;font-size:14px;"><strong>Plan:</strong> ${trial_plan} · ${trial_duration_days} days</p>
              ${website ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Website:</strong> ${website}</p>` : ''}
              <p style="margin:8px 0 0;font-size:14px;"><strong>Intended Use:</strong> ${intended_use}</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://kita-builder-systems.vercel.app'}/admin/trial-requests"
               style="display:inline-block;margin-top:16px;background:#1a1a2e;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:bold;">
              Review in Admin →
            </a>
            <p style="color:#999;font-size:12px;margin-top:20px;text-align:center;">Powered by KITA Builder Systems</p>
          </div>
        `,
      }).catch(e => console.error('[trial-request] Admin email failed:', e.message))
    }

    return NextResponse.json({ success: true, id: request.id })
  } catch (err: any) {
    console.error('[/api/trial-request POST]', err)
    return NextResponse.json({ error: err.message || 'Submission failed' }, { status: 500 })
  }
}

// GET /api/trial-request — admin list with optional status filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const status = searchParams.get('status') || ''
    const limit  = Number(searchParams.get('limit') || 50)
    const offset = Number(searchParams.get('offset') || 0)

    const supabase = createServerClient()
    let query = supabase
      .from('trial_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) query = query.eq('status', status)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ requests: data ?? [], total: count ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ requests: [], total: 0, error: err.message }, { status: 500 })
  }
}
