'use client'

import { useEffect } from 'react'
import { parseUTM, saveAttribution } from '@/lib/attribution'

/**
 * AttributionTracker — drop into any page to silently capture UTM params.
 * Renders nothing visible. Runs once on mount.
 * Uses first-touch model: only saves if no attribution already stored this session.
 */
export default function AttributionTracker() {
  useEffect(() => {
    const data = parseUTM()
    saveAttribution(data)
  }, [])

  return null
}
