import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

/**
 * GET /api/crm/matches/[clientId]
 *
 * What:  Returns all leads that match a client by email or phone,
 *        enriched with attribution data from both sides.
 * Why:   CRM Intelligence — closes the loop between a contact form lead
 *        and the person who actually booked, revealing which channels convert.
 * Who:   Admin — Client 360 Intelligence tab.
 * Status: Active — Phase 15
 *
 * Response: { matches: CRMMatch[], summary: CRMSummary }
 */

export interface CRMMatch {
  lead_id:               string
  lead_name:             string
  lead_email:            string
  lead_phone:            string | null
  lead_source:           string
  lead_status:           string
  lead_message:          string | null
  lead_service_interest: string | null
  lead_created_at:       string
  lead_utm_source:       string | null
  lead_utm_medium:       string | null
  lead_utm_campaign:     string | null
  lead_referrer:         string | null
  lead_landing_page:     string | null
  match_signal:          'email' | 'phone' | 'unknown'
  attribution_agrees:    boolean
  customer_utm_source:   string | null
  customer_utm_campaign: string | null
  customer_booking_count:number | null
  customer_total_spend:  number | null
  customer_last_booking_at: string | null
}

export interface CRMSummary {
  total_matches:          number
  converted_leads:        number   // leads with status='converted'
  attribution_match_rate: number   // % where lead + booking source agree
  top_source:             string | null
  total_lead_spend:       number   // sum of total_spend for matched customers
}

interface RouteParams {
  params: Promise<{ clientId: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { clientId } = await params
    if (!clientId) {
      return NextResponse.json({ error: 'clientId required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Fetch the client to get their email + phone for matching
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .select('id, email, phone')
      .eq('id', clientId)
      .single()

    if (clientErr || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Query the lead_client_matches view filtered to this client.
    // The view already handles email + phone dedup.
    const { data: rows, error: viewErr } = await supabase
      .from('lead_client_matches')
      .select('*')
      .eq('client_id', clientId)
      .order('lead_created_at', { ascending: false })

    if (viewErr) {
      // View may not exist yet (SQL not run) — return empty gracefully
      console.warn('[crm/matches] view query failed:', viewErr.message)
      return NextResponse.json({ matches: [], summary: emptySummary() })
    }

    const matches: CRMMatch[] = (rows ?? []).map((r: any) => ({
      lead_id:               r.lead_id,
      lead_name:             r.lead_name,
      lead_email:            r.lead_email,
      lead_phone:            r.lead_phone,
      lead_source:           r.lead_source,
      lead_status:           r.lead_status,
      lead_message:          r.lead_message,
      lead_service_interest: r.lead_service_interest,
      lead_created_at:       r.lead_created_at,
      lead_utm_source:       r.lead_utm_source,
      lead_utm_medium:       r.lead_utm_medium,
      lead_utm_campaign:     r.lead_utm_campaign,
      lead_referrer:         r.lead_referrer,
      lead_landing_page:     r.lead_landing_page,
      match_signal:          r.match_signal,
      attribution_agrees:    r.attribution_agrees,
      customer_utm_source:   r.customer_utm_source,
      customer_utm_campaign: r.customer_utm_campaign,
      customer_booking_count: r.customer_booking_count ?? 0,
      customer_total_spend:  r.customer_total_spend ?? 0,
      customer_last_booking_at: r.customer_last_booking_at,
    }))

    const summary = buildSummary(matches)

    return NextResponse.json({ matches, summary })
  } catch (err: any) {
    console.error('[/api/crm/matches]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

/**
 * PATCH /api/crm/matches/[clientId]
 * Confirms a match — sets lead.matched_client_id = clientId and marks lead as 'converted'.
 * Body: { lead_id: string }
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { clientId } = await params
    const { lead_id } = await req.json()

    if (!clientId || !lead_id) {
      return NextResponse.json({ error: 'clientId and lead_id required' }, { status: 400 })
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('leads')
      .update({
        matched_client_id: clientId,
        status:            'converted',
        updated_at:        new Date().toISOString(),
      } as any)
      .eq('id', lead_id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── Helpers ───────────────────────────────────────────────────

function emptySummary(): CRMSummary {
  return {
    total_matches: 0,
    converted_leads: 0,
    attribution_match_rate: 0,
    top_source: null,
    total_lead_spend: 0,
  }
}

function buildSummary(matches: CRMMatch[]): CRMSummary {
  if (matches.length === 0) return emptySummary()

  const converted = matches.filter(m => m.lead_status === 'converted').length
  const agreeing  = matches.filter(m => m.attribution_agrees).length
  const matchRate = Math.round((agreeing / matches.length) * 100)

  // Count sources
  const sourceCounts: Record<string, number> = {}
  for (const m of matches) {
    const src = m.lead_utm_source || m.customer_utm_source || 'direct'
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1
  }
  const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const totalSpend = matches.reduce((sum, m) => sum + (m.customer_total_spend ?? 0), 0)

  return {
    total_matches:          matches.length,
    converted_leads:        converted,
    attribution_match_rate: matchRate,
    top_source:             topSource,
    total_lead_spend:       totalSpend,
  }
}
