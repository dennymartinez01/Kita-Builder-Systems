'use client'

import { useState } from 'react'
import { BookOpen, ChevronRight, ChevronDown, Database, Zap, Globe, Mail, Key, Code2, Calendar, Layers, ArrowRight } from 'lucide-react'

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
            { layer: 'Database', tech: 'Supabase (Postgres + RLS)', note: 'Cloud hosted, free tier sufficient for MVP' },
            { layer: 'AI Generation', tech: 'Claude claude-haiku-3-5 (Anthropic)', note: 'Fast + cheap JSON generation, ~$0.01/site' },
            { layer: 'Email', tech: 'Resend', note: 'Booking notification emails, free 100/day' },
            { layer: 'Hosting', tech: 'Vercel (when ready)', note: 'Free tier, auto-deploys from GitHub' },
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
│   ├── admin/                  ← Your internal CMS
│   │   ├── layout.tsx          ← Sidebar + PIN auth
│   │   ├── page.tsx            ← Dashboard + stats
│   │   ├── credentials/        ← API keys reference
│   │   ├── generate/           ← AI site generator form
│   │   ├── sites/              ← All generated sites list
│   │   ├── templates/          ← Template browser
│   │   ├── settings/           ← Logo uploader + CMS config
│   │   └── docs/               ← This page
│   ├── api/
│   │   ├── generate/route.ts   ← POST: Claude AI generation
│   │   ├── notify/route.ts     ← POST: Save booking + email
│   │   └── upload-logo/route.ts← POST: Logo upload to Supabase Storage
│   ├── [slug]/
│   │   ├── page.tsx            ← Public client site
│   │   └── dashboard/page.tsx  ← Owner CMS (PIN protected)
│   ├── layout.tsx
│   └── page.tsx                ← Home
├── components/
│   └── BookingForm.tsx         ← Client booking widget
├── lib/
│   ├── supabase.ts             ← DB client
│   └── templates/              ← 5 base templates
├── supabase/
│   ├── schema.sql              ← Run once in Supabase SQL Editor
│   └── storage.sql             ← Run once for logo storage bucket
├── types/
│   └── database.ts             ← TypeScript types
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
          <p className="text-gray-400 text-sm">4 tables in Supabase. All have Row Level Security enabled with public access for MVP.</p>
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
                { name: 'theme_json', type: 'jsonb', note: 'Full site structure — sections, colors, copy' },
                { name: 'published', type: 'bool', note: 'Controls whether public site is visible' },
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
              desc: 'Customer appointments — the money maker',
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
                { name: 'status', type: 'text', note: 'pending | confirmed | cancelled' },
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
            {
              method: 'POST',
              path: '/api/generate',
              color: 'bg-green-900/50 text-green-300',
              desc: 'Generates a full site using Claude AI and saves to Supabase',
              body: `{
  "business_name": "Jim's Auto Repair",
  "business_type": "mechanic",
  "location": "Sydney, AU",
  "owner_email": "jim@example.com",    // optional
  "extra_notes": "Specialises in 4WDs" // optional
}`,
              response: `{
  "slug": "jims-auto-repair-k3x9",
  "business_name": "Jim's Auto Repair",
  "business_type": "mechanic",
  "site_id": "uuid..."
}`,
            },
            {
              method: 'POST',
              path: '/api/notify',
              color: 'bg-green-900/50 text-green-300',
              desc: 'Saves a customer booking and sends email notification to owner',
              body: `{
  "site_id": "uuid...",
  "service_id": "uuid...",        // optional
  "customer_name": "Craig B.",
  "customer_phone": "+61400000000",
  "service_name": "Oil Change",
  "booking_date": "2026-10-01",
  "booking_time": "10:00",
  "car_model": "Toyota HiLux 2021", // mechanic only
  "pet_name": null,
  "notes": null
}`,
              response: `{
  "success": true,
  "booking": { ...booking row }
}`,
            },
          ].map(route => (
            <div key={route.path} className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${route.color}`}>{route.method}</span>
                <code className="text-white font-mono text-sm">{route.path}</code>
              </div>
              <div className="p-4">
                <p className="text-gray-400 text-sm mb-3">{route.desc}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-600 text-xs mb-1 uppercase tracking-wider">Request Body</p>
                    <pre className="bg-gray-900 rounded-lg p-3 text-xs text-green-300 font-mono overflow-x-auto">{route.body}</pre>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1 uppercase tracking-wider">Response</p>
                    <pre className="bg-gray-900 rounded-lg p-3 text-xs text-blue-300 font-mono overflow-x-auto">{route.response}</pre>
                  </div>
                </div>
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
            { service: 'Anthropic (Claude)', url: 'https://console.anthropic.com', phase: 'MVP', purpose: 'AI site generation', envKey: 'CLAUDE_API_KEY', free: '~$0.01 per site generated. Requires $5 min top-up.' },
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
              tasks: [
                'Project scaffolded ✅',
                'Supabase schema deployed ✅',
                'All 5 templates built ✅',
                'Admin CMS with generate, sites, templates, credentials ✅',
                'Public site renderer + booking form ✅',
                'Owner dashboard with services + bookings tabs ✅',
                'Claude AI generation working',
                'First demo site generated + booking tested',
              ],
            },
            {
              week: 'Week 2 — Polish + First Client (Days 8–14)',
              color: 'border-green-800',
              tasks: [
                'Mobile responsive check on all pages',
                'Resend email confirmed working end-to-end',
                'Logo uploader in admin CMS',
                'Owner dashboard — staff tab + about text editor',
                'Start outreach: 10 DMs/day to local businesses',
                'Goal: 1 free beta client for testimonial',
              ],
            },
            {
              week: 'Week 3 — Revenue (Days 15–21)',
              color: 'border-yellow-800',
              tasks: [
                'Stripe integration — $150 setup + $29/mo',
                'Payment page for new site onboarding',
                'Get 2 paying clients',
                'Collect feedback and fix real issues',
                'Add anything clients actually asked for',
              ],
            },
            {
              week: 'Week 4 — Scale (Days 22–30)',
              color: 'border-purple-800',
              tasks: [
                'Deploy to Vercel production',
                'Custom domain setup (kita.build or kitasystems.com)',
                'Twilio SMS reminders',
                'Record 60-sec Loom demo video',
                'Post demo to AU/US small business Facebook groups',
                'Agentic edit — chat to modify site content',
              ],
            },
          ].map(week => (
            <div key={week.week} className={`border rounded-xl p-5 ${week.color} bg-gray-950/50`}>
              <p className="text-white font-semibold text-sm mb-3">{week.week}</p>
              <div className="space-y-1.5">
                {week.tasks.map((task, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <span className={task.includes('✅') ? 'text-green-400' : 'text-gray-600'}>
                      {task.includes('✅') ? '✅' : '○'}
                    </span>
                    <span className={task.includes('✅') ? 'text-gray-400 line-through' : 'text-gray-300'}>
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
