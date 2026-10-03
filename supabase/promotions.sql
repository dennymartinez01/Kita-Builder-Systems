-- ============================================================
-- KITA BUILDER SYSTEMS — Smart Promotion Blasts (Phase 10)
-- Run AFTER leads.sql
--
-- Tracks every promotion blast sent to opted-in leads.
-- One row per campaign send.
-- ============================================================

create table if not exists promotion_blasts (
  id              uuid        primary key default gen_random_uuid(),
  -- Campaign content
  headline        text        not null,
  offer_text      text        not null,
  cta_url         text        not null,
  cta_label       text        not null default 'Learn More',
  expires_at      timestamptz,
  -- Audience filters used (stored for audit trail)
  filter_city     text,                    -- null = all cities
  filter_business_type text,               -- null = all types
  filter_country  text,                    -- null = all countries
  -- Results
  recipients_count integer    not null default 0,
  sent_count      integer     not null default 0,
  failed_count    integer     not null default 0,
  -- Status
  status          text        not null default 'draft'
                    check (status in ('draft', 'sending', 'sent', 'failed')),
  error_message   text,
  -- Who sent it
  sent_by         text        not null default 'admin',
  -- Timestamps
  created_at      timestamptz not null default now(),
  sent_at         timestamptz
);

-- Index for history queries
create index if not exists idx_promotion_blasts_created on promotion_blasts(created_at desc);
create index if not exists idx_promotion_blasts_status  on promotion_blasts(status);

-- RLS
alter table promotion_blasts enable row level security;

drop policy if exists "service_role_all_promotion_blasts" on promotion_blasts;
create policy "service_role_all_promotion_blasts"
  on promotion_blasts for all to service_role
  using (true) with check (true);
