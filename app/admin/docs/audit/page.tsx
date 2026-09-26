'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search, ChevronRight, ChevronDown, Zap, Shield,
  BarChart2, Layers, CheckCircle, Code2, Database,
  ArrowRight, AlertTriangle, Globe, BookOpen,
} from 'lucide-react'

interface DocSection {
  id: string
  title: string
  icon: React.ComponentType<any>
  content: React.ReactNode
}

export default function AuditDocsPage() {
  const [open, setOpen] = useState<string>('overview')
  const toggle = (id: string) => setOpen(prev => prev === id ? '' : id)

  const sections: DocSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            The <strong className="text-white">Website Intelligence & Audit Module</strong> is a standalone tool inside the KITA admin panel that performs a comprehensive analysis of any publicly accessible website. It checks performance, SEO, security headers, tech stack, and accessibility — all in one run.
          </p>
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-blue-400 font-semibold text-sm mb-3">What it audits</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-400">
              {[
                '⚡ Performance — Core Web Vitals via Google PSI (LCP, CLS, FCP, TTFB)',
                '🔍 SEO — Title, meta, headings, canonical, OG tags, alt text, robots',
                '🔒 Security — HTTPS, HSTS, CSP, X-Frame-Options, X-Content-Type-Options',
                '🧩 Tech Stack — Framework, CMS, analytics, hosting fingerprinting',
                '♿ Accessibility — Alt text, form labels, heading order, lang attribute',
                '🎯 Overall Score — Weighted average of all categories (0-100)',
              ].map(item => (
                <div key={item} className="flex gap-2"><span className="text-green-400">✓</span>{item}</div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-1">Access Point</p>
              <p className="text-white font-bold font-mono">/audit</p>
              <p className="text-gray-600 text-xs mt-1">Via admin sidebar → Website Audit</p>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-1">Build Phase</p>
              <p className="text-white font-bold">Phase 1 of 4</p>
              <p className="text-gray-600 text-xs mt-1">Single page audit — no crawler yet</p>
            </div>
          </div>
          <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-xl p-4">
            <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Setup Required</p>
            <p className="text-yellow-200/60 text-xs">
              Run <code className="font-mono text-yellow-300">supabase/audit.sql</code> in Supabase SQL Editor before using the audit module.
              This creates the <code className="font-mono text-yellow-300">audits</code> and <code className="font-mono text-yellow-300">audit_pages</code> tables.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'usage',
      title: 'How to Use',
      icon: ArrowRight,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { step: '1', title: 'Open the Audit Tool', desc: 'Click "Website Audit" in the admin sidebar, or go to /audit directly.' },
              { step: '2', title: 'Enter a URL', desc: 'Type or paste any publicly accessible URL (e.g. https://yourclients-salon.com.au). HTTP URLs are supported and automatically checked for HTTPS redirect.' },
              { step: '3', title: 'Click Run Audit', desc: 'The audit runs in the background. Takes 15-30 seconds — PSI analysis from Google is the slowest part.' },
              { step: '4', title: 'View the Dashboard', desc: 'You are redirected to the results page showing score rings, a full breakdown per category, and all issues sorted by severity.' },
              { step: '5', title: 'Share or Re-run', desc: 'Share the /audit/[id] URL with a client as a report. Click Re-run to refresh the audit for the same URL.' },
            ].map(item => (
              <div key={item.step} className="flex gap-4 bg-gray-950 border border-gray-800 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'scoring',
      title: 'Scoring System',
      icon: BarChart2,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Each analyzer returns a score from 0-100. The overall score is a weighted average:</p>
          <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Category</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Weight</th>
                  <th className="text-left text-gray-500 font-medium px-4 py-3 text-xs">Source</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: '⚡ Performance', weight: '30%', source: 'Google PageSpeed Insights API' },
                  { cat: '🔍 SEO', weight: '25%', source: 'HTML parsing via cheerio' },
                  { cat: '🔒 Security', weight: '20%', source: 'HTTP header inspection' },
                  { cat: '♿ Accessibility', weight: '15%', source: 'HTML parsing via cheerio' },
                  { cat: '🧩 Tech Stack', weight: '10%', source: 'HTML + header fingerprinting' },
                ].map(row => (
                  <tr key={row.cat} className="border-b border-gray-800 last:border-0">
                    <td className="px-4 py-3 text-white text-sm">{row.cat}</td>
                    <td className="px-4 py-3 text-blue-400 font-mono text-sm">{row.weight}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{row.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm font-medium mb-3">Score Ranges</p>
            <div className="space-y-2">
              {[
                { range: '80-100', label: 'Good', color: 'text-green-400', desc: 'Green — no major issues' },
                { range: '60-79', label: 'Needs Work', color: 'text-yellow-400', desc: 'Yellow — some improvements needed' },
                { range: '0-59', label: 'Poor', color: 'text-red-400', desc: 'Red — significant issues found' },
              ].map(s => (
                <div key={s.range} className="flex items-center gap-3">
                  <span className={`font-mono font-bold text-sm w-16 ${s.color}`}>{s.range}</span>
                  <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>
                  <span className="text-gray-600 text-xs">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm font-medium mb-3">Issue Severity Deductions (per issue)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { sev: 'Critical', color: 'text-red-400', perf: '-25 pts', seo: '-25 pts', sec: '-30 pts', a11y: '-25 pts' },
                { sev: 'High', color: 'text-orange-400', perf: '—', seo: '-15 pts', sec: '-20 pts', a11y: '-15 pts' },
                { sev: 'Medium', color: 'text-yellow-400', perf: '—', seo: '-8 pts', sec: '-10 pts', a11y: '-8 pts' },
                { sev: 'Low', color: 'text-blue-400', perf: '—', seo: '-3 pts', sec: '-5 pts', a11y: '-4 pts' },
              ].map(s => (
                <div key={s.sev} className={`bg-gray-900 rounded-lg p-2 ${s.color}`}>
                  <span className="font-semibold">{s.sev}</span>
                  <div className="text-gray-600 mt-0.5">SEO: {s.seo} · Sec: {s.sec}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'analyzers',
      title: 'Analyzers — Phase 1',
      icon: Code2,
      content: (
        <div className="space-y-4">
          {[
            {
              file: 'lib/audit/performance.ts',
              icon: '⚡',
              title: 'Performance Analyzer',
              desc: 'Calls Google PageSpeed Insights API (mobile strategy). Parses Core Web Vitals and generates issues.',
              checks: ['LCP (Largest Contentful Paint)', 'CLS (Cumulative Layout Shift)', 'FCP (First Contentful Paint)', 'TTFB (Time to First Byte)', 'TBT (Total Blocking Time)', 'Page weight in KB', 'Unused JavaScript/CSS', 'Render-blocking resources', 'Image optimization'],
              note: 'Requires public URL. Rate-limited without PAGESPEED_API_KEY env var.',
            },
            {
              file: 'lib/audit/seo.ts',
              icon: '🔍',
              title: 'SEO Analyzer',
              desc: 'Parses HTML with cheerio. Checks all standard on-page SEO signals.',
              checks: ['Title tag (length: 30-60 chars)', 'Meta description (length: 70-160 chars)', 'H1 count (exactly 1)', 'H2/H3 hierarchy', 'Canonical tag', 'Robots meta tag', 'OG title/description/image', 'Image alt attributes', 'Viewport meta tag', 'JSON-LD structured data'],
              note: 'Does not check backlinks or page speed — those are in performance analyzer.',
            },
            {
              file: 'lib/audit/security.ts',
              icon: '🔒',
              title: 'Security Analyzer',
              desc: 'Fetches HTTP headers (HEAD request). Checks all standard security headers.',
              checks: ['HTTPS enforcement', 'HTTP → HTTPS redirect', 'HSTS (Strict-Transport-Security)', 'X-Frame-Options (clickjacking)', 'X-Content-Type-Options (MIME sniff)', 'Content-Security-Policy (XSS)', 'Referrer-Policy', 'Permissions-Policy', 'Server header exposure'],
              note: 'Read-only — only sends HEAD/GET requests. Does not probe for vulnerabilities.',
            },
            {
              file: 'lib/audit/tech.ts',
              icon: '🧩',
              title: 'Tech Stack Detector',
              desc: 'Fingerprints technology from HTML content and HTTP response headers.',
              checks: ['Frameworks: Next.js, React, Vue, Angular, Nuxt, Gatsby, Svelte', 'CMS: WordPress, Drupal, Joomla, Ghost, Webflow, Squarespace, Wix', 'Ecommerce: Shopify, WooCommerce, Magento', 'Analytics: GA4, GTM, Hotjar, Plausible, Segment', 'Marketing: Intercom, HubSpot, Crisp, Tawk.to', 'Hosting: Cloudflare, Vercel, Netlify, Nginx, Apache', 'CSS: Tailwind, Bootstrap'],
              note: 'Detection is based on known patterns in HTML/headers. May miss custom implementations.',
            },
            {
              file: 'lib/audit/accessibility.ts',
              icon: '♿',
              title: 'Accessibility Analyzer',
              desc: 'Parses HTML with cheerio. Checks WCAG 2.1 Level A/AA basics.',
              checks: ['Images missing alt attributes', 'Form inputs without labels', 'Buttons without accessible text', 'Links without accessible text', 'Heading order (no skipped levels)', 'HTML lang attribute', 'Skip navigation link'],
              note: 'Basic checks only. Full WCAG compliance requires manual testing with assistive technologies.',
            },
          ].map(a => (
            <div key={a.file} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                <span className="text-lg">{a.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{a.title}</p>
                  <code className="text-gray-600 text-xs font-mono">{a.file}</code>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-sm mb-3">{a.desc}</p>
                <div className="grid sm:grid-cols-2 gap-1 mb-3">
                  {a.checks.map(c => (
                    <div key={c} className="flex gap-1.5 text-xs text-gray-500">
                      <span className="text-green-500 shrink-0">✓</span>{c}
                    </div>
                  ))}
                </div>
                <p className="text-gray-600 text-xs italic">{a.note}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'api',
      title: 'API Routes',
      icon: Globe,
      content: (
        <div className="space-y-3">
          {[
            { method: 'POST', path: '/api/audit', desc: 'Create a new audit. Runs all analyzers synchronously within maxDuration=60s. Returns id + scores on completion.', body: '{ "url": "https://example.com" }', response: '{ "id": "uuid", "status": "completed", "scores": { ... } }' },
            { method: 'GET', path: '/api/audit', desc: 'List recent audits (default: 20). Returns id, url, status, scores, created_at.', body: '—', response: '{ "audits": [ ... ] }' },
            { method: 'GET', path: '/api/audit/[id]', desc: 'Fetch full audit record including all scores, raw_data, and issues array.', body: '—', response: '{ "audit": { id, url, status, scores, raw_data, issues, created_at } }' },
            { method: 'POST', path: '/api/audit/[id]', desc: 'Re-run an existing audit for the same URL. Updates the existing record.', body: '—', response: '{ "id": "uuid", "status": "completed", "scores": { ... } }' },
          ].map(route => (
            <div key={route.path} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${route.method === 'POST' ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'}`}>{route.method}</span>
                <code className="text-white font-mono text-sm">{route.path}</code>
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-sm mb-2">{route.desc}</p>
                {route.body !== '—' && <pre className="bg-gray-900 rounded-lg p-2 text-xs text-green-300 font-mono mb-2">{route.body}</pre>}
                <pre className="bg-gray-900 rounded-lg p-2 text-xs text-blue-300 font-mono">{route.response}</pre>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'database',
      title: 'Database Schema',
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Run <code className="text-blue-300 font-mono">supabase/audit.sql</code> to create these tables.</p>
          {[
            {
              table: 'audits',
              color: 'text-blue-400',
              desc: 'One row per audit run',
              columns: [
                { name: 'id', type: 'uuid', note: 'Primary key' },
                { name: 'url', type: 'text', note: 'Normalized URL that was audited' },
                { name: 'status', type: 'text', note: 'queued | running | completed | failed' },
                { name: 'scores', type: 'jsonb', note: '{ performance, seo, security, accessibility, tech, overall }' },
                { name: 'raw_data', type: 'jsonb', note: 'Full data from all analyzers' },
                { name: 'issues', type: 'jsonb', note: 'Array of AuditIssue objects sorted by severity' },
                { name: 'created_at', type: 'timestamptz', note: 'Auto-set' },
              ],
            },
            {
              table: 'audit_pages',
              color: 'text-purple-400',
              desc: 'Crawler pages — Phase 2',
              columns: [
                { name: 'id', type: 'uuid', note: 'Primary key' },
                { name: 'audit_id', type: 'uuid', note: 'FK → audits.id (cascade delete)' },
                { name: 'url', type: 'text', note: 'Page URL crawled' },
                { name: 'status_code', type: 'integer', note: 'HTTP response code' },
                { name: 'title', type: 'text', note: 'Page title' },
                { name: 'meta_desc', type: 'text', note: 'Meta description' },
                { name: 'h1_count', type: 'integer', note: 'Number of H1 tags' },
              ],
            },
          ].map(t => (
            <div key={t.table} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <span className={`font-mono font-bold text-sm ${t.color}`}>{t.table}</span>
                <span className="text-gray-600 text-xs ml-2">{t.desc}</span>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {t.columns.map(col => (
                    <tr key={col.name} className="border-b border-gray-900 last:border-0">
                      <td className="px-4 py-2 font-mono text-white w-32">{col.name}</td>
                      <td className="px-4 py-2 text-blue-300 font-mono w-24">{col.type}</td>
                      <td className="px-4 py-2 text-gray-600">{col.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'roadmap',
      title: 'Roadmap — Phases 2-4',
      icon: ArrowRight,
      content: (
        <div className="space-y-4">
          {[
            {
              phase: 'Phase 2 — Crawler',
              color: 'border-green-800 bg-green-950/20',
              badge: '✅ COMPLETE',
              badgeColor: 'bg-green-900/50 text-green-400',
              items: [
                'Crawl up to 10 internal pages from the same domain ✅',
                'Populate audit_pages table with per-page SEO data ✅',
                'Pages tab in the audit dashboard ✅',
                'Broken link detection across all crawled pages ✅',
                'Duplicate title/meta detection across pages ✅',
                'History search + delete + score trend comparison ✅',
              ],
            },
            {
              phase: 'Phase 3 — PDF Report',
              color: 'border-green-800 bg-green-950/20',
              badge: '✅ COMPLETE',
              badgeColor: 'bg-green-900/50 text-green-400',
              items: [
                'Download PDF button on audit results page ✅',
                'PDF structure matches Forensic Website Audit Report format ✅',
                'Sections: Executive Summary, Tech Forensics, Crawl Audit, Performance, Security, SEO, Accessibility, Tech Stack, Recommendations ✅',
                'Score badges per category in header ✅',
                'Tables: tech stack, crawled pages, performance metrics, security headers, SEO checks, accessibility checks ✅',
                'Priority-grouped recommendations with Problem + Fix per issue ✅',
                'Footer with URL, KITA Systems brand, date, page numbers ✅',
                'Dynamic import of jsPDF (client-side only, no server needed) ✅',
                'Filename: audit-{hostname}-{date}.pdf ✅',
              ],
            },
            {
              phase: 'Phase 3 Backlog — Branded PDF Design Update',
              color: 'border-blue-800 bg-blue-950/20',
              badge: 'BACKLOG',
              badgeColor: 'bg-gray-800 text-gray-500',
              items: [
                'Current PDF uses basic black/white typography format (Forensic Report style)',
                'Future: Redesign with KITA Systems or white-label agency branding',
                'Add KITA logo / agency logo to PDF header and cover page',
                'Color-coded score sections matching the web UI (green/yellow/red)',
                'Executive summary page with large score rings visual',
                'KITA brand colors: primary #1A1A2E, blue #0F6DFF',
                'Optional client cover page with their business name + audit date',
                'Shareable PDF link — store in Supabase Storage and email to client',
              ],
            },
            {
              phase: 'Phase 4 — Scheduled Audits',
              color: 'border-purple-800 bg-purple-950/20',
              badge: 'FUTURE',
              badgeColor: 'bg-gray-800 text-gray-500',
              items: [
                'Schedule weekly/monthly re-audits for tracked URLs',
                'Score history chart — see progress over time',
                'Email alert when score drops below threshold',
                'Requires Vercel Cron Jobs (free on Hobby plan)',
              ],
            },
            {
              phase: 'Phase 5 — Client-Facing Audit Frontend (Backlog)',
              color: 'border-gray-700 bg-gray-900/30',
              badge: 'BACKLOG',
              badgeColor: 'bg-gray-800 text-gray-500',
              items: [
                'Current /audit pages use the admin dark theme — admin access only',
                'Build a separate public-facing white/light theme for client reports',
                'Shareable audit report URL — clients can view their own site audit',
                'Branded with client site colors or white-label agency branding',
                'Clean executive summary at the top — score rings, key issues, quick wins',
                'Remove raw JSON tab and internal admin controls from client view',
                'Optional password protection for client report URLs',
                'Route: /audit/report/[id] — separate from admin /audit/[id]',
              ],
            },
          ].map(phase => (
            <div key={phase.phase} className={`border rounded-xl p-5 ${phase.color}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-semibold text-sm">{phase.phase}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${phase.badgeColor}`}>{phase.badge}</span>
              </div>
              <div className="space-y-1.5">
                {phase.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-gray-600">○</span>
                    <span className="text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'integration',
      title: 'Integration with KITA Sites',
      icon: Layers,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            The audit module is built modularly so it can be integrated into KITA client sites in the future.
          </p>
          <div className="space-y-3">
            {[
              {
                title: 'Sell audits as a service',
                desc: 'Add an "Audit My Site" button to the pitch page — potential clients enter their URL, see their score, and that becomes your sales pitch. A bad score = they need your help.',
              },
              {
                title: 'Include audit in client onboarding',
                desc: 'When a client pays $150 and their site is generated, auto-run an audit and email them the results. Justifies the $29/mo maintenance fee.',
              },
              {
                title: 'Monthly audit report as a retention tool',
                desc: 'Phase 4 scheduled audits can be emailed to clients monthly showing their score over time. This is the "we\'re keeping your site healthy" value prop.',
              },
              {
                title: 'Audit competitor sites',
                desc: 'Before a sales call, audit the prospect\'s current website. Walk them through the issues in the call. Instant credibility.',
              },
            ].map(item => (
              <div key={item.title} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                <p className="text-white text-sm font-semibold mb-1">{item.title}</p>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin/docs" className="text-gray-600 hover:text-gray-400 text-xs transition">← Main Docs</Link>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="text-blue-400" size={24} />
          Website Intelligence & Audit Module
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Full documentation for the audit tool — analyzers, scoring, API, database, and roadmap.
        </p>
        <div className="flex gap-2 mt-3">
          <Link href="/audit" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
            <Search size={12} /> Open Audit Tool
          </Link>
          <span className="text-xs px-2 py-1.5 rounded-lg bg-green-900/50 text-green-400 font-medium">Phase 1 Complete</span>
          <span className="text-xs px-2 py-1.5 rounded-lg bg-green-900/50 text-green-400 font-medium">Phase 2 Complete</span>
        </div>
      </div>

      <div className="space-y-2">
        {sections.map(section => {
          const Icon = section.icon
          const isOpen = open === section.id
          return (
            <div key={section.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(section.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-800/50 transition"
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-gray-400" />
                  <span className="text-white font-medium text-sm">{section.title}</span>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-800 pt-4">
                  {section.content}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-gray-700 text-xs text-center mt-8">
        KITA Builder Systems — Audit Module v1 · Phase 1 of 4
      </p>
    </div>
  )
}
