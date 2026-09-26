import * as cheerio from 'cheerio'
import type { AnalyzerResult, AuditIssue } from './types'

export async function analyzeSEO(url: string, html: string): Promise<AnalyzerResult> {
  const issues: AuditIssue[] = []
  const data: Record<string, any> = {}
  const $ = cheerio.load(html)

  // ── TITLE ──────────────────────────────────────────────────────
  const title = $('title').first().text().trim()
  data.title = title
  data.title_length = title.length

  if (!title) {
    issues.push({ category: 'seo', severity: 'critical', title: 'Missing page title', description: 'The page has no <title> tag.', recommendation: 'Add a descriptive title tag between 50-60 characters.' })
  } else if (title.length < 30) {
    issues.push({ category: 'seo', severity: 'medium', title: 'Title too short', description: `Title is ${title.length} chars: "${title}"`, recommendation: 'Expand the title to 50-60 characters with relevant keywords.' })
  } else if (title.length > 60) {
    issues.push({ category: 'seo', severity: 'low', title: 'Title too long', description: `Title is ${title.length} chars — will be truncated in search results.`, recommendation: 'Shorten the title to under 60 characters.' })
  }

  // ── META DESCRIPTION ──────────────────────────────────────────
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || ''
  data.meta_description = metaDesc
  data.meta_desc_length = metaDesc.length

  if (!metaDesc) {
    issues.push({ category: 'seo', severity: 'high', title: 'Missing meta description', description: 'No meta description found.', recommendation: 'Add a meta description between 150-160 characters summarising the page.' })
  } else if (metaDesc.length < 70) {
    issues.push({ category: 'seo', severity: 'medium', title: 'Meta description too short', description: `Meta description is ${metaDesc.length} chars.`, recommendation: 'Expand the meta description to 150-160 characters.' })
  } else if (metaDesc.length > 160) {
    issues.push({ category: 'seo', severity: 'low', title: 'Meta description too long', description: `Meta description is ${metaDesc.length} chars — will be truncated.`, recommendation: 'Shorten the meta description to under 160 characters.' })
  }

  // ── H1 ────────────────────────────────────────────────────────
  const h1s = $('h1')
  data.h1_count = h1s.length
  data.h1_text = h1s.first().text().trim()

  if (h1s.length === 0) {
    issues.push({ category: 'seo', severity: 'high', title: 'Missing H1 tag', description: 'No H1 heading found on the page.', recommendation: 'Add exactly one H1 tag that describes the main topic of the page.' })
  } else if (h1s.length > 1) {
    issues.push({ category: 'seo', severity: 'medium', title: 'Multiple H1 tags', description: `Found ${h1s.length} H1 tags. Only one H1 is recommended.`, recommendation: 'Keep only one H1 per page. Use H2-H6 for subheadings.' })
  }

  // ── HEADING HIERARCHY ─────────────────────────────────────────
  const h2s = $('h2').length
  const h3s = $('h3').length
  data.h2_count = h2s
  data.h3_count = h3s

  if (h1s.length > 0 && h2s === 0 && $('p').length > 5) {
    issues.push({ category: 'seo', severity: 'low', title: 'No H2 headings', description: 'Page has content but no H2 subheadings.', recommendation: 'Add H2 headings to structure your content for readers and search engines.' })
  }

  // ── CANONICAL ─────────────────────────────────────────────────
  const canonical = $('link[rel="canonical"]').attr('href')
  data.canonical = canonical || null
  if (!canonical) {
    issues.push({ category: 'seo', severity: 'medium', title: 'Missing canonical tag', description: 'No canonical URL specified.', recommendation: 'Add <link rel="canonical" href="..."> to prevent duplicate content issues.' })
  }

  // ── ROBOTS ────────────────────────────────────────────────────
  const robotsMeta = $('meta[name="robots"]').attr('content')?.toLowerCase() || ''
  data.robots = robotsMeta || 'not set'
  if (robotsMeta.includes('noindex')) {
    issues.push({ category: 'seo', severity: 'critical', title: 'Page set to noindex', description: 'The robots meta tag is set to noindex — search engines will not index this page.', recommendation: 'Remove noindex unless intentional.' })
  }

  // ── OG TAGS ───────────────────────────────────────────────────
  const ogTitle = $('meta[property="og:title"]').attr('content')
  const ogDesc = $('meta[property="og:description"]').attr('content')
  const ogImage = $('meta[property="og:image"]').attr('content')
  data.og_title = ogTitle || null
  data.og_description = ogDesc || null
  data.og_image = ogImage || null

  if (!ogTitle) issues.push({ category: 'seo', severity: 'medium', title: 'Missing og:title', description: 'No Open Graph title found.', recommendation: 'Add <meta property="og:title"> for better social media sharing.' })
  if (!ogDesc) issues.push({ category: 'seo', severity: 'low', title: 'Missing og:description', description: 'No Open Graph description found.', recommendation: 'Add <meta property="og:description"> for social sharing previews.' })
  if (!ogImage) issues.push({ category: 'seo', severity: 'low', title: 'Missing og:image', description: 'No Open Graph image found.', recommendation: 'Add <meta property="og:image"> to control the image shown when shared on social media.' })

  // ── ALT TEXT ─────────────────────────────────────────────────
  const images = $('img')
  let imagesWithoutAlt = 0
  images.each((_, el) => {
    const alt = $(el).attr('alt')
    if (alt === undefined || alt === null) imagesWithoutAlt++
  })
  data.images_total = images.length
  data.images_without_alt = imagesWithoutAlt

  if (imagesWithoutAlt > 0) {
    issues.push({
      category: 'seo',
      severity: imagesWithoutAlt > 3 ? 'high' : 'medium',
      title: `${imagesWithoutAlt} image${imagesWithoutAlt > 1 ? 's' : ''} missing alt text`,
      description: `${imagesWithoutAlt} of ${images.length} images have no alt attribute.`,
      recommendation: 'Add descriptive alt text to all images for accessibility and SEO.',
    })
  }

  // ── VIEWPORT META ─────────────────────────────────────────────
  const viewport = $('meta[name="viewport"]').attr('content')
  data.viewport = viewport || null
  if (!viewport) {
    issues.push({ category: 'seo', severity: 'high', title: 'Missing viewport meta tag', description: 'No viewport meta tag found — page may not be mobile-friendly.', recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.' })
  }

  // ── STRUCTURED DATA ──────────────────────────────────────────
  const structuredData = $('script[type="application/ld+json"]').length
  data.structured_data_count = structuredData
  if (structuredData === 0) {
    issues.push({ category: 'seo', severity: 'low', title: 'No structured data (JSON-LD)', description: 'No structured data markup found.', recommendation: 'Add JSON-LD schema markup (LocalBusiness, etc.) for rich search results.' })
  }

  // ── CALCULATE SCORE ───────────────────────────────────────────
  // Start at 100, deduct by severity
  let score = 100
  for (const issue of issues) {
    if (issue.severity === 'critical') score -= 25
    else if (issue.severity === 'high') score -= 15
    else if (issue.severity === 'medium') score -= 8
    else if (issue.severity === 'low') score -= 3
  }
  score = Math.max(0, Math.min(100, score))

  return { score, issues, data }
}
