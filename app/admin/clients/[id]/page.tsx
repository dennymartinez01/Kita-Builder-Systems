'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Client, Site, EffectiveEntitlements } from '@/types/database'
import { FEATURE_CATEGORIES } from '@/lib/entitlements'
import {
  ArrowLeft, User, Mail, Phone, Globe, MapPin,
  CreditCard, Calendar, ExternalLink, LayoutDashboard,
  Save, Trash2, Loader2, CheckCircle, AlertCircle,
  Edit3, Building2, ShieldCheck, ToggleLeft, ToggleRight,
  RefreshCw, Info,
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
              <div className="grid sm:grid-cols-3 gap-4">
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

