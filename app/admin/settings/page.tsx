'use client'

import { useState, useRef, useEffect } from 'react'
import { Settings, Upload, CheckCircle, AlertCircle, Loader2, ImageIcon, Trash2, RefreshCw, CreditCard, FlaskConical, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const LOGO_STORAGE_KEY = 'kita_logo_url'

export default function SettingsPage() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [adminPin, setAdminPin] = useState('')
  const [pinSaved, setPinSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Stripe mode state
  const [stripeMode, setStripeMode] = useState<'test' | 'live'>('test')
  const [stripeModeLoading, setStripeModeLoading] = useState(true)
  const [stripeModeStatus, setStripeModeStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [savingStripeMode, setSavingStripeMode] = useState(false)

  useEffect(() => {
    loadExistingLogo()
    loadStripeMode()
  }, [])

  // ── Stripe mode ───────────────────────────────────────────────
  async function loadStripeMode() {
    setStripeModeLoading(true)
    try {
      const res = await fetch('/api/admin-config')
      const data = await res.json()
      if (data?.stripe_mode) setStripeMode(data.stripe_mode as 'test' | 'live')
    } catch {
      // API unavailable — default stays 'test'
    } finally {
      setStripeModeLoading(false)
    }
  }

  async function saveStripeMode(mode: 'test' | 'live') {
    if (mode === 'live') {
      const confirmed = confirm(
        '⚠️ Switch to LIVE mode?\n\nThis will charge real money on the next payment. Make sure your live Stripe keys (STRIPE_SECRET_KEY_LIVE, STRIPE_WEBHOOK_SECRET_LIVE) are set in .env.local and Vercel. Continue?'
      )
      if (!confirmed) return
    }
    setSavingStripeMode(true)
    setStripeModeStatus(null)
    try {
      const res = await fetch('/api/admin-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripe_mode: mode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setStripeMode(mode)
      setStripeModeStatus({
        type: 'success',
        message: `Switched to ${mode.toUpperCase()} mode. All new checkout sessions will use your ${mode} Stripe keys.`,
      })
    } catch (err: any) {
      setStripeModeStatus({
        type: 'error',
        message: err.message || 'Failed to save. Try again.',
      })
    } finally {
      setSavingStripeMode(false)
    }
  }

  async function loadExistingLogo() {
    try {
      // List files in brand/ folder — reliable way to check what's actually stored
      const { data: files, error } = await supabase.storage
        .from('kita-assets')
        .list('brand', { limit: 10 })

      if (error || !files || files.length === 0) return

      // Pick the first logo file found (kita-logo.*)
      const logoFile = files.find(f => f.name.startsWith('kita-logo'))
      if (!logoFile) return

      const { data: urlData } = supabase.storage
        .from('kita-assets')
        .getPublicUrl(`brand/${logoFile.name}`)

      // Cache-bust so browser always shows the latest version
      setLogoUrl(urlData.publicUrl + '?t=' + Date.now())
    } catch {
      // Storage not set up yet — fine for first run
    }
  }

  function handleFileSelect(file: File) {
    if (!file) return
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setStatus({ type: 'error', message: 'Invalid file type. Use PNG, JPG, WebP, or SVG.' })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File too large. Maximum 2MB.' })
      return
    }
    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setStatus(null)
    uploadFile(file)
  }

  async function uploadFile(file: File) {
    setUploading(true)
    setStatus(null)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setLogoUrl(data.url + '?t=' + Date.now())
      setPreview(null)
      setStatus({ type: 'success', message: 'Logo uploaded successfully! It will appear in the admin sidebar.' })

      // Broadcast logo change to other components
      window.dispatchEvent(new CustomEvent('kita-logo-updated', { detail: { url: data.url } }))
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message || 'Upload failed. Check Supabase Storage is set up.' })
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  async function removeLogo() {
    if (!confirm('Remove the current logo? The default placeholder will show instead.')) return
    try {
      const supabaseServer = supabase
      await supabaseServer.storage.from('kita-assets').remove([
        'brand/kita-logo.png',
        'brand/kita-logo.jpg',
        'brand/kita-logo.webp',
        'brand/kita-logo.svg',
      ])
      setLogoUrl(null)
      setPreview(null)
      setStatus({ type: 'success', message: 'Logo removed. Default placeholder is now showing.' })
    } catch {
      setStatus({ type: 'error', message: 'Could not remove logo.' })
    }
  }

  function savePin() {
    // PIN changes require updating .env.local manually
    // This just shows instructions — real PIN change needs server restart
    setPinSaved(true)
    setTimeout(() => setPinSaved(false), 3000)
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-gray-400" size={24} />
          Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your KITA Builder branding and admin configuration.
        </p>
      </div>

      {/* LOGO SECTION */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-1">KITA Systems Logo</h2>
        <p className="text-gray-500 text-sm mb-5">
          Appears in the admin sidebar and login screen. Recommended: PNG with transparent background, min 400×200px.
        </p>

        {/* Current logo display */}
        <div className="flex items-start gap-6 mb-5">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 w-48 h-24 flex items-center justify-center shrink-0">
            {preview ? (
              <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
            ) : logoUrl ? (
              <img src={logoUrl} alt="KITA Logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg mx-auto flex items-center justify-center mb-1">
                  <span className="text-white font-black text-lg">K</span>
                </div>
                <p className="text-gray-600 text-xs">Default placeholder</p>
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-gray-400 text-sm mb-3">
              {logoUrl ? '✅ Custom logo is active' : '⚠️ Using default placeholder — upload your KITA logo'}
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                <Upload size={14} />
                {logoUrl ? 'Replace Logo' : 'Upload Logo'}
              </button>
              {logoUrl && (
                <button
                  onClick={removeLogo}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg transition"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              )}
              <button
                onClick={loadExistingLogo}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-sm px-4 py-2 rounded-lg transition"
                title="Reload from storage"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition
            ${dragging
              ? 'border-blue-500 bg-blue-950/20'
              : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
            }
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="text-blue-400 animate-spin" />
              <p className="text-gray-400 text-sm">Uploading to Supabase Storage...</p>
            </div>
          ) : (
            <>
              <ImageIcon size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                <span className="text-blue-400 font-medium">Click to browse</span> or drag & drop
              </p>
              <p className="text-gray-600 text-xs mt-1">PNG, JPG, WebP, SVG · Max 2MB</p>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
          onChange={handleInputChange}
          className="hidden"
        />

        {/* Status message */}
        {status && (
          <div className={`mt-4 flex items-start gap-2 p-3 rounded-xl text-sm ${
            status.type === 'success'
              ? 'bg-green-950/40 border border-green-900/50 text-green-300'
              : 'bg-red-950/40 border border-red-900/50 text-red-300'
          }`}>
            {status.type === 'success'
              ? <CheckCircle size={16} className="shrink-0 mt-0.5" />
              : <AlertCircle size={16} className="shrink-0 mt-0.5" />
            }
            {status.message}
          </div>
        )}

        {/* Storage setup reminder */}
        <div className="mt-4 bg-yellow-950/30 border border-yellow-900/40 rounded-xl p-3">
          <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Supabase Storage Required</p>
          <p className="text-yellow-200/50 text-xs">
            If upload fails, run <code className="font-mono text-yellow-300">supabase/storage.sql</code> in your Supabase SQL Editor first to create the storage bucket.
          </p>
        </div>
      </div>

      {/* ADMIN PIN SECTION */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-1">Admin PIN</h2>
        <p className="text-gray-500 text-sm mb-4">
          Your current PIN: <code className="text-blue-300 font-mono">{process.env.NEXT_PUBLIC_ADMIN_PIN || 'kita2024'}</code>
          <br />
          To change it, update <code className="text-blue-300 font-mono">NEXT_PUBLIC_ADMIN_PIN</code> in <code className="text-blue-300 font-mono">.env.local</code> and restart the dev server.
        </p>
        <div className="bg-gray-800 rounded-xl p-3 text-xs font-mono text-gray-500">
          NEXT_PUBLIC_ADMIN_PIN=your_new_pin
        </div>
      </div>

      {/* WHITE LABEL SECTION */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-white font-semibold">White Label Mode</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            process.env.NEXT_PUBLIC_WHITE_LABEL_MODE === 'on'
              ? 'bg-green-900/50 text-green-400'
              : 'bg-gray-800 text-gray-500'
          }`}>
            {process.env.NEXT_PUBLIC_WHITE_LABEL_MODE === 'on' ? 'ON' : 'OFF'}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          When enabled, KITA branding is replaced with your agency name on all client sites and dashboards.
          Perfect for reselling to other agencies.
        </p>

        <div className="space-y-3 mb-4">
          {[
            { key: 'NEXT_PUBLIC_WHITE_LABEL_MODE', value: process.env.NEXT_PUBLIC_WHITE_LABEL_MODE || 'off', desc: 'on = hide KITA branding, off = show KITA branding' },
            { key: 'NEXT_PUBLIC_AGENCY_NAME', value: process.env.NEXT_PUBLIC_AGENCY_NAME || 'KITA Systems', desc: 'Your agency / brand name' },
            { key: 'NEXT_PUBLIC_AGENCY_TAGLINE', value: process.env.NEXT_PUBLIC_AGENCY_TAGLINE || 'From Struggle to Booked.', desc: 'Shown in footer of client sites' },
            { key: 'NEXT_PUBLIC_AGENCY_URL', value: process.env.NEXT_PUBLIC_AGENCY_URL || '', desc: 'Your website URL (linked in footer)' },
            { key: 'NEXT_PUBLIC_AGENCY_LOGO_URL', value: process.env.NEXT_PUBLIC_AGENCY_LOGO_URL || '(not set)', desc: 'URL to your agency logo image' },
          ].map(item => (
            <div key={item.key} className="bg-gray-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <code className="text-green-400 text-xs font-mono">{item.key}</code>
                <span className="text-gray-400 text-xs">{item.value}</span>
              </div>
              <p className="text-gray-600 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-4">
          <p className="text-blue-400 text-xs font-semibold mb-2">How to enable white label:</p>
          <pre className="text-xs text-gray-400 font-mono leading-5">{`# In .env.local (and Vercel Environment Variables):
NEXT_PUBLIC_WHITE_LABEL_MODE=on
NEXT_PUBLIC_AGENCY_NAME=Your Agency Name
NEXT_PUBLIC_AGENCY_TAGLINE=Your tagline here
NEXT_PUBLIC_AGENCY_URL=https://youragency.com
NEXT_PUBLIC_AGENCY_LOGO_URL=https://youragency.com/logo.png`}</pre>
        </div>

        <div className="mt-4 bg-gray-800 rounded-xl p-4">
          <p className="text-white text-xs font-semibold mb-2">Per-site white label (via theme_json)</p>
          <p className="text-gray-500 text-xs mb-2">You can also override branding per site by editing the site's <code className="text-blue-300">theme_json</code> in Supabase:</p>
          <pre className="text-xs text-gray-400 font-mono leading-5">{`"white_label": {
  "enabled": true,
  "custom_footer": "Powered by Sydney Web Co.",
  "hide_footer_brand": false
}`}</pre>
        </div>
      </div>

      {/* STRIPE MODE SECTION */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <CreditCard size={18} className="text-gray-400" />
          <h2 className="text-white font-semibold">Stripe Payment Mode</h2>
          {stripeModeLoading ? (
            <Loader2 size={14} className="text-gray-600 animate-spin" />
          ) : (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              stripeMode === 'live'
                ? 'bg-green-900/60 text-green-400 border border-green-700'
                : 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'
            }`}>
              {stripeMode === 'live' ? '🟢 LIVE' : '🧪 TEST'}
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mb-5">
          Toggle between Stripe test mode (safe, no real charges) and live mode (real payments). The active mode applies to all new checkout sessions immediately — no redeploy needed.
        </p>

        {/* Toggle buttons */}
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => saveStripeMode('test')}
            disabled={savingStripeMode || stripeMode === 'test'}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition border ${
              stripeMode === 'test'
                ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300 cursor-default'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            {savingStripeMode && stripeMode !== 'test' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FlaskConical size={14} />
            )}
            Test Mode
            {stripeMode === 'test' && <span className="text-xs opacity-60">(active)</span>}
          </button>

          <button
            onClick={() => saveStripeMode('live')}
            disabled={savingStripeMode || stripeMode === 'live'}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition border ${
              stripeMode === 'live'
                ? 'bg-green-900/30 border-green-700 text-green-300 cursor-default'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-green-400 hover:border-green-800'
            }`}
          >
            {savingStripeMode && stripeMode !== 'live' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Zap size={14} />
            )}
            Live Mode
            {stripeMode === 'live' && <span className="text-xs opacity-60">(active)</span>}
          </button>
        </div>

        {/* Status feedback */}
        {stripeModeStatus && (
          <div className={`mb-4 flex items-start gap-2 p-3 rounded-xl text-sm ${
            stripeModeStatus.type === 'success'
              ? 'bg-green-950/40 border border-green-900/50 text-green-300'
              : 'bg-red-950/40 border border-red-900/50 text-red-300'
          }`}>
            {stripeModeStatus.type === 'success'
              ? <CheckCircle size={15} className="shrink-0 mt-0.5" />
              : <AlertCircle size={15} className="shrink-0 mt-0.5" />
            }
            {stripeModeStatus.message}
          </div>
        )}

        {/* Live mode warning */}
        {stripeMode === 'live' && (
          <div className="bg-red-950/30 border border-red-800/60 rounded-xl p-4 mb-4">
            <p className="text-red-400 text-xs font-bold mb-1">🔴 LIVE MODE IS ACTIVE — Real money will be charged</p>
            <p className="text-red-300/60 text-xs">
              Every checkout session created right now will charge real cards. Only use this when you have a paying client ready. Switch back to Test anytime — no data is lost.
            </p>
          </div>
        )}

        {/* Key reference */}
        <div className="bg-gray-800 rounded-xl p-4">
          <p className="text-gray-400 text-xs font-semibold mb-3">Required env vars for each mode</p>
          <div className="space-y-2">
            {[
              { mode: 'test', vars: ['STRIPE_SECRET_KEY_TEST', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST', 'STRIPE_WEBHOOK_SECRET_TEST'] },
              { mode: 'live', vars: ['STRIPE_SECRET_KEY_LIVE', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE', 'STRIPE_WEBHOOK_SECRET_LIVE'] },
            ].map(row => (
              <div key={row.mode} className={`rounded-lg p-3 border ${row.mode === stripeMode ? 'border-blue-800 bg-blue-950/20' : 'border-gray-700 bg-gray-900'}`}>
                <p className={`text-xs font-bold mb-1.5 ${row.mode === stripeMode ? 'text-blue-400' : 'text-gray-500'}`}>
                  {row.mode === stripeMode ? '▶ Active — ' : ''}{row.mode.toUpperCase()} keys
                </p>
                <div className="space-y-1">
                  {row.vars.map(v => (
                    <code key={v} className="block text-xs text-gray-500 font-mono">{v}</code>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-xs mt-3">
            Set these in <code className="text-blue-300">.env.local</code> (local) and in <strong className="text-gray-400">Vercel → Settings → Environment Variables</strong> (production). The app also reads the legacy <code className="text-blue-300">STRIPE_SECRET_KEY</code> as a fallback.
          </p>
        </div>

        {/* Setup reminder */}
        <div className="mt-4 bg-yellow-950/30 border border-yellow-900/40 rounded-xl p-3">
          <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ First time setup</p>
          <p className="text-yellow-200/50 text-xs">
            Run <code className="font-mono text-yellow-300">supabase/admin-config.sql</code> in your Supabase SQL Editor once to enable this toggle. Until then, the app falls back to <code className="font-mono text-yellow-300">STRIPE_SECRET_KEY</code> from your env.
          </p>
        </div>
      </div>

      {/* NOTIFICATION EMAIL SECTION */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">Notification Email</h2>
        <p className="text-gray-500 text-sm mb-4">
          Booking notifications go to this address when no owner email is set on a site.
          <br />
          Current: <code className="text-blue-300 font-mono">{process.env.NOTIFICATION_EMAIL || 'not set'}</code>
        </p>
        <div className="bg-gray-800 rounded-xl p-3 text-xs font-mono text-gray-500">
          NOTIFICATION_EMAIL=your@email.com
        </div>
        <p className="text-gray-600 text-xs mt-2">Change in .env.local and restart dev server.</p>
      </div>
    </div>
  )
}
