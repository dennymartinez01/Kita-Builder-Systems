'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Inbox, RefreshCw, Search, Download, ExternalLink, Mail, Phone, Filter } from 'lucide-react'
import type { Lead, LeadStatus } from '@/types/database'

const STATUS_COLORS: Record<LeadStatus | 'all', string> = {
  all:       'bg-gray-800 text-gray-400',
  new:       'bg-blue-900/50 text-blue-400',
  contacted: 'bg-yellow-900/50 text-yellow-400',
  converted: 'bg-green-900/50 text-green-400',
  closed:    'bg-gray-800 text-gray-500',
}

const SOURCE_ICONS: Record<string, string> = {
  contact_form:  '📬',
  booking:       '📅',
  audit_inquiry: '🔍',
  other:         '📎',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AdminLeadsPage() {
  const [leads, setLeads]     = useState<(Lead & { site_name?: string })[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [page, setPage]       = useState(0)

  const PAGE_SIZE = 50

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        admin:  '1',
        limit:  String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      })
      if (statusFilter !== 'all') params.set('status', statusFilter)

      const res  = await fetch(`/api/inquire?${params}`)
      const data = await res.json()
      if (res.ok) {
        setLeads(data.leads ?? [])
        setTotal(data.total ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { load() }, [load])

  const filtered = search
    ? leads.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        (l.message || '').toLowerCase().includes(search.toLowerCase())
      )
    : leads

  const newCount       = leads.filter(l => l.status === 'new').length
  const optInCount     = leads.filter(l => l.opt_in).length
  const convertedCount = leads.filter(l => l.status === 'converted').length

  function exportCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Message', 'Service Interest', 'Source', 'Status', 'Opt In', 'City', 'Business Type', 'Received']
    const rows = filtered.map(l => [
      l.name, l.email, l.phone || '', l.message || '', l.service_interest || '',
      l.source, l.status, l.opt_in ? 'Yes' : 'No', l.city || '', l.business_type || '',
      new Date(l.created_at).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `kita-leads-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Inbox className="text-blue-400" size={24} />
            Leads Inbox
            {newCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{newCount} new</span>
            )}
          </h1>
          <p className="text-gray-400 text-sm mt-1">All contact form inquiries across every client site.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          {filtered.length > 0 && (
            <button onClick={exportCSV} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-3 py-2 rounded-lg transition">
              <Download size={13} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Leads',  value: total,          color: 'text-white' },
          { label: 'New',          value: newCount,        color: 'text-blue-400' },
          { label: 'Opted In',     value: optInCount,      color: 'text-purple-400' },
          { label: 'Converted',    value: convertedCount,  color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'new', 'contacted', 'converted', 'closed'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-gray-600 text-sm">Loading leads...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <Inbox size={32} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">No leads yet.</p>
          <p className="text-gray-700 text-xs">
            Run <code className="font-mono text-gray-600">supabase/leads.sql</code> in Supabase to enable the Contact Form on client sites.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Lead', 'Message', 'Source', 'Status', 'Site', 'Received'].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium px-4 py-3 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium text-sm">{lead.name}</p>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <a href={`mailto:${lead.email}`} className="text-blue-400 text-xs hover:underline flex items-center gap-1">
                        <Mail size={10} />{lead.email}
                      </a>
                      {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="text-gray-500 text-xs flex items-center gap-1">
                          <Phone size={10} />{lead.phone}
                        </a>
                      )}
                    </div>
                    {lead.opt_in && (
                      <span className="text-xs text-purple-400 bg-purple-900/30 px-1.5 py-0.5 rounded mt-1 inline-block">opted in</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {lead.service_interest && (
                      <p className="text-gray-500 text-xs mb-1">Re: {lead.service_interest}</p>
                    )}
                    <p className="text-gray-400 text-xs line-clamp-2">{lead.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-lg">{SOURCE_ICONS[lead.source] ?? '📎'}</span>
                    <p className="text-gray-600 text-xs capitalize mt-0.5">{lead.source.replace('_', ' ')}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600 text-xs font-mono truncate max-w-[80px]">{lead.site_id?.substring(0, 8)}...</span>
                      <a href={`/admin/sites`} className="text-gray-600 hover:text-blue-400 transition">
                        <ExternalLink size={11} />
                      </a>
                    </div>
                    {lead.business_type && <p className="text-gray-700 text-xs capitalize mt-0.5">{lead.business_type}</p>}
                    {lead.city && <p className="text-gray-700 text-xs mt-0.5">{lead.city}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-xs">{timeAgo(lead.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
              <span className="text-gray-600 text-xs">{total} total · page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading}
                  className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition">← Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading}
                  className="bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 text-xs px-3 py-1.5 rounded-lg transition">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Setup reminder */}
      <div className="mt-4 bg-yellow-950/30 border border-yellow-900/40 rounded-xl p-3">
        <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Setup Required</p>
        <p className="text-yellow-200/50 text-xs">
          Run <code className="font-mono text-yellow-300">supabase/leads.sql</code> in your Supabase SQL Editor to enable the Contact Form and Leads database.
          Once done, every client site will show a Book / Enquire tab.
        </p>
      </div>
    </div>
  )
}
