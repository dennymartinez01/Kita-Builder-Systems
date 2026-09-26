'use client'

import { useState } from 'react'
import { BookOpen, ChevronRight, ChevronDown, Database, Zap, Globe, Mail, Key, Code2, Calendar, Layers, ArrowRight, CheckSquare, Lightbulb, ListTodo, Search } from 'lucide-react'

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
            <strong className="text-white">KITA Builder Systems</strong> is an AI-powered website builder for local service businesses — Salon, Clinic, Pet Clinic, Cafe, and Mechanic shops. It generates a full booking website in ~10 seconds using AI, backed by Supabase and delivered via Next.js.
          </p>
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
            <p className="text-blue-400 font-semibold text-sm mb-3">Core Value Proposition</p>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex gap-2"><span className="text-green-400">✓</span> AI generates copy, services, staff tailored to business type + location</div>
              <div className="flex gap-2"><span className="text-green-400">✓</span> Live booking widget — customers book 24/7, owner gets email instantly</div>
              <div className="flex gap-2"><span className="text-green-400">✓</span> Owner dashboard with PIN — manage services/prices, view all bookings</div>
              <div className="flex gap-2"><span className="text-green-400">✓</span> 5 pre-built templates: Salon, Clinic, Pet, Cafe, Mechanic</div>
              <div className="flex gap-2"><span className="text-green-400">✓</span> Deploy to Vercel — each site live at yourdomain.com/slug</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-1">Revenue Model</p>
              <p className="text-white font-bold">$150 setup + $29/mo</p>
              <p className="text-gray-600 text-xs mt-1">per client site</p>
            </div>
            <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
              <p className="text-gray-500 text-xs mb-1">Target Market</p>
              <p className="text-white font-bold">AU / US / UK / CAN</p>
              <p className="text-gray-600 text-xs mt-1">local service businesses</p>
            </div>
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
│   └── staff-booking.sql       ← staff_id + staff_name on bookings
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
                'Custom PIN change + logo upload in owner dashboard ✅',
                'README fully updated with all features and routes ✅',
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
      title: 'Feature Recommendations',
      icon: Lightbulb,
      content: (
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">
            Comprehensive feature roadmap covering operator tools, client admin features, customer booking experience, and commercial pitch features.
            Organized by priority and build phase.
          </p>

          {[
            {
              label: '✅ Already Built',
              color: 'border-green-800 bg-green-950/10',
              items: [
                { for: 'Operator', feature: 'Revenue dashboard / MRR tracker ✅', why: '/admin/revenue — MRR, setup revenue, annual projection, CSV export' },
                { for: 'Operator', feature: 'White-label mode ✅', why: 'NEXT_PUBLIC_WHITE_LABEL_MODE=on, agency name/tagline/logo via env vars' },
                { for: 'Operator', feature: 'Site analytics — page views ✅', why: 'Analytics tab in dashboard + /api/track + admin Revenue page' },
                { for: 'Client', feature: 'Custom PIN change ✅', why: 'Settings tab in owner dashboard' },
                { for: 'Client', feature: 'Business logo upload ✅', why: 'Settings tab — Supabase Storage, shows on site' },
                { for: 'Client', feature: 'Gallery / photo upload ✅', why: 'Gallery tab — multi-upload, "Our Work" grid on public site' },
                { for: 'Client', feature: 'Testimonials / Reviews editor ✅', why: 'Reviews tab — add/edit/remove, star ratings, live on site' },
                { for: 'Client', feature: 'Business hours management ✅', why: 'Hours tab — Mon-Sun open/closed toggle, time pickers' },
                { for: 'Client', feature: 'About section editor ✅', why: 'About tab — title + body with live preview' },
                { for: 'Client', feature: 'AI Assistant — chat to edit site ✅', why: '9 agent tools — change prices, add services, update headline, etc.' },
                { for: 'Customer', feature: 'Preferred staff picker in booking form ✅', why: 'Optional staff dropdown in booking form, saved to booking' },
                { for: 'Customer', feature: 'Custom notes label per template ✅', why: '"Your Concern" (clinic), "Guests + Notes" (cafe), "Preferred Style" (salon)' },
              ],
            },
            {
              label: '🔥 Phase 5 — Generate Flow Enhancement (Build Next)',
              color: 'border-red-800 bg-red-950/20',
              items: [
                { for: 'Client', feature: 'Service selector on generate form', why: 'Client picks/edits default services before generation. Their choices = their data.' },
                { for: 'Client', feature: 'Currency selector on generate form', why: 'USD, AUD, GBP, PHP, CAD, NZD. Stored on site, used everywhere prices show.' },
                { for: 'Client', feature: 'Custom service add on generate form', why: 'Client adds their own services during onboarding, not just AI defaults.' },
                { for: 'Client', feature: 'Editable service prices before generation', why: 'Client sets their own prices immediately — no need to edit in dashboard after.' },
              ],
            },
            {
              label: '🔥 Phase 6 — Smart Booking System',
              color: 'border-orange-800 bg-orange-950/20',
              items: [
                { for: 'Customer', feature: 'Real-time slot availability check', why: 'Prevents double-bookings. Checks existing confirmed bookings before allowing a time slot.' },
                { for: 'Customer', feature: 'Add to Calendar button after booking', why: 'Google Calendar / Apple Calendar one-click. Reduces no-shows by 30-40%.' },
                { for: 'Customer', feature: 'Next available slot suggestion', why: '"Next available: Tomorrow 2pm" shown before date picker. Speeds up booking.' },
                { for: 'Customer', feature: 'Booking confirmation dedicated page', why: 'Full summary page — service, staff, date, time, address, cancel link.' },
                { for: 'Customer', feature: 'Reschedule / cancel self-service', why: 'Link in confirmation email. Owner saves time — no manual calls.' },
                { for: 'Customer', feature: 'Save details for return visits', why: 'localStorage auto-fill name/phone on return. Faster second booking.' },
                { for: 'Client', feature: 'Block out dates / time off', why: 'Owner marks holidays, breaks, unavailable periods. Customers cannot book those slots.' },
                { for: 'Client', feature: 'Auto-confirm vs manual confirm toggle', why: 'Toggle in dashboard — auto-confirm all OR review each booking manually.' },
                { for: 'Client', feature: 'Booking capacity per time slot', why: 'e.g. Cafe can handle 3 table bookings at 7pm simultaneously.' },
              ],
            },
            {
              label: '⚡ Phase 7 — Admin Power Tools',
              color: 'border-yellow-800 bg-yellow-950/20',
              items: [
                { for: 'Client', feature: 'Booking calendar view in dashboard', why: 'Weekly/monthly calendar view of bookings. Much easier than a list.' },
                { for: 'Client', feature: 'Peak hours heatmap analytics', why: 'Shows which days/times get most bookings. Helps owner plan staffing + promotions.' },
                { for: 'Client', feature: 'Most booked service analytics', why: 'Top 3 services by booking count. Helps with pricing and promotion decisions.' },
                { for: 'Client', feature: 'Promo codes / discount system', why: 'e.g. FIRST10 = 10% off first booking. Owner creates codes in dashboard.' },
                { for: 'Client', feature: 'Google My Business link prompt', why: 'Prompt owner to add booking link to GMB profile. Free traffic.' },
                { for: 'Client', feature: 'Share booking link button', why: 'One-click copy of /{slug}#book for Instagram bio, Facebook, WhatsApp.' },
                { for: 'Operator', feature: 'Booking reminder email 24h before', why: 'Auto-send reminder to customer before their appointment. Vercel Cron.' },
                { for: 'Operator', feature: 'Booking reminder SMS via Twilio', why: 'SMS reminder — higher open rate than email. Needs Twilio.' },
              ],
            },
            {
              label: '💡 Phase 8 — Growth & Monetization',
              color: 'border-blue-800 bg-blue-950/20',
              items: [
                { for: 'Operator', feature: 'Stripe $29/mo recurring subscription', why: 'Automated monthly billing. Pure passive revenue.' },
                { for: 'Operator', feature: 'Gemini webhook fix — auto-generate after payment', why: 'Core flow: client pays → site appears automatically. Currently blocked on Gemini 503 from Vercel.' },
                { for: 'Client', feature: 'Stripe deposit on booking', why: 'Reduce no-shows with a small upfront deposit. Client sets % in dashboard.' },
                { for: 'Client', feature: 'Google Calendar integration', why: 'Auto-block time in owner calendar when a booking is confirmed.' },
                { for: 'Customer', feature: 'WhatsApp booking option', why: 'PH/AU customers prefer WhatsApp. Direct link pre-filled with service details.' },
                { for: 'Customer', feature: '"Book for someone else" option', why: 'e.g. Booking for a family member. Second person name field.' },
                { for: 'Operator', feature: 'Multi-site client accounts', why: 'A client with 2 locations needs one dashboard for both.' },
                { for: 'Operator', feature: 'Bulk generate demo sites', why: 'Create 5 demo sites at once for outreach across niches.' },
              ],
            },
          ].map(group => (
            <div key={group.label} className={`border rounded-xl overflow-hidden ${group.color}`}>
              <div className="px-4 py-3 border-b border-gray-800/50">
                <p className="text-white font-semibold text-sm">{group.label}</p>
              </div>
              <div className="divide-y divide-gray-800/30">
                {group.items.map((item, i) => (
                  <div key={i} className="px-4 py-3 grid grid-cols-12 gap-3">
                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.for === 'Operator' ? 'bg-purple-900/50 text-purple-400'
                        : item.for === 'Client' ? 'bg-blue-900/50 text-blue-400'
                        : 'bg-green-900/50 text-green-400'
                      }`}>{item.for}</span>
                    </div>
                    <div className="col-span-4">
                      <p className="text-white text-xs font-medium">{item.feature}</p>
                    </div>
                    <div className="col-span-6">
                      <p className="text-gray-500 text-xs">{item.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Commercial Pitch Value Props */}
          <div className="bg-blue-950/20 border border-blue-800 rounded-xl p-5">
            <p className="text-blue-400 font-bold text-sm mb-3">💼 Commercial Pitch — What to Tell Prospective Clients</p>
            <div className="space-y-2 text-sm text-gray-400">
              {[
                '"Your customers can book you 24/7 — even while you sleep. No more missed bookings on Instagram DMs."',
                '"They pick their preferred staff member, select a service, and get an instant confirmation — in under 60 seconds."',
                '"You see all bookings in one place. Confirm, cancel, or let it auto-approve — your choice."',
                '"Edit your services and prices anytime — just type it in chat: \'change my haircut to $80\'."',
                '"Your site shows your hours, your team, your gallery, and your reviews — all managed from one dashboard."',
                '"Customers get a reminder before their appointment — fewer no-shows, more revenue."',
                '"We built this for salons, clinics, mechanics, cafes, and pet clinics — across AU, US, UK, PH."',
                '"$150 to launch. $29/month to keep it running. That\'s less than 1 booking per month to pay for itself."',
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
                  status: 'Planned — client picks services + currency before site generation',
                  blocker: 'None — pure UI + DB change. No paid accounts needed.',
                  effort: '3-4 hours',
                },
                {
                  title: 'Real-time slot availability check (Phase 6)',
                  status: 'Planned — query existing bookings before allowing a time slot',
                  blocker: 'None — pure Supabase query logic in BookingForm.',
                  effort: '2 hours',
                },
                {
                  title: 'Add to Calendar button after booking (Phase 6)',
                  status: 'Planned — Google Calendar + Apple Calendar .ics link',
                  blocker: 'None — pure client-side URL generation.',
                  effort: '1 hour',
                },
                {
                  title: 'Block out dates / time off (Phase 6)',
                  status: 'Planned — owner marks unavailable dates in dashboard',
                  blocker: 'None — new DB table + dashboard tab.',
                  effort: '2-3 hours',
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
                  status: 'Planned — link in confirmation email, customer updates booking status',
                  blocker: 'None — new route /booking/[id]/cancel + [id]/reschedule.',
                  effort: '2 hours',
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
