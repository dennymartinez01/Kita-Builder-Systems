import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { ONBOARDING_STEPS, STEP_KEYS, seedOnboardingSteps } from '@/lib/onboarding'
import { logEvent } from '@/lib/events'

/**
 * GET /api/clients/[id]/onboarding
 * Returns the full onboarding checklist for a client,
 * merged with static step metadata.
 *
 * POST /api/clients/[id]/onboarding
 * Body: { step_key: string }
 * Marks a step complete. If all steps are done, sets
 * clients.onboarding_complete = true and logs the event.
 *
 * What:  Onboarding checklist CRUD — Phase 17
 * Who:   Admin (Client 360) + future: owner dashboard
 */

type RouteContext = { params: Promise<{ id: string }> }

export interface OnboardingStepRow {
  key:          string
  label:        string
  description:  string
  icon:         string
  path:         string
  completed:    boolean
  completed_at: string | null
}

// ── GET ───────────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id: clientId } = await params
    const supabase = createServerClient()

    // Fetch DB rows — may be empty if steps not yet seeded
    const { data: rows } = await supabase
      .from('client_onboarding_steps')
      .select('step_key, completed, completed_at')
      .eq('client_id', clientId)

    // If no rows exist yet, seed them now (lazy init)
    if (!rows || rows.length === 0) {
      await seedOnboardingSteps(clientId)
    }

    // Merge static metadata with DB state
    const rowMap: Record<string, { completed: boolean; completed_at: string | null }> = {}
    for (const r of (rows ?? [])) {
      rowMap[r.step_key] = { completed: r.completed, completed_at: r.completed_at }
    }

    const steps: OnboardingStepRow[] = ONBOARDING_STEPS.map(s => ({
      key:          s.key,
      label:        s.label,
      description:  s.description,
      icon:         s.icon,
      path:         s.path,
      completed:    rowMap[s.key]?.completed ?? false,
      completed_at: rowMap[s.key]?.completed_at ?? null,
    }))

    const completedCount = steps.filter(s => s.completed).length
    const pct            = Math.round((completedCount / ONBOARDING_STEPS.length) * 100)

    // Fetch onboarding_complete flag from clients table
    const { data: client } = await supabase
      .from('clients')
      .select('onboarding_complete, name')
      .eq('id', clientId)
      .single()

    return NextResponse.json({
      steps,
      completed_count: completedCount,
      total:           ONBOARDING_STEPS.length,
      percent:         pct,
      all_done:        client?.onboarding_complete ?? false,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// ── POST ──────────────────────────────────────────────────────
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { id: clientId } = await params
    const body = await req.json()
    const { step_key, completed = true } = body

    if (!step_key || !STEP_KEYS.includes(step_key)) {
      return NextResponse.json(
        { error: `Invalid step_key. Must be one of: ${STEP_KEYS.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Upsert the step row
    const { error: upsertErr } = await supabase
      .from('client_onboarding_steps')
      .upsert(
        {
          client_id:    clientId,
          step_key,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        },
        { onConflict: 'client_id,step_key' }
      )

    if (upsertErr) throw new Error(upsertErr.message)

    // Check if all steps are now complete
    const { data: allRows } = await supabase
      .from('client_onboarding_steps')
      .select('step_key, completed')
      .eq('client_id', clientId)

    const completedKeys = new Set((allRows ?? []).filter((r: any) => r.completed).map((r: any) => r.step_key))
    const allDone       = STEP_KEYS.every(k => completedKeys.has(k))

    if (allDone) {
      // Mark client as fully onboarded
      await supabase
        .from('clients')
        .update({ onboarding_complete: true, updated_at: new Date().toISOString() } as any)
        .eq('id', clientId)

      // Log completion event (non-blocking)
      logEvent({
        event_type:  'client.onboarding_completed',
        category:    'client',
        severity:    'info',
        actor_type:  'system',
        actor_id:    'onboarding',
        client_id:   clientId,
        entity_type: 'client',
        entity_id:   clientId,
        summary:     'Client completed all onboarding steps',
      }).catch(() => {})
    }

    // Return updated steps list
    const { data: updatedRows } = await supabase
      .from('client_onboarding_steps')
      .select('step_key, completed, completed_at')
      .eq('client_id', clientId)

    const rowMap: Record<string, any> = {}
    for (const r of (updatedRows ?? [])) rowMap[r.step_key] = r

    const steps: OnboardingStepRow[] = ONBOARDING_STEPS.map(s => ({
      key:          s.key,
      label:        s.label,
      description:  s.description,
      icon:         s.icon,
      path:         s.path,
      completed:    rowMap[s.key]?.completed ?? false,
      completed_at: rowMap[s.key]?.completed_at ?? null,
    }))

    const completedCount = steps.filter(s => s.completed).length

    return NextResponse.json({
      success:         true,
      steps,
      completed_count: completedCount,
      total:           ONBOARDING_STEPS.length,
      percent:         Math.round((completedCount / ONBOARDING_STEPS.length) * 100),
      all_done:        allDone,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
