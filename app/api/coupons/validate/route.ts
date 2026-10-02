import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { CouponValidationResult } from '@/types/database'

/**
 * GET /api/coupons/validate?code=&site_id=&service_id=&booking_amount=&customer_email=
 *
 * Validates a coupon code server-side and returns the calculated discount.
 * NEVER trust the client-calculated discount — always re-validate in /api/notify.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const code           = searchParams.get('code')?.toUpperCase().trim()
    const site_id        = searchParams.get('site_id')
    const service_id     = searchParams.get('service_id') || null
    const bookingAmount  = parseFloat(searchParams.get('booking_amount') || '0')
    const customerEmail  = searchParams.get('customer_email') || null

    if (!code || !site_id) {
      return NextResponse.json<CouponValidationResult>(
        { valid: false, coupon: null, discount_amount: 0, error: 'code and site_id are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Fetch the coupon
    const { data: coupon, error: fetchErr } = await supabase
      .from('coupons')
      .select('*')
      .eq('site_id', site_id)
      .eq('code', code)
      .eq('active', true)
      .single()

    if (fetchErr || !coupon) {
      return NextResponse.json<CouponValidationResult>({
        valid: false, coupon: null, discount_amount: 0,
        error: 'Invalid or inactive coupon code.',
      })
    }

    const now = new Date()

    // Check validity window
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return NextResponse.json<CouponValidationResult>({
        valid: false, coupon, discount_amount: 0,
        error: `This coupon is not yet active. It starts on ${new Date(coupon.starts_at).toLocaleDateString()}.`,
      })
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return NextResponse.json<CouponValidationResult>({
        valid: false, coupon, discount_amount: 0,
        error: 'This coupon has expired.',
      })
    }

    // Check usage limit
    if (coupon.usage_limit != null && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json<CouponValidationResult>({
        valid: false, coupon, discount_amount: 0,
        error: 'This coupon has reached its usage limit.',
      })
    }

    // Check per-customer limit
    if (coupon.per_customer_limit != null && customerEmail) {
      const { count } = await supabase
        .from('coupon_usages')
        .select('id', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)
        .eq('customer_email', customerEmail)
      if ((count ?? 0) >= coupon.per_customer_limit) {
        return NextResponse.json<CouponValidationResult>({
          valid: false, coupon, discount_amount: 0,
          error: `You have already used this coupon ${coupon.per_customer_limit} time${coupon.per_customer_limit > 1 ? 's' : ''}.`,
        })
      }
    }

    // Check minimum booking amount
    if (coupon.min_booking_amount > 0 && bookingAmount < coupon.min_booking_amount) {
      return NextResponse.json<CouponValidationResult>({
        valid: false, coupon, discount_amount: 0,
        error: `Minimum booking amount of $${coupon.min_booking_amount} required.`,
      })
    }

    // Check service restriction
    const restrictedServices = coupon.applicable_service_ids as string[]
    if (restrictedServices.length > 0 && service_id && !restrictedServices.includes(service_id)) {
      return NextResponse.json<CouponValidationResult>({
        valid: false, coupon, discount_amount: 0,
        error: 'This coupon is not valid for the selected service.',
      })
    }

    // Calculate discount
    let discount_amount = 0
    if (coupon.discount_type === 'percentage') {
      discount_amount = (bookingAmount * coupon.discount_value) / 100
      if (coupon.max_discount != null) {
        discount_amount = Math.min(discount_amount, coupon.max_discount)
      }
    } else {
      // fixed
      discount_amount = Math.min(coupon.discount_value, bookingAmount) // never discount more than the booking
    }
    discount_amount = Math.round(discount_amount * 100) / 100 // 2dp

    return NextResponse.json<CouponValidationResult>({
      valid: true,
      coupon,
      discount_amount,
      error: null,
    })
  } catch (err: any) {
    return NextResponse.json<CouponValidationResult>(
      { valid: false, coupon: null, discount_amount: 0, error: err.message },
      { status: 500 }
    )
  }
}
