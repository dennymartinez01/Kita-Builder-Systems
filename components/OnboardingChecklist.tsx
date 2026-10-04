'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * OnboardingChecklist
 *
 * What:  Shows the 6-step onboarding checklist to the business owner
 *        on their /{slug}/dashboard after they log in.
 * Why:   Drives self-serve setup without the admin having to chase them.
 *        Disappears automatically once all steps are done.
 * Who:   Site owner (shown on owner dashboard, dismissed when complete).
 * Status: Active — Phase 19
 */

interface Props {
  siteId:       string
  primaryColor: string
}

interface Step {
  key:          string
  label:        string
  description:  string
  icon:         string
  completed:    boolean
  completed_at: string | null
}

export default function OnboardingChecklist({ siteId, primaryColor }: Props) {
  const [steps, setSteps]         = useState<Step[]>([])
  const [percent, setPercent]     = useState(0)
  const [allDone, setAllDone]     = useState(false)
  const [loading, setLoading]     = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [clientId, setClientId]   = useState<string | null>(null)

  // Resolve client_id from siteId then fetch onboarding steps
  const load = useCallback(async () => {
    setLoading(true)
    try {
      // Get client_id from the site record via Supabase public client
      const { supabase } = await import('@/lib/supabase')
      const { data: site } = await supabase
        .from('sites')
        .select('client_id')
        .eq('id', siteId)
        .single()

      if (!site?.client_id) { setLoading(false); return }
      setClientId(site.client_id)

      const res  = await fetch(`/api/clients/${site.client_id}/onboarding`)
      const data = await res.json()
      if (res.ok) {
        setSteps(data.steps ?? [])
        setPercent(data.percent ?? 0)
        setAllDone(data.all_done ?? false)
      }
    } catch { /* silently skip */ }
    finally { setLoading(false) }
  }, [siteId])

  useEffect(() => { load() }, [load])

  // Don't render while loading or if all done
  if (loading || allDone || !clientId || steps.length === 0) return null

  const completed = steps.filter(s => s.completed).length

  return (
    <div
      className="rounded-2xl border overflow-hidden mb-5"
      style={{ borderColor: `${primaryColor}30`, backgroundColor: `${primaryColor}08` }}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">🚀</span>
          <div>
            <p className="text-sm font-bold" style={{ color: primaryColor }}>
              Get started — {completed}/{steps.length} steps done
            </p>
            {/* Progress bar */}
            <div className="h-1.5 w-40 bg-gray-200 rounded-full overflow-hidden mt-1">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${percent}%`, backgroundColor: primaryColor }}
              />
            </div>
          </div>
        </div>
        {collapsed
          ? <ChevronDown size={16} className="text-gray-400" />
          : <ChevronUp   size={16} className="text-gray-400" />
        }
      </button>

      {/* Step list */}
      {!collapsed && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {steps.map(step => (
            <div key={step.key} className="flex items-center gap-3 px-4 py-3">
              {/* Checkbox */}
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                step.completed
                  ? 'border-transparent'
                  : 'border-gray-300'
              }`} style={step.completed ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}>
                {step.completed && <CheckCircle size={12} className="text-white" />}
              </div>
              <span className="text-base shrink-0" aria-hidden>{step.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {step.label}
                </p>
                {!step.completed && (
                  <p className="text-xs text-gray-400 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
