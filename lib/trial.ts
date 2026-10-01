/**
 * KITA Builder Systems — Trial Duration Helpers
 * Phase 11
 *
 * All functions are pure (no DB calls) — safe to use in both
 * server components and client components.
 */

export const TRIAL_DURATION_OPTIONS = [7, 14, 21, 30, 60] as const
export type TrialDuration = typeof TRIAL_DURATION_OPTIONS[number]

export type TrialStatusResult =
  | { state: 'not_started' }
  | { state: 'active';  daysLeft: number; endsAt: Date }
  | { state: 'expiring'; daysLeft: number; endsAt: Date }   // <= 3 days left
  | { state: 'expired';  expiredDaysAgo: number; endsAt: Date }
  | { state: 'converted' }   // subscription_status !== 'trial'

/**
 * Calculate trial_starts_at and trial_ends_at from a start time + duration.
 * If startAt is omitted, uses now().
 */
export function calculateTrialDates(
  durationDays: number,
  startAt?: Date
): { trial_starts_at: string; trial_ends_at: string } {
  const start = startAt ?? new Date()
  const end   = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000)
  return {
    trial_starts_at: start.toISOString(),
    trial_ends_at:   end.toISOString(),
  }
}

/**
 * Resolve the current trial state for a client.
 * Pass the raw client fields; works for both trial and non-trial clients.
 */
export function getTrialStatus(client: {
  subscription_status: string
  trial_starts_at: string | null
  trial_ends_at: string | null
}): TrialStatusResult {
  // Not on a trial plan
  if (client.subscription_status !== 'trial') return { state: 'converted' }

  // Trial exists but hasn't been activated yet
  if (!client.trial_ends_at) return { state: 'not_started' }

  const now    = new Date()
  const endsAt = new Date(client.trial_ends_at)
  const msLeft = endsAt.getTime() - now.getTime()
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24))

  if (daysLeft > 3)  return { state: 'active',   daysLeft, endsAt }
  if (daysLeft > 0)  return { state: 'expiring',  daysLeft, endsAt }
  const expiredDaysAgo = Math.floor(-msLeft / (1000 * 60 * 60 * 24))
  return { state: 'expired', expiredDaysAgo, endsAt }
}

/**
 * Returns a human-readable countdown string for display in badges and cards.
 * Examples: "12 days left", "Expires tomorrow", "Expired 3 days ago", "Active"
 */
export function formatTrialCountdown(client: {
  subscription_status: string
  trial_starts_at: string | null
  trial_ends_at: string | null
}): { label: string; color: string } {
  const status = getTrialStatus(client)

  switch (status.state) {
    case 'converted':
      return { label: 'Converted', color: 'text-green-400' }
    case 'not_started':
      return { label: 'Trial not started', color: 'text-gray-500' }
    case 'active':
      return {
        label: `${status.daysLeft} day${status.daysLeft === 1 ? '' : 's'} left`,
        color: 'text-blue-400',
      }
    case 'expiring':
      return {
        label: status.daysLeft === 1 ? 'Expires tomorrow' : `${status.daysLeft} days left`,
        color: 'text-yellow-400',
      }
    case 'expired':
      return {
        label: status.expiredDaysAgo === 0
          ? 'Expired today'
          : `Expired ${status.expiredDaysAgo}d ago`,
        color: 'text-red-400',
      }
  }
}

/**
 * Format a date as a short readable string: "27 Sep 2026"
 */
export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
