/**
 * KITA Builder Systems — Attribution Tracking (Phase 12)
 *
 * Captures UTM params + referrer from URL on page load.
 * Stores in sessionStorage so they persist across the visit
 * and are attached to bookings and leads on submission.
 *
 * Standard UTM params:
 *   utm_source   — where traffic came from (google, facebook, instagram)
 *   utm_medium   — channel type (organic, social, email, paid_search)
 *   utm_campaign — campaign name (summer_promo, christmas_2026)
 *   utm_content  — ad variant or link label
 *   utm_term     — paid search keyword
 */

const SESSION_KEY = 'kita_attribution'

export interface Attribution {
  utm_source:   string | null
  utm_medium:   string | null
  utm_campaign: string | null
  utm_content:  string | null
  utm_term:     string | null
  referrer:     string | null
  landing_page: string | null
}

const EMPTY: Attribution = {
  utm_source:   null,
  utm_medium:   null,
  utm_campaign: null,
  utm_content:  null,
  utm_term:     null,
  referrer:     null,
  landing_page: null,
}

/**
 * Parse UTM params and referrer from the current browser URL.
 * Returns an Attribution object — fields are null if not present.
 * Safe to call server-side (returns EMPTY).
 */
export function parseUTM(): Attribution {
  if (typeof window === 'undefined') return { ...EMPTY }

  const params       = new URLSearchParams(window.location.search)
  const referrerRaw  = document.referrer || null
  const landingPage  = window.location.pathname + window.location.search

  // Truncate referrer to 255 chars to stay within DB column limits
  const referrer = referrerRaw ? referrerRaw.substring(0, 255) : null

  // Normalise utm_source from referrer if not explicitly set
  let utmSource = params.get('utm_source')
  if (!utmSource && referrer) {
    try {
      const refHost = new URL(referrer).hostname.replace('www.', '')
      if (refHost.includes('google'))    utmSource = 'google'
      else if (refHost.includes('facebook') || refHost.includes('fb.com')) utmSource = 'facebook'
      else if (refHost.includes('instagram')) utmSource = 'instagram'
      else if (refHost.includes('twitter') || refHost.includes('x.com')) utmSource = 'twitter'
      else if (refHost.includes('tiktok')) utmSource = 'tiktok'
      else if (refHost.includes('youtube')) utmSource = 'youtube'
      else if (refHost.includes('whatsapp')) utmSource = 'whatsapp'
      else utmSource = refHost || 'referral'
    } catch { /* malformed referrer — ignore */ }
  }
  if (!utmSource && !referrer) utmSource = 'direct'

  return {
    utm_source:   utmSource,
    utm_medium:   params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content:  params.get('utm_content'),
    utm_term:     params.get('utm_term'),
    referrer,
    landing_page: landingPage.substring(0, 255),
  }
}

/**
 * Save attribution to sessionStorage (called on page load).
 * Does NOT overwrite if attribution is already stored for this session
 * — first touch attribution: the source that originally brought the visitor.
 */
export function saveAttribution(data: Attribution): void {
  if (typeof window === 'undefined') return
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (!existing) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
    }
  } catch { /* storage unavailable */ }
}

/**
 * Read stored attribution from sessionStorage.
 * Returns EMPTY if nothing is stored.
 */
export function getStoredAttribution(): Attribution {
  if (typeof window === 'undefined') return { ...EMPTY }
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) return JSON.parse(stored) as Attribution
  } catch { /* parse error */ }
  return { ...EMPTY }
}

/**
 * Returns true if any attribution data (other than 'direct') was captured.
 */
export function hasAttribution(a: Attribution): boolean {
  return !!(a.utm_source && a.utm_source !== 'direct') ||
         !!(a.utm_medium) ||
         !!(a.utm_campaign)
}

/**
 * Map utm_source to a human-readable label + emoji for display.
 */
export const SOURCE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  direct:       { label: 'Direct',       icon: '🔗', color: 'text-gray-400' },
  google:       { label: 'Google',       icon: '🔍', color: 'text-blue-400' },
  facebook:     { label: 'Facebook',     icon: '📘', color: 'text-blue-500' },
  instagram:    { label: 'Instagram',    icon: '📸', color: 'text-pink-400' },
  twitter:      { label: 'Twitter/X',    icon: '🐦', color: 'text-sky-400' },
  tiktok:       { label: 'TikTok',       icon: '🎵', color: 'text-rose-400' },
  youtube:      { label: 'YouTube',      icon: '📺', color: 'text-red-400' },
  whatsapp:     { label: 'WhatsApp',     icon: '💬', color: 'text-green-400' },
  email:        { label: 'Email',        icon: '📧', color: 'text-yellow-400' },
  referral:     { label: 'Referral',     icon: '🔁', color: 'text-purple-400' },
  organic:      { label: 'Organic',      icon: '🌿', color: 'text-green-500' },
  paid_search:  { label: 'Paid Search',  icon: '💰', color: 'text-amber-400' },
}

export function getSourceLabel(source: string | null) {
  if (!source) return SOURCE_LABELS['direct']
  return SOURCE_LABELS[source] ?? { label: source, icon: '📎', color: 'text-gray-400' }
}
