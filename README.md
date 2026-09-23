# KITA Builder Systems

> **"From Struggle to Booked."**

AI-powered website builder for local service businesses — Salon, Clinic, Pet Clinic, Cafe, Mechanic Shop.

Generate a complete booking website in 10 seconds. No drag-and-drop. No templates to wrestle with. Just describe the business — AI builds it.

---

## What This Is

KITA is a SaaS product that generates fully-functional booking websites for local service businesses (initially targeting AU/US/UK markets). Each generated site includes:

- ✅ AI-generated copy, services, and staff tailored to the business type and location
- ✅ Live booking widget (name, phone, date, time, custom fields)
- ✅ Owner dashboard — manage services/prices and view bookings with a PIN
- ✅ Email notifications via Resend on every booking
- ✅ 5 pre-built templates: Salon, Clinic, Pet Clinic, Cafe, Mechanic

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres + RLS) |
| AI Generation | OpenAI gpt-4o-mini |
| Email | Resend |
| Hosting | Vercel (when ready to deploy) |

---

## Project Structure

```
kita-builder/
├── app/
│   ├── admin/                  # Internal admin CMS (your control panel)
│   │   ├── layout.tsx          # Admin layout + PIN auth
│   │   ├── page.tsx            # Dashboard with stats
│   │   ├── credentials/        # API keys tracker
│   │   ├── generate/           # Generate new client sites
│   │   ├── sites/              # All generated sites
│   │   ├── templates/          # Template browser
│   │   └── docs/               # Documentation
│   ├── api/
│   │   ├── generate/route.ts   # POST: AI site generation
│   │   └── notify/route.ts     # POST: Save booking + send email
│   ├── [slug]/
│   │   ├── page.tsx            # Public client site
│   │   └── dashboard/          # Owner dashboard (PIN-protected)
│   ├── layout.tsx
│   └── page.tsx                # Home / landing
├── components/
│   └── BookingForm.tsx         # Client-side booking widget
├── lib/
│   ├── supabase.ts             # Supabase client
│   └── templates/              # 5 base templates + defaults
│       ├── index.ts
│       ├── salon.ts
│       ├── clinic.ts
│       ├── pet.ts
│       ├── cafe.ts
│       └── mechanic.ts
├── supabase/
│   └── schema.sql              # Run this in Supabase SQL Editor
├── types/
│   └── database.ts             # TypeScript types for all tables
└── .env.local                  # Your API keys (never commit this)
```

---

## Setup (Local Dev)

### 1. Required Accounts

| Service | Purpose | Priority |
|---|---|---|
| [Supabase](https://supabase.com) | Database | MVP |
| [OpenAI](https://platform.openai.com) | AI generation | MVP |
| [Resend](https://resend.com) | Email notifications | MVP |
| [Vercel](https://vercel.com) | Hosting (deploy later) | MVP |
| Twilio | SMS reminders | V2 |
| Stripe | Payments | V2 |

### 2. Database Setup

1. Log into [supabase.com](https://supabase.com)
2. Create a new project: **Kita Builder Systems**
3. Go to **SQL Editor → New Query**
4. Paste and run the contents of `supabase/schema.sql`
5. You'll have 4 tables: `sites`, `services`, `staff`, `bookings`

### 3. Environment Variables

Copy `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-proj-...
RESEND_API_KEY=re_...
NOTIFICATION_EMAIL=denny.itdwebdev@gmail.com
NEXT_PUBLIC_ADMIN_PIN=kita2024
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

### For You (Admin)
1. Go to `/admin` → Enter PIN → Dashboard
2. Go to **Generate Site**
3. Select business type, enter name + location
4. AI generates copy + services + staff in ~10 sec
5. Site is live at `localhost:3000/{slug}`

### For Your Client (Owner)
1. Access their site at `/{slug}`
2. Customers book via the booking widget
3. Owner gets email notification via Resend
4. Owner logs into `/{slug}/dashboard` with their PIN
5. Owner edits services/prices live, sees all bookings

---

## 30-Day Build Plan

| Week | Focus |
|---|---|
| Week 1 (Days 1-7) | Foundation working end-to-end locally |
| Week 2 (Days 8-14) | Polish + mobile + first beta client |
| Week 3 (Days 15-21) | Stripe payments + get 2 paying clients |
| Week 4 (Days 22-30) | Deploy to Vercel + Twilio SMS + record demo video |

**Rule:** No new features unless a paying client asks for it.

---

## Deploy to Vercel (When Ready)

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial KITA Builder deployment"
git push origin main

# 2. Connect to Vercel
# vercel.com → New Project → Import GitHub repo

# 3. Add env vars in Vercel dashboard
# (same keys as .env.local)
```

---

## Company

**KITA Systems** — *From Struggle to Booked.*

Born in Caloocan. Built for the world.

Target: Local service businesses in AU, US, UK, CAN that need an online booking presence.

Revenue model: $150 setup + $29/month per client site.

---

*Built by Denny Martinez · KITA Builder Systems v1 · September 2026*
