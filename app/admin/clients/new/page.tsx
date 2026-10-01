'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, UserPlus, Loader2, Timer } from 'lucide-react'
import { calculateTrialDates, TRIAL_DURATION_OPTIONS } from '@/lib/trial'

const SOURCE_OPTIONS = ['outreach', 'referral', 'organic', 'audit', 'direct', 'other']
const PLAN_OPTIONS   = ['trial', 'starter', 'growth', 'agency', 'custom']

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    name:                '',
    email:               '',
    phone:               '',
    country:             '',
    city:                '',
    subscription_plan:   'trial',
    subscription_status: 'trial',
    source:              '',
    notes:               '',
    trial_duration_days: 14,
  })

  const isTrial = form.subscription_plan === 'trial' || form.subscription_status === 'trial'

  function setField(key: string, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Calculate trial dates when plan is trial
    const trialDates = isTrial
      ? calculateTrialDates(form.trial_duration_days)
      : { trial_starts_at: null, trial_ends_at: null }

    const { data, error: err } = await supabase
      .from('clients')
      .insert({
        name:                form.name,
        email:               form.email,
        phone:               form.phone || null,
        country:             form.country || null,
        city:                form.city || null,
        subscription_plan:   form.subscription_plan,
        subscription_status: form.subscription_status,
        source:              form.source || null,
        notes:               form.notes || null,
        onboarding_complete: false,
        trial_duration_days: form.trial_duration_days,
        trial_starts_at:     trialDates.trial_starts_at,
        trial_ends_at:       trialDates.trial_ends_at,
      } as any)
      .select()
      .single()

    if (err) {
      setError(err.message.includes('unique')
        ? 'A client with this email already exists.'
        : err.message)
      setLoading(false)
      return
    }

    router.push(`/admin/clients/${data.id}`)
  }

  // Preview the trial end date for display
  const trialPreviewEnd = isTrial
    ? new Date(Date.now() + form.trial_duration_days * 24 * 60 * 60 * 1000)
        .toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/clients" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-2 transition">
          <ArrowLeft size={12} /> All Clients
        </Link>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserPlus className="text-blue-400" size={24} />
          Add New Client
        </h1>
        <p className="text-gray-400 text-sm mt-1">Manually create a client record.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Contact Details */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-sm">Contact Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name',         key: 'name',    type: 'text',  required: true,  placeholder: 'John Smith' },
              { label: 'Email',             key: 'email',   type: 'email', required: true,  placeholder: 'john@business.com' },
              { label: 'Phone / WhatsApp',  key: 'phone',   type: 'tel',   required: false, placeholder: '+61 400 000 000' },
              { label: 'Country',           key: 'country', type: 'text',  required: false, placeholder: 'AU' },
              { label: 'City',              key: 'city',    type: 'text',  required: false, placeholder: 'Sydney' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">
                  {field.label} {field.required && <span className="text-red-400">*</span>}
                </label>
                <input
                  type={field.type}
                  required={field.required}
                  value={(form as any)[field.key]}
                  onChange={e => setField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-sm">Subscription</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Plan</label>
              <select value={form.subscription_plan} onChange={e => setField('subscription_plan', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Status</label>
              <select value={form.subscription_status} onChange={e => setField('subscription_status', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                {['trial', 'active', 'overdue', 'paused', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">How they found you</label>
              <select value={form.source} onChange={e => setField('source', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500">
                <option value="">— Not set —</option>
                {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Trial duration — shown only when plan/status is trial */}
          {isTrial && (
            <div className="bg-blue-950/20 border border-blue-800/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Timer size={13} className="text-blue-400" />
                <span className="text-blue-400 text-xs font-semibold">Trial Duration</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {TRIAL_DURATION_OPTIONS.map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setField('trial_duration_days', days)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                      form.trial_duration_days === days
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-xs">
                Trial will expire on{' '}
                <span className="text-white font-medium">{trialPreviewEnd}</span>
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <label className="text-gray-400 text-xs font-medium block mb-1.5">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={e => setField('notes', e.target.value)}
            rows={3}
            placeholder="Any context about this client..."
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none placeholder-gray-600"
          />
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3 text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/admin/clients" className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl text-sm transition text-center">
            Cancel
          </Link>
          <button type="submit" disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            {loading ? 'Creating...' : 'Create Client'}
          </button>
        </div>
      </form>
    </div>
  )
}
