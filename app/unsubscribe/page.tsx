'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, AlertCircle, Mail } from 'lucide-react'

type State = 'loading' | 'confirming' | 'done' | 'already' | 'error' | 'no-email'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email        = searchParams.get('email') || ''
  const [state, setState] = useState<State>(email ? 'loading' : 'no-email')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!email) return
    // Check if already suppressed
    fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => setState(d.suppressed ? 'already' : 'confirming'))
      .catch(() => setState('confirming'))
  }, [email])

  async function handleUnsubscribe() {
    setState('loading')
    try {
      const res = await fetch('/api/unsubscribe', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, source: 'email_link' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setState('done')
    } catch (err: any) {
      setError(err.message)
      setState('error')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">K</span>
          </div>
          <span className="font-bold text-gray-900">KITA Systems</span>
        </div>

        {state === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-blue-500 animate-spin" />
            <p className="text-gray-500 text-sm">Checking subscription status...</p>
          </div>
        )}

        {state === 'no-email' && (
          <div>
            <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid unsubscribe link</h1>
            <p className="text-gray-500 text-sm mb-6">
              This link is missing an email address. Please use the unsubscribe link from the original email.
            </p>
            <Link href="/" className="text-blue-600 text-sm hover:underline">← Go home</Link>
          </div>
        )}

        {state === 'confirming' && (
          <div>
            <Mail size={48} className="text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Unsubscribe from promotions</h1>
            <p className="text-gray-500 text-sm mb-2">
              You are about to unsubscribe <strong className="text-gray-700">{email}</strong> from all promotional emails sent via the KITA network.
            </p>
            <p className="text-gray-400 text-xs mb-6">
              You will still receive transactional emails (booking confirmations, cancellations) if you have made bookings.
            </p>
            <button
              onClick={handleUnsubscribe}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl text-sm transition mb-3"
            >
              Yes, unsubscribe me
            </button>
            <Link href="/" className="block text-gray-400 text-sm hover:text-gray-600 transition">
              No, keep me subscribed
            </Link>
          </div>
        )}

        {state === 'done' && (
          <div>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">You have been unsubscribed</h1>
            <p className="text-gray-500 text-sm mb-2">
              <strong className="text-gray-700">{email}</strong> has been removed from our promotions list.
            </p>
            <p className="text-gray-400 text-xs mb-6">
              This change is permanent. You will not receive any further promotional emails from the KITA network.
            </p>
            <Link href="/" className="text-blue-600 text-sm hover:underline">← Go home</Link>
          </div>
        )}

        {state === 'already' && (
          <div>
            <CheckCircle size={48} className="text-gray-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Already unsubscribed</h1>
            <p className="text-gray-500 text-sm mb-6">
              <strong className="text-gray-700">{email}</strong> is already on our suppression list. You will not receive any promotional emails.
            </p>
            <Link href="/" className="text-blue-600 text-sm hover:underline">← Go home</Link>
          </div>
        )}

        {state === 'error' && (
          <div>
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-2">{error}</p>
            <p className="text-gray-400 text-xs mb-6">
              Please try again or contact us directly to be removed from our list.
            </p>
            <button onClick={handleUnsubscribe} className="text-blue-600 text-sm hover:underline">Try again</button>
          </div>
        )}

        <p className="text-gray-300 text-xs mt-8">Powered by KITA Builder Systems</p>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="text-blue-400 animate-spin" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
