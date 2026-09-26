'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Loader2, Globe, CheckCircle, XCircle, Clock, RefreshCw, ChevronRight, Shield, Zap, BarChart2, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface AuditSummary {
  id: string
  url: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  scores: { overall?: number; performance?: number; seo?: number; security?: number; accessibility?: number }
  created_at: string
}

function ScoreBadge({ score }: { score?: number }) {
  if (score === undefined || score === null) return <span className="text-gray-600 text-xs">—</span>
  const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
  return <span className={`font-bold text-sm ${color}`}>{score}</span>
}

// Show trend vs previous audit of same URL
function ScoreTrend({ current, previous }: { current?: number; previous?: number }) {
  if (!current || !previous) return null
  const diff = current - previous
  if (Math.abs(diff) < 2) return <Minus size={10} className="text-gray-500" />
  if (diff > 0) return <span className="text-green-400 text-xs flex items-center gap-0.5"><TrendingUp size={10} />+{diff}</span>
  return <span className="text-red-400 text-xs flex items-center gap-0.5"><TrendingDown size={10} />{diff}</span>
}

function StatusBadge({ status }: { status: AuditSummary['status'] }) {
  const map = {
    completed: { label: 'Completed', color: 'bg-green-900/50 text-green-400', icon: CheckCircle },
    failed:    { label: 'Failed',    color: 'bg-red-900/50 text-red-400',     icon: XCircle },
    running:   { label: 'Running',   color: 'bg-blue-900/50 text-blue-400',   icon: Loader2 },
    queued:    { label: 'Queued',    color: 'bg-gray-800 text-gray-400',      icon: Clock },
  }
  const { label, color, icon: Icon } = map[status] || map.queued
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      <Icon size={10} className={status === 'running' ? 'animate-spin' : ''} />
      {label}
    </span>
  )
}

export default function AuditPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [audits, setAudits] = useState<AuditSummary[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { loadHistory() }, [])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => loadHistory(search), 300)
    return () => clearTimeout(t)
  }, [search])

  async function loadHistory(q = '') {
    setLoadingHistory(true)
    try {
      const params = new URLSearchParams({ limit: '30' })
      if (q) params.set('search', q)
      const res = await fetch(`/api/audit?${params}`)
      const data = await res.json()
      setAudits(data.audits || [])
    } catch { /* silent */ }
    finally { setLoadingHistory(false) }
  }

  async function deleteAudit(id: string, e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this audit? This cannot be undone.')) return
    setDeleting(id)
    try {
      await fetch(`/api/audit?id=${id}`, { method: 'DELETE' })
      setAudits(prev => prev.filter(a => a.id !== id))
    } finally { setDeleting(null) }
  }

  // Build previous score map for trend comparison (same URL, older audit)
  const prevScores: Record<string, AuditSummary['scores']> = {}
  audits.forEach((audit, i) => {
    const prev = audits.slice(i + 1).find(a => a.url === audit.url && a.status === 'completed')
    if (prev) prevScores[audit.id] = prev.scores
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Audit failed')
      // Redirect to the results page
      window.location.href = `/audit/${data.id}`
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="text-blue-400" size={24} />
          Website Intelligence & Audit
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Enter any URL to get a full performance, SEO, security, and accessibility audit.
        </p>
      </div>

      {/* URL Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-2">Website URL to audit</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={loading}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 text-sm transition whitespace-nowrap"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Auditing...</>
                ) : (
                  <><Search size={16} /> Run Audit</>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {loading && (
            <div className="bg-blue-950/30 border border-blue-900/40 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 size={16} className="text-blue-400 animate-spin" />
                <span className="text-blue-300 text-sm font-medium">Running full audit... (~15-30 seconds)</span>
              </div>
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2"><Zap size={11} className="text-yellow-400" /> Fetching PageSpeed Insights...</div>
                <div className="flex items-center gap-2"><Search size={11} className="text-blue-400" /> Analyzing SEO tags...</div>
                <div className="flex items-center gap-2"><Shield size={11} className="text-green-400" /> Checking security headers...</div>
                <div className="flex items-center gap-2"><BarChart2 size={11} className="text-purple-400" /> Detecting tech stack...</div>
              </div>
            </div>
          )}
        </form>

        {/* Quick example URLs */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-gray-600 text-xs">Try:</span>
          {['https://example.com', 'https://google.com', 'https://github.com'].map(ex => (
            <button
              key={ex}
              onClick={() => setUrl(ex)}
              className="text-gray-500 hover:text-blue-400 text-xs underline transition"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* What we check */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Zap, label: 'Performance', desc: 'LCP, CLS, FCP, TTFB via Google PSI', color: 'text-yellow-400' },
          { icon: Search, label: 'SEO', desc: 'Title, meta, headings, OG tags, canonical', color: 'text-blue-400' },
          { icon: Shield, label: 'Security', desc: 'HTTPS, HSTS, CSP, X-Frame-Options', color: 'text-green-400' },
          { icon: BarChart2, label: 'Accessibility', desc: 'Alt text, labels, heading order, lang', color: 'text-purple-400' },
        ].map(item => {
          const Icon = item.icon
          return (
            <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <Icon size={18} className={`${item.color} mb-2`} />
              <p className="text-white text-sm font-semibold">{item.label}</p>
              <p className="text-gray-600 text-xs mt-0.5">{item.desc}</p>
            </div>
          )
        })}
      </div>

      {/* Audit History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Recent Audits</h2>
          <button onClick={() => loadHistory(search)} className="text-gray-600 hover:text-gray-400 transition">
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by URL..."
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
          />
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {loadingHistory ? (
            <div className="text-center py-8 text-gray-600 text-sm">Loading history...</div>
          ) : audits.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              <Search size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{search ? `No audits matching "${search}"` : 'No audits yet. Enter a URL above to get started.'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">URL</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden sm:table-cell">Status</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 text-xs hidden md:table-cell">Perf</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 text-xs hidden md:table-cell">SEO</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 text-xs hidden md:table-cell">Sec</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 text-xs hidden lg:table-cell">A11y</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 text-xs">Overall</th>
                  <th className="text-center text-gray-500 font-medium px-3 py-3 text-xs hidden lg:table-cell">Trend</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-xs"></th>
                </tr>
              </thead>
              <tbody>
                {audits.map(audit => (
                  <tr key={audit.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition">
                    <td className="px-4 py-3 max-w-[180px]">
                      <span className="text-gray-300 text-xs font-mono truncate block">{audit.url}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <StatusBadge status={audit.status} />
                    </td>
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      <ScoreBadge score={audit.scores?.performance} />
                    </td>
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      <ScoreBadge score={audit.scores?.seo} />
                    </td>
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      <ScoreBadge score={audit.scores?.security} />
                    </td>
                    <td className="px-3 py-3 text-center hidden lg:table-cell">
                      <ScoreBadge score={audit.scores?.accessibility} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <ScoreBadge score={audit.scores?.overall} />
                    </td>
                    <td className="px-3 py-3 text-center hidden lg:table-cell">
                      <ScoreTrend current={audit.scores?.overall} previous={prevScores[audit.id]?.overall} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-gray-600 text-xs">{new Date(audit.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {audit.status === 'completed' && (
                          <Link href={`/audit/${audit.id}`} className="text-blue-400 hover:text-blue-300 transition">
                            <ChevronRight size={16} />
                          </Link>
                        )}
                        <button
                          onClick={e => deleteAudit(audit.id, e)}
                          disabled={deleting === audit.id}
                          className="text-gray-700 hover:text-red-400 transition disabled:opacity-50"
                        >
                          {deleting === audit.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
