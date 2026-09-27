'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { KITA_PRICING, formatAmount } from '@/lib/pricing'
import { BUSINESS_TYPE_ICONS } from '@/lib/templates'
import type { BusinessType, Client } from '@/types/database'
import { TrendingUp, DollarSign, Globe, RefreshCw, Download, Users } from 'lucide-react'

interface SiteRevenue {
  id: string
  business_name: string
  business_type: BusinessType
  owner_email: string | null
  payment_status: string
  paid_at: string | null
  created_at: string
  client_id: string | null
}

interface ClientRevenue {
  client: Client
  sites: SiteRevenue[]
  paidSites: number
  mrr: number
  totalSetup: number
  totalBookings: number
}

type TabId = 'overview' | 'by-client'

export default function RevenuePage() {
  const [tab, setTab] = useState<TabId>('overview')
  const [sites, setSites] = useState<SiteRevenue[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({})
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: sitesData }, { data: clientsData }, { data: bookingsData }, { data: viewsData }] =
      await Promise.all([
        supabase
          .from('sites')
          .select('id, business_name, business_type, owner_email, payment_status, paid_at, created_at, client_id')
          .order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('site_id'),
        (() => {
          const since = new Date()
          since.setDate(since.getDate() - 30)
          return supabase.from('page_views').select('site_id').gte('viewed_at', since.toISOString())
        })(),
      ])

    const counts: Record<string, number> = {}
    bookingsData?.forEach((b: any) => {
      counts[b.site_id] = (counts[b.site_id] || 0) + 1
    })

    const views: Record<string, number> = {}
    viewsData?.forEach((v: any) => {
      views[v.site_id] = (views[v.site_id] || 0) + 1
    })

    setSites((sitesData as SiteRevenue[]) || [])
    setClients((clientsData as Client[]) || [])
    setBookingCounts(counts)
    setViewCounts(views)
    setLoading(false)
  }

  const paidSites = sites.filter(s => s.payment_status === 'paid')
  const freeSites = sites.filter(s => s.payment_status === 'free')
  const totalRevenue = paidSites.length * (KITA_PRICING.setup.amount / 100)
  const mrr = paidSites.length * (KITA_PRICING.monthly.amount / 100)
  const totalBookings = Object.values(bookingCounts).reduce((a, b) => a + b, 0)

  // ── By-Client aggregation ───────────────────────────────────────
  const clientRevenueRows: ClientRevenue[] = clients.map(client => {
    const clientSites = sites.filter(s => s.client_id === client.id)
    const paid = clientSites.filter(s => s.payment_status === 'paid')
    const clientBookings = clientSites.reduce((sum, s) => sum + (bookingCounts[s.id] || 0), 0)
    return {
      client,
      sites: clientSites,
      paidSites: paid.length,
      mrr: paid.length * (KITA_PRICING.monthly.amount / 100),
      totalSetup: paid.length * (KITA_PRICING.setup.amount / 100),
      totalBookings: clientBookings,
    }
  })

  // Clients without a linked site still appear; sort by MRR desc then name
  clientRevenueRows.sort((a, b) => b.mrr - a.mrr || a.client.name.localeCompare(b.client.name))

  function exportCSV() {
    const headers = ['Business Name', 'Type', 'Owner Email', 'Payment Status', 'Paid At', 'Bookings', 'Views (30d)', 'Created']
    const rows = sites.map(s => [
      s.business_name,
      s.business_type,
      s.owner_email || '',
      s.payment_status,
      s.paid_at ? new Date(s.paid_at).toLocaleDateString() : '',
      bookingCounts[s.id] || 0,
      viewCounts[s.id] || 0,
      new Date(s.created_at).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kita-revenue-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportClientCSV() {
    const headers = ['Client Name', 'Email', 'Plan', 'Status', 'Sites', 'Paid Sites', 'MRR', 'Setup Fees', 'Total Bookings']
    const rows = clientRevenueRows.map(r => [
      r.client.name,
      r.client.email,
      r.client.subscription_plan,
      r.client.subscription_status,
      r.sites.length,
      r.paidSites,
      `$${r.mrr}/mo`,
      `$${r.totalSetup}`,
      r.totalBookings,
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kita-clients-revenue-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const PLAN_COLORS: Record<string, string> = {
    trial: 'bg-gray-800 text-gray-400',
    starter: 'bg-blue-900/50 text-blue-400',
    growth: 'bg-green-900/50 text-green-400',
    agency: 'bg-purple-900/50 text-purple-400',
    custom: 'bg-yellow-900/50 text-yellow-400',
  }

  const STATUS_COLORS: Record<string, string> = {
    trial: 'bg-gray-800 text-gray-400',
    active: 'bg-green-900/50 text-green-400',
    overdue: 'bg-red-900/50 text-red-400',
    cancelled: 'bg-gray-800 text-gray-500',
    paused: 'bg-yellow-900/50 text-yellow-400',
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-green-400" size={24} />
            Revenue Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Track your MRR, setup fees, and client bookings.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition">
            <RefreshCw size={16} />
          </button>
          <button
            onClick={tab === 'overview' ? exportCSV : exportClientCSV}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* MRR Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Monthly Recurring Revenue',
            value: formatAmount(mrr * 100),
            sub: `${paidSites.length} active paid sites × $${KITA_PRICING.monthly.amount / 100}/mo`,
            icon: DollarSign,
            color: 'text-green-400',
            bg: 'border-green-800/50 bg-green-950/20',
          },
          {
            label: 'Total Setup Revenue',
            value: formatAmount(totalRevenue * 100),
            sub: `${paidSites.length} × $${KITA_PRICING.setup.amount / 100} setup fee`,
            icon: TrendingUp,
            color: 'text-blue-400',
            bg: 'border-blue-800/50 bg-blue-950/20',
          },
          {
            label: 'Total Sites',
            value: sites.length,
            sub: `${paidSites.length} paid · ${freeSites.length} free`,
            icon: Globe,
            color: 'text-purple-400',
            bg: 'border-purple-800/50 bg-purple-950/20',
          },
          {
            label: 'Total Bookings',
            value: totalBookings,
            sub: 'across all client sites',
            icon: TrendingUp,
            color: 'text-yellow-400',
            bg: 'border-yellow-800/50 bg-yellow-950/20',
          },
          {
            label: 'Total Page Views (30d)',
            value: Object.values(viewCounts).reduce((a, b) => a + b, 0),
            sub: 'visits across all client sites',
            icon: Globe,
            color: 'text-blue-300',
            bg: 'border-blue-900/50 bg-blue-950/10',
          },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className={`border rounded-xl p-5 ${stat.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-xs font-medium">{stat.label}</span>
                <Icon size={16} className={stat.color} />
              </div>
              <div className={`text-3xl font-bold mb-1 ${stat.color}`}>
                {loading ? <span className="text-gray-700">—</span> : stat.value}
              </div>
              <p className="text-gray-600 text-xs">{stat.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Annual projection */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">Projected Annual Revenue <span className="text-gray-600 text-xs">(at current MRR)</span></p>
          <p className="text-white text-2xl font-bold mt-0.5">{formatAmount(mrr * 12 * 100)}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">If you reach 10 paid clients</p>
          <p className="text-green-400 text-xl font-bold mt-0.5">{formatAmount(10 * KITA_PRICING.monthly.amount * 12)}/yr</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {([
          { id: 'overview', label: 'All Sites', icon: Globe },
          { id: 'by-client', label: 'By Client', icon: Users },
        ] as { id: TabId; label: string; icon: any }[]).map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition ${
                tab === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={13} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ── Overview Tab ────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">All Client Sites</h2>
            <span className="text-gray-500 text-xs">{sites.length} total</span>
          </div>
          {loading ? (
            <div className="text-center py-10 text-gray-600 text-sm">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Business</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden sm:table-cell">Type</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Payment</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden md:table-cell">Bookings</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden md:table-cell">Views (30d)</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden lg:table-cell">Revenue</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden md:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {sites.map(site => (
                  <tr key={site.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-sm">{site.business_name}</p>
                      <p className="text-gray-600 text-xs">{site.owner_email || '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-gray-400 text-xs">
                        {BUSINESS_TYPE_ICONS[site.business_type]} {site.business_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        site.payment_status === 'paid' ? 'bg-green-900/50 text-green-400'
                        : site.payment_status === 'free' ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-yellow-900/50 text-yellow-400'
                      }`}>
                        {site.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-400 text-xs">{bookingCounts[site.id] || 0}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-blue-300 text-xs">{viewCounts[site.id] || 0}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-green-400 text-xs font-mono">
                        {site.payment_status === 'paid'
                          ? `$${KITA_PRICING.setup.amount / 100} + $${KITA_PRICING.monthly.amount / 100}/mo`
                          : '—'
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-600 text-xs">
                        {new Date(site.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── By Client Tab ───────────────────────────────────────── */}
      {tab === 'by-client' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Revenue by Client</h2>
            <span className="text-gray-500 text-xs">{clients.length} clients</span>
          </div>
          {loading ? (
            <div className="text-center py-10 text-gray-600 text-sm">Loading...</div>
          ) : clientRevenueRows.length === 0 ? (
            <div className="text-center py-10 text-gray-600 text-sm">
              No clients yet.{' '}
              <Link href="/admin/clients/new" className="text-blue-400 hover:underline">Add one →</Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Client</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden sm:table-cell">Plan</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden sm:table-cell">Status</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden md:table-cell">Sites</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden md:table-cell">Bookings</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">MRR</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden lg:table-cell">Setup</th>
                  <th className="text-right text-gray-500 font-medium px-4 py-3 text-xs hidden lg:table-cell">Profile</th>
                </tr>
              </thead>
              <tbody>
                {clientRevenueRows.map(({ client, sites: cs, paidSites: ps, mrr: cmrr, totalSetup, totalBookings: cb }) => (
                  <tr key={client.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-sm">{client.name}</p>
                      <p className="text-gray-600 text-xs">{client.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[client.subscription_plan] || 'bg-gray-800 text-gray-400'}`}>
                        {client.subscription_plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[client.subscription_status] || 'bg-gray-800 text-gray-400'}`}>
                        {client.subscription_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-400 text-xs">{cs.length} <span className="text-gray-700">({ps} paid)</span></span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-400 text-xs">{cb}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-mono font-bold ${cmrr > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                        {cmrr > 0 ? `$${cmrr}/mo` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-blue-400 text-xs font-mono">
                        {totalSetup > 0 ? `$${totalSetup}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-right">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="text-blue-400 hover:text-blue-300 text-xs hover:underline transition"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Total row */}
              <tfoot>
                <tr className="border-t-2 border-gray-700 bg-gray-800/40">
                  <td className="px-4 py-3 text-gray-400 text-xs font-semibold" colSpan={5}>
                    Total across {clientRevenueRows.filter(r => r.mrr > 0).length} paying clients
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-green-400 font-mono font-bold text-sm">
                      ${clientRevenueRows.reduce((s, r) => s + r.mrr, 0).toFixed(0)}/mo
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-blue-400 font-mono text-xs">
                      ${clientRevenueRows.reduce((s, r) => s + r.totalSetup, 0).toFixed(0)}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell" />
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
