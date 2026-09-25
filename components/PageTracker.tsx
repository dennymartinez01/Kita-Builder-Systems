'use client'

import { useEffect } from 'react'

interface PageTrackerProps {
  siteId: string
  path?: string
}

// Fires a non-blocking analytics event on mount.
// If it fails, the site is completely unaffected.
export default function PageTracker({ siteId, path = '/' }: PageTrackerProps) {
  useEffect(() => {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: siteId, path }),
    }).catch(() => {}) // silently ignore any errors
  }, [siteId, path])

  return null // renders nothing
}
