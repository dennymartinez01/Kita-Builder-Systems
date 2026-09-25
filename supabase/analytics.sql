-- ============================================================
-- KITA BUILDER SYSTEMS - Analytics Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- Run AFTER schema.sql
-- ============================================================

-- Page views table — one row per visit to a client site
create table if not exists page_views (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references sites(id) on delete cascade,
  viewed_at  timestamptz not null default now(),
  path       text not null default '/'
);

-- Indexes for fast analytics queries
create index if not exists idx_page_views_site_id    on page_views(site_id);
create index if not exists idx_page_views_viewed_at  on page_views(viewed_at);
create index if not exists idx_page_views_site_date  on page_views(site_id, viewed_at);

-- RLS
alter table page_views enable row level security;
create policy "public_all_page_views" on page_views for all using (true) with check (true);
