import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase'
import { logEvent } from '@/lib/events'

/**
 * POST /api/inquire
 * Saves a contact form inquiry to the leads table and notifies the site owner.
 *
 * Body: { site_id, name, email, phone?, message, service_interest?, opt_in? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      site_id,
      name,
      email,
      phone,
      message,
      service_interest,
      opt_in = false,
      // Attribution (optional — sent by ContactForm via getStoredAttribution)
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      landing_page,
    } = body

    if (!site_id || !name || !email || !message) {
      return NextResponse.json({ error: 'site_id, name, email, and message are required.' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Fetch site info for context
    const { data: site } = await supabase
      .from('sites')
      .select('business_name, owner_email, business_type, theme_json')
      .eq('id', site_id)
      .single()

    const city    = (site as any)?.theme_json?.city    ?? null
    const country = (site as any)?.theme_json?.country ?? null

    // Save lead
    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .insert({
        site_id,
        name,
        email:            email.toLowerCase().trim(),
        phone:            phone || null,
        message,
        service_interest: service_interest || null,
        source:           'contact_form',
        city,
        country,
        business_type:    (site as any)?.business_type ?? null,
        opt_in:           !!opt_in,
        status:           'new',
        // Attribution — first-touch UTM from ContactForm
        utm_source:   utm_source   || null,
        utm_medium:   utm_medium   || null,
        utm_campaign: utm_campaign || null,
        utm_content:  utm_content  || null,
        utm_term:     utm_term     || null,
        referrer:     referrer     || null,
        landing_page: landing_page || null,
      } as any)
      .select()
      .single()

    if (leadErr) throw new Error(leadErr.message)

    // Log event (non-blocking)
    logEvent({
      event_type:  'lead.created',
      category:    'client',
      severity:    'info',
      actor_type:  'customer',
      actor_id:    email,
      site_id,
      entity_type: 'lead',
      entity_id:   lead.id,
      summary:     `New inquiry from ${name} — ${(site as any)?.business_name}`,
      metadata:    { email, service_interest: service_interest || null, opt_in },
    }).catch(() => {})

    // Notify owner via email
    if (process.env.RESEND_API_KEY) {
      const resend   = new Resend(process.env.RESEND_API_KEY)
      const ownerEmail = process.env.NOTIFICATION_EMAIL || (site as any)?.owner_email

      if (ownerEmail) {
        await resend.emails.send({
          from:    'KITA Bookings <onboarding@resend.dev>',
          to:      ownerEmail,
          subject: `📬 New Inquiry — ${name} | ${(site as any)?.business_name}`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;">
              <h2 style="color:#1a1a2e;margin-bottom:4px;">📬 New Inquiry</h2>
              <p style="color:#666;margin-top:0;">${(site as any)?.business_name}</p>
              <div style="background:white;border-radius:8px;padding:20px;margin-top:16px;">
                <p style="margin:0 0 8px;font-size:14px;"><strong>Name:</strong> ${name}</p>
                <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> ${email}</p>
                ${phone ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Phone:</strong> ${phone}</p>` : ''}
                ${service_interest ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Interested in:</strong> ${service_interest}</p>` : ''}
                <p style="margin:8px 0 0;font-size:14px;"><strong>Message:</strong><br/>${message}</p>
              </div>
              ${opt_in ? '<p style="font-size:12px;color:#666;margin-top:12px;">✓ Customer opted in to receive promotional offers.</p>' : ''}
              <p style="color:#999;font-size:12px;margin-top:20px;text-align:center;">Powered by KITA Builder Systems · From Struggle to Booked.</p>
            </div>
          `,
        }).catch(e => console.error('[inquire] Owner email failed:', e.message))
      }
    }

    return NextResponse.json({ success: true, id: lead.id })
  } catch (err: any) {
    console.error('[/api/inquire]', err)
    return NextResponse.json({ error: err.message || 'Inquiry failed' }, { status: 500 })
  }
}

/**
 * GET /api/inquire?site_id= — owner: list leads for a site
 * GET /api/inquire?admin=1  — admin: list all leads across all sites
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const site_id  = searchParams.get('site_id')
    const isAdmin  = searchParams.get('admin') === '1'
    const status   = searchParams.get('status') || ''
    const limit    = Number(searchParams.get('limit')  || 50)
    const offset   = Number(searchParams.get('offset') || 0)

    const supabase = createServerClient()

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (!isAdmin && site_id) query = query.eq('site_id', site_id)
    if (status) query = query.eq('status', status)

    const { data, count, error } = await query
    if (error) throw error

    return NextResponse.json({ leads: data ?? [], total: count ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ leads: [], total: 0, error: err.message }, { status: 500 })
  }
}

/**
 * PATCH /api/inquire?id= — update lead status or notes
 */
export async function PATCH(req: NextRequest) {
  try {
    const id   = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const body     = await req.json()
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('leads')
      .update({ ...body, updated_at: new Date().toISOString() } as any)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ lead: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
