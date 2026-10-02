import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { calculateTrialDates } from '@/lib/trial'
import { logEvent, ET } from '@/lib/events'

type RouteContext = { params: Promise<{ id: string }> }

/**
 * POST /api/trial-request/[id]/action
 *
 * Actions:
 *   approve — create client record, start trial, send welcome email, update status → 'approved'
 *   reject  — update status → 'rejected', optionally send rejection email
 *   review  — update status → 'under_review'
 *
 * Body: { action, rejection_reason?, admin_notes?, trial_duration_days? }
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id: requestId } = await params
    const { action, rejection_reason, admin_notes, trial_duration_days } = await req.json()

    if (!['approve', 'reject', 'review'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve, reject, or review' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Fetch the trial request
    const { data: request, error: fetchErr } = await supabase
      .from('trial_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchErr || !request) {
      return NextResponse.json({ error: 'Trial request not found' }, { status: 404 })
    }

    // ── APPROVE ──────────────────────────────────────────────
    if (action === 'approve') {
      const durationDays = trial_duration_days ?? request.trial_duration_days ?? 14
      const trialDates   = calculateTrialDates(durationDays)

      // Upsert client record
      const { data: client, error: clientErr } = await supabase
        .from('clients')
        .upsert(
          {
            name:                request.name,
            email:               request.email,
            phone:               request.phone ?? null,
            country:             request.country ?? null,
            city:                request.city ?? null,
            subscription_plan:   request.trial_plan,
            subscription_status: 'trial',
            source:              'trial_request',
            onboarding_complete: false,
            trial_duration_days: durationDays,
            trial_starts_at:     trialDates.trial_starts_at,
            trial_ends_at:       trialDates.trial_ends_at,
          },
          { onConflict: 'email', ignoreDuplicates: false }
        )
        .select('id')
        .single()

      if (clientErr) throw new Error(`Client creation failed: ${clientErr.message}`)

      // Update trial request
      await supabase
        .from('trial_requests')
        .update({
          status:       'approved',
          reviewed_by:  'admin',
          reviewed_at:  new Date().toISOString(),
          admin_notes:  admin_notes ?? null,
          client_id:    client.id,
        } as any)
        .eq('id', requestId)

      // Send welcome email to prospect
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kita-builder-systems.vercel.app'
        await resend.emails.send({
          from:    'KITA Systems <onboarding@resend.dev>',
          to:      request.email,
          subject: `✅ Trial Approved — Welcome to KITA Builder Systems!`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;">
              <h2 style="color:#1a1a2e;margin-bottom:4px;">✅ Your trial has been approved!</h2>
              <p style="color:#666;margin-top:0;">Hi ${request.name}, welcome to KITA Builder Systems.</p>
              <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;">
                <p style="margin:0 0 8px;font-size:14px;"><strong>Plan:</strong> ${request.trial_plan} (trial)</p>
                <p style="margin:0 0 8px;font-size:14px;"><strong>Trial duration:</strong> ${durationDays} days</p>
                <p style="margin:0 0 8px;font-size:14px;"><strong>Trial ends:</strong> ${new Date(trialDates.trial_ends_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="margin:0;font-size:14px;"><strong>Business:</strong> ${request.business_name}</p>
              </div>
              ${admin_notes ? `<div style="background:#f0f9ff;border-radius:8px;padding:16px;margin-bottom:16px;"><p style="margin:0;font-size:13px;color:#0369a1;">${admin_notes}</p></div>` : ''}
              <a href="${baseUrl}/onboard"
                 style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
                Get Started →
              </a>
              <p style="color:#999;font-size:12px;margin-top:24px;text-align:center;">Powered by KITA Builder Systems · From Struggle to Booked.</p>
            </div>
          `,
        }).catch(e => console.error('[trial-request/approve] Welcome email failed:', e.message))
      }

      // Log events
      logEvent({
        event_type:  ET.TRIAL_STARTED,
        category:    'subscription',
        severity:    'info',
        actor_type:  'admin',
        actor_id:    'admin',
        client_id:   client.id,
        entity_type: 'trial_request',
        entity_id:   requestId,
        summary:     `Trial approved — ${request.business_name} (${request.trial_plan}, ${durationDays} days) for ${request.email}`,
        metadata:    { trial_plan: request.trial_plan, trial_duration_days: durationDays, business_type: request.business_type },
      }).catch(() => {})

      return NextResponse.json({ success: true, action: 'approved', client_id: client.id })
    }

    // ── REJECT ────────────────────────────────────────────────
    if (action === 'reject') {
      await supabase
        .from('trial_requests')
        .update({
          status:           'rejected',
          reviewed_by:      'admin',
          reviewed_at:      new Date().toISOString(),
          rejection_reason: rejection_reason ?? null,
          admin_notes:      admin_notes ?? null,
        } as any)
        .eq('id', requestId)

      // Optional rejection email
      if (process.env.RESEND_API_KEY && rejection_reason) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from:    'KITA Systems <onboarding@resend.dev>',
          to:      request.email,
          subject: `Regarding your KITA trial request`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;">
              <h2 style="color:#1a1a2e;">Regarding your trial request</h2>
              <p style="color:#666;">Hi ${request.name}, thank you for your interest in KITA Builder Systems.</p>
              <p style="color:#666;">After reviewing your request, we are unable to proceed at this time. ${rejection_reason}</p>
              <p style="color:#666;">If you have any questions, feel free to reply to this email.</p>
              <p style="color:#999;font-size:12px;margin-top:24px;">Powered by KITA Builder Systems</p>
            </div>
          `,
        }).catch(() => {})
      }

      logEvent({
        event_type:  'trial.request_rejected',
        category:    'client',
        severity:    'info',
        actor_type:  'admin',
        actor_id:    'admin',
        entity_type: 'trial_request',
        entity_id:   requestId,
        summary:     `Trial request rejected — ${request.business_name} (${request.email})`,
        metadata:    { rejection_reason },
      }).catch(() => {})

      return NextResponse.json({ success: true, action: 'rejected' })
    }

    // ── REVIEW ────────────────────────────────────────────────
    await supabase
      .from('trial_requests')
      .update({ status: 'under_review', admin_notes: admin_notes ?? null } as any)
      .eq('id', requestId)

    return NextResponse.json({ success: true, action: 'under_review' })
  } catch (err: any) {
    console.error('[/api/trial-request/[id]/action]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
