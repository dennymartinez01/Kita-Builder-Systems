'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { KITA_PRICING, formatAmount } from '@/lib/pricing'
import { BUSINESS_TYPE_ICONS, BUSINESS_TYPE_LABELS } from '@/lib/templates'
import type { BusinessType } from '@/types/database'
import { TrendingUp, DollarSign, Globe, RefreshCw, Download } from 'lucide-react'

interface SiteRevenue {
  id: string
  business_name: string
  business_type: BusinessType
  owner_email: string | null
  payment_status: string
  paid_at: string | null
  created_at: string
}

interface BookingSummary {
  site_id: string
  count: number
}

export default function RevenuePage() {
  const [sites, setSites] = useState<SiteRevenue[]>([])
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({})
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: sitesData } = await supabase
      .from('sites')
      .select('id, business_name, business_type, owner_email, payment_status, paid_at, created_at')
      .order('created_at', { ascending: false })

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('site_id')

    // Page views last 30 days
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const { data: viewsData } = await supabase
      .from('page_views')
      .select('site_id')
      .gte('viewed_at', since.toISOString())

    const counts: Record<string, number> = {}
    bookingsData?.forEach((b: any) => {
      counts[b.site_id] = (counts[b.site_id] || 0) + 1
    })

    const views: Record<string, number> = {}
    viewsData?.forEach((v: any) => {
      views[v.site_id] = (views[v.site_id] || 0) + 1
    })

    setSites((sitesData as SiteRevenue[]) || [])
    setBookingCounts(counts)
    setViewCounts(views)
    setLoading(false)
  }

  const paidSites = sites.filter(s => s.payment_status === 'paid')
  const freeSites = sites.filter(s => s.payment_status === 'free')
  const totalRevenue = paidSites.length * (KITA_PRICING.setup.amount / 100)
  const mrr = paidSites.length * (KITA_PRICING.monthly.amount / 100)
  const totalBookings = Object.values(bookingCounts).reduce((a, b) => a + b, 0)

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
          <button onClick={exportCSV} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* MRR Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Sites table */}
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
    </div>
  )
}
