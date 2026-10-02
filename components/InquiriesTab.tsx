'use client'

import { useEffect, useState, useCallback } from 'react'
import { MessageSquare, RefreshCw, CheckCircle, XCircle, ArrowRight, Loader2, Mail, Phone } from 'lucide-react'
import type { Lead, LeadStatus } from '@/types/database'

interface Props {
  siteId: string
  primaryColor?: string
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new:        'bg-blue-100 text-blue-700',
  contacted:  'bg-yellow-100 text-yellow-700',
  converted:  'bg-green-100 text-green-700',
  closed:     'bg-gray-100 text-gray-500',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

export default function InquiriesTab({ siteId, primaryColor = '#2563eb' }: Props) {
  const [leads, setLeads]     = useState<Lead[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<LeadStatus | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [notes, setNotes]     = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ site_id: siteId, limit: '50' })
      if (filter !== 'all') params.set('status', filter)
      const res  = await fetch(`/api/inquire?${params}`)
      const data = await res.json()
      if (res.ok) { setLeads(data.leads ?? []); setTotal(data.total ?? 0) }
    } finally { setLoading(false) }
  }, [siteId, filter])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: LeadStatus) {
    setUpdating(id)
    try {
      await fetch(`/api/inquire?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: notes[id] || undefined }),
      })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    } finally { setUpdating(null) }
  }

  async function convertToBooking(lead: Lead) {
    // Pre-fill the booking form — scroll to #book section with params
    const url = `#book?name=${encodeURIComponent(lead.name)}&email=${encodeURIComponent(lead.email)}&phone=${encodeURIComponent(lead.phone || '')}`
    window.open(url, '_self')
    await updateStatus(lead.id, 'converted')
  }

  const newCount = leads.filter(l => l.status === 'new').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
            <MessageSquare size={18} />
            Inquiries
            {newCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newCount} new</span>
            )}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">{total} total inquiries</p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-500">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['all', 'new', 'contacted', 'converted', 'closed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition capitalize ${
              filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
          <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">No inquiries yet</p>
          <p className="text-gray-400 text-xs max-w-xs mx-auto">
            When customers send a message via the Contact tab on your site, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => {
            const isExpanded = expanded === lead.id
            return (
              <div key={lead.id} className={`bg-white border rounded-2xl overflow-hidden transition ${lead.status === 'new' ? 'border-blue-200' : 'border-gray-100'}`}>
                {/* Summary row */}
                <div
                  className="flex items-start justify-between gap-3 px-4 py-4 cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => setExpanded(isExpanded ? null : lead.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-gray-900 font-semibold text-sm">{lead.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                      {lead.opt_in && <span className="text-xs text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">opted in</span>}
                    </div>
                    <p className="text-gray-500 text-xs">{lead.email} {lead.phone ? `· ${lead.phone}` : ''}</p>
                    {lead.service_interest && <p className="text-gray-400 text-xs mt-0.5">Re: {lead.service_interest}</p>}
                    <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{lead.message}</p>
                  </div>
                  <span className="text-gray-400 text-xs shrink-0">{timeAgo(lead.created_at)}</span>
                </div>

                {/* Expanded */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                    {/* Full message */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-gray-500 text-xs font-medium mb-1">Full message</p>
                      <p className="text-gray-700 text-sm leading-relaxed">{lead.message}</p>
                    </div>

                    {/* Contact links */}
                    <div className="flex flex-wrap gap-2">
                      <a href={`mailto:${lead.email}`}
                        className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition">
                        <Mail size={12} /> Reply by email
                      </a>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`}
                          className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 transition">
                          <Phone size={12} /> Call
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener"
                          className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg hover:bg-emerald-100 transition">
                          💬 WhatsApp
                        </a>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="text-gray-500 text-xs block mb-1.5">Internal note</label>
                      <textarea
                        value={notes[lead.id] ?? lead.notes ?? ''}
                        onChange={e => setNotes(p => ({ ...p, [lead.id]: e.target.value }))}
                        rows={2}
                        placeholder="Add a note about this inquiry..."
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 resize-none"
                      />
                    </div>

                    {/* Status actions */}
                    <div className="flex flex-wrap gap-2">
                      {lead.status === 'new' && (
                        <button
                          onClick={() => updateStatus(lead.id, 'contacted')}
                          disabled={updating === lead.id}
                          className="flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-medium px-3 py-2 rounded-lg transition disabled:opacity-50"
                        >
                          {updating === lead.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                          Mark Contacted
                        </button>
                      )}
                      <button
                        onClick={() => convertToBooking(lead)}
                        disabled={updating === lead.id}
                        className="flex items-center gap-1.5 text-white text-xs font-medium px-3 py-2 rounded-lg transition disabled:opacity-50"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <ArrowRight size={12} /> Convert to Booking
                      </button>
                      <button
                        onClick={() => updateStatus(lead.id, 'closed')}
                        disabled={updating === lead.id}
                        className="flex items-center gap-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 text-xs font-medium px-3 py-2 rounded-lg transition disabled:opacity-50"
                      >
                        <XCircle size={12} /> Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Setup note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-blue-700 text-xs font-semibold mb-1">ℹ️ About Inquiries</p>
        <p className="text-blue-600 text-xs leading-relaxed">
          Messages sent via the "Enquire" tab on your site appear here. Click any inquiry to reply, add notes, or convert it to a booking.
          Run <code className="font-mono bg-blue-100 px-1 rounded">supabase/leads.sql</code> to enable.
        </p>
      </div>
    </div>
  )
}
