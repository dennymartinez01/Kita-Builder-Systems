# KITA Builder Systems

> **"From Struggle to Booked."**

AI-powered website builder for local service businesses — Salon, Clinic, Pet Clinic, Cafe, Mechanic Shop.

Generate a complete booking website in 10 seconds. No drag-and-drop. No templates to wrestle with. Just describe the business — AI builds it.

🌐 **Live:** [kita-builder-systems.vercel.app](https://kita-builder-systems.vercel.app)
📦 **Repo:** [github.com/dennymartinez01/Kita-Builder-Systems](https://github.com/dennymartinez01/Kita-Builder-Systems)

---

## What This Is

KITA is a SaaS product that generates fully-functional booking websites for local service businesses (targeting AU/US/UK/PH/CAN markets). Each generated site includes:

- ✅ AI-generated copy, services, and staff tailored to business type + location
- ✅ Live booking widget — customers book 24/7, owner gets email instantly
- ✅ Owner dashboard (9 tabs) — manage everything with a PIN
- ✅ AI Assistant — edit your site by typing in plain English
- ✅ Gallery, testimonials, hours, logo upload — full content management
- ✅ 11 templates across 5 business types
- ✅ Stripe payments — $150 setup fee via checkout
- ✅ White-label mode — hide KITA branding for resellers

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres + RLS + Storage) |
| AI Generation | Google Gemini 3.6 Flash (free tier, AQ. auth key) |
| Payments | Stripe (test mode — $150 setup fee) |
| Email | Resend |
| Hosting | Vercel |
| Icons | Lucide React |

---

## Project Structure

```
kita-builder/
├── app/
│   ├── admin/
│   │   ├── layout.tsx          # Sidebar + PIN auth + logo loader
│   │   ├── page.tsx            # Dashboard — stats, quick actions, recent sites
│   │   ├── credentials/        # API keys reference + .env template
│   │   ├── generate/           # AI site generator form
│   │   ├── revenue/            # MRR tracker + CSV export
│   │   ├── sites/              # All sites — search, filter, payment status
│   │   ├── templates/          # 11-template marketplace grid + slide-over detail
│   │   ├── settings/           # Logo upload, PIN, white-label, email config
│   │   └── docs/               # Full documentation (this system)
│   ├── api/
│   │   ├── agent/route.ts      # POST: AI chat agent (9 tools)
│   │   ├── checkout/route.ts   # POST: Stripe Checkout session
│   │   ├── generate/route.ts   # POST: Gemini AI site generation
│   │   ├── notify/route.ts     # POST: Save booking + Resend email
│   │   ├── upload-logo/route.ts# POST: Image upload to Supabase Storage
│   │   └── webhook/route.ts    # POST: Stripe webhook → auto-generate site
│   ├── [slug]/
│   │   ├── page.tsx            # Public client site (white-label aware)
│   │   └── dashboard/page.tsx  # Owner dashboard (9 tabs, PIN-protected)
│   ├── onboard/
│   │   ├── page.tsx            # Client payment page ($150 setup)
│   │   └── success/page.tsx    # Post-payment success + site polling
│   ├── pitch/page.tsx          # Outreach / demo page
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AgentChat.tsx           # AI chat widget (owner dashboard)
│   └── BookingForm.tsx         # Customer booking form
├── lib/
│   ├── supabase.ts             # Supabase client (server + anon)
│   ├── stripe.ts               # Stripe client (server-only)
│   ├── pricing.ts              # Client-safe pricing constants
│   ├── whitelabel.ts           # White-label config helpers
│   └── templates/              # 11 template variants
│       ├── index.ts            # Registry + exports
│       ├── registry.ts         # Full template marketplace data
│       ├── salon.ts            # 3 salon variants
│       ├── clinic.ts           # 2 clinic variants
│       ├── pet.ts              # 2 pet clinic variants
│       ├── cafe.ts             # 2 cafe variants
│       └── mechanic.ts         # 2 mechanic variants
├── supabase/
│   ├── schema.sql              # Tables: sites, services, staff, bookings
│   ├── storage.sql             # Supabase Storage bucket: kita-assets
│   └── payments.sql            # Payment columns: payment_status, stripe fields
├── types/
│   └── database.ts             # TypeScript types for all DB tables
└── .env.local                  # API keys (never commit — in .gitignore)
```

---

## Features

### Admin CMS (`/admin`)
- Dashboard with live stats (sites, bookings, revenue)
- AI site generator — type business name + location, done in 10 sec
- All Sites — search, filter by type, payment status badge
- Revenue Dashboard — MRR, setup revenue, annual projection, CSV export
- Template marketplace — 11 cards, slide-over preview, Use This Template button
- API Keys & Credentials — all service accounts + .env template
- Settings — KITA logo upload, admin PIN, white-label config, notification email

### Public Site (`/{slug}`)
- Sticky mobile nav, hero, services grid, about, hours, staff, booking form, testimonials, footer
- Fully mobile responsive — tested at 375px
- White-label aware footer

### Owner Dashboard (`/{slug}/dashboard`)
9 tabs, all saving instantly to Supabase:

| Tab | What it does |
|---|---|
| Bookings | View/confirm/cancel + CSV export |
| Services | Inline edit name/price/duration, add/delete |
| Staff | Add/edit/remove team members |
| Hours | Open/closed toggle per day + time pickers |
| About | Edit section title + body with live preview |
| Reviews | Add/edit/remove testimonials with star ratings |
| Gallery | Multi-photo upload via Supabase Storage |
| Settings | Business logo upload + PIN change |
| AI Assistant | Chat to edit site ("change my haircut to $80") |

### AI Assistant (9 Agent Tools)
`update_service_price` · `update_service_name` · `update_service_duration` · `add_service` · `delete_service` · `update_headline` · `update_subheadline` · `update_about` · `list_services`

### Payments (Stripe)
- `/onboard` — client fills details + pays $150 setup fee
- Stripe Checkout (test mode) → webhook → auto-generates site via Gemini
- `/onboard/success` — polls Supabase until site appears
- `payment_status` tracked per site (paid / free / unpaid)

---

## White Label Mode

Remove all KITA branding from client sites and dashboards. Perfect for agencies reselling KITA under their own brand.

### Enable in `.env.local`

```env
NEXT_PUBLIC_WHITE_LABEL_MODE=on
NEXT_PUBLIC_AGENCY_NAME=Your Agency Name
NEXT_PUBLIC_AGENCY_TAGLINE=Your tagline here
NEXT_PUBLIC_AGENCY_URL=https://youragency.com
NEXT_PUBLIC_AGENCY_LOGO_URL=https://youragency.com/logo.png
```

### What changes when enabled

| Location | Default (off) | White-label (on) |
|---|---|---|
| Public site footer | "Powered by KITA Systems" | "Powered by {AGENCY_NAME}" |
| Owner dashboard header | "Owner Dashboard" | "{AGENCY_NAME}" |
| PIN gate footer | — | "Powered by {AGENCY_NAME}" |

### Per-site override (via `theme_json`)

```json
"white_label": {
  "enabled": true,
  "custom_footer": "Powered by Sydney Web Co.",
  "hide_footer_brand": false
}
```

Set `hide_footer_brand: true` to remove all branding from a specific site's footer.

---

## Setup (Local Dev)

### 1. Required Accounts

| Service | Purpose | Priority |
|---|---|---|
| [Supabase](https://supabase.com) | Database + Storage | MVP |
| [Google AI Studio](https://aistudio.google.com) | Gemini AI generation (free) | MVP |
| [Resend](https://resend.com) | Email notifications | MVP |
| [Vercel](https://vercel.com) | Hosting | MVP |
| [GitHub](https://github.com) | Code repository | MVP |
| [Stripe](https://stripe.com) | Payments ($150 setup fee) | Week 3 |
| Twilio | SMS reminders | Backlog |

### 2. Database Setup

```sql
-- Run these in Supabase SQL Editor in order:
-- 1. supabase/schema.sql    — tables + RLS policies
-- 2. supabase/storage.sql   — kita-assets storage bucket
-- 3. supabase/payments.sql  — payment columns on sites table
```

### 3. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Gemini AI (Google AI Studio — free)
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
```

### 4. Run Locally

```bash
npm run dev
# → http://localhost:3000
# → http://localhost:3000/admin (PIN: kita2024)
```

---

## How It Works

### For You (Admin / Operator)
1. Go to `/admin` → PIN → Dashboard
2. Click **Generate Site** → fill business name, type, location
3. Gemini generates copy, services, staff → site is live at `/{slug}`
4. Share `/{slug}` with client and `/{slug}/dashboard` with PIN `1234`
5. Track revenue at `/admin/revenue`

### For Your Client (Business Owner)
1. Access `/{slug}` — their live booking site
2. Log into `/{slug}/dashboard` with their PIN
3. Edit services, prices, hours, team, photos, reviews — all from the dashboard
4. Use AI Assistant: "change my oil change to $95"
5. Get email on every new booking

### For Their Customers
1. Visit the business site
2. Pick a service, enter name/phone/date/time
3. Booking confirmed — owner gets email notification instantly

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

## Backlog (Requires Paid Accounts)

| Feature | Blocker |
|---|---|
| $29/mo recurring billing | Stripe live keys + subscription setup |
| SMS booking confirmation | Twilio account ($20 deposit) |
| Send email to client's owner email | Resend verified domain |
| Full auto-generate after payment | Gemini API account fix |

---

## Company

**KITA Systems** — *From Struggle to Booked.*

Born in Quezon City. Built for the world.

This project was created out of curiosity — a freedom project to build something using Generative AI + Agentic AI.

The mission: Help small and medium businesses launch their site in 10 seconds and start getting booked online.

Target: Local service businesses in AU, US, UK, PH, CAN.

Revenue model: $150 setup + $29/month per client site.

Built with curiosity, hustle, and AI.

---

*Built by Denny Martinez · KITA Builder Systems v1 · September 2026*
