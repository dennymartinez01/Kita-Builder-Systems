'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, RefreshCw, Loader2, Globe, Shield, Search,
  BarChart2, Zap, AlertTriangle, Info, CheckCircle,
  ChevronDown, ChevronUp, ExternalLink, Code2, Layers, FileSearch,
} from 'lucide-react'
import type { AuditRecord, AuditIssue, IssueSeverity } from '@/lib/audit/types'
import type { CrawledPage } from '@/lib/audit/crawler'

type TabKey = 'overview' | 'performance' | 'seo' | 'security' | 'tech' | 'accessibility' | 'issues' | 'pages' | 'raw'

// ─── SCORE RING ───────────────────────────────────────────────────
function ScoreRing({ score, size = 80, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#374151" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
        <text
          x={size / 2} y={size / 2} dominantBaseline="middle" textAnchor="middle"
          style={{ transform: `rotate(90deg) translate(0, -${size}px)`, transformOrigin: `${size / 2}px ${size / 2}px`, fill: color, fontSize: size > 70 ? 18 : 14, fontWeight: 700 }}
        >
          {score}
        </text>
      </svg>
      {label && <span className="text-gray-400 text-xs">{label}</span>}
    </div>
  )
}

// ─── ISSUE CARD ───────────────────────────────────────────────────
function IssueCard({ issue }: { issue: AuditIssue }) {
  const [open, setOpen] = useState(false)
  const severityConfig: Record<IssueSeverity, { color: string; bg: string; icon: React.ComponentType<any> }> = {
    critical: { color: 'text-red-400', bg: 'border-red-900/50 bg-red-950/20', icon: AlertTriangle },
    high:     { color: 'text-orange-400', bg: 'border-orange-900/50 bg-orange-950/20', icon: AlertTriangle },
    medium:   { color: 'text-yellow-400', bg: 'border-yellow-900/50 bg-yellow-950/20', icon: AlertTriangle },
    low:      { color: 'text-blue-400', bg: 'border-blue-900/50 bg-blue-950/10', icon: Info },
    info:     { color: 'text-gray-400', bg: 'border-gray-800 bg-gray-900/50', icon: Info },
  }
  const { color, bg, icon: Icon } = severityConfig[issue.severity] || severityConfig.info

  return (
    <div className={`border rounded-xl overflow-hidden ${bg}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition"
      >
        <Icon size={14} className={`${color} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-sm font-medium">{issue.title}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${color}`}>{issue.severity}</span>
            <span className="text-gray-600 text-xs capitalize">{issue.category}</span>
          </div>
          {!open && <p className="text-gray-500 text-xs mt-0.5 truncate">{issue.description}</p>}
        </div>
        {open ? <ChevronUp size={14} className="text-gray-500 shrink-0 mt-0.5" /> : <ChevronDown size={14} className="text-gray-500 shrink-0 mt-0.5" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-800/50">
          <p className="text-gray-400 text-sm mt-3">{issue.description}</p>
          {issue.element && (
            <div className="bg-gray-950 rounded-lg px-3 py-2 font-mono text-xs text-gray-400 break-all">
              {issue.element}
            </div>
          )}
          <div className="bg-gray-800/50 rounded-lg px-3 py-2">
            <p className="text-gray-300 text-xs"><span className="text-green-400 font-medium">Fix: </span>{issue.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── METRIC ROW ───────────────────────────────────────────────────
function MetricRow({ label, value, good, unit = '' }: { label: string; value?: string | number; good?: boolean; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className={`text-sm font-medium ${good === true ? 'text-green-400' : good === false ? 'text-red-400' : 'text-white'}`}>
        {value !== undefined && value !== null ? `${value}${unit}` : '—'}
      </span>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────
export default function AuditResultPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [audit, setAudit] = useState<AuditRecord | null>(null)
  const [pages, setPages] = useState<CrawledPage[]>([])
  const [loading, setLoading] = useState(true)
  const [rerunning, setRerunning] = useState(false)
  const [tab, setTab] = useState<TabKey>('overview')
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  useEffect(() => { loadAudit() }, [id])

  async function loadAudit() {
    setLoading(true)
    try {
      const res = await fetch(`/api/audit/${id}`)
      const data = await res.json()
      if (data.audit) setAudit(data.audit)
      if (data.pages) setPages(data.pages)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  async function rerun() {
    setRerunning(true)
    try {
      await fetch(`/api/audit/${id}`, { method: 'POST' })
      await loadAudit()
    } finally { setRerunning(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 size={32} className="text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading audit results...</p>
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400 mb-4">Audit not found.</p>
        <Link href="/audit" className="text-blue-400 hover:underline text-sm">← Back to audits</Link>
      </div>
    )
  }

  const scores = audit.scores || {}
  const issues: AuditIssue[] = Array.isArray(audit.issues) ? audit.issues : []
  const rawData = audit.raw_data || {}

  const filteredIssues = issues.filter(i => {
    const matchSev = severityFilter === 'all' || i.severity === severityFilter
    const matchCat = categoryFilter === 'all' || i.category === categoryFilter
    return matchSev && matchCat
  })

  const issueCounts = {
    critical: issues.filter(i => i.severity === 'critical').length,
    high: issues.filter(i => i.severity === 'high').length,
    medium: issues.filter(i => i.severity === 'medium').length,
    low: issues.filter(i => i.severity === 'low').length,
  }

  const TABS: { id: TabKey; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'overview',      label: 'Overview',      icon: BarChart2 },
    { id: 'performance',   label: 'Performance',   icon: Zap },
    { id: 'seo',           label: 'SEO',           icon: Search },
    { id: 'security',      label: 'Security',      icon: Shield },
    { id: 'accessibility', label: 'Accessibility', icon: CheckCircle },
    { id: 'tech',          label: 'Tech Stack',    icon: Layers },
    { id: 'pages',         label: `Pages (${pages.length})`, icon: FileSearch },
    { id: 'issues',        label: `Issues (${issues.length})`, icon: AlertTriangle },
    { id: 'raw',           label: 'Raw Data',      icon: Code2 },
  ]

  const perfData = rawData.performance || {}
  const seoData = rawData.seo || {}
  const secData = rawData.security || {}
  const techData = rawData.tech || {}
  const a11yData = rawData.accessibility || {}

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <Link href="/audit" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs mb-2 transition">
            <ArrowLeft size={12} /> Back to audits
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2 flex-wrap">
            <Globe size={18} className="text-blue-400 shrink-0" />
            <span className="truncate font-mono text-blue-300 text-sm">{audit.url}</span>
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              audit.status === 'completed' ? 'bg-green-900/50 text-green-400'
              : audit.status === 'failed' ? 'bg-red-900/50 text-red-400'
              : 'bg-blue-900/50 text-blue-400'
            }`}>{audit.status}</span>
            <span className="text-gray-600 text-xs">{new Date(audit.created_at).toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={rerun}
            disabled={rerunning}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-2 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw size={12} className={rerunning ? 'animate-spin' : ''} />
            Re-run
          </button>
          <a
            href={audit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs px-3 py-2 rounded-lg transition"
          >
            <ExternalLink size={12} /> Visit
          </a>
        </div>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mb-6 bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <ScoreRing score={scores.overall ?? 0} size={90} label="Overall" />
        <ScoreRing score={scores.performance ?? 0} size={72} label="Perf" />
        <ScoreRing score={scores.seo ?? 0} size={72} label="SEO" />
        <ScoreRing score={scores.security ?? 0} size={72} label="Security" />
        <ScoreRing score={scores.accessibility ?? 0} size={72} label="A11y" />
        <ScoreRing score={scores.tech ?? 0} size={72} label="Tech" />
      </div>

      {/* Issue severity summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Critical', count: issueCounts.critical, color: 'text-red-400 bg-red-950/30 border-red-900/50' },
          { label: 'High',     count: issueCounts.high,     color: 'text-orange-400 bg-orange-950/30 border-orange-900/50' },
          { label: 'Medium',   count: issueCounts.medium,   color: 'text-yellow-400 bg-yellow-950/30 border-yellow-900/50' },
          { label: 'Low',      count: issueCounts.low,      color: 'text-blue-400 bg-blue-950/20 border-blue-900/30' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-3 text-center ${s.color}`}>
            <div className="text-2xl font-bold">{s.count}</div>
            <div className="text-xs opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto mb-5">
        <div className="flex gap-1 bg-gray-900 border border-gray-800 p-1 rounded-xl w-fit min-w-full sm:min-w-0">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  tab === t.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={12} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> Performance</h3>
            <MetricRow label="LCP" value={perfData.lcp} good={perfData.lcp ? !perfData.lcp.includes('s') || parseFloat(perfData.lcp) < 2.5 : undefined} />
            <MetricRow label="CLS" value={perfData.cls} />
            <MetricRow label="FCP" value={perfData.fcp} />
            <MetricRow label="TTFB" value={perfData.ttfb} />
            <MetricRow label="Page Size" value={perfData.page_size_kb} unit=" KB" />
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><Search size={14} className="text-blue-400" /> SEO</h3>
            <MetricRow label="Title" value={seoData.title ? `${seoData.title.substring(0, 40)}${seoData.title.length > 40 ? '...' : ''}` : 'Missing'} good={!!seoData.title} />
            <MetricRow label="Title Length" value={seoData.title_length} good={seoData.title_length >= 30 && seoData.title_length <= 60} unit=" chars" />
            <MetricRow label="Meta Desc" value={seoData.meta_desc_length} good={seoData.meta_desc_length >= 70 && seoData.meta_desc_length <= 160} unit=" chars" />
            <MetricRow label="H1 Tags" value={seoData.h1_count} good={seoData.h1_count === 1} />
            <MetricRow label="Images without alt" value={seoData.images_without_alt} good={seoData.images_without_alt === 0} />
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><Shield size={14} className="text-green-400" /> Security</h3>
            <MetricRow label="HTTPS" value={secData.is_https ? 'Yes' : 'No'} good={secData.is_https} />
            <MetricRow label="HSTS" value={secData.hsts ? 'Present' : 'Missing'} good={!!secData.hsts} />
            <MetricRow label="X-Frame-Options" value={secData.x_frame_options ? 'Present' : 'Missing'} good={!!secData.x_frame_options} />
            <MetricRow label="CSP" value={secData.csp ? 'Present' : 'Missing'} good={!!secData.csp} />
            <MetricRow label="X-Content-Type" value={secData.x_content_type_options || 'Missing'} good={secData.x_content_type_options === 'nosniff'} />
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><Layers size={14} className="text-purple-400" /> Tech Stack</h3>
            {(techData.stack || []).length === 0 ? (
              <p className="text-gray-600 text-sm">No technologies detected.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {(techData.stack || []).map((t: any) => (
                  <span key={t.name} className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                    {t.name}
                    <span className="text-gray-600 ml-1 capitalize">({t.category})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Crawler stats in overview */}
          {rawData.crawler && rawData.crawler.pages_crawled > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 md:col-span-2">
              <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2"><FileSearch size={14} className="text-blue-400" /> Crawler Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Internal links found', value: rawData.crawler.total_links_found },
                  { label: 'Pages crawled', value: rawData.crawler.pages_crawled },
                  { label: 'Broken links', value: rawData.crawler.broken_links, bad: rawData.crawler.broken_links > 0 },
                  { label: 'Missing titles', value: rawData.crawler.missing_titles, bad: rawData.crawler.missing_titles > 0 },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className={`text-2xl font-bold ${s.bad ? 'text-red-400' : 'text-white'}`}>{s.value ?? 0}</div>
                    <div className="text-gray-600 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PERFORMANCE ── */}
      {tab === 'performance' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-1">
          <h3 className="text-white font-semibold mb-4">Core Web Vitals & Metrics</h3>
          <MetricRow label="Largest Contentful Paint (LCP)" value={perfData.lcp} />
          <MetricRow label="Cumulative Layout Shift (CLS)" value={perfData.cls} />
          <MetricRow label="First Contentful Paint (FCP)" value={perfData.fcp} />
          <MetricRow label="Time to First Byte (TTFB)" value={perfData.ttfb} />
          <MetricRow label="Total Blocking Time (TBT)" value={perfData.tbt} />
          <MetricRow label="Speed Index" value={perfData.speed_index} />
          <MetricRow label="Page Size" value={perfData.page_size_kb} unit=" KB" good={perfData.page_size_kb < 1000} />
          <MetricRow label="Performance Score" value={perfData.score} good={perfData.score >= 80} />
          <div className="mt-4 space-y-2">
            {issues.filter(i => i.category === 'performance').map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* ── SEO ── */}
      {tab === 'seo' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">SEO Analysis</h3>
          <MetricRow label="Title" value={seoData.title || 'Missing'} good={!!seoData.title} />
          <MetricRow label="Title Length" value={seoData.title_length} unit=" chars" good={seoData.title_length >= 30 && seoData.title_length <= 60} />
          <MetricRow label="Meta Description Length" value={seoData.meta_desc_length} unit=" chars" good={seoData.meta_desc_length >= 70 && seoData.meta_desc_length <= 160} />
          <MetricRow label="H1 Count" value={seoData.h1_count} good={seoData.h1_count === 1} />
          <MetricRow label="H1 Text" value={seoData.h1_text || '—'} />
          <MetricRow label="H2 Count" value={seoData.h2_count} />
          <MetricRow label="Canonical" value={seoData.canonical || 'Missing'} good={!!seoData.canonical} />
          <MetricRow label="Robots Meta" value={seoData.robots || 'Not set'} />
          <MetricRow label="OG Title" value={seoData.og_title ? 'Present' : 'Missing'} good={!!seoData.og_title} />
          <MetricRow label="OG Image" value={seoData.og_image ? 'Present' : 'Missing'} good={!!seoData.og_image} />
          <MetricRow label="Images without alt" value={seoData.images_without_alt} good={seoData.images_without_alt === 0} />
          <MetricRow label="Structured Data (JSON-LD)" value={seoData.structured_data_count} good={seoData.structured_data_count > 0} />
          <MetricRow label="Viewport Meta" value={seoData.viewport ? 'Present' : 'Missing'} good={!!seoData.viewport} />
          <div className="mt-4 space-y-2">
            {issues.filter(i => i.category === 'seo').map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* ── SECURITY ── */}
      {tab === 'security' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Security Headers</h3>
          <MetricRow label="HTTPS" value={secData.is_https ? '✅ Yes' : '❌ No'} good={secData.is_https} />
          <MetricRow label="HTTP → HTTPS Redirect" value={secData.http_redirects_to_https === true ? '✅ Yes' : secData.http_redirects_to_https === false ? '❌ No' : '—'} good={secData.http_redirects_to_https} />
          <MetricRow label="HSTS" value={secData.hsts || 'Missing'} good={!!secData.hsts} />
          <MetricRow label="X-Frame-Options" value={secData.x_frame_options || 'Missing'} good={!!secData.x_frame_options} />
          <MetricRow label="X-Content-Type-Options" value={secData.x_content_type_options || 'Missing'} good={secData.x_content_type_options === 'nosniff'} />
          <MetricRow label="Content Security Policy" value={secData.csp ? 'Present' : 'Missing'} good={!!secData.csp} />
          <MetricRow label="Referrer-Policy" value={secData.referrer_policy || 'Missing'} good={!!secData.referrer_policy} />
          <MetricRow label="Permissions-Policy" value={secData.permissions_policy || 'Missing'} good={!!secData.permissions_policy} />
          <MetricRow label="Server Header" value={secData.server_header || 'Not exposed'} good={!secData.server_header} />
          <div className="mt-4 space-y-2">
            {issues.filter(i => i.category === 'security').map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* ── ACCESSIBILITY ── */}
      {tab === 'accessibility' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Accessibility Checks</h3>
          <MetricRow label="HTML lang attribute" value={a11yData.html_lang || 'Missing'} good={!!a11yData.html_lang} />
          <MetricRow label="Images missing alt" value={a11yData.images_missing_alt} good={a11yData.images_missing_alt === 0} />
          <MetricRow label="Inputs without labels" value={a11yData.inputs_without_label} good={a11yData.inputs_without_label === 0} />
          <MetricRow label="Empty buttons" value={a11yData.empty_buttons} good={a11yData.empty_buttons === 0} />
          <MetricRow label="Empty links" value={a11yData.empty_links} good={a11yData.empty_links === 0} />
          <MetricRow label="Skip navigation link" value={a11yData.has_skip_nav ? 'Present' : 'Missing'} good={a11yData.has_skip_nav} />
          <div className="mt-4 space-y-2">
            {issues.filter(i => i.category === 'accessibility').map((issue, idx) => (
              <IssueCard key={idx} issue={issue} />
            ))}
          </div>
        </div>
      )}

      {/* ── TECH STACK ── */}
      {tab === 'tech' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Detected Technologies</h3>
          {(techData.stack || []).length === 0 ? (
            <p className="text-gray-500 text-sm">No technologies detected.</p>
          ) : (
            <div className="space-y-2">
              {(['framework', 'cms', 'ecommerce', 'analytics', 'marketing', 'hosting', 'other'] as const).map(cat => {
                const items = (techData.stack || []).filter((t: any) => t.category === cat)
                if (!items.length) return null
                return (
                  <div key={cat}>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 capitalize">{cat}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {items.map((t: any) => (
                        <span key={t.name} className="text-sm px-3 py-1.5 rounded-full bg-gray-800 text-gray-200 border border-gray-700 flex items-center gap-1.5">
                          {t.name}
                          <span className={`text-xs ${t.confidence === 'high' ? 'text-green-500' : t.confidence === 'medium' ? 'text-yellow-500' : 'text-gray-600'}`}>
                            {t.confidence}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ISSUES ── */}
      {tab === 'issues' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex gap-1">
              {(['all', 'critical', 'high', 'medium', 'low', 'info'] as const).map(sev => (
                <button key={sev} onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition capitalize ${
                    severityFilter === sev ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {sev}{sev !== 'all' ? ` (${issues.filter(i => i.severity === sev).length})` : ` (${issues.length})`}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {(['all', 'performance', 'seo', 'security', 'accessibility', 'tech'] as const).map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition capitalize ${
                    categoryFilter === cat ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-10 text-gray-600">
                <CheckCircle size={28} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No issues match this filter.</p>
              </div>
            ) : (
              filteredIssues.map((issue, idx) => <IssueCard key={idx} issue={issue} />)
            )}
          </div>
        </div>
      )}

      {/* ── PAGES ── */}
      {tab === 'pages' && (
        <div>
          {/* Crawler stats summary */}
          {rawData.crawler && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Links Found', value: rawData.crawler.total_links_found ?? 0, color: 'text-blue-400' },
                { label: 'Pages Crawled', value: rawData.crawler.pages_crawled ?? 0, color: 'text-green-400' },
                { label: 'Broken Links', value: rawData.crawler.broken_links ?? 0, color: 'text-red-400' },
                { label: 'Noindex Pages', value: rawData.crawler.noindex_pages ?? 0, color: 'text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {pages.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
              <FileSearch size={28} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-500 text-sm mb-1">No internal pages crawled yet.</p>
              <p className="text-gray-600 text-xs">Pages are crawled automatically when you run an audit. Re-run to crawl internal links.</p>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                <p className="text-white font-semibold text-sm">{pages.length} internal pages crawled</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="text-green-400">■</span> OK
                  <span className="text-red-400">■</span> Broken
                  <span className="text-yellow-400">■</span> Issues
                </div>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium px-4 py-2">URL</th>
                    <th className="text-left text-gray-500 font-medium px-3 py-2 hidden sm:table-cell">Status</th>
                    <th className="text-left text-gray-500 font-medium px-3 py-2 hidden md:table-cell">Title</th>
                    <th className="text-left text-gray-500 font-medium px-3 py-2 hidden lg:table-cell">H1s</th>
                    <th className="text-left text-gray-500 font-medium px-3 py-2 hidden lg:table-cell">Meta</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page, i) => {
                    const isBroken = (page.status_code ?? 0) >= 400 || page.status_code === 0
                    const hasIssue = !page.title || !page.meta_desc || page.h1_count !== 1
                    const rowColor = isBroken ? 'bg-red-950/10' : hasIssue ? 'bg-yellow-950/10' : ''
                    return (
                      <tr key={i} className={`border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition ${rowColor}`}>
                        <td className="px-4 py-2.5 max-w-[200px]">
                          <span className="text-gray-300 font-mono truncate block text-xs">
                            {new URL(page.url).pathname || '/'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 hidden sm:table-cell">
                          <span className={`font-mono font-bold ${
                            isBroken ? 'text-red-400' : 'text-green-400'
                          }`}>
                            {page.status_code || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 hidden md:table-cell max-w-[180px]">
                          {page.title ? (
                            <span className="text-gray-400 truncate block">{page.title.substring(0, 40)}{page.title.length > 40 ? '…' : ''}</span>
                          ) : (
                            <span className="text-red-400 italic">Missing</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 hidden lg:table-cell">
                          <span className={page.h1_count === 1 ? 'text-green-400' : 'text-yellow-400'}>
                            {page.h1_count}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 hidden lg:table-cell">
                          {page.meta_desc ? (
                            <span className="text-green-400">✓</span>
                          ) : (
                            <span className="text-red-400">✗</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <a href={page.url} target="_blank" rel="noopener noreferrer"
                            className="text-gray-600 hover:text-blue-400 transition">
                            <ExternalLink size={11} />
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Cross-page issues from crawler */}
          {issues.filter(i => i.element && !i.element.startsWith('<')).length > 0 && (
            <div className="mt-5">
              <h3 className="text-white font-semibold text-sm mb-3">Cross-page Issues</h3>
              <div className="space-y-2">
                {issues
                  .filter(i => ['broken internal link', 'duplicate page title', 'duplicate meta description',
                    'page missing title tag', 'page missing meta description', 'page missing h1 tag',
                    'slow page response time', 'internal page set to noindex'].includes(i.title.toLowerCase()))
                  .map((issue, idx) => <IssueCard key={idx} issue={issue} />)
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── RAW DATA ── */}
      {tab === 'raw' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-3">Raw Audit Data</h3>
          <p className="text-gray-500 text-xs mb-4">Complete data returned from all analyzers. Useful for debugging.</p>
          <pre className="text-xs text-green-300 font-mono overflow-x-auto bg-gray-950 p-4 rounded-xl leading-5 max-h-[600px] overflow-y-auto">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
