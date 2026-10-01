'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Client } from '@/types/database'
import { formatTrialCountdown } from '@/lib/trial'
import {
  Users, Plus, Search, RefreshCw, ExternalLink,
  Globe, TrendingUp, ChevronRight, Download,
} from 'lucide-react'

const PLAN_COLORS: Record<string, string> = {
  trial:   'bg-gray-800 text-gray-400',
  starter: 'bg-blue-900/50 text-blue-400',
  growth:  'bg-green-900/50 text-green-400',
  agency:  'bg-purple-900/50 text-purple-400',
  custom:  'bg-yellow-900/50 text-yellow-400',
}

const STATUS_COLORS: Record<string, string> = {
  trial:     'bg-gray-800 text-gray-400',
  active:    'bg-green-900/50 text-green-400',
  overdue:   'bg-red-900/50 text-red-400',
  cancelled: 'bg-gray-800 text-gray-500',
  paused:    'bg-yellow-900/50 text-yellow-400',
}

const MONTHLY_RATES: Record<string, number> = {
  trial: 0, starter: 29, growth: 49, agency: 99, custom: 0,
}

export default function ClientsPage() {
  const [clients, setClients] = useState<(Client & { site_count?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCountry, setFilterCountry] = useState('all')

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      // Get site counts per client
      const { data: siteCounts } = await supabase
        .from('sites')
        .select('client_id')
        .not('client_id', 'is', null)

      const counts: Record<string, number> = {}
      siteCounts?.forEach((s: any) => {
        if (s.client_id) counts[s.client_id] = (counts[s.client_id] || 0) + 1
      })

      setClients(data.map(c => ({ ...c, site_count: counts[c.id] || 0 })))
    }
    setLoading(false)
  }

  const countries = [...new Set(clients.map(c => c.country).filter(Boolean))] as string[]

  const filtered = clients.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.subscription_status === filterStatus
    const matchCountry = filterCountry === 'all' || c.country === filterCountry
    return matchSearch && matchStatus && matchCountry
  })

  const totalMRR = clients
    .filter(c => c.subscription_status === 'active')
    .reduce((sum, c) => sum + (MONTHLY_RATES[c.subscription_plan] || 0), 0)

  const activeCount = clients.filter(c => c.subscription_status === 'active').length
  const trialCount = clients.filter(c => c.subscription_status === 'trial').length

  function exportCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Country', 'City', 'Plan', 'Status', 'Sites', 'Source', 'Joined']
    const rows = filtered.map(c => [
      c.name, c.email, c.phone || '', c.country || '', c.city || '',
      c.subscription_plan, c.subscription_status,
      (c as any).site_count || 0,
      c.source || '', new Date(c.created_at).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clients-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-400" size={24} />
            Clients
          </h1>
          <p className="text-gray-400 text-sm mt-1">{clients.length} total clients · MRR: ${totalMRR}/mo</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-2 rounded-lg transition">
            <Download size={13} /> Export CSV
          </button>
          <button onClick={loadClients} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition">
            <RefreshCw size={15} />
          </button>
          <Link href="/admin/clients/new" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Plus size={15} /> Add Client
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Clients', value: clients.length, color: 'text-white' },
          { label: 'Active', value: activeCount, color: 'text-green-400' },
          { label: 'On Trial', value: trialCount, color: 'text-yellow-400' },
          { label: 'MRR', value: `$${totalMRR}`, color: 'text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, city..."
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
        >
          <option value="all">All Statuses</option>
          {['active', 'trial', 'overdue', 'paused', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        {countries.length > 0 && (
          <select
            value={filterCountry}
            onChange={e => setFilterCountry(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none"
          >
            <option value="all">All Countries</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-600 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users size={28} className="mx-auto mb-3 text-gray-700" />
            <p className="text-gray-500 text-sm mb-3">
              {clients.length === 0 ? 'No clients yet.' : 'No clients match your search.'}
            </p>
            {clients.length === 0 && (
              <Link href="/admin/clients/new" className="text-blue-400 text-sm hover:underline">
                Add your first client →
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Client</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden sm:table-cell">Country</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Plan</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Status</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden md:table-cell">Sites</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden lg:table-cell">MRR</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden lg:table-cell">Source</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(client => (
                <tr key={client.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium text-sm">{client.name}</p>
                    <p className="text-gray-500 text-xs">{client.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-gray-400 text-xs">{client.country || '—'}{client.city ? ` · ${client.city}` : ''}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${PLAN_COLORS[client.subscription_plan] || 'bg-gray-800 text-gray-400'}`}>
                      {client.subscription_plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize w-fit ${STATUS_COLORS[client.subscription_status] || 'bg-gray-800 text-gray-400'}`}>
                        {client.subscription_status}
                      </span>
                      {client.subscription_status === 'trial' && (() => {
                        const ct = formatTrialCountdown(client)
                        return (
                          <span className={`text-xs font-mono ${ct.color}`}>{ct.label}</span>
                        )
                      })()}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-gray-400 text-xs">{(client as any).site_count || 0}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-green-400 text-xs font-mono">
                      {client.subscription_status === 'active' ? `$${MONTHLY_RATES[client.subscription_plan] || 0}/mo` : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-600 text-xs capitalize">{client.source || '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-600 text-xs">{new Date(client.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${client.id}`} className="text-blue-400 hover:text-blue-300 transition">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
