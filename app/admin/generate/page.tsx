'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPE_ICONS } from '@/lib/templates'
import { salonDefaultServices } from '@/lib/templates/salon'
import { clinicDefaultServices } from '@/lib/templates/clinic'
import { petDefaultServices } from '@/lib/templates/pet'
import { cafeDefaultServices } from '@/lib/templates/cafe'
import { mechanicDefaultServices } from '@/lib/templates/mechanic'
import { CURRENCIES } from '@/lib/currencies'
import type { BusinessType } from '@/types/database'
import { Zap, CheckCircle, ExternalLink, Loader2, Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react'

interface GenerateResult {
  slug: string
  business_name: string
  business_type: BusinessType
}

interface ServiceItem {
  id: string
  name: string
  price: number
  duration_minutes: number
  selected: boolean
  isCustom?: boolean
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
    selected: true, // all selected by default
  }))
}

type Step = 1 | 2 | 3

function GenerateForm() {
  const searchParams = useSearchParams()
  const presetType = searchParams.get('type') as BusinessType | null

  const [step, setStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    business_name: '',
    business_type: (presetType || 'salon') as BusinessType,
    location: '',
    owner_email: '',
    extra_notes: '',
    currency: 'USD',
  })

  const [services, setServices] = useState<ServiceItem[]>(() => buildServiceList(presetType || 'salon'))

  // Rebuild services when business type changes
  useEffect(() => {
    setServices(buildServiceList(form.business_type))
  }, [form.business_type])

  useEffect(() => {
    if (presetType) setForm(f => ({ ...f, business_type: presetType }))
  }, [presetType])

  // ── SERVICE HELPERS ──────────────────────────────────────────────
  function toggleService(id: string) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, selected: !s.selected } : s))
  }

  function updateService(id: string, field: 'name' | 'price' | 'duration_minutes', value: string | number) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function addCustomService() {
    const id = `custom-${Date.now()}`
    setServices(prev => [...prev, {
      id,
      name: '',
      price: 50,
      duration_minutes: 60,
      selected: true,
      isCustom: true,
    }])
  }

  function removeService(id: string) {
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const selectedServices = services.filter(s => s.selected)
  const currencyObj = CURRENCIES.find(c => c.code === form.currency) || CURRENCIES[0]

  // ── GENERATE ────────────────────────────────────────────────────
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          custom_services: selectedServices.map(s => ({
            name: s.name,
            price: s.price,
            duration_minutes: s.duration_minutes,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Check your API keys.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setStep(1)
    setForm({ business_name: '', business_type: presetType || 'salon', location: '', owner_email: '', extra_notes: '', currency: 'USD' })
    setServices(buildServiceList(presetType || 'salon'))
  }

  // ── STEP INDICATOR ───────────────────────────────────────────────
  const STEPS = [
    { num: 1, label: 'Business Type' },
    { num: 2, label: 'Services & Currency' },
    { num: 3, label: 'Details & Launch' },
  ]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" size={24} />
          Generate New Site
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          3 steps — AI generates the full site in ~10 seconds.
        </p>
      </div>

      {result ? (
        <div className="bg-green-950/40 border border-green-800/50 rounded-2xl p-8 text-center">
          <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
          <h2 className="text-white text-xl font-bold mb-1">Site Generated!</h2>
          <p className="text-gray-400 text-sm mb-6">{result.business_name} is live with {selectedServices.length} services in {form.currency}.</p>
          <div className="space-y-3 text-left mb-8">
            <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs mb-1">Public Site URL</p>
                <code className="text-blue-400 text-sm">/{result.slug}</code>
              </div>
              <a href={`/${result.slug}`} target="_blank" className="flex items-center gap-1 text-blue-400 text-xs hover:underline">
                Open <ExternalLink size={12} />
              </a>
            </div>
            <div className="bg-gray-900 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs mb-1">Owner Dashboard</p>
                <code className="text-green-400 text-sm">/{result.slug}/dashboard</code>
              </div>
              <a href={`/${result.slug}/dashboard`} target="_blank" className="flex items-center gap-1 text-green-400 text-xs hover:underline">
                Open <ExternalLink size={12} />
              </a>
            </div>
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-1">Owner Dashboard PIN</p>
              <code className="text-yellow-400 text-sm font-mono">1234</code>
              <p className="text-gray-600 text-xs mt-1">Client can change via dashboard → Settings tab</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-medium transition">
              Generate Another
            </button>
            <Link href="/admin/sites" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium transition text-center">
              View All Sites
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  step === s.num ? 'bg-blue-600 text-white' :
                  step > s.num ? 'bg-green-900/50 text-green-400' :
                  'bg-gray-800 text-gray-500'
                }`}>
                  {step > s.num ? '✓' : s.num} {s.label}
                </div>
                {i < STEPS.length - 1 && <ChevronRight size={14} className="text-gray-600" />}
              </div>
            ))}
          </div>

          {/* ── STEP 1 — Business Type ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-2">
                  Business Type <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUSINESS_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, business_type: type }))}
                      className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition text-left ${
                        form.business_type === type
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{BUSINESS_TYPE_ICONS[type]}</span>
                      <span className="text-xs leading-tight">{BUSINESS_TYPE_LABELS[type].split('/')[0].trim()}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 text-sm transition"
              >
                Next — Configure Services <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* ── STEP 2 — Services + Currency ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Currency */}
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-2">
                  Currency <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, currency: c.code }))}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition ${
                        form.currency === c.code
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                      }`}
                    >
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
                  <label className="text-gray-400 text-xs font-medium">
                    Services <span className="text-gray-600 text-xs">({selectedServices.length} selected)</span>
                  </label>
                  <button
                    type="button"
                    onClick={addCustomService}
                    className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
                  >
                    <Plus size={12} /> Add custom service
                  </button>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-gray-700 text-gray-500 text-xs">
                    <div className="col-span-1">✓</div>
                    <div className="col-span-5">Service Name</div>
                    <div className="col-span-3">{currencyObj.symbol} Price</div>
                    <div className="col-span-2">Min</div>
                    <div className="col-span-1"></div>
                  </div>

                  {services.map(service => (
                    <div key={service.id} className={`grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-gray-800 last:border-0 items-center transition ${
                      service.selected ? '' : 'opacity-40'
                    }`}>
                      {/* Checkbox */}
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => toggleService(service.id)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                            service.selected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-600 bg-transparent'
                          }`}
                        >
                          {service.selected && <span className="text-white text-xs">✓</span>}
                        </button>
                      </div>

                      {/* Name */}
                      <div className="col-span-5">
                        <input
                          value={service.name}
                          onChange={e => updateService(service.id, 'name', e.target.value)}
                          placeholder="Service name"
                          className="w-full bg-transparent text-white text-sm focus:outline-none focus:bg-gray-800 rounded px-1 py-0.5"
                        />
                      </div>

                      {/* Price */}
                      <div className="col-span-3">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500 text-xs">{currencyObj.symbol}</span>
                          <input
                            type="number"
                            value={service.price}
                            onChange={e => updateService(service.id, 'price', parseFloat(e.target.value) || 0)}
                            min="0"
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={service.duration_minutes}
                          onChange={e => updateService(service.id, 'duration_minutes', parseInt(e.target.value) || 30)}
                          min="5"
                          step="5"
                          className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {/* Delete (custom only) */}
                      <div className="col-span-1 flex justify-end">
                        {service.isCustom && (
                          <button
                            type="button"
                            onClick={() => removeService(service.id)}
                            className="text-gray-600 hover:text-red-400 transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-gray-600 text-xs mt-2">
                  Click the checkbox to include/exclude a service. Edit name, price, and duration inline. Prices are in {form.currency}.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-3 rounded-xl text-sm font-medium transition"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={selectedServices.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition"
                >
                  Next — Business Details <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Details + Generate ── */}
          {step === 3 && (
            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Summary of step 2 */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-400 text-xs font-medium">Selected: {selectedServices.length} services · Currency: {form.currency}</p>
                  <button type="button" onClick={() => setStep(2)} className="text-blue-400 text-xs hover:underline">Edit</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedServices.slice(0, 5).map(s => (
                    <span key={s.id} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                      {s.name} · {CURRENCIES.find(c => c.code === form.currency)?.symbol}{s.price}
                    </span>
                  ))}
                  {selectedServices.length > 5 && (
                    <span className="text-xs text-gray-500">+{selectedServices.length - 5} more</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-xs font-medium block mb-2">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={form.business_name}
                  onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                  placeholder={`e.g. ${
                    form.business_type === 'salon' ? "Sarah's Hair Studio" :
                    form.business_type === 'clinic' ? "City Dental Care" :
                    form.business_type === 'pet' ? "Happy Paws Vet Clinic" :
                    form.business_type === 'cafe' ? "The Daily Grind Cafe" :
                    "Jim's Auto Repair"
                  }`}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-medium block mb-2">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Sydney, AU / Los Angeles, US / London, UK"
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-medium block mb-2">
                  Owner Email <span className="text-gray-600 text-xs">(optional — for booking notifications)</span>
                </label>
                <input
                  type="email"
                  value={form.owner_email}
                  onChange={e => setForm(f => ({ ...f, owner_email: e.target.value }))}
                  placeholder="owner@business.com"
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-medium block mb-2">
                  Extra Context <span className="text-gray-600 text-xs">(optional — helps AI generate better copy)</span>
                </label>
                <textarea
                  value={form.extra_notes}
                  onChange={e => setForm(f => ({ ...f, extra_notes: e.target.value }))}
                  placeholder="e.g. Open 7 days, parking available, specialises in fades, kid-friendly..."
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-950/50 border border-red-900/50 rounded-xl p-4 text-red-300 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-5 py-4 rounded-xl text-sm font-medium transition"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition text-sm"
                >
                  {loading ? (
                    <><Loader2 size={16} className="animate-spin" />Generating with AI... (~10 seconds)</>
                  ) : (
                    <><Zap size={16} />Generate Site</>
                  )}
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  )
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500 text-sm">Loading...</div>}>
      <GenerateForm />
    </Suspense>
  )
}
