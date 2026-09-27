'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { buildGoogleCalendarLink, buildICSContent } from '@/lib/booking-utils'
import { CheckCircle, Calendar, Clock, User, Phone, Wrench, ExternalLink, Download, X, RefreshCw, Loader2, MapPin } from 'lucide-react'

function BookingConfirmationContent() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [booking, setBooking] = useState<any>(null)
  const [site, setSite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadBooking() }, [id])

  async function loadBooking() {
    setLoading(true)
    try {
      const { data: b } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single()

      if (!b) { setError('Booking not found.'); setLoading(false); return }
      setBooking(b)

      const { data: s } = await supabase
        .from('sites')
        .select('business_name, theme_json, currency')
        .eq('id', b.site_id)
        .single()
      setSite(s)
    } catch { setError('Could not load booking.') }
    finally { setLoading(false) }
  }

  function downloadICS() {
    if (!booking || !site) return
    const ics = buildICSContent({
      title: `${booking.service_name} at ${site.business_name}`,
      date: booking.booking_date,
      time: booking.booking_time,
      durationMinutes: 60,
      description: `Booking at ${site.business_name}${booking.staff_name ? ` with ${booking.staff_name}` : ''}`,
    })
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booking-${booking.booking_date}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 size={24} className="animate-spin text-gray-400" />
    </div>
  )

  if (error || !booking) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5 text-center">
      <div>
        <p className="text-gray-500 mb-3">{error || 'Booking not found.'}</p>
        <Link href="/" className="text-blue-600 text-sm hover:underline">Go home</Link>
      </div>
    </div>
  )

  const primary = site?.theme_json?.theme?.primary || '#1A1A2E'
  const googleCalLink = buildGoogleCalendarLink({
    title: `${booking.service_name} at ${site?.business_name}`,
    date: booking.booking_date,
    time: booking.booking_time,
    durationMinutes: 60,
    description: `Booking at ${site?.business_name}${booking.staff_name ? ` with ${booking.staff_name}` : ''}`,
  })

  const baseUrl = window.location.origin
  const cancelUrl = `${baseUrl}/booking/${id}/cancel?token=${booking.cancel_token}`
  const rescheduleUrl = `${baseUrl}/booking/${id}/reschedule?token=${booking.cancel_token}`

  const statusConfig = {
    confirmed: { color: 'text-green-600 bg-green-50', icon: CheckCircle, label: 'Confirmed' },
    pending:   { color: 'text-yellow-600 bg-yellow-50', icon: Clock, label: 'Pending Confirmation' },
    cancelled: { color: 'text-red-600 bg-red-50', icon: X, label: 'Cancelled' },
  }
  const statusInfo = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.pending
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 bg-white">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-900 text-sm">{site?.business_name}</span>
          <a href={`/${site?.theme_json?.sections?.[0]?.data?.headline ? '#' : ''}`}
            className="text-xs text-gray-500 hover:text-gray-700">← Back to site</a>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Status badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6 ${statusInfo.color}`}>
          <StatusIcon size={16} />
          {statusInfo.label}
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-1">
          {booking.status === 'cancelled' ? 'Booking Cancelled' : 'Your Booking'}
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          {booking.status === 'confirmed' && "We'll see you soon!"}
          {booking.status === 'pending' && "We'll confirm your booking shortly."}
          {booking.status === 'cancelled' && "This booking has been cancelled."}
        </p>

        {/* Booking details card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Wrench size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Service</p>
                <p className="text-gray-900 font-semibold">{booking.service_name}</p>
              </div>
            </div>
            {booking.staff_name && (
              <div className="flex items-center gap-3 text-sm">
                <User size={15} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Staff</p>
                  <p className="text-gray-900 font-semibold">{booking.staff_name}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Date & Time</p>
                <p className="text-gray-900 font-semibold">
                  {new Date(booking.booking_date + 'T12:00:00').toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  {' at '}{booking.booking_time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Name</p>
                <p className="text-gray-900 font-semibold">{booking.customer_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={15} className="text-gray-400 shrink-0" />
              <div>
                <p className="text-gray-500 text-xs">Phone</p>
                <p className="text-gray-900 font-semibold">{booking.customer_phone}</p>
              </div>
            </div>
            {booking.car_model && (
              <div className="flex items-center gap-3 text-sm">
                <Wrench size={15} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Vehicle</p>
                  <p className="text-gray-900 font-semibold">{booking.car_model}</p>
                </div>
              </div>
            )}
            {booking.pet_name && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-lg">🐾</span>
                <div>
                  <p className="text-gray-500 text-xs">Pet</p>
                  <p className="text-gray-900 font-semibold">{booking.pet_name}</p>
                </div>
              </div>
            )}
            {booking.notes && (
              <div className="pt-2 border-t border-gray-100 text-sm text-gray-600 italic">
                "{booking.notes}"
              </div>
            )}
          </div>
        </div>

        {/* Add to Calendar — only for confirmed/pending */}
        {booking.status !== 'cancelled' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-3">📅 Add to Calendar</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={googleCalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
              >
                <ExternalLink size={14} />
                Google Calendar
              </a>
              <button
                onClick={downloadICS}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition"
              >
                <Download size={14} />
                Apple Calendar (.ics)
              </button>
            </div>
          </div>
        )}

        {/* Manage booking — cancel/reschedule */}
        {booking.status === 'confirmed' && booking.cancel_token && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="font-semibold text-gray-900 text-sm mb-3">Manage Booking</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={rescheduleUrl}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl transition"
              >
                <RefreshCw size={14} />
                Reschedule
              </a>
              <a
                href={cancelUrl}
                className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-4 py-2.5 rounded-xl transition"
              >
                <X size={14} />
                Cancel Booking
              </a>
            </div>
            <p className="text-gray-400 text-xs mt-3">Need to make changes? Use the links above — no need to call.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 size={24} className="animate-spin text-gray-400" /></div>}>
      <BookingConfirmationContent />
    </Suspense>
  )
}
