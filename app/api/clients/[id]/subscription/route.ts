import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { logEvent, ET } from '@/lib/events'
import { calculateTrialDates } from '@/lib/trial'

type RouteContext = { params: Promise<{ id: string }> }

// Subscription plans in upgrade order
const PLAN_ORDER = ['trial', 'starter', 'growth', 'agency', 'custom']
const PLAN_RATES: Record<string, number> = {
  trial: 0, starter: 29, growth: 49, agency: 99, custom: 0,
}

/**
 * POST /api/clients/[id]/subscription
 *
 * Actions:
 *   upgrade   — move to the next plan tier (or specify target_plan)
 *   downgrade — move to the previous plan tier (or specify target_plan)
 *   change    — set plan + status directly (target_plan + target_status required)
 *   extend    — extend trial by N days (extend_days required, default 14)
 *   pause     — set subscription_status = 'paused'
 *   cancel    — set subscription_status = 'cancelled'
 *   terminate — set subscription_status = 'cancelled' + clear stripe info
 *   reactivate — set subscription_status = 'active'
 *
 * All actions:
 *   - Update the clients table
 *   - Log to event stream (subscription.changed / trial.started / etc.)
 *   - Return the updated client record
 */
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id: clientId } = await params
    const body = await req.json()
    const { action, target_plan, target_status, extend_days, reason } = body

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Fetch current client state
    const { data: client, error: fetchErr } = await supabase
      .from('clients')
      .select('id, name, email, subscription_plan, subscription_status, trial_ends_at, trial_duration_days')
      .eq('id', clientId)
      .single()

    if (fetchErr || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const prevPlan   = client.subscription_plan
    const prevStatus = client.subscription_status
    let updates: Record<string, any> = {}
    let eventType: string = ET.SUBSCRIPTION_CHANGED
    let summary      = ''

    switch (action) {
      case 'upgrade': {
        const currentIndex = PLAN_ORDER.indexOf(prevPlan)
        const nextPlan = target_plan ?? PLAN_ORDER[Math.min(currentIndex + 1, PLAN_ORDER.length - 1)]
        if (nextPlan === prevPlan && !target_plan) {
          return NextResponse.json({ error: 'Already on the highest plan' }, { status: 400 })
        }
        updates = {
          subscription_plan:   nextPlan,
          subscription_status: 'active',
        }
        eventType = ET.SUBSCRIPTION_UPGRADED
        summary   = `Subscription upgraded: ${prevPlan} → ${nextPlan} for ${client.name}`
        break
      }

      case 'downgrade': {
        const currentIndex = PLAN_ORDER.indexOf(prevPlan)
        const prevPlanTarget = target_plan ?? PLAN_ORDER[Math.max(currentIndex - 1, 0)]
        updates = {
          subscription_plan:   prevPlanTarget,
          subscription_status: prevStatus === 'cancelled' ? 'active' : prevStatus,
        }
        eventType = ET.SUBSCRIPTION_DOWNGRADED
        summary   = `Subscription downgraded: ${prevPlan} → ${prevPlanTarget} for ${client.name}`
        break
      }

      case 'change': {
        if (!target_plan && !target_status) {
          return NextResponse.json({ error: 'target_plan or target_status required for change action' }, { status: 400 })
        }
        updates = {}
        if (target_plan)   updates.subscription_plan   = target_plan
        if (target_status) updates.subscription_status = target_status
        eventType = ET.SUBSCRIPTION_CHANGED
        summary   = `Subscription changed: ${prevPlan}/${prevStatus} → ${target_plan ?? prevPlan}/${target_status ?? prevStatus} for ${client.name}`
        break
      }

      case 'extend': {
        const days = extend_days ?? 14
        const baseDate = client.trial_ends_at
          ? new Date(client.trial_ends_at)  // extend from current expiry
          : new Date()                       // extend from now if no trial set
        const newEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000)
        updates = {
          subscription_plan:   'trial',
          subscription_status: 'trial',
          trial_ends_at:       newEnd.toISOString(),
          trial_duration_days: (client.trial_duration_days ?? 14) + days,
        }
        eventType = ET.TRIAL_STARTED
        summary   = `Trial extended by ${days} days → new expiry ${newEnd.toLocaleDateString('en-AU')} for ${client.name}`
        break
      }

      case 'pause': {
        updates = { subscription_status: 'paused' }
        eventType = ET.SUBSCRIPTION_PAUSED
        summary   = `Subscription paused for ${client.name}`
        break
      }

      case 'cancel': {
        updates = { subscription_status: 'cancelled' }
        eventType = ET.SUBSCRIPTION_CANCELLED
        summary   = `Subscription cancelled for ${client.name}`
        break
      }

      case 'terminate': {
        updates = {
          subscription_status: 'cancelled',
          stripe_customer_id:  null,
          trial_ends_at:       null,
        }
        eventType = ET.SUBSCRIPTION_CANCELLED
        summary   = `Subscription terminated (all billing cleared) for ${client.name}`
        break
      }

      case 'reactivate': {
        updates = {
          subscription_status: 'active',
          subscription_plan:   prevPlan === 'trial' ? 'starter' : prevPlan,
        }
        eventType = ET.SUBSCRIPTION_CHANGED
        summary   = `Subscription reactivated: ${prevPlan} → ${updates.subscription_plan} for ${client.name}`
        break
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }

    // Apply update
    const { data: updated, error: updateErr } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq('id', clientId)
      .select()
      .single()

    if (updateErr) throw new Error(updateErr.message)

    // Log event (non-blocking)
    logEvent({
      event_type:  eventType,
      category:    'subscription',
      severity:    action === 'terminate' ? 'warning' : 'info',
      actor_type:  'admin',
      actor_id:    'admin',
      client_id:   clientId,
      entity_type: 'client',
      entity_id:   clientId,
      summary,
      metadata: {
        action,
        prev_plan:   prevPlan,
        prev_status: prevStatus,
        new_plan:    updated.subscription_plan,
        new_status:  updated.subscription_status,
        reason:      reason ?? null,
      },
    }).catch(() => {})

    return NextResponse.json({ success: true, client: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
