# CHANGELOG — KITA Builder Systems

All notable changes to this project are recorded here in reverse chronological order.
Format: `YYYY-MM-DD | commit | what changed`

Each entry maps to a git commit. Run `git log --oneline` to cross-reference.

---

## 2026-09-27 (session 16)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Booking Calendar View** — `CalendarTab` component (weekly grid Mon–Sun, HOUR_START 7am to HOUR_END 9pm, booking blocks color-coded by status, today column highlight, prev/next week navigation, Today shortcut, booking count dots in day headers, booking detail popover with Confirm/Cancel quick actions); Calendar tab added to owner dashboard between Bookings and Services; Calendar icon added to lucide imports |

---

## 2026-09-27 (session 15)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Attribution Tracking** — `supabase/attribution.sql` (utm_source/medium/campaign/content/term + referrer + landing_page on bookings + leads); `lib/attribution.ts` (parseUTM: extracts params + derives source from referrer; saveAttribution: first-touch sessionStorage; getStoredAttribution; SOURCE_LABELS map); `AttributionTracker` component (silent, mounts on page load, runs once); BookingForm + ContactForm both spread `getStoredAttribution()` into their API calls; `/api/notify` destructures + saves 7 attribution fields to booking; public `/{slug}/page.tsx` includes `<AttributionTracker />`; owner dashboard Analytics tab: "Where Bookings Come From" bar chart breakdown by source |

---

## 2026-09-27 (session 14)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Phase 10 — Contact Form + Smart Leads Engine** — `supabase/leads.sql` (leads table, RLS: public insert + service_role all); `Lead`/`LeadSource`/`LeadStatus` types; `POST /api/inquire` (save lead, owner email notification, log event); `GET /api/inquire` (admin all-sites + owner per-site list); `PATCH /api/inquire` (update status/notes); `ContactForm` component (name/email/phone/service picker/message/opt-in); `BookingContactSection` wrapper (Book / Enquire tab switcher); public site updated to use BookingContactSection; `InquiriesTab` component (leads list, expand, reply/call/WhatsApp links, Convert to Booking, Mark Contacted, Close); Inquiries tab added to owner dashboard; `/admin/leads` cross-site inbox (stat cards, search, status filter, table with pagination, CSV export); Leads Inbox added to admin sidebar |

---

## 2026-09-27 (session 13)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **9-step Site Creation Wizard** — `/admin/generate` rewritten: Step 1 (Business Owner: search existing client / create new inline / skip); Step 2 (Business Info: name, location, email, notes); Step 3 (Business Type — existing); Step 4 (Services & Currency — existing); Step 5 (Subscription Plan: trial/starter/growth/agency cards with feature bullets); Step 6 (Trial Duration: conditional, only shown for trial plan, with live expiry preview); Step 7 (Feature Entitlements: plan summary grid of enabled/disabled features); Step 8 (Review: full settings summary + Generate button); Step 9 (Activate: live links + client profile link); Progress bar skips Step 6 for non-trial plans; client_id linked to site after generation |

---

## 2026-09-27 (session 12)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Client 360 Profile** — `GET /api/clients/[id]/overview` (aggregates stats: bookings_total, customers_total, page_views_30d, coupons_active, sites, recent_bookings, recent_events, MRR, setup_fees, ARR in one call); `/admin/clients/[id]` fully rebuilt as 7-tab Client 360 (Overview: stat grid + revenue summary + sites grid + recent bookings + recent events; Profile: contact edit + subscription + trial block + subscription override panel; Bookings: all bookings across all sites table; Customers: registered customers table; Activity: event stream for client; Features: entitlements tab preserved; Notes: internal notes + Stripe info) |

---

## 2026-09-27 (session 11)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Coupon & Promotion Engine** — `supabase/coupons.sql` (coupons table + coupon_usages tracking table, RLS: service_role all + public select active); `Coupon`/`CouponUsage`/`CouponValidationResult` types; `GET/POST/DELETE /api/coupons`; `GET /api/coupons/validate` (server-side validation: window, usage limit, per-customer limit, min amount, service restriction, discount calculation); `enableCoupons` prop on BookingForm with coupon input, Apply button, live result display, coupon passed to /api/notify; `CouponsTab` component (create/edit/delete/toggle form, card list with status badges); Coupons tab added to owner dashboard (12th tab) |

---

## 2026-09-27 (session 10)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Customer Registration + DB** — `supabase/site-customers.sql` (site_customers table, unique site_id+email, booking_count/total_spend denormalised counters, increment_customer_booking() function, RLS: public insert/select + service_role all); `SiteCustomer`/`SiteCustomerSafe` types; `POST /api/customers` (register/lookup upsert); `GET /api/customers` (owner list with search + pagination); `enableCustomerAccounts` prop on BookingForm with opt-in checkbox + non-blocking registration call; `CustomersTab` component (stats, search, sortable table, CSV export, setup note); Customers tab added to owner dashboard |

---

## 2026-09-27 (session 9)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Trial Account Request System** — `supabase/trial-requests.sql` (trial_requests table, statuses, RLS: public insert + service_role all); `TrialRequest` type in database.ts; `/trial` public form (contact, business type picker, plan selector, duration picker, privacy acceptance, success screen); `POST /api/trial-request` (save + admin email notification); `GET /api/trial-request` (admin list with status filter); `POST /api/trial-request/[id]/action` (approve: creates client + trial dates + welcome email; reject: optional rejection email; review: status update); `/admin/trial-requests` page (pending badge, status tabs, expand per-request, approve with duration override, reject with reason, mark-under-review); Trial Requests added to sidebar nav |

---

## 2026-09-27 (session 8)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Admin Subscription Override** — `POST /api/clients/[id]/subscription` (8 actions: upgrade/downgrade/change/extend/pause/cancel/terminate/reactivate, each logs to event stream); Subscription Override panel on `/admin/clients/[id]` right column (current plan display, 6 action buttons, expanded panel with target plan picker / extend days / reason input, Terminate danger zone, success/error feedback) |

---

## 2026-09-27 (session 7)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Notification Center** — `supabase/notifications.sql` (admin_notifications table, FK to events, read_at, indexes, RLS); `lib/notifications.ts` (createNotification, getNotifications, getUnreadCount, markRead, markAllRead, NOTIFIABLE_EVENTS); `GET+POST /api/notifications`; notification bell in admin layout header (dropdown preview, unread badge, mark all read, outside-click close); `/admin/notifications` full page (All/Unread tabs, mark-read per row, client/site links, pagination); logEvent() now auto-creates notifications for 10 notifiable event types; Notifications added to sidebar nav |

---

## 2026-09-27 (session 6)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Universal Event Stream** — `supabase/events.sql` (events table + indexes + RLS); `lib/events.ts` (logEvent, queryEvents, ET constants, CATEGORY_COLORS/ICONS, SEVERITY_COLORS); `types/database.ts` (PlatformEvent, LogEventInput, EventCategory, EventSeverity); `GET /api/events` (filterable query endpoint); `/admin/events` page (live feed, 7 filters, pagination, metadata hover, setup reminder); sidebar nav updated; /api/notify instrumented (booking.created); /api/webhook instrumented (site.created, payment.completed, client.created); /api/entitlements instrumented (entitlement.override_set/removed) |

---

## 2026-09-27 (session 5)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Trial Duration Configuration** — `supabase/trial-duration.sql` (trial_starts_at + trial_duration_days columns); `lib/trial.ts` (calculateTrialDates, getTrialStatus, formatTrialCountdown, formatDate); trial duration picker + countdown badge on `/admin/clients/[id]` Subscription section; trial picker + preview on `/admin/clients/new`; trial countdown badge in client list Status column; `/api/notify` + `/api/webhook` set trial dates when auto-creating clients |

---

## 2026-09-27 (session 4)

| Commit | Area | What Changed |
|---|---|---|
| *(pending)* | ✅ Complete | **Phase 11 — Feature & Entitlement Engine** — `supabase/entitlements.sql` (features, plan_features, client_entitlements tables + 25-feature seed across 4 plans); `lib/entitlements.ts` (getEffectiveEntitlements, hasFeature, getLimit, setClientEntitlementOverride, MONTHLY_RATES, PLAN_SITE_LIMITS, FEATURE_CATEGORIES); `types/database.ts` (Feature, PlanFeature, ClientEntitlement, EffectiveEntitlements types); `GET+POST /api/entitlements/[clientId]`; Features tab on `/admin/clients/[id]` with live toggle + override badges + reason input |

---

## 2026-09-27 (session 3)

| Commit | Area | What Changed |
|---|---|---|
| `ebdbfe7` | 📝 Docs | **Feature Roadmap restructured** — replaced flat Operator/Client/Customer groups with 7 capability groups (Foundation/Commerce/CRM+Growth/Intelligence), priority tier system, 17+ features documented with What/Why/Who/Status, core architectural principle (Entitlement Engine) added, overview Upcoming Phases updated |

---

## 2026-09-27 (session 2)

| Commit | Area | What Changed |
|---|---|---|
| `601ace0` | 🔧 Fix | `React.Fragment` with `key` prop replacing bare `<>` fragment in pricing matrix map — resolved React console warning |
| `58e10da` | 📝 Docs | **Subscription Plans documented** — full feature matrix in `/admin/docs` client-management section; new standalone Pricing section (plan cards, comparison table, upgrade triggers, MRR projections); pricing comparison section on `/pitch` with 3-column plan cards; Subscription Plans section in README |
| `b6c5280` | 📝 Docs | Changelog added — `CHANGELOG.md` + `/admin/docs` Changelog section with full history from project start |
| `01d4163` | ✅ Complete | **Stripe webhook → client integration** — on `checkout.session.completed`: upsert client (email key), set `subscription_status=active`, `subscription_plan=starter`, `onboarding_complete=true`, link `sites.client_id`; docs integration point marked Done |

---

## 2026-09-27

| Commit | Area | What Changed |
|---|---|---|
| `e72f85f` | 🔧 Fix | Stripe mode toggle — settings page now writes via `/api/admin-config` (service role) instead of anon client, bypassing RLS |
| `8a1035e` | 🔧 Fix | `admin-config.sql` — replaced unsupported `create policy if not exists` with `drop policy if exists` + `create policy` for Supabase Postgres compat |
| `b1e78e0` | ✨ Feature | **Stripe test/live mode toggle** — Admin Settings, `admin_config` Supabase table, `lib/stripe-config.ts`, `/api/admin-config` route, `/api/checkout` + `/api/webhook` updated |
| `6bf5aaa` | 📋 Plan | **Phase 10 documented** — Contact Form + Smart Leads Engine: What/Why/Who/Status, `leads` table schema, new routes, pitch pages updated, README updated |
| `64667c8` | ✅ Complete | **Phase 9 complete** — Client Management System: `/admin/clients` list, `/admin/clients/[id]` profile, `/admin/clients/new`, Client column in `/admin/sites`, "By Client" tab in `/admin/revenue`, auto-upsert client on booking |
| `5807265` | 📋 Plan | Phase 9 plan — `clients.sql`, sidebar nav, docs section, placeholder page |
| `0b4dc35` | 🔧 Fix | Timezone + race condition: IANA timezone on sites/bookings, server-side 409 check, `getTodayInTimezone` moved to `lib/timezones.ts`, booking architecture docs section added |
| `c25cd1d` | ✅ Complete | **Phase 6 complete** — Smart Booking System: availability check, next slot suggestion, `/booking/[id]` confirmation page, Add to Calendar (.ics + Google), cancel/reschedule self-service, Block Dates tab, auto-confirm toggle, customer email auto-fill |
| `82e1440` | 📝 Docs | Feature roadmap rewritten with What/Why/Who/Status standard for all features |
| `5dac1eb` | ✅ Complete | **Phase 5 complete** — 3-step generate form: service selector + custom pricing, currency picker (10 currencies), currency stored on site and shown on public site + booking form |

---

## 2026-09-26

| Commit | Area | What Changed |
|---|---|---|
| `b922dff` | 📝 Docs | Docs + README: full project overview updated — both products, Phases 5–8 roadmap, commercial pitch section |
| `6fea56b` | 📝 Docs | Expanded recommendations with Phases 5–8, commercial pitch section, backlog updated |
| `aeb80f0` | ✨ Feature | Template custom fields — `notes_label`, `notes_placeholder`, `notes_required` per template type; BookingForm updated; docs synced |
| `b89df1f` | 📝 Docs | Mark webhook idempotency + 120s polling as complete in Week 3 |
| `1db4399` | 📝 Docs | Comprehensive sync — all features marked done, tech stack, DB schema, routes, folder structure, Week 4 updated |
| `2522aa1` | ✨ Feature | Audit pitch page `/audit-pitch`; README fully updated with all features, 27 routes |
| `9fa77cc` | ✅ Complete | **Audit Phase 3** — PDF report download via jsPDF, Forensic format, 8 sections, multi-page, docs updated |
| `a7719eb` | ✨ Feature | Audit dark admin theme layout; client-facing audit frontend added to backlog docs |
| `d6f2bb0` | ✅ Complete | **Audit Phase 2** — Crawler (10 pages, 3 concurrent), Pages tab, broken link detection, History search/delete/score trend comparison |
| `a9af653` | ✅ Complete | **Audit Phase 1** — Performance (PSI), SEO (cheerio), Security headers, Tech stack fingerprinting, Accessibility (WCAG 2.1), score rings, issue explorer |

---

## 2026-09-25

| Commit | Area | What Changed |
|---|---|---|
| `3d3d2ae` | 📝 Docs | Gallery fully documented — dashboard upload + public site rendering |
| `9c30201` | ✨ Feature | Gallery renders on public site — "Our Work" grid, 2-col mobile / 3-col desktop, hover zoom |
| `7401d76` | 📝 Docs | Staff booking and analytics added to Features Completed; recommendations updated |
| `cc38ce0` | ✨ Feature | Staff booking — optional preferred staff picker in booking form; staff_id + staff_name saved to booking; email + dashboard updated |
| `cd8f05b` | ✨ Feature | Site analytics — `page_views` table, `/api/track`, Analytics tab in owner dashboard (14-day bar chart, weekly trend), views column in revenue page |
| `b844138` | 📝 Docs | Backlog: documented Gemini 503 root cause from Vercel live logs (AQ. key IP restriction) |
| `dd5f911` | 📝 Docs | README full update — tech stack, features, white-label, project structure, backlog |
| `f703e01` | ✅ Complete | No-blocker backlog complete — PIN change in owner dashboard, logo upload, gallery tab, testimonials editor, MRR revenue dashboard, CSV export; docs updated |
| `cbd7ba1` | 🔧 Fix | Webhook `maxDuration=60` added; respond to Stripe immediately then generate in background |
| `9a3cbcc` | 🔧 Fix | Week 3 progress — webhook idempotency check, polling extended to 120s |
| `d52b01c` | 🔧 Fix | Webhook — idempotency check, remove unused imports, cleaner error logging |
| `713e9bd` | 🔧 Fix | Stripe server-only import fixed; `lib/pricing.ts` split to client-safe module |
| `28c4be2` | 🔧 Fix | Stripe webhook secret configured in Vercel; trigger redeploy |

---

## 2026-09-24

| Commit | Area | What Changed |
|---|---|---|
| `50d34af` | ✅ Complete | **Week 3 — Stripe payments integration**: `/api/checkout`, `/api/webhook`, `/onboard`, `/onboard/success`, `supabase/payments.sql`, `payment_status` tracking, pitch page Pay & Launch CTA |

---

## 2026-09-23

| Commit | Area | What Changed |
|---|---|---|
| `03d36bc` | 📝 Docs | Docs: Week 2 marked complete, Week 3 set as current |
| `642aafe` | 🔧 Fix | Trigger Vercel deployment — fix git author identity (dennymartinez01) |
| `5b2c5e1` | 📝 Docs | Fix Week 2 status — pitch page and Vercel deploy still pending |
| `b76b8c1` | ✅ Complete | **Week 2 complete** — Outreach pitch page `/pitch`, docs updated, mobile responsive confirmed |
| `d648171` | ✨ Feature | Week 2 — Mobile responsive (sticky nav, responsive grids, touch buttons), Resend email fix, Owner dashboard enhancements (Staff, Hours, About, AI Assistant tabs) |
| `a217427` | 📝 Docs | README updated with company story and mission |
| `ddc8bc3` | ✅ Complete | **Week 1 complete** — Templates marketplace (11 templates, gradient cards, slide-over), Agentic AI assistant (9 tools, function calling via Gemini), Owner dashboard full 10-tab build |
| `c9217bf` | 🎉 Init | **KITA Builder Systems v1 — Initial commit**: Next.js 16 scaffold, Supabase schema, 5 templates, admin CMS, public site renderer, booking form, owner dashboard, all API routes, Gemini AI generation |

---

## Legend

| Icon | Meaning |
|---|---|
| 🎉 Init | Project initialisation |
| ✅ Complete | Phase or feature fully shipped |
| ✨ Feature | New feature added |
| 🔧 Fix | Bug fix or correction |
| 📝 Docs | Documentation update only |
| 📋 Plan | Feature planned and documented, not yet built |

---

## How to maintain this file

After every session, add a new dated block at the top with entries for each meaningful commit.
Run `git log --format="%h|%ad|%s" --date=format:"%Y-%m-%d" | Select-Object -First 10` to get the latest commits.

This file is the human-readable companion to `git log`.
The GitHub contribution heatmap (green squares) is the visual companion.
Together they give any new team member a full picture of project history.
