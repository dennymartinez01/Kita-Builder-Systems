'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { RefreshCw, CheckCircle, Loader2, Calendar, Clock } from 'lucide-react'
import Link from 'next/link'

function RescheduleContent() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'form' | 'done' | 'error'>('loading')
  const [booking, setBooking] = useState<any>(null)
  const [site, setSite] = useState<any>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => { loadBooking() }, [id, token])

  async function loadBooking() {
    const { data: b } = await supabase.from('bookings').select('*').eq('id', id).single()
    if (!b || b.cancel_token !== token) { setStatus('error'); return }
    if (b.status === 'cancelled') { setStatus('error'); return }
    setBooking(b)
    setNewDate(b.booking_date)
    setNewTime(b.booking_time)
    const { data: s } = await supabase.from('sites').select('business_name').eq('id', b.site_id).single()
    setSite(s)
    setStatus('form')
  }

  async function confirmReschedule(e: React.FormEvent) {
    e.preventDefault()
    if (!newDate || !newTime) return
    setSaving(true)
    setErrorMsg('')

    const { error } = await supabase
      .from('bookings')
      .update({
        booking_date: newDate,
        booking_time: newTime,
        rescheduled_from: id,
        status: 'confirmed',
      } as any)
      .eq('id', id)
      .eq('cancel_token', token)

    if (error) { setErrorMsg('Failed to reschedule. Please try again.'); setSaving(false); return }
    setStatus('done')
    setSaving(false)
  }

  if (status === 'loading') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  )

  if (status === 'error') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5 text-center">
      <div>
        <p className="text-gray-700 font-semibold mb-1">Invalid or expired link</p>
        <p className="text-gray-500 text-sm">This reschedule link is not valid.</p>
      </div>
    </div>
  )

  if (status === 'done') return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5 text-center">
      <div>
        <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Booking Rescheduled!</h1>
        <p className="text-gray-500 text-sm mb-2">
          <strong>{booking?.service_name}</strong> is now booked for:
        </p>
        <p className="text-gray-700 font-semibold mb-6">{newDate} at {newTime}</p>
        <Link href={`/booking/${id}?token=${token}`} className="text-blue-600 text-sm hover:underline">
          View updated booking →
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full shadow-lg">
        <RefreshCw size={32} className="text-blue-600 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">Reschedule Booking</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          <strong>{booking?.service_name}</strong> at {site?.business_name}
        </p>

        <form onSubmit={confirmReschedule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="date"
                value={newDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setNewDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
            <div className="relative">
              <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="time"
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {saving ? 'Saving...' : 'Confirm Reschedule'}
          </button>
          <Link href={`/booking/${id}?token=${token}`} className="block text-center text-sm text-gray-500 hover:text-gray-700">
            Keep original time
          </Link>
        </form>
      </div>
    </div>
  )
}

export default function ReschedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
      <RescheduleContent />
    </Suspense>
  )
}
