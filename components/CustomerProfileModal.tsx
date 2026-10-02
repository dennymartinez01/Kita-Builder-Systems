'use client'

import { useState, useEffect } from 'react'
import {
  X, User, Mail, Phone, Calendar, TrendingUp,
  Clock, Tag, MessageSquare, Save, Loader2, CheckCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { SiteCustomerSafe } from '@/types/database'

interface Booking {
  id: string
  service_name: string
  booking_date: string
  booking_time: string
  status: string
  staff_name: string | null
}

interface Props {
  customer: SiteCustomerSafe
  siteId: string
  primaryColor?: string
  onClose: () => void
  onNotesUpdate?: (id: string, notes: string) => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatTime12(t: string) {
  const [h, m] = t.split(':').map(Number)
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`
}

const TODAY = new Date().toISOString().split('T')[0]

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function CustomerProfileModal({
  customer,
  siteId,
  primaryColor = '#2563eb',
  onClose,
  onNotesUpdate,
}: Props) {
  const [bookings, setBookings]   = useState<Booking[]>([])
  const [loading, setLoading]     = useState(true)
  const [notes, setNotes]         = useState(customer.notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved]   = useState(false)

  useEffect(() => {
    loadBookings()
  }, [customer.id]) // eslint-disable-line

  async function loadBookings() {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('id, service_name, booking_date, booking_time, status, staff_name')
      .eq('site_id', siteId)
      .eq('customer_email', customer.email)
      .order('booking_date', { ascending: false })
      .limit(20)
    setBookings((data || []) as Booking[])
    setLoading(false)
  }

  async function saveNotes() {
    setSavingNotes(true)
    await supabase
      .from('site_customers')
      .update({ notes, updated_at: new Date().toISOString() } as any)
      .eq('id', customer.id)
    setSavingNotes(false)
    setNotesSaved(true)
    onNotesUpdate?.(customer.id, notes)
    setTimeout(() => setNotesSaved(false), 2000)
  }

  // Derived stats
  const upcoming   = bookings.filter(b => b.booking_date >= TODAY && b.status !== 'cancelled')
  const past       = bookings.filter(b => b.booking_date <  TODAY || b.status === 'cancelled')
  const lastVisit  = past.find(b => b.status === 'confirmed')
  const nextVisit  = upcoming[0]
  const topService = (() => {
    const counts: Record<string, number> = {}
    bookings.forEach(b => { if (b.status !== 'cancelled') counts[b.service_name] = (counts[b.service_name] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  })()

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0"
              style={{ backgroundColor: primaryColor }}>
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-gray-900 font-bold text-base">{customer.name}</h2>
              <p className="text-gray-500 text-xs">{customer.email}</p>
              {customer.phone && <p className="text-gray-400 text-xs">{customer.phone}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1 mt-1">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Visits',  value: customer.booking_count, color: 'text-blue-600',   bg: 'bg-blue-50' },
              { label: 'Total Spend',   value: `$${Number(customer.total_spend).toFixed(0)}`, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Loyal Since',   value: formatDate(customer.created_at).replace(/\d{4}$/, '\'$&'.slice(-3)), color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 text-center ${s.bg}`}>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs font-medium opacity-60 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Key facts */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            {[
              {
                icon: Clock,
                label: 'Last visit',
                value: lastVisit
                  ? `${formatDate(lastVisit.booking_date)} — ${lastVisit.service_name}`
                  : 'No visits yet',
              },
              {
                icon: Calendar,
                label: 'Next booking',
                value: nextVisit
                  ? `${formatDate(nextVisit.booking_date)} at ${formatTime12(nextVisit.booking_time)} — ${nextVisit.service_name}`
                  : 'No upcoming bookings',
                highlight: !!nextVisit,
              },
              {
                icon: Tag,
                label: 'Favourite service',
                value: topService || '—',
              },
              {
                icon: Mail,
                label: 'Contact',
                value: customer.email,
              },
            ].map(row => {
              const Icon = row.icon
              return (
                <div key={row.label} className="flex items-start gap-2.5">
                  <Icon size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-xs">{row.label}</p>
                    <p className={`text-sm ${(row as any).highlight ? 'text-blue-600 font-semibold' : 'text-gray-800'}`}>
                      {row.value}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Booking history */}
          <div>
            <h3 className="text-gray-700 font-semibold text-sm mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-gray-400" />
              Booking History
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-6 text-gray-400 gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading...
              </div>
            ) : bookings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No bookings found.</p>
            ) : (
              <div className="space-y-2">
                {bookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-gray-800 text-sm font-medium">{b.service_name}</p>
                      <p className="text-gray-400 text-xs">
                        {formatDate(b.booking_date)} · {formatTime12(b.booking_time)}
                        {b.staff_name ? ` · ${b.staff_name}` : ''}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-500'}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
                {bookings.length === 20 && (
                  <p className="text-gray-400 text-xs text-center pt-1">Showing last 20 bookings</p>
                )}
              </div>
            )}
          </div>

          {/* Internal notes */}
          <div>
            <h3 className="text-gray-700 font-semibold text-sm mb-2 flex items-center gap-2">
              <MessageSquare size={14} className="text-gray-400" />
              Internal Notes
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Add private notes about this customer — preferences, allergies, special requests..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 resize-none placeholder-gray-300"
            />
            <div className="flex items-center justify-between mt-1.5">
              {notesSaved && (
                <span className="text-green-600 text-xs flex items-center gap-1">
                  <CheckCircle size={12} /> Saved
                </span>
              )}
              <button
                onClick={saveNotes}
                disabled={savingNotes || notes === (customer.notes || '')}
                className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition disabled:opacity-40"
                style={{ backgroundColor: primaryColor }}
              >
                {savingNotes ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 pb-2">
            <a
              href={`mailto:${customer.email}`}
              className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              <Mail size={13} /> Email
            </a>
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <Phone size={13} /> Call
              </a>
            )}
            {customer.phone && (
              <a
                href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-medium text-white transition"
                style={{ backgroundColor: '#25D366' }}
              >
                💬 WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
