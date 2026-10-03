'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Zap, ChevronLeft, Search, Users, CheckCircle,
  Loader2, AlertCircle, ExternalLink, Send, Eye,
} from 'lucide-react'

const BUSINESS_TYPES = ['salon', 'clinic', 'pet', 'cafe', 'mechanic']

interface AudiencePreview {
  count: number
  sample: { name: string; email: string; city?: string; business_type?: string }[]
}

interface BlastResult {
  sent_count: number
  failed_count: number
  recipients: number
  blast_id: string
}

export default function PromotePage() {
  const [form, setForm] = useState({
    headline:             '',
    offer_text:           '',
    cta_url:              '',
    cta_label:            'Claim Offer',
    expires_at:           '',
    filter_city:          '',
    filter_business_type: '',
    filter_country:       '',
  })

  const [audience, setAudience]   = useState<AudiencePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [sending, setSending]     = useState(false)
  const [result, setResult]       = useState<BlastResult | null>(null)
  const [error, setError]         = useState('')
  const [step, setStep]           = useState<'compose' | 'confirm' | 'sent'>('compose')

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    setAudience(null) // reset preview when filters change
  }

  const loadAudience = useCallback(async () => {
    setPreviewLoading(true)
    try {
      const params = new URLSearchParams()
      if (form.filter_city)          params.set('city',          form.filter_city)
      if (form.filter_business_type) params.set('business_type', form.filter_business_type)
      if (form.filter_country)       params.set('country',       form.filter_country)
      const res  = await fetch(`/api/leads/promote?${params}`)
      const data = await res.json()
      setAudience({ count: data.count ?? 0, sample: data.sample ?? [] })
    } finally {
      setPreviewLoading(false)
    }
  }, [form.filter_city, form.filter_business_type, form.filter_country])

  // Auto-load audience preview when filters change
  useEffect(() => {
    const t = setTimeout(loadAudience, 400)
    return () => clearTimeout(t)
  }, [loadAudience])

  async function handleSend() {
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/leads/promote', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          expires_at: form.expires_at
            ? new Date(form.expires_at + 'T23:59:59').toISOString()
            : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      setResult(data)
      setStep('sent')
    } catch (err: any) {
      setError(err.message)
      setStep('compose')
    } finally {
      setSending(false)
    }
  }

  // ── SENT screen ───────────────────────────────────────────────
  if (step === 'sent' && result) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-green-950/40 border border-green-800/50 rounded-2xl p-8 text-center">
          <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
          <h2 className="text-white text-xl font-bold mb-2">Promotion Blast Sent!</h2>
          <p className="text-gray-400 text-sm mb-6">
            <span className="text-green-400 font-bold text-lg">{result.sent_count}</span> emails sent
            {result.failed_count > 0 && <span className="text-red-400 ml-2">· {result.failed_count} failed</span>}
            <span className="text-gray-600 ml-2">of {result.recipients} recipients</span>
          </p>
          <div className="bg-gray-900 rounded-xl p-4 text-left mb-6">
            <p className="text-gray-500 text-xs mb-1">Campaign</p>
            <p className="text-white font-semibold">{form.headline}</p>
            <p className="text-gray-400 text-xs mt-1 font-mono">ID: {result.blast_id.substring(0, 16)}...</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setStep('compose'); setResult(null); setForm({ headline: '', offer_text: '', cta_url: '', cta_label: 'Claim Offer', expires_at: '', filter_city: '', filter_business_type: '', filter_country: '' }) }}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-medium transition">
              Send Another
            </button>
            <Link href="/admin/leads" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium transition text-center flex items-center justify-center">
              Back to Leads
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── CONFIRM screen ────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <button onClick={() => setStep('compose')} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-3 transition">
            <ChevronLeft size={12} /> Back to Compose
          </button>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Send className="text-blue-400" size={22} />
            Confirm Blast
          </h1>
        </div>

        {/* Preview card */}
        <div className="bg-white rounded-2xl p-6 mb-5 shadow-lg">
          <div className="border-b border-gray-100 pb-4 mb-4">
            <p className="text-gray-500 text-xs mb-1">Subject / Headline</p>
            <p className="text-gray-900 font-bold text-lg">{form.headline}</p>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">{form.offer_text}</p>
          {form.expires_at && (
            <p className="text-gray-500 text-xs mb-4">⏰ Expires: {new Date(form.expires_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          )}
          <a href={form.cta_url} target="_blank" rel="noopener"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold">
            {form.cta_label} →
          </a>
        </div>

        {/* Audience summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-5">
          <h3 className="text-white font-semibold text-sm mb-3">Audience</h3>
          <div className="flex items-center gap-3 mb-3">
            <Users size={16} className="text-blue-400" />
            <span className="text-white font-bold text-lg">{audience?.count ?? 0}</span>
            <span className="text-gray-500 text-sm">opted-in lead{(audience?.count ?? 0) !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {form.filter_city && <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">📍 {form.filter_city}</span>}
            {form.filter_business_type && <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded capitalize">🏪 {form.filter_business_type}</span>}
            {form.filter_country && <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded">🌏 {form.filter_country}</span>}
            {!form.filter_city && !form.filter_business_type && !form.filter_country && (
              <span className="bg-blue-900/50 text-blue-400 px-2 py-1 rounded">🌐 All opted-in leads</span>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3 mb-4 text-red-300 text-sm">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-xl p-3 mb-5">
          <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ This action will send real emails</p>
          <p className="text-yellow-200/50 text-xs">
            {audience?.count ?? 0} people will receive this email immediately. Make sure your content is accurate before sending.
          </p>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || (audience?.count ?? 0) === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 text-sm transition"
        >
          {sending
            ? <><Loader2 size={16} className="animate-spin" /> Sending emails...</>
            : <><Send size={16} /> Send to {audience?.count ?? 0} Lead{(audience?.count ?? 0) !== 1 ? 's' : ''}</>
          }
        </button>
      </div>
    )
  }

  // ── COMPOSE screen ────────────────────────────────────────────
  const canProceed = form.headline && form.offer_text && form.cta_url && (audience?.count ?? 0) > 0

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/leads" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-3 transition">
          <ChevronLeft size={12} /> Back to Leads Inbox
        </Link>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" size={24} />
          Compose Promotion Blast
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Send a targeted offer to opted-in leads across your network.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* ── LEFT — Form ── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Campaign content */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm">Campaign Content</h2>

            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">
                Headline / Subject <span className="text-red-400">*</span>
              </label>
              <input
                value={form.headline}
                onChange={e => set('headline', e.target.value)}
                placeholder="🎉 Exclusive Offer for Our Valued Customers"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">
                Offer Text <span className="text-red-400">*</span>
              </label>
              <textarea
                value={form.offer_text}
                onChange={e => set('offer_text', e.target.value)}
                rows={4}
                placeholder="Hi [Name], we have a special offer just for you! Book any service this month and get 20% off your first visit..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">
                  CTA URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={form.cta_url}
                  onChange={e => set('cta_url', e.target.value)}
                  placeholder="https://yourbusiness.com/book"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">CTA Button Label</label>
                <input
                  value={form.cta_label}
                  onChange={e => set('cta_label', e.target.value)}
                  placeholder="Claim Offer"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">
                Offer Expiry Date <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={form.expires_at}
                onChange={e => set('expires_at', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Audience filters */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm">Audience Filters</h2>
            <p className="text-gray-500 text-xs">Only opted-in leads match. Leave all blank to reach everyone.</p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">City</label>
                <input
                  value={form.filter_city}
                  onChange={e => set('filter_city', e.target.value)}
                  placeholder="e.g. Sydney"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">Business Type</label>
                <select
                  value={form.filter_business_type}
                  onChange={e => set('filter_business_type', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">All types</option>
                  {BUSINESS_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">Country</label>
                <input
                  value={form.filter_country}
                  onChange={e => set('filter_country', e.target.value.toUpperCase())}
                  placeholder="e.g. AU"
                  maxLength={2}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono uppercase placeholder-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT — Audience preview ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                <Users size={14} className="text-blue-400" /> Audience
              </h2>
              <button onClick={loadAudience} disabled={previewLoading}
                className="text-gray-500 hover:text-white text-xs transition flex items-center gap-1">
                <Search size={12} className={previewLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            {previewLoading ? (
              <div className="text-center py-6 text-gray-600 text-sm flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Counting...
              </div>
            ) : audience ? (
              <>
                <div className={`text-center py-4 rounded-xl mb-4 ${audience.count > 0 ? 'bg-blue-950/30 border border-blue-800/50' : 'bg-gray-800'}`}>
                  <p className={`text-4xl font-black mb-1 ${audience.count > 0 ? 'text-blue-400' : 'text-gray-600'}`}>
                    {audience.count}
                  </p>
                  <p className="text-gray-500 text-xs">opted-in lead{audience.count !== 1 ? 's' : ''} will receive this</p>
                </div>

                {audience.sample.length > 0 && (
                  <div>
                    <p className="text-gray-600 text-xs mb-2">Sample recipients</p>
                    <div className="space-y-2">
                      {audience.sample.map((l, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg px-3 py-2">
                          <p className="text-white text-xs font-medium">{l.name}</p>
                          <p className="text-gray-500 text-xs">{l.email}</p>
                          {(l.city || l.business_type) && (
                            <p className="text-gray-600 text-xs capitalize">{[l.city, l.business_type].filter(Boolean).join(' · ')}</p>
                          )}
                        </div>
                      ))}
                      {audience.count > 5 && (
                        <p className="text-gray-600 text-xs text-center">+{audience.count - 5} more</p>
                      )}
                    </div>
                  </div>
                )}

                {audience.count === 0 && (
                  <p className="text-gray-500 text-xs text-center">
                    No opted-in leads match your filters.
                    {form.filter_city || form.filter_business_type || form.filter_country
                      ? ' Try broadening the filters.'
                      : ' Leads must check the opt-in box when submitting an inquiry.'}
                  </p>
                )}
              </>
            ) : (
              <p className="text-gray-600 text-xs text-center py-4">Loading audience preview...</p>
            )}

            <button
              onClick={() => setStep('confirm')}
              disabled={!canProceed}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3 flex items-center justify-center gap-2 text-sm transition"
            >
              <Eye size={14} />
              Preview &amp; Send
            </button>

            {!canProceed && (
              <p className="text-gray-600 text-xs text-center mt-2">
                {!form.headline || !form.offer_text || !form.cta_url
                  ? 'Fill in headline, offer text, and CTA URL'
                  : 'No opted-in leads match your filters'}
              </p>
            )}
          </div>

          {/* Compliance note */}
          <div className="bg-yellow-950/30 border border-yellow-800/40 rounded-xl p-4">
            <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Compliance reminder</p>
            <p className="text-yellow-200/50 text-xs leading-relaxed">
              Only leads who opted in are included. Every email includes an unsubscribe link. Respect local spam laws (AU Spam Act, PH DPA, UK PECR, US CAN-SPAM).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
