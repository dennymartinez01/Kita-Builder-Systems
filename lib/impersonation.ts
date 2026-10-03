/**
 * KITA Builder Systems — Admin Impersonation
 * Phase 13
 *
 * Allows the admin to view any client's owner dashboard without
 * knowing their PIN. Implemented via sessionStorage — the dashboard
 * PIN gate checks for a valid impersonation token and bypasses auth.
 *
 * Security model:
 *   - Only accessible from within the admin panel (PIN-gated)
 *   - Stored in sessionStorage — cleared when browser tab closes
 *   - Every session logged to the event stream
 *   - A persistent banner makes impersonation impossible to forget
 */

export const IMPERSONATION_KEY = 'kita_impersonation'

export interface ImpersonationSession {
  siteId:       string
  siteSlug:     string
  businessName: string
  clientId:     string | null
  startedAt:    string  // ISO timestamp
}

/**
 * Start an impersonation session.
 * Call this from the admin panel before navigating to the dashboard.
 */
export function startImpersonation(session: ImpersonationSession): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify(session))
  } catch { /* storage unavailable */ }
}

/**
 * End the current impersonation session and return to admin panel.
 */
export function endImpersonation(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(IMPERSONATION_KEY)
  } catch { /* storage unavailable */ }
}

/**
 * Read the current impersonation session (if any).
 * Returns null if not impersonating.
 */
export function getImpersonationSession(): ImpersonationSession | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = sessionStorage.getItem(IMPERSONATION_KEY)
    if (stored) return JSON.parse(stored) as ImpersonationSession
  } catch { /* parse error */ }
  return null
}

/**
 * Returns true if the admin is currently impersonating a client.
 */
export function isImpersonating(): boolean {
  return getImpersonationSession() !== null
}
