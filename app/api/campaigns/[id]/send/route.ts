import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase'
import { logEvent, ET } from '@/lib/events'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/campaigns/[id]/send
 * Sends a campaign to all opted-in, non-suppressed leads matching
 * the campaign's audience filters. Creates a campaign_send record.
 *
 * Body: { preview? } — if true, returns audience count without sending.
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id: campaignId } = await params
    const { preview = false } = await req.json().catch(() => ({}))

    const supabase = createServerClient()

    // Fetch campaign
    const { data: campaign, error: campErr } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campErr || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Build audience query
    let leadsQuery = supabase
      .from('leads')
      .select('id, name, email')
      .eq('opt_in', true)
      .neq('status', 'closed')
      .not('email', 'is', null)

    if (campaign.filter_city)          leadsQuery = leadsQuery.ilike('city', `%${campaign.filter_city}%`)
    if (campaign.filter_business_type) leadsQuery = leadsQuery.eq('business_type', campaign.filter_business_type)
    if (campaign.filter_country)       leadsQuery = leadsQuery.eq('country', campaign.filter_country)

    const { data: leads } = await leadsQuery

    // Deduplicate by email
    const uniqueLeads = Array.from(
      new Map((leads || []).map(l => [l.email, l])).values()
    )

    // Remove suppressed emails
    const emails = uniqueLeads.map(l => l.email)
    const { data: suppressed } = emails.length
      ? await supabase.from('suppression_list').select('email').in('email', emails)
      : { data: [] }

    const suppressedSet  = new Set((suppressed || []).map((s: any) => s.email))
    const filteredLeads  = uniqueLeads.filter(l => !suppressedSet.has(l.email))
    const suppressedCount = suppressedSet.size

    if (preview) {
      return NextResponse.json({
        preview: true,
        recipients_count: filteredLeads.length,
        suppressed_count: suppressedCount,
        sample: filteredLeads.slice(0, 5),
      })
    }

    if (filteredLeads.length === 0) {
      return NextResponse.json(
        { error: 'No eligible leads match this campaign\'s filters.' },
        { status: 400 }
      )
    }

    // Create send record
    const { data: send, error: sendErr } = await supabase
      .from('campaign_sends')
      .insert({
        campaign_id:      campaignId,
        recipients_count: filteredLeads.length,
        suppressed_count: suppressedCount,
        status:           'sending',
        sent_by:          'admin',
      } as any)
      .select()
      .single()

    if (sendErr) throw new Error(sendErr.message)

    // Send emails
    const baseUrl    = process.env.NEXT_PUBLIC_APP_URL || 'https://kita-builder-systems.vercel.app'
    const expiryLine = campaign.expires_at
      ? `<p style="color:#666;font-size:13px;margin:8px 0 0;">⏰ Offer expires: ${new Date(campaign.expires_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>`
      : ''

    let sentCount = 0, failedCount = 0

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const BATCH  = 10

      for (let i = 0; i < filteredLeads.length; i += BATCH) {
        const batch = filteredLeads.slice(i, i + BATCH)
        await Promise.all(batch.map(async lead => {
          try {
            await resend.emails.send({
              from:    'KITA Network <onboarding@resend.dev>',
              to:      lead.email,
              subject: campaign.subject,
              html: `
                <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;">
                  <h2 style="color:#1a1a2e;margin-bottom:8px;">${campaign.subject}</h2>
                  <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;">
                    <p style="color:#333;font-size:15px;line-height:1.6;margin:0 0 16px;">${campaign.body_text}</p>
                    ${expiryLine}
                  </div>
                  <a href="${campaign.cta_url}" style="display:inline-block;background:#2563eb;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
                    ${campaign.cta_label} →
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
      failedCount = filteredLeads.length
    }

    // Update send record
    const finalStatus = sentCount > 0 ? 'sent' : 'failed'
    await supabase.from('campaign_sends').update({
      status:       finalStatus,
      sent_count:   sentCount,
      failed_count: failedCount,
      completed_at: new Date().toISOString(),
      error_message: sentCount === 0 ? 'No emails sent — check RESEND_API_KEY' : null,
    } as any).eq('id', send.id)

    // Update campaign aggregate stats
    await supabase.from('campaigns').update({
      total_sends:  campaign.total_sends + 1,
      total_sent:   campaign.total_sent  + sentCount,
      total_failed: campaign.total_failed + failedCount,
      status:       'active',
      updated_at:   new Date().toISOString(),
    } as any).eq('id', campaignId)

    // Log event
    logEvent({
      event_type:  'lead.converted',
      category:    'client',
      severity:    'info',
      actor_type:  'admin',
      actor_id:    'admin',
      entity_type: 'campaign_send',
      entity_id:   send.id,
      summary:     `Campaign "${campaign.name}" sent — ${sentCount} delivered, ${failedCount} failed, ${suppressedCount} suppressed`,
      metadata:    { campaign_id: campaignId, sent: sentCount, failed: failedCount, suppressed: suppressedCount },
    }).catch(() => {})

    return NextResponse.json({
      success:          true,
      send_id:          send.id,
      sent_count:       sentCount,
      failed_count:     failedCount,
      suppressed_count: suppressedCount,
      recipients:       filteredLeads.length,
    })
  } catch (err: any) {
    console.error('[/api/campaigns/[id]/send]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
