'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Client, Site, EffectiveEntitlements } from '@/types/database'
import { FEATURE_CATEGORIES } from '@/lib/entitlements'
import { calculateTrialDates, formatTrialCountdown, formatDate, getTrialStatus, TRIAL_DURATION_OPTIONS } from '@/lib/trial'
import {
  ArrowLeft, User, Mail, Phone, Globe, MapPin,
  CreditCard, Calendar, ExternalLink, LayoutDashboard,
  Save, Trash2, Loader2, CheckCircle, AlertCircle,
  Edit3, Building2, ShieldCheck, ToggleLeft, ToggleRight,
  RefreshCw, Info, Timer,
  ArrowUpCircle, ArrowDownCircle, PauseCircle, XCircle,
  Zap, RotateCcw, Clock,
} from 'lucide-react'

const PLAN_OPTIONS = ['trial', 'starter', 'growth', 'agency', 'custom']
const STATUS_OPTIONS = ['trial', 'active', 'overdue', 'paused', 'cancelled']
const SOURCE_OPTIONS = ['outreach', 'referral', 'organic', 'audit', 'direct', 'other']
const MONTHLY_RATES: Record<string, number> = {
  trial: 0, starter: 29, growth: 49, agency: 99, custom: 0,
}

type Tab = 'profile' | 'entitlements'

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [client, setClient] = useState<Client | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Partial<Client>>({})

  // Entitlements state
  const [entitlements, setEntitlements] = useState<EffectiveEntitlements>({})
  const [features, setFeatures] = useState<any[]>([])
  const [entPlan, setEntPlan] = useState<string>('')
  const [entLoading, setEntLoading] = useState(false)
  const [togglingKey, setTogglingKey] = useState<string | null>(null)
  const [overrideReason, setOverrideReason] = useState('')

  // Subscription override state
  const [subAction, setSubAction]           = useState<string | null>(null)
  const [subLoading, setSubLoading]         = useState(false)
  const [subStatus, setSubStatus]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [subTargetPlan, setSubTargetPlan]   = useState('')
  const [subExtendDays, setSubExtendDays]   = useState(14)
  const [subReason, setSubReason]           = useState('')

  useEffect(() => { loadClient() }, [id])

  async function loadClient() {
    setLoading(true)
    const [clientRes, sitesRes] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('sites').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    ])
    if (clientRes.data) {
      setClient(clientRes.data)
      setForm(clientRes.data)
    }
    setSites(sitesRes.data || [])
    setLoading(false)
  }

  const loadEntitlements = useCallback(async () => {
    setEntLoading(true)
    try {
      const res = await fetch(`/api/entitlements/${id}`)
      const data = await res.json()
      if (res.ok) {
        setEntitlements(data.effective)
        setFeatures(data.features)
        setEntPlan(data.plan)
      }
    } catch { /* silent */ }
    setEntLoading(false)
  }, [id])

  // Load entitlements when tab is first opened
  useEffect(() => {
    if (activeTab === 'entitlements' && features.length === 0) {
      loadEntitlements()
    }
  }, [activeTab, features.length, loadEntitlements])

  async function saveClient() {
    if (!client) return
    setSaving(true)
    const { error } = await supabase.from('clients').update(form as any).eq('id', id)
    if (!error) {
      setClient({ ...client, ...form } as Client)
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  async function deleteClient() {
    if (!confirm(`Delete client "${client?.name}"? This will unlink their sites but not delete them.`)) return
    await supabase.from('clients').delete().eq('id', id)
    router.push('/admin/clients')
  }

  async function handleSubAction(action: string) {
    // Confirm destructive actions
    if (['cancel', 'terminate'].includes(action)) {
      const label = action === 'terminate' ? 'TERMINATE (clears all billing)' : 'cancel'
      if (!confirm(`Are you sure you want to ${label} the subscription for ${client?.name}? This will be logged.`)) return
    }

    setSubLoading(true)
    setSubStatus(null)
    try {
      const body: any = { action, reason: subReason || undefined }
      if (subTargetPlan) body.target_plan = subTargetPlan
      if (action === 'extend') body.extend_days = subExtendDays

      const res  = await fetch(`/api/clients/${id}/subscription`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Action failed')

      // Refresh client data from the returned record
      setClient(data.client)
      setForm(data.client)
      setSubAction(null)
      setSubTargetPlan('')
      setSubReason('')
      setSubStatus({ type: 'success', msg: `${action} completed successfully.` })
      setTimeout(() => setSubStatus(null), 4000)
    } catch (err: any) {
      setSubStatus({ type: 'error', msg: err.message })
    } finally {
      setSubLoading(false)
    }
  }

  async function toggleFeature(featureKey: string, currentEnabled: boolean, isOverride: boolean) {
    setTogglingKey(featureKey)
    try {
      const res = await fetch(`/api/entitlements/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_key: featureKey,
          // If already overridden and we're reverting to plan default, send null
          enabled: isOverride ? null : !currentEnabled,
          override_reason: overrideReason || `Admin toggle on ${new Date().toLocaleDateString()}`,
        }),
      })
      const data = await res.json()
      if (res.ok) setEntitlements(data.effective)
    } catch { /* silent */ }
    setTogglingKey(null)
  }

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

  const totalMRR = client.subscription_status === 'active' ? (MONTHLY_RATES[client.subscription_plan] || 0) : 0
  const totalSetup = sites.filter(s => (s as any).payment_status === 'paid').length * 150

  // Group features by category for display
  const featuresByCategory = FEATURE_CATEGORIES.map(cat => ({
    ...cat,
    items: features.filter((f: any) => f.category === cat.key),
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <Link href="/admin/clients" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-2 transition">
            <ArrowLeft size={12} /> All Clients
          </Link>
          <h1 className="text-2xl font-bold text-white">{client.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{client.email}</p>
        </div>
        <div className="flex gap-2 items-center">
          {saved && <span className="flex items-center gap-1 text-xs text-green-400 py-2"><CheckCircle size={13} /> Saved!</span>}
          {activeTab === 'profile' && (
            <>
              <button
                onClick={() => editing ? saveClient() : setEditing(true)}
                disabled={saving}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : editing ? <Save size={14} /> : <Edit3 size={14} />}
                {editing ? (saving ? 'Saving...' : 'Save Changes') : 'Edit'}
              </button>
              {editing && (
                <button onClick={() => { setEditing(false); setForm(client) }} className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg transition">
                  Cancel
                </button>
              )}
            </>
          )}
          <button onClick={deleteClient} className="bg-gray-800 hover:bg-red-900/50 text-gray-500 hover:text-red-400 p-2 rounded-lg transition">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
        {([
          { id: 'profile',      label: 'Profile',      icon: User },
          { id: 'entitlements', label: 'Features',      icon: ShieldCheck },
        ] as { id: Tab; label: string; icon: any }[]).map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition ${
                activeTab === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon size={13} />{t.label}
            </button>
          )
        })}
      </div>

      {/* ── PROFILE TAB ─────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left — Profile */}
          <div className="lg:col-span-2 space-y-5">
            {/* Contact info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><User size={14} className="text-blue-400" /> Profile</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', key: 'name', icon: User, type: 'text' },
                  { label: 'Email', key: 'email', icon: Mail, type: 'email' },
                  { label: 'Phone / WhatsApp', key: 'phone', icon: Phone, type: 'tel' },
                  { label: 'Country', key: 'country', icon: Globe, type: 'text', placeholder: 'e.g. AU, PH, US' },
                  { label: 'City', key: 'city', icon: MapPin, type: 'text', placeholder: 'e.g. Sydney' },
                  { label: 'Source', key: 'source', icon: Globe, type: 'select', options: SOURCE_OPTIONS },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-gray-500 text-xs mb-1 block">{field.label}</label>
                    {editing ? (
                      field.type === 'select' ? (
                        <select
                          value={(form as any)[field.key] || ''}
                          onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="">— Not set —</option>
                          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={(form as any)[field.key] || ''}
                          onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={(field as any).placeholder || ''}
                          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                      )
                    ) : (
                      <p className="text-white text-sm">{(client as any)[field.key] || <span className="text-gray-600 italic">Not set</span>}</p>
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
                  { label: 'Plan', key: 'subscription_plan', options: PLAN_OPTIONS },
                  { label: 'Status', key: 'subscription_status', options: STATUS_OPTIONS },
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-gray-500 text-xs mb-1 block">{field.label}</label>
                    {editing ? (
                      <select
                        value={(form as any)[field.key] || ''}
                        onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      >
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <span className="text-white text-sm capitalize">{(client as any)[field.key]}</span>
                    )}
                  </div>
                ))}
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Monthly Revenue</label>
                  <p className="text-green-400 font-mono text-sm font-bold">${totalMRR}/mo</p>
                </div>
              </div>

              {/* Trial section — shown when plan or status is trial */}
              {(client.subscription_plan === 'trial' || client.subscription_status === 'trial' ||
                form.subscription_plan === 'trial' || form.subscription_status === 'trial') && (() => {
                const countdown = formatTrialCountdown(editing ? { ...client, ...form } as any : client)
                const trialStatus = getTrialStatus(editing ? { ...client, ...form } as any : client)
                const currentDuration = (form.trial_duration_days ?? client.trial_duration_days) || 14

                return (
                  <div className="bg-blue-950/20 border border-blue-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Timer size={13} className="text-blue-400" />
                        <span className="text-blue-400 text-xs font-semibold">Trial Period</span>
                      </div>
                      <span className={`text-xs font-bold ${countdown.color}`}>{countdown.label}</span>
                    </div>

                    {/* Duration picker — only in edit mode */}
                    {editing && (
                      <div className="mb-3">
                        <p className="text-gray-500 text-xs mb-2">Duration</p>
                        <div className="flex flex-wrap gap-2">
                          {TRIAL_DURATION_OPTIONS.map(days => (
                            <button
                              key={days}
                              type="button"
                              onClick={() => setForm(prev => {
                                const dates = calculateTrialDates(days, client.trial_starts_at ? new Date(client.trial_starts_at) : undefined)
                                return { ...prev, trial_duration_days: days, trial_ends_at: dates.trial_ends_at, trial_starts_at: dates.trial_starts_at }
                              })}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                                currentDuration === days
                                  ? 'bg-blue-600 border-blue-500 text-white'
                                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                              }`}
                            >
                              {days} days
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-600 mb-0.5">Started</p>
                        <p className="text-gray-300">{formatDate(client.trial_starts_at)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-0.5">Expires</p>
                        <p className={`font-medium ${
                          trialStatus.state === 'expired'   ? 'text-red-400' :
                          trialStatus.state === 'expiring'  ? 'text-yellow-400' :
                          'text-gray-300'
                        }`}>
                          {formatDate(editing ? (form.trial_ends_at as any) ?? client.trial_ends_at : client.trial_ends_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Notes */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Edit3 size={14} className="text-yellow-400" /> Internal Notes</h2>
              {editing ? (
                <textarea
                  value={form.notes || ''}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  placeholder="Notes about this client — context, history, preferences..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              ) : (
                <p className="text-gray-400 text-sm leading-relaxed">
                  {client.notes || <span className="italic text-gray-600">No notes. Click Edit to add context about this client.</span>}
                </p>
              )}
            </div>

            {/* Sites */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <h2 className="text-white font-semibold text-sm flex items-center gap-2"><Building2 size={14} className="text-purple-400" /> Their Sites ({sites.length})</h2>
                <Link href="/admin/generate" className="text-blue-400 text-xs hover:underline">+ Generate new site</Link>
              </div>
              {sites.length === 0 ? (
                <div className="text-center py-8 text-gray-600 text-sm">No sites linked to this client yet.</div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {sites.map(site => (
                    <div key={site.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/40 transition">
                      <div>
                        <p className="text-white text-sm font-medium">{site.business_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-gray-500 text-xs capitalize">{site.business_type}</span>
                          <span className="text-gray-700 text-xs">·</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${(site as any).payment_status === 'paid' ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                            {(site as any).payment_status || 'free'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`/${site.slug}`} target="_blank" className="text-gray-500 hover:text-blue-400 transition" title="View site">
                          <ExternalLink size={13} />
                        </a>
                        <a href={`/${site.slug}/dashboard`} target="_blank" className="text-gray-500 hover:text-green-400 transition" title="Owner dashboard">
                          <LayoutDashboard size={13} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Summary card */}
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
              <h2 className="text-white font-semibold text-sm">Revenue Summary</h2>
              {[
                { label: 'Monthly (MRR)', value: `$${totalMRR}`, color: 'text-green-400' },
                { label: 'Setup fees paid', value: `$${totalSetup}`, color: 'text-blue-400' },
                { label: 'Projected annual', value: `$${totalMRR * 12}`, color: 'text-purple-400' },
                { label: 'Sites managed', value: sites.length, color: 'text-white' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-gray-500 text-xs">{s.label}</span>
                  <span className={`font-bold text-sm ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-3">Quick Info</h2>
              <div className="space-y-2">
                {[
                  { label: 'Client since', value: new Date(client.created_at).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' }) },
                  { label: 'Onboarding', value: client.onboarding_complete ? '✅ Complete' : '⏳ Pending' },
                  { label: 'Stripe', value: (client.stripe_customer_id ? client.stripe_customer_id.substring(0, 15) + '...' : 'Not linked') },
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
                    <div
                      onClick={() => setForm(prev => ({ ...prev, onboarding_complete: !prev.onboarding_complete }))}
                      className={`w-9 h-5 rounded-full cursor-pointer transition-colors relative ${form.onboarding_complete ? 'bg-green-500' : 'bg-gray-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.onboarding_complete ? 'left-4' : 'left-0.5'}`} />
                    </div>
                    <span className="text-gray-400 text-xs">Onboarding complete</span>
                  </label>
                </div>
              )}
            </div>
          </div>

            {/* Subscription Override panel */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Zap size={14} className="text-yellow-400" />
                Subscription Override
              </h2>

              {/* Current state */}
              <div className="flex items-center justify-between mb-4 bg-gray-800 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Current</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-bold capitalize">{client.subscription_plan}</span>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className={`text-xs capitalize ${
                      client.subscription_status === 'active'    ? 'text-green-400' :
                      client.subscription_status === 'trial'     ? 'text-blue-400'  :
                      client.subscription_status === 'paused'    ? 'text-yellow-400':
                      client.subscription_status === 'cancelled' ? 'text-red-400'   :
                      'text-gray-400'
                    }`}>{client.subscription_status}</span>
                  </div>
                </div>
                <span className="text-green-400 font-mono text-xs font-bold">${totalMRR}/mo</span>
              </div>

              {/* Status feedback */}
              {subStatus && (
                <div className={`mb-3 flex items-start gap-2 p-3 rounded-xl text-xs ${
                  subStatus.type === 'success'
                    ? 'bg-green-950/40 border border-green-900/50 text-green-300'
                    : 'bg-red-950/40 border border-red-900/50 text-red-300'
                }`}>
                  {subStatus.type === 'success' ? <CheckCircle size={13} className="shrink-0 mt-0.5" /> : <AlertCircle size={13} className="shrink-0 mt-0.5" />}
                  {subStatus.msg}
                </div>
              )}

              {/* Action buttons */}
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
                  const isActive = subAction === btn.action
                  return (
                    <button
                      key={btn.action}
                      onClick={() => setSubAction(isActive ? null : btn.action)}
                      disabled={subLoading}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition border ${
                        isActive
                          ? 'bg-blue-900/40 border-blue-600 text-blue-300'
                          : `bg-gray-800 border-gray-700 text-gray-400 ${btn.color}`
                      } disabled:opacity-50`}
                    >
                      <Icon size={12} />
                      {btn.label}
                    </button>
                  )
                })}
              </div>

              {/* Expanded action panel */}
              {subAction && (
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
                  <p className="text-white text-xs font-semibold capitalize">{subAction}</p>

                  {['upgrade', 'downgrade', 'change'].includes(subAction) && (
                    <div>
                      <label className="text-gray-500 text-xs block mb-1.5">Target plan (optional)</label>
                      <select
                        value={subTargetPlan}
                        onChange={e => setSubTargetPlan(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Auto (next/prev tier)</option>
                        {['trial', 'starter', 'growth', 'agency', 'custom'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {subAction === 'extend' && (
                    <div>
                      <label className="text-gray-500 text-xs block mb-1.5">Extend by (days)</label>
                      <div className="flex gap-2 flex-wrap">
                        {[7, 14, 21, 30, 60].map(d => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setSubExtendDays(d)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                              subExtendDays === d
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white'
                            }`}
                          >
                            {d}d
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-gray-500 text-xs block mb-1.5">Reason (logged to event stream)</label>
                    <input
                      value={subReason}
                      onChange={e => setSubReason(e.target.value)}
                      placeholder="e.g. Client requested extension..."
                      className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSubAction(subAction)}
                      disabled={subLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                    >
                      {subLoading ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                      {subLoading ? 'Applying...' : `Apply ${subAction}`}
                    </button>
                    <button
                      onClick={() => { setSubAction(null); setSubTargetPlan(''); setSubReason('') }}
                      className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-3 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Terminate — danger zone */}
              <div className="mt-3 pt-3 border-t border-gray-800">
                <button
                  onClick={() => handleSubAction('terminate')}
                  disabled={subLoading}
                  className="w-full flex items-center justify-center gap-1.5 bg-red-950/30 hover:bg-red-950/60 border border-red-900/50 text-red-400 hover:text-red-300 text-xs font-medium py-2 rounded-lg transition disabled:opacity-50"
                >
                  <XCircle size={12} />
                  Terminate &amp; Clear Billing
                </button>
                <p className="text-gray-700 text-xs mt-1.5 text-center">Cancels subscription and clears Stripe ID</p>
              </div>
            </div>

        </div>
      )}

      {/* ── ENTITLEMENTS TAB ────────────────────────────────── */}
      {activeTab === 'entitlements' && (
        <div className="space-y-5">
          {/* Header bar */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                  <ShieldCheck size={14} className="text-blue-400" />
                  Feature Entitlements
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Showing effective features for <span className="text-white font-medium">{client.name}</span> on the{' '}
                  <span className="capitalize text-blue-400 font-medium">{entPlan || client.subscription_plan}</span> plan.
                  Toggle overrides individual features without changing the plan.
                </p>
              </div>
              <button
                onClick={loadEntitlements}
                disabled={entLoading}
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition shrink-0"
              >
                <RefreshCw size={14} className={entLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-800 text-xs">
              {[
                { dot: 'bg-green-500', label: 'Enabled by plan' },
                { dot: 'bg-blue-500',  label: 'Enabled by override' },
                { dot: 'bg-red-500',   label: 'Disabled by override' },
                { dot: 'bg-gray-600',  label: 'Not in plan' },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5 text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${l.dot}`} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Override reason input */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <label className="text-gray-500 text-xs block mb-1.5">Override reason (applied to next toggle)</label>
            <input
              value={overrideReason}
              onChange={e => setOverrideReason(e.target.value)}
              placeholder="e.g. Trial extension, VIP client, testing..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Setup reminder */}
          {features.length === 0 && !entLoading && (
            <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-xl p-4">
              <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Entitlements table not found</p>
              <p className="text-yellow-200/60 text-xs">
                Run <code className="font-mono text-yellow-300">supabase/entitlements.sql</code> in your Supabase SQL Editor to enable this feature.
              </p>
            </div>
          )}

          {entLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-600">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading entitlements...
            </div>
          ) : (
            <div className="space-y-4">
              {featuresByCategory.map(cat => (
                <div key={cat.key} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                  {/* Category header */}
                  <div className="px-5 py-3 border-b border-gray-800 bg-gray-900/80">
                    <h3 className={`text-xs font-bold ${cat.color}`}>{cat.label}</h3>
                  </div>
                  {/* Feature rows */}
                  <div className="divide-y divide-gray-800/50">
                    {cat.items.map((feature: any) => {
                      const ent = entitlements[feature.key]
                      const isEnabled  = ent?.enabled === true
                      const isOverride = ent?.source === 'override'
                      const isToggling = togglingKey === feature.key

                      // Dot color
                      const dotColor = isOverride && isEnabled
                        ? 'bg-blue-500'
                        : isOverride && !isEnabled
                          ? 'bg-red-500'
                          : isEnabled
                            ? 'bg-green-500'
                            : 'bg-gray-600'

                      return (
                        <div key={feature.key} className="flex items-center justify-between px-5 py-3 hover:bg-gray-800/30 transition">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white text-xs font-medium">{feature.label}</span>
                                {isOverride && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                    isEnabled ? 'bg-blue-900/50 text-blue-400' : 'bg-red-900/50 text-red-400'
                                  }`}>
                                    {isEnabled ? '↑ Admin grant' : '↓ Admin revoke'}
                                  </span>
                                )}
                                {ent?.limitValue != null && (
                                  <span className="text-xs text-gray-600 font-mono">limit: {ent.limitValue}</span>
                                )}
                              </div>
                              <p className="text-gray-600 text-xs mt-0.5 truncate">{feature.description}</p>
                            </div>
                          </div>
                          {/* Toggle button */}
                          <button
                            onClick={() => toggleFeature(feature.key, isEnabled, isOverride)}
                            disabled={isToggling}
                            className="shrink-0 ml-4"
                            title={isOverride ? 'Click to revert to plan default' : `Click to ${isEnabled ? 'revoke' : 'grant'} this feature`}
                          >
                            {isToggling ? (
                              <Loader2 size={18} className="text-gray-500 animate-spin" />
                            ) : isEnabled ? (
                              <ToggleRight size={22} className={isOverride ? 'text-blue-400' : 'text-green-400'} />
                            ) : (
                              <ToggleLeft size={22} className={isOverride ? 'text-red-400' : 'text-gray-600'} />
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info note */}
          {features.length > 0 && (
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex gap-3">
              <Info size={14} className="text-gray-600 shrink-0 mt-0.5" />
              <p className="text-gray-600 text-xs leading-relaxed">
                Overrides survive plan changes — if a client upgrades from Starter to Growth, their overrides remain.
                To reset a client to pure plan defaults, revert each override individually (click the blue/red toggle).
                All overrides are logged with timestamp and reason.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

