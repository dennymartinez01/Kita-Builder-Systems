'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPE_ICONS } from '@/lib/templates'
import type { BusinessType } from '@/types/database'
import { Zap, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'

interface GenerateResult {
  slug: string
  business_name: string
  business_type: BusinessType
}

const BUSINESS_TYPES: BusinessType[] = ['salon', 'clinic', 'pet', 'cafe', 'mechanic']

function GenerateForm() {
  const searchParams = useSearchParams()
  const presetType = searchParams.get('type') as BusinessType | null
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerateResult | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    business_name: '',
    business_type: (presetType || 'salon') as BusinessType,
    location: '',
    owner_email: '',
    extra_notes: '',
  })

  // Update type if coming from template page
  useEffect(() => {
    if (presetType) setForm(f => ({ ...f, business_type: presetType }))
  }, [presetType])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
    setForm({ business_name: '', business_type: presetType || 'salon', location: '', owner_email: '', extra_notes: '' })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Zap className="text-yellow-400" size={24} />
          Generate New Site
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Fill in the business details — AI will generate the full site in ~10 seconds.
        </p>
      </div>

      {result ? (
        <div className="bg-green-950/40 border border-green-800/50 rounded-2xl p-8 text-center">
          <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
          <h2 className="text-white text-xl font-bold mb-1">Site Generated!</h2>
          <p className="text-gray-400 text-sm mb-6">{result.business_name} is live on your local server.</p>

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
              <p className="text-gray-600 text-xs mt-1">Change via Supabase → sites table → owner_pin column</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl text-sm font-medium transition"
            >
              Generate Another
            </button>
            <Link
              href="/admin/sites"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium transition text-center"
            >
              View All Sites
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-5">
          {/* Business Type */}
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
                  className={`
                    flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition text-left
                    ${form.business_type === type
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                    }
                  `}
                >
                  <span className="text-lg">{BUSINESS_TYPE_ICONS[type]}</span>
                  <span className="text-xs leading-tight">{BUSINESS_TYPE_LABELS[type].split('/')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Business Name */}
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

          {/* Location */}
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

          {/* Owner Email */}
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

          {/* Extra notes */}
          <div>
            <label className="text-gray-400 text-xs font-medium block mb-2">
              Extra Context <span className="text-gray-600 text-xs">(optional — helps AI generate better copy)</span>
            </label>
            <textarea
              value={form.extra_notes}
              onChange={e => setForm(f => ({ ...f, extra_notes: e.target.value }))}
              placeholder="e.g. Specialises in fade cuts, open 7 days, $65 for adults / $45 for kids, parking available..."
              rows={3}
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition placeholder-gray-600 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-950/50 border border-red-900/50 rounded-xl p-4 text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition text-sm"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generating with AI... (~10 seconds)
              </>
            ) : (
              <>
                <Zap size={16} />
                Generate Site
              </>
            )}
          </button>

          <p className="text-gray-700 text-xs text-center">
            Uses ~$0.01 of OpenAI credits per generation
          </p>
        </form>
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
