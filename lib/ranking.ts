/**
 * KITA Builder Systems — Business Rank + Badges Engine
 * Phase 13
 *
 * Three-layer identity per client site:
 *   Layer 1 — Rank       (scored 0-100, maps to 10 tier names)
 *   Layer 2 — Plan badge (already on subscription)
 *   Layer 3 — Badges     (earned achievements)
 */

// ── Rank tiers ────────────────────────────────────────────────
export interface RankTier {
  name:      string
  minScore:  number   // minimum score (0-100) to reach this tier
  color:     string   // Tailwind text color
  bg:        string   // Tailwind bg color
  icon:      string   // emoji
}

export const RANK_TIERS: RankTier[] = [
  { name: 'Newcomer',    minScore:  0,  color: 'text-gray-400',   bg: 'bg-gray-800',        icon: '🌱' },
  { name: 'Starter',     minScore: 10,  color: 'text-slate-400',  bg: 'bg-slate-800',       icon: '⭐' },
  { name: 'Active',      minScore: 20,  color: 'text-blue-400',   bg: 'bg-blue-900/50',     icon: '🔵' },
  { name: 'Established', minScore: 32,  color: 'text-cyan-400',   bg: 'bg-cyan-900/50',     icon: '💎' },
  { name: 'Growing',     minScore: 44,  color: 'text-green-400',  bg: 'bg-green-900/50',    icon: '📈' },
  { name: 'Pro',         minScore: 56,  color: 'text-yellow-400', bg: 'bg-yellow-900/50',   icon: '🏅' },
  { name: 'Elite',       minScore: 66,  color: 'text-orange-400', bg: 'bg-orange-900/50',   icon: '🏆' },
  { name: 'Premier',     minScore: 75,  color: 'text-rose-400',   bg: 'bg-rose-900/50',     icon: '🎖️' },
  { name: 'Pioneer',     minScore: 85,  color: 'text-purple-400', bg: 'bg-purple-900/50',   icon: '🚀' },
  { name: 'Legend',      minScore: 95,  color: 'text-amber-400',  bg: 'bg-amber-900/50',    icon: '👑' },
]

export function getTierForScore(score: number): RankTier {
  // Find the highest tier the score qualifies for
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (score >= RANK_TIERS[i].minScore) return RANK_TIERS[i]
  }
  return RANK_TIERS[0]
}

// ── Badges ────────────────────────────────────────────────────
export interface Badge {
  id:          string
  label:       string
  description: string
  icon:        string
  color:       string
}

export const ALL_BADGES: Badge[] = [
  {
    id:          'early_adopter',
    label:       'Early Adopter',
    description: 'Joined KITA in the first year',
    icon:        '🌱',
    color:       'text-green-400',
  },
  {
    id:          'booking_pro',
    label:       'Booking Pro',
    description: 'Reached 50+ confirmed bookings',
    icon:        '📅',
    color:       'text-blue-400',
  },
  {
    id:          'ai_pioneer',
    label:       'AI Pioneer',
    description: 'Active site using AI-generated content',
    icon:        '🤖',
    color:       'text-purple-400',
  },
  {
    id:          'top_rated',
    label:       'Top Rated',
    description: '5+ reviews with high average rating',
    icon:        '⭐',
    color:       'text-yellow-400',
  },
  {
    id:          'loyal_client',
    label:       'Loyal Client',
    description: 'Active for 6+ months',
    icon:        '🏆',
    color:       'text-amber-400',
  },
  {
    id:          'fully_setup',
    label:       'Fully Setup',
    description: 'Logo, gallery, staff, hours, and about section all complete',
    icon:        '✅',
    color:       'text-green-300',
  },
  {
    id:          'customer_magnet',
    label:       'Customer Magnet',
    description: '10+ registered customers',
    icon:        '🧲',
    color:       'text-cyan-400',
  },
]

// ── Score input ───────────────────────────────────────────────
export interface RankInput {
  // Booking stats
  bookings30d:          number   // confirmed bookings in last 30 days
  bookingsPrev30d:      number   // confirmed bookings in prior 30 days (for growth)
  totalConfirmed:       number   // all-time confirmed bookings
  totalCancelled:       number   // all-time cancelled bookings
  // Engagement
  registeredCustomers:  number   // site_customers count
  // Site completeness
  hasLogo:              boolean
  hasGallery:           boolean
  hasStaff:             boolean
  hasHours:             boolean
  hasAbout:             boolean
  // Tenure
  createdAt:            string   // ISO date
  // Reviews
  reviewCount:          number
  reviewAvgRating:      number
  // Feature adoption
  servicesCount:        number
  staffCount:           number
}

// ── Score result ──────────────────────────────────────────────
export interface RankResult {
  score:      number      // 0-100 overall
  tier:       RankTier
  badges:     Badge[]
  breakdown:  { label: string; score: number; max: number; pct: number }[]
}

// ── Core calculation ──────────────────────────────────────────
export function calculateRank(input: RankInput): RankResult {
  const now        = new Date()
  const created    = new Date(input.createdAt)
  const monthsOld  = Math.max(0, (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 30))
  const totalBooks = input.totalConfirmed + input.totalCancelled

  // ── Component scores (each 0-100, then weighted) ─────────

  // 1. Recent Bookings (20%) — bookings in last 30 days, capped at 20
  const recentBookingScore = Math.min(100, (input.bookings30d / 20) * 100)

  // 2. Booking Growth (15%) — month-over-month growth rate
  const growthRate = input.bookingsPrev30d > 0
    ? ((input.bookings30d - input.bookingsPrev30d) / input.bookingsPrev30d)
    : (input.bookings30d > 0 ? 1 : 0)
  const growthScore = Math.min(100, Math.max(0, 50 + growthRate * 50))

  // 3. Recent Activity (15%) — how many bookings in last 30 days (proxy for active)
  const activityScore = Math.min(100, (input.bookings30d / 10) * 100)

  // 4. Customer Engagement (15%) — registered customers relative to bookings
  const engagementScore = totalBooks > 0
    ? Math.min(100, (input.registeredCustomers / Math.max(totalBooks * 0.1, 1)) * 100)
    : 0

  // 5. Feature Adoption (10%) — services + staff + other features used
  const featuresUsed = [
    input.servicesCount >= 3,
    input.staffCount >= 1,
    input.hasLogo,
    input.hasGallery,
    input.hasAbout,
    input.reviewCount >= 1,
  ].filter(Boolean).length
  const featureScore = Math.min(100, (featuresUsed / 6) * 100)

  // 6. Site Completeness (10%) — 5 completeness fields
  const completeness = [input.hasLogo, input.hasGallery, input.hasStaff, input.hasHours, input.hasAbout]
    .filter(Boolean).length
  const completenessScore = (completeness / 5) * 100

  // 7. Tenure (10%) — months active, capped at 24
  const tenureScore = Math.min(100, (monthsOld / 24) * 100)

  // 8. Reliability (5%) — confirmed / total bookings ratio
  const reliabilityScore = totalBooks > 0
    ? Math.min(100, (input.totalConfirmed / totalBooks) * 100)
    : 50  // neutral if no bookings

  // ── Weighted total ────────────────────────────────────────
  const score = Math.round(
    recentBookingScore  * 0.20 +
    growthScore         * 0.15 +
    activityScore       * 0.15 +
    engagementScore     * 0.15 +
    featureScore        * 0.10 +
    completenessScore   * 0.10 +
    tenureScore         * 0.10 +
    reliabilityScore    * 0.05
  )

  const clampedScore = Math.max(0, Math.min(100, score))
  const tier = getTierForScore(clampedScore)

  // ── Badge evaluation ──────────────────────────────────────
  const badges: Badge[] = []

  // Early Adopter — site created within 365 days of KITA launch (Sep 2026)
  const kitaLaunch = new Date('2026-09-23')
  const daysSinceLaunch = (created.getTime() - kitaLaunch.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceLaunch <= 365) {
    badges.push(ALL_BADGES.find(b => b.id === 'early_adopter')!)
  }

  // Booking Pro — 50+ confirmed bookings
  if (input.totalConfirmed >= 50) {
    badges.push(ALL_BADGES.find(b => b.id === 'booking_pro')!)
  }

  // AI Pioneer — site is active (has bookings) and is AI-generated (always true in KITA)
  if (input.totalConfirmed >= 5 && monthsOld >= 1) {
    badges.push(ALL_BADGES.find(b => b.id === 'ai_pioneer')!)
  }

  // Top Rated — 5+ reviews with avg >= 4.5
  if (input.reviewCount >= 5 && input.reviewAvgRating >= 4.5) {
    badges.push(ALL_BADGES.find(b => b.id === 'top_rated')!)
  }

  // Loyal Client — active for 6+ months
  if (monthsOld >= 6) {
    badges.push(ALL_BADGES.find(b => b.id === 'loyal_client')!)
  }

  // Fully Setup — all 5 completeness fields
  if (completeness === 5) {
    badges.push(ALL_BADGES.find(b => b.id === 'fully_setup')!)
  }

  // Customer Magnet — 10+ registered customers
  if (input.registeredCustomers >= 10) {
    badges.push(ALL_BADGES.find(b => b.id === 'customer_magnet')!)
  }

  // ── Breakdown for display ─────────────────────────────────
  const breakdown = [
    { label: 'Recent Bookings',    score: Math.round(recentBookingScore),  max: 100, pct: 20 },
    { label: 'Booking Growth',     score: Math.round(growthScore),         max: 100, pct: 15 },
    { label: 'Recent Activity',    score: Math.round(activityScore),       max: 100, pct: 15 },
    { label: 'Customer Engagement',score: Math.round(engagementScore),     max: 100, pct: 15 },
    { label: 'Feature Adoption',   score: Math.round(featureScore),        max: 100, pct: 10 },
    { label: 'Site Completeness',  score: Math.round(completenessScore),   max: 100, pct: 10 },
    { label: 'Tenure',             score: Math.round(tenureScore),         max: 100, pct: 10 },
    { label: 'Reliability',        score: Math.round(reliabilityScore),    max: 100, pct:  5 },
  ]

  return { score: clampedScore, tier, badges, breakdown }
}
