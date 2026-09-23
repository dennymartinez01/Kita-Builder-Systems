import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      site_id,
      service_id,
      customer_name,
      customer_phone,
      service_name,
      booking_date,
      booking_time,
      car_model,
      pet_name,
      notes,
    } = body

    if (!site_id || !customer_name || !customer_phone || !service_name || !booking_date || !booking_time) {
      return NextResponse.json(
        { error: 'Missing required booking fields.' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // 1. Save booking to database
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        site_id,
        service_id: service_id || null,
        customer_name,
        customer_phone,
        service_name,
        booking_date,
        booking_time,
        car_model: car_model || null,
        pet_name: pet_name || null,
        notes: notes || null,
        status: 'confirmed',
      })
      .select()
      .single()

    if (bookingError) throw new Error(`Booking save failed: ${bookingError.message}`)

    // 2. Get site info for the email
    const { data: site } = await supabase
      .from('sites')
      .select('business_name, owner_email')
      .eq('id', site_id)
      .single()

    // 3. Send notification email via Resend
    const ownerEmail = site?.owner_email || process.env.NOTIFICATION_EMAIL
    if (ownerEmail && process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)

      const extraField = car_model
        ? `<br/><strong>Vehicle:</strong> ${car_model}`
        : pet_name
          ? `<br/><strong>Pet Name:</strong> ${pet_name}`
          : ''

      const notesHtml = notes ? `<br/><strong>Notes:</strong> ${notes}` : ''

      // Email to owner
      await resend.emails.send({
        from: 'KITA Bookings <onboarding@resend.dev>',
        to: ownerEmail,
        subject: `📅 New Booking — ${service_name} | ${site?.business_name}`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
            <h2 style="color: #1a1a2e; margin-bottom: 4px;">New Booking Received</h2>
            <p style="color: #666; margin-top: 0;">${site?.business_name}</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin-top: 16px;">
              <p style="margin: 0 0 8px; font-size: 14px;"><strong>Customer:</strong> ${customer_name}</p>
              <p style="margin: 0 0 8px; font-size: 14px;"><strong>Phone:</strong> ${customer_phone}</p>
              <p style="margin: 0 0 8px; font-size: 14px;"><strong>Service:</strong> ${service_name}</p>
              <p style="margin: 0 0 8px; font-size: 14px;"><strong>Date:</strong> ${booking_date}</p>
              <p style="margin: 0 0 8px; font-size: 14px;"><strong>Time:</strong> ${booking_time}</p>
              <p style="margin: 0; font-size: 14px;">${extraField}${notesHtml}</p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
              Powered by KITA Builder Systems · From Struggle to Booked.
            </p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true, booking })
  } catch (err: any) {
    console.error('[/api/notify]', err)
    return NextResponse.json(
      { error: err.message || 'Booking failed' },
      { status: 500 }
    )
  }
}
