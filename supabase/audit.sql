-- ============================================================
-- KITA BUILDER SYSTEMS - Audit Module Tables
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Main audits table
create table if not exists audits (
  id          uuid primary key default gen_random_uuid(),
  url         text not null,
  status      text not null default 'queued'
                check (status in ('queued','running','completed','failed')),
  scores      jsonb default '{}',
  raw_data    jsonb default '{}',
  issues      jsonb default '[]',
  created_at  timestamptz not null default now()
);

-- Crawler pages table (Phase 2)
create table if not exists audit_pages (
  id           uuid primary key default gen_random_uuid(),
  audit_id     uuid not null references audits(id) on delete cascade,
  url          text not null,
  status_code  integer,
  title        text,
  meta_desc    text,
  h1_count     integer default 0,
  created_at   timestamptz not null default now()
);

-- Indexes
create index if not exists idx_audits_created_at  on audits(created_at desc);
create index if not exists idx_audits_url         on audits(url);
create index if not exists idx_audit_pages_audit  on audit_pages(audit_id);

-- RLS
alter table audits       enable row level security;
alter table audit_pages  enable row level security;
create policy "public_all_audits"       on audits       for all using (true) with check (true);
create policy "public_all_audit_pages"  on audit_pages  for all using (true) with check (true);
