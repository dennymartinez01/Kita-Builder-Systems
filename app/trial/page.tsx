'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

const BUSINESS_TYPES = [
  { value: 'salon',     label: '✂️ Salon / Barbershop' },
  { value: 'clinic',    label: '🏥 Clinic / Dental' },
  { value: 'pet',       label: '🐾 Pet Clinic / Grooming' },
  { value: 'cafe',      label: '☕ Cafe / Restaurant' },
  { value: 'mechanic',  label: '🔧 Mechanic / Auto Repair' },
  { value: 'other',     label: '🛠️ Other Service Business' },
]

const TRIAL_PLANS = [
  { value: 'starter', label: 'Starter — $29/mo', desc: '1 site, booking widget, AI assistant, analytics' },
  { value: 'growth',  label: 'Growth — $49/mo',  desc: '3 sites, SMS reminders, 2 promotion blasts/mo' },
  { value: 'agency',  label: 'Agency — $99/mo',  desc: '10 sites, white-label, custom domain' },
]

const TRIAL_DURATIONS = [7, 14, 21, 30]

export default function TrialRequestPage() {
  const [step, setStep]         = useState<'form' | 'success'>('form')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm] = useState({
    name:               '',
    email:              '',
    phone:              '',
    country:            '',
    city:               '',
    business_name:      '',
    business_type:      '',
    website:            '',
    intended_use:       '',
    trial_plan:         'starter',
    trial_duration_days: 14,
    privacy_accepted:   false,
  })

  function set(key: string, value: any) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.privacy_accepted) {
      setError('You must accept the Privacy Notice to continue.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/trial-request', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setStep('success')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-3">Request Received!</h1>
          <p className="text-gray-500 leading-relaxed mb-6">
            Thanks for your interest in KITA Builder Systems. We will review your request and get back to you within 24 hours.
            Check your inbox for a confirmation email.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left mb-6 space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span className="font-medium">Business</span><span>{form.business_name}</span></div>
            <div className="flex justify-between"><span className="font-medium">Trial Plan</span><span className="capitalize">{form.trial_plan}</span></div>
            <div className="flex justify-between"><span className="font-medium">Duration</span><span>{form.trial_duration_days} days</span></div>
          </div>
          <Link href="/" className="text-blue-600 text-sm hover:underline">← Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-gray-900">KITA Systems</span>
        </Link>
        <Link href="/pitch" className="text-gray-500 hover:text-gray-900 text-sm transition">
          Learn more →
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            🎯 Free Trial Request
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
            Request Your Free Trial
          </h1>
          <p className="text-gray-500 leading-relaxed max-w-md mx-auto">
            Tell us about your business and we will set up your KITA site and get you started within 24 hours.
            No credit card required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-gray-900 text-sm">Your Contact Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Full Name',        key: 'name',    type: 'text',  required: true,  placeholder: 'Maria Santos' },
                { label: 'Email Address',    key: 'email',   type: 'email', required: true,  placeholder: 'maria@yourbusiness.com' },
                { label: 'Phone / WhatsApp', key: 'phone',   type: 'tel',   required: false, placeholder: '+63 912 000 0000' },
                { label: 'Country',          key: 'country', type: 'text',  required: false, placeholder: 'PH, AU, US...' },
                { label: 'City',             key: 'city',    type: 'text',  required: false, placeholder: 'Manila, Sydney...' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-gray-600 text-xs font-medium block mb-1.5">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={f.type}
                    required={f.required}
                    value={(form as any)[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Business */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-bold text-gray-900 text-sm">Your Business</h2>
            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1.5">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.business_name}
                onChange={e => set('business_name', e.target.value)}
                placeholder="e.g. Glow Salon Manila"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-gray-600 text-xs font-medium block mb-2">
                Business Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BUSINESS_TYPES.map(bt => (
                  <button
                    key={bt.value}
                    type="button"
                    onClick={() => set('business_type', bt.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium transition border text-left ${
                      form.business_type === bt.value
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {bt.label}
                  </button>
                ))}
              </div>
              {!form.business_type && (
                <input type="hidden" required value={form.business_type} />
              )}
            </div>

            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1.5">
                Website or Social Page (optional)
              </label>
              <input
                type="url"
                value={form.website}
                onChange={e => set('website', e.target.value)}
                placeholder="https://www.instagram.com/yourbusiness"
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-400"
              />
            </div>

            <div>
              <label className="text-gray-600 text-xs font-medium block mb-1.5">
                How do you plan to use KITA? <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={form.intended_use}
                onChange={e => set('intended_use', e.target.value)}
                rows={3}
                placeholder="e.g. I want to replace my manual WhatsApp booking process with an automated booking site for my salon..."
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Trial config */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-sm">Trial Preferences</h2>

            <div>
              <p className="text-gray-600 text-xs font-medium mb-3">Which plan would you like to trial?</p>
              <div className="space-y-2">
                {TRIAL_PLANS.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => set('trial_plan', p.value)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left transition border ${
                      form.trial_plan === p.value
                        ? 'bg-blue-50 border-blue-400'
                        : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                      form.trial_plan === p.value ? 'border-blue-600' : 'border-gray-300'
                    }`}>
                      {form.trial_plan === p.value && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </div>
                    <div>
                      <p className="text-gray-900 text-sm font-semibold">{p.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-gray-600 text-xs font-medium mb-2">How long a trial do you need?</p>
              <div className="flex gap-2">
                {TRIAL_DURATIONS.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set('trial_duration_days', d)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition border ${
                      form.trial_duration_days === d
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'
                    }`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <label className="flex items-start gap-3 cursor-pointer">
              <div
                onClick={() => set('privacy_accepted', !form.privacy_accepted)}
                className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition ${
                  form.privacy_accepted ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                }`}
              >
                {form.privacy_accepted && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span className="text-gray-600 text-sm leading-relaxed">
                I accept the{' '}
                <a href="/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener">Privacy Notice</a>
                {' '}and agree that KITA Systems may collect, store and process my information to review my trial request and set up my account. I understand I can request deletion at any time.
              </span>
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !form.business_type || !form.privacy_accepted}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : 'Submit Trial Request →'}
          </button>

          <p className="text-gray-400 text-xs text-center">
            No credit card required · We will respond within 24 hours · Cancel anytime
          </p>
        </form>
      </div>
    </div>
  )
}
