'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BUSINESS_TYPE_ICONS } from '@/lib/templates'
import type { BusinessType, Site, Client } from '@/types/database'
import { Globe, ExternalLink, LayoutDashboard, Trash2, Search, RefreshCw, User, Eye } from 'lucide-react'
import { startImpersonation } from '@/lib/impersonation'
import { logEvent, ET } from '@/lib/events'

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [clients, setClients] = useState<Record<string, Pick<Client, 'id' | 'name' | 'email'>>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<BusinessType | 'all'>('all')

  useEffect(() => { loadSites() }, [])

  async function loadSites() {
    setLoading(true)
    const [{ data: sitesData }, { data: clientsData }] = await Promise.all([
      supabase.from('sites').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, name, email'),
    ])

    const clientMap: Record<string, Pick<Client, 'id' | 'name' | 'email'>> = {}
    clientsData?.forEach((c: any) => { clientMap[c.id] = c })

    setSites(sitesData || [])
    setClients(clientMap)
    setLoading(false)
  }

  async function deleteSite(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will also delete all services, staff, and bookings for this site. This cannot be undone.`)) return
    await supabase.from('sites').delete().eq('id', id)
    setSites(prev => prev.filter(s => s.id !== id))
  }

  const filtered = sites.filter(s => {
    const matchesSearch =
      s.business_name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || s.business_type === filter
    return matchesSearch && matchesFilter
  })

  const businessTypes: BusinessType[] = ['salon', 'clinic', 'pet', 'cafe', 'mechanic']

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="text-blue-400" size={24} />
            All Sites
          </h1>
          <p className="text-gray-400 text-sm mt-1">{sites.length} sites generated so far</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadSites}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition"
          >
            <RefreshCw size={16} />
          </button>
          <Link
            href="/admin/generate"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            + Generate Site
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or slug..."
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {businessTypes.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filter === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {BUSINESS_TYPE_ICONS[t]} {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-600">Loading sites...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-500 mb-3">
            {sites.length === 0 ? 'No sites yet.' : 'No sites match your search.'}
          </p>
          {sites.length === 0 && (
            <Link href="/admin/generate" className="text-blue-400 text-sm hover:underline">
              Generate your first site →
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Business</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden sm:table-cell">Type</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden md:table-cell">Slug</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden lg:table-cell">Client</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden md:table-cell">Payment</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden md:table-cell">Created</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(site => {
                const client = (site as any).client_id ? clients[(site as any).client_id] : null
                return (
                  <tr key={site.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition">
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{site.business_name}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-gray-400 text-xs">
                        {BUSINESS_TYPE_ICONS[site.business_type as BusinessType]} {site.business_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-500 font-mono text-xs">/{site.slug}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {client ? (
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition group"
                        >
                          <User size={11} className="shrink-0" />
                          <span className="text-xs group-hover:underline">{client.name}</span>
                        </Link>
                      ) : (
                        <span className="text-gray-700 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        (site as any).payment_status === 'paid'
                          ? 'bg-green-900/50 text-green-400'
                          : (site as any).payment_status === 'free'
                            ? 'bg-blue-900/50 text-blue-400'
                            : 'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {(site as any).payment_status || 'free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-600 text-xs">
                        {new Date(site.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/${site.slug}`}
                          target="_blank"
                          className="text-blue-400 hover:text-blue-300 transition"
                          title="View public site"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <a
                          href={`/${site.slug}/dashboard`}
                          target="_blank"
                          className="text-green-400 hover:text-green-300 transition"
                          title="Owner dashboard"
                        >
                          <LayoutDashboard size={14} />
                        </a>
                        <button
                          onClick={() => {
                            startImpersonation({
                              siteId:       site.id,
                              siteSlug:     site.slug,
                              businessName: site.business_name,
                              clientId:     (site as any).client_id ?? null,
                              startedAt:    new Date().toISOString(),
                            })
                            logEvent({
                              event_type: ET.AUTH_IMPERSONATION_STARTED,
                              category:   'auth',
                              severity:   'info',
                              actor_type: 'admin',
                              actor_id:   'admin',
                              site_id:    site.id,
                              summary:    `Admin started viewing ${site.business_name} as client`,
                            }).catch(() => {})
                            window.open(`/${site.slug}/dashboard`, '_blank')
                          }}
                          className="text-gray-500 hover:text-purple-400 transition"
                          title="View as Client"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => deleteSite(site.id, site.business_name)}
                          className="text-gray-700 hover:text-red-400 transition"
                          title="Delete site"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
