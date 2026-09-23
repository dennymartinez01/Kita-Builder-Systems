'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BUSINESS_TYPE_ICONS, BUSINESS_TYPE_LABELS } from '@/lib/templates'
import type { BusinessType } from '@/types/database'
import {
  Globe,
  CalendarCheck,
  Zap,
  KeyRound,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'

interface Stats {
  totalSites: number
  totalBookings: number
  pendingBookings: number
  sitesByType: Record<string, number>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSites: 0,
    totalBookings: 0,
    pendingBookings: 0,
    sitesByType: {},
  })
  const [recentSites, setRecentSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const [sitesRes, bookingsRes, pendingRes, recentRes] = await Promise.all([
        supabase.from('sites').select('id, business_type', { count: 'exact' }),
        supabase.from('bookings').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('sites').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      const byType: Record<string, number> = {}
      sitesRes.data?.forEach((s: any) => {
        byType[s.business_type] = (byType[s.business_type] || 0) + 1
      })

      setStats({
        totalSites: sitesRes.count || 0,
        totalBookings: bookingsRes.count || 0,
        pendingBookings: pendingRes.count || 0,
        sitesByType: byType,
      })
      setRecentSites(recentRes.data || [])
    } catch (e) {
      // Supabase not yet connected — show zeros
    } finally {
      setLoading(false)
    }
  }

  const QUICK_ACTIONS = [
    { href: '/admin/generate', label: 'Generate New Site', icon: Zap, color: 'bg-blue-600 hover:bg-blue-700' },
    { href: '/admin/credentials', label: 'Manage API Keys', icon: KeyRound, color: 'bg-gray-700 hover:bg-gray-600' },
    { href: '/admin/templates', label: 'Browse Templates', icon: Layers, color: 'bg-gray-700 hover:bg-gray-600' },
    { href: '/admin/sites', label: 'View All Sites', icon: Globe, color: 'bg-gray-700 hover:bg-gray-600' },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Good day, Denny 👋</h1>
        <p className="text-gray-400 mt-1 text-sm">
          KITA Builder Systems — <span className="text-blue-400">From Struggle to Booked.</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Sites', value: stats.totalSites, icon: Globe, color: 'text-blue-400' },
          { label: 'Total Bookings', value: stats.totalBookings, icon: CalendarCheck, color: 'text-green-400' },
          { label: 'Pending Bookings', value: stats.pendingBookings, icon: TrendingUp, color: 'text-yellow-400' },
          { label: 'Templates Ready', value: 5, icon: Layers, color: 'text-purple-400' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-xs font-medium">{stat.label}</span>
                <Icon size={16} className={stat.color} />
              </div>
              <div className="text-3xl font-bold text-white">
                {loading ? <span className="text-gray-700">—</span> : stat.value}
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Actions</h2>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(action => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-white text-sm font-medium transition ${action.color}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    {action.label}
                  </div>
                  <ArrowRight size={14} className="opacity-60" />
                </Link>
              )
            })}
          </div>

          {/* Sites by Type */}
          {Object.keys(stats.sitesByType).length > 0 && (
            <div className="mt-6">
              <h2 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Sites by Type</h2>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
                {Object.entries(stats.sitesByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {BUSINESS_TYPE_ICONS[type as BusinessType]} {BUSINESS_TYPE_LABELS[type as BusinessType]}
                    </span>
                    <span className="text-white font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Sites */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Recent Sites</h2>
            <Link href="/admin/sites" className="text-blue-400 text-xs hover:underline">View all →</Link>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-600 text-sm">Loading...</div>
            ) : recentSites.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm mb-3">No sites generated yet.</p>
                <Link
                  href="/admin/generate"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                >
                  <Zap size={14} />
                  Generate your first site
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Business</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Type</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Slug</th>
                    <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSites.map((site: any) => (
                    <tr key={site.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                      <td className="px-4 py-3 text-white font-medium">{site.business_name}</td>
                      <td className="px-4 py-3 text-gray-400">
                        {BUSINESS_TYPE_ICONS[site.business_type as BusinessType]} {site.business_type}
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">/{site.slug}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <a
                            href={`/${site.slug}`}
                            target="_blank"
                            className="text-blue-400 hover:underline text-xs"
                          >
                            View
                          </a>
                          <a
                            href={`/${site.slug}/dashboard`}
                            target="_blank"
                            className="text-green-400 hover:underline text-xs"
                          >
                            Dashboard
                          </a>
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

      {/* Setup reminder */}
      <div className="mt-8 bg-yellow-950/40 border border-yellow-900/50 rounded-xl p-4">
        <h3 className="text-yellow-400 font-semibold text-sm mb-1">⚠️ Setup Checklist</h3>
        <p className="text-yellow-200/60 text-xs mb-3">Complete these before generating your first site:</p>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-yellow-200/50">
          <div>1. Add <span className="font-mono text-yellow-300">NEXT_PUBLIC_SUPABASE_URL</span> to .env.local</div>
          <div>2. Add <span className="font-mono text-yellow-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> to .env.local</div>
          <div>3. Add <span className="font-mono text-yellow-300">OPENAI_API_KEY</span> to .env.local</div>
          <div>4. Add <span className="font-mono text-yellow-300">RESEND_API_KEY</span> to .env.local</div>
          <div>5. Run <span className="font-mono text-yellow-300">supabase/schema.sql</span> in Supabase SQL Editor</div>
          <div>6. Go to <Link href="/admin/credentials" className="text-yellow-400 underline">Credentials page</Link> to track all keys</div>
        </div>
      </div>
    </div>
  )
}
