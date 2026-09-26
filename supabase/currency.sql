-- ============================================================
-- KITA BUILDER SYSTEMS - Currency Column
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

alter table sites
  add column if not exists currency text not null default 'USD';

-- Index for filtering by currency
create index if not exists idx_sites_currency on sites(currency);
