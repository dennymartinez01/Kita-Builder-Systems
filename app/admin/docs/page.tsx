'use client'

import React, { useState } from 'react'
import { BookOpen, ChevronRight, ChevronDown, Database, Zap, Globe, Mail, Key, Code2, Calendar, Layers, ArrowRight, CheckSquare, Lightbulb, ListTodo, Search, Shield, Users, GitCommit, BadgeDollarSign } from 'lucide-react'

interface DocSection {
  id: string
  title: string
  icon: React.ComponentType<any>
  content: React.ReactNode
}

export default function DocsPage() {
  const [open, setOpen] = useState<string>('overview')

  function toggle(id: string) {
    setOpen(prev => prev === id ? '' : id)
  }

  const sections: DocSection[] = [
    {
      id: 'overview',
      title: 'Project Overview',
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-white">KITA Builder Systems</strong> is a two-product platform built for web agencies, freelancers, and developers serving local service businesses across AU, US, UK, PH, and CAN.
          </p>
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-white">Product 1 — AI Website Builder:</strong> Generates a fully-functional booking website in ~10 seconds from a business name and location. Includes a 10-tab owner CMS, AI assistant for live edits, analytics, gallery, reviews, and a Stripe payment flow.
          </p>
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-white">Product 2 — Website Intelligence & Audit:</strong> Forensic website audit tool — enter any URL to get scores + issues + PDF report covering Performance, SEO, Security, Tech Stack, Accessibility, and a 10-page internal crawler.
          </p>

          {/* Product 1 value props */}
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
            <p className="text-blue-400 font-semibold text-sm mb-3">⚡ Product 1 — AI Website Builder</p>
            <div className="space-y-1.5 text-sm text-gray-400">
              {[
                'AI generates copy, services, staff tailored to business type + location in ~10 seconds',
                'Live booking widget — customers book 24/7, owner gets instant email notification',
                'Owner dashboard with PIN — 10 tabs: Bookings, Services, Staff, Hours, About, Reviews, Gallery, Analytics, Settings, AI Assistant',
                'AI Assistant — chat to edit live site: "change my haircut to $80" updates instantly',
                'Preferred staff picker — customers choose their preferred team member',
                'Custom notes labels per template — "Your Concern" for clinics, "Guests + Notes" for cafes',
                'Site analytics — 14-day page view chart, weekly trends, booking status breakdown',
                'Gallery — multi-photo upload, "Our Work" grid on public site',
                'White-label mode — remove KITA branding, use your agency name and logo',
                '11 templates across 5 business types: Salon, Clinic, Pet, Cafe, Mechanic',
                'Stripe payment flow — $150 setup fee via Checkout, payment_status tracked per site',
                'Deployed on Vercel — live at kita-builder-systems.vercel.app',
              ].map((item, i) => (
                <div key={i} className="flex gap-2"><span className="text-green-400">✓</span>{item}</div>
              ))}
            </div>
          </div>

          {/* Product 2 value props */}
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
            <p className="text-purple-400 font-semibold text-sm mb-3">🔍 Product 2 — Website Intelligence & Audit</p>
            <div className="space-y-1.5 text-sm text-gray-400">
              {[
                'Forensic audit: Performance (PSI), SEO, Security headers, Tech Stack, Accessibility',
                'Page crawler — crawls up to 10 internal pages, detects broken links + duplicate titles',
                'Score rings per category (0-100) + weighted overall score',
                'Issue explorer — filter by severity (critical/high/medium/low) + category',
                'PDF report download — Forensic Website Audit Report format, multi-page',
                'Audit history — search, delete, score trend comparison (↑↓—)',
                'Audit pitch page at /audit-pitch — shareable outreach link for selling audit services',
                'Dark admin theme — integrated into the admin panel',
              ].map((item, i) => (
                <div key={i} className="flex gap-2"><span className="text-green-400">✓</span>{item}</div>
              ))}
            </div>
          </div>

          {/* Roadmap preview */}
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
            <p className="text-yellow-400 font-semibold text-sm mb-3">🗺️ Upcoming Phases</p>
            <div className="space-y-1.5 text-sm text-gray-400">
              {[
                'Phase 5 — Service selector + currency picker on generate form ✅',
                'Phase 6 — Smart Booking System ✅',
                'Phase 7 — Admin Power Tools: calendar view, peak analytics, promo codes',
                'Phase 8 — Growth: Stripe subscriptions, deposits, WhatsApp booking, Google Calendar',
              ].map((item, i) => (
                <div key={i} className="flex gap-2"><span className="text-yellow-400">→</span>{item}</div>
              ))}
            </div>
          </div>

          {/* Commercial pitch box */}
          <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-800">
            <p className="text-blue-400 font-semibold text-sm mb-2">💼 The Pitch</p>
            <p className="text-gray-300 text-sm leading-relaxed italic">
              "Your customers can book you 24/7 — even while you sleep. AI builds your site in 10 seconds, your clients manage everything themselves, and you get notified every time someone books. $150 to launch. $29/month to keep it running. That's less than one booking to pay for itself."
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Revenue Model', value: '$150 setup + $29/mo', sub: 'per client site' },
              { label: 'Target Market', value: 'AU / US / UK / PH / CAN', sub: 'local service businesses' },
              { label: 'Live URL', value: 'Vercel', sub: 'kita-builder-systems.vercel.app' },
              { label: 'AI Engine', value: 'Gemini 3.6 Flash', sub: 'free tier · AQ. key format' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                <p className="text-white font-bold text-sm">{stat.value}</p>
                <p className="text-gray-600 text-xs mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'stack',
      title: 'Tech Stack',
      icon: Code2,
      content: (
        <div className="space-y-3">
          {[
            { layer: 'Framework', tech: 'Next.js 16 (App Router + TypeScript)', note: 'Full-stack React, server components, API routes' },
            { layer: 'Styling', tech: 'Tailwind CSS v4', note: 'Utility-first, no extra config needed' },
            { layer: 'Database', tech: 'Supabase (Postgres + RLS + Storage)', note: 'Cloud hosted, free tier sufficient for MVP' },
            { layer: 'AI Generation', tech: 'Gemini 3.6 Flash (Google AI)', note: 'Free tier, AQ. auth key format, ~500 generations/day' },
            { layer: 'HTML Parsing', tech: 'cheerio', note: 'SEO + accessibility audit analyzers' },
            { layer: 'PDF Generation', tech: 'jsPDF', note: 'Client-side PDF reports, no server needed' },
            { layer: 'Payments', tech: 'Stripe', note: '$150 setup fee, test mode active' },
            { layer: 'Email', tech: 'Resend', note: 'Booking notification emails, free 100/day' },
            { layer: 'Hosting', tech: 'Vercel', note: 'Live at kita-builder-systems.vercel.app' },
            { layer: 'Icons', tech: 'Lucide React', note: 'Consistent icon set throughout admin' },
          ].map(row => (
            <div key={row.layer} className="flex gap-4 bg-gray-950 border border-gray-800 rounded-xl p-4">
              <div className="w-28 shrink-0">
                <span className="text-gray-500 text-xs font-medium">{row.layer}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{row.tech}</p>
                <p className="text-gray-600 text-xs mt-0.5">{row.note}</p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'folder',
      title: 'Folder Structure',
      icon: Layers,
      content: (
        <div>
          <p className="text-gray-400 text-sm mb-4">All source files live inside <code className="text-blue-300 font-mono">kita-builder/</code></p>
          <pre className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs text-gray-400 font-mono leading-6 overflow-x-auto">{`kita-builder/
├── app/
│   ├── admin/                  ← Your internal CMS (PIN protected)
│   │   ├── layout.tsx          ← Sidebar + PIN auth + logo loader
│   │   ├── page.tsx            ← Dashboard + live stats
│   │   ├── credentials/        ← API keys reference + .env template
│   │   ├── generate/           ← AI site generator form
│   │   ├── revenue/            ← MRR tracker + CSV export
│   │   ├── sites/              ← All generated sites + payment status
│   │   ├── templates/          ← 11-template marketplace grid
│   │   ├── settings/           ← Logo, PIN, white-label, email config
│   │   └── docs/               ← Documentation (this page)
│   │       └── audit/          ← Audit module docs
│   ├── api/
│   │   ├── agent/route.ts      ← AI chat agent (9 tools)
│   │   ├── audit/route.ts      ← Audit create/list/delete
│   │   ├── audit/[id]/route.ts ← Audit fetch/re-run
│   │   ├── checkout/route.ts   ← Stripe Checkout session
│   │   ├── generate/route.ts   ← Gemini AI site generation
│   │   ├── notify/route.ts     ← Save booking + Resend email
│   │   ├── track/route.ts      ← Page view analytics
│   │   ├── upload-logo/route.ts← Image upload to Supabase Storage
│   │   └── webhook/route.ts    ← Stripe webhook handler
│   ├── audit/                  ← Website Audit tool (dark admin theme)
│   │   ├── layout.tsx          ← Audit layout with top bar
│   │   ├── page.tsx            ← URL input + audit history
│   │   └── [id]/page.tsx       ← Full results dashboard + PDF download
│   ├── audit-pitch/page.tsx    ← Audit pitch/outreach page
│   ├── [slug]/
│   │   ├── page.tsx            ← Public client site (white-label aware)
│   │   └── dashboard/page.tsx  ← Owner CMS (10 tabs, PIN protected)
│   ├── onboard/
│   │   ├── page.tsx            ← $150 client payment page
│   │   └── success/page.tsx    ← Post-payment site polling
│   ├── pitch/page.tsx          ← KITA Builder outreach pitch
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AgentChat.tsx           ← AI chat widget (owner dashboard)
│   ├── BookingForm.tsx         ← Customer booking form
│   └── PageTracker.tsx         ← Non-blocking page view tracker
├── lib/
│   ├── supabase.ts             ← Supabase client (server + anon)
│   ├── stripe.ts               ← Stripe client (server-only)
│   ├── pricing.ts              ← Client-safe pricing constants
│   ├── whitelabel.ts           ← White-label config helpers
│   ├── templates/              ← 11 template variants
│   │   ├── index.ts, registry.ts
│   │   └── salon/clinic/pet/cafe/mechanic.ts
│   └── audit/                  ← Audit analyzers
│       ├── types.ts, index.ts, crawler.ts, pdf.ts
│       └── performance/seo/security/tech/accessibility.ts
├── supabase/
│   ├── schema.sql              ← sites, services, staff, bookings
│   ├── storage.sql             ← kita-assets storage bucket
│   ├── payments.sql            ← payment_status, stripe columns
│   ├── analytics.sql           ← page_views table
│   ├── audit.sql               ← audits + audit_pages tables
│   ├── staff-booking.sql       ← staff_id + staff_name on bookings
│   ├── clients.sql             ← clients table (Phase 9)
│   └── leads.sql               ← leads table (Phase 10 — planned)
├── types/
│   └── database.ts             ← TypeScript types for all DB tables
└── .env.local                  ← API keys (never commit)`}</pre>
        </div>
      ),
    },
    {
      id: 'database',
      title: 'Database Schema',
      icon: Database,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">6 tables + 1 storage bucket. All have Row Level Security enabled. Run SQL files in order listed.</p>
          {[
            {
              table: 'sites',
              color: 'text-blue-400',
              desc: 'One row per generated client website',
              columns: [
                { name: 'id', type: 'uuid', note: 'Primary key, auto-generated' },
                { name: 'slug', type: 'text', note: 'URL-safe identifier e.g. jims-auto-k3x9' },
                { name: 'business_name', type: 'text', note: 'e.g. "Jim\'s Auto Repair"' },
                { name: 'business_type', type: 'text', note: 'salon | clinic | pet | cafe | mechanic' },
                { name: 'owner_email', type: 'text', note: 'Booking notification destination' },
                { name: 'owner_pin', type: 'text', note: 'PIN for owner dashboard login' },
                { name: 'theme_json', type: 'jsonb', note: 'Full site structure — sections, colors, copy, hours, gallery, logo_url' },
                { name: 'published', type: 'bool', note: 'Controls whether public site is visible' },
                { name: 'payment_status', type: 'text', note: 'paid | free | unpaid' },
                { name: 'stripe_session_id', type: 'text', note: 'Stripe Checkout session ID' },
                { name: 'stripe_customer_id', type: 'text', note: 'Stripe customer ID' },
                { name: 'paid_at', type: 'timestamptz', note: 'When payment was confirmed' },
              ],
            },
            {
              table: 'services',
              color: 'text-green-400',
              desc: 'Services offered by a business',
              columns: [
                { name: 'site_id', type: 'uuid', note: 'FK → sites.id (cascade delete)' },
                { name: 'name', type: 'text', note: 'e.g. "Oil Change"' },
                { name: 'price', type: 'numeric', note: 'In local currency' },
                { name: 'duration_minutes', type: 'int', note: 'Used in booking widget display' },
              ],
            },
            {
              table: 'staff',
              color: 'text-purple-400',
              desc: 'Team members shown on public site',
              columns: [
                { name: 'site_id', type: 'uuid', note: 'FK → sites.id (cascade delete)' },
                { name: 'name', type: 'text', note: 'e.g. "Jim Reyes"' },
                { name: 'role', type: 'text', note: 'e.g. "Head Mechanic"' },
                { name: 'avatar_url', type: 'text', note: 'Optional photo URL' },
              ],
            },
            {
              table: 'bookings',
              color: 'text-yellow-400',
              desc: 'Customer appointments',
              columns: [
                { name: 'site_id', type: 'uuid', note: 'FK → sites.id' },
                { name: 'service_id', type: 'uuid', note: 'FK → services.id (nullable)' },
                { name: 'customer_name', type: 'text', note: '' },
                { name: 'customer_phone', type: 'text', note: '' },
                { name: 'service_name', type: 'text', note: 'Denormalized for display' },
                { name: 'booking_date', type: 'date', note: '' },
                { name: 'booking_time', type: 'text', note: 'HH:MM format' },
                { name: 'car_model', type: 'text', note: 'Mechanic only — nullable' },
                { name: 'pet_name', type: 'text', note: 'Pet clinic only — nullable' },
                { name: 'staff_id', type: 'uuid', note: 'FK → staff.id (nullable) — preferred staff' },
                { name: 'staff_name', type: 'text', note: 'Denormalized staff name for display' },
                { name: 'status', type: 'text', note: 'pending | confirmed | cancelled' },
              ],
            },
            {
              table: 'page_views',
              color: 'text-blue-300',
              desc: 'Analytics — tracks visits to client sites',
              columns: [
                { name: 'site_id', type: 'uuid', note: 'FK → sites.id (cascade delete)' },
                { name: 'viewed_at', type: 'timestamptz', note: 'When the visit occurred' },
                { name: 'path', type: 'text', note: 'URL path visited' },
              ],
            },
            {
              table: 'audits',
              color: 'text-red-400',
              desc: 'Website audit runs',
              columns: [
                { name: 'url', type: 'text', note: 'Normalized URL audited' },
                { name: 'status', type: 'text', note: 'queued | running | completed | failed' },
                { name: 'scores', type: 'jsonb', note: '{ performance, seo, security, accessibility, tech, overall }' },
                { name: 'raw_data', type: 'jsonb', note: 'Full data from all analyzers' },
                { name: 'issues', type: 'jsonb', note: 'Array of AuditIssue objects sorted by severity' },
              ],
            },
            {
              table: 'leads',
              color: 'text-pink-400',
              desc: 'Contact form inquiries + opted-in booking customers (Phase 10)',
              columns: [
                { name: 'id', type: 'uuid', note: 'Primary key' },
                { name: 'site_id', type: 'uuid', note: 'FK → sites.id (cascade delete)' },
                { name: 'name', type: 'text', note: 'Customer name' },
                { name: 'email', type: 'text', note: 'Primary contact for follow-up and promotions' },
                { name: 'phone', type: 'text', note: 'Optional — captured if provided' },
                { name: 'message', type: 'text', note: 'Free-text inquiry message' },
                { name: 'source', type: 'text', note: 'contact_form | booking | audit_inquiry' },
                { name: 'status', type: 'text', note: 'new | contacted | converted | closed' },
                { name: 'opt_in', type: 'bool', note: 'Consented to promotions — default false' },
                { name: 'city', type: 'text', note: 'Copied from site at capture — geo-segmentation' },
                { name: 'business_type', type: 'text', note: 'Copied from site — interest-based segmentation' },
                { name: 'created_at', type: 'timestamptz', note: 'Auto-set on creation' },
              ],
            },
          ].map(t => (
            <div key={t.table} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                <span className={`font-mono font-bold text-sm ${t.color}`}>{t.table}</span>
                <span className="text-gray-600 text-xs">{t.desc}</span>
              </div>
              <table className="w-full text-xs">
                <tbody>
                  {t.columns.map(col => (
                    <tr key={col.name} className="border-b border-gray-900 last:border-0">
                      <td className="px-4 py-2 font-mono text-white w-36">{col.name}</td>
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
      id: 'workflow',
      title: 'Full Workflow',
      icon: ArrowRight,
      content: (
        <div className="space-y-6">
          {[
            {
              label: 'Workflow A — Site Generation',
              color: 'border-blue-800 bg-blue-950/20',
              labelColor: 'text-blue-400',
              steps: [
                { actor: 'You (Admin)', action: 'Fill form at /admin/generate — business name, type, location' },
                { actor: 'Next.js', action: 'POST /api/generate with form data' },
                { actor: 'Claude AI', action: 'Returns JSON: headline, sub, about, services, staff, testimonials' },
                { actor: 'API Route', action: 'Merges AI copy into base template → builds full theme_json' },
                { actor: 'Supabase', action: 'Inserts into sites, services, staff tables' },
                { actor: 'Browser', action: 'Redirects you to /{slug} — site is live immediately' },
              ],
            },
            {
              label: 'Workflow B — Customer Booking',
              color: 'border-green-800 bg-green-950/20',
              labelColor: 'text-green-400',
              steps: [
                { actor: 'Customer', action: 'Visits /{slug}, fills booking form (name, phone, service, date/time)' },
                { actor: 'BookingForm.tsx', action: 'POST /api/notify with booking data' },
                { actor: 'API Route', action: 'Saves booking to Supabase bookings table (status: confirmed)' },
                { actor: 'Resend', action: 'Sends email to owner_email with full booking details' },
                { actor: 'Customer', action: 'Sees confirmation message on page' },
                { actor: 'Owner', action: 'Sees new booking in /{slug}/dashboard' },
              ],
            },
            {
              label: 'Workflow C — Owner CMS',
              color: 'border-purple-800 bg-purple-950/20',
              labelColor: 'text-purple-400',
              steps: [
                { actor: 'Owner', action: 'Goes to /{slug}/dashboard, enters PIN' },
                { actor: 'Dashboard', action: 'Loads all services and bookings from Supabase' },
                { actor: 'Owner', action: 'Edits service name/price — saves instantly via Supabase update' },
                { actor: 'Owner', action: 'Confirms or cancels bookings with one click' },
                { actor: 'Public Site', action: 'Reflects changes immediately — no redeploy needed' },
              ],
            },
          ].map(wf => (
            <div key={wf.label} className={`border rounded-xl p-4 ${wf.color}`}>
              <p className={`font-semibold text-sm mb-3 ${wf.labelColor}`}>{wf.label}</p>
              <div className="space-y-2">
                {wf.steps.map((step, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-gray-600 w-5 text-right shrink-0">{i + 1}.</span>
                    <span className="text-gray-500 w-28 shrink-0">{step.actor}</span>
                    <span className="text-gray-300">{step.action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'api',
      title: 'API Routes',
      icon: Zap,
      content: (
        <div className="space-y-4">
          {[
            { method: 'POST', path: '/api/generate', color: 'bg-green-900/50 text-green-300', desc: 'Generates a full site using Gemini AI and saves to Supabase' },
            { method: 'POST', path: '/api/notify', color: 'bg-green-900/50 text-green-300', desc: 'Saves a customer booking and sends Resend email notification' },
            { method: 'POST', path: '/api/agent', color: 'bg-green-900/50 text-green-300', desc: 'AI chat agent — 9 tools for editing site content via natural language' },
            { method: 'POST', path: '/api/checkout', color: 'bg-green-900/50 text-green-300', desc: 'Creates a Stripe Checkout session for $150 setup fee' },
            { method: 'POST', path: '/api/webhook', color: 'bg-green-900/50 text-green-300', desc: 'Stripe webhook — handles payment.completed, auto-generates site' },
            { method: 'POST', path: '/api/upload-logo', color: 'bg-green-900/50 text-green-300', desc: 'Uploads an image to Supabase Storage kita-assets bucket' },
            { method: 'POST', path: '/api/track', color: 'bg-green-900/50 text-green-300', desc: 'Records a page view for site analytics (non-blocking)' },
            { method: 'POST', path: '/api/audit', color: 'bg-purple-900/50 text-purple-300', desc: 'Runs a full website audit — Performance, SEO, Security, Tech, Accessibility + Crawler' },
            { method: 'GET', path: '/api/audit', color: 'bg-blue-900/50 text-blue-300', desc: 'Lists recent audits with optional ?search= filter' },
            { method: 'GET', path: '/api/audit/[id]', color: 'bg-blue-900/50 text-blue-300', desc: 'Fetches full audit record + crawled pages' },
            { method: 'POST', path: '/api/audit/[id]', color: 'bg-green-900/50 text-green-300', desc: 'Re-runs an existing audit for the same URL' },
            { method: 'DELETE', path: '/api/audit?id=', color: 'bg-red-900/50 text-red-300', desc: 'Deletes an audit and all its crawled pages' },
          ].map(route => (
            <div key={route.path} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${route.color}`}>{route.method}</span>
                <code className="text-white font-mono text-sm">{route.path}</code>
                <span className="text-gray-500 text-xs">{route.desc}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'accounts',
      title: 'Required Accounts',
      icon: Key,
      content: (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm">All accounts needed to run KITA Builder Systems end-to-end.</p>
          {[
            { service: 'Supabase', url: 'https://supabase.com', phase: 'MVP', purpose: 'Database, Auth, Storage', envKey: 'NEXT_PUBLIC_SUPABASE_URL + ANON_KEY + SERVICE_ROLE_KEY', free: 'Free tier — 500MB DB, enough for 1000+ sites' },
            { service: 'Google AI (Gemini)', url: 'https://aistudio.google.com/app/apikey', phase: 'MVP', purpose: 'AI site generation — gemini-3.6-flash', envKey: 'GEMINI_API_KEY', free: 'Free tier — ~500 generations/day, no billing required' },
            { service: 'Resend', url: 'https://resend.com', phase: 'MVP', purpose: 'Booking email notifications', envKey: 'RESEND_API_KEY', free: 'Free — 100 emails/day, 3000/month' },
            { service: 'Vercel', url: 'https://vercel.com', phase: 'MVP', purpose: 'Hosting + deployments', envKey: 'None (CLI only)', free: 'Free tier for personal projects' },
            { service: 'GitHub', url: 'https://github.com', phase: 'MVP', purpose: 'Code repository + Vercel integration', envKey: 'None', free: 'Free' },
            { service: 'Twilio', url: 'https://twilio.com', phase: 'V2', purpose: 'Real SMS reminders to owners + customers', envKey: 'TWILIO_AUTH_TOKEN', free: '$20 minimum deposit' },
            { service: 'Stripe', url: 'https://stripe.com', phase: 'V2', purpose: 'Booking deposits + monthly subscription', envKey: 'STRIPE_SECRET_KEY', free: 'Free to create, 2.9% + $0.30 per transaction' },
          ].map(acct => (
            <div key={acct.service} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">{acct.service}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${acct.phase === 'MVP' ? 'bg-blue-900/50 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>{acct.phase}</span>
                </div>
                <a href={acct.url} target="_blank" className="text-blue-400 text-xs hover:underline shrink-0">Login →</a>
              </div>
              <p className="text-gray-500 text-xs">{acct.purpose}</p>
              <p className="text-gray-700 text-xs mt-1 font-mono">{acct.envKey}</p>
              <p className="text-green-800 text-xs mt-1">{acct.free}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'plan',
      title: '30-Day Build Plan',
      icon: Calendar,
      content: (
        <div className="space-y-4">
          {[
            {
              week: 'Week 1 — Foundation (Days 1–7)',
              color: 'border-blue-800',
              badge: '✅ COMPLETE',
              badgeColor: 'bg-green-900/50 text-green-400',
              tasks: [
                'Project scaffolded with Next.js 16 + TypeScript + Tailwind ✅',
                'Supabase cloud schema deployed (sites, services, staff, bookings) ✅',
                'All 5 templates built: Salon, Clinic, Pet, Cafe, Mechanic ✅',
                'Admin CMS: dashboard, credentials, generate, sites, templates, docs, settings ✅',
                'Logo uploader via Supabase Storage ✅',
                'Documentation page (this page) ✅',
                'Public site renderer + booking form ✅',
                'Owner dashboard: services editor + bookings manager ✅',
                'AI generation working via Gemini 3.6 Flash (free tier) ✅',
                'First demo site generated: Edison Barber Shop, Portland ✅',
                'Pushed to GitHub: github.com/dennymartinez01/Kita-Builder-Systems ✅',
              ],
            },
            {
              week: 'Week 2 — Polish + First Client (Days 8–14)',
              color: 'border-green-800',
              badge: '✅ COMPLETE',
              badgeColor: 'bg-green-900/50 text-green-400',
              tasks: [
                'Mobile responsive — sticky nav, responsive grids, touch buttons ✅',
                'Resend email notification confirmed end-to-end ✅',
                'Owner dashboard — Staff, Hours, About, AI Assistant tabs ✅',
                'Agentic AI editor — chat-based site editing (9 tools) ✅',
                'Pitch / outreach page built at /pitch ✅',
                'Deployed to Vercel — live at kita-builder-systems.vercel.app ✅',
              ],
            },
            {
              week: 'Week 3 — Revenue (Days 15–21)',
              color: 'border-yellow-800',
              badge: '🔄 CURRENT',
              badgeColor: 'bg-yellow-900/50 text-yellow-400',
              tasks: [
                'Stripe SDK installed + lib/stripe.ts + lib/pricing.ts (client-safe split) ✅',
                '/api/checkout — creates Stripe Checkout session with business metadata ✅',
                '/api/webhook — handles payment, auto-generates site via Gemini ✅',
                '/onboard — client-facing $150 setup payment page ✅',
                '/onboard/success — polls Supabase until site appears after payment ✅',
                'Supabase payments.sql — payment_status, stripe_session_id columns ✅',
                'Stripe webhook endpoint configured on Vercel ✅',
                'Admin /sites shows payment status badge (paid/free/unpaid) ✅',
                'Pitch page updated with Pay & Launch Now → /onboard button ✅',
                'Fix webhook: idempotency check + extended polling to 120s ✅',
                'Debug Gemini timeout in webhook on Vercel cold start → moved to backlog (Gemini 503 on all models from Vercel IPs)',
                'Get 2 paying clients',
                'Collect real feedback and fix actual issues',
              ],
            },
            {
              week: 'Week 4 — Scale (Days 22–30)',
              color: 'border-yellow-800',
              badge: '🔄 CURRENT',
              badgeColor: 'bg-yellow-900/50 text-yellow-400',
              tasks: [
                'Deploy to Vercel — kita-builder-systems.vercel.app ✅',
                'Website Audit Module Phase 1 (Performance, SEO, Security, Tech, A11y) ✅',
                'Website Audit Module Phase 2 (Crawler, Pages tab, History, Delete) ✅',
                'Website Audit Module Phase 3 (PDF Report download) ✅',
                'Audit pitch page at /audit-pitch ✅',
                'Owner dashboard expanded to 10 tabs (Gallery, Reviews, Analytics, Settings) ✅',
                'Staff booking — preferred staff picker in booking form ✅',
                'Site analytics — page views tracking + Analytics tab ✅',
                'White-label mode — agency branding via env vars ✅',
                'Revenue dashboard — MRR tracker at /admin/revenue ✅',
                'Client Management System (Phase 9) — clients table, list/profile/new pages, revenue by client tab, auto-upsert on booking ✅',
                'Custom domain (kita.build or kitasystems.com)',
                'Twilio SMS reminders for owners + customers',
                '$29/mo recurring billing via Stripe subscriptions',
                'Record 60-sec Loom demo video of site generation',
              ],
            },
          ].map(week => (
            <div key={week.week} className={`border rounded-xl p-5 ${week.color} bg-gray-950/50`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-semibold text-sm">{week.week}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${week.badgeColor}`}>
                  {week.badge}
                </span>
              </div>
              <div className="space-y-1.5">
                {week.tasks.map((task, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={task.includes('✅') ? 'text-green-400' : 'text-gray-600'}>
                      {task.includes('✅') ? '✅' : '○'}
                    </span>
                    <span className={task.includes('✅') ? 'text-gray-500 line-through' : 'text-gray-300'}>
                      {task.replace(' ✅', '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-xl p-4">
            <p className="text-yellow-400 font-semibold text-sm mb-1">The One Rule</p>
            <p className="text-yellow-200/60 text-sm">No new features unless a paying client asks for it. Ship ugly but working. A live site that takes bookings beats a perfect Figma mock every time.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'audit',
      title: 'Website Audit Module',
      icon: Search,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 leading-relaxed">
            A standalone website intelligence tool built inside the admin panel. Audits any public URL for performance, SEO, security, tech stack, and accessibility — all in one run.
          </p>
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-blue-400 font-semibold text-sm mb-3">Phases 1 + 2 + 3 Complete</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-400">
              {[
                '⚡ Performance — Core Web Vitals via Google PSI',
                '🔍 SEO — 12+ on-page checks via cheerio',
                '🔒 Security — 8 HTTP security headers',
                '🧩 Tech Stack — 30+ technology fingerprints',
                '♿ Accessibility — WCAG 2.1 basic checks',
                '📊 Score rings — animated 0-100 per category',
                '🔎 Issue explorer — filter by severity + category',
                '🕷️ Crawler — 10 internal pages, broken links, duplicate titles',
                '📄 PDF Report — Forensic format, all sections, download button',
                '🔍 History — search, delete, score trend comparison',
                '🎨 Audit Pitch Page — /audit-pitch',
                '🌑 Dark admin theme for /audit pages',
              ].map(item => (
                <div key={item} className="flex gap-2"><span className="text-green-400">✓</span>{item}</div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <a href="/audit" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition">
              Open Audit Tool →
            </a>
            <a href="/admin/docs/audit" className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-3 py-2 rounded-lg transition">
              Full Audit Docs →
            </a>
          </div>
          <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-xl p-3">
            <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Setup Required</p>
            <p className="text-yellow-200/60 text-xs">Run <code className="font-mono text-yellow-300">supabase/audit.sql</code> in Supabase SQL Editor before using.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'deploy',
      title: 'Deployment Guide',
      icon: Globe,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">When you're ready to go live. Takes about 10 minutes.</p>
          {[
            {
              step: '1. Push to GitHub',
              code: `git add .
git commit -m "KITA Builder Systems - ready to deploy"
git push origin main`,
            },
            {
              step: '2. Connect to Vercel',
              code: `# Go to vercel.com → New Project → Import GitHub repo
# Framework: Next.js (auto-detected)
# Click Deploy`,
            },
            {
              step: '3. Add Environment Variables in Vercel',
              code: `# Vercel Dashboard → Your Project → Settings → Environment Variables
# Add all keys from your .env.local:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
CLAUDE_API_KEY
RESEND_API_KEY
NOTIFICATION_EMAIL
NEXT_PUBLIC_ADMIN_PIN`,
            },
            {
              step: '4. Redeploy + Test',
              code: `# Vercel → Deployments → Redeploy
# Test: yourdomain.vercel.app/admin
# Generate a live site and test booking end-to-end`,
            },
          ].map(item => (
            <div key={item.step} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-gray-800">
                <p className="text-white text-sm font-medium">{item.step}</p>
              </div>
              <pre className="p-4 text-xs text-green-300 font-mono leading-5 overflow-x-auto">{item.code}</pre>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'booking-arch',
      title: 'Booking System Architecture',
      icon: Shield,
      content: (
        <div className="space-y-5">
          <p className="text-gray-400 text-sm">
            Critical technical decisions for the booking system. Every developer working on this project must read this section before touching bookings, availability, or timezone logic.
          </p>

          {/* Timezone Architecture */}
          <div className="bg-gray-950 border border-blue-800/50 rounded-xl p-5">
            <p className="text-blue-400 font-bold text-sm mb-3">🌏 Timezone Architecture</p>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-semibold mb-1">The Problem</p>
                <p>A booking at "10:00" means completely different UTC times in Manila (UTC+8), Sydney (UTC+11), and Los Angeles (UTC-8). Without a timezone stored on each site, bookings appear at the wrong times when the owner and customer are in different zones. This is the #1 silent bug in booking apps — everything looks fine until a PH client serves AU customers.</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Our Approach — Local Time Strings + IANA Timezone</p>
                <p>We store <code className="text-blue-300 font-mono">booking_date</code> (YYYY-MM-DD) and <code className="text-blue-300 font-mono">booking_time</code> (HH:MM) as plain strings — NOT UTC timestamps. This is intentional:</p>
                <ul className="mt-2 space-y-1 ml-4 list-disc text-gray-500">
                  <li>Service businesses think in local time ("10am Monday") — UTC would confuse owners</li>
                  <li>No DST conversion bugs on display — "10:00" always shows as "10:00"</li>
                  <li>The <code className="text-blue-300 font-mono">sites.timezone</code> field (IANA e.g. "Australia/Sydney") provides context for calendar exports and cross-timezone calculations</li>
                  <li>The <code className="text-blue-300 font-mono">bookings.site_timezone</code> column is a snapshot of the site timezone at booking time — immutable record</li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">What Changes Based on Timezone</p>
                <div className="grid sm:grid-cols-2 gap-2 mt-2">
                  {[
                    { item: 'Minimum date in booking form', how: 'getTodayInTimezone(siteTimezone) — not browser date' },
                    { item: 'Next available slot suggestion', how: 'getNextAvailableSlot() uses siteTimezone to skip past times' },
                    { item: 'Calendar export (.ics / Google)', how: 'buildGoogleCalendarLink() uses siteTimezone for DTSTART' },
                    { item: 'Booking display in dashboard', how: 'formatBookingDateTime(date, time, timezone)' },
                  ].map(r => (
                    <div key={r.item} className="bg-gray-900 rounded-lg p-2.5">
                      <p className="text-white text-xs font-medium">{r.item}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{r.how}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Key Files</p>
                <div className="space-y-1 font-mono text-xs text-gray-500">
                  <p><span className="text-blue-300">lib/timezones.ts</span> — 18 IANA timezones, formatBookingDateTime(), getTodayInTimezone()</p>
                  <p><span className="text-blue-300">lib/booking-utils.ts</span> — checkSlotAvailability(), getNextAvailableSlot()</p>
                  <p><span className="text-blue-300">supabase/phase6.sql</span> — sites.timezone + bookings.site_timezone columns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Race Condition */}
          <div className="bg-gray-950 border border-red-800/50 rounded-xl p-5">
            <p className="text-red-400 font-bold text-sm mb-3">⚡ Double-Booking Race Condition Prevention</p>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-semibold mb-1">The Problem</p>
                <p>Two customers check the same slot at the same second. Both pass the client-side availability check. Both hit the server at the same time. Without a server-side guard, both get confirmed — a double-booking.</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Two-Layer Defence</p>
                <div className="space-y-2">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <p className="text-yellow-400 text-xs font-bold mb-1">Layer 1 — Client-side (UX helper only)</p>
                    <p className="text-gray-500 text-xs"><code className="text-blue-300">checkSlotAvailability()</code> in BookingForm queries Supabase before submit. Shows "This time is already booked" instantly. Fast but NOT race-condition safe.</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <p className="text-green-400 text-xs font-bold mb-1">Layer 2 — Server-side (the real guard) ✅</p>
                    <p className="text-gray-500 text-xs"><code className="text-blue-300">/api/notify</code> queries bookings with a time window overlap check before inserting. Returns HTTP 409 if a conflict is found. This runs after the client check and is the authoritative gate. No two bookings can conflict regardless of simultaneous submissions.</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">How the Overlap Check Works</p>
                <pre className="bg-gray-900 rounded-lg p-3 text-xs text-green-300 font-mono overflow-x-auto">{`// In /api/notify — runs server-side before every insert
const { count } = await supabase
  .from('bookings')
  .select('id', { count: 'exact', head: true })
  .eq('site_id', site_id)
  .eq('booking_date', booking_date)
  .in('status', ['pending', 'confirmed'])
  .gte('booking_time', addMinutesToTime(time, -duration + 1))
  .lte('booking_time', addMinutesToTime(time, duration - 1))

if (count > 0) return 409 // Slot taken`}</pre>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">What Happens on 409</p>
                <p>BookingForm catches the 409 and shows: <span className="text-red-400 italic">"This time slot has just been booked by someone else. Please choose a different time."</span> The customer picks a new slot — no double-booking ever gets saved.</p>
              </div>
              <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3">
                <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Future Enhancement — Database Unique Constraint</p>
                <p className="text-gray-500 text-xs">For even stronger guarantees under extreme load, add a Postgres unique index: <code className="text-yellow-300 font-mono">UNIQUE (site_id, booking_date, booking_time)</code> in Supabase. This makes double-booking impossible at the DB level. Not done yet — the server-side check is sufficient for MVP scale.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'email',
      title: 'Email Notifications',
      icon: Mail,
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Powered by Resend. Triggered automatically on every confirmed booking.</p>
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-white text-sm font-semibold mb-1">Who gets notified?</p>
              <p className="text-gray-400 text-sm">The <code className="text-blue-300 font-mono">owner_email</code> stored on the site record. If none set, falls back to <code className="text-blue-300 font-mono">NOTIFICATION_EMAIL</code> in .env.local.</p>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-1">What's in the email?</p>
              <div className="text-gray-400 text-sm space-y-1">
                <div>• Customer name + phone</div>
                <div>• Service booked + date + time</div>
                <div>• Car model (mechanic) or Pet name (pet clinic)</div>
                <div>• Any notes from the customer</div>
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-1">From address</p>
              <code className="text-gray-400 text-sm font-mono">KITA Bookings &lt;onboarding@resend.dev&gt;</code>
              <p className="text-gray-600 text-xs mt-1">Change to your own domain after adding it in Resend dashboard (free)</p>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-1">V2 — Twilio SMS</p>
              <p className="text-gray-400 text-sm">Add <code className="text-blue-300 font-mono">TWILIO_AUTH_TOKEN</code> + <code className="text-blue-300 font-mono">TWILIO_ACCOUNT_SID</code> to .env.local and the notify route will also fire an SMS to the owner's mobile.</p>
            </div>
          </div>
        </div>
      ),
    },
    // ─── FEATURES COMPLETED ───────────────────────────────────────
    {
      id: 'features',
      title: 'Features Completed',
      icon: CheckSquare,
      content: (
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">Everything built and integrated into KITA Builder Systems as of Week 3.</p>

          {[
            {
              category: '🔧 Admin CMS (Your Control Panel)',
              items: [
                'Dashboard with live stats — total sites, bookings, pending, templates ready',
                'Generate Site — AI-powered form to create any client site in ~10 seconds',
                'All Sites — table view with search, filter by type, payment status badge, delete',
                'Revenue Dashboard (/admin/revenue) — MRR, setup revenue, annual projection, CSV export',
                'Templates marketplace — 11 templates, gradient cards, slide-over detail preview',
                'API Keys & Credentials — reference panel for all service accounts + .env template',
                'Settings — logo uploader via Supabase Storage, admin PIN config',
                'Documentation — this page (live, searchable, collapsible sections)',
                'Pitch Page link — direct access to the client-facing outreach page',
                'PIN-protected login with session persistence',
              ],
            },
            {
              category: '🌐 Public Client Site (/{slug})',
              items: [
                'Sticky mobile nav with business name + Book Now CTA',
                'Hero section — AI-generated headline, subtitle, CTA, background image',
                'Services section — responsive grid, price displayed inline, Book Now per card',
                'About section — AI-generated business description',
                'Business hours display — shows Mon–Sun hours from owner dashboard',
                'Staff / team section — avatar initials, name, role',
                'Booking form — service selector, name, phone, date, time, conditional fields',
                'Custom booking fields — car model (mechanic), pet name (pet clinic)',
                'Testimonials section — AI-generated customer reviews with star ratings',
                'Footer with KITA branding and owner login link',
                'Mobile responsive — tested on 375px, works on all screen sizes',
              ],
            },
            {
              category: '📋 Owner Dashboard (/{slug}/dashboard)',
              items: [
                'PIN login — secure access, default 1234',
                'PIN change — Settings tab, validates match + min 4 chars',
                'Stats bar — pending bookings, confirmed, services count, staff count',
                'Bookings tab — full list, confirm/cancel buttons, CSV export',
                'Services tab — inline edit name/price/duration, add/delete service, saves instantly',
                'Staff tab — add/edit/remove team members with name and role',
                'Hours tab — toggle open/closed per day, time pickers, Save button',
                'About tab — edit section title and body text, live preview, Save button',
                'Reviews tab — add/edit/remove testimonials, star rating picker, save',
                'Gallery tab — multi-photo upload, delete, saves to Supabase Storage',
                'Gallery renders on public site — "Our Work" section, 2-col mobile / 3-col desktop, hover zoom',
                'Settings tab — business logo upload + PIN change',
                'AI Assistant tab — chat-based site editor, 9 agent tools',
                'View Site link — opens public site in new tab',
              ],
            },
            {
              category: '🤖 AI Assistant (Agent Tools)',
              items: [
                'update_service_price — "change my haircut to $80"',
                'update_service_name — "rename Beard Trim to Hot Towel Shave"',
                'update_service_duration — "make oil change 45 minutes"',
                'add_service — "add Deep Conditioning $45 45min"',
                'delete_service — "remove the blowout service"',
                'update_headline — "change the title to Portland\'s Best Barbers"',
                'update_subheadline — "change subtitle to..."',
                'update_about — "update our about section to..."',
                'list_services — "show me my current services"',
                'Changes apply to live site in real time — no reload needed',
              ],
            },
            {
              category: '💳 Payments (Stripe)',
              items: [
                '/onboard — client-facing $150 setup payment page with features list',
                '/onboard/success — polls Supabase until site appears after payment',
                '/api/checkout — creates Stripe Checkout session with business metadata',
                '/api/webhook — handles checkout.session.completed, auto-generates site',
                'Idempotency check — prevents duplicate site creation for same session',
                'maxDuration=60 on webhook to prevent Vercel timeout',
                'payment_status column on sites table — paid / free / unpaid',
                'Test mode active — use card 4242 4242 4242 4242',
                'Pitch page has Pay & Launch Now → /onboard button',
              ],
            },
            {
              category: '📧 Notifications (Resend)',
              items: [
                'Email sent to NOTIFICATION_EMAIL on every confirmed booking',
                'Email includes: customer name, phone, service, date, time, notes, car/pet field',
                'HTML email template with KITA branding',
                'Works in test mode with resend.dev sender (no domain required)',
                'NOTIFICATION_EMAIL is primary — bypasses domain restriction for testing',
              ],
            },
            {
              category: '🗄️ Database (Supabase)',
              items: [
                'sites — slug, business_name, type, owner_email, pin, theme_json, payment_status, stripe fields',
                'services — linked to site, name, price, duration',
                'staff — linked to site, name, role, avatar_url',
                'bookings — all customer booking fields including car_model, pet_name, notes, status',
                'Storage bucket kita-assets — logo uploads via /api/upload-logo',
                'Row Level Security enabled on all tables (public access for MVP)',
              ],
            },
            {
              category: '📅 Booking System',
              items: [
                'Booking form — service selector, name, phone, date, time, conditional fields',
                'Preferred Staff picker — optional dropdown, "No preference" default',
                'Custom fields — car model (mechanic), pet name (pet clinic)',
                'Custom notes label per template — "Your Concern" (clinic), "Guests + Notes" (cafe), "Preferred Style" (salon), "Reason for Visit" (pet), "Additional Notes" (mechanic)',
                'notes_required flag — clinic marks concern as required, others optional',
                'Custom placeholder text per template — contextually relevant prompts',
                'Staff selection saved to bookings — staff_id + staff_name columns',
                'Staff name shown in owner dashboard bookings with 👤 icon',
                'Staff name included in booking notification email',
                'Booking confirmation — shows service, staff name, date, time',
                'CSV export includes Staff column',
              ],
            },
            {
              category: '📊 Site Analytics',
              items: [
                'page_views table — tracks every visit to a client site (site_id, viewed_at, path)',
                '/api/track — POST endpoint, records page views, silently fails if error',
                'PageTracker component — client-side, fires on every public site load, non-blocking',
                'Analytics tab in owner dashboard — 14-day page view bar chart, weekly comparison, booking status breakdown',
                'Views trend — shows % change vs last week with ↑/↓ indicator',
                'Admin Revenue page — Views (30d) column per site, total views stat card',
                'CSV export includes Views (30d) column',
                'supabase/analytics.sql — run to create page_views table',
              ],
            },
            {
              category: '🏷️ White Label Mode',
              items: [
                'NEXT_PUBLIC_WHITE_LABEL_MODE=on/off — global toggle via .env.local or Vercel env vars',
                'NEXT_PUBLIC_AGENCY_NAME — your agency name replaces "KITA Systems" everywhere',
                'NEXT_PUBLIC_AGENCY_TAGLINE — your tagline in public site footer',
                'NEXT_PUBLIC_AGENCY_URL — your website linked in footer',
                'NEXT_PUBLIC_AGENCY_LOGO_URL — your logo URL for branding',
                'Public site footer — shows agency brand when white-label on, KITA brand when off',
                'Owner dashboard header subtitle — shows agency name when white-label on',
                'Per-site override via theme_json.white_label — custom_footer, hide_footer_brand',
                'Admin Settings page — full white-label config reference + env template',
              ],
            },
            {
              category: '🚀 Deployment',
              items: [
                'Deployed to Vercel — kita-builder-systems.vercel.app',
                'GitHub repo — github.com/dennymartinez01/Kita-Builder-Systems',
                'All env vars configured in Vercel dashboard',
                'Stripe webhook endpoint configured for production URL',
                'Auto-deploys on every push to main branch',
              ],
            },
          ].map(group => (
            <div key={group.category} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-white font-semibold text-sm">{group.category}</p>
              </div>
              <div className="p-4 space-y-2">
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-green-400 shrink-0 mt-0.5">✅</span>
                    <span className="text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    // ─── RECOMMENDATIONS ──────────────────────────────────────────
    {
      id: 'recommendations',
      title: 'Feature Roadmap & Recommendations',
      icon: Lightbulb,
      content: (
        <div className="space-y-8">
          <div className="bg-gray-950 border border-blue-900/50 rounded-xl p-4">
            <p className="text-blue-400 font-semibold text-sm mb-2">📋 Documentation Standard</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Every feature below follows this format: <strong className="text-white">What</strong> (what it does), <strong className="text-white">Why</strong> (the business or user pain it solves), <strong className="text-white">Who</strong> (Operator / Client / Customer), <strong className="text-white">Status</strong>. This helps any developer, business partner, or investor understand the reasoning behind every decision.
            </p>
          </div>

          {/* ── FOR THE OPERATOR (You — Admin) ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <span className="bg-purple-900/50 text-purple-400 text-xs px-2 py-0.5 rounded-full">Operator</span>
              For You — The Admin / Agency
            </h3>
            <div className="space-y-3">
              {[
                { feature: 'AI Site Generator (3-step form)', what: 'Client selects business type, configures services + currency, enters details — AI generates the full site in ~10 seconds.', why: 'Removes the need for manual site building. One person can generate 10 sites per day. Time = money.', status: '✅ Built' },
                { feature: 'Revenue Dashboard / MRR Tracker', what: 'Shows monthly recurring revenue, total setup fees, annual projection, and per-site breakdown with CSV export.', why: 'Without visibility into revenue, it is impossible to make decisions about pricing, scaling, or client retention.', status: '✅ Built' },
                { feature: 'White-Label Mode', what: 'Removes all KITA branding and replaces with your agency name, logo, tagline, and URL across all client sites and dashboards.', why: 'Agencies reselling KITA need to present it as their own product. White-labelling is a standard requirement for B2B SaaS resellers.', status: '✅ Built' },
                { feature: 'Website Audit Module (Phases 1-3)', what: 'Forensic audit of any URL — Performance, SEO, Security, Tech Stack, Accessibility, 10-page crawler, PDF report.', why: 'Auditing a prospect\'s existing site before a sales call is one of the most powerful sales tools. "Your SEO score is 42/100 — here\'s what we\'d fix" closes deals.', status: '✅ Built' },
                { feature: 'Client Management System (Phase 9)', what: 'Track all your clients: subscription plan, status, MRR contribution, linked sites, and internal notes. Auto-creates client record when a customer books with email.', why: 'Without visibility into who your clients are, you cannot make retention, pricing, or scaling decisions. Client records link sites to people and enable proper MRR tracking.', status: '✅ Built — Phase 9' },
                { feature: 'Stripe $29/mo Recurring Billing', what: 'Auto-charge clients monthly using Stripe subscriptions. No manual invoicing.', why: 'Manual billing does not scale. Without automated recurring billing, the business cannot grow beyond 5-10 clients.', status: '⏳ Backlog — needs Stripe live keys' },
                { feature: 'Gemini Webhook Auto-Generation', what: 'After a client pays $150 via /onboard, Gemini auto-generates their site and they see it within 30 seconds.', why: 'The full value of the product is the magic moment when someone pays and instantly gets a live site. Currently blocked by Gemini 503 errors from Vercel IPs.', status: '⏳ Backlog — Gemini API issue' },
                { feature: 'Smart Leads Engine', what: 'Aggregate all contact-form inquiries and booking emails across every KITA client site into a central leads database. Run intelligent cross-business promotions — e.g. a customer who booked a haircut at Salon A gets a targeted offer from Mechanic B, both KITA clients.', why: 'Most booking platforms capture a transaction and stop there. KITA sits across multiple local businesses and can connect their customer bases — creating a local loyalty network that none of them could build alone. This becomes a standalone revenue product.', who: 'Operator', status: '📋 Planned — Phase 10' },
                { feature: 'Bulk Demo Site Generator', what: 'Generate 5 demo sites across different niches in one click for outreach purposes.', why: 'When pitching to a barbershop, showing a live barbershop demo is 10x more persuasive than a generic demo. Speed of demo creation = more outreach per day.', status: '📋 Planned — Phase 8' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      item.status.startsWith('✅') ? 'bg-green-900/50 text-green-400' :
                      item.status.startsWith('⏳') ? 'bg-red-900/50 text-red-400' :
                      'bg-gray-800 text-gray-500'
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1.5"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── FOR THE CLIENT (Business Owner) ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-0.5 rounded-full">Client</span>
              For Your Client — The Business Owner
            </h3>

            <p className="text-gray-500 text-xs mb-3 italic">Administration & Site Management</p>
            <div className="space-y-3 mb-5">
              {[
                { feature: '10-Tab Owner Dashboard', what: 'Bookings, Services, Staff, Hours, About, Reviews, Gallery, Analytics, Settings, AI Assistant — all in one PIN-protected dashboard.', why: 'Business owners do not want to call their developer to change a price. Full self-service CMS eliminates support requests and increases client retention.', status: '✅ Built' },
                { feature: 'AI Assistant (Chat to Edit)', what: 'Owner types "change my haircut to $80" and the site updates instantly. 9 agent tools cover services, headlines, about text.', why: 'Most CMS tools require navigating menus. Natural language editing removes the learning curve entirely — any non-technical owner can use it.', status: '✅ Built' },
                { feature: 'Service Selector + Currency on Generate', what: '3-step generation: client picks services, sets prices, chooses currency — before AI generates the site. 10 currencies supported.', why: 'Pre-set services and local currency means the site is ready to use immediately after generation with no editing required.', status: '✅ Built — Phase 5' },
                { feature: 'Business Logo Upload', what: 'Owner uploads their logo via the Settings tab. Stored in Supabase Storage, shows on the site header.', why: 'A business without its logo on its website looks amateur. This is a basic requirement for professional presentation.', status: '✅ Built' },
                { feature: 'Gallery / Photo Upload', what: 'Owner uploads photos of their work via the Gallery tab. Shows as "Our Work" grid on the public site.', why: 'For salons, mechanics, and clinics — showing real photos of work builds trust faster than any text description.', status: '✅ Built' },
                { feature: 'Site Analytics (14-day view)', what: 'Analytics tab shows page views per day for 14 days, weekly trend comparison, and booking status breakdown.', why: 'Clients need to see that their investment is working. "You had 47 site visits and 8 bookings this week" justifies the $29/mo fee.', status: '✅ Built' },
                { feature: 'Contact / Inquiry Form Tab', what: 'A second tab on the public site alongside the booking form — "Not ready to book? Send us a message." Owner sees all inquiries in a new Inquiries tab on their dashboard.', why: 'Some customers are not ready to book but are interested. Without a contact form they either DM the business on Instagram (untracked) or leave. A contact form captures that warm lead before it disappears.', status: '📋 Planned — Phase 10' },
                { feature: 'Leads Dashboard (Owner)', what: 'Owner sees all inquiry leads in their dashboard — name, message, email, timestamp, and a one-click "Convert to Booking" button.', why: 'An inquiry that is not followed up within 24 hours is a lost customer. A visible leads inbox with a clear next action prevents drop-off between interest and booking.', status: '📋 Planned — Phase 10' },
                { feature: 'Booking Calendar View', what: 'Weekly/monthly calendar view of all bookings in the owner dashboard — not just a flat list.', why: 'A list of bookings is hard to scan. A calendar immediately shows gaps, busy periods, and patterns — how any service business thinks about their schedule.', status: '📋 Planned — Phase 7' },
                { feature: 'Block Out Dates / Time Off ✅', what: 'Owner marks holidays, lunch breaks, or unavailable days — customers cannot book those slots.', why: 'Without this, customers book during Christmas, public holidays, or while the owner is on holiday. This is a day-one operational requirement.', status: '✅ Built — Phase 6 · Block Dates tab' },
                { feature: 'Auto-Confirm vs Manual Confirm Toggle ✅', what: 'Toggle: auto-confirm all bookings OR review each one manually before confirming.', why: 'High-volume businesses (cafes, clinics) want auto-confirm. Premium services (consultants, specialists) want to review each booking first.', status: '✅ Built — Phase 6 · Settings tab' },
                { feature: 'Promo Codes / Discount System', what: 'Owner creates promo codes (e.g. FIRST10 = 10% off) that customers can enter at booking.', why: 'Promo codes are the #1 tool for first-time customer acquisition on social media. "DM us for your code" is a proven engagement tactic.', status: '📋 Planned — Phase 7' },
                { feature: 'Google Calendar Integration', what: 'Confirmed bookings automatically block time in the owner\'s Google Calendar.', why: 'Most service business owners run their schedule from Google Calendar. Without this, they have to manually copy every booking — high friction.', status: '📋 Planned — Phase 8' },
                { feature: 'Stripe Deposit on Booking', what: 'Owner sets a % deposit (e.g. 20%) that customers pay at booking time via Stripe.', why: 'No-shows cost service businesses 10-15% of revenue. A deposit creates skin in the game — customers who pay a deposit almost always show up.', status: '📋 Planned — Phase 8' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      item.status.startsWith('✅') ? 'bg-green-900/50 text-green-400' :
                      item.status.startsWith('⏳') ? 'bg-red-900/50 text-red-400' :
                      'bg-gray-800 text-gray-500'
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1.5"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── FOR THE CUSTOMER (End User) ── */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <span className="bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded-full">Customer</span>
              For the Customer — The End User Booking Experience
            </h3>

            <p className="text-gray-500 text-xs mb-3 italic">Before Booking</p>
            <div className="space-y-3 mb-5">
              {[
                { feature: 'Service Duration + Price Shown Clearly ✅', what: 'Each service shows "45 min · $65" in the booking form dropdown so customers know exactly what they are committing to.', why: 'Customers abandon bookings when they do not know how long a service takes. Showing duration prevents surprises and sets expectations.', status: '✅ Built' },
                { feature: 'Preferred Staff Picker ✅', what: 'Optional dropdown in the booking form — customer selects their preferred team member or chooses "No preference".', why: 'Loyalty to a specific stylist, vet, or mechanic is a primary driver of repeat bookings. Enabling this increases retention.', status: '✅ Built' },
                { feature: 'Custom Notes Label Per Template ✅', what: '"Your Concern" for clinics, "Guests + Notes" for cafes, "Preferred Style" for salons — contextually relevant notes field.', why: 'A generic "Notes" field feels impersonal. A field labelled "Your Concern" tells clinic patients the right information to provide, improving service quality.', status: '✅ Built' },
                { feature: 'Next Available Slot Suggestion ✅', what: 'Before the customer picks a date, show "Next available: Tomorrow 2pm" based on existing bookings.', why: 'Most customers do not know when the business is available. Showing the next open slot removes decision paralysis and speeds up the booking process.', status: '✅ Built — Phase 6' },
                { feature: 'Contact / Inquiry Form (Before Booking)', what: '"Not ready to book? Send us a message" tab on the public site. Customer fills name, email, and message. Owner is notified by email. Lead is saved to the site\'s inquiries list.', why: 'Booking is a high-commitment action. Many customers want to ask a question first — price estimate, availability check, first-time nerves. Giving them a zero-friction way to make contact captures leads that would otherwise vanish. Inquiry → follow-up → booking is a proven conversion path.', status: '📋 Planned — Phase 10' },
                { feature: 'Google Maps Link / Get Directions', what: 'Business address shown on the site with a "Get Directions" button that opens Google Maps.', why: 'A first-time customer who cannot find the location will not come back. Reducing friction in getting there directly impacts show-up rates.', status: '📋 Planned — Phase 7' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      item.status.startsWith('✅') ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1.5"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                </div>
              ))}
            </div>

            <p className="text-gray-500 text-xs mb-3 italic">During Booking</p>
            <div className="space-y-3 mb-5">
              {[
                { feature: 'Real-Time Slot Availability Check ✅', what: 'Before confirming a time, query existing bookings to prevent two customers from booking the same slot.', why: 'Double-bookings destroy client trust instantly. A customer who shows up and finds their slot taken will never return and will leave a bad review.', status: '✅ Built — Phase 6' },
                { feature: 'Save Booking Details (Auto-Fill) ✅', what: 'Store name, phone, and email in localStorage so returning customers do not need to re-enter their details.', why: 'Repeat customers are the backbone of service businesses. Reducing friction for their second booking directly increases lifetime value.', status: '✅ Built — Phase 6' },
                { feature: '"Book for Someone Else" Option', what: 'A checkbox that lets the booker enter a different person\'s name — e.g. booking a haircut for their child or spouse.', why: 'Service businesses often receive bookings on behalf of family members. Without this, the booking shows the wrong name and creates confusion at check-in.', status: '📋 Planned — Phase 7' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium bg-gray-800 text-gray-500">{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1.5"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                </div>
              ))}
            </div>

            <p className="text-gray-500 text-xs mb-3 italic">After Booking</p>
            <div className="space-y-3">
              {[
                { feature: 'Booking Confirmation Page ✅', what: 'After submitting, customer is shown a full dedicated page with service, staff, date, time, address, and a cancel link.', why: 'A banner that disappears is not confirmation — it is anxiety. A permanent, shareable confirmation page gives customers something to reference and share.', status: '✅ Built — Phase 6 · /booking/[id]' },
                { feature: 'Add to Calendar Button ✅', what: '"Add to Google Calendar" and "Add to Apple Calendar (.ics)" buttons on the confirmation page.', why: 'Customers who add a booking to their calendar are 3x less likely to no-show. This is one of the highest-ROI features for reducing no-show rates.', status: '✅ Built — Phase 6' },
                { feature: 'Reschedule / Cancel Self-Service Link ✅', what: 'Confirmation email includes links where the customer can cancel or reschedule their own booking without calling.', why: 'Calling to cancel is friction many customers avoid — they simply do not show up instead. A self-service link converts no-shows into reschedules.', status: '✅ Built — Phase 6 · /booking/[id]/cancel + /reschedule' },
                { feature: 'Booking Reminder Email / SMS', what: 'Auto-send a reminder to the customer 24 hours before their appointment via email (Resend) and SMS (Twilio).', why: 'Research shows 24h reminders reduce no-shows by 30-40%. For a salon with 20 bookings per week, that is potentially 6-8 saved appointments per week.', status: '⏳ Backlog — needs Twilio' },
                { feature: 'WhatsApp Booking Option', what: 'A "Book via WhatsApp" button pre-filled with the service details opens a WhatsApp chat with the business.', why: 'In the Philippines, Australia, and Southeast Asia, WhatsApp is the primary communication channel. Meeting customers where they are increases conversion.', status: '📋 Planned — Phase 8' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      item.status.startsWith('⏳') ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-500'
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1.5"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Pitch */}
          <div className="bg-blue-950/20 border border-blue-800 rounded-xl p-5">
            <p className="text-blue-400 font-bold text-sm mb-3">💼 Commercial Pitch — What to Tell Prospective Clients</p>
            <div className="space-y-2 text-sm text-gray-400">
              {[
                '"Your customers can book you 24/7 — even while you sleep. No more missed bookings via Instagram DMs."',
                '"They pick their preferred stylist, select a service, and get an instant confirmation — in under 60 seconds."',
                '"You see all bookings in one place. Confirm, cancel, or let it auto-approve — your choice."',
                '"Edit your services and prices anytime — just type it in chat: \'change my haircut to $80\'."',
                '"Your site shows your hours, your team, your gallery, and your reviews — all managed from one dashboard."',
                '"Customers get a reminder before their appointment — fewer no-shows, more revenue."',
                '"Built for salons, clinics, mechanics, cafes, and pet clinics — across AU, US, UK, PH."',
                '"$150 to launch. $29/month to keep it running. That\'s less than one booking per month to pay for itself."',
              ].map((pitch, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-blue-400 shrink-0">→</span>
                  <p className="italic">{pitch}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // ─── CLIENT MANAGEMENT ───────────────────────────────────────
    {
      id: 'client-management',
      title: 'Client Management System (Phase 9)',
      icon: Users,
      content: (
        <div className="space-y-5">
          <div className="bg-gray-950 border border-green-800/50 rounded-xl p-4">
            <p className="text-green-400 font-bold text-sm mb-2">✅ Phase 9 — Complete</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Client Management System is fully built and integrated. You can track who your clients are, their subscription status, revenue contribution, all businesses they manage, and your internal notes. Booking auto-creates a client record when an email is provided. Sites table shows which client owns each site. Revenue dashboard has a "By Client" tab with MRR per client. Access via <strong className="text-white">Admin → Clients</strong> or <code className="text-blue-300 font-mono">/admin/clients</code>.
            </p>
          </div>

          {/* What was built */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-white font-semibold text-sm mb-3">✅ What Was Built</p>
            <div className="space-y-3">
              {[
                {
                  route: '/admin/clients',
                  title: 'Client List ✅',
                  desc: 'Searchable, filterable table of all clients. Shows name, email, country, plan badge, status badge, sites count, MRR contribution, source, joined date. Filter by status and country. CSV export.',
                },
                {
                  route: '/admin/clients/[id]',
                  title: 'Client Profile ✅',
                  desc: 'Full editable profile: name, email, phone, country, city, subscription plan/status, source, notes, onboarding toggle. Revenue summary (MRR, setup fees paid, annual projection). All their sites with view/dashboard links.',
                },
                {
                  route: '/admin/clients/new',
                  title: 'Create Client ✅',
                  desc: 'Manual client creation form. Fields: name, email, phone, country, city, plan, status, source, notes. Redirects to profile on creation.',
                },
              ].map(p => (
                <div key={p.route} className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-white font-semibold text-sm">{p.title}</p>
                    <code className="text-blue-300 text-xs font-mono shrink-0">{p.route}</code>
                  </div>
                  <p className="text-gray-500 text-xs">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Database */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-white font-semibold text-sm">Database — <code className="text-blue-300 font-mono">clients</code> table ✅</p>
              <p className="text-gray-500 text-xs mt-0.5">Run <code className="font-mono text-yellow-300">supabase/clients.sql</code> — already executed</p>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {[
                  ['id', 'uuid', 'Primary key'],
                  ['name', 'text', 'Full name of business owner'],
                  ['email', 'text unique', 'Primary contact — unique per client'],
                  ['phone', 'text', 'WhatsApp / mobile'],
                  ['country', 'text', 'e.g. AU, PH, US, UK — market segmentation'],
                  ['city', 'text', 'e.g. Sydney, Manila'],
                  ['subscription_plan', 'text', 'trial | starter | growth | agency | custom'],
                  ['subscription_status', 'text', 'trial | active | overdue | cancelled | paused'],
                  ['trial_ends_at', 'timestamptz', 'When their free trial expires'],
                  ['stripe_customer_id', 'text', 'Links to Stripe for billing history'],
                  ['source', 'text', 'outreach | referral | organic | audit | direct'],
                  ['notes', 'text', 'Your internal notes about this client'],
                  ['onboarding_complete', 'bool', 'Have they finished setup?'],
                  ['created_at', 'timestamptz', 'Auto-set on creation'],
                ].map(([col, type, purpose]) => (
                  <tr key={col} className="border-b border-gray-900 last:border-0">
                    <td className="px-4 py-2 font-mono text-white">{col}</td>
                    <td className="px-4 py-2 font-mono text-blue-300">{type}</td>
                    <td className="px-4 py-2 text-gray-500">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sites link */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-white font-semibold text-sm mb-2">Sites → Client Link ✅</p>
            <p className="text-gray-400 text-xs mb-2"><code className="text-blue-300 font-mono">sites.client_id</code> FK added. One client can own many sites.</p>
            <pre className="bg-gray-900 rounded-lg p-3 text-xs text-green-300 font-mono">{`alter table sites
  add column if not exists client_id uuid references clients(id) on delete set null;`}</pre>
          </div>

          {/* Subscription plans — full matrix */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-white font-semibold text-sm">Subscription Plans & MRR Rates</p>
              <p className="text-gray-500 text-xs mt-0.5">All plans include a $150 one-time setup fee. Monthly billing activates after setup.</p>
            </div>
            {/* Plan comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-500 font-medium px-4 py-3">Feature</th>
                    <th className="text-center text-gray-500 font-medium px-4 py-3">
                      <span className="block text-gray-400 font-bold">Trial</span>
                      <span className="text-gray-600">Free · 14 days</span>
                    </th>
                    <th className="text-center text-blue-400 font-medium px-4 py-3 bg-blue-950/10">
                      <span className="block font-bold">Starter</span>
                      <span className="text-blue-300 font-mono">$29/mo</span>
                    </th>
                    <th className="text-center text-green-400 font-medium px-4 py-3">
                      <span className="block font-bold">Growth</span>
                      <span className="text-green-300 font-mono">$49/mo</span>
                    </th>
                    <th className="text-center text-purple-400 font-medium px-4 py-3">
                      <span className="block font-bold">Agency</span>
                      <span className="text-purple-300 font-mono">$99/mo</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Client sites included', trial: '1', starter: '1', growth: '3', agency: '10' },
                    { feature: 'Online booking widget', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    { feature: 'AI site generation', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    { feature: 'Owner dashboard (10 tabs)', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    { feature: 'Email booking notifications', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    { feature: 'Site analytics (14-day)', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    { feature: 'Cancel / reschedule links', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    { feature: 'Block dates / time off', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    { feature: 'Gallery & logo upload', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    { feature: 'AI assistant (9 tools)', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    { feature: 'Contact / inquiry form', trial: '—', starter: '✓', growth: '✓', agency: '✓' },
                    { feature: 'SMS booking reminders', trial: '—', starter: '—', growth: '✓', agency: '✓' },
                    { feature: 'Priority support', trial: '—', starter: '—', growth: '✓', agency: '✓' },
                    { feature: 'Promotion blast (per mo)', trial: '—', starter: '—', growth: '2 blasts', agency: '5 blasts' },
                    { feature: 'White-label mode', trial: '—', starter: '—', growth: '—', agency: '✓' },
                    { feature: 'Custom domain', trial: '—', starter: '—', growth: '—', agency: '✓' },
                    { feature: 'Dedicated onboarding call', trial: '—', starter: '—', growth: '—', agency: '✓' },
                  ].map((row, i) => (
                    <tr key={row.feature} className={`border-b border-gray-900 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-900/20'}`}>
                      <td className="px-4 py-2 text-gray-400">{row.feature}</td>
                      <td className="px-4 py-2 text-center text-gray-600">{row.trial}</td>
                      <td className="px-4 py-2 text-center text-blue-400 bg-blue-950/5">{row.starter}</td>
                      <td className="px-4 py-2 text-center text-green-400">{row.growth}</td>
                      <td className="px-4 py-2 text-center text-purple-400">{row.agency}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-700">
                    <td className="px-4 py-3 text-gray-500 font-semibold">Monthly MRR contribution</td>
                    <td className="px-4 py-3 text-center text-gray-600 font-mono">$0</td>
                    <td className="px-4 py-3 text-center text-blue-400 font-mono font-bold bg-blue-950/5">$29</td>
                    <td className="px-4 py-3 text-center text-green-400 font-mono font-bold">$49</td>
                    <td className="px-4 py-3 text-center text-purple-400 font-mono font-bold">$99</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Integration status */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-white font-semibold text-sm mb-3">Integration Points</p>
            <div className="space-y-2 text-xs text-gray-500">
              {[
                { task: 'Auto-upsert client record when customer books (email provided)', status: '✅ Done — /api/notify' },
                { task: 'Client column in /admin/sites table (linked, clickable)', status: '✅ Done' },
                { task: '"By Client" tab in /admin/revenue with MRR per client + totals row', status: '✅ Done' },
                { task: 'Stripe webhook → update client.subscription_status on payment event', status: '✅ Done — /api/webhook' },
              ].map(item => (
                <div key={item.task} className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2">
                  <span>{item.task}</span>
                  <span className={`shrink-0 ml-3 ${item.status.startsWith('✅') ? 'text-green-500' : 'text-yellow-600'}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // ─── SUBSCRIPTION PLANS ───────────────────────────────────────
    {
      id: 'pricing',
      title: 'Subscription Plans & Pricing',
      icon: BadgeDollarSign,
      content: (
        <div className="space-y-6">

          {/* Intro */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              KITA operates on a <strong className="text-white">$150 one-time setup fee</strong> + <strong className="text-white">monthly subscription</strong> model. The setup fee covers AI generation, initial configuration, and onboarding. The monthly fee covers hosting, the booking system, ongoing support, and feature access. Plans scale with the client's business size and needs.
            </p>
          </div>

          {/* Plan cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                plan: 'Trial',
                price: 'Free',
                sub: '14 days',
                color: 'border-gray-700',
                badge: 'bg-gray-800 text-gray-400',
                accent: 'text-gray-300',
                desc: 'Full access for 14 days. No credit card. Converts to Starter automatically or cancels.',
                ideal: 'New prospects evaluating KITA before committing.',
              },
              {
                plan: 'Starter',
                price: '$29',
                sub: '/month + $150 setup',
                color: 'border-blue-800 bg-blue-950/10',
                badge: 'bg-blue-900/50 text-blue-400',
                accent: 'text-blue-300',
                desc: '1 client site, full booking system, AI assistant, analytics, email notifications.',
                ideal: 'Solo service business — 1 location, 1 owner managing their own site.',
              },
              {
                plan: 'Growth',
                price: '$49',
                sub: '/month + $150 setup',
                color: 'border-green-800',
                badge: 'bg-green-900/50 text-green-400',
                accent: 'text-green-300',
                desc: 'Everything in Starter + up to 3 sites, SMS reminders, 2 promotion blasts/mo, priority support.',
                ideal: 'Growing business with multiple locations, or an agency managing a few clients.',
              },
              {
                plan: 'Agency',
                price: '$99',
                sub: '/month + $150 setup',
                color: 'border-purple-800',
                badge: 'bg-purple-900/50 text-purple-400',
                accent: 'text-purple-300',
                desc: 'Everything in Growth + up to 10 sites, white-label mode, custom domain, 5 blasts/mo, dedicated onboarding call.',
                ideal: 'Web agency or freelancer reselling KITA under their own brand to multiple clients.',
              },
            ].map(p => (
              <div key={p.plan} className={`border rounded-xl p-4 bg-gray-950 ${p.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${p.badge}`}>{p.plan}</span>
                </div>
                <div className={`text-2xl font-black mb-0.5 ${p.accent}`}>{p.price}</div>
                <div className="text-gray-600 text-xs mb-3">{p.sub}</div>
                <p className="text-gray-400 text-xs leading-relaxed mb-3">{p.desc}</p>
                <div className="bg-gray-900 rounded-lg p-2">
                  <p className="text-gray-600 text-xs font-semibold mb-1">Ideal for</p>
                  <p className="text-gray-500 text-xs">{p.ideal}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Full feature matrix */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-white font-semibold text-sm">Full Feature Comparison</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <th className="text-left text-gray-500 font-medium px-4 py-3 w-48">Feature</th>
                    <th className="text-center text-gray-500 font-medium px-4 py-3">Trial</th>
                    <th className="text-center text-blue-400 font-medium px-4 py-3 bg-blue-950/10">Starter<br/><span className="font-mono text-blue-300">$29</span></th>
                    <th className="text-center text-green-400 font-medium px-4 py-3">Growth<br/><span className="font-mono text-green-300">$49</span></th>
                    <th className="text-center text-purple-400 font-medium px-4 py-3">Agency<br/><span className="font-mono text-purple-300">$99</span></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { section: '🌐 Sites', rows: [
                      { feature: 'Client sites included', trial: '1', starter: '1', growth: '3', agency: '10' },
                      { feature: 'Additional sites', trial: '—', starter: '+$29/ea', growth: '+$29/ea', agency: '+$29/ea' },
                    ]},
                    { section: '📅 Booking System', rows: [
                      { feature: 'Online booking widget (24/7)', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'Service selector + staff picker', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'Real-time availability check', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'Cancel / reschedule self-service', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'Block out dates / time off', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'Auto-confirm toggle', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    ]},
                    { section: '🤖 AI & CMS', rows: [
                      { feature: 'AI site generation (~10 sec)', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'Owner dashboard (10 tabs)', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'AI assistant (9 editing tools)', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'Gallery + logo upload', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                    ]},
                    { section: '📊 Analytics & Notifications', rows: [
                      { feature: 'Email booking notifications', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'Site analytics (14-day chart)', trial: '✓', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'SMS booking reminders (Twilio)', trial: '—', starter: '—', growth: '✓', agency: '✓' },
                    ]},
                    { section: '📬 Leads & Promotions (Phase 10)', rows: [
                      { feature: 'Contact / inquiry form', trial: '—', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'Owner Inquiries dashboard', trial: '—', starter: '✓', growth: '✓', agency: '✓' },
                      { feature: 'Promotion blasts per month', trial: '—', starter: '—', growth: '2', agency: '5' },
                      { feature: 'Cross-network audience access', trial: '—', starter: '—', growth: '✓', agency: '✓' },
                    ]},
                    { section: '🏷️ Branding & Scale', rows: [
                      { feature: 'White-label mode', trial: '—', starter: '—', growth: '—', agency: '✓' },
                      { feature: 'Custom domain', trial: '—', starter: '—', growth: '—', agency: '✓' },
                      { feature: 'Dedicated onboarding call', trial: '—', starter: '—', growth: '—', agency: '✓' },
                      { feature: 'Priority support', trial: '—', starter: '—', growth: '✓', agency: '✓' },
                    ]},
                  ].map(group => (
                    <React.Fragment key={group.section}>
                      <tr className="bg-gray-900/60 border-b border-gray-800">
                        <td colSpan={5} className="px-4 py-2 text-gray-500 font-semibold text-xs">{group.section}</td>
                      </tr>
                      {group.rows.map((row, i) => (
                        <tr key={row.feature} className={`border-b border-gray-900 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-900/20'}`}>
                          <td className="px-4 py-2 text-gray-400">{row.feature}</td>
                          <td className="px-4 py-2 text-center text-gray-600">{row.trial}</td>
                          <td className="px-4 py-2 text-center text-blue-400 bg-blue-950/5">{row.starter}</td>
                          <td className="px-4 py-2 text-center text-green-400">{row.growth}</td>
                          <td className="px-4 py-2 text-center text-purple-400">{row.agency}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  <tr className="border-t-2 border-gray-700 bg-gray-900/40">
                    <td className="px-4 py-3 text-white font-bold">Monthly MRR contribution</td>
                    <td className="px-4 py-3 text-center text-gray-600 font-mono font-bold">$0</td>
                    <td className="px-4 py-3 text-center text-blue-400 font-mono font-bold bg-blue-950/5">$29</td>
                    <td className="px-4 py-3 text-center text-green-400 font-mono font-bold">$49</td>
                    <td className="px-4 py-3 text-center text-purple-400 font-mono font-bold">$99</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Upgrade triggers */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
            <p className="text-white font-semibold text-sm mb-4">When to Upgrade — Sales Triggers</p>
            <div className="space-y-3">
              {[
                { from: 'Trial', to: 'Starter', trigger: 'Trial period ends (14 days). Client is getting bookings and sees value. Conversion pitch: "You got X bookings this week — let\'s keep them coming at $29/mo."', color: 'border-blue-800' },
                { from: 'Starter', to: 'Growth', trigger: 'Client opens a second location OR wants SMS reminders to reduce no-shows OR wants to run a promotion to their customers. At $49 it\'s $20 more for significantly more tools.', color: 'border-green-800' },
                { from: 'Growth', to: 'Agency', trigger: 'Client is an agency/freelancer managing 4+ business sites, wants to remove KITA branding for their own clients, or needs a custom domain for white-label presentation.', color: 'border-purple-800' },
              ].map(u => (
                <div key={u.from} className={`border rounded-xl p-4 bg-gray-900/50 ${u.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 text-xs font-bold">{u.from}</span>
                    <span className="text-gray-600">→</span>
                    <span className="text-white text-xs font-bold">{u.to}</span>
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed">{u.trigger}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue projections */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
            <p className="text-white font-semibold text-sm mb-4">MRR Projections by Mix</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { scenario: 'All Starter (10 clients)', mrr: '$290/mo', arr: '$3,480/yr', setup: '+$1,500 setup', color: 'text-blue-400' },
                { scenario: 'Mixed (5S + 3G + 2A)', mrr: '$490/mo', arr: '$5,880/yr', setup: '+$1,500 setup', color: 'text-green-400' },
                { scenario: 'All Agency (10 clients)', mrr: '$990/mo', arr: '$11,880/yr', setup: '+$1,500 setup', color: 'text-purple-400' },
              ].map(s => (
                <div key={s.scenario} className="bg-gray-900 rounded-xl p-4">
                  <p className="text-gray-500 text-xs mb-2">{s.scenario}</p>
                  <p className={`text-2xl font-black ${s.color}`}>{s.mrr}</p>
                  <p className="text-gray-600 text-xs mt-1">{s.arr} recurring</p>
                  <p className="text-green-800 text-xs mt-0.5">{s.setup} one-time</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 text-xs mt-4 italic">
              These figures exclude promotion blast revenue ($49/blast), Stripe deposit fees, or custom enterprise deals.
            </p>
          </div>

          {/* Status note */}
          <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-xl p-4">
            <p className="text-yellow-400 text-xs font-semibold mb-1">⚠️ Implementation Status</p>
            <div className="space-y-1 text-xs text-yellow-200/50">
              <p>✅ Plan tiers defined in <code className="font-mono text-yellow-300">types/database.ts</code> + tracked per client in <code className="font-mono text-yellow-300">clients</code> table</p>
              <p>✅ MRR rates in <code className="font-mono text-yellow-300">app/admin/clients/page.tsx</code> (MONTHLY_RATES constant)</p>
              <p>✅ Plan badge shown in <code className="font-mono text-yellow-300">/admin/clients</code> + <code className="font-mono text-yellow-300">/admin/revenue</code></p>
              <p>⏳ Stripe recurring subscriptions — needs Stripe Products + Prices + live keys (Backlog)</p>
              <p>⏳ Auto-downgrade on payment failure — needs <code className="font-mono text-yellow-300">invoice.payment_failed</code> webhook handler</p>
              <p>⏳ Client self-service plan upgrade page — planned Phase 11</p>
            </div>
          </div>
        </div>
      ),
    },
    // ─── PHASE 10 — CONTACT FORM + LEADS ENGINE ──────────────────
    {
      id: 'leads-engine',
      title: 'Contact Form & Smart Leads Engine (Phase 10)',
      icon: Users,
      content: (
        <div className="space-y-5">
          <div className="bg-gray-950 border border-blue-800/50 rounded-xl p-4">
            <p className="text-blue-400 font-bold text-sm mb-2">📋 Phase 10 — Planned</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Two connected features: a <strong className="text-white">Contact / Inquiry Form</strong> on every client site to capture warm leads before they book, and a <strong className="text-white">Smart Leads Engine</strong> that aggregates those leads across all KITA client sites for intelligent cross-business promotions.
            </p>
          </div>

          {/* Feature 1 — Contact Form */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm">📬 Feature 1 — Contact / Inquiry Form</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-800 text-gray-400">📋 Phase 10</span>
            </div>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-semibold mb-1">What</p>
                <p>A second tab on the public client site — <span className="text-blue-300 italic">"Not ready to book? Send us a message."</span> Customer fills in name, email, and a free-text message. No commitment. Zero friction.</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Why</p>
                <p>Booking is a high-commitment action. Customers who are curious but unsure will leave rather than book if there is no middle option. A contact form captures that warm lead before it disappears. The conversion path <span className="text-green-400">inquiry → follow-up → booking</span> is well established in service sales.</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Who</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded-full">Customer</span>
                  <span className="text-gray-500 text-xs mt-0.5">submits the inquiry</span>
                  <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-0.5 rounded-full ml-2">Client (Owner)</span>
                  <span className="text-gray-500 text-xs mt-0.5">sees it in their Inquiries tab</span>
                  <span className="bg-purple-900/50 text-purple-400 text-xs px-2 py-0.5 rounded-full ml-2">Operator (You)</span>
                  <span className="text-gray-500 text-xs mt-0.5">sees all leads across all sites</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                {[
                  { area: 'Public Site', desc: 'New "Enquire" tab next to the Booking widget. Fields: Name, Email, Message. Submit → thank-you state.' },
                  { area: 'Owner Dashboard', desc: 'New "Inquiries" tab — list of leads with name, email, message, timestamp. One-click "Convert to Booking".' },
                  { area: 'Email Notification', desc: 'Owner receives email via Resend when a new inquiry arrives. Same flow as booking notification.' },
                  { area: 'API Route', desc: 'POST /api/inquire — saves to leads table (site_id, name, email, message, source: "contact_form"). Returns 200.' },
                  { area: 'Admin /admin/leads', desc: 'Cross-site leads view — all inquiries from all client sites in one table, searchable, filterable by site.' },
                  { area: 'DB: leads table', desc: 'id, site_id FK, name, email, phone, message, source, status (new/contacted/converted/closed), created_at.' },
                ].map(r => (
                  <div key={r.area} className="bg-gray-900 rounded-lg p-3">
                    <p className="text-white text-xs font-semibold mb-1">{r.area}</p>
                    <p className="text-gray-500 text-xs">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 2 — Smart Leads Engine */}
          <div className="bg-gray-950 border border-purple-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm">🧠 Feature 2 — Smart Leads Engine</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-800 text-gray-400">📋 Phase 10</span>
            </div>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-semibold mb-1">What</p>
                <p>Aggregate all leads (contact form inquiries + booking customer emails) across every KITA client site into a central leads database. Use this data to run intelligent cross-business promotions — e.g. a customer who booked a haircut at Salon A in Sydney gets a targeted offer from Mechanic B, also a KITA client in Sydney.</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Why</p>
                <p>KITA is uniquely positioned: it sits across multiple local businesses and their customer bases simultaneously. No individual business can build this network alone — but KITA can aggregate it automatically. This creates a <span className="text-purple-300">local loyalty network</span> and a new revenue product: paid promotions sold to KITA clients ("send your offer to 2,000 local customers across our network — $49/blast").</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Who</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-purple-900/50 text-purple-400 text-xs px-2 py-0.5 rounded-full">Operator (You)</span>
                  <span className="text-gray-500 text-xs mt-0.5">runs the promotions engine</span>
                  <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-0.5 rounded-full ml-2">Client (Owner)</span>
                  <span className="text-gray-500 text-xs mt-0.5">buys a promotion blast</span>
                  <span className="bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded-full ml-2">Customer</span>
                  <span className="text-gray-500 text-xs mt-0.5">receives a relevant local offer</span>
                </div>
              </div>

              {/* How it works */}
              <div>
                <p className="text-white font-semibold mb-2">How It Works — 3 Layers</p>
                <div className="space-y-2">
                  {[
                    {
                      layer: 'Layer 1 — Lead Aggregation',
                      color: 'border-blue-700',
                      badge: 'bg-blue-900/50 text-blue-400',
                      points: [
                        'Every contact-form submission → leads table (with site_id, business_type, city)',
                        'Every booking with customer_email → also seeded into leads (source: "booking")',
                        'Customers opt-in at inquiry/booking with a checkbox: "I\'d like to hear about local offers"',
                        'opt_in: boolean on the leads row — promotions only go to opted-in leads',
                      ],
                    },
                    {
                      layer: 'Layer 2 — Segmentation',
                      color: 'border-purple-700',
                      badge: 'bg-purple-900/50 text-purple-400',
                      points: [
                        'Leads tagged by city, business_type of the originating site, and source',
                        'Admin /admin/leads: filter by city + business_type to build a promotion audience',
                        'Example: "All Sydney leads from salon + mechanic sites in the last 90 days"',
                        'Audience size shown before sending — "you will reach 340 people"',
                      ],
                    },
                    {
                      layer: 'Layer 3 — Promotion Blast',
                      color: 'border-green-700',
                      badge: 'bg-green-900/50 text-green-400',
                      points: [
                        'Admin composes a promotion: headline, offer text, CTA URL, expiry date',
                        'System sends personalised email via Resend to the filtered audience',
                        'Promotion links back to the promoting client\'s KITA site',
                        'Delivery stats tracked: sent / opened / clicked per campaign',
                        'Future: SMS blast via Twilio, WhatsApp via WATI/360Dialog',
                      ],
                    },
                  ].map(l => (
                    <div key={l.layer} className={`bg-gray-900 border ${l.color} rounded-xl p-3`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.badge}`}>{l.layer}</span>
                      </div>
                      <ul className="space-y-1">
                        {l.points.map((p, i) => (
                          <li key={i} className="flex gap-2 text-xs text-gray-500">
                            <span className="text-gray-700 shrink-0">→</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue angle */}
              <div className="bg-purple-950/30 border border-purple-800/50 rounded-xl p-4 mt-2">
                <p className="text-purple-300 font-semibold text-xs mb-2">💰 New Revenue Stream — Promotion Blasts</p>
                <div className="space-y-1.5 text-xs text-gray-500">
                  {[
                    'Charge KITA clients $49/blast to reach the full opted-in network in their city',
                    'Bundle: 2 blasts/month included in Growth plan ($49/mo) — creates plan upgrade incentive',
                    'Sell audience segments: "send to 500 pet clinic customers in Manila" → $29',
                    'At 20 paying KITA clients each buying 1 blast/mo → $980 additional MRR',
                  ].map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-purple-500 shrink-0">→</span>{p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DB schema */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-white font-semibold text-sm">Database — <code className="text-blue-300 font-mono">leads</code> table</p>
              <p className="text-gray-500 text-xs mt-0.5">Run <code className="font-mono text-yellow-300">supabase/leads.sql</code> when Phase 10 development begins</p>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {[
                  ['id', 'uuid', 'Primary key'],
                  ['site_id', 'uuid FK', 'FK → sites.id (cascade delete)'],
                  ['name', 'text', 'Customer name'],
                  ['email', 'text', 'Primary contact for follow-up'],
                  ['phone', 'text', 'Optional — captured if provided'],
                  ['message', 'text', 'Free-text inquiry message'],
                  ['source', 'text', 'contact_form | booking | audit_inquiry'],
                  ['status', 'text', 'new | contacted | converted | closed'],
                  ['opt_in', 'bool', 'Consented to receive promotions — default false'],
                  ['city', 'text', 'Copied from site at capture time — for geo-segmentation'],
                  ['business_type', 'text', 'Copied from site — for interest-based segmentation'],
                  ['created_at', 'timestamptz', 'Auto-set on creation'],
                ].map(([col, type, purpose]) => (
                  <tr key={col} className="border-b border-gray-900 last:border-0">
                    <td className="px-4 py-2 font-mono text-white w-36">{col}</td>
                    <td className="px-4 py-2 font-mono text-blue-300 w-28">{type}</td>
                    <td className="px-4 py-2 text-gray-500">{purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Routes */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-white font-semibold text-sm mb-3">New Routes — Phase 10</p>
            <div className="space-y-2 text-xs font-mono">
              {[
                { method: 'POST', path: '/api/inquire', desc: 'Save contact form inquiry → leads table, send owner email notification' },
                { method: 'GET', path: '/admin/leads', desc: 'Cross-site leads list — all inquiries from all client sites, search + filter' },
                { method: 'POST', path: '/admin/leads/promote', desc: 'Compose and send a promotion blast to a filtered audience segment' },
                { method: 'GET', path: '/[slug]/inquiries', desc: 'Owner dashboard Inquiries tab — leads for this site only' },
              ].map(r => (
                <div key={r.path} className="flex gap-3 bg-gray-900 rounded-lg px-3 py-2 items-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${r.method === 'POST' ? 'bg-green-900/50 text-green-300' : 'bg-blue-900/50 text-blue-300'}`}>{r.method}</span>
                  <span className="text-white">{r.path}</span>
                  <span className="text-gray-600 hidden sm:inline">{r.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // ─── CHANGELOG ────────────────────────────────────────────────
    {
      id: 'changelog',
      title: 'Changelog',
      icon: GitCommit,
      content: (
        <div className="space-y-6">
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-400 text-sm leading-relaxed">
              Reverse-chronological log of every meaningful change to KITA Builder Systems. Each entry maps to a git commit. Run <code className="text-blue-300 font-mono">git log --oneline</code> to cross-reference. The full machine-readable version lives in <code className="text-blue-300 font-mono">CHANGELOG.md</code> in the repo root.
            </p>
          </div>

          {[
            {
              date: '2026-09-27',
              entries: [
                { hash: 'e72f85f', type: '🔧 Fix',       text: 'Stripe mode toggle — settings page writes via /api/admin-config (service role) to bypass RLS' },
                { hash: '8a1035e', type: '🔧 Fix',       text: 'admin-config.sql — replaced unsupported "create policy if not exists" with drop+create for Supabase Postgres compat' },
                { hash: 'b1e78e0', type: '✨ Feature',   text: 'Stripe test/live mode toggle — Admin Settings, admin_config table, lib/stripe-config.ts, /api/admin-config route, checkout + webhook updated' },
                { hash: '6bf5aaa', type: '📋 Plan',      text: 'Phase 10 documented — Contact Form + Smart Leads Engine: What/Why/Who/Status, leads table schema, new routes, pitch pages + README updated' },
                { hash: '64667c8', type: '✅ Complete',  text: 'Phase 9 complete — /admin/clients list + profile + new, Client column in /admin/sites, By Client tab in /admin/revenue, auto-upsert client on booking' },
                { hash: '5807265', type: '📋 Plan',      text: 'Phase 9 plan — clients.sql, sidebar nav, docs section, placeholder page' },
                { hash: '0b4dc35', type: '🔧 Fix',       text: 'Timezone + race condition — IANA timezone on sites/bookings, server-side 409 check, getTodayInTimezone moved to lib/timezones.ts, booking architecture docs' },
                { hash: 'c25cd1d', type: '✅ Complete',  text: 'Phase 6 complete — Smart Booking System: availability check, next slot, /booking/[id] confirmation, Add to Calendar, cancel/reschedule, Block Dates, auto-confirm toggle, email auto-fill' },
                { hash: '82e1440', type: '📝 Docs',      text: 'Feature roadmap rewritten with What/Why/Who/Status standard across all features' },
                { hash: '5dac1eb', type: '✅ Complete',  text: 'Phase 5 complete — 3-step generate form: service selector + custom pricing, currency picker (10 currencies), currency on public site + booking form' },
              ],
            },
            {
              date: '2026-09-26',
              entries: [
                { hash: 'b922dff', type: '📝 Docs',      text: 'Docs + README: full project overview updated — both products, Phases 5–8 roadmap, commercial pitch section' },
                { hash: 'aeb80f0', type: '✨ Feature',   text: 'Template custom fields — notes_label/placeholder/required per template type; BookingForm updated' },
                { hash: '2522aa1', type: '✨ Feature',   text: 'Audit pitch page /audit-pitch built; README updated to 27 routes' },
                { hash: '9fa77cc', type: '✅ Complete',  text: 'Audit Phase 3 — PDF report via jsPDF, Forensic format, 8 sections, multi-page download' },
                { hash: 'd6f2bb0', type: '✅ Complete',  text: 'Audit Phase 2 — Crawler (10 pages, 3 concurrent), Pages tab, broken links, History search/delete/score trend' },
                { hash: 'a9af653', type: '✅ Complete',  text: 'Audit Phase 1 — Performance (PSI), SEO (cheerio), Security headers, Tech fingerprinting, Accessibility (WCAG 2.1), score rings, issue explorer' },
              ],
            },
            {
              date: '2026-09-25',
              entries: [
                { hash: '9c30201', type: '✨ Feature',   text: 'Gallery renders on public site — "Our Work" grid, 2-col mobile / 3-col desktop, hover zoom' },
                { hash: 'cc38ce0', type: '✨ Feature',   text: 'Staff booking — preferred staff picker in booking form, staff_id + staff_name saved to booking and shown in dashboard + email' },
                { hash: 'cd8f05b', type: '✨ Feature',   text: 'Site analytics — page_views table, /api/track, Analytics tab in owner dashboard (14-day chart, weekly trend), views in revenue page' },
                { hash: 'f703e01', type: '✅ Complete',  text: 'No-blocker backlog complete — PIN change, logo upload, gallery, testimonials editor, MRR revenue dashboard, CSV export' },
                { hash: 'cbd7ba1', type: '🔧 Fix',       text: 'Webhook maxDuration=60; respond to Stripe immediately then generate in background' },
                { hash: '713e9bd', type: '🔧 Fix',       text: 'Stripe server-only import fixed; lib/pricing.ts split to client-safe module' },
              ],
            },
            {
              date: '2026-09-24',
              entries: [
                { hash: '50d34af', type: '✅ Complete',  text: 'Week 3 — Stripe payments: /api/checkout, /api/webhook, /onboard, /onboard/success, payments.sql, payment_status tracking, Pay & Launch CTA on pitch page' },
              ],
            },
            {
              date: '2026-09-23',
              entries: [
                { hash: 'b76b8c1', type: '✅ Complete',  text: 'Week 2 complete — Outreach pitch page /pitch, mobile responsive (sticky nav, responsive grids), Resend email fix' },
                { hash: 'd648171', type: '✨ Feature',   text: 'Owner dashboard — Staff, Hours, About, AI Assistant tabs added (total 10 tabs)' },
                { hash: 'ddc8bc3', type: '✅ Complete',  text: 'Week 1 complete — Templates marketplace (11 templates), Agentic AI assistant (9 tools via Gemini function-calling)' },
                { hash: 'c9217bf', type: '🎉 Init',      text: 'KITA Builder Systems v1 — Initial commit: Next.js 16, Supabase schema, 5 templates, admin CMS, public site renderer, booking form, owner dashboard, Gemini AI generation' },
              ],
            },
          ].map(day => (
            <div key={day.date} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
              {/* Date header */}
              <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
                <GitCommit size={13} className="text-gray-600 shrink-0" />
                <span className="text-white font-bold text-sm font-mono">{day.date}</span>
                <span className="text-gray-600 text-xs">{day.entries.length} {day.entries.length === 1 ? 'change' : 'changes'}</span>
              </div>
              {/* Entries */}
              <div className="divide-y divide-gray-900">
                {day.entries.map(entry => (
                  <div key={entry.hash} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-900/40 transition">
                    <code className="text-gray-700 font-mono text-xs shrink-0 mt-0.5 w-14">{entry.hash}</code>
                    <span className={`text-xs shrink-0 font-medium w-24 ${
                      entry.type.startsWith('✅') ? 'text-green-400' :
                      entry.type.startsWith('✨') ? 'text-blue-400' :
                      entry.type.startsWith('🔧') ? 'text-yellow-400' :
                      entry.type.startsWith('📝') ? 'text-gray-400' :
                      entry.type.startsWith('📋') ? 'text-purple-400' :
                      entry.type.startsWith('🎉') ? 'text-pink-400' :
                      'text-gray-500'
                    }`}>{entry.type}</span>
                    <span className="text-gray-400 text-xs leading-relaxed">{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-gray-500 text-xs font-semibold mb-3">Legend</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: '🎉 Init',     color: 'text-pink-400',   desc: 'Project initialisation' },
                { icon: '✅ Complete', color: 'text-green-400',  desc: 'Phase or feature fully shipped' },
                { icon: '✨ Feature',  color: 'text-blue-400',   desc: 'New feature added' },
                { icon: '🔧 Fix',      color: 'text-yellow-400', desc: 'Bug fix or correction' },
                { icon: '📝 Docs',     color: 'text-gray-400',   desc: 'Documentation update only' },
                { icon: '📋 Plan',     color: 'text-purple-400', desc: 'Planned, not yet built' },
              ].map(l => (
                <div key={l.icon} className="flex items-center gap-2">
                  <span className={`text-xs font-medium w-24 shrink-0 ${l.color}`}>{l.icon}</span>
                  <span className="text-gray-600 text-xs">{l.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // ─── BACKLOG ──────────────────────────────────────────────────
    {
      id: 'backlog',
      title: 'Backlog — Next Week',
      icon: ListTodo,
      content: (
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">
            Tasks that require paid accounts or billing activation. Code preparation is done — just needs account setup and testing.
          </p>

          {[
            {
              label: '🔴 Blocked — Needs Gemini Account Fix',
              color: 'border-red-800',
              tasks: [
                {
                  title: 'Webhook auto-generation after Stripe payment',
                  status: 'Code complete — blocked on Gemini API',
                  blocker: 'All 3 Gemini models (gemini-3.6-flash, gemini-2.5-flash, gemini-2.5-flash-lite) return 503 unavailable from Vercel servers. Confirmed via Vercel live logs — execution is only 5.58s so it is NOT a timeout. Root cause: AQ. key rate limit or IP restriction on Vercel. Fix: create a new API key at aistudio.google.com/app/apikey, replace GEMINI_API_KEY in .env.local and Vercel env vars, test locally first.',
                  effort: '30 min once new key is working',
                },
                {
                  title: 'Full /onboard → pay → site live flow end-to-end',
                  status: 'Code complete — depends on webhook fix above',
                  blocker: 'Depends on Gemini webhook fix. All polling, idempotency, and maxDuration=60 code is already in place.',
                  effort: 'Testing only — no code needed',
                },
              ],
            },
            {
              label: '🟡 Blocked — Needs Stripe Live Keys',
              color: 'border-yellow-800',
              tasks: [
                {
                  title: '$29/month recurring subscription billing',
                  status: 'Code not started — needs Stripe Products + Prices setup',
                  blocker: 'Currently in test mode. Need to create a $29/mo Stripe Product and switch to live keys when ready for real clients.',
                  effort: '2-3 hours coding + Stripe dashboard setup',
                },
                {
                  title: 'Switch Stripe test keys to live keys',
                  status: 'Pending',
                  blocker: 'Only do this when you have a real paying client ready. Update STRIPE_SECRET_KEY in Vercel + .env.local.',
                  effort: '5 minutes',
                },
              ],
            },
            {
              label: '🟡 Blocked — Needs Twilio Account ($20 deposit)',
              color: 'border-orange-800',
              tasks: [
                {
                  title: 'SMS booking confirmation to customer',
                  status: 'Code not started — /api/notify ready to extend',
                  blocker: 'Need Twilio account funded. Add TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER to .env.local.',
                  effort: '1 hour to add SMS to /api/notify route',
                },
                {
                  title: 'SMS reminder 24 hours before appointment',
                  status: 'Code not started',
                  blocker: 'Needs Twilio + a scheduled job (Vercel Cron or Supabase pg_cron).',
                  effort: '2-3 hours',
                },
              ],
            },
            {
              label: '🟡 Blocked — Needs Resend Verified Domain',
              color: 'border-blue-800',
              tasks: [
                {
                  title: 'Send booking emails to client\'s owner_email (not just your email)',
                  status: 'Workaround active — currently all emails go to NOTIFICATION_EMAIL',
                  blocker: 'Add a domain in Resend → verify DNS → update from address to bookings@yourdomain.com.',
                  effort: '30 minutes once domain is ready',
                },
              ],
            },
            {
              label: '🟢 No Blocker — Can Build Anytime',
              color: 'border-green-800',
              tasks: [
                {
                  title: 'Custom PIN change in owner dashboard',
                  status: '✅ DONE — Settings tab in owner dashboard, validates match + min length',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Business logo upload in owner dashboard',
                  status: '✅ DONE — Settings tab, uploads to Supabase Storage, saves to theme_json.logo_url',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Gallery / photo upload section on public site',
                  status: '✅ DONE — Gallery tab in owner dashboard + "Our Work" grid section on public site',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Testimonials editor in owner dashboard',
                  status: '✅ DONE — Reviews tab, add/edit/remove, star rating picker, save to theme_json',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Revenue dashboard in admin — MRR tracker',
                  status: '✅ DONE — /admin/revenue: MRR, setup revenue, annual projection, per-site breakdown',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Export bookings to CSV',
                  status: '✅ DONE — CSV export in owner dashboard Bookings tab + admin Revenue page',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Service selector + currency on generate form (Phase 5)',
                  status: '✅ DONE — 3-step form: Type → Services + Currency → Details. Client picks/edits services, currency stored on site.',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Real-time slot availability check (Phase 6)',
                  status: '✅ DONE — checkSlotAvailability() in lib/booking-utils.ts',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Add to Calendar button after booking (Phase 6)',
                  status: '✅ DONE — Google Calendar link + Apple .ics on /booking/[id]',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Block out dates / time off (Phase 6)',
                  status: '✅ DONE — Block Dates tab in owner dashboard, blocked_dates table',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Reschedule / cancel self-service link (Phase 6)',
                  status: '✅ DONE — /booking/[id]/cancel + /booking/[id]/reschedule with cancel_token',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Booking calendar view in dashboard (Phase 7)',
                  status: 'Planned — weekly/monthly calendar view of all bookings',
                  blocker: 'None — display only, reads existing bookings table.',
                  effort: '3-4 hours',
                },
                {
                  title: 'Promo codes / discount system (Phase 7)',
                  status: 'Planned — owner creates codes in dashboard, applied at booking',
                  blocker: 'None — new DB table for promo_codes.',
                  effort: '3-4 hours',
                },
                {
                  title: 'Reschedule / cancel self-service link (Phase 6)',
                  status: '✅ DONE — /booking/[id]/cancel + /booking/[id]/reschedule with cancel_token',
                  blocker: 'None',
                  effort: 'Complete',
                },
              ],
            },
          ].map(group => (
            <div key={group.label} className={`border rounded-xl overflow-hidden ${group.color} bg-gray-950/30`}>
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-white font-semibold text-sm">{group.label}</p>
              </div>
              <div className="divide-y divide-gray-800">
                {group.tasks.map((task, i) => (
                  <div key={i} className="px-4 py-4 space-y-1.5">
                    <p className="text-white text-sm font-medium">{task.title}</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="text-blue-400">Status: {task.status}</span>
                      <span className="text-yellow-400/70">Effort: {task.effort}</span>
                    </div>
                    <p className="text-gray-500 text-xs">{task.blocker}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="text-green-400" size={24} />
          Documentation
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Your internal reference for everything KITA Builder Systems.
        </p>
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
                {isOpen
                  ? <ChevronDown size={16} className="text-gray-500" />
                  : <ChevronRight size={16} className="text-gray-500" />
                }
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
        KITA Builder Systems v1 · Built by Denny Martinez · From Struggle to Booked. ✊
      </p>
    </div>
  )
}

