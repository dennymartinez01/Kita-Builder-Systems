'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Megaphone, Plus, RefreshCw, Send, Archive, Pause,
  CheckCircle, Loader2, AlertCircle, ChevronRight, BarChart2, Trash2,
} from 'lucide-react'
import type { Campaign, CampaignStatus } from '@/types/database'

const STATUS_CONFIG: Record<CampaignStatus, { label: string; color: string; dot: string }> = {
  draft:    { label: 'Draft',    color: 'bg-gray-800 text-gray-400',     dot: 'bg-gray-500' },
  active:   { label: 'Active',   color: 'bg-green-900/50 text-green-400', dot: 'bg-green-400' },
  paused:   { label: 'Paused',   color: 'bg-yellow-900/50 text-yellow-400', dot: 'bg-yellow-400' },
  archived: { label: 'Archived', color: 'bg-gray-800 text-gray-600',     dot: 'bg-gray-600' },
}

interface SendResult { sent_count: number; failed_count: number; suppressed_count: number; recipients: number }

export default function CampaignsPage() {
  const [campaigns, setCampaigns]   = useState<Campaign[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState<CampaignStatus | 'all'>('all')
  const [sending, setSending]       = useState<string | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [sendResult, setSendResult] = useState<Record<string, SendResult | { error: string }>>({})
  const [expanded, setExpanded]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (filter !== 'all') params.set('status', filter)
      const res  = await fetch(`/api/campaigns?${params}`)
      const data = await res.json()
      if (res.ok) { setCampaigns(data.campaigns ?? []); setTotal(data.total ?? 0) }
    } finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  async function handleSend(id: string) {
    setSending(id)
    setSendResult(prev => { const n = { ...prev }; delete n[id]; return n })
    try {
      const res  = await fetch(`/api/campaigns/${id}/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      setSendResult(prev => ({ ...prev, [id]: data }))
      load()
    } catch (err: any) {
      setSendResult(prev => ({ ...prev, [id]: { error: err.message } }))
    } finally { setSending(null) }
  }

  async function handleStatusChange(id: string, status: CampaignStatus) {
    await fetch(`/api/campaigns?id=${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    })
    load()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete campaign "${name}"? All send history will also be deleted.`)) return
    setDeleting(id)
    await fetch(`/api/campaigns?id=${id}`, { method: 'DELETE' })
    setCampaigns(prev => prev.filter(c => c.id !== id))
    setTotal(prev => prev - 1)
    setDeleting(null)
  }

  const draftCount  = campaigns.filter(c => c.status === 'draft').length
  const activeCount = campaigns.filter(c => c.status === 'active').length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone className="text-blue-400" size={24} />
            Campaigns
            {draftCount > 0 && (
              <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-0.5 rounded-full">{draftCount} draft</span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {total} campaign{total !== 1 ? 's' : ''} · {activeCount} active
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link href="/admin/campaigns/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition">
            <Plus size={14} /> New Campaign
          </Link>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {(['all', 'draft', 'active', 'paused', 'archived'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-2 rounded-lg transition capitalize ${
              filter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-600 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <Megaphone size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-2">No campaigns yet.</p>
          <Link href="/admin/campaigns/new" className="text-blue-400 text-xs hover:underline">
            Create your first campaign →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(c => {
            const st      = STATUS_CONFIG[c.status]
            const result  = sendResult[c.id]
            const isSending = sending === c.id
            const isDeleting = deleting === c.id

            return (
              <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Main row */}
                <div className="flex items-start gap-4 px-5 py-4">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${st.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-white font-semibold text-sm">{c.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="text-gray-500 text-xs truncate mb-2">{c.subject}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                      {c.total_sends > 0 && (
                        <>
                          <span className="flex items-center gap-1"><BarChart2 size={10} /> {c.total_sends} send{c.total_sends !== 1 ? 's' : ''}</span>
                          <span className="text-green-500">{c.total_sent} delivered</span>
                          {c.total_failed > 0 && <span className="text-red-400">{c.total_failed} failed</span>}
                        </>
                      )}
                      {c.filter_city && <span>📍 {c.filter_city}</span>}
                      {c.filter_business_type && <span>🏪 {c.filter_business_type}</span>}
                      {c.filter_country && <span>🌏 {c.filter_country}</span>}
                      {!c.filter_city && !c.filter_business_type && !c.filter_country && (
                        <span>🌐 All opted-in leads</span>
                      )}
                    </div>

                    {/* Send result feedback */}
                    {result && (
                      <div className={`mt-2 flex items-start gap-2 text-xs px-3 py-2 rounded-lg ${
                        'error' in result
                          ? 'bg-red-950/50 text-red-300'
                          : 'bg-green-950/50 text-green-300'
                      }`}>
                        {'error' in result
                          ? <><AlertCircle size={12} className="shrink-0 mt-0.5" />{result.error}</>
                          : <><CheckCircle size={12} className="shrink-0 mt-0.5" />
                              Sent to {result.sent_count} leads
                              {result.failed_count > 0 && ` · ${result.failed_count} failed`}
                              {result.suppressed_count > 0 && ` · ${result.suppressed_count} suppressed`}
                            </>
                        }
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Send button — draft or active can send */}
                    {(c.status === 'draft' || c.status === 'active' || c.status === 'paused') && (
                      <button
                        onClick={() => handleSend(c.id)}
                        disabled={isSending}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      >
                        {isSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                        {isSending ? 'Sending...' : 'Send'}
                      </button>
                    )}

                    {/* Status controls */}
                    {c.status === 'active' && (
                      <button onClick={() => handleStatusChange(c.id, 'paused')}
                        className="p-1.5 text-gray-500 hover:text-yellow-400 transition" title="Pause">
                        <Pause size={14} />
                      </button>
                    )}
                    {c.status === 'paused' && (
                      <button onClick={() => handleStatusChange(c.id, 'active')}
                        className="p-1.5 text-gray-500 hover:text-green-400 transition" title="Resume">
                        <CheckCircle size={14} />
                      </button>
                    )}
                    {c.status !== 'archived' && (
                      <button onClick={() => handleStatusChange(c.id, 'archived')}
                        className="p-1.5 text-gray-500 hover:text-gray-300 transition" title="Archive">
                        <Archive size={14} />
                      </button>
                    )}

                    {/* Expand */}
                    <button onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                      className="p-1.5 text-gray-600 hover:text-white transition">
                      <ChevronRight size={14} className={`transition-transform ${expanded === c.id ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Delete */}
                    <button onClick={() => handleDelete(c.id, c.name)} disabled={isDeleting}
                      className="p-1.5 text-gray-700 hover:text-red-400 transition disabled:opacity-50">
                      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === c.id && (
                  <div className="px-5 pb-5 border-t border-gray-800 pt-4 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-600 mb-1">Subject</p>
                        <p className="text-gray-300">{c.subject}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">CTA</p>
                        <a href={c.cta_url} target="_blank" rel="noopener"
                          className="text-blue-400 hover:underline truncate block">{c.cta_label} → {c.cta_url}</a>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs mb-1">Offer Text</p>
                      <p className="text-gray-400 text-xs leading-relaxed bg-gray-800 rounded-xl px-3 py-2.5">{c.body_text}</p>
                    </div>
                    {c.description && (
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Internal notes</p>
                        <p className="text-gray-500 text-xs">{c.description}</p>
                      </div>
                    )}
                    {c.expires_at && (
                      <p className="text-gray-500 text-xs">⏰ Expires: {new Date(c.expires_at).toLocaleDateString('en-AU')}</p>
                    )}
                    <p className="text-gray-700 text-xs">Created {new Date(c.created_at).toLocaleDateString('en-AU')}</p>
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
          Run <code className="font-mono text-yellow-300">supabase/campaigns.sql</code> to enable this feature.
          Also requires <code className="font-mono text-yellow-300">supabase/leads.sql</code> and <code className="font-mono text-yellow-300">supabase/suppression.sql</code>.
        </p>
      </div>
    </div>
  )
}
