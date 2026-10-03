'use client'

import { useEffect, useState } from 'react'
import { Eye, X, ArrowLeft } from 'lucide-react'
import { getImpersonationSession, endImpersonation } from '@/lib/impersonation'
import type { ImpersonationSession } from '@/lib/impersonation'

/**
 * ImpersonationBanner — sticky banner shown at the top of the owner
 * dashboard when an admin is viewing as a client.
 *
 * Always visible. Cannot be dismissed (only Exit can remove it).
 * Clicking Exit clears the session and returns to the admin panel.
 */
export default function ImpersonationBanner() {
  const [session, setSession] = useState<ImpersonationSession | null>(null)

  useEffect(() => {
    setSession(getImpersonationSession())
  }, [])

  if (!session) return null

  function handleExit() {
    endImpersonation()
    // Navigate back to the client 360 profile if we have a clientId,
    // otherwise go to the admin sites list
    const returnUrl = session?.clientId
      ? `/admin/clients/${session.clientId}`
      : '/admin/sites'
    window.location.href = returnUrl
  }

  return (
    <div className="sticky top-0 z-50 bg-purple-700 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-2 min-w-0">
        <Eye size={15} className="shrink-0" />
        <span className="text-sm font-semibold truncate">
          Admin View — {session.businessName}
        </span>
        <span className="text-purple-200 text-xs hidden sm:inline">
          · You are viewing this dashboard as the site owner
        </span>
      </div>
      <button
        onClick={handleExit}
        className="shrink-0 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
      >
        <ArrowLeft size={12} />
        Exit Client View
      </button>
    </div>
  )
}
