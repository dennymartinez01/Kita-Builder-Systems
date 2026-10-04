'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Megaphone, ChevronLeft, Save, Loader2, Users, Search, AlertCircle } from 'lucide-react'

const BUSINESS_TYPES = ['salon', 'clinic', 'pet', 'cafe', 'mechanic']

interface AudiencePreview { count: number; suppressed?: number }

export default function NewCampaignPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name:                 '',
    description:          '',
    subject:              '',
    body_text:            '',
    cta_url:              '',
    cta_label:            'Learn More',
    expires_at:           '',
    filter_city:          '',
    filter_business_type: '',
    filter_country:       '',
  })
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [audience, setAudience]       = useState<AudiencePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
    setAudience(null)
  }

  async function previewAudience() {
    setPreviewLoading(true)
    try {
      const params = new URLSearchParams()
      if (form.filter_city)          params.set('city',          form.filter_city)
      if (form.filter_business_type) params.set('business_type', form.filter_business_type)
      if (form.filter_country)       params.set('country',       form.filter_country)
      const res  = await fetch(`/api/leads/promote?${params}`)
      const data = await res.json()
      setAudience({ count: data.count ?? 0 })
    } finally { setPreviewLoading(false) }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.subject || !form.body_text || !form.cta_url) {
      setError('Name, subject, offer text, and CTA URL are required.')
      return
    }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/campaigns', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          expires_at: form.expires_at ? new Date(form.expires_at + 'T23:59:59').toISOString() : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign')
      router.push('/admin/campaigns')
    } catch (err: any) {
      setError(err.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/campaigns" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-3 transition">
          <ChevronLeft size={12} /> Back to Campaigns
        </Link>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Megaphone className="text-blue-400" size={24} />
          New Campaign
        </h1>
        <p className="text-gray-400 text-sm mt-1">Create a reusable email campaign. You can send it immediately or save as draft.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Identity */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-sm">Campaign Identity</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Campaign Name <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Spring Promo 2026"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Internal Description</label>
              <input value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Notes for yourself..."
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600" />
            </div>
          </div>
        </div>

        {/* Email content */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-sm">Email Content</h2>

          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Subject Line <span className="text-red-400">*</span></label>
            <input value={form.subject} onChange={e => set('subject', e.target.value)}
              placeholder="🎉 Exclusive Offer — Limited Time Only"
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600" />
          </div>

          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Offer Text <span className="text-red-400">*</span></label>
            <textarea value={form.body_text} onChange={e => set('body_text', e.target.value)}
              rows={4} placeholder="Hi there! We have a special offer just for you..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600 resize-none" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">CTA URL <span className="text-red-400">*</span></label>
              <input type="url" value={form.cta_url} onChange={e => set('cta_url', e.target.value)}
                placeholder="https://yourbusiness.com/offer"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">CTA Label</label>
              <input value={form.cta_label} onChange={e => set('cta_label', e.target.value)}
                placeholder="Claim Offer"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600" />
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-xs font-medium block mb-1.5">Expiry Date (optional)</label>
            <input type="date" value={form.expires_at} onChange={e => set('expires_at', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* Audience */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-sm">Audience Filters</h2>
          <p className="text-gray-500 text-xs">Leave blank to reach all opted-in leads. Suppressed emails are always excluded.</p>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">City</label>
              <input value={form.filter_city} onChange={e => set('filter_city', e.target.value)}
                placeholder="e.g. Sydney"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-600" />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Business Type</label>
              <select value={form.filter_business_type} onChange={e => set('filter_business_type', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                <option value="">All types</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1.5">Country (ISO)</label>
              <input value={form.filter_country} onChange={e => set('filter_country', e.target.value.toUpperCase())}
                placeholder="AU" maxLength={2}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono uppercase placeholder-gray-600" />
            </div>
          </div>

          <button type="button" onClick={previewAudience} disabled={previewLoading}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-2 rounded-lg transition disabled:opacity-50">
            {previewLoading
              ? <Loader2 size={13} className="animate-spin" />
              : <><Search size={13} /><Users size={13} /></>
            }
            {previewLoading ? 'Checking...' : 'Preview Audience'}
          </button>

          {audience !== null && (
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs ${audience.count > 0 ? 'bg-blue-950/30 border border-blue-800/50 text-blue-300' : 'bg-gray-800 text-gray-500'}`}>
              <Users size={13} />
              <span>{audience.count > 0 ? `${audience.count} opted-in lead${audience.count !== 1 ? 's' : ''} will receive this campaign` : 'No opted-in leads match these filters'}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3 text-red-300 text-sm">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />{error}
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/admin/campaigns" className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl text-sm transition text-center">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Saving...' : 'Save Campaign'}
          </button>
        </div>
      </form>
    </div>
  )
}
