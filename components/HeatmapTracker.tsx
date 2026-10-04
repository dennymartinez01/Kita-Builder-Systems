'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  siteId: string
  path:   string
}

const CONSENT_KEY = 'kita_heatmap_consent'
const SESSION_KEY = 'kita_heatmap_session'
const BATCH_DELAY = 5000   // flush every 5 seconds
const MAX_BATCH   = 20     // max events per flush

/**
 * HeatmapTracker — silently captures click and scroll data.
 *
 * Privacy-first:
 *   - Only activates when visitor has given analytics consent
 *     (kita_heatmap_consent=1 in localStorage)
 *   - Stores no PII — x/y as percentages, anonymous session ID
 *   - Batches and flushes to /api/heatmap every 5 seconds
 *   - Session ID is a random UUID generated per visit, never persisted beyond sessionStorage
 */
export default function HeatmapTracker({ siteId, path }: Props) {
  const [consented, setConsented] = useState(false)
  const buffer = useRef<any[]>([])
  const sessionId = useRef<string>('')

  useEffect(() => {
    // Check consent
    try {
      const consent = localStorage.getItem(CONSENT_KEY)
      if (consent !== '1') return
      setConsented(true)
    } catch { return }

    // Generate or retrieve anonymous session ID
    try {
      let sid = sessionStorage.getItem(SESSION_KEY)
      if (!sid) {
        sid = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
        sessionStorage.setItem(SESSION_KEY, sid)
      }
      sessionId.current = sid
    } catch { sessionId.current = Math.random().toString(36).slice(2) }
  }, [])

  // Attach event listeners when consented
  useEffect(() => {
    if (!consented) return

    let maxScrollDepth = 0

    function handleClick(e: MouseEvent) {
      const x = e.pageX / document.documentElement.scrollWidth
      const y = e.pageY / document.documentElement.scrollHeight
      buffer.current.push({
        event_type: 'click',
        click_x:    Math.max(0, Math.min(1, x)),
        click_y:    Math.max(0, Math.min(1, y)),
        path,
        session_id: sessionId.current,
      })
    }

    function handleScroll() {
      const scrolled  = window.scrollY + window.innerHeight
      const total     = document.documentElement.scrollHeight
      const depth     = Math.min(1, scrolled / total)
      if (depth > maxScrollDepth) {
        maxScrollDepth = depth
      }
    }

    function flush() {
      if (maxScrollDepth > 0) {
        buffer.current.push({
          event_type:   'scroll',
          scroll_depth: maxScrollDepth,
          path,
          session_id:   sessionId.current,
        })
        maxScrollDepth = 0
      }

      if (buffer.current.length === 0) return

      const batch = buffer.current.splice(0, MAX_BATCH)
      fetch('/api/heatmap', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ site_id: siteId, events: batch }),
      }).catch(() => {}) // silent fail
    }

    window.addEventListener('click',  handleClick,  { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    const interval = setInterval(flush, BATCH_DELAY)

    // Flush on page unload
    window.addEventListener('beforeunload', flush)

    return () => {
      window.removeEventListener('click',        handleClick)
      window.removeEventListener('scroll',       handleScroll)
      window.removeEventListener('beforeunload', flush)
      clearInterval(interval)
      flush()
    }
  }, [consented, siteId, path])

  return null // no visible UI
}

/**
 * Helper to grant heatmap consent (call when user accepts analytics).
 * Can be called from a cookie banner or settings page.
 */
export function grantHeatmapConsent(): void {
  try { localStorage.setItem(CONSENT_KEY, '1') } catch { /* storage unavailable */ }
}

/**
 * Helper to revoke heatmap consent.
 */
export function revokeHeatmapConsent(): void {
  try { localStorage.removeItem(CONSENT_KEY) } catch { /* storage unavailable */ }
}

/**
 * Check if consent is currently granted.
 */
export function hasHeatmapConsent(): boolean {
  try { return localStorage.getItem(CONSENT_KEY) === '1' } catch { return false }
}
