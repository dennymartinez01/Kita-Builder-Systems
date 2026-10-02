import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/coupons?site_id= — owner: list all coupons for a site
export async function GET(req: NextRequest) {
  try {
    const site_id = req.nextUrl.searchParams.get('site_id')
    if (!site_id) return NextResponse.json({ error: 'site_id required' }, { status: 400 })

    const supabase = createServerClient()
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('site_id', site_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ coupons: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ coupons: [], error: err.message }, { status: 500 })
  }
}

// POST /api/coupons — create or update a coupon
// Body: Coupon fields. If id is provided → update. Otherwise → create.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      id, site_id, code, description,
      discount_type, discount_value,
      min_booking_amount, max_discount,
      usage_limit, per_customer_limit,
      applicable_service_ids,
      starts_at, expires_at, active,
    } = body

    if (!site_id || !code || !discount_type || discount_value == null) {
      return NextResponse.json({ error: 'site_id, code, discount_type, and discount_value are required' }, { status: 400 })
    }

    const supabase = createServerClient()
    const payload: any = {
      site_id,
      code:                  code.toUpperCase().trim(),
      description:           description || null,
      discount_type,
      discount_value:        Number(discount_value),
      min_booking_amount:    Number(min_booking_amount ?? 0),
      max_discount:          max_discount != null ? Number(max_discount) : null,
      usage_limit:           usage_limit != null ? Number(usage_limit) : null,
      per_customer_limit:    per_customer_limit != null ? Number(per_customer_limit) : 1,
      applicable_service_ids: applicable_service_ids ?? [],
      starts_at:             starts_at || new Date().toISOString(),
      expires_at:            expires_at || null,
      active:                active ?? true,
    }

    let result
    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from('coupons')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('site_id', site_id)
        .select()
        .single()
      if (error) throw error
      result = data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('coupons')
        .insert(payload)
        .select()
        .single()
      if (error) {
        if (error.message.includes('unique')) {
          throw new Error(`A coupon with code "${payload.code}" already exists for this site.`)
        }
        throw error
      }
      result = data
    }

    return NextResponse.json({ coupon: result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/coupons?id=&site_id=
export async function DELETE(req: NextRequest) {
  try {
    const id      = req.nextUrl.searchParams.get('id')
    const site_id = req.nextUrl.searchParams.get('site_id')
    if (!id || !site_id) return NextResponse.json({ error: 'id and site_id required' }, { status: 400 })

    const supabase = createServerClient()
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id)
      .eq('site_id', site_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
