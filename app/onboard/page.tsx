'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPE_ICONS } from '@/lib/templates'
import { KITA_PRICING, formatAmount } from '@/lib/stripe'
import type { BusinessType } from '@/types/database'
import { Zap, CheckCircle, Loader2, CreditCard, Shield, ArrowRight } from 'lucide-react'

const BUSINESS_TYPES: BusinessType[] = ['salon', 'clinic', 'pet', 'cafe', 'mechanic']

const INCLUDED_FEATURES = [
  'AI-generated website copy & design',
  'Online booking form (24/7)',
  'Email notification on every booking',
  'Mobile-friendly on all devices',
  'Owner dashboard with PIN login',
  'Edit your site by chatting with AI',
  'Services & pricing page',
  'Staff / team section',
  'Opening hours display',
  'Free hosting for 1 month included',
]

function OnboardForm() {
  const searchParams = useSearchParams()
  const cancelled = searchParams.get('cancelled')

  const [form, setForm] = useState({
    business_name: '',
    business_type: 'salon' as BusinessType,
    location: '',
    owner_email: '',
    extra_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create checkout')
      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">KITA Systems</span>
          <span className="text-gray-300 mx-2">·</span>
          <span className="text-gray-500 text-sm">New Client Setup</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10">
        {cancelled && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6 text-yellow-800 text-sm">
            Payment was cancelled. No charge was made — you can try again below.
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-10">
          {/* LEFT — Form */}
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">
              Launch Your Business Online
            </h1>
            <p className="text-gray-500 mb-8">
              Fill in your details — we'll build your booking website with AI in seconds after payment.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Business Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-lg">{BUSINESS_TYPE_ICONS[type]}</span>
                      <span className="text-xs leading-tight">{BUSINESS_TYPE_LABELS[type].split('/')[0].trim()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={form.business_name}
                  onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                  placeholder="e.g. Sarah's Hair Studio"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Sydney, AU / Los Angeles, US"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Your Email <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={form.owner_email}
                  onChange={e => setForm(f => ({ ...f, owner_email: e.target.value }))}
                  placeholder="you@yourbusiness.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition"
                />
                <p className="text-gray-400 text-xs mt-1">We'll send booking notifications here.</p>
              </div>

              {/* Extra notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Additional Info <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.extra_notes}
                  onChange={e => setForm(f => ({ ...f, extra_notes: e.target.value }))}
                  placeholder="e.g. We specialise in fades, open 7 days, 3 staff members, parking available..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition text-sm active:scale-95"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Redirecting to payment...</>
                ) : (
                  <><CreditCard size={16} /> Pay {formatAmount(KITA_PRICING.setup.amount)} & Launch My Site <ArrowRight size={14} /></>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                <Shield size={12} />
                Secured by Stripe · No card stored · Cancel anytime
              </div>
            </form>
          </div>

          {/* RIGHT — What's included */}
          <div className="lg:pt-14">
            {/* Price box */}
            <div className="bg-blue-600 rounded-2xl p-6 text-white mb-6">
              <p className="text-blue-100 text-sm mb-1">One-time setup fee</p>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black">$150</span>
                <span className="text-blue-200 pb-1">USD</span>
              </div>
              <p className="text-blue-100 text-sm">then $29/month for hosting & maintenance</p>
              <div className="mt-4 pt-4 border-t border-blue-500 text-blue-100 text-xs">
                💳 Test mode — use card <span className="font-mono bg-blue-700 px-1.5 py-0.5 rounded">4242 4242 4242 4242</span>, any future date, any CVC
              </div>
            </div>

            {/* Features */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="font-bold text-gray-900 mb-4">Everything included:</p>
              <div className="space-y-2.5">
                {INCLUDED_FEATURES.map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle size={15} className="text-green-500 shrink-0" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* How it works after payment */}
            <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <p className="font-semibold text-gray-900 text-sm mb-3">What happens after you pay:</p>
              <div className="space-y-2">
                {[
                  'Your AI-generated site is built in ~10 seconds',
                  'You get a live link to your booking site',
                  'Dashboard access with PIN to manage everything',
                  'First booking email arrives in your inbox',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-gray-500">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center shrink-0 text-xs">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500 text-sm">Loading...</div>}>
      <OnboardForm />
    </Suspense>
  )
}
