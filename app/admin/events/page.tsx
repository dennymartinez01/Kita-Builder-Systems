'use client'

import { useEffect, useState, useCallback } from 'react'
import { Activity, RefreshCw, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { CATEGORY_COLORS, CATEGORY_ICONS, SEVERITY_COLORS } from '@/lib/events'
import type { PlatformEvent } from '@/types/database'

const CATEGORIES = ['booking', 'site', 'client', 'subscription', 'entitlement', 'payment', 'auth', 'system']
const SEVERITIES = ['info', 'warning', 'error', 'critical']
const PAGE_SIZE  = 50

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60)   return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)   return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)   return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

export default function EventsPage() {
  const [events, setEvents]     = useState<PlatformEvent[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(0)

  // Filters
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('limit',  String(PAGE_SIZE))
      params.set('offset', String(page * PAGE_SIZE))
      if (category) params.set('category', category)
      if (severity) params.set('severity', severity)
      if (dateFrom) params.set('from', new Date(dateFrom).toISOString())
      if (dateTo)   params.set('to',   new Date(dateTo + 'T23:59:59').toISOString())

      const res  = await fetch(`/api/events?${params}`)
      const data = await res.json()
      if (res.ok) {
        setEvents(data.events)
        setTotal(data.total)
      }
    } finally {
      setLoading(false)
    }
  }, [page, category, severity, dateFrom, dateTo])

  useEffect(() => { loadEvents() }, [loadEvents])

  // Reset page when filters change
  function applyFilter(fn: () => void) {
    setPage(0)
    fn()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-blue-400" size={24} />
            Activity &amp; Events
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Every meaningful platform action — bookings, payments, entitlement changes, and more.
          </p>
        </div>
        <button
          onClick={loadEvents}
          disabled={loading}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={13} className="text-gray-500" />
          <span className="text-gray-400 text-xs font-medium">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* Category */}
          <select
            value={category}
            onChange={e => applyFilter(() => setCategory(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>

          {/* Severity */}
          <select
            value={severity}
            onChange={e => applyFilter(() => setSeverity(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="">All Severities</option>
            {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Date from */}
          <input
            type="date"
            value={dateFrom}
            onChange={e => applyFilter(() => setDateFrom(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          />

          {/* Date to */}
          <input
            type="date"
            value={dateTo}
            onChange={e => applyFilter(() => setDateTo(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          />

          {/* Clear */}
          {(category || severity || dateFrom || dateTo) && (
            <button
              onClick={() => { setCategory(''); setSeverity(''); setDateFrom(''); setDateTo(''); setPage(0) }}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-3 py-2 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-500 text-xs">
          {loading ? 'Loading...' : `${total.toLocaleString()} event${total !== 1 ? 's' : ''}`}
          {(category || severity) && ' · filtered'}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="p-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-400 rounded-lg transition"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-gray-500 text-xs">{page + 1} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="p-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-400 rounded-lg transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Event feed */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-gray-600 text-sm">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-gray-600 text-sm">
            {total === 0 && !category && !severity
              ? <div>
                  <p className="mb-2">No events yet.</p>
                  <p className="text-xs text-gray-700">Run <code className="font-mono text-gray-500">supabase/events.sql</code> in Supabase to enable the event stream.</p>
                </div>
              : 'No events match your filters.'
            }
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {events.map(event => (
              <div key={event.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-gray-800/30 transition group">
                {/* Category icon */}
                <div className="text-lg shrink-0 mt-0.5 w-6 text-center">
                  {CATEGORY_ICONS[event.category] ?? '⚙️'}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className={`text-xs font-mono font-semibold ${CATEGORY_COLORS[event.category] ?? 'text-gray-400'}`}>
                      {event.event_type}
                    </span>
                    {event.severity !== 'info' && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SEVERITY_COLORS[event.severity]}`}>
                        {event.severity}
                      </span>
                    )}
                    {event.actor_type && (
                      <span className="text-xs text-gray-600">
                        by {event.actor_type}{event.actor_id ? ` · ${event.actor_id}` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">{event.summary}</p>

                  {/* Metadata — shown on hover */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="hidden group-hover:flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      {Object.entries(event.metadata).slice(0, 6).map(([k, v]) => (
                        v != null && (
                          <span key={k} className="text-gray-600 text-xs font-mono">
                            <span className="text-gray-700">{k}:</span> {String(v)}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="shrink-0 text-right">
                  <p className="text-gray-600 text-xs">{formatRelativeTime(event.occurred_at)}</p>
                  <p className="text-gray-700 text-xs mt-0.5">
                    {new Date(event.occurred_at).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Setup reminder */}
      <div className="mt-4 bg-yellow-950/30 border border-yellow-900/40 rounded-xl p-3">
        <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Setup Required</p>
        <p className="text-yellow-200/50 text-xs">
          Run <code className="font-mono text-yellow-300">supabase/events.sql</code> in your Supabase SQL Editor to create the events table. Once done, all platform actions will be logged automatically.
        </p>
      </div>
    </div>
  )
}
