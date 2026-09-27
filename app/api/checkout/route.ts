import { NextRequest, NextResponse } from 'next/server'
import { getStripeConfig } from '@/lib/stripe-config'
import { KITA_PRICING } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  try {
    const {
      business_name,
      business_type,
      location,
      owner_email,
      extra_notes,
    } = await req.json()

    if (!business_name || !business_type || !location || !owner_email) {
      return NextResponse.json(
        { error: 'business_name, business_type, location, and owner_email are required.' },
        { status: 400 }
      )
    }

    const { stripeClient, mode } = await getStripeConfig()

    // Base URL — works both locally and on Vercel
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get('origin') ||
      'http://localhost:3000'

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: owner_email,
      line_items: [
        {
          price_data: {
            currency: KITA_PRICING.setup.currency,
            unit_amount: KITA_PRICING.setup.amount,
            product_data: {
              name: `${KITA_PRICING.setup.name}${mode === 'test' ? ' [TEST]' : ''}`,
              description: KITA_PRICING.setup.description,
              images: [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        business_name,
        business_type,
        location,
        owner_email,
        extra_notes: extra_notes || '',
        stripe_mode: mode, // store which mode was active when this session was created
      },
      success_url: `${baseUrl}/onboard/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/onboard?cancelled=true`,
    })

    return NextResponse.json({ url: session.url, session_id: session.id, mode })
  } catch (err: any) {
    console.error('[/api/checkout]', err)
    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
