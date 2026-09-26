// ─── AUDIT PDF GENERATOR ─────────────────────────────────────────
// Generates a "Forensic Website Audit Report" PDF matching the
// attached reference format. Uses jsPDF (client-side, no server needed).
// Note: jsPDF must be imported dynamically (client-only).

import type { AuditRecord, AuditIssue } from './types'
import type { CrawledPage } from './crawler'

interface GeneratePDFOptions {
  audit: AuditRecord
  pages?: CrawledPage[]
}

// ─── HELPERS ──────────────────────────────────────────────────────
function scoreLabel(score: number): string {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Needs Work'
  return 'Poor'
}

function getScoreColor(score: number): [number, number, number] {
  if (score >= 80) return [22, 163, 74]   // green
  if (score >= 60) return [234, 179, 8]   // yellow
  return [239, 68, 68]                    // red
}

function severityLabel(sev: string): string {
  return sev.charAt(0).toUpperCase() + sev.slice(1)
}

// ─── MAIN GENERATOR ───────────────────────────────────────────────
export async function generateAuditPDF(options: GeneratePDFOptions): Promise<void> {
  // Dynamic import — jsPDF is client-only
  const { jsPDF } = await import('jspdf')

  const { audit, pages = [] } = options
  const scores = audit.scores || {}
  const rawData = audit.raw_data || {}
  const issues: AuditIssue[] = Array.isArray(audit.issues) ? audit.issues : []
  const perfData = rawData.performance || {}
  const seoData = rawData.seo || {}
  const secData = rawData.security || {}
  const techData = rawData.tech || {}
  const a11yData = rawData.accessibility || {}
  const crawlerData = rawData.crawler || {}

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const PAGE_W = 210
  const MARGIN = 18
  const CONTENT_W = PAGE_W - MARGIN * 2
  let y = MARGIN

  // ── TYPOGRAPHY HELPERS ───────────────────────────────────────────
  function text(content: string, x: number, yPos: number, opts?: any) {
    doc.text(content, x, yPos, opts)
  }

  function addPage() {
    doc.addPage()
    y = MARGIN
  }

  function checkPage(needed = 20) {
    if (y + needed > 275) addPage()
  }

  function h1(content: string) {
    checkPage(14)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    text(content, MARGIN, y)
    y += 8
  }

  function h2(content: string) {
    checkPage(12)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    text(content, MARGIN, y)
    y += 7
  }

  function h3(content: string) {
    checkPage(10)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    text(content, MARGIN, y)
    y += 5
  }

  function body(content: string, indent = 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(51, 65, 85)
    const lines = doc.splitTextToSize(content, CONTENT_W - indent)
    checkPage(lines.length * 5)
    text(lines, MARGIN + indent, y)
    y += lines.length * 5
  }

  function label(content: string, indent = 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    text(content, MARGIN + indent, y)
  }

  function gap(size = 4) { y += size }

  function divider() {
    checkPage(6)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, y, PAGE_W - MARGIN, y)
    y += 4
  }

  function sectionNumber(num: string, title: string) {
    checkPage(16)
    gap(6)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    text(`${num}. ${title.toUpperCase()}`, MARGIN, y)
    y += 7
    divider()
  }

  // ── TABLE HELPER ─────────────────────────────────────────────────
  function table(headers: string[], rows: string[][], colWidths?: number[]) {
    const totalW = CONTENT_W
    const cols = headers.length
    const widths = colWidths || headers.map(() => totalW / cols)

    // Header row
    checkPage(10)
    doc.setFillColor(241, 245, 249)
    doc.setDrawColor(203, 213, 225)
    doc.setLineWidth(0.3)

    let cx = MARGIN
    widths.forEach((w, i) => {
      doc.rect(cx, y - 4, w, 8, 'FD')
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 41, 59)
      text(headers[i], cx + 2, y)
      cx += w
    })
    y += 5

    // Data rows
    rows.forEach((row, rowIdx) => {
      const rowH = Math.max(...row.map((cell, ci) => {
        const lines = doc.splitTextToSize(cell || '', widths[ci] - 4)
        return lines.length * 4.5 + 4
      }))

      checkPage(rowH + 2)
      doc.setFillColor(rowIdx % 2 === 0 ? 255 : 248, rowIdx % 2 === 0 ? 255 : 250, rowIdx % 2 === 0 ? 255 : 252)
      doc.setDrawColor(226, 232, 240)

      cx = MARGIN
      widths.forEach((w, ci) => {
        doc.rect(cx, y - 3, w, rowH, 'FD')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(51, 65, 85)
        const lines = doc.splitTextToSize(row[ci] || '', w - 4)
        text(lines, cx + 2, y)
        cx += w
      })
      y += rowH
    })
    y += 3
  }

  // ── SCORE BADGE ──────────────────────────────────────────────────
  function scoreBadge(label: string, score: number, x: number, yPos: number) {
    const color = getScoreColor(score)
    doc.setFillColor(...color)
    doc.roundedRect(x, yPos - 5, 28, 10, 2, 2, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    text(`${label}`, x + 2, yPos - 0.5)
    text(`${score}/100`, x + 2, yPos + 4)
    doc.setTextColor(51, 65, 85)
  }

  // ─────────────────────────────────────────────────────────────────
  // PAGE 1 — COVER / EXECUTIVE SUMMARY
  // ─────────────────────────────────────────────────────────────────

  // Title
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  text('FORENSIC WEBSITE AUDIT REPORT', MARGIN, y)
  y += 10

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(71, 85, 105)
  const hostname = (() => { try { return new URL(audit.url).hostname } catch { return audit.url } })()
  text(`Website: ${hostname}`, MARGIN, y)
  y += 6

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  text(`Audit Date: ${new Date(audit.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  ·  Generated by KITA Systems`, MARGIN, y)
  y += 8

  divider()

  // Score summary bar
  const scoreCategories = [
    { label: 'Overall', score: scores.overall ?? 0 },
    { label: 'Performance', score: scores.performance ?? 0 },
    { label: 'SEO', score: scores.seo ?? 0 },
    { label: 'Security', score: scores.security ?? 0 },
    { label: 'A11y', score: scores.accessibility ?? 0 },
    { label: 'Tech', score: scores.tech ?? 0 },
  ]

  let bx = MARGIN
  scoreCategories.forEach(s => {
    scoreBadge(s.label, s.score, bx, y + 5)
    bx += 30
  })
  y += 18
  gap(4)

  // Section 1 — Executive Summary
  sectionNumber('1', 'EXECUTIVE SUMMARY')

  h3('Overall website condition:')
  const techStack = (techData.stack || []).map((t: any) => t.name).join(', ')
  body(`${techStack || 'Technology stack detected'}. Overall score ${scores.overall ?? 0}/100 — ${scoreLabel(scores.overall ?? 0)}.`)
  gap(3)

  // Group issues by category for summary
  const criticalIssues = issues.filter(i => i.severity === 'critical')
  const highIssues = issues.filter(i => i.severity === 'high')
  const allIssueCount = issues.length

  h3('Issue Summary:')
  body(`${allIssueCount} total issues found: ${criticalIssues.length} critical, ${highIssues.length} high, ${issues.filter(i => i.severity === 'medium').length} medium, ${issues.filter(i => i.severity === 'low').length} low.`)
  gap(3)

  const perfIssues = issues.filter(i => i.category === 'performance')
  if (perfIssues.length) {
    h3('Major Performance Issues:')
    perfIssues.slice(0, 3).forEach(i => { body(`• ${i.title}: ${i.description}`, 4) })
    gap(2)
  }

  const seoIssues = issues.filter(i => i.category === 'seo')
  if (seoIssues.length) {
    h3('Major SEO Issues:')
    seoIssues.slice(0, 3).forEach(i => { body(`• ${i.title}: ${i.description}`, 4) })
    gap(2)
  }

  const secIssues = issues.filter(i => i.category === 'security')
  if (secIssues.length) {
    h3('Security Observations:')
    body(secData.is_https ? 'HTTPS valid, certificate valid.' : 'Site not using HTTPS — critical risk.')
    secIssues.slice(0, 2).forEach(i => { body(`• ${i.title}`, 4) })
    gap(2)
  }

  const a11yIssues = issues.filter(i => i.category === 'accessibility')
  if (a11yIssues.length) {
    h3('Accessibility Issues:')
    a11yIssues.slice(0, 3).forEach(i => { body(`• ${i.title}: ${i.description}`, 4) })
    gap(2)
  }

  // Section 2 — Tech Stack
  sectionNumber('2', 'WEBSITE TECHNICAL FORENSICS')

  const techRows = (techData.stack || []).map((t: any) => [
    t.category.charAt(0).toUpperCase() + t.category.slice(1),
    t.name,
    t.confidence === 'high' ? 'Confirmed' : 'Detected',
  ])

  if (techRows.length) {
    table(['Category', 'Finding', 'Note'], techRows, [50, 80, 44])
  } else {
    body('No specific technologies detected.')
  }
  gap(2)

  // Section 3 — Crawl Audit
  sectionNumber('3', 'FULL PAGE / CRAWL AUDIT')

  if (pages.length > 0) {
    const pageRows = pages.map(p => [
      (() => { try { return new URL(p.url).pathname || '/' } catch { return p.url } })(),
      `${p.status_code || 0}`,
      [
        !p.title ? 'Missing title' : '',
        !p.meta_desc ? 'Missing meta desc' : '',
        p.h1_count !== 1 ? `H1 count: ${p.h1_count}` : '',
        (p.status_code || 0) >= 400 ? 'BROKEN' : '',
      ].filter(Boolean).join(', ') || 'OK',
    ])
    table(['URL', 'Status', 'Issues Found'], pageRows, [80, 20, 74])
    gap(3)

    h3('Finding:')
    body(`${pages.filter(p => (p.status_code || 0) >= 400).length === 0 ? 'No broken pages found.' : `${pages.filter(p => (p.status_code || 0) >= 400).length} broken page(s) detected.`} ${crawlerData.pages_crawled} of ${crawlerData.total_links_found} internal links crawled.`)
    gap(2)
    h3('Recommendation:')
    body('Fix any broken links and ensure all pages have unique title tags and meta descriptions.')
  } else {
    body('No internal pages were crawled. Re-run the audit to crawl internal links.')
  }

  // Section 4 — Performance
  sectionNumber('4', 'PERFORMANCE AUDIT')

  const perfRows = [
    ['Performance Score', `${perfData.score ?? 'N/A'}/100`, '90+', perfData.score ? `${90 - (perfData.score || 0) > 0 ? '-' : '+'}${Math.abs(90 - (perfData.score || 0))}` : '—'],
    ['LCP', perfData.lcp || 'N/A', '<2.5s', ''],
    ['CLS', perfData.cls || 'N/A', '<0.1', ''],
    ['FCP', perfData.fcp || 'N/A', '<1.8s', ''],
    ['TTFB', perfData.ttfb || 'N/A', '<200ms', ''],
    ['Page Size', perfData.page_size_kb ? `${perfData.page_size_kb}KB` : 'N/A', '<1,000KB', perfData.page_size_kb > 1000 ? 'Over' : 'OK'],
  ]
  table(['Metric', 'Result', 'Benchmark', 'Gap'], perfRows, [55, 40, 40, 39])
  gap(3)

  if (perfIssues.length) {
    h3('Finding:')
    body(perfIssues[0].description)
    gap(2)
    h3('Impact:')
    body('Performance issues affect user experience and search engine rankings.')
    gap(2)
    h3('Recommendation:')
    body(perfIssues.map(i => i.recommendation).join(' '))
  }

  // Section 5 — Security
  sectionNumber('5', 'SECURITY AUDIT')

  const secRows = [
    ['HTTPS', secData.is_https ? 'Valid' : 'Not enabled', secData.is_https ? 'OK' : 'Critical'],
    ['HTTP → HTTPS Redirect', secData.http_redirects_to_https ? 'Yes' : 'No', secData.http_redirects_to_https ? 'OK' : 'Medium'],
    ['HSTS Header', secData.hsts ? 'Present' : 'Missing', secData.hsts ? 'OK' : 'Medium'],
    ['CSP Header', secData.csp ? 'Present' : 'Missing', secData.csp ? 'OK' : 'Medium'],
    ['X-Content-Type-Options', secData.x_content_type_options || 'Missing', secData.x_content_type_options ? 'OK' : 'Low'],
    ['Referrer-Policy', secData.referrer_policy || 'Missing', secData.referrer_policy ? 'OK' : 'Low'],
    ['X-Frame-Options', secData.x_frame_options || 'Missing', secData.x_frame_options ? 'OK' : 'Medium'],
    ['Server Header', secData.server_header ? `Exposes: ${secData.server_header}` : 'Not exposed', secData.server_header ? 'Low' : 'OK'],
  ]
  table(['Check', 'Result', 'Risk'], secRows, [80, 70, 24])
  gap(3)

  h3('Finding:')
  body(secData.is_https
    ? 'HTTPS is active. Key security hardening headers are missing.'
    : 'Site is not using HTTPS. This is a critical security issue.')
  gap(2)
  h3('Recommendation:')
  body('Implement security headers: Strict-Transport-Security, Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.')

  // Section 6 — SEO
  sectionNumber('6', 'SEO AUDIT')

  const seoRows = [
    ['Title', seoData.title ? `${seoData.title.substring(0, 45)}${seoData.title.length > 45 ? '...' : ''}` : 'Missing', seoData.title ? 'OK' : 'Critical'],
    ['Title Length', `${seoData.title_length || 0} chars`, (seoData.title_length >= 30 && seoData.title_length <= 60) ? 'OK' : 'Fix'],
    ['Meta Description', seoData.meta_desc_length ? `${seoData.meta_desc_length} chars` : 'Missing', (seoData.meta_desc_length >= 70 && seoData.meta_desc_length <= 160) ? 'OK' : 'Fix'],
    ['H1', `${seoData.h1_count || 0} found`, seoData.h1_count === 1 ? 'OK' : 'Fix'],
    ['Canonical', seoData.canonical ? 'Present' : 'Missing', seoData.canonical ? 'OK' : 'Medium'],
    ['OG Title', seoData.og_title ? 'Present' : 'Missing', seoData.og_title ? 'OK' : 'Medium'],
    ['OG Image', seoData.og_image ? 'Present' : 'Missing', seoData.og_image ? 'OK' : 'Medium'],
    ['Images without alt', `${seoData.images_without_alt || 0}`, seoData.images_without_alt === 0 ? 'OK' : `${seoData.images_without_alt} missing`],
    ['Structured Data', `${seoData.structured_data_count || 0} schema blocks`, seoData.structured_data_count > 0 ? 'OK' : 'Recommended'],
    ['Viewport Meta', seoData.viewport ? 'Present' : 'Missing', seoData.viewport ? 'OK' : 'High'],
  ]
  table(['Element', 'Finding', 'Impact'], seoRows, [60, 80, 34])

  // Section 7 — Accessibility
  sectionNumber('7', 'ACCESSIBILITY AUDIT')

  const a11yRows = [
    ['HTML lang attribute', a11yData.html_lang ? `lang="${a11yData.html_lang}"` : 'Missing', a11yData.html_lang ? 'OK' : 'High'],
    ['Images missing alt', `${a11yData.images_missing_alt || 0}`, a11yData.images_missing_alt === 0 ? 'OK' : 'Fail'],
    ['Inputs without labels', `${a11yData.inputs_without_label || 0}`, a11yData.inputs_without_label === 0 ? 'OK' : 'Fail'],
    ['Buttons without text', `${a11yData.empty_buttons || 0}`, a11yData.empty_buttons === 0 ? 'OK' : 'Fail'],
    ['Links without text', `${a11yData.empty_links || 0}`, a11yData.empty_links === 0 ? 'OK' : 'Fail'],
    ['Skip navigation', a11yData.has_skip_nav ? 'Present' : 'Missing', a11yData.has_skip_nav ? 'OK' : 'Recommended'],
    ['Heading order', 'Checked', 'See issues section'],
  ]
  table(['Check', 'Finding', 'Result'], a11yRows, [80, 60, 34])

  // Section 8 — Tech Stack (detailed)
  sectionNumber('8', 'TECH STACK ANALYSIS')

  const categories = ['framework', 'cms', 'ecommerce', 'analytics', 'marketing', 'hosting']
  const detectedTech = techData.stack || []
  const techDetailRows = categories
    .map(cat => {
      const found = detectedTech.filter((t: any) => t.category === cat).map((t: any) => t.name).join(', ')
      return [cat.charAt(0).toUpperCase() + cat.slice(1), found || 'None detected', found ? 'Detected' : '—']
    })
    .filter(row => row[1] !== 'None detected')

  if (techDetailRows.length) {
    table(['Category', 'Technology', 'Status'], techDetailRows, [50, 100, 24])
  } else {
    body('No specific technologies detected.')
  }

  // Section 9 — Recommended Improvements
  sectionNumber('9', 'RECOMMENDED IMPROVEMENTS')

  // Group by priority
  const priorities = [
    { label: 'Priority 1 — Critical Issues', severity: 'critical' as const },
    { label: 'Priority 2 — High Priority', severity: 'high' as const },
    { label: 'Priority 3 — Medium Priority', severity: 'medium' as const },
    { label: 'Priority 4 — Low Priority', severity: 'low' as const },
  ]

  priorities.forEach(p => {
    const pIssues = issues.filter(i => i.severity === p.severity)
    if (!pIssues.length) return

    checkPage(20)
    h3(`${p.label} (${pIssues.length} issues)`)

    pIssues.slice(0, 5).forEach(issue => {
      checkPage(18)
      label(`• ${issue.title} [${issue.category}]`, 4)
      y += 5
      body(`Problem: ${issue.description}`, 8)
      body(`Fix: ${issue.recommendation}`, 8)
      gap(2)
    })

    if (pIssues.length > 5) {
      body(`  ... and ${pIssues.length - 5} more ${p.severity} issues.`, 4)
    }
    gap(3)
  })

  // ── FOOTER ON EVERY PAGE ──────────────────────────────────────────
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.setDrawColor(226, 232, 240)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, 287, PAGE_W - MARGIN, 287)
    text(`Forensic Website Audit — ${hostname}  ·  Generated by KITA Systems  ·  ${new Date(audit.created_at).toLocaleDateString()}`, MARGIN, 291)
    text(`Page ${i} of ${totalPages}`, PAGE_W - MARGIN, 291, { align: 'right' })
  }

  // ── DOWNLOAD ──────────────────────────────────────────────────────
  const filename = `audit-${hostname.replace(/\./g, '-')}-${new Date(audit.created_at).toISOString().split('T')[0]}.pdf`
  doc.save(filename)
}
