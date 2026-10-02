-- ============================================================
-- KITA BUILDER SYSTEMS — Attribution Tracking (Phase 12)
-- Adds UTM + source columns to bookings and leads tables.
-- Run AFTER schema.sql and leads.sql
-- ============================================================

-- ── bookings table ───────────────────────────────────────────
alter table bookings
  add column if not exists utm_source   text,   -- google, facebook, instagram, etc.
  add column if not exists utm_medium   text,   -- social, email, paid_search, organic
  add column if not exists utm_campaign text,   -- campaign name e.g. 'summer_promo'
  add column if not exists utm_content  text,   -- ad variant / link label
  add column if not exists utm_term     text,   -- paid search keyword
  add column if not exists referrer     text,   -- raw referrer URL (truncated)
  add column if not exists landing_page text;   -- page the customer first landed on

-- ── leads table ──────────────────────────────────────────────
alter table leads
  add column if not exists utm_source   text,
  add column if not exists utm_medium   text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content  text,
  add column if not exists utm_term     text,
  add column if not exists referrer     text,
  add column if not exists landing_page text;

-- Indexes for attribution analytics queries
create index if not exists idx_bookings_utm_source on bookings(utm_source) where utm_source is not null;
create index if not exists idx_leads_utm_source    on leads(utm_source)    where utm_source is not null;
