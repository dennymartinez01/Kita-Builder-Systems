// ─── TIMEZONE SUPPORT ────────────────────────────────────────────
// All booking times are stored as plain date + time strings.
// The site's timezone is stored on the sites table and used
// for display and availability calculations.
//
// WHY THIS MATTERS:
// A booking at "10:00" means completely different UTC times in
// Manila (UTC+8), Sydney (UTC+11), Los Angeles (UTC-8).
// Without storing the site timezone, bookings appear at wrong
// times when owner and customer are in different zones.
//
// ARCHITECTURE DECISION:
// We store booking_date (YYYY-MM-DD) + booking_time (HH:MM) as
// plain strings — not UTC timestamps. This is intentional:
// - Service businesses think in local time ("10am Monday")
// - No DST conversion bugs on display
// - The site.timezone field provides the context for when
//   cross-timezone calculations are needed (e.g. calendar exports)

export interface TimezoneOption {
  value: string    // IANA timezone e.g. "Australia/Sydney"
  label: string    // Display name e.g. "Sydney (AEST/AEDT)"
  region: string   // Group e.g. "Australia"
  offset: string   // e.g. "+10:00"
}

export const TIMEZONES: TimezoneOption[] = [
  // Australia
  { value: 'Australia/Sydney',    label: 'Sydney / Melbourne (AEST/AEDT)',   region: 'Australia',     offset: '+10/+11' },
  { value: 'Australia/Brisbane',  label: 'Brisbane (AEST, no DST)',           region: 'Australia',     offset: '+10' },
  { value: 'Australia/Perth',     label: 'Perth (AWST)',                       region: 'Australia',     offset: '+08' },
  { value: 'Australia/Adelaide',  label: 'Adelaide (ACST/ACDT)',              region: 'Australia',     offset: '+09:30/+10:30' },
  { value: 'Australia/Darwin',    label: 'Darwin (ACST, no DST)',             region: 'Australia',     offset: '+09:30' },
  // Philippines
  { value: 'Asia/Manila',         label: 'Manila / Philippines (PST)',        region: 'Asia',          offset: '+08' },
  // United States
  { value: 'America/New_York',    label: 'New York / Miami (EST/EDT)',        region: 'United States', offset: '-05/-04' },
  { value: 'America/Chicago',     label: 'Chicago / Houston (CST/CDT)',       region: 'United States', offset: '-06/-05' },
  { value: 'America/Denver',      label: 'Denver / Phoenix (MST/MDT)',        region: 'United States', offset: '-07/-06' },
  { value: 'America/Los_Angeles', label: 'Los Angeles / San Francisco (PST/PDT)', region: 'United States', offset: '-08/-07' },
  // United Kingdom
  { value: 'Europe/London',       label: 'London (GMT/BST)',                  region: 'United Kingdom', offset: '+00/+01' },
  // Canada
  { value: 'America/Toronto',     label: 'Toronto / Ottawa (EST/EDT)',        region: 'Canada',        offset: '-05/-04' },
  { value: 'America/Vancouver',   label: 'Vancouver (PST/PDT)',               region: 'Canada',        offset: '-08/-07' },
  // New Zealand
  { value: 'Pacific/Auckland',    label: 'Auckland (NZST/NZDT)',             region: 'New Zealand',   offset: '+12/+13' },
  // Singapore / Malaysia
  { value: 'Asia/Singapore',      label: 'Singapore / Kuala Lumpur (SGT)',   region: 'Asia',          offset: '+08' },
  // India
  { value: 'Asia/Kolkata',        label: 'India (IST)',                       region: 'Asia',          offset: '+05:30' },
  // UAE
  { value: 'Asia/Dubai',          label: 'Dubai / UAE (GST)',                 region: 'Asia',          offset: '+04' },
  // UTC fallback
  { value: 'UTC',                 label: 'UTC (Coordinated Universal Time)',  region: 'UTC',           offset: '+00' },
]

export const TIMEZONE_REGIONS = [...new Set(TIMEZONES.map(t => t.region))]

export function getTimezoneLabel(value: string): string {
  return TIMEZONES.find(t => t.value === value)?.label || value
}

// ─── DISPLAY HELPERS ─────────────────────────────────────────────

/**
 * Format a booking date + time string in the site's local timezone.
 * booking_date: "2026-10-15", booking_time: "10:00", timezone: "Australia/Sydney"
 * Returns: "Thu 15 Oct 2026 at 10:00 AM (AEDT)"
 */
export function formatBookingDateTime(
  date: string,
  time: string,
  timezone: string,
  format: 'full' | 'short' | 'time-only' = 'full'
): string {
  try {
    // Construct a date in the site's timezone
    const dt = new Date(`${date}T${time}:00`)

    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      ...(format === 'full' ? {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      } : format === 'short' ? {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      } : {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      }),
    }

    return new Intl.DateTimeFormat('en-AU', options).format(dt)
  } catch {
    return `${date} at ${time}`
  }
}

/**
 * Get the current date in a given timezone as YYYY-MM-DD
 * Used to set the minimum date in the booking form
 */
export function getTodayInTimezone(timezone: string): string {
  try {
    const now = new Date()
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now)
    const y = parts.find(p => p.type === 'year')?.value
    const m = parts.find(p => p.type === 'month')?.value
    const d = parts.find(p => p.type === 'day')?.value
    return `${y}-${m}-${d}`
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}
