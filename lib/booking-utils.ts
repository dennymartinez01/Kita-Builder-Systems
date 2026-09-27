// ─── BOOKING UTILITIES ───────────────────────────────────────────
// Shared logic for availability checks, calendar links, cancel tokens

import { createClient } from '@supabase/supabase-js'

// ─── AVAILABILITY ────────────────────────────────────────────────

export interface TimeSlot {
  time: string   // e.g. "09:00"
  available: boolean
  reason?: string
}

export interface AvailabilityResult {
  available: boolean
  reason?: string  // "Already booked" | "Blocked by owner" | "Outside hours"
}

// Check if a specific date+time is available for a site
export async function checkSlotAvailability(
  siteId: string,
  date: string,
  time: string,
  serviceDuration: number = 60,
): Promise<AvailabilityResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check existing confirmed bookings for that date
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('booking_time, service_name')
    .eq('site_id', siteId)
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed'])

  if (existingBookings) {
    const requestedMinutes = timeToMinutes(time)
    for (const booking of existingBookings) {
      const bookedMinutes = timeToMinutes(booking.booking_time)
      // Check for overlap — simple buffer of serviceDuration minutes
      if (Math.abs(requestedMinutes - bookedMinutes) < serviceDuration) {
        return {
          available: false,
          reason: `This time is already booked (${booking.booking_time})`,
        }
      }
    }
  }

  // Check blocked dates
  const { data: blocked } = await supabase
    .from('blocked_dates')
    .select('*')
    .eq('site_id', siteId)
    .eq('date', date)

  if (blocked && blocked.length > 0) {
    for (const block of blocked) {
      if (!block.start_time) {
        // Full day block
        return { available: false, reason: block.reason || 'Owner unavailable this day' }
      }
      const requestedMins = timeToMinutes(time)
      const startMins = timeToMinutes(block.start_time)
      const endMins = timeToMinutes(block.end_time || '23:59')
      if (requestedMins >= startMins && requestedMins < endMins) {
        return { available: false, reason: block.reason || 'Owner unavailable at this time' }
      }
    }
  }

  return { available: true }
}

// Get next available slot starting from today
export async function getNextAvailableSlot(
  siteId: string,
  serviceDuration: number = 60,
): Promise<{ date: string; time: string } | null> {
  const HOURS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00']

  const today = new Date()

  for (let dayOffset = 0; dayOffset <= 14; dayOffset++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() + dayOffset)
    const dateStr = checkDate.toISOString().split('T')[0]

    // Skip Sundays (0) — can be made configurable later
    if (checkDate.getDay() === 0) continue

    for (const time of HOURS) {
      // Skip past times for today
      if (dayOffset === 0) {
        const now = today.getHours() * 60 + today.getMinutes()
        if (timeToMinutes(time) <= now + 30) continue
      }

      const result = await checkSlotAvailability(siteId, dateStr, time, serviceDuration)
      if (result.available) return { date: dateStr, time }
    }
  }
  return null
}

// ─── CALENDAR LINKS ──────────────────────────────────────────────

export interface CalendarEventParams {
  title: string
  date: string       // YYYY-MM-DD
  time: string       // HH:MM
  durationMinutes: number
  location?: string
  description?: string
}

export function buildGoogleCalendarLink(params: CalendarEventParams): string {
  const start = dateTimeToCalendarFormat(params.date, params.time)
  const endDate = new Date(`${params.date}T${params.time}:00`)
  endDate.setMinutes(endDate.getMinutes() + params.durationMinutes)
  const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const url = new URL('https://calendar.google.com/calendar/render')
  url.searchParams.set('action', 'TEMPLATE')
  url.searchParams.set('text', params.title)
  url.searchParams.set('dates', `${start}/${end}`)
  if (params.location) url.searchParams.set('location', params.location)
  if (params.description) url.searchParams.set('details', params.description)

  return url.toString()
}

export function buildICSContent(params: CalendarEventParams): string {
  const start = dateTimeToCalendarFormat(params.date, params.time)
  const endDate = new Date(`${params.date}T${params.time}:00`)
  endDate.setMinutes(endDate.getMinutes() + params.durationMinutes)
  const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KITA Systems//Booking//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `DTSTAMP:${now}`,
    `SUMMARY:${params.title}`,
    params.location ? `LOCATION:${params.location}` : '',
    params.description ? `DESCRIPTION:${params.description}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')
}

// ─── CANCEL TOKEN ────────────────────────────────────────────────

export function generateCancelToken(): string {
  // URL-safe random token
  const array = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < array.length; i++) array[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── HELPERS ─────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function dateTimeToCalendarFormat(date: string, time: string): string {
  return `${date.replace(/-/g, '')}T${time.replace(':', '')}00Z`
}

// ─── LOCALSTORAGE AUTO-FILL ──────────────────────────────────────

const LS_KEY = 'kita_booking_details'

export interface SavedBookingDetails {
  customer_name: string
  customer_phone: string
  customer_email: string
}

export function getSavedBookingDetails(): SavedBookingDetails | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveBookingDetails(details: SavedBookingDetails): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(LS_KEY, JSON.stringify(details)) } catch { /* silent */ }
}
