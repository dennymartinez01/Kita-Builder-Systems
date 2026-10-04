import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase'
import { generateCancelToken } from '@/lib/booking-utils'
import { logEvent, ET } from '@/lib/events'
import { seedOnboardingSteps, sendWelcomeEmail } from '@/lib/onboarding'

// Helper — add/subtract minutes from HH:MM string
function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total = Math.max(0, Math.min(1439, h * 60 + m + minutes))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      site_id,
      service_id,
      customer_name,
      customer_phone,
      customer_email,
      service_name,
      booking_date,
      booking_time,
      car_model,
      pet_name,
      notes,
      staff_id,
      staff_name,
      service_duration_minutes,
      // Attribution fields (optional — set by AttributionTracker on client)
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      landing_page,
    } = body

    if (!site_id || !customer_name || !customer_phone || !service_name || !booking_date || !booking_time) {
      return NextResponse.json({ error: 'Missing required booking fields.' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get site info (auto_confirm + owner email + timezone)
    const { data: site } = await supabase
      .from('sites')
      .select('business_name, owner_email, auto_confirm, currency, timezone')
      .eq('id', site_id)
      .single()

    const autoConfirm = (site as any)?.auto_confirm !== false
    const siteTimezone = (site as any)?.timezone || 'UTC'
    const status = autoConfirm ? 'confirmed' : 'pending'
    const cancelToken = generateCancelToken()

    // ── SERVER-SIDE RACE CONDITION CHECK ─────────────────────────
    // Prevents double-bookings even if two customers submit at the same second.
    // Client-side check in BookingForm is a UX helper only — this is the real guard.
    if (booking_date && booking_time) {
      const selectedService = await supabase
        .from('services')
        .select('duration_minutes')
        .eq('id', service_id || '')
        .single()
      const durationMins = selectedService.data?.duration_minutes || service_duration_minutes || 60

      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', site_id)
        .eq('booking_date', booking_date)
        .in('status', ['pending', 'confirmed'])
        .gte('booking_time', addMinutesToTime(booking_time, -durationMins + 1))
        .lte('booking_time', addMinutesToTime(booking_time, durationMins - 1))

      if (count && count > 0) {
        return NextResponse.json(
          { error: 'This time slot has just been booked by someone else. Please choose a different time.' },
          { status: 409 }
        )
      }
    }

    // ── AUTO-UPSERT CLIENT RECORD ─────────────────────────────────
    // When a customer provides their email at booking, we upsert a client record.
    // Uses email as the unique key — creates on first booking, ignores duplicates.
    // Non-blocking: never fails the booking if this errors.
    if (customer_email) {
      try {
        const { data: upsertedClients } = await supabase
          .from('clients')
          .upsert(
            {
              email: customer_email,
              name: customer_name,
              phone: customer_phone || null,
              subscription_plan: 'starter',
              subscription_status: 'trial',
              source: 'booking',
              onboarding_complete: false,
              trial_duration_days: 14,
              trial_starts_at: new Date().toISOString(),
              trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              onConflict: 'email',
              ignoreDuplicates: false, // need the returned row to check if newly created
            }
          )
          .select('id, email, name, created_at')

        // If this is a brand-new client (created in last 5s), seed onboarding + send welcome email
        const newClient = Array.isArray(upsertedClients) ? upsertedClients[0] : null
        if (newClient) {
          const isNew = Date.now() - new Date(newClient.created_at).getTime() < 5000
          if (isNew) {
            // Non-blocking — never fails the booking
            seedOnboardingSteps(newClient.id).catch(() => {})
            sendWelcomeEmail({
              clientName:  newClient.name,
              clientEmail: newClient.email,
            }).catch(() => {})
          }
        }
      } catch (clientErr: any) {
        console.warn('[notify] client upsert skipped:', clientErr?.message)
      }
    }

    // ── UPSERT SITE CUSTOMER WITH ATTRIBUTION ─────────────────────
    // Writes the visitor's UTM attribution onto their site_customer record
    // so CRM Intelligence can match leads → bookers by source.
    // Only writes attribution once (first-touch) — does not overwrite existing values.
    // Non-blocking: never fails the booking if this errors.
    if (customer_email && site_id) {
      try {
        // Check if record already has attribution to respect first-touch model
        const { data: existing } = await supabase
          .from('site_customers')
          .select('id, utm_source')
          .eq('site_id', site_id)
          .eq('email', customer_email)
          .single()

        if (existing && !existing.utm_source && utm_source) {
          // Record exists but has no attribution yet — patch it
          await supabase
            .from('site_customers')
            .update({
              utm_source:   utm_source   || null,
              utm_medium:   utm_medium   || null,
              utm_campaign: utm_campaign || null,
              utm_content:  utm_content  || null,
              utm_term:     utm_term     || null,
              referrer:     referrer     || null,
              landing_page: landing_page || null,
            })
            .eq('id', existing.id)
        } else if (!existing && utm_source) {
          // No record yet — insert with attribution so it's there when the
          // customer registration upsert fires later from BookingForm
          await supabase
            .from('site_customers')
            .upsert(
              {
                site_id,
                email:        customer_email,
                name:         customer_name,
                phone:        customer_phone || null,
                utm_source:   utm_source   || null,
                utm_medium:   utm_medium   || null,
                utm_campaign: utm_campaign || null,
                utm_content:  utm_content  || null,
                utm_term:     utm_term     || null,
                referrer:     referrer     || null,
                landing_page: landing_page || null,
                is_verified:  false,
                booking_count: 0,
                total_spend:  0,
                status:       'active',
              },
              { onConflict: 'site_id,email', ignoreDuplicates: true }
            )
        }
      } catch (attrErr: any) {
        console.warn('[notify] site_customer attribution skipped:', attrErr?.message)
      }
    }

    // Save booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        site_id,
        service_id: service_id || null,
        customer_name,
        customer_phone,
        customer_email: customer_email || null,
        service_name,
        booking_date,
        booking_time,        car_model: car_model || null,
        pet_name: pet_name || null,
        notes: notes || null,
        staff_id: staff_id || null,
        staff_name: staff_name || null,
        cancel_token: cancelToken,
        site_timezone: siteTimezone,
        status,
        // Attribution — silently captured from URL params by AttributionTracker
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

    if (bookingError) throw new Error(`Booking save failed: ${bookingError.message}`)

    // Log booking creation event (non-blocking)
    logEvent({
      event_type:  ET.BOOKING_CREATED,
      category:    'booking',
      severity:    'info',
      actor_type:  'customer',
      actor_id:    customer_email || customer_phone,
      site_id:     site_id,
      entity_type: 'booking',
      entity_id:   booking.id,
      summary:     `Booking created — ${service_name} for ${customer_name}`,
      metadata: {
        service_name, booking_date, booking_time,
        customer_name, status,
        staff_name: staff_name || null,
      },
    }).catch(() => {})

    // Build base URL for cancel/reschedule links
    const baseUrl = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://kita-builder-systems.vercel.app'
    const cancelUrl = `${baseUrl}/booking/${booking.id}/cancel?token=${cancelToken}`
    const rescheduleUrl = `${baseUrl}/booking/${booking.id}/reschedule?token=${cancelToken}`
    const confirmationUrl = `${baseUrl}/booking/${booking.id}?token=${cancelToken}`

    const extraField = car_model
      ? `<br/><strong>Vehicle:</strong> ${car_model}`
      : pet_name
        ? `<br/><strong>Pet:</strong> ${pet_name}`
        : ''
    const staffHtml = staff_name ? `<br/><strong>Staff:</strong> ${staff_name}` : ''
    const notesHtml = notes ? `<br/><strong>Notes:</strong> ${notes}` : ''

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const ownerEmail = process.env.NOTIFICATION_EMAIL || site?.owner_email

      // Email to owner
      if (ownerEmail) {
        await resend.emails.send({
          from: 'KITA Bookings <onboarding@resend.dev>',
          to: ownerEmail,
          subject: `📅 ${status === 'pending' ? 'New Booking Request' : 'New Booking'} — ${service_name} | ${site?.business_name}`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;">
              <h2 style="color:#1a1a2e;margin-bottom:4px;">${status === 'pending' ? '⏳ New Booking Request' : '✅ New Booking Confirmed'}</h2>
              <p style="color:#666;margin-top:0;">${site?.business_name}</p>
              <div style="background:white;border-radius:8px;padding:20px;margin-top:16px;">
                <p style="margin:0 0 8px;font-size:14px;"><strong>Customer:</strong> ${customer_name}</p>
                <p style="margin:0 0 8px;font-size:14px;"><strong>Phone:</strong> ${customer_phone}</p>
                ${customer_email ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> ${customer_email}</p>` : ''}
                <p style="margin:0 0 8px;font-size:14px;"><strong>Service:</strong> ${service_name}</p>
                <p style="margin:0 0 8px;font-size:14px;"><strong>Date:</strong> ${booking_date}</p>
                <p style="margin:0 0 8px;font-size:14px;"><strong>Time:</strong> ${booking_time}</p>
                <p style="margin:0;font-size:14px;">${staffHtml}${extraField}${notesHtml}</p>
              </div>
              ${status === 'pending' ? `<p style="margin-top:16px;font-size:13px;color:#666;">This booking is <strong>pending your confirmation</strong>. Log into your dashboard to confirm or cancel.</p>` : ''}
              <p style="color:#999;font-size:12px;margin-top:20px;text-align:center;">Powered by KITA Builder Systems · From Struggle to Booked.</p>
            </div>
          `,
        }).catch(e => console.error('[notify] Owner email failed:', e.message))
      }

      // Confirmation email to customer (if they provided email)
      if (customer_email) {
        await resend.emails.send({
          from: 'KITA Bookings <onboarding@resend.dev>',
          to: customer_email,
          subject: `${status === 'confirmed' ? '✅ Booking Confirmed' : '⏳ Booking Request Received'} — ${service_name} at ${site?.business_name}`,
          html: `
            <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;">
              <h2 style="color:#1a1a2e;">${status === 'confirmed' ? '✅ Your booking is confirmed!' : '⏳ Booking request received!'}</h2>
              <p style="color:#666;">${status === 'confirmed' ? "We'll see you soon." : "We'll confirm your booking shortly."}</p>
              <div style="background:white;border-radius:8px;padding:20px;margin:16px 0;">
                <p style="margin:0 0 8px;font-size:14px;"><strong>Business:</strong> ${site?.business_name}</p>
                <p style="margin:0 0 8px;font-size:14px;"><strong>Service:</strong> ${service_name}</p>
                <p style="margin:0 0 8px;font-size:14px;"><strong>Date:</strong> ${booking_date}</p>
                <p style="margin:0 0 8px;font-size:14px;"><strong>Time:</strong> ${booking_time}</p>
                ${staff_name ? `<p style="margin:0 0 8px;font-size:14px;"><strong>Staff:</strong> ${staff_name}</p>` : ''}
                ${car_model ? `<p style="margin:0;font-size:14px;"><strong>Vehicle:</strong> ${car_model}</p>` : ''}
                ${pet_name ? `<p style="margin:0;font-size:14px;"><strong>Pet:</strong> ${pet_name}</p>` : ''}
              </div>
              <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap;">
                <a href="${confirmationUrl}" style="background:#1a1a2e;color:white;padding:10px 16px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:bold;">View Booking</a>
                <a href="${cancelUrl}" style="background:#f1f5f9;color:#475569;padding:10px 16px;border-radius:8px;text-decoration:none;font-size:13px;">Cancel</a>
                <a href="${rescheduleUrl}" style="background:#f1f5f9;color:#475569;padding:10px 16px;border-radius:8px;text-decoration:none;font-size:13px;">Reschedule</a>
              </div>
              <p style="color:#999;font-size:12px;margin-top:20px;text-align:center;">Powered by KITA Builder Systems</p>
            </div>
          `,
        }).catch(e => console.error('[notify] Customer email failed:', e.message))
      }
    }

    return NextResponse.json({
      success: true,
      booking,
      status,
      confirmation_url: confirmationUrl,
      cancel_url: cancelUrl,
    })
  } catch (err: any) {
    console.error('[/api/notify]', err)
    return NextResponse.json({ error: err.message || 'Booking failed' }, { status: 500 })
  }
}
