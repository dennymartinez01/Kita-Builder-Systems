'use client'

import { useEffect, useState, useCallback } from 'react'
import { Users, Search, RefreshCw, Download, Mail, Phone, TrendingUp, Clock } from 'lucide-react'
import type { SiteCustomerSafe } from '@/types/database'
import CustomerProfileModal from '@/components/CustomerProfileModal'

interface Props {
  siteId: string
  primaryColor?: string
}

export default function CustomersTab({ siteId, primaryColor = '#2563eb' }: Props) {
  const [customers, setCustomers] = useState<SiteCustomerSafe[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<SiteCustomerSafe | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ site_id: siteId, limit: '100' })
      if (search) params.set('search', search)
      const res  = await fetch(`/api/customers?${params}`)
      const data = await res.json()
      if (res.ok) {
        setCustomers(data.customers ?? [])
        setTotal(data.total ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [siteId, search])

  useEffect(() => { load() }, [load])

  function exportCSV() {
    const headers = ['Name', 'Email', 'Phone', 'Bookings', 'Total Spend', 'Last Booking', 'Joined']
    const rows = customers.map(c => [
      c.name, c.email, c.phone || '',
      c.booking_count, `$${c.total_spend}`,
      c.last_booking_at ? new Date(c.last_booking_at).toLocaleDateString() : '',
      new Date(c.created_at).toLocaleDateString(),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalBookings = customers.reduce((s, c) => s + c.booking_count, 0)
  const totalSpend    = customers.reduce((s, c) => s + Number(c.total_spend), 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
            <Users size={18} />
            Customers
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} registered customer{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-500">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          {customers.length > 0 && (
            <button onClick={exportCSV} className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition">
              <Download size={13} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {customers.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Registered',      value: total,                         icon: Users,      color: 'text-blue-600' },
            { label: 'Total Bookings',  value: totalBookings,                 icon: TrendingUp, color: 'text-green-600' },
            { label: 'Total Spend',     value: `$${totalSpend.toFixed(2)}`,   icon: TrendingUp, color: 'text-purple-600' },
          ].map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
                <Icon size={14} className={`${s.color} mb-2`} />
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-100 rounded-2xl">
          <Users size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm mb-1">No customers yet</p>
          <p className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
            Customers who opt in to save their details during booking will appear here.
            Enable customer accounts to grow your database.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Customer</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden sm:table-cell">Contact</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Bookings</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden md:table-cell">Spend</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden lg:table-cell">Last Visit</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs hidden lg:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    <p className="text-gray-400 text-xs">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-col gap-0.5">
                      {c.phone && (
                        <span className="text-gray-500 text-xs flex items-center gap-1">
                          <Phone size={10} />{c.phone}
                        </span>
                      )}
                      <span className="text-gray-400 text-xs flex items-center gap-1">
                        <Mail size={10} />{c.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900">{c.booking_count}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-green-600 font-mono text-sm">${Number(c.total_spend).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-400 text-xs">
                      {c.last_booking_at
                        ? new Date(c.last_booking_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
                        : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-gray-400 text-xs">
                      {new Date(c.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Setup note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-blue-700 text-xs font-semibold mb-1">ℹ️ About Customer Accounts</p>
        <p className="text-blue-600 text-xs leading-relaxed">
          Customers appear here when they opt in to save their details during booking. Run{' '}
          <code className="font-mono bg-blue-100 px-1 rounded">supabase/site-customers.sql</code>{' '}
          to enable the customer database. Available on Growth+ plans.
        </p>
      </div>

      {/* Customer profile modal */}
      {selected && (
        <CustomerProfileModal
          customer={selected}
          siteId={siteId}
          primaryColor={primaryColor}
          onClose={() => setSelected(null)}
          onNotesUpdate={(id, notes) =>
            setCustomers(prev => prev.map(c => c.id === id ? { ...c, notes } : c))
          }
        />
      )}
    </div>
  )
}
