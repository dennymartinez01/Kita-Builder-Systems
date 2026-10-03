'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, ChevronDown, ChevronUp, Info } from 'lucide-react'
import type { RankResult } from '@/lib/ranking'

interface Props {
  siteId:        string
  compact?:      boolean  // true = just icon+name inline; false = full card
  darkMode?:     boolean  // true = dark admin style; false = light owner dashboard
  primaryColor?: string
}

export default function RankBadge({
  siteId,
  compact    = false,
  darkMode   = false,
  primaryColor = '#2563eb',
}: Props) {
  const [rank, setRank]           = useState<RankResult | null>(null)
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState(false)

  useEffect(() => {
    fetch(`/api/ranking/${siteId}`)
      .then(r => r.json())
      .then(d => { if (d.tier) setRank(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [siteId])

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${darkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
        <span className="animate-pulse">•••</span>
      </div>
    )
  }

  if (!rank) return null

  const { tier, score, badges, breakdown } = rank

  /* ── Compact mode: just the rank pill ── */
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
          darkMode
            ? `${tier.bg} ${tier.color}`
            : 'bg-white border border-gray-200 text-gray-700'
        }`}
        title={`${tier.name} — Score ${score}/100`}
      >
        <span>{tier.icon}</span>
        <span>{tier.name}</span>
      </span>
    )
  }

  /* ── Full card mode ── */
  const cardBg     = darkMode ? 'bg-gray-900 border-gray-800'   : 'bg-white border-gray-100'
  const textPri    = darkMode ? 'text-white'                     : 'text-gray-900'
  const textSec    = darkMode ? 'text-gray-400'                  : 'text-gray-500'
  const barTrack   = darkMode ? 'bg-gray-800'                    : 'bg-gray-100'

  return (
    <div className={`border rounded-2xl overflow-hidden ${cardBg}`}>
      {/* Rank header */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tier.icon}</span>
            <div>
              <p className={`font-black text-base ${tier.color}`}>{tier.name}</p>
              <p className={`text-xs ${textSec}`}>Business Rank</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${tier.color}`}>{score}</p>
            <p className={`text-xs ${textSec}`}>/ 100</p>
          </div>
        </div>

        {/* Overall score bar */}
        <div className={`h-2 rounded-full ${barTrack} mb-1`}>
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: tier.color.replace('text-', '').includes('-')
              ? undefined : primaryColor,
              background: score >= 85 ? 'linear-gradient(90deg,#a855f7,#ec4899)'
                        : score >= 66 ? 'linear-gradient(90deg,#f97316,#eab308)'
                        : score >= 44 ? 'linear-gradient(90deg,#22c55e,#16a34a)'
                        : score >= 20 ? 'linear-gradient(90deg,#3b82f6,#0891b2)'
                        : '#6b7280',
            }}
          />
        </div>

        {/* Next tier hint */}
        {score < 95 && (() => {
          const { RANK_TIERS } = require('@/lib/ranking')
          const nextTier = RANK_TIERS.find((t: any) => t.minScore > score)
          if (!nextTier) return null
          const gap = nextTier.minScore - score
          return (
            <p className={`text-xs ${textSec} mt-1`}>
              {gap} point{gap !== 1 ? 's' : ''} to <span className={nextTier.color}>{nextTier.name}</span>
            </p>
          )
        })()}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className={`px-5 pb-4 flex flex-wrap gap-2`}>
          {badges.map(badge => (
            <span
              key={badge.id}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-700 border border-gray-200'
              }`}
              title={badge.description}
            >
              <span>{badge.icon}</span>
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Breakdown toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-5 py-2.5 flex items-center justify-between text-xs border-t transition ${
          darkMode
            ? 'border-gray-800 text-gray-500 hover:text-gray-300 hover:bg-gray-800/40'
            : 'border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-50'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <TrendingUp size={11} /> Score breakdown
        </span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Breakdown rows */}
      {expanded && (
        <div className={`px-5 pb-4 space-y-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          {breakdown.map(row => (
            <div key={row.label}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs ${textSec}`}>{row.label}</span>
                <span className={`text-xs font-semibold ${textPri}`}>{row.score}/100 <span className={`font-normal ${textSec}`}>×{row.pct}%</span></span>
              </div>
              <div className={`h-1.5 rounded-full ${barTrack}`}>
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${row.score}%`, backgroundColor: primaryColor }}
                />
              </div>
            </div>
          ))}
          <p className={`text-xs ${textSec} pt-1`}>
            Score recalculates each time you open the dashboard.
          </p>
        </div>
      )}
    </div>
  )
}
