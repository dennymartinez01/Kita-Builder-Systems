import Link from 'next/link'

// Audit Pitch Page — shareable link for selling the Website Audit service
// URL: /audit-pitch

const AUDIT_CHECKS = [
  { icon: '⚡', category: 'Performance', desc: 'Core Web Vitals via Google PageSpeed — LCP, CLS, FCP, TTFB, page size, unused JS/CSS' },
  { icon: '🔍', category: 'SEO', desc: 'Title, meta description, H1/H2 hierarchy, canonical, OG tags, alt text, robots, structured data' },
  { icon: '🔒', category: 'Security', desc: 'HTTPS, HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, server header exposure' },
  { icon: '🧩', category: 'Tech Stack', desc: 'Framework, CMS, ecommerce platform, analytics tools, marketing pixels, hosting provider' },
  { icon: '♿', category: 'Accessibility', desc: 'Image alt text, form labels, button ARIA, heading order, lang attribute, skip navigation' },
  { icon: '🕷️', category: 'Page Crawler', desc: 'Crawls up to 10 internal pages — broken links, duplicate titles, noindex pages, missing metas' },
]

const REPORT_SECTIONS = [
  'Executive Summary — overall score + major issues per category',
  'Technical Forensics — full tech stack table',
  'Crawl Audit — every page crawled with status + issues',
  'Performance Audit — metrics vs benchmarks with gaps',
  'Security Audit — all headers checked with risk levels',
  'SEO Audit — every on-page element checked',
  'Accessibility Audit — WCAG 2.1 basic compliance',
  'Recommended Improvements — prioritized by Critical → Low',
]

const USE_CASES = [
  {
    icon: '🎯',
    title: 'Pre-sales audit',
    desc: "Audit a prospect's current site before a sales call. Walk them through the issues. Instant credibility — you know more about their site than they do.",
  },
  {
    icon: '💼',
    title: 'Client onboarding',
    desc: "When a client signs up, run a free audit of their existing site. Show them exactly what you're fixing and why your work is worth the investment.",
  },
  {
    icon: '📊',
    title: 'Monthly retainer justification',
    desc: "Run a monthly audit for each client and email them the PDF. 'We improved your SEO score from 62 to 84 this month' is a retention tool.",
  },
  {
    icon: '🏆',
    title: 'Competitor analysis',
    desc: "Audit your client's top 3 competitors. Show the score gap. Now they understand why they're losing — and who can close it.",
  },
]

export default function AuditPitchPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">K</span>
          </div>
          <div>
            <span className="font-bold text-gray-900">KITA Systems</span>
            <span className="text-gray-400 mx-2">·</span>
            <span className="text-gray-600 text-sm">Website Audit</span>
          </div>
        </div>
        <Link
          href="/audit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-full transition"
        >
          Run Free Audit →
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="px-5 py-20 sm:py-28 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          🔍 Free Website Intelligence Tool
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-5">
          Know Exactly What's Wrong<br />
          <span className="text-blue-600">With Any Website.</span>
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          Enter any URL and get a full forensic audit in 30 seconds — performance, SEO, security, accessibility, tech stack, and a crawl of all internal pages. Delivered as a PDF report.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/audit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-sm transition"
          >
            Run a Free Audit Now →
          </Link>
          <a
            href="#what-we-check"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-8 py-4 rounded-xl text-sm transition"
          >
            See What We Check
          </a>
        </div>
        <p className="text-gray-400 text-xs mt-4">No account needed · Results in ~30 seconds · Free PDF download</p>
      </section>

      {/* ── SAMPLE SCORES ── */}
      <section className="bg-gray-900 py-10 px-5">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500 text-xs text-center uppercase tracking-wider mb-6">Sample Audit Score Card</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: 'Overall', score: 62, },
              { label: 'Performance', score: 52 },
              { label: 'SEO', score: 68 },
              { label: 'Security', score: 55 },
              { label: 'A11y', score: 71 },
              { label: 'Tech', score: 80 },
            ].map(s => {
              const color = s.score >= 80 ? '#4ade80' : s.score >= 60 ? '#facc15' : '#f87171'
              return (
                <div key={s.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black mb-1" style={{ color }}>{s.score}</div>
                  <div className="text-gray-500 text-xs">{s.label}</div>
                </div>
              )
            })}
          </div>
          <p className="text-gray-600 text-xs text-center mt-4">
            Score 0-100 per category · Green (80+) · Yellow (60-79) · Red (under 60)
          </p>
        </div>
      </section>

      {/* ── WHAT WE CHECK ── */}
      <section id="what-we-check" className="py-16 sm:py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            6 Categories. 50+ Checks.
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            One audit covers everything a web agency, SEO consultant, or developer needs to diagnose a website.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUDIT_CHECKS.map(check => (
              <div key={check.category} className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <div className="text-3xl mb-3">{check.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{check.category}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{check.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PDF REPORT ── */}
      <section className="py-16 sm:py-20 px-5 bg-gray-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              📄 PDF Report Included
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Download a Professional Forensic Report
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Every audit generates a multi-page PDF report you can hand directly to a client or present in a proposal. No editing, no design work — just click Download.
            </p>
            <ul className="space-y-2">
              {REPORT_SECTIONS.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="text-green-500 font-bold shrink-0 mt-0.5">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {/* Mock PDF preview */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
            <div className="bg-gray-900 text-white rounded-xl p-4 mb-4">
              <p className="text-xs text-gray-400 mb-1">FORENSIC WEBSITE AUDIT REPORT</p>
              <p className="font-bold text-sm">example-business.com.au</p>
              <div className="flex gap-2 mt-3">
                {[['Overall', 62, '#f87171'], ['Perf', 52, '#f87171'], ['SEO', 68, '#facc15'], ['Sec', 55, '#f87171']].map(([l, s, c]) => (
                  <div key={l as string} className="text-center">
                    <div className="text-sm font-black" style={{ color: c as string }}>{s as number}</div>
                    <div className="text-gray-500 text-[9px]">{l as string}</div>
                  </div>
                ))}
              </div>
            </div>
            {[
              '1. Executive Summary',
              '2. Tech Forensics',
              '3. Crawl Audit (10 pages)',
              '4. Performance Audit',
              '5. Security Audit',
              '6. SEO Audit',
              '7. Accessibility Audit',
              '8. Recommendations',
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
                <span className="text-gray-400 text-xs w-4">{i + 1}.</span>
                <span className="text-gray-700 text-xs">{s.split('. ')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ── */}
      <section className="py-16 sm:py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            How to Use It
          </h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">
            Built for web agencies, freelancers, and developers who want to deliver more value to clients.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {USE_CASES.map(u => (
              <div key={u.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
                <div className="text-3xl mb-3">{u.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{u.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-20 px-5 bg-gray-900 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Run Your First Audit Free
          </h2>
          <p className="text-gray-400 mb-8">
            Enter any URL — your own site, a client's site, or a competitor. Get scores, issues, and a full PDF report in ~30 seconds.
          </p>
          <Link
            href="/audit"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-xl text-sm transition"
          >
            Start Free Audit →
          </Link>
          <p className="text-gray-600 text-xs mt-4">
            No account required · Free · Results in ~30 seconds
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-5 border-t border-gray-100 text-center">
        <p className="text-gray-400 text-sm">
          <strong className="text-gray-900">KITA Systems</strong> · Website Intelligence & Audit Tool
        </p>
        <p className="text-gray-400 text-xs mt-1">Part of the KITA Builder Systems platform</p>
        <div className="flex justify-center gap-4 mt-3 text-xs">
          <Link href="/pitch" className="text-gray-400 hover:text-gray-600 transition">KITA Builder</Link>
          <Link href="/audit" className="text-gray-400 hover:text-gray-600 transition">Run Audit</Link>
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition">Admin</Link>
        </div>
      </footer>
    </div>
  )
}
