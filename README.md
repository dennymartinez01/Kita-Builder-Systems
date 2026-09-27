# KITA Builder Systems

> **"From Struggle to Booked."**

AI-powered website builder for local service businesses — Salon, Clinic, Pet Clinic, Cafe, Mechanic Shop — plus a standalone Website Intelligence & Audit Module.

🌐 **Live:** [kita-builder-systems.vercel.app](https://kita-builder-systems.vercel.app)
📦 **Repo:** [github.com/dennymartinez01/Kita-Builder-Systems](https://github.com/dennymartinez01/Kita-Builder-Systems)

---

## What This Is

KITA is a two-product platform:

### Product 1 — AI Website Builder
Generates fully-functional booking websites for local service businesses in ~10 seconds. Each site includes a booking widget, owner dashboard, AI assistant, and full CMS.

### Product 2 — Website Intelligence & Audit
Forensic website audit tool — enter any URL, get scores + issues + PDF report covering Performance, SEO, Security, Tech Stack, Accessibility, and a 10-page internal crawler.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres + RLS + Storage) |
| AI Generation | Google Gemini 3.6 Flash (free tier, AQ. auth key) |
| HTML Parsing | cheerio (SEO + accessibility audit) |
| PDF Generation | jsPDF (client-side, no server needed) |
| Payments | Stripe (test mode — $150 setup fee) |
| Email | Resend |
| Hosting | Vercel |
| Icons | Lucide React |

---

## Full Route Map

```
/                           # Home / landing
/pitch                      # KITA Builder outreach pitch page
/audit-pitch                # Website Audit outreach pitch page
/onboard                    # Client payment page ($150 setup)
/onboard/success            # Post-payment success + site polling

/admin                      # Admin CMS dashboard (PIN protected)
/admin/credentials          # API keys & accounts reference
/admin/generate             # AI site generator
/admin/revenue              # MRR tracker + CSV export (Overview + By Client tabs)
/admin/sites                # All generated client sites (with Client column)
/admin/templates            # 11-template marketplace
/admin/settings             # Logo upload, PIN, white-label, email
/admin/clients              # Client list — search, filter, MRR, CSV (Phase 9)
/admin/clients/[id]         # Client profile — edit, linked sites, revenue (Phase 9)
/admin/clients/new          # Create new client (Phase 9)
/admin/leads                # Cross-site leads inbox — all inquiries (Phase 10, planned)
/admin/docs                 # Main documentation
/admin/docs/audit           # Audit module documentation

/audit                      # Website Audit — URL input + history
/audit/[id]                 # Audit results dashboard + PDF download
/audit-pitch                # Audit pitch / outreach page

/[slug]                     # Public client site
/[slug]/dashboard           # Owner CMS dashboard (PIN protected)

/api/agent                  # AI chat agent (9 tools)
/api/audit                  # POST create audit / GET list / DELETE
/api/audit/[id]             # GET full audit + pages / POST re-run
/api/checkout               # Stripe Checkout session
/api/generate               # Gemini AI site generation
/api/inquire                # POST contact form inquiry → leads table (Phase 10, planned)
/api/notify                 # Save booking + auto-upsert client + Resend email
/api/track                  # Page view analytics tracking
/api/upload-logo            # Image upload to Supabase Storage
/api/webhook                # Stripe webhook → auto-generate site
```

---

## Subscription Plans

All plans include a **$150 one-time setup fee** (AI generation, site build, launch). Monthly billing activates after setup.

| Plan | Price | Sites | Key additions over previous |
|---|---|---|---|
| **Trial** | Free · 14 days | 1 | Full access, no credit card |
| **Starter** | $29/mo | 1 | Booking system, AI assistant, analytics, contact form |
| **Growth** | $49/mo | 3 | SMS reminders, 2 promotion blasts/mo, priority support |
| **Agency** | $99/mo | 10 | White-label mode, custom domain, 5 blasts/mo, onboarding call |

**MRR at 10 clients:**
- All Starter → $290/mo ($3,480/yr)
- Mixed (5S + 3G + 2A) → $490/mo ($5,880/yr)
- All Agency → $990/mo ($11,880/yr)

**Implementation status:**
- ✅ Plan tiers defined in `types/database.ts` + tracked per client in `clients` table
- ✅ MRR rates in `app/admin/clients/page.tsx` (MONTHLY_RATES constant)
- ✅ Plan badge in `/admin/clients` + `/admin/revenue` By Client tab
- ✅ Stripe webhook sets `subscription_status=active` + `plan=starter` on $150 payment
- ⏳ Stripe recurring subscriptions — needs Stripe Products + Prices (Backlog)
- ⏳ Auto-downgrade on `invoice.payment_failed` — Backlog

---

### Features

**Admin CMS (`/admin`)**
- Dashboard with live stats (sites, bookings, revenue)
- AI site generator — business name + location → full site in ~10 sec
- All Sites — search, filter by type, payment status badge
- Revenue Dashboard — MRR, setup revenue, annual projection, CSV export
- Template marketplace — 11 cards across 5 business types, slide-over preview
- API Keys & Credentials — all service accounts reference + .env template
- Settings — KITA logo upload, admin PIN, white-label config, notification email

**Public Client Site (`/{slug}`)**
- Sticky mobile nav, hero, services grid, about, hours, staff, gallery, booking form, testimonials, footer
- Mobile responsive — tested at 375px
- Business hours display, gallery photos grid
- White-label aware footer

**Owner Dashboard (`/{slug}/dashboard`) — 10 tabs**

| Tab | What it does |
|---|---|
| Bookings | View/confirm/cancel + CSV export |
| Services | Inline edit name/price/duration, add/delete |
| Staff | Add/edit/remove team members |
| Hours | Open/closed toggle per day + time pickers |
| About | Edit section title + body with live preview |
| Reviews | Add/edit/remove testimonials with star ratings |
| Gallery | Multi-photo upload via Supabase Storage |
| Analytics | 14-day page view bar chart, weekly comparison |
| Settings | Business logo upload + PIN change |
| AI Assistant | Chat to edit site ("change my haircut to $80") |

**AI Assistant — 9 Agent Tools**
`update_service_price` · `update_service_name` · `update_service_duration` · `add_service` · `delete_service` · `update_headline` · `update_subheadline` · `update_about` · `list_services`

**Booking System**
- Service selector, name, phone, email, date, time
- Optional staff picker — customer selects preferred team member
- Custom fields: car model (mechanic), pet name (pet clinic)
- Real-time slot availability check + next available slot suggestion
- Auto-fill returning customer details from localStorage
- Self-service cancel and reschedule via tokenised links
- Add to Google Calendar / Apple Calendar (.ics) on confirmation page
- Staff name saved to booking + included in notification email
- CSV export includes Staff column
- Server-side race condition guard (HTTP 409 on simultaneous double-booking)

**Contact Form & Leads (Phase 10 — planned)**
- "Not ready to book? Send us a message" form on every client site
- Inquiry saved to `leads` table — name, email, message, site_id, source
- Owner notified by email via Resend on every new inquiry
- Owner dashboard Inquiries tab — leads list with "Convert to Booking" action
- `/admin/leads` cross-site leads inbox for operator
- Opt-in checkbox on inquiry + booking forms for promotion consent

**Smart Leads Engine (Phase 10 — planned)**
- Aggregate opted-in leads across all KITA client sites by city + business type
- Operator composes promotion blast — headline, offer, CTA URL, expiry
- Sends targeted email via Resend to filtered audience segment
- Delivery tracking: sent / opened / clicked per campaign
- New revenue stream: charge clients $49/blast to reach the opted-in local network

**Client Management (Phase 9)**
- `/admin/clients` — full CRM: subscription plan, status, MRR contribution, notes
- `/admin/clients/[id]` — profile edit, linked sites, revenue breakdown
- `/admin/revenue` — "By Client" tab showing MRR per client with totals row
- `/admin/sites` — Client column showing linked client per site
- Auto-upsert client record when a booking is made with customer email

**Payments (Stripe)**
- `/onboard` — client fills business details + pays $150 setup fee
- Stripe Checkout (test mode) → webhook → auto-generates site via Gemini
- `payment_status` tracked per site (paid / free / unpaid)

**Site Analytics**
- `page_views` table tracks every visit to a client site
- `PageTracker` component — client-side, fires on every public site visit
- Analytics tab in owner dashboard — 14-day bar chart, views this week vs last
- Admin Revenue page — Views (30d) column, total views stat

**White Label Mode**
- `NEXT_PUBLIC_WHITE_LABEL_MODE=on` — hides KITA branding everywhere
- Agency name, tagline, URL, logo all configurable via env vars
- Per-site override via `theme_json.white_label`

**Templates — 11 variants across 5 business types**
- Salon (3): Classic Dark, Luxury Gold, Minimal Barber
- Clinic (2): Medical Blue, Wellness Green
- Pet (2): Nature Green, Playful Purple
- Cafe (2): Warm Amber, Dark Roast
- Mechanic (2): Bold Dark, Pro Navy

---

## Product 2 — Website Intelligence & Audit

**Phase 1 — Analyzers (complete)**
- ⚡ Performance — Google PageSpeed Insights API (LCP, CLS, FCP, TTFB, page size, unused JS/CSS)
- 🔍 SEO — 12+ on-page checks via cheerio (title, meta, H1, canonical, OG tags, alt text, robots)
- 🔒 Security — 8 HTTP security headers (HTTPS, HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- 🧩 Tech Stack — 30+ technology fingerprints (Next.js, WordPress, Shopify, GA, Meta Pixel, Cloudflare...)
- ♿ Accessibility — WCAG 2.1 basics (alt text, form labels, button ARIA, heading order, lang)
- 📊 Score rings — animated 0-100 per category, weighted overall score
- 🔎 Issue explorer — filter by severity (critical/high/medium/low) + category
- 🔄 Re-run — refresh audit for same URL

**Phase 2 — Crawler (complete)**
- Crawls up to 10 internal pages, 3 concurrent, 5s timeout per page
- Detects: broken links, noindex pages, missing titles/metas, duplicate titles/metas, slow pages
- Pages tab in dashboard — URL, status code, title, H1 count, meta check
- History: search by URL, delete audits, score trend comparison (↑↓—)

**Phase 3 — PDF Report (complete)**
- Download PDF button on audit results page
- Generates multi-page "Forensic Website Audit Report" using jsPDF
- Sections: Executive Summary, Tech Forensics, Crawl Audit, Performance, Security, SEO, Accessibility, Prioritized Recommendations
- Footer with URL, KITA Systems brand, date, page numbers
- Filename: `audit-{hostname}-{date}.pdf`

**API Routes**
- `POST /api/audit` — run full audit, save to Supabase
- `GET /api/audit` — list audits with search
- `GET /api/audit/[id]` — full audit + crawled pages
- `POST /api/audit/[id]` — re-run audit
- `DELETE /api/audit?id=` — delete audit record

**Backlog (Phase 4+)**
- PDF branded design update (KITA logo + colors)
- Client-facing audit frontend (`/audit/report/[id]`)
- Scheduled weekly/monthly re-audits (Vercel Cron)
- Score history chart over time
- Email alert when score drops below threshold

---

## Database Schema

```sql
-- Run these in order in Supabase SQL Editor:
supabase/schema.sql         -- sites, services, staff, bookings
supabase/storage.sql        -- kita-assets storage bucket
supabase/payments.sql       -- payment_status, stripe columns on sites
supabase/analytics.sql      -- page_views table
supabase/audit.sql          -- audits + audit_pages tables
supabase/staff-booking.sql  -- staff_id + staff_name on bookings
supabase/phase6.sql         -- sites.timezone, auto_confirm, blocked_dates, booking fields
supabase/currency.sql       -- sites.currency column
supabase/clients.sql        -- clients table + sites.client_id FK (Phase 9)
supabase/leads.sql          -- leads table for contact form + promotions (Phase 10, run when building)
```

---

## Setup (Local Dev)

### Required Accounts

| Service | Purpose | Priority |
|---|---|---|
| [Supabase](https://supabase.com) | Database + Storage | MVP |
| [Google AI Studio](https://aistudio.google.com) | Gemini AI generation (free) | MVP |
| [Resend](https://resend.com) | Email notifications | MVP |
| [Vercel](https://vercel.com) | Hosting | MVP |
| [GitHub](https://github.com) | Code repository | MVP |
| [Stripe](https://stripe.com) | Payments ($150 setup fee) | Week 3 |
| Google PSI | Performance audits (free, no key needed) | Audit |
| Twilio | SMS reminders | Backlog |

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Gemini AI (Google AI Studio — free, AQ. key format)
GEMINI_API_KEY=AQ...

# Resend (email notifications)
RESEND_API_KEY=re_...
NOTIFICATION_EMAIL=you@gmail.com

# Admin
NEXT_PUBLIC_ADMIN_PIN=kita2024

# Stripe (test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# White label (optional)
NEXT_PUBLIC_WHITE_LABEL_MODE=off
NEXT_PUBLIC_AGENCY_NAME=KITA Systems
NEXT_PUBLIC_AGENCY_TAGLINE=From Struggle to Booked.
NEXT_PUBLIC_AGENCY_URL=https://kita-builder-systems.vercel.app

# Google PageSpeed (optional — works without key, 100 req/day free)
# PAGESPEED_API_KEY=AIza...
```

### Run Locally

```bash
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin (PIN: kita2024)
# → http://localhost:3000/audit
```

---

## Deploy to Vercel

```bash
git add -A
git commit -m "deploy"
git push origin main
# Vercel auto-deploys on push to main
```

Add all `.env.local` keys to Vercel → Settings → Environment Variables, then redeploy.

---

## Backlog (Requires Paid Accounts / Future Work)

| Feature | Blocker |
|---|---|
| $29/mo recurring billing | Stripe live keys + subscription setup |
| SMS booking confirmation | Twilio account ($20 deposit) |
| Send booking email to owner's email | Resend verified domain |
| Webhook auto-generate after payment | Gemini API Vercel IP issue (503 on all models) |
| Branded PDF design | Design work — current is plain Forensic format |
| Client-facing audit frontend | Phase 5 — separate light theme at `/audit/report/[id]` |
| Scheduled weekly audits | Vercel Cron Jobs setup |

---

## Company

**KITA Systems** — *From Struggle to Booked.*

Born in Quezon City. Built for the world.

This project was created out of curiosity — a freedom project to build something using Generative AI + Agentic AI.

The mission: Help small and medium businesses launch their site in 10 seconds and start getting booked online. Help web agencies deliver more value with instant forensic website audits.

Target: Local service businesses + web agencies in AU, US, UK, PH, CAN.

Revenue model: $150 setup + $29/month per client site. Audit tool as a lead generation and client retention tool.

Built with curiosity, hustle, and AI.

---

*Built by Denny Martinez · KITA Builder Systems v1 · September 2026*
