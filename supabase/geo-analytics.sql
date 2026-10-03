-- ============================================================
-- KITA BUILDER SYSTEMS — Geographic Visitor Analytics
-- Phase 12 · Run AFTER analytics.sql
--
-- Adds country + region columns to page_views so the owner
-- dashboard can show "WHERE VISITORS COME FROM".
--
-- Privacy-first: stores country (2-letter ISO code) and
-- region name only — never raw IP addresses.
-- ============================================================

alter table page_views
  add column if not exists country text,   -- ISO 3166-1 alpha-2 e.g. 'AU', 'PH', 'US'
  add column if not exists region  text;   -- Region/state name e.g. 'New South Wales'

-- Index for fast geo aggregation queries
create index if not exists idx_page_views_country
  on page_views(site_id, country)
  where country is not null;
