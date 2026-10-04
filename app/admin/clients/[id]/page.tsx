'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Client, Site, EffectiveEntitlements } from '@/types/database'
import { FEATURE_CATEGORIES } from '@/lib/entitlements'
import { calculateTrialDates, formatTrialCountdown, formatDate, getTrialStatus, TRIAL_DURATION_OPTIONS } from '@/lib/trial'
import { CATEGORY_ICONS, SEVERITY_COLORS } from '@/lib/events'
import { startImpersonation } from '@/lib/impersonation'
import { logEvent, ET } from '@/lib/events'
import RankBadge from '@/components/RankBadge'
import {
  ArrowLeft, User, Mail, Phone, Globe, MapPin,
  CreditCard, ExternalLink, LayoutDashboard,
  Save, Trash2, Loader2, CheckCircle, AlertCircle,
  Edit3, Building2, ShieldCheck, ToggleLeft, ToggleRight,
  RefreshCw, Info, Timer, TrendingUp, DollarSign,
  BarChart2, Users, Activity, MessageSquare, Calendar,
  ArrowUpCircle, ArrowDownCircle, PauseCircle, XCircle,
  Zap, RotateCcw, Clock, BookOpen, Tag, Eye, Brain, Link2,
} from 'lucide-react'
import type { CRMMatch, CRMSummary } from '@/app/api/crm/matches/[clientId]/route'

// ── Constants ─────────────────────────────────────────────────
const PLAN_OPTIONS   = ['trial', 'starter', 'growth', 'agency', 'custom']
const STATUS_OPTIONS = ['trial', 'active', 'overdue', 'paused', 'cancelled']
const SOURCE_OPTIONS = ['outreach', 'referral', 'organic', 'audit', 'direct', 'other']
const MONTHLY_RATES: Record<string, number> = {
  trial: 0, starter: 29, growth: 49, agency: 99, custom: 0,
}
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

type Tab360 = 'overview' | 'profile' | 'bookings' | 'customers' | 'activity' | 'features' | 'notes' | 'intelligence'

const TABS: { id: Tab360; label: string; icon: any }[] = [
  { id: 'overview',      label: 'Overview',      icon: BarChart2 },
  { id: 'profile',       label: 'Profile',       icon: User },
  { id: 'bookings',      label: 'Bookings',      icon: Calendar },
  { id: 'customers',     label: 'Customers',     icon: Users },
  { id: 'activity',      label: 'Activity',      icon: Activity },
  { id: 'features',      label: 'Features',      icon: ShieldCheck },
  { id: 'notes',         label: 'Notes',         icon: MessageSquare },
  { id: 'intelligence',  label: 'Intelligence',  icon: Brain },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Component ─────────────────────────────────────────────────
export default function Client360Page() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [activeTab, setActiveTab]   = useState<Tab360>('overview')
  const [client, setClient]         = useState<Client | null>(null)
  const [sites, setSites]           = useState<Site[]>([])
  const [loading, setLoading]       = useState(true)

  // Profile edit
  const [editing, setEditing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState(false)
  const [form, setForm]             = useState<Partial<Client>>({})

  // Overview data
  const [overview, setOverview]           = useState<any>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)

  // Bookings tab
  const [bookings, setBookings]     = useState<any[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  // Customers tab
  const [customers, setCustomers]   = useState<any[]>([])
  const [customersLoading, setCustomersLoading] = useState(false)

  // Activity tab
  const [events, setEvents]         = useState<any[]>([])
  const [eventsLoading, setEventsLoading]   = useState(false)

  // Entitlements
  const [entitlements, setEntitlements]   = useState<EffectiveEntitlements>({})
  const [features, setFeatures]           = useState<any[]>([])
  const [entPlan, setEntPlan]             = useState('')
  const [entLoading, setEntLoading]       = useState(false)
  const [togglingKey, setTogglingKey]     = useState<string | null>(null)
  const [overrideReason, setOverrideReason] = useState('')

  // CRM Intelligence tab
  const [intelMatches, setIntelMatches]     = useState<CRMMatch[]>([])
  const [intelSummary, setIntelSummary]     = useState<CRMSummary | null>(null)
  const [intelLoading, setIntelLoading]     = useState(false)
  const [intelConfirming, setIntelConfirming] = useState<string | null>(null)

  // Subscription override
  const [subAction, setSubAction]         = useState<string | null>(null)
  const [subLoading, setSubLoading]       = useState(false)
  const [subStatus, setSubStatus]         = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [subTargetPlan, setSubTargetPlan] = useState('')
  const [subExtendDays, setSubExtendDays] = useState(14)
  const [subReason, setSubReason]         = useState('')

  // ── Loaders ───────────────────────────────────────────────
  useEffect(() => { loadClient() }, [id])

  async function loadClient() {
    setLoading(true)
    const [clientRes, sitesRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('sites').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    ])
    if (clientRes.data) { setClient(clientRes.data); setForm(clientRes.data) }
    setSites(sitesRes.data || [])
    setLoading(false)
  }

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true)
    try {
      const res  = await fetch(`/api/clients/${id}/overview`)
      const data = await res.json()
      if (res.ok) setOverview(data)
    } finally { setOverviewLoading(false) }
  }, [id])

  const loadBookings = useCallback(async () => {
    if (!sites.length && !client) return
    setBookingsLoading(true)
    const siteIds = sites.map(s => s.id)
    if (!siteIds.length) { setBookingsLoading(false); return }
    const { data } = await supabase
      .from('bookings')
      .select('id, site_id, customer_name, customer_email, service_name, booking_date, booking_time, status, created_at')
      .in('site_id', siteIds)
      .order('booking_date', { ascending: false })
      .limit(50)
    setBookings(data ?? [])
    setBookingsLoading(false)
  }, [sites, client])

  const loadCustomers = useCallback(async () => {
    const siteIds = sites.map(s => s.id)
    if (!siteIds.length) return
    setCustomersLoading(true)
    try {
      const res  = await fetch(`/api/customers?site_id=${siteIds[0]}&limit=50`)
      const data = await res.json()
      // For multiple sites merge results
      if (siteIds.length > 1) {
        const all = [...(data.customers ?? [])]
        for (let i = 1; i < siteIds.length; i++) {
          const r = await fetch(`/api/customers?site_id=${siteIds[i]}&limit=50`)
          const d = await r.json()
          all.push(...(d.customers ?? []))
        }
        setCustomers(all)
      } else {
        setCustomers(data.customers ?? [])
      }
    } finally { setCustomersLoading(false) }
  }, [sites])

  const loadEvents = useCallback(async () => {
    const siteIds = sites.map(s => s.id)
    if (!siteIds.length) { setEvents([]); return }
    setEventsLoading(true)
    try {
      const res  = await fetch(`/api/events?client_id=${id}&limit=30`)
      const data = await res.json()
      setEvents(data.events ?? [])
    } finally { setEventsLoading(false) }
  }, [id, sites])

  const loadEntitlements = useCallback(async () => {
    setEntLoading(true)
    try {
      const res  = await fetch(`/api/entitlements/${id}`)
      const data = await res.json()
      if (res.ok) { setEntitlements(data.effective); setFeatures(data.features); setEntPlan(data.plan) }
    } finally { setEntLoading(false) }
  }, [id])

  const loadIntelligence = useCallback(async () => {
    setIntelLoading(true)
    try {
      const res  = await fetch(`/api/crm/matches/${id}`)
      const data = await res.json()
      if (res.ok) { setIntelMatches(data.matches ?? []); setIntelSummary(data.summary ?? null) }
    } finally { setIntelLoading(false) }
  }, [id])

  // Lazy-load tab data on first open
  useEffect(() => {
    if (activeTab === 'overview'      && !overview)               loadOverview()
    if (activeTab === 'bookings'      && bookings.length === 0)   loadBookings()
    if (activeTab === 'customers'     && customers.length === 0)  loadCustomers()
    if (activeTab === 'activity'      && events.length === 0)     loadEvents()
    if (activeTab === 'features'      && features.length === 0)   loadEntitlements()
    if (activeTab === 'intelligence'  && intelMatches.length === 0 && !intelSummary) loadIntelligence()
  }, [activeTab])

  // ── Profile actions ───────────────────────────────────────
  async function saveClient() {
    if (!client) return
    setSaving(true)
    const { error } = await supabase.from('clients').update(form as any).eq('id', id)
    if (!error) {
      setClient({ ...client, ...form } as Client)
      setSaved(true); setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  async function deleteClient() {
    if (!confirm(`Delete client "${client?.name}"? This will unlink their sites but not delete them.`)) return
    await supabase.from('clients').delete().eq('id', id)
    router.push('/admin/clients')
  }

  // ── Subscription override ─────────────────────────────────
  async function handleSubAction(action: string) {
    if (['cancel', 'terminate'].includes(action)) {
      if (!confirm(`${action === 'terminate' ? 'TERMINATE' : 'Cancel'} subscription for ${client?.name}?`)) return
    }
    setSubLoading(true); setSubStatus(null)
    try {
      const body: any = { action, reason: subReason || undefined }
      if (subTargetPlan) body.target_plan = subTargetPlan
      if (action === 'extend') body.extend_days = subExtendDays
      const res  = await fetch(`/api/clients/${id}/subscription`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      setClient(data.client); setForm(data.client)
      setSubAction(null); setSubTargetPlan(''); setSubReason('')
      setSubStatus({ type: 'success', msg: `${action} completed.` })
      setTimeout(() => setSubStatus(null), 3000)
    } catch (err: any) {
      setSubStatus({ type: 'error', msg: err.message })
    } finally { setSubLoading(false) }
  }

  // ── Entitlements ──────────────────────────────────────────
  async function toggleFeature(featureKey: string, currentEnabled: boolean, isOverride: boolean) {
    setTogglingKey(featureKey)
    try {
      const res  = await fetch(`/api/entitlements/${id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_key: featureKey,
          enabled: isOverride ? null : !currentEnabled,
          override_reason: overrideReason || `Admin toggle`,
        }),
      })
      const data = await res.json()
      if (res.ok) setEntitlements(data.effective)
    } finally { setTogglingKey(null) }
  }

  // ── Guards ────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 size={24} className="text-blue-400 animate-spin" />
    </div>
  )
  if (!client) return (
    <div className="p-6 text-center">
      <p className="text-gray-400 mb-3">Client not found.</p>
      <Link href="/admin/clients" className="text-blue-400 text-sm hover:underline">← Back to clients</Link>
    </div>
  )

  const mrr        = client.subscription_status === 'active' ? (MONTHLY_RATES[client.subscription_plan] || 0) : 0
  const totalSetup = sites.filter(s => (s as any).payment_status === 'paid').length * 150
  const countdown  = formatTrialCountdown(client)
  const trialSt    = getTrialStatus(client)
  const featuresByCategory = FEATURE_CATEGORIES.map(cat => ({
    ...cat, items: features.filter((f: any) => f.category === cat.key),
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Link href="/admin/clients" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-2 transition">
            <ArrowLeft size={12} /> All Clients
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold capitalize ${PLAN_COLORS[client.subscription_plan] || 'bg-gray-800 text-gray-400'}`}>
              {client.subscription_plan}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[client.subscription_status] || 'bg-gray-800 text-gray-400'}`}>
              {client.subscription_status}
            </span>
            {client.subscription_status === 'trial' && (
              <span className={`text-xs font-mono font-bold ${countdown.color}`}>{countdown.label}</span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-0.5">{client.email} {client.country ? `· ${client.country}` : ''} {client.city ? `· ${client.city}` : ''}</p>
        </div>
        <div className="flex gap-2 items-center">
          {saved && <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle size={13} /> Saved</span>}
          <button onClick={deleteClient} className="bg-gray-800 hover:bg-red-900/50 text-gray-500 hover:text-red-400 p-2 rounded-lg transition">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ── STAT STRIP ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'MRR',        value: mrr > 0 ? `$${mrr}/mo` : '—',                   color: 'text-green-400' },
          { label: 'Sites',      value: sites.length,                                    color: 'text-blue-400' },
          { label: 'Setup Fees', value: totalSetup > 0 ? `$${totalSetup}` : '—',         color: 'text-purple-400' },
          { label: 'Member Since', value: new Date(client.created_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }), color: 'text-gray-300' },
          { label: 'Onboarding', value: client.onboarding_complete ? '✅ Done' : '⏳ Pending', color: client.onboarding_complete ? 'text-green-400' : 'text-yellow-400' },
          { label: 'Source',     value: client.source || '—',                            color: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5">
            <p className="text-gray-600 text-xs mb-0.5">{s.label}</p>
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── RANK BADGES (one per site) ──────────────────────── */}
      {sites.length > 0 && (
        <div className="mb-6">
          <p className="text-gray-500 text-xs font-medium mb-3">Business Rank</p>
          <div className={`grid gap-4 ${sites.length === 1 ? 'grid-cols-1 max-w-sm' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {sites.slice(0, 2).map(s => (
              <div key={s.id}>
                <p className="text-gray-600 text-xs mb-2">{s.business_name}</p>
                <RankBadge siteId={s.id} compact={false} darkMode={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB BAR ────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={12} />{t.label}
            </button>
          )
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB: OVERVIEW
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {overviewLoading ? (
            <div className="text-center py-16 text-gray-600 text-sm flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading overview...
            </div>
          ) : overview ? (
            <>
              {/* Key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Bookings',    value: overview.stats.bookings_total,  color: 'text-blue-400',   bg: 'bg-blue-950/20 border-blue-800/40' },
                  { label: 'Customers',         value: overview.stats.customers_total, color: 'text-green-400',  bg: 'bg-green-950/20 border-green-800/40' },
                  { label: 'Page Views (30d)',  value: overview.stats.page_views_30d,  color: 'text-purple-400', bg: 'bg-purple-950/20 border-purple-800/40' },
                  { label: 'Active Coupons',    value: overview.stats.coupons_active,  color: 'text-yellow-400', bg: 'bg-yellow-950/20 border-yellow-800/40' },
                ].map(s => (
                  <div key={s.label} className={`border rounded-2xl p-5 ${s.bg}`}>
                    <p className="text-gray-500 text-xs mb-2">{s.label}</p>
                    <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Revenue summary */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                  <DollarSign size={14} className="text-green-400" /> Revenue Summary
                </h3>
                <div className="grid sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Monthly (MRR)',    value: `$${overview.stats.mrr}`,             color: 'text-green-400' },
                    { label: 'Setup Fees Paid',  value: `$${overview.stats.setup_fees_total}`, color: 'text-blue-400' },
                    { label: 'Projected Annual', value: `$${overview.stats.arr}`,              color: 'text-purple-400' },
                    { label: 'Paid Sites',       value: `${overview.stats.sites_paid} / ${overview.stats.sites_total}`, color: 'text-white' },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                      <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sites + Recent Bookings side by side */}
              <div className="grid lg:grid-cols-2 gap-5">
                {/* Sites */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                      <Building2 size={13} className="text-purple-400" /> Sites ({overview.sites.length})
                    </h3>
                    <Link href="/admin/generate" className="text-blue-400 text-xs hover:underline">+ New</Link>
                  </div>
                  {overview.sites.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 text-sm">No sites yet.</div>
                  ) : (
                    <div className="divide-y divide-gray-800/50">
                      {overview.sites.map((s: any) => (
                        <div key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-800/30 transition">
                          <div>
                            <p className="text-white text-sm font-medium">{s.business_name}</p>
                            <p className="text-gray-500 text-xs capitalize">{s.business_type} · <span className={s.payment_status === 'paid' ? 'text-green-400' : 'text-gray-500'}>{s.payment_status || 'free'}</span></p>
                          </div>
                          <div className="flex gap-2">
                            <a href={`/${s.slug}`} target="_blank" className="text-gray-500 hover:text-blue-400 transition" title="View public site"><ExternalLink size={13} /></a>
                            <a href={`/${s.slug}/dashboard`} target="_blank" className="text-gray-500 hover:text-green-400 transition" title="Owner dashboard"><LayoutDashboard size={13} /></a>
                            <button
                              onClick={() => {
                                startImpersonation({
                                  siteId:       s.id,
                                  siteSlug:     s.slug,
                                  businessName: s.business_name,
                                  clientId:     client?.id ?? null,
                                  startedAt:    new Date().toISOString(),
                                })
                                logEvent({
                                  event_type: ET.AUTH_IMPERSONATION_STARTED,
                                  category:   'auth',
                                  severity:   'info',
                                  actor_type: 'admin',
                                  actor_id:   'admin',
                                  site_id:    s.id,
                                  client_id:  client?.id,
                                  summary:    `Admin started viewing ${s.business_name} as client`,
                                }).catch(() => {})
                                window.open(`/${s.slug}/dashboard`, '_blank')
                              }}
                              className="text-gray-500 hover:text-purple-400 transition"
                              title="View as Client (admin impersonation)"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Bookings */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-800">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                      <Calendar size={13} className="text-blue-400" /> Recent Bookings
                    </h3>
                  </div>
                  {overview.recent_bookings.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 text-sm">No bookings yet.</div>
                  ) : (
                    <div className="divide-y divide-gray-800/50">
                      {overview.recent_bookings.map((b: any) => (
                        <div key={b.id} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-white text-xs font-medium">{b.customer_name}</p>
                            <p className="text-gray-500 text-xs">{b.service_name} · {b.booking_date}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                            b.status === 'confirmed' ? 'bg-green-900/50 text-green-400' :
                            b.status === 'cancelled' ? 'bg-red-900/50 text-red-400' :
                            'bg-yellow-900/50 text-yellow-400'
                          }`}>{b.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Events */}
              {overview.recent_events.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                      <Activity size={13} className="text-yellow-400" /> Recent Activity
                    </h3>
                    <button onClick={() => setActiveTab('activity')} className="text-blue-400 text-xs hover:underline">View all</button>
                  </div>
                  <div className="divide-y divide-gray-800/50">
                    {overview.recent_events.slice(0, 5).map((e: any) => (
                      <div key={e.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-800/30 transition">
                        <span className="text-base shrink-0">{CATEGORY_ICONS[e.category] ?? '⚙️'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-300 text-xs leading-relaxed">{e.summary}</p>
                          <p className="text-gray-600 text-xs mt-0.5">{timeAgo(e.occurred_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-gray-600 text-sm">
              <p className="mb-2">No overview data yet.</p>
              <button onClick={loadOverview} className="text-blue-400 text-xs hover:underline">Load overview</button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: PROFILE
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {/* Contact */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-sm flex items-center gap-2"><User size={14} className="text-blue-400" /> Contact</h2>
                <div className="flex gap-2">
                  {saved && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Saved</span>}
                  <button
                    onClick={() => editing ? saveClient() : setEditing(true)}
                    disabled={saving}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : editing ? <Save size={12} /> : <Edit3 size={12} />}
                    {editing ? (saving ? 'Saving...' : 'Save') : 'Edit'}
                  </button>
                  {editing && (
                    <button onClick={() => { setEditing(false); setForm(client) }} className="bg-gray-800 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition">Cancel</button>
                  )}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name',        key: 'name',    type: 'text',  placeholder: 'Full name' },
                  { label: 'Email',            key: 'email',   type: 'email', placeholder: 'email@example.com' },
                  { label: 'Phone / WhatsApp', key: 'phone',   type: 'tel',   placeholder: '+61 400 000 000' },
                  { label: 'Country',          key: 'country', type: 'text',  placeholder: 'AU, PH, US' },
                  { label: 'City',             key: 'city',    type: 'text',  placeholder: 'Sydney' },
                  { label: 'Source',           key: 'source',  type: 'select', options: SOURCE_OPTIONS },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-gray-500 text-xs mb-1 block">{f.label}</label>
                    {editing ? (
                      f.type === 'select' ? (
                        <select value={(form as any)[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                          <option value="">— Not set —</option>
                          {(f as any).options?.map((o: string) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input type={f.type} value={(form as any)[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={(f as any).placeholder}
                          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                      )
                    ) : (
                      <p className="text-white text-sm">{(client as any)[f.key] || <span className="text-gray-600 italic">Not set</span>}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><CreditCard size={14} className="text-green-400" /> Subscription</h2>
              <div className="grid sm:grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Plan',   key: 'subscription_plan',   options: PLAN_OPTIONS },
                  { label: 'Status', key: 'subscription_status', options: STATUS_OPTIONS },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-gray-500 text-xs mb-1 block">{f.label}</label>
                    {editing ? (
                      <select value={(form as any)[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <span className="text-white text-sm capitalize">{(client as any)[f.key]}</span>
                    )}
                  </div>
                ))}
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">MRR</label>
                  <p className="text-green-400 font-mono text-sm font-bold">${mrr}/mo</p>
                </div>
              </div>

              {/* Trial block */}
              {(client.subscription_plan === 'trial' || client.subscription_status === 'trial') && (() => {
                const currentDuration = (form.trial_duration_days ?? client.trial_duration_days) || 14
                return (
                  <div className="bg-blue-950/20 border border-blue-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><Timer size={13} className="text-blue-400" /><span className="text-blue-400 text-xs font-semibold">Trial Period</span></div>
                      <span className={`text-xs font-bold ${countdown.color}`}>{countdown.label}</span>
                    </div>
                    {editing && (
                      <div className="mb-3">
                        <p className="text-gray-500 text-xs mb-2">Duration</p>
                        <div className="flex flex-wrap gap-2">
                          {TRIAL_DURATION_OPTIONS.map(days => (
                            <button key={days} type="button"
                              onClick={() => {
                                const dates = calculateTrialDates(days, client.trial_starts_at ? new Date(client.trial_starts_at) : undefined)
                                setForm(p => ({ ...p, trial_duration_days: days, trial_ends_at: dates.trial_ends_at, trial_starts_at: dates.trial_starts_at }))
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${currentDuration === days ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}>
                              {days} days
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-gray-600 mb-0.5">Started</p><p className="text-gray-300">{formatDate(client.trial_starts_at)}</p></div>
                      <div><p className="text-gray-600 mb-0.5">Expires</p>
                        <p className={`font-medium ${trialSt.state === 'expired' ? 'text-red-400' : trialSt.state === 'expiring' ? 'text-yellow-400' : 'text-gray-300'}`}>
                          {formatDate(editing ? (form.trial_ends_at as any) ?? client.trial_ends_at : client.trial_ends_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Quick info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-3">Quick Info</h2>
              <div className="space-y-2">
                {[
                  { label: 'Member since', value: new Date(client.created_at).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }) },
                  { label: 'Onboarding',   value: client.onboarding_complete ? '✅ Complete' : '⏳ Pending' },
                  { label: 'Stripe',       value: client.stripe_customer_id ? client.stripe_customer_id.substring(0, 18) + '...' : 'Not linked' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{s.label}</span>
                    <span className="text-gray-300 font-mono">{s.value}</span>
                  </div>
                ))}
              </div>
              {editing && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div onClick={() => setForm(p => ({ ...p, onboarding_complete: !p.onboarding_complete }))}
                      className={`w-9 h-5 rounded-full cursor-pointer transition-colors relative ${form.onboarding_complete ? 'bg-green-500' : 'bg-gray-700'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.onboarding_complete ? 'left-4' : 'left-0.5'}`} />
                    </div>
                    <span className="text-gray-400 text-xs">Onboarding complete</span>
                  </label>
                </div>
              )}
            </div>

            {/* Subscription Override */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Override</h2>
              <div className="flex items-center justify-between mb-4 bg-gray-800 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Current</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-bold capitalize">{client.subscription_plan}</span>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className={`text-xs capitalize ${STATUS_COLORS[client.subscription_status]?.split(' ')[1] || 'text-gray-400'}`}>{client.subscription_status}</span>
                  </div>
                </div>
                <span className="text-green-400 font-mono text-xs font-bold">${mrr}/mo</span>
              </div>
              {subStatus && (
                <div className={`mb-3 flex items-start gap-2 p-3 rounded-xl text-xs ${subStatus.type === 'success' ? 'bg-green-950/40 text-green-300' : 'bg-red-950/40 text-red-300'}`}>
                  {subStatus.type === 'success' ? <CheckCircle size={13} className="shrink-0" /> : <AlertCircle size={13} className="shrink-0" />}
                  {subStatus.msg}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { action: 'upgrade',    label: 'Upgrade',     icon: ArrowUpCircle,   color: 'hover:border-green-700 hover:text-green-400' },
                  { action: 'downgrade',  label: 'Downgrade',   icon: ArrowDownCircle, color: 'hover:border-yellow-700 hover:text-yellow-400' },
                  { action: 'extend',     label: 'Extend Trial', icon: Clock,           color: 'hover:border-blue-700 hover:text-blue-400' },
                  { action: 'pause',      label: 'Pause',       icon: PauseCircle,     color: 'hover:border-yellow-700 hover:text-yellow-400' },
                  { action: 'reactivate', label: 'Reactivate',  icon: RotateCcw,       color: 'hover:border-green-700 hover:text-green-400' },
                  { action: 'cancel',     label: 'Cancel',      icon: XCircle,         color: 'hover:border-red-700 hover:text-red-400' },
                ].map(btn => {
                  const Icon = btn.icon
                  return (
                    <button key={btn.action} onClick={() => setSubAction(subAction === btn.action ? null : btn.action)} disabled={subLoading}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition border ${
                        subAction === btn.action ? 'bg-blue-900/40 border-blue-600 text-blue-300' : `bg-gray-800 border-gray-700 text-gray-400 ${btn.color}`
                      } disabled:opacity-50`}>
                      <Icon size={12} />{btn.label}
                    </button>
                  )
                })}
              </div>
              {subAction && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 space-y-3">
                  {['upgrade', 'downgrade', 'change'].includes(subAction) && (
                    <select value={subTargetPlan} onChange={e => setSubTargetPlan(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500">
                      <option value="">Auto (next/prev tier)</option>
                      {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  )}
                  {subAction === 'extend' && (
                    <div className="flex gap-2 flex-wrap">
                      {[7, 14, 21, 30, 60].map(d => (
                        <button key={d} type="button" onClick={() => setSubExtendDays(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${subExtendDays === d ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'}`}>
                          {d}d
                        </button>
                      ))}
                    </div>
                  )}
                  <input value={subReason} onChange={e => setSubReason(e.target.value)} placeholder="Reason (logged)..."
                    className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500" />
                  <div className="flex gap-2">
                    <button onClick={() => handleSubAction(subAction)} disabled={subLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5">
                      {subLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                      {subLoading ? 'Applying...' : `Apply ${subAction}`}
                    </button>
                    <button onClick={() => { setSubAction(null); setSubTargetPlan(''); setSubReason('') }}
                      className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-3 py-2 rounded-lg transition">Cancel</button>
                  </div>
                </div>
              )}
              <div className="mt-3 pt-3 border-t border-gray-800">
                <button onClick={() => handleSubAction('terminate')} disabled={subLoading}
                  className="w-full flex items-center justify-center gap-1.5 bg-red-950/30 hover:bg-red-950/60 border border-red-900/50 text-red-400 text-xs font-medium py-2 rounded-lg transition disabled:opacity-50">
                  <XCircle size={12} /> Terminate &amp; Clear Billing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: BOOKINGS
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2"><Calendar size={14} className="text-blue-400" /> All Bookings</h2>
            <button onClick={loadBookings} disabled={bookingsLoading} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition">
              <RefreshCw size={14} className={bookingsLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          {bookingsLoading ? (
            <div className="text-center py-12 text-gray-600 text-sm flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500 text-sm">No bookings found across their sites.</div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Customer', 'Service', 'Date', 'Time', 'Status'].map(h => (
                      <th key={h} className="text-left text-gray-500 font-medium px-4 py-3 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition">
                      <td className="px-4 py-3">
                        <p className="text-white text-sm">{b.customer_name}</p>
                        {b.customer_email && <p className="text-gray-600 text-xs">{b.customer_email}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{b.service_name}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{b.booking_date}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{b.booking_time}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                          b.status === 'confirmed' ? 'bg-green-900/50 text-green-400' :
                          b.status === 'cancelled' ? 'bg-red-900/50 text-red-400' :
                          'bg-yellow-900/50 text-yellow-400'
                        }`}>{b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-4 py-2 border-t border-gray-800 text-gray-600 text-xs">{bookings.length} bookings shown (max 50)</div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: CUSTOMERS
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2"><Users size={14} className="text-green-400" /> Registered Customers</h2>
            <button onClick={loadCustomers} disabled={customersLoading} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition">
              <RefreshCw size={14} className={customersLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          {customersLoading ? (
            <div className="text-center py-12 text-gray-600 text-sm flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl text-gray-500 text-sm">No registered customers yet.</div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {['Customer', 'Phone', 'Bookings', 'Total Spend', 'Joined'].map(h => (
                      <th key={h} className="text-left text-gray-500 font-medium px-4 py-3 text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c: any) => (
                    <tr key={c.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition">
                      <td className="px-4 py-3">
                        <p className="text-white text-sm">{c.name}</p>
                        <p className="text-gray-600 text-xs">{c.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{c.phone || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-bold">{c.booking_count}</td>
                      <td className="px-4 py-3 text-green-400 font-mono text-xs">${Number(c.total_spend).toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{new Date(c.created_at).toLocaleDateString('en-AU')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: ACTIVITY
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2"><Activity size={14} className="text-yellow-400" /> Activity Stream</h2>
            <button onClick={loadEvents} disabled={eventsLoading} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition">
              <RefreshCw size={14} className={eventsLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          {eventsLoading ? (
            <div className="text-center py-12 text-gray-600 text-sm flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-2xl">
              <p className="text-gray-500 text-sm mb-1">No events yet for this client.</p>
              <p className="text-gray-700 text-xs">Events are logged when bookings, payments, or entitlement changes occur.</p>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl divide-y divide-gray-800/50">
              {events.map((e: any) => (
                <div key={e.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-800/30 transition">
                  <span className="text-base shrink-0 mt-0.5">{CATEGORY_ICONS[e.category] ?? '⚙️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-gray-500 text-xs font-mono">{e.event_type}</span>
                      {e.severity !== 'info' && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SEVERITY_COLORS[e.severity]}`}>{e.severity}</span>
                      )}
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed">{e.summary}</p>
                  </div>
                  <p className="text-gray-600 text-xs shrink-0">{timeAgo(e.occurred_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: FEATURES (ENTITLEMENTS)
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'features' && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-white font-semibold text-sm flex items-center gap-2"><ShieldCheck size={14} className="text-blue-400" /> Feature Entitlements</h2>
                <p className="text-gray-500 text-xs mt-1">
                  <span className="text-white font-medium">{client.name}</span> on the{' '}
                  <span className="capitalize text-blue-400 font-medium">{entPlan || client.subscription_plan}</span> plan.
                  Toggle overrides per feature without changing the plan.
                </p>
              </div>
              <button onClick={loadEntitlements} disabled={entLoading} className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition shrink-0">
                <RefreshCw size={14} className={entLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-800 text-xs">
              {[
                { dot: 'bg-green-500', label: 'Enabled by plan' },
                { dot: 'bg-blue-500',  label: 'Admin grant' },
                { dot: 'bg-red-500',   label: 'Admin revoke' },
                { dot: 'bg-gray-600',  label: 'Not in plan' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${l.dot}`} /> {l.label}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <label className="text-gray-500 text-xs block mb-1.5">Override reason (applied to next toggle)</label>
            <input value={overrideReason} onChange={e => setOverrideReason(e.target.value)} placeholder="e.g. Trial extension, VIP client..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
          </div>

          {features.length === 0 && !entLoading && (
            <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-xl p-4">
              <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Entitlements table not found</p>
              <p className="text-yellow-200/60 text-xs">Run <code className="font-mono text-yellow-300">supabase/entitlements.sql</code> in Supabase to enable this.</p>
            </div>
          )}

          {entLoading ? (
            <div className="text-center py-10 text-gray-600 text-sm flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Loading...</div>
          ) : (
            <div className="space-y-4">
              {featuresByCategory.map(cat => (
                <div key={cat.key} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-800"><h3 className={`text-xs font-bold ${cat.color}`}>{cat.label}</h3></div>
                  <div className="divide-y divide-gray-800/50">
                    {cat.items.map((feature: any) => {
                      const ent = entitlements[feature.key]
                      const isEnabled  = ent?.enabled === true
                      const isOverride = ent?.source === 'override'
                      const isToggling = togglingKey === feature.key
                      const dotColor = isOverride && isEnabled ? 'bg-blue-500' : isOverride && !isEnabled ? 'bg-red-500' : isEnabled ? 'bg-green-500' : 'bg-gray-600'
                      return (
                        <div key={feature.key} className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/30 transition">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white text-xs font-medium">{feature.label}</span>
                                {isOverride && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${isEnabled ? 'bg-blue-900/50 text-blue-400' : 'bg-red-900/50 text-red-400'}`}>
                                    {isEnabled ? '↑ Grant' : '↓ Revoke'}
                                  </span>
                                )}
                                {ent?.limitValue != null && <span className="text-xs text-gray-600 font-mono">limit:{ent.limitValue}</span>}
                              </div>
                              <p className="text-gray-600 text-xs mt-0.5 truncate">{feature.description}</p>
                            </div>
                          </div>
                          <button onClick={() => toggleFeature(feature.key, isEnabled, isOverride)} disabled={isToggling} className="shrink-0 ml-4">
                            {isToggling ? <Loader2 size={18} className="text-gray-500 animate-spin" /> :
                              isEnabled ? <ToggleRight size={22} className={isOverride ? 'text-blue-400' : 'text-green-400'} /> :
                              <ToggleLeft size={22} className={isOverride ? 'text-red-400' : 'text-gray-600'} />}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {features.length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex gap-3">
              <Info size={14} className="text-gray-600 shrink-0 mt-0.5" />
              <p className="text-gray-600 text-xs leading-relaxed">Overrides survive plan changes. Click an active override (blue/red) to revert to plan default.</p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: NOTES
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'notes' && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2"><MessageSquare size={14} className="text-purple-400" /> Internal Notes</h2>
              <div className="flex gap-2">
                {saved && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Saved</span>}
                <button
                  onClick={() => editing ? saveClient() : setEditing(true)}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? <Loader2 size={12} className="animate-spin" /> : editing ? <Save size={12} /> : <Edit3 size={12} />}
                  {editing ? (saving ? 'Saving...' : 'Save') : 'Edit'}
                </button>
                {editing && (
                  <button onClick={() => { setEditing(false); setForm(client) }} className="bg-gray-800 text-gray-400 text-xs px-3 py-1.5 rounded-lg transition">Cancel</button>
                )}
              </div>
            </div>
            {editing ? (
              <textarea
                value={form.notes || ''}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={8}
                placeholder="Notes about this client — context, history, preferences, agreements..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
            ) : (
              <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                {client.notes || <span className="italic text-gray-600">No notes yet. Click Edit to add internal context about this client.</span>}
              </p>
            )}
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <h2 className="text-white font-semibold text-sm mb-3">Stripe Info</h2>
            <div className="space-y-2">
              {[
                { label: 'Stripe Customer ID', value: client.stripe_customer_id || 'Not linked' },
                { label: 'Plan',               value: client.subscription_plan },
                { label: 'Status',             value: client.subscription_status },
                { label: 'Trial ends',         value: formatDate(client.trial_ends_at) },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-xs border-b border-gray-800 pb-2 last:border-0">
                  <span className="text-gray-500">{s.label}</span>
                  <span className="text-gray-300 font-mono capitalize">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB: CRM INTELLIGENCE
          Shows leads matched to this client by email/phone,
          their UTM attribution, and attribution agreement rate.
      ═══════════════════════════════════════════════════════ */}
      {activeTab === 'intelligence' && (
        <div className="space-y-5">
          {/* Header + refresh */}
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <Brain size={14} className="text-purple-400" /> CRM Intelligence
            </h2>
            <button
              onClick={loadIntelligence}
              disabled={intelLoading}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition"
            >
              <RefreshCw size={14} className={intelLoading ? 'animate-spin' : ''} />
            </button>
          </div>

          {intelLoading ? (
            <div className="text-center py-16 text-gray-600 text-sm flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Analysing signals...
            </div>
          ) : (
            <>
              {/* ── Summary strip ─────────────────────────── */}
              {intelSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Matched Leads',     value: intelSummary.total_matches,             color: 'text-purple-400' },
                    { label: 'Converted',          value: intelSummary.converted_leads,           color: 'text-green-400' },
                    { label: 'Attribution Match',  value: `${intelSummary.attribution_match_rate}%`, color: 'text-blue-400' },
                    { label: 'Top Source',         value: intelSummary.top_source ?? '—',         color: 'text-yellow-400' },
                  ].map(s => (
                    <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5">
                      <p className="text-gray-600 text-xs mb-0.5">{s.label}</p>
                      <p className={`text-sm font-bold capitalize ${s.color}`}>{String(s.value)}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Match list ───────────────────────────── */}
              {intelMatches.length === 0 ? (
                <div className="text-center py-16">
                  <Brain size={32} className="text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No matched leads yet.</p>
                  <p className="text-gray-600 text-xs mt-1">
                    Leads are matched when a contact form inquiry shares an email or phone with this client.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {intelMatches.map(m => (
                    <div
                      key={m.lead_id}
                      className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3"
                    >
                      {/* Row 1 — identity + signal badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-white text-sm font-semibold">{m.lead_name}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                              m.lead_status === 'converted' ? 'bg-green-900/50 text-green-400'
                              : m.lead_status === 'new'     ? 'bg-blue-900/50 text-blue-400'
                              : 'bg-gray-800 text-gray-400'
                            }`}>
                              {m.lead_status}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-400 font-medium">
                              matched by {m.match_signal}
                            </span>
                            {m.attribution_agrees && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 font-medium flex items-center gap-1">
                                <CheckCircle size={10} /> source agrees
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs mt-0.5">{m.lead_email}{m.lead_phone ? ` · ${m.lead_phone}` : ''}</p>
                        </div>
                        <p className="text-gray-600 text-xs shrink-0">{new Date(m.lead_created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>

                      {/* Row 2 — attribution comparison */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-800 rounded-xl px-3 py-2">
                          <p className="text-gray-600 text-xs mb-1 flex items-center gap-1"><Mail size={10} /> Lead (enquiry)</p>
                          <p className="text-xs text-white font-medium capitalize">{m.lead_utm_source ?? 'unknown'}</p>
                          {m.lead_utm_campaign && <p className="text-xs text-gray-500">{m.lead_utm_campaign}</p>}
                          {m.lead_referrer && <p className="text-xs text-gray-600 truncate">{m.lead_referrer}</p>}
                        </div>
                        <div className="bg-gray-800 rounded-xl px-3 py-2">
                          <p className="text-gray-600 text-xs mb-1 flex items-center gap-1"><Calendar size={10} /> Booking</p>
                          <p className="text-xs text-white font-medium capitalize">{m.customer_utm_source ?? 'unknown'}</p>
                          {m.customer_utm_campaign && <p className="text-xs text-gray-500">{m.customer_utm_campaign}</p>}
                          {m.customer_booking_count != null && (
                            <p className="text-xs text-gray-500">{m.customer_booking_count} booking{m.customer_booking_count !== 1 ? 's' : ''} · ${Number(m.customer_total_spend ?? 0).toFixed(0)} spend</p>
                          )}
                        </div>
                      </div>

                      {/* Row 3 — message + confirm button */}
                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          {m.lead_service_interest && (
                            <p className="text-gray-500 text-xs"><span className="text-gray-600">Interested in:</span> {m.lead_service_interest}</p>
                          )}
                          {m.lead_message && (
                            <p className="text-gray-600 text-xs mt-0.5 line-clamp-2 italic">"{m.lead_message}"</p>
                          )}
                        </div>
                        {m.lead_status !== 'converted' && (
                          <button
                            onClick={async () => {
                              setIntelConfirming(m.lead_id)
                              try {
                                const res = await fetch(`/api/crm/matches/${id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ lead_id: m.lead_id }),
                                })
                                if (res.ok) {
                                  setIntelMatches(prev => prev.map(x =>
                                    x.lead_id === m.lead_id ? { ...x, lead_status: 'converted' } : x
                                  ))
                                  setIntelSummary(prev => prev ? {
                                    ...prev,
                                    converted_leads: prev.converted_leads + 1
                                  } : prev)
                                }
                              } finally { setIntelConfirming(null) }
                            }}
                            disabled={intelConfirming === m.lead_id}
                            className="shrink-0 flex items-center gap-1.5 bg-green-900/40 hover:bg-green-800/60 border border-green-800/50 text-green-400 text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            {intelConfirming === m.lead_id
                              ? <Loader2 size={11} className="animate-spin" />
                              : <Link2 size={11} />
                            }
                            Confirm Match
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
