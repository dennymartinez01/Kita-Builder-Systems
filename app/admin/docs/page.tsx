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
            <strong className="text-white">Product 1 â€” AI Website Builder:</strong> Generates a fully-functional booking website in ~10 seconds from a business name and location. Includes a 10-tab owner CMS, AI assistant for live edits, analytics, gallery, reviews, and a Stripe payment flow.
          </p>
          <p className="text-gray-300 leading-relaxed">
            <strong className="text-white">Product 2 â€” Website Intelligence & Audit:</strong> Forensic website audit tool â€” enter any URL to get scores + issues + PDF report covering Performance, SEO, Security, Tech Stack, Accessibility, and a 10-page internal crawler.
          </p>

          {/* Product 1 value props */}
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
            <p className="text-blue-400 font-semibold text-sm mb-3">âš¡ Product 1 â€” AI Website Builder</p>
            <div className="space-y-1.5 text-sm text-gray-400">
              {[
                'AI generates copy, services, staff tailored to business type + location in ~10 seconds',
                'Live booking widget â€” customers book 24/7, owner gets instant email notification',
                'Owner dashboard with PIN â€” 10 tabs: Bookings, Services, Staff, Hours, About, Reviews, Gallery, Analytics, Settings, AI Assistant',
                'AI Assistant â€” chat to edit live site: "change my haircut to $80" updates instantly',
                'Preferred staff picker â€” customers choose their preferred team member',
                'Custom notes labels per template â€” "Your Concern" for clinics, "Guests + Notes" for cafes',
                'Site analytics â€” 14-day page view chart, weekly trends, booking status breakdown',
                'Gallery â€” multi-photo upload, "Our Work" grid on public site',
                'White-label mode â€” remove KITA branding, use your agency name and logo',
                '11 templates across 5 business types: Salon, Clinic, Pet, Cafe, Mechanic',
                'Stripe payment flow â€” $150 setup fee via Checkout, payment_status tracked per site',
                'Deployed on Vercel â€” live at kita-builder-systems.vercel.app',
              ].map((item, i) => (
                <div key={i} className="flex gap-2"><span className="text-green-400">âœ“</span>{item}</div>
              ))}
            </div>
          </div>

          {/* Product 2 value props */}
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
            <p className="text-purple-400 font-semibold text-sm mb-3">ðŸ” Product 2 â€” Website Intelligence & Audit</p>
            <div className="space-y-1.5 text-sm text-gray-400">
              {[
                'Forensic audit: Performance (PSI), SEO, Security headers, Tech Stack, Accessibility',
                'Page crawler â€” crawls up to 10 internal pages, detects broken links + duplicate titles',
                'Score rings per category (0-100) + weighted overall score',
                'Issue explorer â€” filter by severity (critical/high/medium/low) + category',
                'PDF report download â€” Forensic Website Audit Report format, multi-page',
                'Audit history â€” search, delete, score trend comparison (â†‘â†“â€”)',
                'Audit pitch page at /audit-pitch â€” shareable outreach link for selling audit services',
                'Dark admin theme â€” integrated into the admin panel',
              ].map((item, i) => (
                <div key={i} className="flex gap-2"><span className="text-green-400">âœ“</span>{item}</div>
              ))}
            </div>
          </div>

          {/* Roadmap preview */}
          <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
            <p className="text-yellow-400 font-semibold text-sm mb-3">ðŸ—ºï¸ Roadmap â€” 7 Capability Groups</p>
            <div className="space-y-1.5 text-sm text-gray-400">
              {[
                'ðŸ”´ Foundation â€” Feature & Entitlement Engine, Universal Event Stream â† build first',
                'ðŸŸ  Commerce â€” Subscription overrides, Trial workflow, Coupon Engine, Customer Accounts',
                'ðŸŸ¡ CRM & Growth â€” Leads Master, Outreach Campaigns, Attribution Tracking',
                'ðŸŸ¢ Intelligence â€” Business Rank + Badges, Heatmaps, Admin Impersonation',
                'ðŸ“‹ Phase 10 â€” Contact Form + Smart Leads Engine (documented, not yet built)',
                'ðŸ“‹ Phase 11 â€” Entitlement Engine + Trial Workflow + Admin Overrides + Customer DB',
                'ðŸ“‹ Phase 12 â€” Outreach Campaigns + Attribution + Geographic Analytics',
                'ðŸ“‹ Phase 13 â€” Business Rank + Badges + Heatmaps + Admin Impersonation',
              ].map((item, i) => (
                <div key={i} className="flex gap-2"><span className="text-yellow-400">â†’</span>{item}</div>
              ))}
            </div>
          </div>

          {/* Commercial pitch box */}
          <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-800">
            <p className="text-blue-400 font-semibold text-sm mb-2">ðŸ’¼ The Pitch</p>
            <p className="text-gray-300 text-sm leading-relaxed italic">
              "Your customers can book you 24/7 â€” even while you sleep. AI builds your site in 10 seconds, your clients manage everything themselves, and you get notified every time someone books. $150 to launch. $29/month to keep it running. That's less than one booking to pay for itself."
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Revenue Model', value: '$150 setup + $29/mo', sub: 'per client site' },
              { label: 'Target Market', value: 'AU / US / UK / PH / CAN', sub: 'local service businesses' },
              { label: 'Live URL', value: 'Vercel', sub: 'kita-builder-systems.vercel.app' },
              { label: 'AI Engine', value: 'Gemini 3.6 Flash', sub: 'free tier Â· AQ. key format' },
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
â”œâ”€â”€ app/
â”‚   â”œâ”€â”€ admin/                  â† Your internal CMS (PIN protected)
â”‚   â”‚   â”œâ”€â”€ layout.tsx          â† Sidebar + PIN auth + logo loader
â”‚   â”‚   â”œâ”€â”€ page.tsx            â† Dashboard + live stats
â”‚   â”‚   â”œâ”€â”€ credentials/        â† API keys reference + .env template
â”‚   â”‚   â”œâ”€â”€ generate/           â† AI site generator form
â”‚   â”‚   â”œâ”€â”€ revenue/            â† MRR tracker + CSV export
â”‚   â”‚   â”œâ”€â”€ sites/              â† All generated sites + payment status
â”‚   â”‚   â”œâ”€â”€ templates/          â† 11-template marketplace grid
â”‚   â”‚   â”œâ”€â”€ settings/           â† Logo, PIN, white-label, email config
â”‚   â”‚   â””â”€â”€ docs/               â† Documentation (this page)
â”‚   â”‚       â””â”€â”€ audit/          â† Audit module docs
â”‚   â”œâ”€â”€ api/
â”‚   â”‚   â”œâ”€â”€ agent/route.ts      â† AI chat agent (9 tools)
â”‚   â”‚   â”œâ”€â”€ audit/route.ts      â† Audit create/list/delete
â”‚   â”‚   â”œâ”€â”€ audit/[id]/route.ts â† Audit fetch/re-run
â”‚   â”‚   â”œâ”€â”€ checkout/route.ts   â† Stripe Checkout session
â”‚   â”‚   â”œâ”€â”€ generate/route.ts   â† Gemini AI site generation
â”‚   â”‚   â”œâ”€â”€ notify/route.ts     â† Save booking + Resend email
â”‚   â”‚   â”œâ”€â”€ track/route.ts      â† Page view analytics
â”‚   â”‚   â”œâ”€â”€ upload-logo/route.tsâ† Image upload to Supabase Storage
â”‚   â”‚   â””â”€â”€ webhook/route.ts    â† Stripe webhook handler
â”‚   â”œâ”€â”€ audit/                  â† Website Audit tool (dark admin theme)
â”‚   â”‚   â”œâ”€â”€ layout.tsx          â† Audit layout with top bar
â”‚   â”‚   â”œâ”€â”€ page.tsx            â† URL input + audit history
â”‚   â”‚   â””â”€â”€ [id]/page.tsx       â† Full results dashboard + PDF download
â”‚   â”œâ”€â”€ audit-pitch/page.tsx    â† Audit pitch/outreach page
â”‚   â”œâ”€â”€ [slug]/
â”‚   â”‚   â”œâ”€â”€ page.tsx            â† Public client site (white-label aware)
â”‚   â”‚   â””â”€â”€ dashboard/page.tsx  â† Owner CMS (10 tabs, PIN protected)
â”‚   â”œâ”€â”€ onboard/
â”‚   â”‚   â”œâ”€â”€ page.tsx            â† $150 client payment page
â”‚   â”‚   â””â”€â”€ success/page.tsx    â† Post-payment site polling
â”‚   â”œâ”€â”€ pitch/page.tsx          â† KITA Builder outreach pitch
â”‚   â”œâ”€â”€ layout.tsx
â”‚   â””â”€â”€ page.tsx
â”œâ”€â”€ components/
â”‚   â”œâ”€â”€ AgentChat.tsx           â† AI chat widget (owner dashboard)
â”‚   â”œâ”€â”€ BookingForm.tsx         â† Customer booking form
â”‚   â””â”€â”€ PageTracker.tsx         â† Non-blocking page view tracker
â”œâ”€â”€ lib/
â”‚   â”œâ”€â”€ supabase.ts             â† Supabase client (server + anon)
â”‚   â”œâ”€â”€ stripe.ts               â† Stripe client (server-only)
â”‚   â”œâ”€â”€ pricing.ts              â† Client-safe pricing constants
â”‚   â”œâ”€â”€ whitelabel.ts           â† White-label config helpers
â”‚   â”œâ”€â”€ templates/              â† 11 template variants
â”‚   â”‚   â”œâ”€â”€ index.ts, registry.ts
â”‚   â”‚   â””â”€â”€ salon/clinic/pet/cafe/mechanic.ts
â”‚   â””â”€â”€ audit/                  â† Audit analyzers
â”‚       â”œâ”€â”€ types.ts, index.ts, crawler.ts, pdf.ts
â”‚       â””â”€â”€ performance/seo/security/tech/accessibility.ts
â”œâ”€â”€ supabase/
â”‚   â”œâ”€â”€ schema.sql              â† sites, services, staff, bookings
â”‚   â”œâ”€â”€ storage.sql             â† kita-assets storage bucket
â”‚   â”œâ”€â”€ payments.sql            â† payment_status, stripe columns
â”‚   â”œâ”€â”€ analytics.sql           â† page_views table
â”‚   â”œâ”€â”€ audit.sql               â† audits + audit_pages tables
â”‚   â”œâ”€â”€ staff-booking.sql       â† staff_id + staff_name on bookings
â”‚   â”œâ”€â”€ clients.sql             â† clients table (Phase 9)
â”‚   â””â”€â”€ leads.sql               â† leads table (Phase 10 â€” planned)
â”œâ”€â”€ types/
â”‚   â””â”€â”€ database.ts             â† TypeScript types for all DB tables
â””â”€â”€ .env.local                  â† API keys (never commit)`}</pre>
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
                { name: 'theme_json', type: 'jsonb', note: 'Full site structure â€” sections, colors, copy, hours, gallery, logo_url' },
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
                { name: 'site_id', type: 'uuid', note: 'FK â†’ sites.id (cascade delete)' },
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
                { name: 'site_id', type: 'uuid', note: 'FK â†’ sites.id (cascade delete)' },
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
                { name: 'site_id', type: 'uuid', note: 'FK â†’ sites.id' },
                { name: 'service_id', type: 'uuid', note: 'FK â†’ services.id (nullable)' },
                { name: 'customer_name', type: 'text', note: '' },
                { name: 'customer_phone', type: 'text', note: '' },
                { name: 'service_name', type: 'text', note: 'Denormalized for display' },
                { name: 'booking_date', type: 'date', note: '' },
                { name: 'booking_time', type: 'text', note: 'HH:MM format' },
                { name: 'car_model', type: 'text', note: 'Mechanic only â€” nullable' },
                { name: 'pet_name', type: 'text', note: 'Pet clinic only â€” nullable' },
                { name: 'staff_id', type: 'uuid', note: 'FK â†’ staff.id (nullable) â€” preferred staff' },
                { name: 'staff_name', type: 'text', note: 'Denormalized staff name for display' },
                { name: 'status', type: 'text', note: 'pending | confirmed | cancelled' },
              ],
            },
            {
              table: 'page_views',
              color: 'text-blue-300',
              desc: 'Analytics â€” tracks visits to client sites',
              columns: [
                { name: 'site_id', type: 'uuid', note: 'FK â†’ sites.id (cascade delete)' },
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
                { name: 'site_id', type: 'uuid', note: 'FK â†’ sites.id (cascade delete)' },
                { name: 'name', type: 'text', note: 'Customer name' },
                { name: 'email', type: 'text', note: 'Primary contact for follow-up and promotions' },
                { name: 'phone', type: 'text', note: 'Optional â€” captured if provided' },
                { name: 'message', type: 'text', note: 'Free-text inquiry message' },
                { name: 'source', type: 'text', note: 'contact_form | booking | audit_inquiry' },
                { name: 'status', type: 'text', note: 'new | contacted | converted | closed' },
                { name: 'opt_in', type: 'bool', note: 'Consented to promotions â€” default false' },
                { name: 'city', type: 'text', note: 'Copied from site at capture â€” geo-segmentation' },
                { name: 'business_type', type: 'text', note: 'Copied from site â€” interest-based segmentation' },
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
              label: 'Workflow A â€” Site Generation',
              color: 'border-blue-800 bg-blue-950/20',
              labelColor: 'text-blue-400',
              steps: [
                { actor: 'You (Admin)', action: 'Fill form at /admin/generate â€” business name, type, location' },
                { actor: 'Next.js', action: 'POST /api/generate with form data' },
                { actor: 'Claude AI', action: 'Returns JSON: headline, sub, about, services, staff, testimonials' },
                { actor: 'API Route', action: 'Merges AI copy into base template â†’ builds full theme_json' },
                { actor: 'Supabase', action: 'Inserts into sites, services, staff tables' },
                { actor: 'Browser', action: 'Redirects you to /{slug} â€” site is live immediately' },
              ],
            },
            {
              label: 'Workflow B â€” Customer Booking',
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
              label: 'Workflow C â€” Owner CMS',
              color: 'border-purple-800 bg-purple-950/20',
              labelColor: 'text-purple-400',
              steps: [
                { actor: 'Owner', action: 'Goes to /{slug}/dashboard, enters PIN' },
                { actor: 'Dashboard', action: 'Loads all services and bookings from Supabase' },
                { actor: 'Owner', action: 'Edits service name/price â€” saves instantly via Supabase update' },
                { actor: 'Owner', action: 'Confirms or cancels bookings with one click' },
                { actor: 'Public Site', action: 'Reflects changes immediately â€” no redeploy needed' },
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
            { method: 'POST', path: '/api/agent', color: 'bg-green-900/50 text-green-300', desc: 'AI chat agent â€” 9 tools for editing site content via natural language' },
            { method: 'POST', path: '/api/checkout', color: 'bg-green-900/50 text-green-300', desc: 'Creates a Stripe Checkout session for $150 setup fee' },
            { method: 'POST', path: '/api/webhook', color: 'bg-green-900/50 text-green-300', desc: 'Stripe webhook â€” handles payment.completed, auto-generates site' },
            { method: 'POST', path: '/api/upload-logo', color: 'bg-green-900/50 text-green-300', desc: 'Uploads an image to Supabase Storage kita-assets bucket' },
            { method: 'POST', path: '/api/track', color: 'bg-green-900/50 text-green-300', desc: 'Records a page view for site analytics (non-blocking)' },
            { method: 'POST', path: '/api/audit', color: 'bg-purple-900/50 text-purple-300', desc: 'Runs a full website audit â€” Performance, SEO, Security, Tech, Accessibility + Crawler' },
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
            { service: 'Supabase', url: 'https://supabase.com', phase: 'MVP', purpose: 'Database, Auth, Storage', envKey: 'NEXT_PUBLIC_SUPABASE_URL + ANON_KEY + SERVICE_ROLE_KEY', free: 'Free tier â€” 500MB DB, enough for 1000+ sites' },
            { service: 'Google AI (Gemini)', url: 'https://aistudio.google.com/app/apikey', phase: 'MVP', purpose: 'AI site generation â€” gemini-3.6-flash', envKey: 'GEMINI_API_KEY', free: 'Free tier â€” ~500 generations/day, no billing required' },
            { service: 'Resend', url: 'https://resend.com', phase: 'MVP', purpose: 'Booking email notifications', envKey: 'RESEND_API_KEY', free: 'Free â€” 100 emails/day, 3000/month' },
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
                <a href={acct.url} target="_blank" className="text-blue-400 text-xs hover:underline shrink-0">Login â†’</a>
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
              week: 'Week 1 â€” Foundation (Days 1â€“7)',
              color: 'border-blue-800',
              badge: 'âœ… COMPLETE',
              badgeColor: 'bg-green-900/50 text-green-400',
              tasks: [
                'Project scaffolded with Next.js 16 + TypeScript + Tailwind âœ…',
                'Supabase cloud schema deployed (sites, services, staff, bookings) âœ…',
                'All 5 templates built: Salon, Clinic, Pet, Cafe, Mechanic âœ…',
                'Admin CMS: dashboard, credentials, generate, sites, templates, docs, settings âœ…',
                'Logo uploader via Supabase Storage âœ…',
                'Documentation page (this page) âœ…',
                'Public site renderer + booking form âœ…',
                'Owner dashboard: services editor + bookings manager âœ…',
                'AI generation working via Gemini 3.6 Flash (free tier) âœ…',
                'First demo site generated: Edison Barber Shop, Portland âœ…',
                'Pushed to GitHub: github.com/dennymartinez01/Kita-Builder-Systems âœ…',
              ],
            },
            {
              week: 'Week 2 â€” Polish + First Client (Days 8â€“14)',
              color: 'border-green-800',
              badge: 'âœ… COMPLETE',
              badgeColor: 'bg-green-900/50 text-green-400',
              tasks: [
                'Mobile responsive â€” sticky nav, responsive grids, touch buttons âœ…',
                'Resend email notification confirmed end-to-end âœ…',
                'Owner dashboard â€” Staff, Hours, About, AI Assistant tabs âœ…',
                'Agentic AI editor â€” chat-based site editing (9 tools) âœ…',
                'Pitch / outreach page built at /pitch âœ…',
                'Deployed to Vercel â€” live at kita-builder-systems.vercel.app âœ…',
              ],
            },
            {
              week: 'Week 3 â€” Revenue (Days 15â€“21)',
              color: 'border-yellow-800',
              badge: 'ðŸ”„ CURRENT',
              badgeColor: 'bg-yellow-900/50 text-yellow-400',
              tasks: [
                'Stripe SDK installed + lib/stripe.ts + lib/pricing.ts (client-safe split) âœ…',
                '/api/checkout â€” creates Stripe Checkout session with business metadata âœ…',
                '/api/webhook â€” handles payment, auto-generates site via Gemini âœ…',
                '/onboard â€” client-facing $150 setup payment page âœ…',
                '/onboard/success â€” polls Supabase until site appears after payment âœ…',
                'Supabase payments.sql â€” payment_status, stripe_session_id columns âœ…',
                'Stripe webhook endpoint configured on Vercel âœ…',
                'Admin /sites shows payment status badge (paid/free/unpaid) âœ…',
                'Pitch page updated with Pay & Launch Now â†’ /onboard button âœ…',
                'Fix webhook: idempotency check + extended polling to 120s âœ…',
                'Debug Gemini timeout in webhook on Vercel cold start â†’ moved to backlog (Gemini 503 on all models from Vercel IPs)',
                'Get 2 paying clients',
                'Collect real feedback and fix actual issues',
              ],
            },
            {
              week: 'Week 4 â€” Scale (Days 22â€“30)',
              color: 'border-yellow-800',
              badge: 'ðŸ”„ CURRENT',
              badgeColor: 'bg-yellow-900/50 text-yellow-400',
              tasks: [
                'Deploy to Vercel â€” kita-builder-systems.vercel.app âœ…',
                'Website Audit Module Phase 1 (Performance, SEO, Security, Tech, A11y) âœ…',
                'Website Audit Module Phase 2 (Crawler, Pages tab, History, Delete) âœ…',
                'Website Audit Module Phase 3 (PDF Report download) âœ…',
                'Audit pitch page at /audit-pitch âœ…',
                'Owner dashboard expanded to 10 tabs (Gallery, Reviews, Analytics, Settings) âœ…',
                'Staff booking â€” preferred staff picker in booking form âœ…',
                'Site analytics â€” page views tracking + Analytics tab âœ…',
                'White-label mode â€” agency branding via env vars âœ…',
                'Revenue dashboard â€” MRR tracker at /admin/revenue âœ…',
                'Client Management System (Phase 9) â€” clients table, list/profile/new pages, revenue by client tab, auto-upsert on booking âœ…',
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
                    <span className={task.includes('âœ…') ? 'text-green-400' : 'text-gray-600'}>
                      {task.includes('âœ…') ? 'âœ…' : 'â—‹'}
                    </span>
                    <span className={task.includes('âœ…') ? 'text-gray-500 line-through' : 'text-gray-300'}>
                      {task.replace(' âœ…', '')}
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
            A standalone website intelligence tool built inside the admin panel. Audits any public URL for performance, SEO, security, tech stack, and accessibility â€” all in one run.
          </p>
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-blue-400 font-semibold text-sm mb-3">Phases 1 + 2 + 3 Complete</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-400">
              {[
                'âš¡ Performance â€” Core Web Vitals via Google PSI',
                'ðŸ” SEO â€” 12+ on-page checks via cheerio',
                'ðŸ”’ Security â€” 8 HTTP security headers',
                'ðŸ§© Tech Stack â€” 30+ technology fingerprints',
                'â™¿ Accessibility â€” WCAG 2.1 basic checks',
                'ðŸ“Š Score rings â€” animated 0-100 per category',
                'ðŸ”Ž Issue explorer â€” filter by severity + category',
                'ðŸ•·ï¸ Crawler â€” 10 internal pages, broken links, duplicate titles',
                'ðŸ“„ PDF Report â€” Forensic format, all sections, download button',
                'ðŸ” History â€” search, delete, score trend comparison',
                'ðŸŽ¨ Audit Pitch Page â€” /audit-pitch',
                'ðŸŒ‘ Dark admin theme for /audit pages',
              ].map(item => (
                <div key={item} className="flex gap-2"><span className="text-green-400">âœ“</span>{item}</div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <a href="/audit" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition">
              Open Audit Tool â†’
            </a>
            <a href="/admin/docs/audit" className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium px-3 py-2 rounded-lg transition">
              Full Audit Docs â†’
            </a>
          </div>
          <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-xl p-3">
            <p className="text-yellow-400 text-xs font-semibold mb-1">âš ï¸ Setup Required</p>
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
              code: `# Go to vercel.com â†’ New Project â†’ Import GitHub repo
# Framework: Next.js (auto-detected)
# Click Deploy`,
            },
            {
              step: '3. Add Environment Variables in Vercel',
              code: `# Vercel Dashboard â†’ Your Project â†’ Settings â†’ Environment Variables
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
              code: `# Vercel â†’ Deployments â†’ Redeploy
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
            <p className="text-blue-400 font-bold text-sm mb-3">ðŸŒ Timezone Architecture</p>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-semibold mb-1">The Problem</p>
                <p>A booking at "10:00" means completely different UTC times in Manila (UTC+8), Sydney (UTC+11), and Los Angeles (UTC-8). Without a timezone stored on each site, bookings appear at the wrong times when the owner and customer are in different zones. This is the #1 silent bug in booking apps â€” everything looks fine until a PH client serves AU customers.</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Our Approach â€” Local Time Strings + IANA Timezone</p>
                <p>We store <code className="text-blue-300 font-mono">booking_date</code> (YYYY-MM-DD) and <code className="text-blue-300 font-mono">booking_time</code> (HH:MM) as plain strings â€” NOT UTC timestamps. This is intentional:</p>
                <ul className="mt-2 space-y-1 ml-4 list-disc text-gray-500">
                  <li>Service businesses think in local time ("10am Monday") â€” UTC would confuse owners</li>
                  <li>No DST conversion bugs on display â€” "10:00" always shows as "10:00"</li>
                  <li>The <code className="text-blue-300 font-mono">sites.timezone</code> field (IANA e.g. "Australia/Sydney") provides context for calendar exports and cross-timezone calculations</li>
                  <li>The <code className="text-blue-300 font-mono">bookings.site_timezone</code> column is a snapshot of the site timezone at booking time â€” immutable record</li>
                </ul>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">What Changes Based on Timezone</p>
                <div className="grid sm:grid-cols-2 gap-2 mt-2">
                  {[
                    { item: 'Minimum date in booking form', how: 'getTodayInTimezone(siteTimezone) â€” not browser date' },
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
                  <p><span className="text-blue-300">lib/timezones.ts</span> â€” 18 IANA timezones, formatBookingDateTime(), getTodayInTimezone()</p>
                  <p><span className="text-blue-300">lib/booking-utils.ts</span> â€” checkSlotAvailability(), getNextAvailableSlot()</p>
                  <p><span className="text-blue-300">supabase/phase6.sql</span> â€” sites.timezone + bookings.site_timezone columns</p>
                </div>
              </div>
            </div>
          </div>

          {/* Race Condition */}
          <div className="bg-gray-950 border border-red-800/50 rounded-xl p-5">
            <p className="text-red-400 font-bold text-sm mb-3">âš¡ Double-Booking Race Condition Prevention</p>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-semibold mb-1">The Problem</p>
                <p>Two customers check the same slot at the same second. Both pass the client-side availability check. Both hit the server at the same time. Without a server-side guard, both get confirmed â€” a double-booking.</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Two-Layer Defence</p>
                <div className="space-y-2">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <p className="text-yellow-400 text-xs font-bold mb-1">Layer 1 â€” Client-side (UX helper only)</p>
                    <p className="text-gray-500 text-xs"><code className="text-blue-300">checkSlotAvailability()</code> in BookingForm queries Supabase before submit. Shows "This time is already booked" instantly. Fast but NOT race-condition safe.</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <p className="text-green-400 text-xs font-bold mb-1">Layer 2 â€” Server-side (the real guard) âœ…</p>
                    <p className="text-gray-500 text-xs"><code className="text-blue-300">/api/notify</code> queries bookings with a time window overlap check before inserting. Returns HTTP 409 if a conflict is found. This runs after the client check and is the authoritative gate. No two bookings can conflict regardless of simultaneous submissions.</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">How the Overlap Check Works</p>
                <pre className="bg-gray-900 rounded-lg p-3 text-xs text-green-300 font-mono overflow-x-auto">{`// In /api/notify â€” runs server-side before every insert
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
                <p>BookingForm catches the 409 and shows: <span className="text-red-400 italic">"This time slot has just been booked by someone else. Please choose a different time."</span> The customer picks a new slot â€” no double-booking ever gets saved.</p>
              </div>
              <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3">
                <p className="text-yellow-400 text-xs font-semibold mb-1">âš ï¸ Future Enhancement â€” Database Unique Constraint</p>
                <p className="text-gray-500 text-xs">For even stronger guarantees under extreme load, add a Postgres unique index: <code className="text-yellow-300 font-mono">UNIQUE (site_id, booking_date, booking_time)</code> in Supabase. This makes double-booking impossible at the DB level. Not done yet â€” the server-side check is sufficient for MVP scale.</p>
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
                <div>â€¢ Customer name + phone</div>
                <div>â€¢ Service booked + date + time</div>
                <div>â€¢ Car model (mechanic) or Pet name (pet clinic)</div>
                <div>â€¢ Any notes from the customer</div>
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-1">From address</p>
              <code className="text-gray-400 text-sm font-mono">KITA Bookings &lt;onboarding@resend.dev&gt;</code>
              <p className="text-gray-600 text-xs mt-1">Change to your own domain after adding it in Resend dashboard (free)</p>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-1">V2 â€” Twilio SMS</p>
              <p className="text-gray-400 text-sm">Add <code className="text-blue-300 font-mono">TWILIO_AUTH_TOKEN</code> + <code className="text-blue-300 font-mono">TWILIO_ACCOUNT_SID</code> to .env.local and the notify route will also fire an SMS to the owner's mobile.</p>
            </div>
          </div>
        </div>
      ),
    },
    // â”€â”€â”€ FEATURES COMPLETED â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'features',
      title: 'Features Completed',
      icon: CheckSquare,
      content: (
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">Everything built and integrated into KITA Builder Systems as of Week 3.</p>

          {[
            {
              category: 'ðŸ”§ Admin CMS (Your Control Panel)',
              items: [
                'Dashboard with live stats â€” total sites, bookings, pending, templates ready',
                'Generate Site â€” AI-powered form to create any client site in ~10 seconds',
                'All Sites â€” table view with search, filter by type, payment status badge, delete',
                'Revenue Dashboard (/admin/revenue) â€” MRR, setup revenue, annual projection, CSV export',
                'Templates marketplace â€” 11 templates, gradient cards, slide-over detail preview',
                'API Keys & Credentials â€” reference panel for all service accounts + .env template',
                'Settings â€” logo uploader via Supabase Storage, admin PIN config',
                'Documentation â€” this page (live, searchable, collapsible sections)',
                'Pitch Page link â€” direct access to the client-facing outreach page',
                'PIN-protected login with session persistence',
              ],
            },
            {
              category: 'ðŸŒ Public Client Site (/{slug})',
              items: [
                'Sticky mobile nav with business name + Book Now CTA',
                'Hero section â€” AI-generated headline, subtitle, CTA, background image',
                'Services section â€” responsive grid, price displayed inline, Book Now per card',
                'About section â€” AI-generated business description',
                'Business hours display â€” shows Monâ€“Sun hours from owner dashboard',
                'Staff / team section â€” avatar initials, name, role',
                'Booking form â€” service selector, name, phone, date, time, conditional fields',
                'Custom booking fields â€” car model (mechanic), pet name (pet clinic)',
                'Testimonials section â€” AI-generated customer reviews with star ratings',
                'Footer with KITA branding and owner login link',
                'Mobile responsive â€” tested on 375px, works on all screen sizes',
              ],
            },
            {
              category: 'ðŸ“‹ Owner Dashboard (/{slug}/dashboard)',
              items: [
                'PIN login â€” secure access, default 1234',
                'PIN change â€” Settings tab, validates match + min 4 chars',
                'Stats bar â€” pending bookings, confirmed, services count, staff count',
                'Bookings tab â€” full list, confirm/cancel buttons, CSV export',
                'Services tab â€” inline edit name/price/duration, add/delete service, saves instantly',
                'Staff tab â€” add/edit/remove team members with name and role',
                'Hours tab â€” toggle open/closed per day, time pickers, Save button',
                'About tab â€” edit section title and body text, live preview, Save button',
                'Reviews tab â€” add/edit/remove testimonials, star rating picker, save',
                'Gallery tab â€” multi-photo upload, delete, saves to Supabase Storage',
                'Gallery renders on public site â€” "Our Work" section, 2-col mobile / 3-col desktop, hover zoom',
                'Settings tab â€” business logo upload + PIN change',
                'AI Assistant tab â€” chat-based site editor, 9 agent tools',
                'View Site link â€” opens public site in new tab',
              ],
            },
            {
              category: 'ðŸ¤– AI Assistant (Agent Tools)',
              items: [
                'update_service_price â€” "change my haircut to $80"',
                'update_service_name â€” "rename Beard Trim to Hot Towel Shave"',
                'update_service_duration â€” "make oil change 45 minutes"',
                'add_service â€” "add Deep Conditioning $45 45min"',
                'delete_service â€” "remove the blowout service"',
                'update_headline â€” "change the title to Portland\'s Best Barbers"',
                'update_subheadline â€” "change subtitle to..."',
                'update_about â€” "update our about section to..."',
                'list_services â€” "show me my current services"',
                'Changes apply to live site in real time â€” no reload needed',
              ],
            },
            {
              category: 'ðŸ’³ Payments (Stripe)',
              items: [
                '/onboard â€” client-facing $150 setup payment page with features list',
                '/onboard/success â€” polls Supabase until site appears after payment',
                '/api/checkout â€” creates Stripe Checkout session with business metadata',
                '/api/webhook â€” handles checkout.session.completed, auto-generates site',
                'Idempotency check â€” prevents duplicate site creation for same session',
                'maxDuration=60 on webhook to prevent Vercel timeout',
                'payment_status column on sites table â€” paid / free / unpaid',
                'Test mode active â€” use card 4242 4242 4242 4242',
                'Pitch page has Pay & Launch Now â†’ /onboard button',
              ],
            },
            {
              category: 'ðŸ“§ Notifications (Resend)',
              items: [
                'Email sent to NOTIFICATION_EMAIL on every confirmed booking',
                'Email includes: customer name, phone, service, date, time, notes, car/pet field',
                'HTML email template with KITA branding',
                'Works in test mode with resend.dev sender (no domain required)',
                'NOTIFICATION_EMAIL is primary â€” bypasses domain restriction for testing',
              ],
            },
            {
              category: 'ðŸ—„ï¸ Database (Supabase)',
              items: [
                'sites â€” slug, business_name, type, owner_email, pin, theme_json, payment_status, stripe fields',
                'services â€” linked to site, name, price, duration',
                'staff â€” linked to site, name, role, avatar_url',
                'bookings â€” all customer booking fields including car_model, pet_name, notes, status',
                'Storage bucket kita-assets â€” logo uploads via /api/upload-logo',
                'Row Level Security enabled on all tables (public access for MVP)',
              ],
            },
            {
              category: 'ðŸ“… Booking System',
              items: [
                'Booking form â€” service selector, name, phone, date, time, conditional fields',
                'Preferred Staff picker â€” optional dropdown, "No preference" default',
                'Custom fields â€” car model (mechanic), pet name (pet clinic)',
                'Custom notes label per template â€” "Your Concern" (clinic), "Guests + Notes" (cafe), "Preferred Style" (salon), "Reason for Visit" (pet), "Additional Notes" (mechanic)',
                'notes_required flag â€” clinic marks concern as required, others optional',
                'Custom placeholder text per template â€” contextually relevant prompts',
                'Staff selection saved to bookings â€” staff_id + staff_name columns',
                'Staff name shown in owner dashboard bookings with ðŸ‘¤ icon',
                'Staff name included in booking notification email',
                'Booking confirmation â€” shows service, staff name, date, time',
                'CSV export includes Staff column',
              ],
            },
            {
              category: 'ðŸ“Š Site Analytics',
              items: [
                'page_views table â€” tracks every visit to a client site (site_id, viewed_at, path)',
                '/api/track â€” POST endpoint, records page views, silently fails if error',
                'PageTracker component â€” client-side, fires on every public site load, non-blocking',
                'Analytics tab in owner dashboard â€” 14-day page view bar chart, weekly comparison, booking status breakdown',
                'Views trend â€” shows % change vs last week with â†‘/â†“ indicator',
                'Admin Revenue page â€” Views (30d) column per site, total views stat card',
                'CSV export includes Views (30d) column',
                'supabase/analytics.sql â€” run to create page_views table',
              ],
            },
            {
              category: 'ðŸ·ï¸ White Label Mode',
              items: [
                'NEXT_PUBLIC_WHITE_LABEL_MODE=on/off â€” global toggle via .env.local or Vercel env vars',
                'NEXT_PUBLIC_AGENCY_NAME â€” your agency name replaces "KITA Systems" everywhere',
                'NEXT_PUBLIC_AGENCY_TAGLINE â€” your tagline in public site footer',
                'NEXT_PUBLIC_AGENCY_URL â€” your website linked in footer',
                'NEXT_PUBLIC_AGENCY_LOGO_URL â€” your logo URL for branding',
                'Public site footer â€” shows agency brand when white-label on, KITA brand when off',
                'Owner dashboard header subtitle â€” shows agency name when white-label on',
                'Per-site override via theme_json.white_label â€” custom_footer, hide_footer_brand',
                'Admin Settings page â€” full white-label config reference + env template',
              ],
            },
            {
              category: 'ðŸš€ Deployment',
              items: [
                'Deployed to Vercel â€” kita-builder-systems.vercel.app',
                'GitHub repo â€” github.com/dennymartinez01/Kita-Builder-Systems',
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
                    <span className="text-green-400 shrink-0 mt-0.5">âœ…</span>
                    <span className="text-gray-400">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    // â”€â”€â”€ RECOMMENDATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'recommendations',
      title: 'Feature Roadmap & Recommendations',
      icon: Lightbulb,
      content: (
        <div className="space-y-8">

          {/* Documentation standard */}
          <div className="bg-gray-950 border border-blue-900/50 rounded-xl p-4">
            <p className="text-blue-400 font-semibold text-sm mb-2">ðŸ“‹ Documentation Standard</p>
            <p className="text-gray-400 text-xs leading-relaxed">
              Every feature follows: <strong className="text-white">What</strong> Â· <strong className="text-white">Why</strong> Â· <strong className="text-white">Who</strong> (Operator / Client / Customer) Â· <strong className="text-white">Status</strong>. This lets any developer, partner, or investor understand the reasoning behind every decision.
            </p>
          </div>

          {/* Architecture principle */}
          <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-xl p-4">
            <p className="text-yellow-400 font-semibold text-sm mb-2">â­ Core Architectural Principle</p>
            <p className="text-gray-300 text-xs leading-relaxed mb-3">
              <strong className="text-white">Plan defines default capabilities. Entitlements determine what a client actually has. Admin overrides modify those entitlements.</strong>
            </p>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-gray-400 leading-6">
              <p>PLAN â†’ Default Entitlements â†’ Admin Overrides â†’ Effective Entitlements</p>
              <p className="text-gray-600 mt-1">e.g. Growth plan sets WhatsApp=true Â· Admin override sets WhatsApp=false Â· Client gets WhatsApp=false</p>
            </div>
            <p className="text-gray-500 text-xs mt-2">This single decision solves Customer Accounts, WhatsApp, Coupons, White-Label, Leads, and every future plan-gated feature without scattering <code className="text-yellow-300 font-mono">if plan === "growth"</code> checks across hundreds of components.</p>
          </div>

          {/* Priority tiers legend */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-white font-semibold text-sm mb-3">Priority Tiers</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                { tier: 'ðŸ”´ Foundation', desc: 'Architectural decisions that affect everything. Build these before adding new user-facing features.', color: 'border-red-800 bg-red-950/20' },
                { tier: 'ðŸŸ  Commerce', desc: 'Next revenue-generating capabilities. Trial workflow, subscription overrides, coupons, customer accounts.', color: 'border-orange-800 bg-orange-950/20' },
                { tier: 'ðŸŸ¡ CRM & Growth', desc: 'Leads master database, outreach campaigns, WhatsApp, attribution tracking.', color: 'border-yellow-800 bg-yellow-950/20' },
                { tier: 'ðŸŸ¢ Intelligence', desc: 'Business ranking, geographic analytics, heatmaps, admin impersonation.', color: 'border-green-800 bg-green-950/20' },
              ].map(t => (
                <div key={t.tier} className={`border rounded-xl p-3 ${t.color}`}>
                  <p className="font-bold text-white mb-1">{t.tier}</p>
                  <p className="text-gray-500 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* â”€â”€ GROUP 1 â€” Subscription, Trial & Entitlement â”€â”€ */}
          <div>
            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <span className="bg-red-900/50 text-red-400 text-xs px-2 py-0.5 rounded-full">ðŸ”´ Foundation</span>
              Group 1 â€” Subscription, Trial & Entitlement Management
            </h3>
            <p className="text-gray-600 text-xs mb-4">The engine that gates every plan-dependent feature. Build this before customer accounts, WhatsApp, coupons, or any other plan-gated capability.</p>
            <div className="space-y-3">
              {[
                {
                  feature: 'Stripe $29/mo Recurring Billing',
                  what: 'Auto-charge clients monthly via Stripe Subscriptions using a Price ID. No manual invoicing.',
                  why: 'Manual billing does not scale past 10 clients. Recurring billing is the foundation of the entire revenue model.',
                  who: 'Operator',
                  status: 'â³ Backlog â€” needs Stripe Price IDs',
                },
                {
                  feature: 'Feature & Entitlement Engine â­',
                  what: 'A features table defines all gated capabilities (WhatsApp, coupons, customer accounts, white-label, leads, analytics, heatmaps, custom domains). A plan_features table maps defaults. An admin_overrides table allows per-client exceptions. Effective entitlements = plan defaults + admin overrides.',
                  why: 'Without this, every new feature requires scattered if-plan checks across components and API routes. With it, adding a new gated feature is a single DB row.',
                  who: 'Operator',
                  status: 'ðŸ”´ Foundation â€” build before Phase 11',
                },
                {
                  feature: 'Trial Duration Configuration',
                  what: 'Store trial_duration_value + trial_duration_unit (or starts_at / expires_at) on the client record instead of hardcoding "14 days" in the application. Admin can set 7, 14, 21, 30, or 60-day trials without code changes.',
                  why: 'Different prospects need different trial lengths. A hardcoded 14-day trial cannot be extended for a high-value prospect without a code change.',
                  who: 'Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 11',
                },
                {
                  feature: 'Trial Account Request System',
                  what: 'Public form at /trial â€” prospect fills business info, contact, country, business type, intended use, accepts privacy notice. Admin sees Pending Trial Requests list with Approve/Reject. On approve: account created, trial plan applied, entitlements generated, welcome email sent with login link + expiry date.',
                  why: 'A person requesting a trial is not yet a client. A structured request workflow separates interest from activation, enables screening, and creates an audit trail.',
                  who: 'Operator + Customer',
                  status: 'ðŸ“‹ Planned â€” Phase 11',
                },
                {
                  feature: 'Admin Subscription Override',
                  what: 'On /admin/clients/[id]: Upgrade / Downgrade / Extend / Pause / Cancel / Terminate buttons. Per-client feature toggle checkboxes (WhatsApp, coupons, customer accounts, white-label, leads, analytics) that override plan defaults. Every change logged to the event stream.',
                  why: 'During startup, you need to manually adjust what each client can access â€” giving a trial client Growth features, or revoking a specific feature without downgrading their plan.',
                  who: 'Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 11',
                },
                {
                  feature: 'Site Creation Wizard (9-step)',
                  what: 'Replace the current 3-step generate form with a full wizard: (1) Business Owner â€” existing or new client, (2) Business Info, (3) Business Type, (4) Subscription Plan, (5) Trial Duration, (6) Feature Entitlements, (7) Generate Site, (8) Review, (9) Activate. Admin profile pre-fills with a checkbox.',
                  why: 'Site creation now involves a client record, subscription selection, and entitlement setup. A wizard enforces the correct order and prevents orphaned sites.',
                  who: 'Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 11',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      item.status.startsWith('âœ…') ? 'bg-green-900/50 text-green-400' :
                      item.status.startsWith('â³') ? 'bg-red-900/50 text-red-400' :
                      item.status.startsWith('ðŸ”´') ? 'bg-red-900/50 text-red-400' :
                      'bg-gray-800 text-gray-500'
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs mb-1"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                  <p className="text-gray-600 text-xs"><span className="text-purple-400 font-medium">Who:</span> {item.who}</p>
                </div>
              ))}
            </div>
          </div>

          {/* â”€â”€ GROUP 2 â€” CRM, Leads & Outreach â”€â”€ */}
          <div>
            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <span className="bg-orange-900/50 text-orange-400 text-xs px-2 py-0.5 rounded-full">ðŸŸ  Commerce</span>
              Group 2 â€” CRM, Leads & Outreach
            </h3>
            <p className="text-gray-600 text-xs mb-4">Contact form, leads database, and outreach campaign center. Connects to the Smart Leads Engine planned in Phase 10.</p>
            <div className="space-y-3">
              {[
                {
                  feature: 'Contact / Inquiry Form',
                  what: '"Not ready to book? Send us a message" tab on every client site. Customer fills name, email, message. Lead saved to leads table. Owner notified by email. Owner sees Inquiries tab in dashboard with "Convert to Booking" button.',
                  why: 'Booking is a high-commitment action. A contact form captures warm leads before they vanish. Inquiry â†’ follow-up â†’ booking is a proven conversion path.',
                  who: 'Customer + Client + Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 10',
                },
                {
                  feature: 'Leads Master Database',
                  what: '/admin/leads cross-site view. Filter by country, business category, city, status, email status. Columns: business, website, email, phone, country, category, lead source, status, last contact. Exportable CSV.',
                  why: 'KITA sits across multiple local businesses simultaneously. A unified leads database enables cross-business promotion and outreach at scale â€” something no individual business can build alone.',
                  who: 'Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 10',
                },
                {
                  feature: 'Outreach & Campaign Center',
                  what: 'Full outreach pipeline: Prospects â†’ Lists â†’ Campaigns â†’ Email Templates â†’ Send Queue â†’ Delivery Status â†’ Replies â†’ Suppression List â†’ Unsubscribes â†’ Campaign Analytics. Lead progression: Prospect Found â†’ Qualified â†’ Added to Campaign â†’ Email Scheduled â†’ Sent â†’ Opened/Clicked/Replied â†’ Interested â†’ Trial Offered â†’ Trial Activated â†’ Converted Client.',
                  why: 'Manual outreach via DMs does not scale. A structured campaign system with delivery tracking and reply management enables 10x outreach with the same effort.',
                  who: 'Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 12',
                },
                {
                  feature: 'Global Suppression List & Privacy Compliance',
                  what: 'Do Not Contact registry keyed by email with reason, date_added, source. Any unsubscribe permanently prevents future campaign sends to that address. Each lead stores: source, country, legal_basis/outreach_basis, consent_status, email_status, unsubscribed_at, do_not_contact, last_contacted_at.',
                  why: 'Marketing rules differ by country. PH Data Privacy Act, AU Spam Act, UK PECR, US CAN-SPAM all impose different obligations. Building compliance in from the start prevents legal exposure.',
                  who: 'Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 12',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      item.status.startsWith('âœ…') ? 'bg-green-900/50 text-green-400' :
                      item.status.startsWith('â³') ? 'bg-red-900/50 text-red-400' :
                      'bg-gray-800 text-gray-500'
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs mb-1"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                  <p className="text-gray-600 text-xs"><span className="text-purple-400 font-medium">Who:</span> {item.who}</p>
                </div>
              ))}
            </div>
          </div>

          {/* â”€â”€ GROUP 3 â€” Customer Accounts & Loyalty â”€â”€ */}
          <div>
            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <span className="bg-orange-900/50 text-orange-400 text-xs px-2 py-0.5 rounded-full">ðŸŸ  Commerce</span>
              Group 3 â€” Customer Accounts & Loyalty
            </h3>
            <p className="text-gray-600 text-xs mb-4">Optional customer registration per client site. Gated by plan (Growth+). Multi-tenant: Salon A customers never visible to Mechanic B.</p>
            <div className="space-y-3">
              {[
                {
                  feature: 'Customer Registration + Client Customer Database',
                  what: 'Owner settings: Guest Only / Guest + Optional Account / Account Required. Customers register per client site. Owner sees Customers tab: name, email, bookings count, last visit, status. Export CSV. Supabase RLS ensures strict multi-tenant isolation â€” client A cannot query client B\'s customers.',
                  why: 'Repeat customers are the backbone of service businesses. A customer database enables loyalty programs, targeted promotions, and booking history â€” none of which are possible without persistent identity.',
                  who: 'Client + Customer',
                  status: 'ðŸ“‹ Planned â€” Phase 11',
                },
                {
                  feature: 'Customer Profile (Owner View)',
                  what: 'Per-customer page in owner dashboard: Booking History, Total Spend, Last Booking, Upcoming Booking, Promotions Used, Internal Notes.',
                  why: 'An owner who can see "Maria has booked 12 times and spent $840" can personalise service and offers in ways that drive loyalty and referrals.',
                  who: 'Client',
                  status: 'ðŸ“‹ Planned â€” Phase 11',
                },
                {
                  feature: 'Business Rank + Badges',
                  what: 'Three-layer identity per client site: (1) Rank (Newcomer â†’ Starter â†’ Active â†’ Established â†’ Growing â†’ Pro â†’ Elite â†’ Premier â†’ Pioneer â†’ Legend) scored by weighted formula (Recent Bookings 20%, Booking Growth 15%, Recent Activity 15%, Customer Engagement 15%, Feature Adoption 10%, Site Completeness 10%, Tenure 10%, Reliability 5%). (2) Subscription badge. (3) Earned badges (Early Adopter, Booking Pro, AI Pioneer). Rank recalculated periodically using Lifetime + Rolling 90-day + Growth Score. Rank history tracked month by month.',
                  why: 'Gamification drives product engagement. A visible rank progression gives owners a reason to keep using the platform actively. Rank history provides analytics on business health over time.',
                  who: 'Client + Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 13',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium bg-gray-800 text-gray-500">{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs mb-1"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                  <p className="text-gray-600 text-xs"><span className="text-purple-400 font-medium">Who:</span> {item.who}</p>
                </div>
              ))}
            </div>
          </div>

          {/* â”€â”€ GROUP 4 â€” Promotions & Coupon Engine â”€â”€ */}
          <div>
            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <span className="bg-orange-900/50 text-orange-400 text-xs px-2 py-0.5 rounded-full">ðŸŸ  Commerce</span>
              Group 4 â€” Promotions & Coupon Engine
            </h3>
            <p className="text-gray-600 text-xs mb-4">WooCommerce-style coupon system per client site. Gated by plan. Feeds the Smart Leads promotion blasts.</p>
            <div className="space-y-3">
              {[
                {
                  feature: 'Coupon & Promotion Engine',
                  what: 'Owner creates coupons in dashboard: Code, Percentage or Fixed discount, Start/End date, Minimum booking amount, Maximum discount, Usage limit, Per-customer limit, Applicable services, Applicable staff, Active/Inactive toggle. Customers enter code at booking. Types: first-booking, returning-customer, seasonal, service-specific, referral, automatic.',
                  why: 'Promo codes are the #1 tool for first-time customer acquisition on social media. "DM us for your code" is a proven tactic. Growth/Agency plan feature creates a natural upgrade incentive.',
                  who: 'Client + Customer',
                  status: 'ðŸ“‹ Planned â€” Phase 11',
                },
                {
                  feature: 'Smart Cross-Business Promotion Blasts',
                  what: 'Operator aggregates opted-in leads from across all KITA client sites by city + business type. Compose a promotion: headline, offer text, CTA URL, expiry. Send targeted email via Resend to filtered audience. Track sent/opened/clicked per campaign. Revenue: $49/blast charged to promoting client.',
                  why: 'KITA uniquely sits across multiple local businesses simultaneously. No individual business can build a local loyalty network alone â€” KITA can aggregate it automatically.',
                  who: 'Operator + Client',
                  status: 'ðŸ“‹ Planned â€” Phase 10',
                },
                {
                  feature: 'Stripe Booking Deposit',
                  what: 'Owner sets a % deposit (e.g. 20%) required at booking time via Stripe. Customer pays deposit when confirming. Remainder paid at service.',
                  why: 'No-shows cost service businesses 10-15% of revenue. A deposit creates skin in the game â€” customers who pay almost always show up.',
                  who: 'Client + Customer',
                  status: 'ðŸ“‹ Planned â€” Phase 8',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium bg-gray-800 text-gray-500">{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs mb-1"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                  <p className="text-gray-600 text-xs"><span className="text-purple-400 font-medium">Who:</span> {item.who}</p>
                </div>
              ))}
            </div>
          </div>

          {/* â”€â”€ GROUP 5 â€” Platform Events & Audit Center â”€â”€ */}
          <div>
            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <span className="bg-red-900/50 text-red-400 text-xs px-2 py-0.5 rounded-full">ðŸ”´ Foundation</span>
              Group 5 â€” Platform Events & Audit Center
            </h3>
            <p className="text-gray-600 text-xs mb-4">Universal structured event stream. Powers notifications, audit trail, admin impersonation logging, and future analytics.</p>
            <div className="space-y-3">
              {[
                {
                  feature: 'Universal Event Stream (Activity & Events)',
                  what: 'Every meaningful platform action writes to an events table: event_id, timestamp, event_type, category, actor_type, actor_id, client_id, site_id, entity_type, entity_id, metadata, severity, ip_address. Event types include: booking.created, booking.cancelled, site.created, email.sent, lead.created, lead.converted, subscription.created, subscription.upgraded, subscription.cancelled, coupon.redeemed, customer.registered, admin.feature_granted, auth.login, auth.failed. Admin UI at /admin/events â€” filter by category, client, site, severity, date range.',
                  why: 'Separate booking logs + email logs + subscription logs + site logs creates fragmented visibility. A universal event stream gives a single timeline of everything that happened, to anyone who needs it.',
                  who: 'Operator',
                  status: 'ðŸ”´ Foundation â€” Phase 11',
                },
                {
                  feature: 'Notification Center',
                  what: 'In-admin notification bell. Unread/All tabs. Notification types: New booking received, Trial request pending, Payment failed, Subscription expiring, New lead received, Site health issue detected, Coupon limit reached, Customer registered. Events trigger notifications where relevant â€” not every event creates a notification.',
                  why: 'As KITA grows beyond 10 clients, the admin needs a single place to see what requires attention â€” not a flood of emails.',
                  who: 'Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 11',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${item.status.startsWith('ðŸ”´') ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-500'}`}>{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs mb-1"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                  <p className="text-gray-600 text-xs"><span className="text-purple-400 font-medium">Who:</span> {item.who}</p>
                </div>
              ))}
            </div>
          </div>

          {/* â”€â”€ GROUP 6 â€” Analytics, Attribution & Visitor Intelligence â”€â”€ */}
          <div>
            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <span className="bg-yellow-900/50 text-yellow-400 text-xs px-2 py-0.5 rounded-full">ðŸŸ¡ CRM & Growth</span>
              Group 6 â€” Analytics, Attribution & Visitor Intelligence
            </h3>
            <p className="text-gray-600 text-xs mb-4">Where do bookings actually come from? Goes beyond page view counts into source attribution, geographic breakdowns, and behavioral analysis.</p>
            <div className="space-y-3">
              {[
                {
                  feature: 'Lead Source / Attribution Tracking',
                  what: 'Every lead, booking, inquiry, and registration captures: source, medium, campaign, referrer, landing_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term. Standard sources: direct, organic, google, facebook, instagram, whatsapp, messenger, email, referral, paid_search, paid_social. Client analytics shows "WHERE BOOKINGS COME FROM" as a percentage breakdown.',
                  why: '"You had 47 site visits" is weak. "34% of your bookings came from Google, 24% from Facebook" tells a business owner where to invest. Attribution transforms analytics from vanity to commercial intelligence.',
                  who: 'Client + Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 12',
                },
                {
                  feature: 'Geographic Visitor Analytics',
                  what: 'Aggregate geography (country â†’ region â†’ city) from visitor data. Client analytics tab shows: Philippines 42%, Australia 28%, US 12%, CAN 7%. Does NOT store raw IP addresses â€” uses aggregated country/region-level data only.',
                  why: 'A PH salon owner seeing "28% of my visitors are from Australia" is unexpected and actionable intelligence. Geographic data also powers cross-market pricing and expansion decisions.',
                  who: 'Client + Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 12',
                },
                {
                  feature: 'Behavioral Heatmaps',
                  what: 'Click heatmap, scroll heatmap, engagement heatmap per client site. Shows Hero CTA (ðŸ”´ High), Services (ðŸŸ  Medium), Gallery (ðŸŸ¡ Medium), Footer (ðŸ”µ Low). Privacy-first: requires explicit opt-in consent from site visitors. Cookie/privacy banner configurable per site.',
                  why: 'Knowing where visitors click and how far they scroll reveals whether the booking CTA is visible and whether the services section drives action. This data improves conversion without guesswork.',
                  who: 'Client',
                  status: 'ðŸŸ¢ Intelligence â€” Phase 13',
                },
                {
                  feature: 'Client 360Â° Profile',
                  what: 'Clicking a client from /admin/clients opens a full 360 view with tabs: Overview, Sites, Subscription, Billing, Bookings, Customers, Leads, Activities, Analytics, SEO & Health, Integrations, Features, Events, Notes. Header shows: Rank badge, Plan badge, Status, Member since, Country, Sites count, Bookings total, Customers total, Leads total, MRR.',
                  why: 'The current client profile shows subscription + sites. A 360 view gives the operator everything needed to support, upsell, or troubleshoot any client in one place without switching tabs.',
                  who: 'Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 11',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full shrink-0 font-medium bg-gray-800 text-gray-500">{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs mb-1"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                  <p className="text-gray-600 text-xs"><span className="text-purple-400 font-medium">Who:</span> {item.who}</p>
                </div>
              ))}
            </div>
          </div>

          {/* â”€â”€ GROUP 7 â€” Administration & Environment Controls â”€â”€ */}
          <div>
            <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
              <span className="bg-green-900/50 text-green-400 text-xs px-2 py-0.5 rounded-full">ðŸŸ¢ Intelligence</span>
              Group 7 â€” Administration & Environment Controls
            </h3>
            <p className="text-gray-600 text-xs mb-4">Operator tooling that makes KITA manageable at scale â€” environment visibility, client impersonation, and WhatsApp/messenger integrations.</p>
            <div className="space-y-3">
              {[
                {
                  feature: 'Environment Display Panel',
                  what: 'Admin panel shows current environment status: Environment (LOCAL / STAGING / PRODUCTION ðŸŸ¢), Database (Production / Staging), Stripe (Live / Test), Email (Production / Test), AI (Enabled / Disabled). Read-only display â€” environment configuration lives in env vars and Vercel settings, not in the CMS.',
                  why: 'Vercel provides separate Local, Preview, and Production environments each with different API keys. A visible environment panel prevents confusion about which environment is active. API secrets should never switch via CMS â€” only env vars.',
                  who: 'Operator',
                  status: 'âœ… Partially built â€” Stripe mode toggle exists in Admin Settings',
                },
                {
                  feature: 'Admin Impersonation / "View as Client"',
                  what: 'From /admin/clients/[id]: "View as Client" button opens the client\'s owner dashboard as if logged in as them. Every impersonation session is logged to the event stream (actor: admin, action: impersonation.started/ended, client_id). No password required. "Exit Client View" banner always visible.',
                  why: 'When a client reports a bug, the fastest resolution is to see exactly what they see. Impersonation reduces support time from 20 minutes of back-and-forth to 2 minutes of direct observation.',
                  who: 'Operator',
                  status: 'ðŸŸ¢ Intelligence â€” Phase 13',
                },
                {
                  feature: 'WhatsApp / Messenger / Third-Party Integrations',
                  what: 'Client CMS Integrations tab: WhatsApp (Connected/Disabled + phone config), Messenger (Connect), Google Calendar (Configure). Behind the scenes, each integration is an entitlement: Feature + Plan default + Admin override = Effective state. Future integrations (TikTok, Instagram, Google Business, Zoom, Telegram, SMS) added as new entitlement rows â€” no subscription system rewrite needed.',
                  why: 'In PH, AU, and Southeast Asia WhatsApp is the primary communication channel. Google Calendar prevents double-booking by blocking time across personal and professional schedules.',
                  who: 'Client + Customer',
                  status: 'ðŸ“‹ Planned â€” Phase 8',
                },
                {
                  feature: 'Bulk Demo Site Generator',
                  what: 'Generate 5 demo sites across different niches in one click for outreach purposes. Admin picks 5 business types â†’ AI generates one realistic demo site per type.',
                  why: 'When pitching to a barbershop, showing a live barbershop demo is 10x more persuasive than a generic one. Speed of demo creation = more outreach per day.',
                  who: 'Operator',
                  status: 'ðŸ“‹ Planned â€” Phase 8',
                },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      item.status.startsWith('âœ…') ? 'bg-green-900/50 text-green-400' :
                      'bg-gray-800 text-gray-500'
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs mb-1"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                  <p className="text-gray-600 text-xs"><span className="text-purple-400 font-medium">Who:</span> {item.who}</p>
                </div>
              ))}
            </div>
          </div>

          {/* â”€â”€ EXISTING FEATURES â€” RETAINED â”€â”€ */}
          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">âœ… Built</span>
              Already Shipped â€” Core Platform
            </h3>
            <div className="space-y-3">
              {[
                { feature: 'AI Site Generator (3-step form)', what: 'Client selects business type, configures services + currency, enters details â€” AI generates the full site in ~10 seconds.', why: 'One person can generate 10 client sites per day. Time = money.', who: 'Operator', status: 'âœ… Built' },
                { feature: 'Revenue Dashboard / MRR Tracker', what: 'Monthly recurring revenue, setup fees, annual projection, per-site breakdown, By Client tab â€” all with CSV export.', why: 'Without revenue visibility you cannot make pricing, scaling, or retention decisions.', who: 'Operator', status: 'âœ… Built' },
                { feature: 'Client Management System (Phase 9)', what: 'CRM: subscription plan, status, MRR, linked sites, notes. Auto-upsert on booking. Stripe webhook sets active status on payment.', why: 'Client records link sites to people and enable proper MRR tracking.', who: 'Operator', status: 'âœ… Built' },
                { feature: 'Stripe Test/Live Mode Toggle', what: 'Admin Settings toggle backed by admin_config Supabase table. Switches checkout and webhook keys without redeploy.', why: 'Safe development testing without ever touching production payments.', who: 'Operator', status: 'âœ… Built' },
                { feature: 'White-Label Mode', what: 'Removes all KITA branding. Agency name, logo, tagline, URL via env vars. Per-site override via theme_json.', why: 'Agencies reselling KITA need to present it as their own product.', who: 'Operator', status: 'âœ… Built' },
                { feature: 'Website Audit Module (Phases 1-3)', what: 'Performance (PSI), SEO (cheerio), Security headers, Tech Stack, Accessibility, 10-page crawler, PDF report.', why: '"Your SEO score is 42/100" closes more deals than any sales pitch.', who: 'Operator + Client', status: 'âœ… Built' },
                { feature: '10-Tab Owner Dashboard', what: 'Bookings, Services, Staff, Hours, About, Reviews, Gallery, Analytics, Settings, AI Assistant.', why: 'Full self-service CMS eliminates support requests and increases client retention.', who: 'Client', status: 'âœ… Built' },
                { feature: 'Smart Booking System (Phase 6)', what: 'Availability check, next slot suggestion, confirmation page, Add to Calendar, cancel/reschedule self-service, Block Dates, auto-confirm toggle, customer email auto-fill.', why: 'Reduces no-shows, eliminates double-bookings, gives customers control.', who: 'Client + Customer', status: 'âœ… Built' },
                { feature: 'Booking Reminder Email / SMS', what: 'Auto-send reminder 24h before appointment via Resend (email) and Twilio (SMS).', why: '24h reminders reduce no-shows by 30-40%.', who: 'Customer', status: 'â³ Backlog â€” needs Twilio' },
                { feature: 'Booking Calendar View', what: 'Weekly/monthly calendar view of bookings in owner dashboard.', why: 'A calendar shows gaps and busy periods instantly â€” how service businesses think about their schedule.', who: 'Client', status: 'ðŸ“‹ Planned â€” Phase 7' },
                { feature: 'Google Calendar Integration', what: 'Confirmed bookings automatically block time in the owner\'s Google Calendar.', why: 'Most owners run their schedule from Google Calendar. Manual copying is high friction.', who: 'Client', status: 'ðŸ“‹ Planned â€” Phase 8' },
                { feature: 'Google Maps Link / Get Directions', what: 'Business address with "Get Directions" button opening Google Maps.', why: 'A first-time customer who cannot find the location will not return.', who: 'Customer', status: 'ðŸ“‹ Planned â€” Phase 7' },
                { feature: 'Gemini Webhook Auto-Generation', what: 'After $150 payment, Gemini auto-generates site â€” client sees it live within 30 seconds.', why: 'The magic moment that justifies the product. Currently blocked by Gemini 503 errors from Vercel IPs.', who: 'Operator + Client', status: 'â³ Backlog â€” Gemini API issue' },
              ].map((item, i) => (
                <div key={i} className="bg-gray-950 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white font-semibold text-sm">{item.feature}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                      item.status.startsWith('âœ…') ? 'bg-green-900/50 text-green-400' :
                      item.status.startsWith('â³') ? 'bg-red-900/50 text-red-400' :
                      'bg-gray-800 text-gray-500'
                    }`}>{item.status}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-1"><span className="text-gray-300 font-medium">What:</span> {item.what}</p>
                  <p className="text-gray-500 text-xs mb-1"><span className="text-blue-400 font-medium">Why:</span> {item.why}</p>
                  <p className="text-gray-600 text-xs"><span className="text-purple-400 font-medium">Who:</span> {item.who}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Pitch */}
          <div className="bg-blue-950/20 border border-blue-800 rounded-xl p-5">
            <p className="text-blue-400 font-bold text-sm mb-3">ðŸ’¼ Commercial Pitch â€” What to Tell Prospective Clients</p>
            <div className="space-y-2 text-sm text-gray-400">
              {[
                '"Your customers can book you 24/7 â€” even while you sleep. No more missed bookings via Instagram DMs."',
                '"They pick their preferred stylist, select a service, and get an instant confirmation â€” in under 60 seconds."',
                '"You see all bookings in one place. Confirm, cancel, or let it auto-approve â€” your choice."',
                '"Edit your services and prices anytime â€” just type it in chat: \'change my haircut to $80\'."',
                '"Your site shows your hours, your team, your gallery, and your reviews â€” all managed from one dashboard."',
                '"Customers get a reminder before their appointment â€” fewer no-shows, more revenue."',
                '"Built for salons, clinics, mechanics, cafes, and pet clinics â€” across AU, US, UK, PH."',
                '"$150 to launch. $29/month to keep it running. That\'s less than one booking per month to pay for itself."',
              ].map((pitch, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-blue-400 shrink-0">â†’</span>
                  <p className="italic">{pitch}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'client-management',
      title: 'Client Management System (Phase 9)',
      icon: Users,
      content: (
        <div className="space-y-5">
          <div className="bg-gray-950 border border-green-800/50 rounded-xl p-4">
            <p className="text-green-400 font-bold text-sm mb-2">âœ… Phase 9 â€” Complete</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Client Management System is fully built and integrated. You can track who your clients are, their subscription status, revenue contribution, all businesses they manage, and your internal notes. Booking auto-creates a client record when an email is provided. Sites table shows which client owns each site. Revenue dashboard has a "By Client" tab with MRR per client. Access via <strong className="text-white">Admin â†’ Clients</strong> or <code className="text-blue-300 font-mono">/admin/clients</code>.
            </p>
          </div>

          {/* What was built */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-4">
            <p className="text-white font-semibold text-sm mb-3">âœ… What Was Built</p>
            <div className="space-y-3">
              {[
                {
                  route: '/admin/clients',
                  title: 'Client List âœ…',
                  desc: 'Searchable, filterable table of all clients. Shows name, email, country, plan badge, status badge, sites count, MRR contribution, source, joined date. Filter by status and country. CSV export.',
                },
                {
                  route: '/admin/clients/[id]',
                  title: 'Client Profile âœ…',
                  desc: 'Full editable profile: name, email, phone, country, city, subscription plan/status, source, notes, onboarding toggle. Revenue summary (MRR, setup fees paid, annual projection). All their sites with view/dashboard links.',
                },
                {
                  route: '/admin/clients/new',
                  title: 'Create Client âœ…',
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
              <p className="text-white font-semibold text-sm">Database â€” <code className="text-blue-300 font-mono">clients</code> table âœ…</p>
              <p className="text-gray-500 text-xs mt-0.5">Run <code className="font-mono text-yellow-300">supabase/clients.sql</code> â€” already executed</p>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {[
                  ['id', 'uuid', 'Primary key'],
                  ['name', 'text', 'Full name of business owner'],
                  ['email', 'text unique', 'Primary contact â€” unique per client'],
                  ['phone', 'text', 'WhatsApp / mobile'],
                  ['country', 'text', 'e.g. AU, PH, US, UK â€” market segmentation'],
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
            <p className="text-white font-semibold text-sm mb-2">Sites â†’ Client Link âœ…</p>
            <p className="text-gray-400 text-xs mb-2"><code className="text-blue-300 font-mono">sites.client_id</code> FK added. One client can own many sites.</p>
            <pre className="bg-gray-900 rounded-lg p-3 text-xs text-green-300 font-mono">{`alter table sites
  add column if not exists client_id uuid references clients(id) on delete set null;`}</pre>
          </div>

          {/* Subscription plans â€” full matrix */}
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
                      <span className="text-gray-600">Free Â· 14 days</span>
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
                    { feature: 'Online booking widget', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'AI site generation', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'Owner dashboard (10 tabs)', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'Email booking notifications', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'Site analytics (14-day)', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'Cancel / reschedule links', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'Block dates / time off', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'Gallery & logo upload', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'AI assistant (9 tools)', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'Contact / inquiry form', trial: 'â€”', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'SMS booking reminders', trial: 'â€”', starter: 'â€”', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'Priority support', trial: 'â€”', starter: 'â€”', growth: 'âœ“', agency: 'âœ“' },
                    { feature: 'Promotion blast (per mo)', trial: 'â€”', starter: 'â€”', growth: '2 blasts', agency: '5 blasts' },
                    { feature: 'White-label mode', trial: 'â€”', starter: 'â€”', growth: 'â€”', agency: 'âœ“' },
                    { feature: 'Custom domain', trial: 'â€”', starter: 'â€”', growth: 'â€”', agency: 'âœ“' },
                    { feature: 'Dedicated onboarding call', trial: 'â€”', starter: 'â€”', growth: 'â€”', agency: 'âœ“' },
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
                { task: 'Auto-upsert client record when customer books (email provided)', status: 'âœ… Done â€” /api/notify' },
                { task: 'Client column in /admin/sites table (linked, clickable)', status: 'âœ… Done' },
                { task: '"By Client" tab in /admin/revenue with MRR per client + totals row', status: 'âœ… Done' },
                { task: 'Stripe webhook â†’ update client.subscription_status on payment event', status: 'âœ… Done â€” /api/webhook' },
              ].map(item => (
                <div key={item.task} className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2">
                  <span>{item.task}</span>
                  <span className={`shrink-0 ml-3 ${item.status.startsWith('âœ…') ? 'text-green-500' : 'text-yellow-600'}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // â”€â”€â”€ SUBSCRIPTION PLANS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                ideal: 'Solo service business â€” 1 location, 1 owner managing their own site.',
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
                    { section: 'ðŸŒ Sites', rows: [
                      { feature: 'Client sites included', trial: '1', starter: '1', growth: '3', agency: '10' },
                      { feature: 'Additional sites', trial: 'â€”', starter: '+$29/ea', growth: '+$29/ea', agency: '+$29/ea' },
                    ]},
                    { section: 'ðŸ“… Booking System', rows: [
                      { feature: 'Online booking widget (24/7)', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'Service selector + staff picker', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'Real-time availability check', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'Cancel / reschedule self-service', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'Block out dates / time off', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'Auto-confirm toggle', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    ]},
                    { section: 'ðŸ¤– AI & CMS', rows: [
                      { feature: 'AI site generation (~10 sec)', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'Owner dashboard (10 tabs)', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'AI assistant (9 editing tools)', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'Gallery + logo upload', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                    ]},
                    { section: 'ðŸ“Š Analytics & Notifications', rows: [
                      { feature: 'Email booking notifications', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'Site analytics (14-day chart)', trial: 'âœ“', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'SMS booking reminders (Twilio)', trial: 'â€”', starter: 'â€”', growth: 'âœ“', agency: 'âœ“' },
                    ]},
                    { section: 'ðŸ“¬ Leads & Promotions (Phase 10)', rows: [
                      { feature: 'Contact / inquiry form', trial: 'â€”', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'Owner Inquiries dashboard', trial: 'â€”', starter: 'âœ“', growth: 'âœ“', agency: 'âœ“' },
                      { feature: 'Promotion blasts per month', trial: 'â€”', starter: 'â€”', growth: '2', agency: '5' },
                      { feature: 'Cross-network audience access', trial: 'â€”', starter: 'â€”', growth: 'âœ“', agency: 'âœ“' },
                    ]},
                    { section: 'ðŸ·ï¸ Branding & Scale', rows: [
                      { feature: 'White-label mode', trial: 'â€”', starter: 'â€”', growth: 'â€”', agency: 'âœ“' },
                      { feature: 'Custom domain', trial: 'â€”', starter: 'â€”', growth: 'â€”', agency: 'âœ“' },
                      { feature: 'Dedicated onboarding call', trial: 'â€”', starter: 'â€”', growth: 'â€”', agency: 'âœ“' },
                      { feature: 'Priority support', trial: 'â€”', starter: 'â€”', growth: 'âœ“', agency: 'âœ“' },
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
            <p className="text-white font-semibold text-sm mb-4">When to Upgrade â€” Sales Triggers</p>
            <div className="space-y-3">
              {[
                { from: 'Trial', to: 'Starter', trigger: 'Trial period ends (14 days). Client is getting bookings and sees value. Conversion pitch: "You got X bookings this week â€” let\'s keep them coming at $29/mo."', color: 'border-blue-800' },
                { from: 'Starter', to: 'Growth', trigger: 'Client opens a second location OR wants SMS reminders to reduce no-shows OR wants to run a promotion to their customers. At $49 it\'s $20 more for significantly more tools.', color: 'border-green-800' },
                { from: 'Growth', to: 'Agency', trigger: 'Client is an agency/freelancer managing 4+ business sites, wants to remove KITA branding for their own clients, or needs a custom domain for white-label presentation.', color: 'border-purple-800' },
              ].map(u => (
                <div key={u.from} className={`border rounded-xl p-4 bg-gray-900/50 ${u.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-400 text-xs font-bold">{u.from}</span>
                    <span className="text-gray-600">â†’</span>
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
            <p className="text-yellow-400 text-xs font-semibold mb-1">âš ï¸ Implementation Status</p>
            <div className="space-y-1 text-xs text-yellow-200/50">
              <p>âœ… Plan tiers defined in <code className="font-mono text-yellow-300">types/database.ts</code> + tracked per client in <code className="font-mono text-yellow-300">clients</code> table</p>
              <p>âœ… MRR rates in <code className="font-mono text-yellow-300">app/admin/clients/page.tsx</code> (MONTHLY_RATES constant)</p>
              <p>âœ… Plan badge shown in <code className="font-mono text-yellow-300">/admin/clients</code> + <code className="font-mono text-yellow-300">/admin/revenue</code></p>
              <p>â³ Stripe recurring subscriptions â€” needs Stripe Products + Prices + live keys (Backlog)</p>
              <p>â³ Auto-downgrade on payment failure â€” needs <code className="font-mono text-yellow-300">invoice.payment_failed</code> webhook handler</p>
              <p>â³ Client self-service plan upgrade page â€” planned Phase 11</p>
            </div>
          </div>
        </div>
      ),
    },
    // â”€â”€â”€ PHASE 10 â€” CONTACT FORM + LEADS ENGINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'leads-engine',
      title: 'Contact Form & Smart Leads Engine (Phase 10)',
      icon: Users,
      content: (
        <div className="space-y-5">
          <div className="bg-gray-950 border border-blue-800/50 rounded-xl p-4">
            <p className="text-blue-400 font-bold text-sm mb-2">ðŸ“‹ Phase 10 â€” Planned</p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Two connected features: a <strong className="text-white">Contact / Inquiry Form</strong> on every client site to capture warm leads before they book, and a <strong className="text-white">Smart Leads Engine</strong> that aggregates those leads across all KITA client sites for intelligent cross-business promotions.
            </p>
          </div>

          {/* Feature 1 â€” Contact Form */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm">ðŸ“¬ Feature 1 â€” Contact / Inquiry Form</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-800 text-gray-400">ðŸ“‹ Phase 10</span>
            </div>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-semibold mb-1">What</p>
                <p>A second tab on the public client site â€” <span className="text-blue-300 italic">"Not ready to book? Send us a message."</span> Customer fills in name, email, and a free-text message. No commitment. Zero friction.</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Why</p>
                <p>Booking is a high-commitment action. Customers who are curious but unsure will leave rather than book if there is no middle option. A contact form captures that warm lead before it disappears. The conversion path <span className="text-green-400">inquiry â†’ follow-up â†’ booking</span> is well established in service sales.</p>
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
                  { area: 'Public Site', desc: 'New "Enquire" tab next to the Booking widget. Fields: Name, Email, Message. Submit â†’ thank-you state.' },
                  { area: 'Owner Dashboard', desc: 'New "Inquiries" tab â€” list of leads with name, email, message, timestamp. One-click "Convert to Booking".' },
                  { area: 'Email Notification', desc: 'Owner receives email via Resend when a new inquiry arrives. Same flow as booking notification.' },
                  { area: 'API Route', desc: 'POST /api/inquire â€” saves to leads table (site_id, name, email, message, source: "contact_form"). Returns 200.' },
                  { area: 'Admin /admin/leads', desc: 'Cross-site leads view â€” all inquiries from all client sites in one table, searchable, filterable by site.' },
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

          {/* Feature 2 â€” Smart Leads Engine */}
          <div className="bg-gray-950 border border-purple-800/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm">ðŸ§  Feature 2 â€” Smart Leads Engine</p>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-800 text-gray-400">ðŸ“‹ Phase 10</span>
            </div>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-semibold mb-1">What</p>
                <p>Aggregate all leads (contact form inquiries + booking customer emails) across every KITA client site into a central leads database. Use this data to run intelligent cross-business promotions â€” e.g. a customer who booked a haircut at Salon A in Sydney gets a targeted offer from Mechanic B, also a KITA client in Sydney.</p>
              </div>
              <div>
                <p className="text-white font-semibold mb-1">Why</p>
                <p>KITA is uniquely positioned: it sits across multiple local businesses and their customer bases simultaneously. No individual business can build this network alone â€” but KITA can aggregate it automatically. This creates a <span className="text-purple-300">local loyalty network</span> and a new revenue product: paid promotions sold to KITA clients ("send your offer to 2,000 local customers across our network â€” $49/blast").</p>
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
                <p className="text-white font-semibold mb-2">How It Works â€” 3 Layers</p>
                <div className="space-y-2">
                  {[
                    {
                      layer: 'Layer 1 â€” Lead Aggregation',
                      color: 'border-blue-700',
                      badge: 'bg-blue-900/50 text-blue-400',
                      points: [
                        'Every contact-form submission â†’ leads table (with site_id, business_type, city)',
                        'Every booking with customer_email â†’ also seeded into leads (source: "booking")',
                        'Customers opt-in at inquiry/booking with a checkbox: "I\'d like to hear about local offers"',
                        'opt_in: boolean on the leads row â€” promotions only go to opted-in leads',
                      ],
                    },
                    {
                      layer: 'Layer 2 â€” Segmentation',
                      color: 'border-purple-700',
                      badge: 'bg-purple-900/50 text-purple-400',
                      points: [
                        'Leads tagged by city, business_type of the originating site, and source',
                        'Admin /admin/leads: filter by city + business_type to build a promotion audience',
                        'Example: "All Sydney leads from salon + mechanic sites in the last 90 days"',
                        'Audience size shown before sending â€” "you will reach 340 people"',
                      ],
                    },
                    {
                      layer: 'Layer 3 â€” Promotion Blast',
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
                            <span className="text-gray-700 shrink-0">â†’</span>{p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue angle */}
              <div className="bg-purple-950/30 border border-purple-800/50 rounded-xl p-4 mt-2">
                <p className="text-purple-300 font-semibold text-xs mb-2">ðŸ’° New Revenue Stream â€” Promotion Blasts</p>
                <div className="space-y-1.5 text-xs text-gray-500">
                  {[
                    'Charge KITA clients $49/blast to reach the full opted-in network in their city',
                    'Bundle: 2 blasts/month included in Growth plan ($49/mo) â€” creates plan upgrade incentive',
                    'Sell audience segments: "send to 500 pet clinic customers in Manila" â†’ $29',
                    'At 20 paying KITA clients each buying 1 blast/mo â†’ $980 additional MRR',
                  ].map((p, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-purple-500 shrink-0">â†’</span>{p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DB schema */}
          <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-white font-semibold text-sm">Database â€” <code className="text-blue-300 font-mono">leads</code> table</p>
              <p className="text-gray-500 text-xs mt-0.5">Run <code className="font-mono text-yellow-300">supabase/leads.sql</code> when Phase 10 development begins</p>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {[
                  ['id', 'uuid', 'Primary key'],
                  ['site_id', 'uuid FK', 'FK â†’ sites.id (cascade delete)'],
                  ['name', 'text', 'Customer name'],
                  ['email', 'text', 'Primary contact for follow-up'],
                  ['phone', 'text', 'Optional â€” captured if provided'],
                  ['message', 'text', 'Free-text inquiry message'],
                  ['source', 'text', 'contact_form | booking | audit_inquiry'],
                  ['status', 'text', 'new | contacted | converted | closed'],
                  ['opt_in', 'bool', 'Consented to receive promotions â€” default false'],
                  ['city', 'text', 'Copied from site at capture time â€” for geo-segmentation'],
                  ['business_type', 'text', 'Copied from site â€” for interest-based segmentation'],
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
            <p className="text-white font-semibold text-sm mb-3">New Routes â€” Phase 10</p>
            <div className="space-y-2 text-xs font-mono">
              {[
                { method: 'POST', path: '/api/inquire', desc: 'Save contact form inquiry â†’ leads table, send owner email notification' },
                { method: 'GET', path: '/admin/leads', desc: 'Cross-site leads list â€” all inquiries from all client sites, search + filter' },
                { method: 'POST', path: '/admin/leads/promote', desc: 'Compose and send a promotion blast to a filtered audience segment' },
                { method: 'GET', path: '/[slug]/inquiries', desc: 'Owner dashboard Inquiries tab â€” leads for this site only' },
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
    // â”€â”€â”€ CHANGELOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                { hash: 'e72f85f', type: 'ðŸ”§ Fix',       text: 'Stripe mode toggle â€” settings page writes via /api/admin-config (service role) to bypass RLS' },
                { hash: '8a1035e', type: 'ðŸ”§ Fix',       text: 'admin-config.sql â€” replaced unsupported "create policy if not exists" with drop+create for Supabase Postgres compat' },
                { hash: 'b1e78e0', type: 'âœ¨ Feature',   text: 'Stripe test/live mode toggle â€” Admin Settings, admin_config table, lib/stripe-config.ts, /api/admin-config route, checkout + webhook updated' },
                { hash: '6bf5aaa', type: 'ðŸ“‹ Plan',      text: 'Phase 10 documented â€” Contact Form + Smart Leads Engine: What/Why/Who/Status, leads table schema, new routes, pitch pages + README updated' },
                { hash: '64667c8', type: 'âœ… Complete',  text: 'Phase 9 complete â€” /admin/clients list + profile + new, Client column in /admin/sites, By Client tab in /admin/revenue, auto-upsert client on booking' },
                { hash: '5807265', type: 'ðŸ“‹ Plan',      text: 'Phase 9 plan â€” clients.sql, sidebar nav, docs section, placeholder page' },
                { hash: '0b4dc35', type: 'ðŸ”§ Fix',       text: 'Timezone + race condition â€” IANA timezone on sites/bookings, server-side 409 check, getTodayInTimezone moved to lib/timezones.ts, booking architecture docs' },
                { hash: 'c25cd1d', type: 'âœ… Complete',  text: 'Phase 6 complete â€” Smart Booking System: availability check, next slot, /booking/[id] confirmation, Add to Calendar, cancel/reschedule, Block Dates, auto-confirm toggle, email auto-fill' },
                { hash: '82e1440', type: 'ðŸ“ Docs',      text: 'Feature roadmap rewritten with What/Why/Who/Status standard across all features' },
                { hash: '5dac1eb', type: 'âœ… Complete',  text: 'Phase 5 complete â€” 3-step generate form: service selector + custom pricing, currency picker (10 currencies), currency on public site + booking form' },
              ],
            },
            {
              date: '2026-09-27 Â· session 2',
              entries: [
                { hash: '601ace0', type: 'ðŸ”§ Fix',       text: 'React.Fragment with key prop replacing bare <> fragment in pricing matrix â€” resolved React console warning' },
                { hash: '58e10da', type: 'ðŸ“ Docs',      text: 'Subscription Plans documented â€” full feature matrix table in client-management section; new standalone Pricing section (plan cards, comparison table, upgrade triggers, MRR projections); pricing comparison on /pitch; README updated' },
                { hash: '01d4163', type: 'âœ… Complete',  text: 'Stripe webhook â†’ client integration on payment â€” upsert client record, set subscription_status=active, plan=starter, onboarding_complete=true, link sites.client_id; docs integration point marked Done' },
                { hash: 'b1e78e0', type: 'âœ¨ Feature',   text: 'Stripe test/live mode toggle â€” Admin Settings, admin_config Supabase table, lib/stripe-config.ts, /api/admin-config server route (service role), checkout + webhook updated' },
              ],
            },
            {
              date: '2026-09-26',
              entries: [
                { hash: 'b922dff', type: 'ðŸ“ Docs',      text: 'Docs + README: full project overview updated â€” both products, Phases 5â€“8 roadmap, commercial pitch section' },
                { hash: 'aeb80f0', type: 'âœ¨ Feature',   text: 'Template custom fields â€” notes_label/placeholder/required per template type; BookingForm updated' },
                { hash: '2522aa1', type: 'âœ¨ Feature',   text: 'Audit pitch page /audit-pitch built; README updated to 27 routes' },
                { hash: '9fa77cc', type: 'âœ… Complete',  text: 'Audit Phase 3 â€” PDF report via jsPDF, Forensic format, 8 sections, multi-page download' },
                { hash: 'd6f2bb0', type: 'âœ… Complete',  text: 'Audit Phase 2 â€” Crawler (10 pages, 3 concurrent), Pages tab, broken links, History search/delete/score trend' },
                { hash: 'a9af653', type: 'âœ… Complete',  text: 'Audit Phase 1 â€” Performance (PSI), SEO (cheerio), Security headers, Tech fingerprinting, Accessibility (WCAG 2.1), score rings, issue explorer' },
              ],
            },
            {
              date: '2026-09-25',
              entries: [
                { hash: '9c30201', type: 'âœ¨ Feature',   text: 'Gallery renders on public site â€” "Our Work" grid, 2-col mobile / 3-col desktop, hover zoom' },
                { hash: 'cc38ce0', type: 'âœ¨ Feature',   text: 'Staff booking â€” preferred staff picker in booking form, staff_id + staff_name saved to booking and shown in dashboard + email' },
                { hash: 'cd8f05b', type: 'âœ¨ Feature',   text: 'Site analytics â€” page_views table, /api/track, Analytics tab in owner dashboard (14-day chart, weekly trend), views in revenue page' },
                { hash: 'f703e01', type: 'âœ… Complete',  text: 'No-blocker backlog complete â€” PIN change, logo upload, gallery, testimonials editor, MRR revenue dashboard, CSV export' },
                { hash: 'cbd7ba1', type: 'ðŸ”§ Fix',       text: 'Webhook maxDuration=60; respond to Stripe immediately then generate in background' },
                { hash: '713e9bd', type: 'ðŸ”§ Fix',       text: 'Stripe server-only import fixed; lib/pricing.ts split to client-safe module' },
              ],
            },
            {
              date: '2026-09-24',
              entries: [
                { hash: '50d34af', type: 'âœ… Complete',  text: 'Week 3 â€” Stripe payments: /api/checkout, /api/webhook, /onboard, /onboard/success, payments.sql, payment_status tracking, Pay & Launch CTA on pitch page' },
              ],
            },
            {
              date: '2026-09-23',
              entries: [
                { hash: 'b76b8c1', type: 'âœ… Complete',  text: 'Week 2 complete â€” Outreach pitch page /pitch, mobile responsive (sticky nav, responsive grids), Resend email fix' },
                { hash: 'd648171', type: 'âœ¨ Feature',   text: 'Owner dashboard â€” Staff, Hours, About, AI Assistant tabs added (total 10 tabs)' },
                { hash: 'ddc8bc3', type: 'âœ… Complete',  text: 'Week 1 complete â€” Templates marketplace (11 templates), Agentic AI assistant (9 tools via Gemini function-calling)' },
                { hash: 'c9217bf', type: 'ðŸŽ‰ Init',      text: 'KITA Builder Systems v1 â€” Initial commit: Next.js 16, Supabase schema, 5 templates, admin CMS, public site renderer, booking form, owner dashboard, Gemini AI generation' },
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
                      entry.type.startsWith('âœ…') ? 'text-green-400' :
                      entry.type.startsWith('âœ¨') ? 'text-blue-400' :
                      entry.type.startsWith('ðŸ”§') ? 'text-yellow-400' :
                      entry.type.startsWith('ðŸ“') ? 'text-gray-400' :
                      entry.type.startsWith('ðŸ“‹') ? 'text-purple-400' :
                      entry.type.startsWith('ðŸŽ‰') ? 'text-pink-400' :
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
                { icon: 'ðŸŽ‰ Init',     color: 'text-pink-400',   desc: 'Project initialisation' },
                { icon: 'âœ… Complete', color: 'text-green-400',  desc: 'Phase or feature fully shipped' },
                { icon: 'âœ¨ Feature',  color: 'text-blue-400',   desc: 'New feature added' },
                { icon: 'ðŸ”§ Fix',      color: 'text-yellow-400', desc: 'Bug fix or correction' },
                { icon: 'ðŸ“ Docs',     color: 'text-gray-400',   desc: 'Documentation update only' },
                { icon: 'ðŸ“‹ Plan',     color: 'text-purple-400', desc: 'Planned, not yet built' },
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
    // â”€â”€â”€ BACKLOG â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    {
      id: 'backlog',
      title: 'Backlog â€” Next Week',
      icon: ListTodo,
      content: (
        <div className="space-y-6">
          <p className="text-gray-400 text-sm">
            Tasks that require paid accounts or billing activation. Code preparation is done â€” just needs account setup and testing.
          </p>

          {[
            {
              label: 'ðŸ”´ Blocked â€” Needs Gemini Account Fix',
              color: 'border-red-800',
              tasks: [
                {
                  title: 'Webhook auto-generation after Stripe payment',
                  status: 'Code complete â€” blocked on Gemini API',
                  blocker: 'All 3 Gemini models (gemini-3.6-flash, gemini-2.5-flash, gemini-2.5-flash-lite) return 503 unavailable from Vercel servers. Confirmed via Vercel live logs â€” execution is only 5.58s so it is NOT a timeout. Root cause: AQ. key rate limit or IP restriction on Vercel. Fix: create a new API key at aistudio.google.com/app/apikey, replace GEMINI_API_KEY in .env.local and Vercel env vars, test locally first.',
                  effort: '30 min once new key is working',
                },
                {
                  title: 'Full /onboard â†’ pay â†’ site live flow end-to-end',
                  status: 'Code complete â€” depends on webhook fix above',
                  blocker: 'Depends on Gemini webhook fix. All polling, idempotency, and maxDuration=60 code is already in place.',
                  effort: 'Testing only â€” no code needed',
                },
              ],
            },
            {
              label: 'ðŸŸ¡ Blocked â€” Needs Stripe Live Keys',
              color: 'border-yellow-800',
              tasks: [
                {
                  title: '$29/month recurring subscription billing',
                  status: 'Code not started â€” needs Stripe Products + Prices setup',
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
              label: 'ðŸŸ¡ Blocked â€” Needs Twilio Account ($20 deposit)',
              color: 'border-orange-800',
              tasks: [
                {
                  title: 'SMS booking confirmation to customer',
                  status: 'Code not started â€” /api/notify ready to extend',
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
              label: 'ðŸŸ¡ Blocked â€” Needs Resend Verified Domain',
              color: 'border-blue-800',
              tasks: [
                {
                  title: 'Send booking emails to client\'s owner_email (not just your email)',
                  status: 'Workaround active â€” currently all emails go to NOTIFICATION_EMAIL',
                  blocker: 'Add a domain in Resend â†’ verify DNS â†’ update from address to bookings@yourdomain.com.',
                  effort: '30 minutes once domain is ready',
                },
              ],
            },
            {
              label: 'ðŸŸ¢ No Blocker â€” Can Build Anytime',
              color: 'border-green-800',
              tasks: [
                {
                  title: 'Custom PIN change in owner dashboard',
                  status: 'âœ… DONE â€” Settings tab in owner dashboard, validates match + min length',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Business logo upload in owner dashboard',
                  status: 'âœ… DONE â€” Settings tab, uploads to Supabase Storage, saves to theme_json.logo_url',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Gallery / photo upload section on public site',
                  status: 'âœ… DONE â€” Gallery tab in owner dashboard + "Our Work" grid section on public site',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Testimonials editor in owner dashboard',
                  status: 'âœ… DONE â€” Reviews tab, add/edit/remove, star rating picker, save to theme_json',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Revenue dashboard in admin â€” MRR tracker',
                  status: 'âœ… DONE â€” /admin/revenue: MRR, setup revenue, annual projection, per-site breakdown',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Export bookings to CSV',
                  status: 'âœ… DONE â€” CSV export in owner dashboard Bookings tab + admin Revenue page',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Service selector + currency on generate form (Phase 5)',
                  status: 'âœ… DONE â€” 3-step form: Type â†’ Services + Currency â†’ Details. Client picks/edits services, currency stored on site.',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Real-time slot availability check (Phase 6)',
                  status: 'âœ… DONE â€” checkSlotAvailability() in lib/booking-utils.ts',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Add to Calendar button after booking (Phase 6)',
                  status: 'âœ… DONE â€” Google Calendar link + Apple .ics on /booking/[id]',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Block out dates / time off (Phase 6)',
                  status: 'âœ… DONE â€” Block Dates tab in owner dashboard, blocked_dates table',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Reschedule / cancel self-service link (Phase 6)',
                  status: 'âœ… DONE â€” /booking/[id]/cancel + /booking/[id]/reschedule with cancel_token',
                  blocker: 'None',
                  effort: 'Complete',
                },
                {
                  title: 'Booking calendar view in dashboard (Phase 7)',
                  status: 'Planned â€” weekly/monthly calendar view of all bookings',
                  blocker: 'None â€” display only, reads existing bookings table.',
                  effort: '3-4 hours',
                },
                {
                  title: 'Promo codes / discount system (Phase 7)',
                  status: 'Planned â€” owner creates codes in dashboard, applied at booking',
                  blocker: 'None â€” new DB table for promo_codes.',
                  effort: '3-4 hours',
                },
                {
                  title: 'Reschedule / cancel self-service link (Phase 6)',
                  status: 'âœ… DONE â€” /booking/[id]/cancel + /booking/[id]/reschedule with cancel_token',
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
        KITA Builder Systems v1 Â· Built by Denny Martinez Â· From Struggle to Booked. âœŠ
      </p>
    </div>
  )
}

