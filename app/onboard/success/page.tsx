'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CheckCircle, Loader2, ExternalLink, LayoutDashboard, Zap } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState<'waiting' | 'ready' | 'error'>('waiting')
  const [slug, setSlug] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!sessionId) { setStatus('error'); return }
    // Poll Supabase until the site appears (webhook triggers generation)
    pollForSite()
  }, [sessionId])

  async function pollForSite() {
    // Try for up to 60 seconds (12 attempts × 5s)
    for (let i = 0; i < 12; i++) {
      setAttempts(i + 1)
      await new Promise(r => setTimeout(r, 5000))

      const { data } = await supabase
        .from('sites')
        .select('slug, business_name')
        .eq('stripe_session_id', sessionId)
        .single()

      if (data) {
        setSlug(data.slug)
        setBusinessName(data.business_name)
        setStatus('ready')
        return
      }
    }
    // Timed out — show error
    setStatus('error')
  }

  if (status === 'waiting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Zap size={28} className="text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Payment confirmed!</h1>
          <p className="text-gray-500 text-sm mb-6">
            AI is building your website right now. This takes about 10 seconds...
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
            <Loader2 size={14} className="animate-spin" />
            Checking... (attempt {attempts}/12)
          </div>
          <div className="mt-6 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((attempts / 12) * 100, 90)}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-yellow-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Zap size={28} className="text-yellow-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Payment received!</h1>
          <p className="text-gray-500 text-sm mb-4">
            Your site is being generated. It may take a moment to appear — check back in 30 seconds or contact us on WhatsApp.
          </p>
          <p className="text-gray-400 text-xs mb-6">Session ID: <span className="font-mono">{sessionId}</span></p>
          <Link
            href="/"
            className="inline-block bg-gray-900 text-white font-bold px-6 py-3 rounded-xl text-sm transition hover:bg-gray-800"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  // status === 'ready'
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="text-center max-w-md w-full">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-2xl mx-auto mb-5 flex items-center justify-center">
          <CheckCircle size={40} className="text-green-500" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          Your site is live! 🎉
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          <strong className="text-gray-900">{businessName}</strong> is now live with a booking form, staff profiles, and AI editing. We emailed you the details.
        </p>

        {/* Links */}
        <div className="space-y-3 mb-8">
          <a
            href={`/${slug}`}
            target="_blank"
            className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-4 rounded-xl transition group"
          >
            <span>View Your Live Site</span>
            <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href={`/${slug}/dashboard`}
            target="_blank"
            className="flex items-center justify-between bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-4 rounded-xl transition group"
          >
            <span>Open Owner Dashboard</span>
            <LayoutDashboard size={16} />
          </a>
        </div>

        {/* Next steps */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm">
          <p className="font-semibold text-gray-900 text-sm mb-3">Your next steps:</p>
          <div className="space-y-2.5 text-xs text-gray-500">
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">1.</span>
              <span>Log into your dashboard with PIN <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">1234</span> — change it in settings</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">2.</span>
              <span>Review and update your services and prices in the dashboard</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">3.</span>
              <span>Share your site link on Instagram, Facebook, and Google Maps</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-bold mt-0.5">4.</span>
              <span>Try the AI Assistant — type "change my haircut to $75" to see it live</span>
            </div>
          </div>
        </div>

        <p className="text-gray-400 text-xs mt-6">
          Need help? Message us on WhatsApp anytime.
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
      <SuccessContent />
    </Suspense>
  )
}
