/**
 * KITA Builder Systems — Universal Event Stream
 * Phase 11
 *
 * logEvent() is the single write path for all platform events.
 * Always server-side (uses service role key). Never throws —
 * event logging must never block or break the calling operation.
 *
 * Usage:
 *   import { logEvent, ET } from '@/lib/events'
 *
 *   await logEvent({
 *     event_type: ET.BOOKING_CREATED,
 *     category:   'booking',
 *     summary:    `Booking created for ${customer_name} at ${business_name}`,
 *     site_id,
 *     client_id,
 *     entity_type: 'booking',
 *     entity_id:   booking.id,
 *     metadata: { service_name, booking_date, booking_time },
 *   })
 */

import { createServerClient } from '@/lib/supabase'
import type { LogEventInput } from '@/types/database'
import { createNotification } from '@/lib/notifications'

// ── Event Type constants ──────────────────────────────────────
// Using ET.* ensures consistency and enables search-by-reference.
export const ET = {
  // Booking
  BOOKING_CREATED:    'booking.created',
  BOOKING_CONFIRMED:  'booking.confirmed',
  BOOKING_CANCELLED:  'booking.cancelled',
  BOOKING_RESCHEDULED:'booking.rescheduled',

  // Site
  SITE_CREATED:       'site.created',
  SITE_DELETED:       'site.deleted',
  SITE_PUBLISHED:     'site.published',
  SITE_UPDATED:       'site.updated',

  // Client
  CLIENT_CREATED:     'client.created',
  CLIENT_UPDATED:     'client.updated',
  CLIENT_DELETED:     'client.deleted',

  // Subscription
  SUBSCRIPTION_STARTED:   'subscription.started',
  SUBSCRIPTION_UPGRADED:  'subscription.upgraded',
  SUBSCRIPTION_DOWNGRADED:'subscription.downgraded',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_PAUSED:    'subscription.paused',
  SUBSCRIPTION_CHANGED:   'subscription.changed',

  // Trial
  TRIAL_STARTED:      'trial.started',
  TRIAL_EXPIRED:      'trial.expired',
  TRIAL_CONVERTED:    'trial.converted',

  // Entitlement
  ENTITLEMENT_OVERRIDE_SET:     'entitlement.override_set',
  ENTITLEMENT_OVERRIDE_REMOVED: 'entitlement.override_removed',

  // Payment
  PAYMENT_COMPLETED:  'payment.completed',
  PAYMENT_FAILED:     'payment.failed',

  // Auth
  AUTH_LOGIN:         'auth.login',
  AUTH_FAILED:        'auth.failed',
  AUTH_IMPERSONATION_STARTED: 'auth.impersonation.started',
  AUTH_IMPERSONATION_ENDED:   'auth.impersonation.ended',

  // Lead / Outreach
  LEAD_CREATED:       'lead.created',
  LEAD_CONVERTED:     'lead.converted',

  // System
  SYSTEM_ERROR:       'system.error',
} as const

export type EventType = typeof ET[keyof typeof ET]

// ── Core write function ───────────────────────────────────────

/**
 * Write a single event to the events table.
 *
 * Non-fatal: catches and logs any DB error to console rather than
 * throwing, so a logging failure never breaks the calling route.
 *
 * Always uses createServerClient() (service role) because the events
 * table has RLS restricted to service_role only.
 */
export async function logEvent(input: LogEventInput): Promise<void> {
  try {
    const supabase = createServerClient()
    const { data, error } = await supabase.from('events').insert({
      event_type:  input.event_type,
      category:    input.category,
      severity:    input.severity ?? 'info',
      actor_type:  input.actor_type ?? null,
      actor_id:    input.actor_id ?? null,
      client_id:   input.client_id ?? null,
      site_id:     input.site_id ?? null,
      entity_type: input.entity_type ?? null,
      entity_id:   input.entity_id ?? null,
      metadata:    input.metadata ?? null,
      summary:     input.summary,
      ip_address:  input.ip_address ?? null,
    } as any).select('id').single()

    if (error) {
      // Table might not exist yet — log but don't crash
      console.warn('[events] logEvent failed:', error.message)
      return
    }

    // Auto-create admin notification for notifiable event types
    if (data) {
      createNotification({
        event_id:   (data as any).id,
        event_type: input.event_type,
        category:   input.category,
        summary:    input.summary,
        severity:   input.severity ?? 'info',
        client_id:  input.client_id ?? null,
        site_id:    input.site_id ?? null,
      }).catch(() => {}) // non-fatal
    }
  } catch (err: any) {
    console.warn('[events] logEvent exception:', err?.message)
  }
}

// ── Query helpers (used by /admin/events page) ────────────────

export interface EventFilters {
  category?:  string
  severity?:  string
  client_id?: string
  site_id?:   string
  from?:      string   // ISO date string
  to?:        string   // ISO date string
  limit?:     number
  offset?:    number
}

/**
 * Fetch events with optional filters. Server-side only.
 * Returns events in reverse chronological order.
 */
export async function queryEvents(filters: EventFilters = {}): Promise<{
  data: any[]
  count: number
  error: string | null
}> {
  try {
    const supabase = createServerClient()
    const limit  = filters.limit  ?? 50
    const offset = filters.offset ?? 0

    let query = supabase
      .from('events')
      .select('*', { count: 'exact' })
      .order('occurred_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (filters.category)  query = query.eq('category',  filters.category)
    if (filters.severity)  query = query.eq('severity',  filters.severity)
    if (filters.client_id) query = query.eq('client_id', filters.client_id)
    if (filters.site_id)   query = query.eq('site_id',   filters.site_id)
    if (filters.from)      query = query.gte('occurred_at', filters.from)
    if (filters.to)        query = query.lte('occurred_at', filters.to)

    const { data, count, error } = await query
    return { data: data ?? [], count: count ?? 0, error: error?.message ?? null }
  } catch (err: any) {
    return { data: [], count: 0, error: err?.message ?? 'Unknown error' }
  }
}

// ── Display helpers ───────────────────────────────────────────

export const CATEGORY_COLORS: Record<string, string> = {
  booking:      'text-blue-400',
  site:         'text-green-400',
  client:       'text-purple-400',
  subscription: 'text-yellow-400',
  entitlement:  'text-cyan-400',
  payment:      'text-emerald-400',
  auth:         'text-orange-400',
  system:       'text-gray-400',
}

export const CATEGORY_ICONS: Record<string, string> = {
  booking:      '📅',
  site:         '🌐',
  client:       '👤',
  subscription: '💳',
  entitlement:  '🛡️',
  payment:      '💰',
  auth:         '🔐',
  system:       '⚙️',
}

export const SEVERITY_COLORS: Record<string, string> = {
  info:     'bg-gray-800 text-gray-400',
  warning:  'bg-yellow-900/50 text-yellow-400',
  error:    'bg-red-900/50 text-red-400',
  critical: 'bg-red-900 text-red-300',
}
