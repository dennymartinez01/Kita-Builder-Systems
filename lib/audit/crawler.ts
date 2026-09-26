import * as cheerio from 'cheerio'
import type { AuditIssue } from './types'

export interface CrawledPage {
  url: string
  status_code: number
  title: string
  meta_desc: string
  h1_count: number
  h1_text: string
  canonical: string | null
  has_meta_robots_noindex: boolean
  response_time_ms: number
  error?: string
}

interface LinkExtractResult {
  internal: string[]
  external: string[]
  broken: string[]
}

// ─── EXTRACT INTERNAL LINKS FROM HTML ────────────────────────────
export function extractLinks(html: string, baseUrl: string): LinkExtractResult {
  const $ = cheerio.load(html)
  const base = new URL(baseUrl)
  const internal = new Set<string>()
  const external = new Set<string>()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim()
    if (!href) return

    // Skip anchors, mailto, tel, javascript
    if (href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || href.startsWith('javascript:')) return

    try {
      const resolved = new URL(href, baseUrl)

      // Normalise — remove trailing slash, hash, query for dedup
      resolved.hash = ''
      const clean = resolved.href.replace(/\/$/, '')

      if (resolved.hostname === base.hostname) {
        // Skip common non-HTML resources
        const ext = resolved.pathname.split('.').pop()?.toLowerCase()
        if (['pdf', 'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico',
             'css', 'js', 'xml', 'json', 'zip', 'mp4', 'mp3'].includes(ext || '')) return
        if (clean !== baseUrl.replace(/\/$/, '')) {
          internal.add(clean)
        }
      } else {
        external.add(resolved.href)
      }
    } catch {
      // Invalid URL — skip
    }
  })

  return {
    internal: Array.from(internal),
    external: Array.from(external),
    broken: [],
  }
}

// ─── CRAWL A SINGLE PAGE ─────────────────────────────────────────
async function crawlPage(url: string): Promise<CrawledPage> {
  const start = Date.now()

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'KITA-Audit-Bot/1.0 (Website Audit Tool; +https://kita-builder-systems.vercel.app)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(5000), // 5s max per page
      redirect: 'follow',
    })

    const status_code = res.status
    const response_time_ms = Date.now() - start

    if (!res.ok) {
      return { url, status_code, title: '', meta_desc: '', h1_count: 0, h1_text: '', canonical: null, has_meta_robots_noindex: false, response_time_ms, error: `HTTP ${status_code}` }
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
      return { url, status_code, title: '', meta_desc: '', h1_count: 0, h1_text: '', canonical: null, has_meta_robots_noindex: false, response_time_ms, error: 'Not HTML' }
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    const title = $('title').first().text().trim()
    const meta_desc = $('meta[name="description"]').attr('content')?.trim() || ''
    const h1s = $('h1')
    const h1_count = h1s.length
    const h1_text = h1s.first().text().trim()
    const canonical = $('link[rel="canonical"]').attr('href') || null
    const robots = $('meta[name="robots"]').attr('content')?.toLowerCase() || ''
    const has_meta_robots_noindex = robots.includes('noindex')

    return { url, status_code, title, meta_desc, h1_count, h1_text, canonical, has_meta_robots_noindex, response_time_ms }
  } catch (err: any) {
    return {
      url,
      status_code: 0,
      title: '', meta_desc: '', h1_count: 0, h1_text: '',
      canonical: null, has_meta_robots_noindex: false,
      response_time_ms: Date.now() - start,
      error: err.message || 'Fetch failed',
    }
  }
}

// ─── CHECK FOR BROKEN LINKS (HEAD requests) ───────────────────────
export async function checkBrokenLinks(urls: string[]): Promise<{ url: string; status: number; broken: boolean }[]> {
  const results = await Promise.allSettled(
    urls.slice(0, 20).map(async url => {
      try {
        const res = await fetch(url, {
          method: 'HEAD',
          signal: AbortSignal.timeout(4000),
          redirect: 'follow',
        })
        return { url, status: res.status, broken: res.status >= 400 }
      } catch {
        return { url, status: 0, broken: true }
      }
    })
  )
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<any>).value)
}

// ─── MAIN CRAWLER ─────────────────────────────────────────────────
export interface CrawlResult {
  pages: CrawledPage[]
  issues: AuditIssue[]
  stats: {
    total_links_found: number
    pages_crawled: number
    broken_links: number
    noindex_pages: number
    missing_titles: number
    missing_descriptions: number
    duplicate_titles: string[]
    duplicate_metas: string[]
  }
}

export async function crawlSite(rootUrl: string, rootHtml: string, maxPages = 10): Promise<CrawlResult> {
  const issues: AuditIssue[] = []
  const pages: CrawledPage[] = []

  // Extract internal links from the root page HTML
  const { internal: internalLinks } = extractLinks(rootHtml, rootUrl)

  // Deduplicate and limit
  const toCrawl = [...new Set(internalLinks)].slice(0, maxPages)

  // Crawl all pages with concurrency limit of 3
  const BATCH_SIZE = 3
  for (let i = 0; i < toCrawl.length; i += BATCH_SIZE) {
    const batch = toCrawl.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(batch.map(url => crawlPage(url)))
    results.forEach(r => {
      if (r.status === 'fulfilled') pages.push(r.value)
    })
  }

  // ── BROKEN LINKS ─────────────────────────────────────────────
  const brokenPages = pages.filter(p => p.status_code >= 400 || p.status_code === 0)
  brokenPages.forEach(p => {
    issues.push({
      category: 'seo',
      severity: 'high',
      title: 'Broken internal link',
      description: `Page returned ${p.status_code || 'no response'}: ${p.url}`,
      recommendation: 'Fix or remove this link. Broken links harm user experience and SEO.',
      element: p.url,
    })
  })

  // ── NOINDEX PAGES ─────────────────────────────────────────────
  const noindexPages = pages.filter(p => p.has_meta_robots_noindex)
  noindexPages.forEach(p => {
    issues.push({
      category: 'seo',
      severity: 'medium',
      title: 'Internal page set to noindex',
      description: `Page is marked noindex and will not be indexed: ${p.url}`,
      recommendation: 'Verify this is intentional. Remove noindex if this page should appear in search results.',
      element: p.url,
    })
  })

  // ── MISSING TITLES ────────────────────────────────────────────
  const missingTitles = pages.filter(p => !p.title && !p.error)
  missingTitles.forEach(p => {
    issues.push({
      category: 'seo',
      severity: 'high',
      title: 'Page missing title tag',
      description: `No title tag found on: ${p.url}`,
      recommendation: 'Add a unique, descriptive title tag (50-60 chars) to every page.',
      element: p.url,
    })
  })

  // ── MISSING META DESCRIPTIONS ────────────────────────────────
  const missingMetas = pages.filter(p => !p.meta_desc && !p.error)
  missingMetas.forEach(p => {
    issues.push({
      category: 'seo',
      severity: 'medium',
      title: 'Page missing meta description',
      description: `No meta description found on: ${p.url}`,
      recommendation: 'Add a unique meta description (150-160 chars) to every page.',
      element: p.url,
    })
  })

  // ── DUPLICATE TITLES ─────────────────────────────────────────
  const titleMap: Record<string, string[]> = {}
  pages.filter(p => p.title).forEach(p => {
    if (!titleMap[p.title]) titleMap[p.title] = []
    titleMap[p.title].push(p.url)
  })
  const dupTitles = Object.entries(titleMap).filter(([, urls]) => urls.length > 1)
  dupTitles.forEach(([title, urls]) => {
    issues.push({
      category: 'seo',
      severity: 'medium',
      title: 'Duplicate page title',
      description: `"${title.substring(0, 60)}" used on ${urls.length} pages: ${urls.join(', ')}`,
      recommendation: 'Each page should have a unique, descriptive title tag.',
    })
  })

  // ── DUPLICATE META DESCRIPTIONS ──────────────────────────────
  const metaMap: Record<string, string[]> = {}
  pages.filter(p => p.meta_desc).forEach(p => {
    if (!metaMap[p.meta_desc]) metaMap[p.meta_desc] = []
    metaMap[p.meta_desc].push(p.url)
  })
  const dupMetas = Object.entries(metaMap).filter(([, urls]) => urls.length > 1)
  dupMetas.forEach(([meta, urls]) => {
    issues.push({
      category: 'seo',
      severity: 'low',
      title: 'Duplicate meta description',
      description: `Same meta description used on ${urls.length} pages.`,
      recommendation: 'Write unique meta descriptions for each page to improve CTR in search results.',
    })
  })

  // ── MISSING H1 ────────────────────────────────────────────────
  const missingH1 = pages.filter(p => p.h1_count === 0 && !p.error)
  missingH1.forEach(p => {
    issues.push({
      category: 'seo',
      severity: 'medium',
      title: 'Page missing H1 tag',
      description: `No H1 heading found on: ${p.url}`,
      recommendation: 'Add exactly one H1 tag that describes the main topic of the page.',
      element: p.url,
    })
  })

  // ── SLOW PAGES ────────────────────────────────────────────────
  const slowPages = pages.filter(p => p.response_time_ms > 3000 && !p.error)
  slowPages.forEach(p => {
    issues.push({
      category: 'performance',
      severity: 'medium',
      title: 'Slow page response time',
      description: `Page took ${(p.response_time_ms / 1000).toFixed(1)}s to respond: ${p.url}`,
      recommendation: 'Investigate server-side performance. Consider caching or CDN for slow pages.',
      element: p.url,
    })
  })

  const stats = {
    total_links_found: internalLinks.length,
    pages_crawled: pages.length,
    broken_links: brokenPages.length,
    noindex_pages: noindexPages.length,
    missing_titles: missingTitles.length,
    missing_descriptions: missingMetas.length,
    duplicate_titles: dupTitles.map(([title]) => title),
    duplicate_metas: dupMetas.map(([meta]) => meta.substring(0, 60)),
  }

  return { pages, issues, stats }
}
