'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { XCircle, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

function CancelContent() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'confirm' | 'done' | 'error'>('loading')
  const [booking, setBooking] = useState<any>(null)
  const [site, setSite] = useState<any>(null)

  useEffect(() => { loadBooking() }, [id, token])

  async function loadBooking() {
    const { data: b } = await supabase.from('bookings').select('*').eq('id', id).single()
    if (!b || b.cancel_token !== token) { setStatus('error'); return }
    if (b.status === 'cancelled') { setBooking(b); setStatus('done'); return }
    setBooking(b)
    const { data: s } = await supabase.from('sites').select('business_name').eq('id', b.site_id).single()
    setSite(s)
    setStatus('confirm')
  }

  async function confirmCancel() {
    setStatus('loading')
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id).eq('cancel_token', token)
    setStatus('done')
  }

  if (status === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5 text-center">
      <div>
        <XCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-gray-700 font-semibold mb-1">Invalid or expired link</p>
        <p className="text-gray-500 text-sm">This cancellation link is not valid.</p>
      </div>
    </div>
  )

  if (status === 'done') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5 text-center">
      <div>
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Booking Cancelled</h1>
        <p className="text-gray-500 text-sm mb-6">Your booking has been cancelled successfully.</p>
        <Link href="/" className="text-blue-600 text-sm hover:underline">Go home</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full text-center shadow-lg">
        <XCircle size={40} className="text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Cancel Booking?</h1>
        <p className="text-gray-500 text-sm mb-2">
          <strong>{booking?.service_name}</strong> at <strong>{site?.business_name}</strong>
        </p>
        <p className="text-gray-400 text-sm mb-6">
          {booking?.booking_date} at {booking?.booking_time}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/booking/${id}?token=${token}`}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm transition text-center"
          >
            Keep Booking
          </Link>
          <button
            onClick={confirmCancel}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CancelPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
      <CancelContent />
    </Suspense>
  )
}
