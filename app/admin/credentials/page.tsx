'use client'

import { useState } from 'react'
import { Eye, EyeOff, Copy, CheckCheck, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react'

interface Credential {
  id: string
  service: string
  purpose: string
  loginUrl: string
  envKey: string
  category: 'database' | 'ai' | 'email' | 'hosting' | 'payment' | 'sms' | 'storage'
  required: boolean
  phase: 'mvp' | 'v2'
  status: 'connected' | 'missing' | 'optional'
  docsUrl?: string
}

// All credentials for the KITA project, sourced from your accounts CSV
const CREDENTIALS: Credential[] = [
  // DATABASE
  {
    id: 'supabase_url',
    service: 'Supabase',
    purpose: 'Database, Auth & Storage — core backend',
    loginUrl: 'https://supabase.com/dashboard/sign-in',
    envKey: 'NEXT_PUBLIC_SUPABASE_URL',
    category: 'database',
    required: true,
    phase: 'mvp',
    status: 'missing',
    docsUrl: 'https://supabase.com/docs',
  },
  {
    id: 'supabase_anon',
    service: 'Supabase',
    purpose: 'Supabase Anonymous Key (public, safe for client)',
    loginUrl: 'https://supabase.com/dashboard/sign-in',
    envKey: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    category: 'database',
    required: true,
    phase: 'mvp',
    status: 'missing',
  },
  {
    id: 'supabase_service',
    service: 'Supabase',
    purpose: 'Supabase Service Role Key (server-side admin ops only)',
    loginUrl: 'https://supabase.com/dashboard/sign-in',
    envKey: 'SUPABASE_SERVICE_ROLE_KEY',
    category: 'database',
    required: false,
    phase: 'mvp',
    status: 'optional',
  },
  // AI
  {
    id: 'claude',
    service: 'Claude (Anthropic)',
    purpose: 'Site generation + agentic editing — active AI engine (claude-haiku-3-5)',
    loginUrl: 'https://platform.claude.com',
    envKey: 'CLAUDE_API_KEY',
    category: 'ai',
    required: true,
    phase: 'mvp',
    status: 'missing',
    docsUrl: 'https://docs.anthropic.com',
  },
  {
    id: 'openai',
    service: 'OpenAI',
    purpose: 'Alternative AI (not currently used — requires paid credits)',
    loginUrl: 'https://platform.openai.com/api-keys',
    envKey: 'OPENAI_API_KEY',
    category: 'ai',
    required: false,
    phase: 'v2',
    status: 'optional',
    docsUrl: 'https://platform.openai.com/docs',
  },
  // EMAIL
  {
    id: 'resend',
    service: 'Resend',
    purpose: 'Email notifications for bookings (MVP SMS replacement)',
    loginUrl: 'https://resend.com/login',
    envKey: 'RESEND_API_KEY',
    category: 'email',
    required: true,
    phase: 'mvp',
    status: 'missing',
    docsUrl: 'https://resend.com/docs',
  },
  // HOSTING
  {
    id: 'vercel',
    service: 'Vercel',
    purpose: 'Production hosting for the Next.js app',
    loginUrl: 'https://vercel.com/login',
    envKey: '— (CLI / dashboard only)',
    category: 'hosting',
    required: true,
    phase: 'mvp',
    status: 'optional',
    docsUrl: 'https://vercel.com/docs',
  },
  // PAYMENT
  {
    id: 'stripe',
    service: 'Stripe',
    purpose: 'Booking deposits & monthly subscription billing',
    loginUrl: 'https://dashboard.stripe.com/',
    envKey: 'STRIPE_SECRET_KEY',
    category: 'payment',
    required: false,
    phase: 'v2',
    status: 'optional',
    docsUrl: 'https://stripe.com/docs',
  },
  // SMS
  {
    id: 'twilio',
    service: 'Twilio',
    purpose: 'Real SMS reminders to owners + customers',
    loginUrl: 'https://console.twilio.com',
    envKey: 'TWILIO_AUTH_TOKEN',
    category: 'sms',
    required: false,
    phase: 'v2',
    status: 'optional',
    docsUrl: 'https://www.twilio.com/docs',
  },
  // STORAGE
  {
    id: 'cloudinary',
    service: 'Cloudinary',
    purpose: 'Image uploads for business logos & gallery',
    loginUrl: 'https://console.cloudinary.com/app',
    envKey: 'CLOUDINARY_API_KEY',
    category: 'storage',
    required: false,
    phase: 'v2',
    status: 'optional',
    docsUrl: 'https://cloudinary.com/documentation',
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  database: '🗄️ Database',
  ai: '🤖 AI / Generation',
  email: '📧 Email',
  hosting: '🚀 Hosting',
  payment: '💳 Payments',
  sms: '📱 SMS',
  storage: '🖼️ Storage / Media',
}

const CATEGORY_ORDER = ['database', 'ai', 'email', 'hosting', 'payment', 'sms', 'storage']

const STATUS_BADGE: Record<string, string> = {
  connected: 'bg-green-900/50 text-green-400 border-green-800',
  missing: 'bg-red-900/50 text-red-400 border-red-800',
  optional: 'bg-gray-800 text-gray-500 border-gray-700',
}

export default function CredentialsPage() {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'mvp' | 'v2'>('all')
  const [notes, setNotes] = useState<Record<string, string>>({})

  function toggleVisibility(id: string) {
    setVisibleKeys(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function copyToClipboard(text: string, id: string) {
    await navigator.clipboard.writeText(text)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const filtered = CREDENTIALS.filter(c => filter === 'all' || c.phase === filter)
  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = filtered.filter(c => c.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {} as Record<string, Credential[]>)

  const mvpCount = CREDENTIALS.filter(c => c.phase === 'mvp' && c.required).length
  const mvpMissing = CREDENTIALS.filter(c => c.phase === 'mvp' && c.required && c.status === 'missing').length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-blue-400" size={24} />
          API Keys & Credentials
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          All accounts and keys required to run KITA Builder Systems.
          Update actual values in your <span className="font-mono text-blue-300">.env.local</span> file.
        </p>
      </div>

      {/* Status banner */}
      {mvpMissing > 0 && (
        <div className="bg-red-950/40 border border-red-900/50 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 font-semibold text-sm">
              {mvpMissing} of {mvpCount} required MVP keys are not yet added to .env.local
            </p>
            <p className="text-red-200/50 text-xs mt-0.5">
              The app will throw errors until these are set. Add them now before running.
            </p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'mvp', 'v2'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'All Services' : f === 'mvp' ? 'MVP (Required Now)' : 'V2 (Later)'}
          </button>
        ))}
      </div>

      {/* Credential groups */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([category, creds]) => (
          <div key={category}>
            <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="space-y-3">
              {creds.map(cred => (
                <div
                  key={cred.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">{cred.service}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[cred.status]}`}>
                          {cred.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          cred.phase === 'mvp'
                            ? 'bg-blue-900/50 text-blue-400'
                            : 'bg-gray-800 text-gray-500'
                        }`}>
                          {cred.phase.toUpperCase()}
                        </span>
                        {cred.required && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-900/40 text-orange-400">
                            required
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{cred.purpose}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {cred.docsUrl && (
                        <a
                          href={cred.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-gray-400 transition"
                          title="Docs"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <a
                        href={cred.loginUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline whitespace-nowrap"
                      >
                        Login →
                      </a>
                    </div>
                  </div>

                  {/* Env Key row */}
                  <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                    <code className="text-green-400 text-xs flex-1 font-mono truncate">
                      {cred.envKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(cred.envKey, cred.id)}
                      className="text-gray-500 hover:text-white transition shrink-0"
                      title="Copy env key name"
                    >
                      {copiedKey === cred.id
                        ? <CheckCheck size={13} className="text-green-400" />
                        : <Copy size={13} />
                      }
                    </button>
                  </div>

                  {/* Notes field */}
                  <div className="mt-2">
                    <input
                      type="text"
                      value={notes[cred.id] || ''}
                      onChange={e => setNotes(prev => ({ ...prev, [cred.id]: e.target.value }))}
                      placeholder="Your notes (e.g. account name, project, last updated) — saved in browser only"
                      className="w-full bg-transparent text-gray-600 text-xs placeholder-gray-700 focus:outline-none focus:text-gray-400 border-0 py-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* .env.local template */}
      <div className="mt-10">
        <h2 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
          📋 .env.local Template — Copy this into your file
        </h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 relative">
          <button
            onClick={() => copyToClipboard(ENV_TEMPLATE, 'env_template')}
            className="absolute top-3 right-3 text-gray-500 hover:text-white transition flex items-center gap-1 text-xs"
          >
            {copiedKey === 'env_template' ? <CheckCheck size={13} className="text-green-400" /> : <Copy size={13} />}
            Copy
          </button>
          <pre className="text-xs text-gray-400 font-mono whitespace-pre overflow-x-auto leading-6">
            {ENV_TEMPLATE}
          </pre>
        </div>
      </div>

      <p className="text-gray-700 text-xs mt-6 text-center">
        🔒 This page is for your eyes only. Never share your API keys or commit .env.local to GitHub.
      </p>
    </div>
  )
}

const ENV_TEMPLATE = `# KITA BUILDER SYSTEMS — .env.local
# ─────────────────────────────────────────────
# MVP (fill these first)
# ─────────────────────────────────────────────

# Supabase (Settings > API in your Supabase project)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OpenAI (platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-...

# Resend (resend.com/api-keys)
RESEND_API_KEY=re_...

# Your email for booking notifications
NOTIFICATION_EMAIL=denny.itdwebdev@gmail.com

# Admin Panel PIN (change this!)
NEXT_PUBLIC_ADMIN_PIN=kita2024

# ─────────────────────────────────────────────
# V2 — Add when you have paying clients
# ─────────────────────────────────────────────

# Twilio (SMS)
# TWILIO_ACCOUNT_SID=AC...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=+1...

# Stripe (Payments)
# STRIPE_SECRET_KEY=sk_live_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Claude (Alternative AI)
# CLAUDE_API_KEY=sk-ant-api03-...

# Cloudinary (Image uploads)
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...`
