'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPE_ICONS } from '@/lib/templates'
import { salonDefaultServices } from '@/lib/templates/salon'
import { clinicDefaultServices } from '@/lib/templates/clinic'
import { petDefaultServices } from '@/lib/templates/pet'
import { cafeDefaultServices } from '@/lib/templates/cafe'
import { mechanicDefaultServices } from '@/lib/templates/mechanic'
import { CURRENCIES } from '@/lib/currencies'
import { TIMEZONES, TIMEZONE_REGIONS } from '@/lib/timezones'
import { PLAN_SITE_LIMITS } from '@/lib/entitlements'
import { calculateTrialDates, TRIAL_DURATION_OPTIONS } from '@/lib/trial'
import type { BusinessType, Client } from '@/types/database'
import {
  Zap, CheckCircle, ExternalLink, Loader2, Plus, Trash2,
  ChevronRight, ChevronLeft, User, Search, UserPlus,
  CreditCard, ShieldCheck, Timer, Building2,
} from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────
interface ServiceItem {
  id: string
  name: string
  price: number
  duration_minutes: number
  selected: boolean
  isCustom?: boolean
}

interface GenerateResult {
  slug: string
  business_name: string
  business_type: BusinessType
  site_id?: string
}

const BUSINESS_TYPES: BusinessType[] = ['salon', 'clinic', 'pet', 'cafe', 'mechanic']

const DEFAULT_SERVICES_MAP: Record<BusinessType, { name: string; price: number; duration_minutes: number }[]> = {
  salon: salonDefaultServices,
  clinic: clinicDefaultServices,
  pet: petDefaultServices,
  cafe: cafeDefaultServices,
  mechanic: mechanicDefaultServices,
}

function buildServiceList(type: BusinessType): ServiceItem[] {
  return DEFAULT_SERVICES_MAP[type].map((s, i) => ({
    id: `default-${i}`,
    name: s.name,
    price: s.price,
    duration_minutes: s.duration_minutes,
    selected: true,
  }))
}

// ── Plan definitions ──────────────────────────────────────────
const PLAN_OPTIONS = [
  {
    value: 'trial',
    label: 'Trial',
    price: 'Free',
    period: '14 days',
    color: 'border-gray-700',
    badge: 'bg-gray-800 text-gray-400',
    features: ['Full access', 'No credit card', 'Auto-expires'],
  },
  {
    value: 'starter',
    label: 'Starter',
    price: '$29',
    period: '/month',
    color: 'border-blue-800',
    badge: 'bg-blue-900/50 text-blue-400',
    features: ['1 site', 'Booking widget', 'AI assistant', 'Email notifications', 'Contact form'],
  },
  {
    value: 'growth',
    label: 'Growth',
    price: '$49',
    period: '/month',
    color: 'border-green-800',
    badge: 'bg-green-900/50 text-green-400',
    features: ['3 sites', 'Everything in Starter', 'SMS reminders', '2 promo blasts/mo', 'Customer accounts', 'Coupons'],
  },
  {
    value: 'agency',
    label: 'Agency',
    price: '$99',
    period: '/month',
    color: 'border-purple-800',
    badge: 'bg-purple-900/50 text-purple-400',
    features: ['10 sites', 'Everything in Growth', 'White-label', 'Custom domain', '5 promo blasts/mo', 'Onboarding call'],
  },
]

// Plan entitlement summary for Step 7
const PLAN_ENTITLEMENT_SUMMARY: Record<string, { enabled: string[]; disabled: string[] }> = {
  trial:   { enabled: ['Booking widget', 'AI assistant', 'Block dates', 'Site analytics'], disabled: ['Contact form', 'SMS reminders', 'Customer accounts', 'Coupons', 'White-label'] },
  starter: { enabled: ['Booking widget', 'AI assistant', 'Block dates', 'Site analytics', 'Contact form', 'Leads dashboard'], disabled: ['SMS reminders', 'Customer accounts', 'Coupons', 'White-label'] },
  growth:  { enabled: ['Booking widget', 'AI assistant', 'Block dates', 'Site analytics', 'Contact form', 'SMS reminders', 'Customer accounts', 'Coupons', 'WhatsApp', 'Google Calendar'], disabled: ['White-label', 'Custom domain'] },
  agency:  { enabled: ['Booking widget', 'AI assistant', 'Block dates', 'Site analytics', 'Contact form', 'SMS reminders', 'Customer accounts', 'Coupons', 'WhatsApp', 'Google Calendar', 'White-label', 'Custom domain'], disabled: [] },
}

const STEP_CONFIG = [
  { num: 1, label: 'Client',       short: '1' },
  { num: 2, label: 'Business Info', short: '2' },
  { num: 3, label: 'Type',         short: '3' },
  { num: 4, label: 'Services',     short: '4' },
  { num: 5, label: 'Plan',         short: '5' },
  { num: 6, label: 'Trial',        short: '6' },
  { num: 7, label: 'Features',     short: '7' },
  { num: 8, label: 'Generate',     short: '8' },
  { num: 9, label: 'Activate',     short: '9' },
]

// ── Main component ────────────────────────────────────────────
function GenerateWizard() {
  const searchParams  = useSearchParams()
  const presetType    = searchParams.get('type') as BusinessType | null

  const [step, setStep]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<GenerateResult | null>(null)
  const [error, setError]       = useState('')

  // Step 1 — Client
  const [clientMode, setClientMode]       = useState<'existing' | 'new' | 'skip'>('skip')
  const [clientSearch, setClientSearch]   = useState('')
  const [clientResults, setClientResults] = useState<Client[]>([])
  const [clientSearching, setClientSearching] = useState(false)
  const [selectedClient, setSelectedClient]   = useState<Client | null>(null)
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', country: '', city: '' })
  const [creatingClient, setCreatingClient]   = useState(false)

  // Step 2 — Business info
  const [form, setForm] = useState({
    business_name: '',
    business_type: (presetType || 'salon') as BusinessType,
    location:      '',
    owner_email:   '',
    extra_notes:   '',
    currency:      'USD',
    timezone:      'UTC',
  })

  // Step 5 — Plan
  const [selectedPlan, setSelectedPlan]   = useState('starter')
  const [trialDays, setTrialDays]         = useState(14)

  // Services
  const [services, setServices] = useState<ServiceItem[]>(() => buildServiceList(presetType || 'salon'))

  useEffect(() => {
    setServices(buildServiceList(form.business_type))
  }, [form.business_type])
  useEffect(() => {
    if (presetType) setForm(f => ({ ...f, business_type: presetType }))
  }, [presetType])

  // ── Step 1 helpers ────────────────────────────────────────
  async function searchClients(q: string) {
    if (!q.trim()) { setClientResults([]); return }
    setClientSearching(true)
    const { data } = await supabase
      .from('clients')
      .select('id, name, email, country, city, subscription_plan, subscription_status')
      .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(8)
    setClientResults((data as Client[]) || [])
    setClientSearching(false)
  }

  useEffect(() => {
    const t = setTimeout(() => searchClients(clientSearch), 300)
    return () => clearTimeout(t)
  }, [clientSearch])

  async function createNewClient() {
    if (!newClient.name || !newClient.email) return
    setCreatingClient(true)
    try {
      const trialDates = selectedPlan === 'trial' ? calculateTrialDates(trialDays) : null
      const { data, error: err } = await supabase
        .from('clients')
        .insert({
          name:                newClient.name,
          email:               newClient.email,
          phone:               newClient.phone || null,
          country:             newClient.country || null,
          city:                newClient.city || null,
          subscription_plan:   selectedPlan as any,
          subscription_status: selectedPlan === 'trial' ? 'trial' : 'active',
          source:              'generate_wizard',
          onboarding_complete: false,
          trial_duration_days: selectedPlan === 'trial' ? trialDays : 14,
          trial_starts_at:     trialDates?.trial_starts_at ?? null,
          trial_ends_at:       trialDates?.trial_ends_at ?? null,
        } as any)
        .select()
        .single()
      if (err) throw err
      setSelectedClient(data as Client)
      setClientMode('existing')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setCreatingClient(false)
    }
  }

  // ── Service helpers ───────────────────────────────────────
  const selectedServices = services.filter(s => s.selected)
  const currencyObj = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0]

  function toggleService(id: string) {
    setServices(p => p.map(s => s.id === id ? { ...s, selected: !s.selected } : s))
  }
  function updateService(id: string, field: 'name' | 'price' | 'duration_minutes', value: string | number) {
    setServices(p => p.map(s => s.id === id ? { ...s, [field]: value } : s))
  }
  function addCustomService() {
    setServices(p => [...p, { id: `custom-${Date.now()}`, name: '', price: 50, duration_minutes: 60, selected: true, isCustom: true }])
  }
  function removeService(id: string) {
    setServices(p => p.filter(s => s.id !== id))
  }

  // ── Step skip logic — skip Step 6 if plan !== trial ───────
  function nextStep(current: number) {
    if (current === 5 && selectedPlan !== 'trial') {
      setStep(7) // skip trial duration step
    } else {
      setStep(current + 1)
    }
  }
  function prevStep(current: number) {
    if (current === 7 && selectedPlan !== 'trial') {
      setStep(5) // skip trial duration step going back
    } else {
      setStep(current - 1)
    }
  }

  // ── Generate ──────────────────────────────────────────────
  async function handleGenerate() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          custom_services: selectedServices.map(s => ({
            name: s.name, price: s.price, duration_minutes: s.duration_minutes,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      // Link site to client if one was selected/created
      if (selectedClient?.id && data.id) {
        await supabase
          .from('sites')
          .update({ client_id: selectedClient.id } as any)
          .eq('id', data.id)
      }

      setResult(data)
      setStep(9)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Check your API keys.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null); setStep(1); setError('')
    setSelectedClient(null); setClientMode('skip')
    setForm({ business_name: '', business_type: presetType || 'salon', location: '', owner_email: '', extra_notes: '', currency: 'USD', timezone: 'UTC' })
    setServices(buildServiceList(presetType || 'salon'))
    setSelectedPlan('starter'); setTrialDays(14)
  }

  // ── Visible steps for progress bar ───────────────────────
  const visibleSteps = STEP_CONFIG.filter(s => s.num !== 6 || selectedPlan === 'trial')
  const currentVisibleIndex = visibleSteps.findIndex(s => s.num === step)
  const progressPct = step === 9 ? 100 : Math.round((currentVisibleIndex / (visibleSteps.length - 1)) * 100)

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" size={24} />
          Create New Site
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-gray-400 text-sm">
            {step === 9 ? 'Site is live!' : `Step ${currentVisibleIndex + 1} of ${visibleSteps.length} — ${visibleSteps[currentVisibleIndex]?.label}`}
          </p>
          <Link href="/admin/generate/bulk" className="flex items-center gap-1.5 text-gray-500 hover:text-yellow-400 text-xs transition">
            <Zap size={12} /> Bulk Demo Generator
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      {step < 9 && (
        <div className="mb-8">
          <div className="flex gap-1 mb-3">
            {visibleSteps.map((s) => (
              <div
                key={s.num}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  s.num < step ? 'bg-green-500' :
                  s.num === step ? 'bg-blue-500' :
                  'bg-gray-800'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between">
            {visibleSteps.map((s) => (
              <span key={s.num} className={`text-xs transition ${
                s.num < step ? 'text-green-400' :
                s.num === step ? 'text-blue-400 font-semibold' :
                'text-gray-700'
              }`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ═══ STEP 1 — Business Owner ═══ */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <p className="text-gray-300 text-sm mb-1">Who is this site for?</p>
            <p className="text-gray-500 text-xs">Link this site to an existing client, create a new client record, or skip for now.</p>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { mode: 'existing', label: 'Existing Client', icon: User,     desc: 'Search your client list' },
              { mode: 'new',      label: 'New Client',      icon: UserPlus,  desc: 'Create a client record first' },
              { mode: 'skip',     label: 'Skip for now',    icon: Building2, desc: 'Link a client later' },
            ].map(opt => {
              const Icon = opt.icon
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => setClientMode(opt.mode as any)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition ${
                    clientMode === opt.mode
                      ? 'bg-blue-900/30 border-blue-600 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-medium">{opt.label}</span>
                  <span className="text-gray-600 text-xs">{opt.desc}</span>
                </button>
              )
            })}
          </div>

          {/* Existing client search */}
          {clientMode === 'existing' && (
            <div className="space-y-3">
              {selectedClient ? (
                <div className="flex items-center justify-between bg-green-950/30 border border-green-800/50 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-green-400 text-xs font-semibold">✓ Client selected</p>
                    <p className="text-white text-sm font-medium mt-0.5">{selectedClient.name}</p>
                    <p className="text-gray-400 text-xs">{selectedClient.email}</p>
                  </div>
                  <button onClick={() => setSelectedClient(null)} className="text-gray-500 hover:text-white text-xs transition">Change</button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      value={clientSearch}
                      onChange={e => setClientSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                    />
                    {clientSearching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 animate-spin" />}
                  </div>
                  {clientResults.length > 0 && (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                      {clientResults.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => { setSelectedClient(c); setClientSearch(''); setClientResults([]) }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition border-b border-gray-800 last:border-0 text-left"
                        >
                          <div>
                            <p className="text-white text-sm font-medium">{c.name}</p>
                            <p className="text-gray-500 text-xs">{c.email} {c.country ? `· ${c.country}` : ''}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            c.subscription_status === 'active' ? 'bg-green-900/50 text-green-400' :
                            c.subscription_status === 'trial'  ? 'bg-gray-800 text-gray-400' :
                            'bg-gray-800 text-gray-500'
                          }`}>{c.subscription_status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {clientSearch && !clientSearching && clientResults.length === 0 && (
                    <p className="text-gray-500 text-xs text-center py-2">No clients found. Try a different search or create a new client.</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* New client form */}
          {clientMode === 'new' && (
            <div className="space-y-3 bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-400 text-xs font-medium">Quick client details — you can complete their profile later.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { label: 'Full Name *',  key: 'name',    type: 'text',  placeholder: 'Maria Santos' },
                  { label: 'Email *',      key: 'email',   type: 'email', placeholder: 'maria@business.com' },
                  { label: 'Phone',        key: 'phone',   type: 'tel',   placeholder: '+63 912 000 0000' },
                  { label: 'Country',      key: 'country', type: 'text',  placeholder: 'PH, AU, US...' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-gray-500 text-xs block mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      value={(newClient as any)[f.key]}
                      onChange={e => setNewClient(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={createNewClient}
                disabled={!newClient.name || !newClient.email || creatingClient}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition"
              >
                {creatingClient ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
                {creatingClient ? 'Creating...' : 'Create Client & Continue'}
              </button>
            </div>
          )}

          {/* Admin self checkbox */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">This is for your own business</p>
              <p className="text-gray-600 text-xs">Use your own admin details as the client</p>
            </div>
            <button
              type="button"
              onClick={() => { setClientMode('skip'); setSelectedClient(null) }}
              className="text-blue-400 hover:text-blue-300 text-xs transition"
            >
              Skip linking →
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={clientMode === 'new' && !selectedClient}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 text-sm transition"
          >
            Next — Business Info <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ═══ STEP 2 — Business Information ═══ */}
      {step === 2 && (
        <div className="space-y-5">
          {selectedClient && (
            <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
              <User size={14} className="text-blue-400 shrink-0" />
              <div>
                <p className="text-gray-400 text-xs">Client</p>
                <p className="text-white text-sm font-medium">{selectedClient.name} · {selectedClient.email}</p>
              </div>
            </div>
          )}

          {[
            { label: 'Business Name',    key: 'business_name', type: 'text',  required: true,  placeholder: `e.g. ${form.business_type === 'salon' ? "Sarah's Hair Studio" : form.business_type === 'clinic' ? "City Dental Care" : form.business_type === 'cafe' ? "The Daily Grind" : "Jim's Auto Repair"}` },
            { label: 'Location',         key: 'location',      type: 'text',  required: true,  placeholder: 'e.g. Sydney, AU · Manila, PH · Los Angeles, US' },
            { label: 'Owner Email',      key: 'owner_email',   type: 'email', required: false, placeholder: 'owner@business.com (for booking notifications)' },
            { label: 'Extra Context',    key: 'extra_notes',   type: 'text',  required: false, placeholder: 'e.g. Open 7 days, parkings available, kid-friendly...' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-gray-400 text-xs font-medium block mb-2">
                {f.label} {f.required && <span className="text-red-400">*</span>}
              </label>
              <input
                type={f.type}
                required={f.required}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
              />
            </div>
          ))}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-3 rounded-xl text-sm font-medium transition">
              <ChevronLeft size={16} /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!form.business_name || !form.location}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition"
            >
              Next — Business Type <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 3 — Business Type ═══ */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BUSINESS_TYPES.map(type => (
              <button key={type} type="button" onClick={() => setForm(f => ({ ...f, business_type: type }))}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition text-left ${
                  form.business_type === type
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                }`}>
                <span className="text-lg">{BUSINESS_TYPE_ICONS[type]}</span>
                <span className="text-xs leading-tight">{BUSINESS_TYPE_LABELS[type].split('/')[0].trim()}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-3 rounded-xl text-sm font-medium transition">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={() => setStep(4)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition">
              Next — Configure Services <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 4 — Services & Currency ═══ */}
      {step === 4 && (
        <div className="space-y-5">
          {/* Currency */}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-2">Currency <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CURRENCIES.map(c => (
                <button key={c.code} type="button" onClick={() => setForm(f => ({ ...f, currency: c.code }))}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition ${
                    form.currency === c.code
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}>
                  <span>{c.flag}</span>
                  <span className="font-mono font-bold">{c.code}</span>
                  <span className="text-gray-500 hidden sm:block">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-gray-400 text-xs font-medium">Services <span className="text-gray-600 text-xs">({selectedServices.length} selected)</span></label>
              <button type="button" onClick={addCustomService} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition">
                <Plus size={12} /> Add custom
              </button>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-700 text-gray-500 text-xs">
                <div className="col-span-1">✓</div><div className="col-span-5">Service</div>
                <div className="col-span-3">{currencyObj.symbol} Price</div>
                <div className="col-span-2">Min</div><div className="col-span-1"></div>
              </div>
              {services.map(service => (
                <div key={service.id} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 items-center ${service.selected ? '' : 'opacity-40'}`}>
                  <div className="col-span-1">
                    <button type="button" onClick={() => toggleService(service.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${service.selected ? 'bg-blue-600 border-blue-600' : 'border-gray-600'}`}>
                      {service.selected && <span className="text-white text-xs">✓</span>}
                    </button>
                  </div>
                  <div className="col-span-5">
                    <input value={service.name} onChange={e => updateService(service.id, 'name', e.target.value)}
                      placeholder="Service name" className="w-full bg-transparent text-white text-sm focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5" />
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500 text-xs">{currencyObj.symbol}</span>
                      <input type="number" value={service.price} min="0" onChange={e => updateService(service.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <input type="number" value={service.duration_minutes} min="5" step="5" onChange={e => updateService(service.id, 'duration_minutes', parseInt(e.target.value) || 30)}
                      className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {service.isCustom && (
                      <button type="button" onClick={() => removeService(service.id)} className="text-gray-600 hover:text-red-400 transition"><Trash2 size={13} /></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timezone */}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-2">
              Business Timezone <span className="text-red-400">*</span>
              <span className="text-gray-600 ml-1 font-normal">— Cannot be changed after generation</span>
            </label>
            <select value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
              {TIMEZONE_REGIONS.map(region => (
                <optgroup key={region} label={region}>
                  {TIMEZONES.filter(t => t.region === region).map(tz => (
                    <option key={tz.value} value={tz.value}>{tz.label} (UTC {tz.offset})</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-3 rounded-xl text-sm font-medium transition">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={() => nextStep(4)} disabled={selectedServices.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition">
              Next — Subscription Plan <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 5 — Subscription Plan ═══ */}
      {step === 5 && (
        <div className="space-y-5">
          <p className="text-gray-400 text-sm">Which plan will this client be on?</p>
          <div className="space-y-3">
            {PLAN_OPTIONS.map(plan => (
              <button key={plan.value} type="button" onClick={() => setSelectedPlan(plan.value)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition text-left ${
                  selectedPlan === plan.value
                    ? `${plan.color.replace('border-', 'border-2 border-')} bg-gray-800`
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition ${
                    selectedPlan === plan.value ? 'border-blue-500' : 'border-gray-600'
                  }`}>
                    {selectedPlan === plan.value && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-sm">{plan.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.badge}`}>
                        {plan.price}{plan.price !== 'Free' ? plan.period : ` · ${plan.period}`}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {plan.features.map(f => (
                        <span key={f} className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(4)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-3 rounded-xl text-sm font-medium transition">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={() => nextStep(5)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition">
              Next {selectedPlan === 'trial' ? '— Trial Duration' : '— Feature Review'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 6 — Trial Duration (trial plan only) ═══ */}
      {step === 6 && selectedPlan === 'trial' && (
        <div className="space-y-5">
          <div className="bg-blue-950/20 border border-blue-800/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Timer size={14} className="text-blue-400" />
              <p className="text-blue-400 text-sm font-semibold">Trial Period Configuration</p>
            </div>
            <p className="text-gray-500 text-xs">How long should this client's trial last? They will get full access until the trial expires.</p>
          </div>

          <div>
            <p className="text-gray-400 text-xs font-medium mb-3">Trial Duration</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {TRIAL_DURATION_OPTIONS.map(days => (
                <button key={days} type="button" onClick={() => setTrialDays(days)}
                  className={`py-4 rounded-xl border text-sm font-bold transition ${
                    trialDays === days
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                  }`}>
                  {days}d
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Trial starts</span><span className="text-white">Today, {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Trial ends</span>
              <span className="text-blue-400 font-medium">
                {new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="text-white">{trialDays} days</span></div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(5)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-3 rounded-xl text-sm font-medium transition">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={() => setStep(7)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition">
              Next — Feature Review <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 7 — Feature Entitlements Review ═══ */}
      {step === 7 && (
        <div className="space-y-5">
          <div>
            <p className="text-gray-300 text-sm mb-1">Features included with the <span className="text-blue-400 font-semibold capitalize">{selectedPlan}</span> plan</p>
            <p className="text-gray-500 text-xs">You can adjust individual feature overrides from the client profile after site creation.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="text-white font-semibold text-sm capitalize">{selectedPlan} Plan — Effective Entitlements</span>
            </div>
            <div className="p-4 grid sm:grid-cols-2 gap-2">
              {(PLAN_ENTITLEMENT_SUMMARY[selectedPlan]?.enabled || []).map(f => (
                <div key={f} className="flex items-center gap-2 text-xs">
                  <span className="text-green-400 shrink-0">✓</span>
                  <span className="text-gray-300">{f}</span>
                </div>
              ))}
              {(PLAN_ENTITLEMENT_SUMMARY[selectedPlan]?.disabled || []).map(f => (
                <div key={f} className="flex items-center gap-2 text-xs opacity-40">
                  <span className="text-gray-600 shrink-0">✗</span>
                  <span className="text-gray-500">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-xl px-4 py-3">
            <p className="text-yellow-400 text-xs">
              ⚡ Entitlement overrides — need to grant a specific feature outside the plan? Go to
              Admin → Clients → [Client] → Features after site creation.
            </p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => prevStep(7)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-3 rounded-xl text-sm font-medium transition">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={() => setStep(8)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition">
              Next — Review &amp; Generate <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 8 — Review & Generate ═══ */}
      {step === 8 && (
        <div className="space-y-5">
          {/* Summary card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-white font-semibold text-sm">Review — Everything looks good?</p>
            </div>
            <div className="p-4 space-y-3 text-sm">
              {[
                { label: 'Client',       value: selectedClient ? `${selectedClient.name} (${selectedClient.email})` : 'Not linked', icon: User },
                { label: 'Business',     value: form.business_name, icon: Building2 },
                { label: 'Type',         value: `${BUSINESS_TYPE_ICONS[form.business_type]} ${BUSINESS_TYPE_LABELS[form.business_type]}`, icon: null },
                { label: 'Location',     value: form.location, icon: null },
                { label: 'Services',     value: `${selectedServices.length} services in ${form.currency}`, icon: null },
                { label: 'Plan',         value: `${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}${selectedPlan === 'trial' ? ` · ${trialDays}-day trial` : ''}`, icon: CreditCard },
                { label: 'Timezone',     value: form.timezone, icon: null },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-3 py-1 border-b border-gray-800/50 last:border-0">
                  <span className="text-gray-500 text-xs w-20 shrink-0">{row.label}</span>
                  <span className="text-gray-200 text-xs text-right">{row.value || <span className="text-gray-600 italic">Not set</span>}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedServices.slice(0, 6).map(s => (
              <span key={s.id} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                {s.name} · {currencyObj.symbol}{s.price}
              </span>
            ))}
            {selectedServices.length > 6 && <span className="text-xs text-gray-500">+{selectedServices.length - 6} more</span>}
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-900/50 rounded-xl p-4 text-red-300 text-sm">⚠️ {error}</div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(7)} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-4 rounded-xl text-sm font-medium transition">
              <ChevronLeft size={16} /> Back
            </button>
            <button type="button" onClick={handleGenerate} disabled={loading || !form.business_name || !form.location}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 text-sm transition">
              {loading
                ? <><Loader2 size={16} className="animate-spin" />Generating with AI... (~10 seconds)</>
                : <><Zap size={16} />Generate Site</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ═══ STEP 9 — Activate ═══ */}
      {step === 9 && result && (
        <div className="space-y-5">
          <div className="bg-green-950/40 border border-green-800/50 rounded-2xl p-8 text-center">
            <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
            <h2 className="text-white text-xl font-bold mb-1">Site Generated!</h2>
            <p className="text-gray-400 text-sm mb-2">{result.business_name} is live with {selectedServices.length} services in {form.currency}.</p>
            {selectedClient && (
              <p className="text-blue-400 text-xs mb-6">Linked to client: {selectedClient.name}</p>
            )}
          </div>

          <div className="space-y-3">
            {[
              { label: 'Public Site URL',    href: `/${result.slug}`,            code: `/${result.slug}`,            color: 'text-blue-400' },
              { label: 'Owner Dashboard',    href: `/${result.slug}/dashboard`,  code: `/${result.slug}/dashboard`,  color: 'text-green-400' },
            ].map(link => (
              <div key={link.label} className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs mb-1">{link.label}</p>
                  <code className={`text-sm ${link.color}`}>{link.code}</code>
                </div>
                <a href={link.href} target="_blank" className={`flex items-center gap-1 text-xs hover:underline ${link.color}`}>
                  Open <ExternalLink size={12} />
                </a>
              </div>
            ))}
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-1">Owner Dashboard PIN</p>
              <code className="text-yellow-400 text-sm font-mono">1234</code>
              <p className="text-gray-600 text-xs mt-1">Client can change via dashboard → Settings tab</p>
            </div>
            {selectedClient && (
              <Link href={`/admin/clients/${selectedClient.id}`}
                className="flex items-center justify-between bg-blue-950/30 border border-blue-800/50 rounded-xl p-4 hover:bg-blue-950/50 transition">
                <div>
                  <p className="text-blue-400 text-xs mb-1">Client Profile</p>
                  <p className="text-white text-sm font-medium">{selectedClient.name} · 360 View</p>
                </div>
                <ExternalLink size={14} className="text-blue-400" />
              </Link>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-medium transition">
              Generate Another Site
            </button>
            <Link href="/admin/sites" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium transition text-center flex items-center justify-center">
              View All Sites
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500 text-sm">Loading...</div>}>
      <GenerateWizard />
    </Suspense>
  )
}
