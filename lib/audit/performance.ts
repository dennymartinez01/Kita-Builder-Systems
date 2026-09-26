import type { AnalyzerResult, AuditIssue } from './types'

const PSI_BASE = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'

interface PSIMetric {
  numericValue?: number
  displayValue?: string
  score?: number | null
}

export async function analyzePerformance(url: string): Promise<AnalyzerResult> {
  const issues: AuditIssue[] = []
  const data: Record<string, any> = {}

  try {
    const apiKey = process.env.PAGESPEED_API_KEY
    const params = new URLSearchParams({
      url,
      strategy: 'mobile',
      category: 'performance',
      ...(apiKey ? { key: apiKey } : {}),
    })

    const res = await fetch(`${PSI_BASE}?${params}`, {
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      throw new Error(`PSI API returned ${res.status}`)
    }

    const json = await res.json()
    const lighthouse = json.lighthouseResult
    const auditsData = lighthouse?.audits || {}
    const categories = lighthouse?.categories || {}

    // Overall performance score from PSI (0-1 scale → 0-100)
    const perfScore = Math.round((categories.performance?.score ?? 0) * 100)

    // Core Web Vitals
    const lcp = auditsData['largest-contentful-paint'] as PSIMetric
    const cls = auditsData['cumulative-layout-shift'] as PSIMetric
    const fcp = auditsData['first-contentful-paint'] as PSIMetric
    const ttfb = auditsData['server-response-time'] as PSIMetric
    const tbt = auditsData['total-blocking-time'] as PSIMetric
    const speedIndex = auditsData['speed-index'] as PSIMetric

    data.lcp = lcp?.displayValue || 'N/A'
    data.cls = cls?.displayValue || 'N/A'
    data.fcp = fcp?.displayValue || 'N/A'
    data.ttfb = ttfb?.displayValue || 'N/A'
    data.tbt = tbt?.displayValue || 'N/A'
    data.speed_index = speedIndex?.displayValue || 'N/A'
    data.score = perfScore

    // Page weight
    const totalBytes = auditsData['total-byte-weight'] as PSIMetric
    if (totalBytes?.numericValue) {
      data.page_size_kb = Math.round((totalBytes.numericValue || 0) / 1024)
      if (data.page_size_kb > 3000) {
        issues.push({
          category: 'performance',
          severity: 'high',
          title: 'Large page size',
          description: `Page is ${data.page_size_kb}KB. Large pages slow mobile users significantly.`,
          recommendation: 'Compress images, enable gzip/Brotli, remove unused CSS/JS.',
        })
      }
    }

    // LCP check
    if (lcp?.numericValue && lcp.numericValue > 4000) {
      issues.push({
        category: 'performance',
        severity: lcp.numericValue > 6000 ? 'critical' : 'high',
        title: 'Slow Largest Contentful Paint (LCP)',
        description: `LCP is ${lcp.displayValue}. Should be under 2.5s for good user experience.`,
        recommendation: 'Optimize hero images, use a CDN, reduce server response time.',
      })
    }

    // CLS check
    if (cls?.numericValue && cls.numericValue > 0.1) {
      issues.push({
        category: 'performance',
        severity: cls.numericValue > 0.25 ? 'critical' : 'high',
        title: 'High Cumulative Layout Shift (CLS)',
        description: `CLS is ${cls.displayValue}. Page elements are shifting unexpectedly.`,
        recommendation: 'Set explicit width/height on images and embeds. Avoid inserting content above existing content.',
      })
    }

    // FCP check
    if (fcp?.numericValue && fcp.numericValue > 3000) {
      issues.push({
        category: 'performance',
        severity: 'medium',
        title: 'Slow First Contentful Paint (FCP)',
        description: `FCP is ${fcp.displayValue}. Users see a blank screen for too long.`,
        recommendation: 'Reduce render-blocking resources, optimize critical rendering path.',
      })
    }

    // TTFB check
    if (ttfb?.numericValue && ttfb.numericValue > 600) {
      issues.push({
        category: 'performance',
        severity: 'medium',
        title: 'Slow Server Response Time (TTFB)',
        description: `Server response time is ${ttfb.displayValue}. Should be under 200ms.`,
        recommendation: 'Use server-side caching, upgrade hosting, consider a CDN.',
      })
    }

    // Render-blocking resources
    const renderBlocking = auditsData['render-blocking-resources'] as any
    if (renderBlocking?.score !== null && renderBlocking?.score < 0.9) {
      issues.push({
        category: 'performance',
        severity: 'medium',
        title: 'Render-blocking resources detected',
        description: 'CSS or JS files are blocking the page from rendering.',
        recommendation: 'Defer non-critical JS, inline critical CSS, use async/defer attributes.',
      })
    }

    // Opportunities
    const unusedJs = auditsData['unused-javascript'] as any
    if (unusedJs?.numericValue && unusedJs.numericValue > 20000) {
      const kb = Math.round(unusedJs.numericValue / 1024)
      issues.push({
        category: 'performance',
        severity: 'medium',
        title: `${kb}KB of unused JavaScript`,
        description: 'Significant unused JavaScript is being loaded.',
        recommendation: 'Remove unused code, use code splitting, lazy-load non-critical scripts.',
      })
    }

    const unusedCss = auditsData['unused-css-rules'] as any
    if (unusedCss?.numericValue && unusedCss.numericValue > 10000) {
      const kb = Math.round(unusedCss.numericValue / 1024)
      issues.push({
        category: 'performance',
        severity: 'low',
        title: `${kb}KB of unused CSS`,
        description: 'CSS rules that are not used by the page are being loaded.',
        recommendation: 'Use PurgeCSS or similar tool to remove unused CSS.',
      })
    }

    // Image optimization
    const modernImages = auditsData['uses-optimized-images'] as any
    if (modernImages?.score !== null && modernImages?.score < 0.9) {
      issues.push({
        category: 'performance',
        severity: 'medium',
        title: 'Images not optimized',
        description: 'Images could be compressed further without quality loss.',
        recommendation: 'Use WebP format, compress images, use lazy loading for below-fold images.',
      })
    }

    return { score: perfScore, issues, data }
  } catch (err: any) {
    // PSI failed — return neutral score with an info issue
    return {
      score: 0,
      issues: [{
        category: 'performance',
        severity: 'info',
        title: 'Performance analysis unavailable',
        description: err.message || 'Could not reach PageSpeed Insights API.',
        recommendation: 'Ensure the URL is publicly accessible and try again.',
      }],
      data: { error: err.message },
    }
  }
}
