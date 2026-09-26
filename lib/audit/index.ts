import { analyzePerformance } from './performance'
import { analyzeSEO } from './seo'
import { analyzeSecurity } from './security'
import { analyzeTech } from './tech'
import { analyzeAccessibility } from './accessibility'
import { crawlSite } from './crawler'
import type { AuditScores, AuditIssue, AnalyzerResult } from './types'

export * from './types'
export * from './crawler'

interface RunAuditResult {
  scores: AuditScores
  raw_data: Record<string, any>
  issues: AuditIssue[]
  pages: import('./crawler').CrawledPage[]
}

// ─── FETCH HTML + HEADERS ────────────────────────────────────────
async function fetchPage(url: string): Promise<{ html: string; headers: Record<string, string> }> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'KITA-Audit-Bot/1.0 (Website Audit Tool; +https://kita-builder-systems.vercel.app)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) throw new Error(`Failed to fetch page: HTTP ${res.status} ${res.statusText}`)

  const html = await res.text()
  const headers: Record<string, string> = {}
  res.headers.forEach((value, key) => { headers[key.toLowerCase()] = value })

  return { html, headers }
}

// ─── NORMALIZE URL ────────────────────────────────────────────────
export function normalizeUrl(url: string): string {
  let normalized = url.trim()
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized
  }
  try {
    const parsed = new URL(normalized)
    return parsed.href
  } catch {
    throw new Error(`Invalid URL: ${url}`)
  }
}

// ─── MAIN ORCHESTRATOR ────────────────────────────────────────────
export async function runAudit(rawUrl: string): Promise<RunAuditResult> {
  const url = normalizeUrl(rawUrl)

  // Fetch root page (shared across all analyzers)
  const { html, headers } = await fetchPage(url)

  // Run page analyzers + crawler in parallel
  // Crawler is capped at 10 pages with 5s per-page timeout — safe within maxDuration=60
  const [perfResult, seoResult, secResult, techResult, a11yResult, crawlResult] = await Promise.allSettled([
    analyzePerformance(url),
    analyzeSEO(url, html),
    analyzeSecurity(url),
    analyzeTech(url, html, headers),
    analyzeAccessibility(url, html),
    crawlSite(url, html, 10),
  ])

  function unwrap(result: PromiseSettledResult<AnalyzerResult>, fallbackCategory: string): AnalyzerResult {
    if (result.status === 'fulfilled') return result.value
    return {
      score: 0,
      issues: [{
        category: fallbackCategory as any,
        severity: 'info',
        title: `${fallbackCategory} analysis failed`,
        description: result.reason?.message || 'Unknown error',
        recommendation: 'Try again — this may be a temporary issue.',
      }],
      data: {},
    }
  }

  const perf  = unwrap(perfResult,  'performance')
  const seo   = unwrap(seoResult,   'seo')
  const sec   = unwrap(secResult,   'security')
  const tech  = unwrap(techResult,  'tech')
  const a11y  = unwrap(a11yResult,  'accessibility')

  // Extract crawler result
  const crawl = crawlResult.status === 'fulfilled'
    ? crawlResult.value
    : { pages: [], issues: [], stats: {} }

  // Weighted overall score
  const overall = Math.round(
    perf.score * 0.30 +
    seo.score  * 0.25 +
    sec.score  * 0.20 +
    a11y.score * 0.15 +
    tech.score * 0.10
  )

  const scores: AuditScores = {
    performance:   perf.score,
    seo:           seo.score,
    security:      sec.score,
    accessibility: a11y.score,
    tech:          tech.score,
    overall,
  }

  const raw_data = {
    performance:   perf.data  || {},
    seo:           seo.data   || {},
    security:      sec.data   || {},
    tech:          tech.data  || {},
    accessibility: a11y.data  || {},
    crawler:       crawl.stats || {},
    html_length:   html.length,
    fetched_at:    new Date().toISOString(),
  }

  // Merge all issues sorted by severity
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }
  const allIssues: AuditIssue[] = [
    ...perf.issues,
    ...seo.issues,
    ...sec.issues,
    ...tech.issues,
    ...a11y.issues,
    ...crawl.issues,
  ].sort((a, b) => (severityOrder[a.severity] ?? 5) - (severityOrder[b.severity] ?? 5))

  return {
    scores,
    raw_data,
    issues: allIssues,
    pages: crawl.pages,
  }
}
