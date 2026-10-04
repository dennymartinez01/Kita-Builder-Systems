/**
 * KITA Builder Systems — Client Onboarding (Phase 17)
 *
 * What:  Defines the 6-step onboarding checklist for new clients.
 *        Provides seedOnboardingSteps() to create step rows,
 *        and sendWelcomeEmail() to fire the welcome email via Resend.
 * Why:   Guides new clients through their first setup actions,
 *        reducing churn and support load.
 * Who:   Called when a new client is created (booking auto-upsert
 *        or the 9-step admin wizard).
 */

import { createServerClient } from '@/lib/supabase'

// ── Step definitions ──────────────────────────────────────────

export interface OnboardingStep {
  key:         string
  label:       string
  description: string
  icon:        string
  /** Link to where the client completes this step (owner dashboard) */
  path:        string
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    key:         'add_logo',
    label:       'Upload your logo',
    description: 'Add your business logo so your site looks professional.',
    icon:        '🖼️',
    path:        '/dashboard?tab=settings',
  },
  {
    key:         'publish_site',
    label:       'Publish your site',
    description: 'Make your site live so customers can find and book you.',
    icon:        '🌐',
    path:        '/dashboard?tab=settings',
  },
  {
    key:         'set_hours',
    label:       'Set your business hours',
    description: "Tell customers when you're open so they book the right times.",
    icon:        '🕐',
    path:        '/dashboard?tab=hours',
  },
  {
    key:         'add_service',
    label:       'Add at least one service',
    description: 'Add your services with prices so customers know what you offer.',
    icon:        '✂️',
    path:        '/dashboard?tab=services',
  },
  {
    key:         'receive_booking',
    label:       'Receive your first booking',
    description: 'Your first real customer booking — the most important milestone!',
    icon:        '📅',
    path:        '/dashboard?tab=bookings',
  },
  {
    key:         'set_notification_email',
    label:       'Set your notification email',
    description: 'Make sure booking alerts go to the right inbox.',
    icon:        '📧',
    path:        '/dashboard?tab=settings',
  },
]

export const STEP_KEYS = ONBOARDING_STEPS.map(s => s.key)

// ── Seed onboarding rows for a new client ─────────────────────
/**
 * Creates one row per step for the given client_id.
 * Safe to call multiple times — uses INSERT ... ON CONFLICT DO NOTHING.
 * Non-blocking: errors are swallowed so they never fail the parent flow.
 */
export async function seedOnboardingSteps(clientId: string): Promise<void> {
  try {
    const supabase = createServerClient()
    const rows = ONBOARDING_STEPS.map(step => ({
      client_id: clientId,
      step_key:  step.key,
      completed: false,
    }))
    await supabase
      .from('client_onboarding_steps')
      .upsert(rows, { onConflict: 'client_id,step_key', ignoreDuplicates: true })
  } catch (err: any) {
    console.warn('[onboarding] seedOnboardingSteps failed:', err?.message)
  }
}

// ── Welcome email ─────────────────────────────────────────────
/**
 * Sends the onboarding welcome email to the new client.
 * Requires RESEND_API_KEY in env. Non-blocking — errors logged only.
 */
export async function sendWelcomeEmail(params: {
  clientName:  string
  clientEmail: string
  siteSlug?:   string  // if their site is already known, link directly
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[onboarding] RESEND_API_KEY not set — welcome email skipped')
    return
  }

  try {
    const { Resend } = await import('resend')
    const resend     = new Resend(process.env.RESEND_API_KEY)

    const dashboardUrl = params.siteSlug
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://kita-builder-systems.vercel.app'}/${params.siteSlug}/dashboard`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'https://kita-builder-systems.vercel.app'}`

    const stepsHtml = ONBOARDING_STEPS.map((step, i) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f1f5f9;">
          <span style="font-size:18px;margin-right:10px;">${step.icon}</span>
          <strong style="color:#1a1a2e;font-size:14px;">${i + 1}. ${step.label}</strong>
          <p style="margin:2px 0 0 28px;font-size:13px;color:#64748b;">${step.description}</p>
        </td>
      </tr>
    `).join('')

    await resend.emails.send({
      from:    'KITA Systems <onboarding@resend.dev>',
      to:      params.clientEmail,
      subject: `🎉 Welcome to KITA Builder Systems, ${params.clientName}!`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;">
          <!-- Header -->
          <div style="background:#1a1a2e;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;">
              Welcome to KITA 🚀
            </h1>
            <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;">
              Your AI-powered booking website is ready.
            </p>
          </div>

          <!-- Body -->
          <div style="padding:28px 24px;">
            <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 20px;">
              Hi <strong>${params.clientName}</strong>, welcome aboard! Your site is set up — now let's get it
              fully configured so customers can start booking you.
            </p>

            <p style="color:#374151;font-size:14px;font-weight:600;margin:0 0 12px;">
              ✅ Your 6-step setup checklist:
            </p>

            <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;border:1px solid #e2e8f0;">
              ${stepsHtml}
            </table>

            <div style="margin:28px 0;text-align:center;">
              <a
                href="${dashboardUrl}"
                style="background:#1a1a2e;color:#ffffff;padding:14px 32px;border-radius:8px;
                       text-decoration:none;font-size:14px;font-weight:700;display:inline-block;"
              >
                Go to My Dashboard →
              </a>
            </div>

            <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">
              Need help? Just reply to this email and we'll get back to you.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#f8fafc;padding:16px 24px;border-radius:0 0 12px 12px;text-align:center;border-top:1px solid #e2e8f0;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">
              Powered by <strong>KITA Builder Systems</strong> · From Struggle to Booked.
            </p>
          </div>
        </div>
      `,
    })
  } catch (err: any) {
    console.warn('[onboarding] sendWelcomeEmail failed:', err?.message)
  }
}
