import * as cheerio from 'cheerio'
import type { AnalyzerResult, AuditIssue } from './types'

export async function analyzeAccessibility(url: string, html: string): Promise<AnalyzerResult> {
  const issues: AuditIssue[] = []
  const data: Record<string, any> = {}
  const $ = cheerio.load(html)

  // ── IMAGES WITHOUT ALT ────────────────────────────────────────
  const imgs = $('img')
  let missingAlt = 0
  let emptyAlt = 0
  imgs.each((_, el) => {
    const alt = $(el).attr('alt')
    if (alt === undefined || alt === null) missingAlt++
    else if (alt.trim() === '') emptyAlt++
  })
  data.images_missing_alt = missingAlt
  data.images_empty_alt = emptyAlt

  if (missingAlt > 0) {
    issues.push({
      category: 'accessibility',
      severity: missingAlt > 3 ? 'high' : 'medium',
      title: `${missingAlt} image${missingAlt > 1 ? 's' : ''} missing alt attribute`,
      description: 'Screen readers cannot describe images without alt text.',
      recommendation: 'Add descriptive alt attributes to all meaningful images. Use alt="" for decorative images.',
    })
  }

  // ── FORM INPUTS WITHOUT LABELS ────────────────────────────────
  const inputs = $('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"])')
  let inputsWithoutLabel = 0
  inputs.each((_, el) => {
    const id = $(el).attr('id')
    const ariaLabel = $(el).attr('aria-label')
    const ariaLabelledby = $(el).attr('aria-labelledby')
    const hasLabel = id ? $(`label[for="${id}"]`).length > 0 : false
    if (!hasLabel && !ariaLabel && !ariaLabelledby) inputsWithoutLabel++
  })
  data.inputs_without_label = inputsWithoutLabel

  if (inputsWithoutLabel > 0) {
    issues.push({
      category: 'accessibility',
      severity: 'high',
      title: `${inputsWithoutLabel} form input${inputsWithoutLabel > 1 ? 's' : ''} without labels`,
      description: 'Form inputs without labels are unusable by screen reader users.',
      recommendation: 'Add <label for="inputId"> or aria-label to every input, select, and textarea.',
    })
  }

  // ── BUTTONS WITHOUT TEXT ──────────────────────────────────────
  const buttons = $('button, [role="button"]')
  let emptyButtons = 0
  buttons.each((_, el) => {
    const text = $(el).text().trim()
    const ariaLabel = $(el).attr('aria-label')
    const ariaLabelledby = $(el).attr('aria-labelledby')
    const title = $(el).attr('title')
    if (!text && !ariaLabel && !ariaLabelledby && !title) emptyButtons++
  })
  data.empty_buttons = emptyButtons

  if (emptyButtons > 0) {
    issues.push({
      category: 'accessibility',
      severity: 'high',
      title: `${emptyButtons} button${emptyButtons > 1 ? 's' : ''} without accessible text`,
      description: 'Buttons with no text or aria-label are unusable by screen readers.',
      recommendation: 'Add visible text or aria-label to all buttons.',
    })
  }

  // ── HEADING ORDER ─────────────────────────────────────────────
  const headings: number[] = []
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    headings.push(parseInt(el.tagName.replace('h', ''), 10))
  })
  data.heading_order = headings

  let headingOrderIssue = false
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] - headings[i - 1] > 1) {
      headingOrderIssue = true
      break
    }
  }
  if (headingOrderIssue) {
    issues.push({
      category: 'accessibility',
      severity: 'medium',
      title: 'Heading order skips levels',
      description: 'Heading levels should not skip (e.g. H1 → H3 without H2).',
      recommendation: 'Use heading levels sequentially: H1 → H2 → H3. Do not skip levels.',
    })
  }

  // ── LANGUAGE ATTRIBUTE ────────────────────────────────────────
  const lang = $('html').attr('lang')
  data.html_lang = lang || null
  if (!lang) {
    issues.push({
      category: 'accessibility',
      severity: 'high',
      title: 'Missing lang attribute on <html>',
      description: 'The <html> element has no lang attribute. Screen readers need this to use correct pronunciation.',
      recommendation: 'Add lang="en" (or appropriate language code) to the <html> element.',
    })
  }

  // ── LINKS WITHOUT TEXT ────────────────────────────────────────
  const links = $('a')
  let emptyLinks = 0
  links.each((_, el) => {
    const text = $(el).text().trim()
    const ariaLabel = $(el).attr('aria-label')
    const imgAlt = $(el).find('img').attr('alt')
    if (!text && !ariaLabel && !imgAlt) emptyLinks++
  })
  data.empty_links = emptyLinks

  if (emptyLinks > 0) {
    issues.push({
      category: 'accessibility',
      severity: 'medium',
      title: `${emptyLinks} link${emptyLinks > 1 ? 's' : ''} without accessible text`,
      description: 'Links with no text are confusing for screen reader and keyboard users.',
      recommendation: 'Add descriptive text or aria-label to all links.',
    })
  }

  // ── SKIP NAVIGATION ──────────────────────────────────────────
  const hasSkipNav = $('a[href="#main"], a[href="#content"], .skip-nav, .skip-link').length > 0
  data.has_skip_nav = hasSkipNav
  if (!hasSkipNav) {
    issues.push({
      category: 'accessibility',
      severity: 'low',
      title: 'No skip navigation link',
      description: 'Keyboard users must tab through the entire navigation to reach the main content.',
      recommendation: 'Add a "Skip to main content" link as the first focusable element.',
    })
  }

  // ── CALCULATE SCORE ───────────────────────────────────────────
  let score = 100
  for (const issue of issues) {
    if (issue.severity === 'critical') score -= 25
    else if (issue.severity === 'high') score -= 15
    else if (issue.severity === 'medium') score -= 8
    else if (issue.severity === 'low') score -= 4
  }
  score = Math.max(0, Math.min(100, score))

  return { score, issues, data }
}
