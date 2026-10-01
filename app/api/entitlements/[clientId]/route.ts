import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import {
  getEffectiveEntitlements,
  setClientEntitlementOverride,
} from '@/lib/entitlements'
import { logEvent, ET } from '@/lib/events'

type RouteContext = { params: Promise<{ clientId: string }> }

// GET /api/entitlements/[clientId]
// Returns resolved effective entitlements + raw feature registry
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { clientId } = await params
    const supabase = createServerClient()

    const [clientRes, featuresRes] = await Promise.all([
      supabase.from('clients').select('id, subscription_plan').eq('id', clientId).single(),
      supabase.from('features').select('*').eq('is_active', true).order('category').order('key'),
    ])

    if (clientRes.error || !clientRes.data) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const { subscription_plan } = clientRes.data
    const features = featuresRes.data ?? []
    const effective = await getEffectiveEntitlements(clientId, subscription_plan)

    return NextResponse.json({ effective, features, plan: subscription_plan })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/entitlements/[clientId]
// Body: { feature_key, enabled (true|false|null), limit_value?, override_reason? }
// enabled=null removes the override (reverts to plan default)
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { clientId } = await params
    const body = await req.json()
    const { feature_key, enabled, limit_value, override_reason } = body

    if (!feature_key) {
      return NextResponse.json({ error: 'feature_key is required' }, { status: 400 })
    }
    if (enabled !== null && typeof enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled must be true, false, or null' }, { status: 400 })
    }

    const { error } = await setClientEntitlementOverride({
      clientId,
      featureKey:     feature_key,
      enabled:        enabled ?? null,
      limitValue:     limit_value ?? null,
      overrideReason: override_reason ?? null,
      overriddenBy:   'admin',
    })

    if (error) throw new Error(error)

    // Log the override change
    logEvent({
      event_type:  enabled === null ? ET.ENTITLEMENT_OVERRIDE_REMOVED : ET.ENTITLEMENT_OVERRIDE_SET,
      category:    'entitlement',
      severity:    'info',
      actor_type:  'admin',
      actor_id:    'admin',
      client_id:   clientId,
      entity_type: 'entitlement',
      entity_id:   feature_key,
      summary:     enabled === null
        ? `Entitlement override removed — ${feature_key} reverted to plan default`
        : `Entitlement override set — ${feature_key} = ${enabled ? 'granted' : 'revoked'}`,
      metadata: { feature_key, enabled, limit_value, override_reason },
    }).catch(() => {})

    const supabase = createServerClient()
    const { data: client } = await supabase
      .from('clients')
      .select('subscription_plan')
      .eq('id', clientId)
      .single()

    const effective = await getEffectiveEntitlements(clientId, client?.subscription_plan ?? 'starter')
    return NextResponse.json({ success: true, effective })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
