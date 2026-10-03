import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase'
import { logEvent, ET } from '@/lib/events'

/**
 * GET /api/leads/promote?city=&business_type=&country=
 * Preview audience — returns count + sample leads for the given filters.
 * Does NOT send any emails.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const city          = searchParams.get('city')          || ''
    const business_type = searchParams.get('business_type') || ''
    const country       = searchParams.get('country')       || ''

    const supabase = createServerClient()
    let query = supabase
      .from('leads')
      .select('id, name, email, city, business_type, country, source', { count: 'exact' })
      .eq('opt_in', true)
      .neq('status', 'closed')

    if (city)          query = query.ilike('city', `%${city}%`)
    if (business_type) query = query.eq('business_type', business_type)
    if (country)       query = query.eq('country', country)

    const { data, count, error } = await query.limit(5) // sample only
    if (error) throw error

    return NextResponse.json({ count: count ?? 0, sample: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ count: 0, sample: [], error: err.message }, { status: 500 })
  }
}

/**
 * POST /api/leads/promote
 * Sends a promotion blast to all opted-in leads matching the filters.
 *
 * Body: {
 *   headline, offer_text, cta_url, cta_label?,
 *   expires_at?,
 *   filter_city?, filter_business_type?, filter_country?,
 *   preview? (boolean — dry run, no emails sent)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      headline, offer_text, cta_url,
      cta_label      = 'Claim Offer',
      expires_at     = null,
      filter_city    = '',
      filter_business_type = '',
      filter_country = '',
      preview        = false,
    } = body

    if (!headline || !offer_text || !cta_url) {
      return NextResponse.json(
        { error: 'headline, offer_text, and cta_url are required.' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // ── Fetch opted-in leads matching filters ────────────────
    let query = supabase
      .from('leads')
      .select('id, name, email, city, business_type')
      .eq('opt_in', true)
      .neq('status', 'closed')
      .not('email', 'is', null)

    if (filter_city)          query = query.ilike('city', `%${filter_city}%`)
    if (filter_business_type) query = query.eq('business_type', filter_business_type)
    if (filter_country)       query = query.eq('country', filter_country)

    const { data: leads, error: leadsErr } = await query
    if (leadsErr) throw new Error(leadsErr.message)

    // Deduplicate by email
    const uniqueLeads = Array.from(
      new Map((leads || []).map(l => [l.email, l])).values()
    )

    // ── Remove suppressed emails ──────────────────────────────
    // Check suppression list in one query
    const emails = uniqueLeads.map(l => l.email)
    const { data: suppressed } = await supabase
      .from('suppression_list')
      .select('email')
      .in('email', emails)

    const suppressedSet = new Set((suppressed || []).map((s: any) => s.email))
    const filteredLeads = uniqueLeads.filter(l => !suppressedSet.has(l.email))

    if (preview) {
      return NextResponse.json({
        preview: true,
        recipients_count: filteredLeads.length,
        suppressed_count: suppressedSet.size,
        sample: filteredLeads.slice(0, 5),
      })
    }

    if (filteredLeads.length === 0) {
      return NextResponse.json(
        { error: 'No opted-in leads match the selected filters (all may be suppressed or unsubscribed).' },
        { status: 400 }
      )
    }

    // ── Create blast record ───────────────────────────────────
    const { data: blast, error: blastErr } = await supabase
      .from('promotion_blasts')
      .insert({
        headline,
        offer_text,
        cta_url,
        cta_label,
        expires_at:          expires_at || null,
        filter_city:         filter_city || null,
        filter_business_type: filter_business_type || null,
        filter_country:      filter_country || null,
        recipients_count:    filteredLeads.length,
        status:              'sending',
      } as any)
      .select()
      .single()

    if (blastErr) throw new Error(blastErr.message)

    // ── Send emails ───────────────────────────────────────────
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kita-builder-systems.vercel.app'
    const expiryLine = expires_at
      ? `<p style="color:#666;font-size:13px;margin:0;">⏰ Offer expires: ${new Date(expires_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>`
      : ''

    let sentCount   = 0
    let failedCount = 0

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)

      // Send in batches of 10 to avoid rate limits
      const BATCH = 10
      for (let i = 0; i < filteredLeads.length; i += BATCH) {
        const batch = filteredLeads.slice(i, i + BATCH)
        await Promise.all(batch.map(async lead => {
          try {
            await resend.emails.send({
              from:    'KITA Network <onboarding@resend.dev>',
              to:      lead.email,
              subject: headline,
              html: `
                <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;">
                  <h2 style="color:#1a1a2e;margin-bottom:8px;">${headline}</h2>
                  <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;">
                    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">${offer_text}</p>
                    ${expiryLine}
                  </div>
                  <a href="${cta_url}"
                     style="display:inline-block;background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
                    ${cta_label} →
                  </a>
                  <p style="color:#999;font-size:11px;margin-top:24px;text-align:center;">
                    You received this because you opted in to receive local offers.<br/>
                    <a href="${baseUrl}/unsubscribe?email=${encodeURIComponent(lead.email)}" style="color:#999;">Unsubscribe</a>
                  </p>
                </div>
              `,
            })
            sentCount++
          } catch {
            failedCount++
          }
        }))
      }
    } else {
      // No Resend key — record as failed
      failedCount = uniqueLeads.length
    }

    // ── Update blast record with results ──────────────────────
    await supabase
      .from('promotion_blasts')
      .update({
        status:       sentCount > 0 ? 'sent' : 'failed',
        sent_count:   sentCount,
        failed_count: failedCount,
        sent_at:      new Date().toISOString(),
        error_message: sentCount === 0 ? 'No emails sent — check RESEND_API_KEY' : null,
      } as any)
      .eq('id', blast.id)

    // Log event
    logEvent({
      event_type: 'lead.converted',  // closest type — promotion sent
      category:   'client',
      severity:   'info',
      actor_type: 'admin',
      actor_id:   'admin',
      entity_type: 'promotion_blast',
      entity_id:   blast.id,
      summary:    `Promotion blast sent — "${headline}" to ${sentCount} leads (${failedCount} failed, ${suppressedSet.size} suppressed)`,
      metadata:   { headline, recipients: filteredLeads.length, sent: sentCount, failed: failedCount, suppressed: suppressedSet.size },
    }).catch(() => {})

    return NextResponse.json({
      success:          true,
      blast_id:         blast.id,
      sent_count:       sentCount,
      failed_count:     failedCount,
      suppressed_count: suppressedSet.size,
      recipients:       filteredLeads.length,
    })
  } catch (err: any) {
    console.error('[/api/leads/promote]', err)
    return NextResponse.json({ error: err.message || 'Promotion failed' }, { status: 500 })
  }
}
