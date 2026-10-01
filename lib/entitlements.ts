/**
 * KITA Builder Systems — Feature & Entitlement Engine
 * Phase 11
 *
 * Resolution order (for any feature key):
 *   1. client_entitlements row  → admin override (wins always)
 *   2. plan_features row        → plan default
 *   3. false / null             → feature not found / not enabled
 *
 * Usage:
 *   const ent = await getEffectiveEntitlements(clientId, plan)
 *   if (hasFeature(ent, 'whatsapp')) { ... }
 *   const maxSites = getLimit(ent, 'max_sites') ?? 1
 */

import { createServerClient } from '@/lib/supabase'
import type { EffectiveEntitlements, SubscriptionPlan } from '@/types/database'

// ── Canonical monthly rates — single source of truth ─────────
export const MONTHLY_RATES: Record<string, number> = {
  trial:   0,
  starter: 29,
  growth:  49,
  agency:  99,
  custom:  0,
}

// ── Plan site limits — derived from plan_features seed data ──
export const PLAN_SITE_LIMITS: Record<string, number> = {
  trial:   1,
  starter: 1,
  growth:  3,
  agency:  10,
  custom:  999,
}

// ── Plan blast limits ─────────────────────────────────────────
export const PLAN_BLAST_LIMITS: Record<string, number> = {
  trial:   0,
  starter: 0,
  growth:  2,
  agency:  5,
  custom:  0,
}

// ── Feature categories (for UI grouping) ─────────────────────
export const FEATURE_CATEGORIES = [
  { key: 'booking',      label: 'Booking System',    color: 'text-blue-400' },
  { key: 'crm',          label: 'CRM & Leads',        color: 'text-green-400' },
  { key: 'analytics',    label: 'Analytics',          color: 'text-yellow-400' },
  { key: 'integrations', label: 'Integrations',       color: 'text-purple-400' },
  { key: 'branding',     label: 'Branding',           color: 'text-pink-400' },
  { key: 'platform',     label: 'Platform',           color: 'text-gray-300' },
] as const

// ── Core resolver ─────────────────────────────────────────────

/**
 * Fetch and resolve all effective entitlements for a client.
 *
 * @param clientId  — UUID of the client
 * @param plan      — their current subscription plan
 * @returns         — EffectiveEntitlements map (key → { enabled, limitValue, source })
 *
 * Always uses the service-role Supabase client because client_entitlements
 * and plan_features tables are RLS-restricted to service_role.
 */
export async function getEffectiveEntitlements(
  clientId: string,
  plan: SubscriptionPlan | string
): Promise<EffectiveEntitlements> {
  const supabase = createServerClient()

  // Fetch plan defaults + client overrides in parallel
  const [planRes, overrideRes] = await Promise.all([
    supabase
      .from('plan_features')
      .select('feature_key, enabled, limit_value')
      .eq('plan', plan),
    supabase
      .from('client_entitlements')
      .select('feature_key, enabled, limit_value')
      .eq('client_id', clientId),
  ])

  // Build base from plan defaults
  const result: EffectiveEntitlements = {}

  for (const row of planRes.data ?? []) {
    result[row.feature_key] = {
      enabled:    row.enabled,
      limitValue: row.limit_value ?? null,
      source:     'plan',
    }
  }

  // Apply client overrides (win over plan defaults)
  for (const row of overrideRes.data ?? []) {
    result[row.feature_key] = {
      enabled:    row.enabled,
      limitValue: row.limit_value ?? result[row.feature_key]?.limitValue ?? null,
      source:     'override',
    }
  }

  return result
}

// ── Convenience helpers ───────────────────────────────────────

/** Returns true if the feature is enabled in the resolved entitlements */
export function hasFeature(
  entitlements: EffectiveEntitlements,
  featureKey: string
): boolean {
  return entitlements[featureKey]?.enabled === true
}

/** Returns the resolved numeric limit for a feature, or null if not set */
export function getLimit(
  entitlements: EffectiveEntitlements,
  featureKey: string
): number | null {
  return entitlements[featureKey]?.limitValue ?? null
}

/**
 * Set or remove a client entitlement override.
 * Pass enabled=null to delete the override (fall back to plan default).
 */
export async function setClientEntitlementOverride(params: {
  clientId: string
  featureKey: string
  enabled: boolean | null     // null = delete override
  limitValue?: number | null
  overrideReason?: string
  overriddenBy?: string
}): Promise<{ error: string | null }> {
  const supabase = createServerClient()
  const { clientId, featureKey, enabled, limitValue, overrideReason, overriddenBy } = params

  // null = remove override → fall back to plan default
  if (enabled === null) {
    const { error } = await supabase
      .from('client_entitlements')
      .delete()
      .eq('client_id', clientId)
      .eq('feature_key', featureKey)
    return { error: error?.message ?? null }
  }

  const { error } = await supabase
    .from('client_entitlements')
    .upsert(
      {
        client_id:       clientId,
        feature_key:     featureKey,
        enabled,
        limit_value:     limitValue ?? null,
        override_reason: overrideReason ?? null,
        overridden_by:   overriddenBy ?? 'admin',
        updated_at:      new Date().toISOString(),
      },
      { onConflict: 'client_id,feature_key' }
    )

  return { error: error?.message ?? null }
}

/**
 * Get all active overrides for a client (for display in admin UI).
 */
export async function getClientOverrides(clientId: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('client_entitlements')
    .select('feature_key, enabled, limit_value, override_reason, overridden_by, updated_at')
    .eq('client_id', clientId)
    .order('feature_key')
  return { data: data ?? [], error: error?.message ?? null }
}
