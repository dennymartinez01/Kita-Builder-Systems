'use client'

import { useEffect, useState } from 'react'
import {
  grantHeatmapConsent,
  revokeHeatmapConsent,
  hasHeatmapConsent,
} from '@/components/HeatmapTracker'

const DISMISSED_KEY = 'kita_consent_dismissed'

interface Props {
  /** Brand primary colour — passed from the server-rendered site theme */
  primaryColor: string
  /** Business name shown in the banner copy */
  businessName: string
}

/**
 * ConsentBanner
 *
 * What:  A bottom-of-screen cookie/analytics consent bar shown on every
 *        client-facing public site page.
 * Why:   GDPR / privacy-best-practice — HeatmapTracker will not fire until
 *        the visitor explicitly opts in.  Declining still dismisses the bar
 *        permanently (stored in localStorage) so it never re-appears.
 * Who:   Visitors on /<slug> public pages.
 * Status: Active — Phase 14
 */
export default function ConsentBanner({ primaryColor, businessName }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Already consented or dismissed → never show
    try {
      if (
        localStorage.getItem(DISMISSED_KEY) === '1' ||
        hasHeatmapConsent()
      ) return
    } catch { return }

    // Small delay so the page paint settles before the banner slides in
    const t = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(t)
  }, [])

  function accept() {
    grantHeatmapConsent()
    dismiss()
  }

  function decline() {
    revokeHeatmapConsent()
    dismiss()
  }

  function dismiss() {
    try { localStorage.setItem(DISMISSED_KEY, '1') } catch { /* noop */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Analytics consent"
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 pointer-events-none"
    >
      <div
        className="pointer-events-auto max-w-2xl mx-auto rounded-2xl shadow-2xl border border-white/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5"
        style={{ backgroundColor: primaryColor }}
      >
        {/* Icon + copy */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="text-2xl shrink-0 mt-0.5" aria-hidden>🍪</span>
          <p className="text-white/90 text-sm leading-relaxed">
            <span className="font-semibold text-white">{businessName}</span> uses
            anonymous analytics to improve your experience. No personal data is
            collected.{' '}
            <button
              onClick={decline}
              className="underline underline-offset-2 text-white/70 hover:text-white transition text-sm"
            >
              Decline
            </button>
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-full text-xs font-semibold border border-white/30 text-white/80 hover:bg-white/10 transition"
          >
            No thanks
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 rounded-full text-xs font-bold transition hover:opacity-90 active:scale-95"
            style={{ backgroundColor: 'white', color: primaryColor }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
