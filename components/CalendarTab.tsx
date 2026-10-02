'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Loader2, X, Clock, User, Phone, Mail, Scissors } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Booking } from '@/types/database'

// ── Constants ─────────────────────────────────────────────────
const HOUR_START = 7   // 7 AM — first visible row
const HOUR_END   = 21  // 9 PM — last visible row
const HOURS      = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAYS_FULL  = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// ── Helpers ───────────────────────────────────────────────────
function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day  // Sunday = 0 → back 6 days
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const ampm = h >= 12 ? 'pm' : 'am'
  const h12  = h % 12 || 12
  return `${h12}:${String(m).padStart(2, '0')}${ampm}`
}

// ── Status colours ────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  confirmed: { bg: '#dcfce7', border: '#16a34a', text: '#15803d' },
  pending:   { bg: '#fef9c3', border: '#ca8a04', text: '#a16207' },
  cancelled: { bg: '#fee2e2', border: '#dc2626', text: '#b91c1c' },
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
  siteId: string
  primaryColor?: string
  siteTimezone?: string
}

// ── Component ─────────────────────────────────────────────────
export default function CalendarTab({ siteId, primaryColor = '#2563eb', siteTimezone = 'UTC' }: Props) {
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()))
  const [bookings, setBookings]   = useState<Booking[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<Booking | null>(null)

  // Days of the current week
  const weekDays = DAYS_SHORT.map((_, i) => addDays(weekStart, i))
  const weekEnd  = addDays(weekStart, 6)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('site_id', siteId)
      .gte('booking_date', isoDate(weekStart))
      .lte('booking_date', isoDate(weekEnd))
      .in('status', ['confirmed', 'pending'])
      .order('booking_time')
    setBookings((data as Booking[]) || [])
    setLoading(false)
  }, [siteId, weekStart])  // eslint-disable-line

  useEffect(() => { load() }, [load])

  // Group bookings by date
  const byDate: Record<string, Booking[]> = {}
  bookings.forEach(b => {
    if (!byDate[b.booking_date]) byDate[b.booking_date] = []
    byDate[b.booking_date].push(b)
  })

  // Is the current week the one that contains today?
  const isCurrentWeek = isoDate(getMonday(new Date())) === isoDate(weekStart)
  const todayStr = isoDate(new Date())

  // Week range label
  const weekLabel = weekStart.getMonth() === weekEnd.getMonth()
    ? `${weekStart.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}`
    : `${weekStart.toLocaleDateString('en-AU', { month: 'short' })} – ${weekEnd.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })}`

  // Booking count for this week
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const pendingCount   = bookings.filter(b => b.status === 'pending').length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-gray-900 font-bold text-lg flex items-center gap-2">
            <Calendar size={18} /> Weekly Calendar
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {weekLabel} · {confirmedCount} confirmed{pendingCount > 0 ? `, ${pendingCount} pending` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentWeek && (
            <button
              onClick={() => setWeekStart(getMonday(new Date()))}
              className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
            >
              Today
            </button>
          )}
          <div className="flex">
            <button
              onClick={() => setWeekStart(d => addDays(d, -7))}
              className="p-2 border border-gray-200 rounded-l-lg hover:bg-gray-50 transition text-gray-600"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setWeekStart(d => addDays(d, 7))}
              className="p-2 border border-gray-200 border-l-0 rounded-r-lg hover:bg-gray-50 transition text-gray-600"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        {Object.entries(STATUS_STYLES).map(([status, s]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: s.bg, border: `1.5px solid ${s.border}` }} />
            <span className="text-gray-500 capitalize">{status}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Day headers */}
        <div className="grid border-b border-gray-200" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
          <div className="px-2 py-2.5 border-r border-gray-100" /> {/* time gutter */}
          {weekDays.map((day, i) => {
            const isToday = isoDate(day) === todayStr
            return (
              <div
                key={i}
                className={`px-1 py-2.5 text-center border-r border-gray-100 last:border-r-0 ${isToday ? 'bg-blue-50' : ''}`}
              >
                <p className={`text-xs font-medium ${isToday ? 'text-blue-700' : 'text-gray-500'}`}>{DAYS_SHORT[i]}</p>
                <p className={`text-sm font-bold mt-0.5 ${isToday ? 'text-blue-700' : 'text-gray-900'}`}>
                  {day.getDate()}
                </p>
                {/* Booking count dot */}
                {byDate[isoDate(day)]?.length > 0 && (
                  <div className="flex justify-center mt-1 gap-0.5">
                    {byDate[isoDate(day)].slice(0, 3).map((_, j) => (
                      <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                    ))}
                    {byDate[isoDate(day)].length > 3 && (
                      <span className="text-gray-400 text-[9px] leading-none">+{byDate[isoDate(day)].length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Time grid + booking blocks */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
            <Loader2 size={16} className="animate-spin" /> Loading calendar...
          </div>
        ) : (
          <div className="overflow-y-auto" style={{ maxHeight: '520px' }}>
            <div className="relative" style={{ gridTemplateColumns: '52px repeat(7, 1fr)' }}>
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="grid border-b border-gray-100 last:border-0"
                  style={{ gridTemplateColumns: '52px repeat(7, 1fr)', minHeight: '48px' }}
                >
                  {/* Hour label */}
                  <div className="px-2 py-1 text-right border-r border-gray-100 sticky left-0 bg-white">
                    <span className="text-[10px] text-gray-400 leading-none">
                      {hour % 12 || 12}{hour < 12 ? 'am' : 'pm'}
                    </span>
                  </div>

                  {/* Day columns */}
                  {weekDays.map((day, di) => {
                    const dateStr    = isoDate(day)
                    const isToday    = dateStr === todayStr
                    const dayBookings = (byDate[dateStr] || []).filter(b => {
                      const bHour = parseInt(b.booking_time.split(':')[0])
                      return bHour === hour
                    })

                    return (
                      <div
                        key={di}
                        className={`relative border-r border-gray-100 last:border-r-0 px-0.5 py-0.5 ${isToday ? 'bg-blue-50/30' : ''}`}
                        style={{ minHeight: '48px' }}
                      >
                        {dayBookings.map(b => {
                          const style = STATUS_STYLES[b.status] || STATUS_STYLES.confirmed
                          return (
                            <button
                              key={b.id}
                              onClick={() => setSelected(selected?.id === b.id ? null : b)}
                              className="w-full text-left rounded-md px-1.5 py-1 mb-0.5 transition hover:opacity-80 active:scale-95"
                              style={{
                                backgroundColor: style.bg,
                                border: `1.5px solid ${style.border}`,
                              }}
                            >
                              <p className="text-xs font-semibold truncate leading-tight" style={{ color: style.text }}>
                                {formatTime12(b.booking_time)} {b.customer_name.split(' ')[0]}
                              </p>
                              <p className="text-xs truncate opacity-70" style={{ color: style.text }}>
                                {b.service_name}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booking detail popover */}
      {selected && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize`}
                  style={{ backgroundColor: STATUS_STYLES[selected.status]?.bg, color: STATUS_STYLES[selected.status]?.text }}>
                  {selected.status}
                </span>
                <span className="text-gray-400 text-xs">{selected.booking_date} · {formatTime12(selected.booking_time)}</span>
              </div>
              <h3 className="text-gray-900 font-bold text-base">{selected.customer_name}</h3>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 transition p-1">
              <X size={16} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              { icon: Scissors, label: 'Service', value: selected.service_name },
              { icon: Clock,    label: 'Time',    value: `${selected.booking_date} at ${formatTime12(selected.booking_time)}` },
              { icon: User,     label: 'Staff',   value: selected.staff_name || 'No preference' },
              { icon: Phone,    label: 'Phone',   value: selected.customer_phone },
              { icon: Mail,     label: 'Email',   value: selected.customer_email || '—' },
            ].map(row => {
              const Icon = row.icon
              return (
                <div key={row.label} className="flex items-start gap-2">
                  <Icon size={14} className="text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-400 text-xs">{row.label}</p>
                    <p className="text-gray-800 text-sm font-medium">{row.value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {selected.notes && (
            <div className="mt-3 bg-gray-50 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">Notes</p>
              <p className="text-gray-700 text-sm">{selected.notes}</p>
            </div>
          )}

          {/* Cancel / Confirm quick actions */}
          {selected.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={async () => {
                  await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', selected.id)
                  setBookings(prev => prev.map(b => b.id === selected.id ? { ...b, status: 'confirmed' } : b))
                  setSelected(prev => prev ? { ...prev, status: 'confirmed' } : null)
                }}
                className="flex-1 text-xs font-bold py-2.5 rounded-xl text-white transition"
                style={{ backgroundColor: primaryColor }}
              >
                ✓ Confirm
              </button>
              <button
                onClick={async () => {
                  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', selected.id)
                  setBookings(prev => prev.filter(b => b.id !== selected.id))
                  setSelected(null)
                }}
                className="flex-1 text-xs font-bold py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 transition hover:bg-red-100"
              >
                ✗ Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && bookings.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No bookings this week.
        </div>
      )}
    </div>
  )
}
