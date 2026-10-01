# CHANGELOG — KITA Builder Systems

All notable changes to this project are recorded here in reverse chronological order.
Format: `YYYY-MM-DD | commit | what changed`

Each entry maps to a git commit. Run `git log --oneline` to cross-reference.

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
