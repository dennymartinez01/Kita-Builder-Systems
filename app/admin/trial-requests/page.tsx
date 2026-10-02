'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ClipboardList, RefreshCw, CheckCircle, XCircle,
  Eye, Loader2, ExternalLink, Clock, ChevronDown,
} from 'lucide-react'
import type { TrialRequest, TrialRequestStatus } from '@/types/database'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:      { label: 'Pending',      color: 'bg-yellow-900/50 text-yellow-400' },
  under_review: { label: 'Under Review', color: 'bg-blue-900/50 text-blue-400' },
  approved:     { label: 'Approved',     color: 'bg-green-900/50 text-green-400' },
  rejected:     { label: 'Rejected',     color: 'bg-red-900/50 text-red-400' },
  activated:    { label: 'Activated',    color: 'bg-green-900/50 text-green-300' },
  expired:      { label: 'Expired',      color: 'bg-gray-800 text-gray-500' },
  converted:    { label: 'Converted',    color: 'bg-purple-900/50 text-purple-400' },
  cancelled:    { label: 'Cancelled',    color: 'bg-gray-800 text-gray-500' },
}

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-blue-900/50 text-blue-400',
  growth:  'bg-green-900/50 text-green-400',
  agency:  'bg-purple-900/50 text-purple-400',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function TrialRequestsPage() {
  const [requests, setRequests]     = useState<TrialRequest[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionStatus, setActionStatus]   = useState<Record<string, { type: 'success' | 'error'; msg: string }>>({})

  // Per-request action form state
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({})
  const [adminNotes, setAdminNotes]     = useState<Record<string, string>>({})
  const [extendDays, setExtendDays]     = useState<Record<string, number>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (statusFilter) params.set('status', statusFilter)
      const res  = await fetch(`/api/trial-request?${params}`)
      const data = await res.json()
      if (res.ok) {
        setRequests(data.requests ?? [])
        setTotal(data.total ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  async function doAction(id: string, action: 'approve' | 'reject' | 'review') {
    setActionLoading(id + action)
    try {
      const body: any = { action }
      if (action === 'reject' && rejectReason[id]) body.rejection_reason = rejectReason[id]
      if (adminNotes[id]) body.admin_notes = adminNotes[id]
      if (action === 'approve' && extendDays[id]) body.trial_duration_days = extendDays[id]

      const res  = await fetch(`/api/trial-request/${id}/action`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Action failed')

      setActionStatus(prev => ({ ...prev, [id]: { type: 'success', msg: `${action} successful. ${action === 'approve' ? 'Welcome email sent.' : ''}` } }))
      setTimeout(() => {
        setActionStatus(prev => { const n = { ...prev }; delete n[id]; return n })
        load() // refresh list
      }, 2500)
    } catch (err: any) {
      setActionStatus(prev => ({ ...prev, [id]: { type: 'error', msg: err.message } }))
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="text-blue-400" size={24} />
            Trial Requests
            {pendingCount > 0 && (
              <span className="bg-yellow-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Review and approve incoming trial account requests.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <a
            href="/trial"
            target="_blank"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition"
          >
            <ExternalLink size={13} />
            View Form
          </a>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit flex-wrap">
        {['pending', 'under_review', 'approved', 'rejected', 'all'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s === 'all' ? '' : s)}
            className={`text-xs font-medium px-3 py-2 rounded-lg transition capitalize ${
              (s === 'all' ? !statusFilter : statusFilter === s)
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-600 text-sm">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <p className="text-gray-500 text-sm mb-2">No {statusFilter || ''} requests found.</p>
          <p className="text-gray-700 text-xs">
            Share <code className="font-mono text-gray-600">/trial</code> with prospects to receive requests.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const isExpanded = expanded === r.id
            const st = actionStatus[r.id]
            const statusCfg = STATUS_CONFIG[r.status] ?? { label: r.status, color: 'bg-gray-800 text-gray-400' }

            return (
              <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Summary row */}
                <div
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-800/30 transition"
                  onClick={() => setExpanded(isExpanded ? null : r.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-white font-semibold text-sm">{r.business_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PLAN_COLORS[r.trial_plan] ?? 'bg-gray-800 text-gray-400'}`}>
                        {r.trial_plan} · {r.trial_duration_days}d
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">{r.name} · {r.email} {r.country ? `· ${r.country}` : ''}</p>
                    <p className="text-gray-600 text-xs mt-0.5 capitalize">{r.business_type} · {timeAgo(r.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status === 'pending' && (
                      <>
                        <button
                          onClick={e => { e.stopPropagation(); doAction(r.id, 'approve') }}
                          disabled={!!actionLoading}
                          className="flex items-center gap-1 bg-green-700 hover:bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          {actionLoading === r.id + 'approve' ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                          Approve
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setExpanded(r.id) }}
                          className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                        >
                          <Eye size={11} />
                          Review
                        </button>
                      </>
                    )}
                    {r.status === 'approved' && r.client_id && (
                      <Link
                        href={`/admin/clients/${r.client_id}`}
                        onClick={e => e.stopPropagation()}
                        className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1 transition"
                      >
                        View client <ExternalLink size={10} />
                      </Link>
                    )}
                    <ChevronDown size={14} className={`text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Status feedback */}
                {st && (
                  <div className={`mx-5 mb-3 px-3 py-2 rounded-xl text-xs flex items-center gap-2 ${
                    st.type === 'success' ? 'bg-green-950/50 text-green-300' : 'bg-red-950/50 text-red-300'
                  }`}>
                    {st.type === 'success' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {st.msg}
                  </div>
                )}

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-gray-800 pt-4 space-y-4">
                    {/* Full detail */}
                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      {[
                        { label: 'Full Name',     value: r.name },
                        { label: 'Email',         value: r.email },
                        { label: 'Phone',         value: r.phone || '—' },
                        { label: 'Country / City', value: [r.country, r.city].filter(Boolean).join(', ') || '—' },
                        { label: 'Business',      value: r.business_name },
                        { label: 'Type',          value: r.business_type },
                        { label: 'Website',       value: r.website || '—' },
                        { label: 'Trial Plan',    value: `${r.trial_plan} · ${r.trial_duration_days} days` },
                      ].map(f => (
                        <div key={f.label}>
                          <p className="text-gray-600 mb-0.5">{f.label}</p>
                          <p className="text-gray-300">{f.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Intended use */}
                    {r.intended_use && (
                      <div className="bg-gray-800 rounded-xl p-3">
                        <p className="text-gray-600 text-xs mb-1">Intended Use</p>
                        <p className="text-gray-300 text-xs leading-relaxed">{r.intended_use}</p>
                      </div>
                    )}

                    {/* Admin notes input */}
                    <div>
                      <label className="text-gray-500 text-xs block mb-1.5">Admin Notes (included in welcome/rejection email)</label>
                      <textarea
                        value={adminNotes[r.id] ?? r.admin_notes ?? ''}
                        onChange={e => setAdminNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                        rows={2}
                        placeholder="e.g. Special arrangement — giving 30-day trial..."
                        className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    {/* Action buttons for pending/under_review */}
                    {['pending', 'under_review'].includes(r.status) && (
                      <div className="space-y-3">
                        {/* Approve */}
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <label className="text-gray-500 text-xs block mb-1.5">Override trial duration (days)</label>
                            <div className="flex gap-2">
                              {[7, 14, 21, 30, 60].map(d => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => setExtendDays(prev => ({ ...prev, [r.id]: d }))}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                                    (extendDays[r.id] ?? r.trial_duration_days) === d
                                      ? 'bg-green-700 border-green-600 text-white'
                                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                                  }`}
                                >
                                  {d}d
                                </button>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => doAction(r.id, 'approve')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                          >
                            {actionLoading === r.id + 'approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                            Approve &amp; Send Welcome Email
                          </button>
                        </div>

                        {/* Reject */}
                        <div className="flex items-end gap-3">
                          <div className="flex-1">
                            <label className="text-gray-500 text-xs block mb-1.5">Rejection reason (optional — sent to applicant)</label>
                            <input
                              value={rejectReason[r.id] ?? ''}
                              onChange={e => setRejectReason(prev => ({ ...prev, [r.id]: e.target.value }))}
                              placeholder="e.g. Not enough information provided..."
                              className="w-full bg-gray-800 border border-gray-700 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <button
                            onClick={() => doAction(r.id, 'reject')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-400 hover:text-red-300 text-xs font-bold px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                          >
                            {actionLoading === r.id + 'reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
                            Reject
                          </button>
                        </div>

                        {/* Mark under review */}
                        {r.status === 'pending' && (
                          <button
                            onClick={() => doAction(r.id, 'review')}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs transition"
                          >
                            <Clock size={12} />
                            Mark as Under Review
                          </button>
                        )}
                      </div>
                    )}

                    {/* Already processed */}
                    {r.status === 'rejected' && r.rejection_reason && (
                      <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-3">
                        <p className="text-gray-500 text-xs mb-1">Rejection reason</p>
                        <p className="text-red-300 text-xs">{r.rejection_reason}</p>
                      </div>
                    )}
                    {r.reviewed_at && (
                      <p className="text-gray-700 text-xs">
                        {r.status} by {r.reviewed_by ?? 'admin'} on {new Date(r.reviewed_at).toLocaleDateString('en-AU')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Setup reminder */}
      <div className="mt-5 bg-yellow-950/30 border border-yellow-900/40 rounded-xl p-3">
        <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Setup Required</p>
        <p className="text-yellow-200/50 text-xs">
          Run <code className="font-mono text-yellow-300">supabase/trial-requests.sql</code> in your Supabase SQL Editor to enable this feature.
          Share <code className="font-mono text-yellow-300">/trial</code> with prospects to start receiving requests.
        </p>
      </div>
    </div>
  )
}
