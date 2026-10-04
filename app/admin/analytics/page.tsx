'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  BarChart2, TrendingUp, DollarSign, Users, Globe,
  Inbox, Calendar, RefreshCw, ArrowUpRight, Eye,
} from 'lucide-react'

/**
 * Admin Analytics Dashboard — Phase 16
 *
 * What:  Cross-site operator overview — MRR, growth, bookings, leads,
 *        plan distribution, 30-day sparklines, top clients.
 * Why:   Gives the operator a single health view across all client sites
 *        without needing to open each Client 360 individually.
 * Who:   Admin.
 * Status: Active — Phase 16
 */

// ── Types ─────────────────────────────────────────────────────
interface AnalyticsData {
  kpis: {
    mrr: number
    arr: number
    total_clients: number
    active_clients: number
    trial_clients: number
    total_sites: number
    paid_sites: number
    setup_revenue: number
    new_clients_30d: number
    new_bookings_30d: number
    new_leads_30d: number
    page_views_30d: number
    total_leads: number
  }
  plan_dist:      Record<string, number>
  lead_funnel:    Record<string, number>
  top_clients:    { id: string; name: string; email: string; plan: string; mrr: number; sites: number }[]
  daily_labels:   string[]
  daily_bookings: number[]
  daily_signups:  number[]
  daily_views:    number[]
  recent_clients: { id: string; name: string; email: string; plan: string; status: string; joined: string }[]
}

// ── Helpers ───────────────────────────────────────────────────
const PLAN_COLORS: Record<string, string> = {
  trial:   'bg-gray-800 text-gray-400',
  starter: 'bg-blue-900/50 text-blue-400',
  growth:  'bg-green-900/50 text-green-400',
  agency:  'bg-purple-900/50 text-purple-400',
  custom:  'bg-yellow-900/50 text-yellow-400',
}

const STATUS_COLORS: Record<string, string> = {
  trial:     'text-gray-400',
  active:    'text-green-400',
  overdue:   'text-red-400',
  paused:    'text-yellow-400',
  cancelled: 'text-gray-600',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86_400_000)
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}

// ── Inline bar chart (no lib) ─────────────────────────────────
function BarSparkline({
  values,
  color = '#3b82f6',
  height = 56,
  label,
}: {
  values: number[]
  color?: string
  height?: number
  label?: string
}) {
  const max = Math.max(...values, 1)
  const w   = 8   // bar width
  const gap = 3   // gap between bars
  const total = values.length * (w + gap) - gap

  return (
    <div>
      {label && <p className="text-gray-600 text-xs mb-1">{label}</p>}
      <svg
        width={total}
        height={height}
        viewBox={`0 0 ${total} ${height}`}
        className="overflow-visible"
        aria-hidden
      >
        {values.map((v, i) => {
          const barH = Math.max(2, (v / max) * height)
          const x    = i * (w + gap)
          const y    = height - barH
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={barH}
              rx={2}
              fill={v > 0 ? color : '#1f2937'}
              opacity={v > 0 ? 0.85 : 0.3}
            >
              <title>{`${v}`}</title>
            </rect>
          )
        })}
      </svg>
    </div>
  )
}

// ── Donut-style plan breakdown (SVG arc) ──────────────────────
function PlanDonut({ dist }: { dist: Record<string, number> }) {
  const palette: Record<string, string> = {
    trial:   '#4b5563',
    starter: '#3b82f6',
    growth:  '#22c55e',
    agency:  '#a855f7',
    custom:  '#eab308',
  }
  const total  = Object.values(dist).reduce((a, b) => a + b, 0)
  if (total === 0) return <p className="text-gray-600 text-xs py-4 text-center">No clients yet</p>

  const R = 36, cx = 44, cy = 44, stroke = 12
  let cumulative = 0
  const slices: { key: string; dashArray: string; dashOffset: number; color: string }[] = []
  const circumference = 2 * Math.PI * R

  for (const [key, count] of Object.entries(dist)) {
    if (count === 0) continue
    const ratio    = count / total
    const dash     = ratio * circumference
    const offset   = circumference - cumulative * circumference
    slices.push({ key, dashArray: `${dash} ${circumference - dash}`, dashOffset: offset, color: palette[key] ?? '#6b7280' })
    cumulative += ratio
  }

  return (
    <div className="flex items-center gap-5">
      <svg width={88} height={88} viewBox="0 0 88 88" className="shrink-0" aria-hidden>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1f2937" strokeWidth={stroke} />
        {slices.map(s => (
          <circle
            key={s.key}
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={s.dashArray}
            strokeDashoffset={s.dashOffset}
            strokeLinecap="butt"
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}
        <text x={cx} y={cy + 5} textAnchor="middle" fill="white" fontSize={14} fontWeight="bold">{total}</text>
      </svg>
      <div className="space-y-1.5">
        {Object.entries(dist).filter(([, v]) => v > 0).map(([key, count]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: palette[key] ?? '#6b7280' }} />
            <span className="text-gray-400 text-xs capitalize">{key}</span>
            <span className="text-white text-xs font-bold ml-auto pl-3">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Lead funnel bar ───────────────────────────────────────────
function LeadFunnel({ funnel }: { funnel: Record<string, number> }) {
  const order  = ['new', 'contacted', 'converted', 'closed']
  const colors: Record<string, string> = {
    new:       'bg-blue-500',
    contacted: 'bg-yellow-500',
    converted: 'bg-green-500',
    closed:    'bg-gray-600',
  }
  const total = Object.values(funnel).reduce((a, b) => a + b, 0)
  if (total === 0) return <p className="text-gray-600 text-xs py-2">No leads yet</p>

  return (
    <div className="space-y-2.5">
      {order.map(key => {
        const count = funnel[key] ?? 0
        const pct   = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs capitalize">{key}</span>
              <span className="text-gray-300 text-xs font-bold">{count} <span className="text-gray-600 font-normal">({pct}%)</span></span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${colors[key]}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Page component ─────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const [data, setData]       = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/analytics')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load analytics')
      setData(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── KPI definitions (resolved once data arrives) ──────────
  const kpiCards = data ? [
    {
      label:  'Monthly Recurring Revenue',
      value:  `$${data.kpis.mrr.toLocaleString()}/mo`,
      sub:    `$${(data.kpis.arr).toLocaleString()}/yr ARR`,
      icon:   DollarSign,
      color:  'text-green-400',
      bg:     'bg-green-950/20 border-green-800/40',
    },
    {
      label:  'Active Clients',
      value:  data.kpis.active_clients,
      sub:    `${data.kpis.trial_clients} on trial · ${data.kpis.total_clients} total`,
      icon:   Users,
      color:  'text-blue-400',
      bg:     'bg-blue-950/20 border-blue-800/40',
    },
    {
      label:  'Total Sites',
      value:  data.kpis.total_sites,
      sub:    `${data.kpis.paid_sites} paid · $${data.kpis.setup_revenue.toLocaleString()} setup rev`,
      icon:   Globe,
      color:  'text-purple-400',
      bg:     'bg-purple-950/20 border-purple-800/40',
    },
    {
      label:  'New Bookings (30d)',
      value:  data.kpis.new_bookings_30d,
      sub:    'across all client sites',
      icon:   Calendar,
      color:  'text-yellow-400',
      bg:     'bg-yellow-950/20 border-yellow-800/40',
    },
    {
      label:  'New Leads (30d)',
      value:  data.kpis.new_leads_30d,
      sub:    `${data.kpis.total_leads} total leads`,
      icon:   Inbox,
      color:  'text-pink-400',
      bg:     'bg-pink-950/20 border-pink-800/40',
    },
    {
      label:  'Page Views (30d)',
      value:  data.kpis.page_views_30d.toLocaleString(),
      sub:    'visits across all client sites',
      icon:   Eye,
      color:  'text-cyan-400',
      bg:     'bg-cyan-950/20 border-cyan-800/40',
    },
    {
      label:  'New Clients (30d)',
      value:  data.kpis.new_clients_30d,
      sub:    'recently joined',
      icon:   TrendingUp,
      color:  'text-orange-400',
      bg:     'bg-orange-950/20 border-orange-800/40',
    },
  ] : []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 size={24} className="text-blue-400" />
            Analytics Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Cross-site operator overview — last 30 days.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/50 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* ── KPI Strip ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {loading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="border border-gray-800 rounded-xl p-4 animate-pulse bg-gray-900 h-24" />
            ))
          : kpiCards.map(card => {
              const Icon = card.icon
              return (
                <div key={card.label} className={`border rounded-xl p-4 ${card.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-xs leading-tight">{card.label}</p>
                    <Icon size={14} className={card.color} />
                  </div>
                  <p className={`text-xl font-black ${card.color}`}>{card.value}</p>
                  <p className="text-gray-600 text-xs mt-0.5 leading-tight">{card.sub}</p>
                </div>
              )
            })
        }
      </div>

      {/* ── Sparkline charts ────────────────────────────────── */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Bookings (30d)',     values: data.daily_bookings, color: '#eab308', total: data.kpis.new_bookings_30d },
            { title: 'New Clients (30d)',  values: data.daily_signups,  color: '#3b82f6', total: data.kpis.new_clients_30d  },
            { title: 'Page Views (30d)',   values: data.daily_views,    color: '#06b6d4', total: data.kpis.page_views_30d   },
          ].map(chart => (
            <div key={chart.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white text-sm font-semibold">{chart.title}</p>
                <span className="text-gray-400 text-xs font-mono">{chart.total.toLocaleString()}</span>
              </div>
              <div className="overflow-x-auto">
                <BarSparkline values={chart.values} color={chart.color} height={64} />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-gray-700 text-xs">{data.daily_labels[0]}</span>
                <span className="text-gray-700 text-xs">{data.daily_labels[data.daily_labels.length - 1]}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Mid row: Plan breakdown + Lead funnel + Top clients ─ */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Plan distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
              <Users size={14} className="text-blue-400" /> Client Plans
            </p>
            <PlanDonut dist={data.plan_dist} />
          </div>

          {/* Lead funnel */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
              <Inbox size={14} className="text-pink-400" /> Lead Funnel
            </p>
            <LeadFunnel funnel={data.lead_funnel} />
            <Link
              href="/admin/leads"
              className="mt-4 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
            >
              View all leads <ArrowUpRight size={11} />
            </Link>
          </div>

          {/* Top clients by MRR */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-white text-sm font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-green-400" /> Top Clients by MRR
            </p>
            {data.top_clients.length === 0 ? (
              <p className="text-gray-600 text-xs py-2">No active paying clients yet.</p>
            ) : (
              <div className="space-y-2.5">
                {data.top_clients.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-gray-700 text-xs w-4 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{c.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-xs px-1.5 py-px rounded-full font-medium ${PLAN_COLORS[c.plan] ?? 'bg-gray-800 text-gray-400'}`}>
                          {c.plan}
                        </span>
                        <span className="text-gray-600 text-xs">{c.sites} site{c.sites !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <span className="text-green-400 font-mono text-xs font-bold shrink-0">
                      ${c.mrr}/mo
                    </span>
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="text-gray-600 hover:text-blue-400 transition"
                    >
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <Link
              href="/admin/clients"
              className="mt-4 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
            >
              All clients <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Recent signups ───────────────────────────────────── */}
      {data && data.recent_clients.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <p className="text-white text-sm font-semibold flex items-center gap-2">
              <Users size={14} className="text-blue-400" /> Recent Signups
            </p>
            <Link href="/admin/clients" className="text-xs text-blue-400 hover:text-blue-300 transition">
              View all →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['Client', 'Plan', 'Status', 'Joined', ''].map(h => (
                  <th key={h} className="text-left text-gray-500 font-medium px-5 py-3 text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recent_clients.map(c => (
                <tr key={c.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition">
                  <td className="px-5 py-3">
                    <p className="text-white text-sm">{c.name}</p>
                    <p className="text-gray-600 text-xs">{c.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[c.plan] ?? 'bg-gray-800 text-gray-400'}`}>
                      {c.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs capitalize font-medium ${STATUS_COLORS[c.status] ?? 'text-gray-400'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{timeAgo(c.joined)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="text-gray-600 hover:text-blue-400 text-xs transition"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}
