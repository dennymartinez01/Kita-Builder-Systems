/**
 * KITA Builder Systems — Admin Notification Center
 * Phase 11
 *
 * Notifications are a curated subset of the event stream —
 * only events that require admin attention create a notification.
 *
 * createNotification() is called inside logEvent() for event types
 * that are in NOTIFIABLE_EVENTS. This keeps notification creation
 * co-located with event creation, zero extra work per route.
 */

import { createServerClient } from '@/lib/supabase'

// ── Which event types generate a notification ─────────────────
export const NOTIFIABLE_EVENTS: Record<string, { icon: string; label: string }> = {
  'booking.created':              { icon: '📅', label: 'New Booking' },
  'booking.cancelled':            { icon: '❌', label: 'Booking Cancelled' },
  'payment.completed':            { icon: '💰', label: 'Payment Received' },
  'payment.failed':               { icon: '⚠️', label: 'Payment Failed' },
  'client.created':               { icon: '👤', label: 'New Client' },
  'trial.expired':                { icon: '⏰', label: 'Trial Expired' },
  'subscription.cancelled':       { icon: '🚫', label: 'Subscription Cancelled' },
  'entitlement.override_set':     { icon: '🛡️', label: 'Feature Override' },
  'lead.created':                 { icon: '📬', label: 'New Lead' },
  'system.error':                 { icon: '🔴', label: 'System Error' },
}

export interface AdminNotification {
  id: string
  event_id: string
  event_type: string
  category: string
  summary: string
  severity: string
  client_id: string | null
  site_id: string | null
  read_at: string | null
  created_at: string
}

// ── Create a notification for a given event ───────────────────
export async function createNotification(params: {
  event_id: string
  event_type: string
  category: string
  summary: string
  severity: string
  client_id?: string | null
  site_id?: string | null
}): Promise<void> {
  // Only create if this event type is notifiable
  if (!NOTIFIABLE_EVENTS[params.event_type]) return

  try {
    const supabase = createServerClient()
    await supabase.from('admin_notifications').insert({
      event_id:   params.event_id,
      event_type: params.event_type,
      category:   params.category,
      summary:    params.summary,
      severity:   params.severity,
      client_id:  params.client_id ?? null,
      site_id:    params.site_id ?? null,
    } as any)
  } catch (err: any) {
    // Non-fatal — notification creation must never crash a route
    console.warn('[notifications] createNotification failed:', err?.message)
  }
}

// ── Fetch notifications ───────────────────────────────────────
export async function getNotifications(opts: {
  unreadOnly?: boolean
  limit?: number
  offset?: number
} = {}): Promise<{ data: AdminNotification[]; unreadCount: number; error: string | null }> {
  try {
    const supabase = createServerClient()
    const limit  = opts.limit  ?? 50
    const offset = opts.offset ?? 0

    // Unread count (separate fast query using partial index)
    const { count: unreadCount } = await supabase
      .from('admin_notifications')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null)

    // Notification list
    let query = supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (opts.unreadOnly) query = query.is('read_at', null)

    const { data, error } = await query
    return {
      data:        (data ?? []) as AdminNotification[],
      unreadCount: unreadCount ?? 0,
      error:       error?.message ?? null,
    }
  } catch (err: any) {
    return { data: [], unreadCount: 0, error: err?.message ?? 'Unknown error' }
  }
}

// ── Get unread count only (for bell badge) ────────────────────
export async function getUnreadCount(): Promise<number> {
  try {
    const supabase = createServerClient()
    const { count } = await supabase
      .from('admin_notifications')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null)
    return count ?? 0
  } catch {
    return 0
  }
}

// ── Mark a single notification as read ───────────────────────
export async function markRead(id: string): Promise<{ error: string | null }> {
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('admin_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id)
      .is('read_at', null)  // idempotent — only update if currently unread
    return { error: error?.message ?? null }
  } catch (err: any) {
    return { error: err?.message ?? 'Unknown error' }
  }
}

// ── Mark all notifications as read ───────────────────────────
export async function markAllRead(): Promise<{ error: string | null }> {
  try {
    const supabase = createServerClient()
    const { error } = await supabase
      .from('admin_notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null)
    return { error: error?.message ?? null }
  } catch (err: any) {
    return { error: err?.message ?? 'Unknown error' }
  }
}
