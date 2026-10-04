'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { HeartPulse, RefreshCw, AlertTriangle, AlertCircle, Info, CheckCircle, ExternalLink, LayoutDashboard } from 'lucide-react'
import type { ClientHealthRow, HealthFlag, HealthSeverity } from '@/app/api/admin/health/route'

/**
 * /admin/health — Site Health Monitor
 *
 * What:  Shows every client with at least one health flag,
 *        sorted by severity (high → medium → low).
 * Why:   Lets the operator proactively intervene before a
 *        client churns, goes silent, or forgets to set up.
 * Who:   Admin.
 * Status: Active — Phase 18
 */

const FLAG_LABELS: Record<HealthFlag, { label: string; color: string; icon: string }> = {
  trial_expired:  { label: 'Trial Expired',    color: 'bg-red-900/50 text-red-400',    icon: '⏰' },
  overdue:        { label: 'Overdue',           color: 'bg-red-900/50 text-red-400',    icon: '💳' },
  trial_expiring: { label: 'Trial Expiring',   color: 'bg-yellow-900/50 text-yellow-400', icon: '⚠️' },
  quiet_site:     { label: 'Quiet (30d)',       color: 'bg-orange-900/50 text-orange-400', icon: '🔇' },
  not_onboarded:  { label: 'Not Onboarded',    color: 'bg-blue-900/50 text-blue-400',  icon: '📋' },
  no_site:        { label: 'No Site',           color: 'bg-gray-800 text-gray-400',     icon: '🌐' },
}

const SEV_STYLES: Record<HealthSeverity, { border: string; icon: typeof AlertTriangle; iconColor: string; label: string }> = {
  high:   { border: 'border-red-800/60',    icon: AlertCircle,   iconColor: 'text-red-400',    label: 'High' },
  medium: { border: 'border-yellow-800/40', icon: AlertTriangle, iconColor: 'text-yellow-400', label: 'Medium' },
  low:    { border: 'border-gray-700',      icon: Info,          iconColor: 'text-gray-500',   label: 'Low' },
}

type Filter = 'all' | HealthSeverity

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86_400_000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}

export default function HealthPage() {
  const [rows, setRows]       = useState<ClientHealthRow[]>([])
  const [summary, setSummary] = useState({ total: 0, high: 0, medium: 0, low: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<Filter>('all')
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const res  = await fetch('/api/admin/health')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setRows(data.rows ?? [])
      setSummary(data.summary ?? { total: 0, high: 0, medium: 0, low: 0 })
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'all' ? rows : rows.filter(r => r.severity === filter)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <HeartPulse size={24} className="text-red-400" /> Site Health Monitor
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Clients that need attention — flagged automatically.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/50 text-red-300 text-sm rounded-xl px-4 py-3">{error}</div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Flagged', value: summary.total,  color: 'text-white',        bg: 'bg-gray-900 border-gray-800' },
          { label: 'High',          value: summary.high,   color: 'text-red-400',      bg: 'bg-red-950/20 border-red-800/40' },
          { label: 'Medium',        value: summary.medium, color: 'text-yellow-400',   bg: 'bg-yellow-950/20 border-yellow-800/40' },
          { label: 'Low',           value: summary.low,    color: 'text-gray-400',     bg: 'bg-gray-900 border-gray-800' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl px-3 py-2.5 ${s.bg}`}>
            <p className="text-gray-600 text-xs mb-0.5">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>
              {loading ? <span className="text-gray-700">—</span> : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(['all', 'high', 'medium', 'low'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-4 py-2 rounded-lg transition capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' ? `All (${summary.total})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${summary[f]})`}
          </button>
        ))}
      </div>

      {/* Client cards */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle size={36} className="text-green-500 mx-auto mb-3" />
          <p className="text-white font-semibold">All clear!</p>
          <p className="text-gray-500 text-sm mt-1">No flagged clients{filter !== 'all' ? ` at ${filter} severity` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(row => {
            const sev = SEV_STYLES[row.severity]
            const SevIcon = sev.icon
            return (
              <div key={row.client_id} className={`bg-gray-900 border ${sev.border} rounded-2xl p-5 space-y-3`}>
                {/* Row 1 — identity + severity + quick links */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <SevIcon size={16} className={`${sev.iconColor} shrink-0 mt-0.5`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-semibold text-sm">{row.client_name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${
                          row.severity === 'high'   ? 'bg-red-900/50 text-red-400' :
                          row.severity === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-gray-800 text-gray-500'
                        }`}>{sev.label}</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5">{row.client_email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Link
                      href={`/admin/clients/${row.client_id}`}
                      className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition font-medium"
                    >
                      <LayoutDashboard size={11} /> View Client
                    </Link>
                  </div>
                </div>

                {/* Row 2 — flags */}
                <div className="flex flex-wrap gap-2">
                  {row.flags.map(flag => {
                    const fl = FLAG_LABELS[flag]
                    let extra = ''
                    if (flag === 'trial_expiring' && row.trial_ends_at) {
                      const d = daysUntil(row.trial_ends_at)
                      extra = ` (${d}d left)`
                    }
                    if (flag === 'trial_expired' && row.trial_ends_at) {
                      extra = ` (${timeAgo(row.trial_ends_at)})`
                    }
                    return (
                      <span key={flag} className={`text-xs px-2 py-0.5 rounded-full font-medium ${fl.color}`}>
                        {fl.icon} {fl.label}{extra}
                      </span>
                    )
                  })}
                </div>

                {/* Row 3 — sites + plan pill */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    row.subscription_plan === 'agency'  ? 'bg-purple-900/50 text-purple-400' :
                    row.subscription_plan === 'growth'  ? 'bg-green-900/50 text-green-400' :
                    row.subscription_plan === 'starter' ? 'bg-blue-900/50 text-blue-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>{row.subscription_plan}</span>
                  <span className="text-gray-600 text-xs">·</span>
                  <span className="text-gray-500 text-xs capitalize">{row.subscription_status}</span>
                  <span className="text-gray-600 text-xs">·</span>
                  <span className="text-gray-500 text-xs">joined {timeAgo(row.created_at)}</span>
                  {row.sites.length > 0 && (
                    <>
                      <span className="text-gray-600 text-xs">·</span>
                      <div className="flex gap-2 flex-wrap">
                        {row.sites.map(s => (
                          <div key={s.id} className="flex items-center gap-1.5">
                            <span className="text-gray-400 text-xs">{s.business_name}</span>
                            <a href={`/${s.slug}`} target="_blank" className="text-gray-600 hover:text-blue-400 transition" title="View site">
                              <ExternalLink size={10} />
                            </a>
                            <a href={`/${s.slug}/dashboard`} target="_blank" className="text-gray-600 hover:text-green-400 transition" title="Owner dashboard">
                              <LayoutDashboard size={10} />
                            </a>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
