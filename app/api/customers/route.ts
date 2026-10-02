import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { logEvent, ET } from '@/lib/events'

/**
 * POST /api/customers
 * Register a new customer or look up an existing one by site + email.
 *
 * Body: { site_id, email, name, phone?, action? }
 *   action = 'register' (default) | 'lookup'
 *
 * On register: upserts a site_customers row.
 * On lookup:   returns the customer record if found (no pin_hash).
 * Returns: { customer } — safe record without pin_hash.
 */
export async function POST(req: NextRequest) {
  try {
    const { site_id, email, name, phone, action = 'register' } = await req.json()

    if (!site_id || !email) {
      return NextResponse.json({ error: 'site_id and email are required' }, { status: 400 })
    }

    const supabase = createServerClient()

    if (action === 'lookup') {
      const { data } = await supabase
        .from('site_customers')
        .select('id, site_id, email, name, phone, is_verified, booking_count, total_spend, last_booking_at, status, created_at')
        .eq('site_id', site_id)
        .eq('email', email.toLowerCase().trim())
        .single()

      return NextResponse.json({ customer: data ?? null })
    }

    // Register / upsert
    if (!name) {
      return NextResponse.json({ error: 'name is required for registration' }, { status: 400 })
    }

    const normalEmail = email.toLowerCase().trim()

    const { data: customer, error } = await supabase
      .from('site_customers')
      .upsert(
        {
          site_id,
          email:   normalEmail,
          name:    name.trim(),
          phone:   phone?.trim() || null,
          status:  'active',
        },
        {
          onConflict:     'site_id,email',
          ignoreDuplicates: false, // update name/phone if already exists
        }
      )
      .select('id, site_id, email, name, phone, is_verified, booking_count, total_spend, last_booking_at, status, created_at')
      .single()

    if (error) throw new Error(error.message)

    // Log event (non-blocking)
    logEvent({
      event_type:  ET.CLIENT_CREATED, // reuse — no specific customer.registered type yet
      category:    'client',
      severity:    'info',
      actor_type:  'customer',
      actor_id:    normalEmail,
      site_id,
      entity_type: 'site_customer',
      entity_id:   customer.id,
      summary:     `Customer registered — ${name} (${normalEmail})`,
      metadata:    { site_id },
    }).catch(() => {})

    return NextResponse.json({ customer })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * GET /api/customers?site_id=&search=&limit=&offset=
 * Owner-facing: list all customers for a site.
 * Used by the owner dashboard Customers tab.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const site_id = searchParams.get('site_id')
    const search  = searchParams.get('search') || ''
    const limit   = Number(searchParams.get('limit')  || 50)
    const offset  = Number(searchParams.get('offset') || 0)

    if (!site_id) {
      return NextResponse.json({ error: 'site_id is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    let query = supabase
      .from('site_customers')
      .select(
        'id, site_id, email, name, phone, is_verified, booking_count, total_spend, last_booking_at, status, notes, created_at',
        { count: 'exact' }
      )
      .eq('site_id', site_id)
      .order('booking_count', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, count, error } = await query
    if (error) throw new Error(error.message)

    return NextResponse.json({ customers: data ?? [], total: count ?? 0 })
  } catch (err: any) {
    return NextResponse.json({ customers: [], total: 0, error: err.message }, { status: 500 })
  }
}
