'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, ChevronLeft, CheckCircle, Loader2, ExternalLink, LayoutDashboard, AlertCircle, RefreshCw } from 'lucide-react'
import { BUSINESS_TYPE_ICONS, BUSINESS_TYPE_LABELS } from '@/lib/templates'
import type { BusinessType } from '@/types/database'

// ── Demo configurations ───────────────────────────────────────
// Realistic demo business names per niche
const DEMO_NAMES: Record<BusinessType, string[]> = {
  salon:    ['Glow Hair Studio', 'The Barber Society', 'Silk & Scissors'],
  clinic:   ['Bright Smile Dental', 'City Health Clinic', 'Wellbeing Medical'],
  pet:      ['Happy Paws Vet', 'Furever Grooming', 'Pet Paradise Clinic'],
  cafe:     ['The Daily Grind', 'Bean & Brew Cafe', 'Morning Light Coffee'],
  mechanic: ["Jim's Auto Repair", 'Speed Garage', 'TurboFix Workshop'],
}

const BUSINESS_TYPES: BusinessType[] = ['salon', 'clinic', 'pet', 'cafe', 'mechanic']

const PRESET_LOCATIONS = [
  { label: 'Sydney, AU',       value: 'Sydney, Australia' },
  { label: 'Melbourne, AU',    value: 'Melbourne, Australia' },
  { label: 'Manila, PH',       value: 'Manila, Philippines' },
  { label: 'Cebu, PH',         value: 'Cebu, Philippines' },
  { label: 'Los Angeles, US',  value: 'Los Angeles, United States' },
  { label: 'London, UK',       value: 'London, United Kingdom' },
  { label: 'Auckland, NZ',     value: 'Auckland, New Zealand' },
]

// ── Types ─────────────────────────────────────────────────────
type JobStatus = 'idle' | 'queued' | 'generating' | 'done' | 'error'

interface DemoJob {
  id: string
  business_type: BusinessType
  business_name: string
  location: string
  status: JobStatus
  slug?: string
  error?: string
}

// ── Component ─────────────────────────────────────────────────
export default function BulkGeneratePage() {
  const [selectedTypes, setSelectedTypes] = useState<Set<BusinessType>>(
    new Set(['salon', 'clinic', 'pet', 'cafe', 'mechanic'])
  )
  const [location, setLocation]       = useState('Sydney, Australia')
  const [customLocation, setCustom]   = useState('')
  const [jobs, setJobs]               = useState<DemoJob[]>([])
  const [running, setRunning]         = useState(false)
  const [allDone, setAllDone]         = useState(false)

  function toggleType(t: BusinessType) {
    if (running) return
    setSelectedTypes(prev => {
      const next = new Set(prev)
      if (next.has(t)) { if (next.size > 1) next.delete(t) }
      else             { if (next.size < 5)  next.add(t) }
      return next
    })
  }

  function buildJobs(): DemoJob[] {
    const loc = customLocation.trim() || location
    return Array.from(selectedTypes).map(type => ({
      id:            `${type}-${Date.now()}`,
      business_type: type,
      business_name: DEMO_NAMES[type][0],
      location:      loc,
      status:        'queued' as JobStatus,
    }))
  }

  function setJobStatus(id: string, patch: Partial<DemoJob>) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j))
  }

  async function runGeneration() {
    const newJobs = buildJobs()
    setJobs(newJobs)
    setRunning(true)
    setAllDone(false)

    for (const job of newJobs) {
      setJobStatus(job.id, { status: 'generating' })
      try {
        const res = await fetch('/api/generate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_name: job.business_name,
            business_type: job.business_type,
            location:      job.location,
            owner_email:   '',
            extra_notes:   'This is a demo site for outreach purposes.',
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Generation failed')
        setJobStatus(job.id, { status: 'done', slug: data.slug })
      } catch (err: any) {
        setJobStatus(job.id, { status: 'error', error: err.message })
      }
    }

    setRunning(false)
    setAllDone(true)
  }

  function reset() {
    setJobs([])
    setAllDone(false)
  }

  const doneCount  = jobs.filter(j => j.status === 'done').length
  const errorCount = jobs.filter(j => j.status === 'error').length
  const loc        = customLocation.trim() || location

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/generate" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-3 transition">
          <ChevronLeft size={12} /> Back to Generate
        </Link>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" size={24} />
          Bulk Demo Generator
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Generate up to 5 demo sites across different niches in one click — perfect for client outreach.
        </p>
      </div>

      {jobs.length === 0 ? (
        /* ── SETUP SCREEN ── */
        <div className="space-y-6">
          {/* Niche selector */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-1">Select Niches</h2>
            <p className="text-gray-500 text-xs mb-4">Pick 1–5 business types. One demo site per niche.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BUSINESS_TYPES.map(type => {
                const isSelected = selectedTypes.has(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition text-left ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{BUSINESS_TYPE_ICONS[type]}</span>
                    <div>
                      <p className="text-xs font-semibold leading-tight">
                        {BUSINESS_TYPE_LABELS[type].split('/')[0].trim()}
                      </p>
                      <p className="text-xs opacity-60 leading-tight truncate max-w-[90px]">
                        {DEMO_NAMES[type][0]}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
            <p className="text-gray-600 text-xs mt-3">{selectedTypes.size} of 5 niches selected</p>
          </div>

          {/* Location */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-1">Demo Location</h2>
            <p className="text-gray-500 text-xs mb-4">AI uses this to generate realistic local pricing and copy.</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {PRESET_LOCATIONS.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => { setLocation(p.value); setCustom('') }}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition ${
                    location === p.value && !customLocation
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div>
              <label className="text-gray-500 text-xs block mb-1.5">Or enter a custom location</label>
              <input
                value={customLocation}
                onChange={e => setCustom(e.target.value)}
                placeholder="e.g. Toronto, Canada"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-3">What will be generated</h2>
            <div className="space-y-2">
              {Array.from(selectedTypes).map(type => (
                <div key={type} className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
                  <span className="text-xl">{BUSINESS_TYPE_ICONS[type]}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{DEMO_NAMES[type][0]}</p>
                    <p className="text-gray-500 text-xs">{BUSINESS_TYPE_LABELS[type]} · {loc}</p>
                  </div>
                  <span className="text-gray-600 text-xs">~10s</span>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-xs mt-3">
              Total estimated time: ~{selectedTypes.size * 12} seconds · Sites will be live immediately.
            </p>
          </div>

          <button
            onClick={runGeneration}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 text-sm transition"
          >
            <Zap size={16} />
            Generate {selectedTypes.size} Demo Site{selectedTypes.size > 1 ? 's' : ''}
          </button>
        </div>
      ) : (
        /* ── PROGRESS SCREEN ── */
        <div className="space-y-4">
          {/* Overall progress */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm">
                {allDone
                  ? `${doneCount} site${doneCount !== 1 ? 's' : ''} generated${errorCount > 0 ? `, ${errorCount} failed` : ''} ✓`
                  : `Generating ${jobs.length} sites...`
                }
              </h2>
              {running && <Loader2 size={16} className="text-blue-400 animate-spin" />}
            </div>

            {/* Progress bar */}
            <div className="bg-gray-800 rounded-full h-2 mb-1">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round(((doneCount + errorCount) / jobs.length) * 100)}%`,
                  backgroundColor: errorCount > 0 && doneCount === 0 ? '#ef4444' : '#2563eb',
                }}
              />
            </div>
            <p className="text-gray-600 text-xs">{doneCount + errorCount} / {jobs.length} complete</p>
          </div>

          {/* Per-job status */}
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className={`bg-gray-900 border rounded-2xl p-4 transition ${
                job.status === 'generating' ? 'border-blue-700' :
                job.status === 'done'       ? 'border-green-800' :
                job.status === 'error'      ? 'border-red-800' :
                'border-gray-800'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{BUSINESS_TYPE_ICONS[job.business_type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{job.business_name}</p>
                    <p className="text-gray-500 text-xs">{job.location}</p>
                  </div>
                  <div className="shrink-0">
                    {job.status === 'queued' && (
                      <span className="text-gray-600 text-xs">Queued</span>
                    )}
                    {job.status === 'generating' && (
                      <div className="flex items-center gap-1.5 text-blue-400 text-xs">
                        <Loader2 size={13} className="animate-spin" />
                        Generating...
                      </div>
                    )}
                    {job.status === 'done' && (
                      <CheckCircle size={18} className="text-green-400" />
                    )}
                    {job.status === 'error' && (
                      <AlertCircle size={18} className="text-red-400" />
                    )}
                  </div>
                </div>

                {/* Done — show links */}
                {job.status === 'done' && job.slug && (
                  <div className="flex gap-2 mt-3">
                    <a
                      href={`/${job.slug}`}
                      target="_blank"
                      className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition"
                    >
                      <ExternalLink size={11} /> View Site
                    </a>
                    <a
                      href={`/${job.slug}/dashboard`}
                      target="_blank"
                      className="flex items-center gap-1.5 bg-green-900/40 hover:bg-green-900/70 text-green-400 text-xs px-3 py-1.5 rounded-lg transition"
                    >
                      <LayoutDashboard size={11} /> Dashboard
                    </a>
                    <span className="text-gray-600 text-xs self-center font-mono">PIN: 1234</span>
                  </div>
                )}

                {/* Error */}
                {job.status === 'error' && (
                  <p className="text-red-400 text-xs mt-2">{job.error}</p>
                )}
              </div>
            ))}
          </div>

          {/* Actions after completion */}
          {allDone && (
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-medium transition"
              >
                <RefreshCw size={14} /> Generate More
              </button>
              <Link
                href="/admin/sites"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium transition text-center flex items-center justify-center"
              >
                View All Sites →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
