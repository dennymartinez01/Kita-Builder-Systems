-- ============================================================
-- KITA BUILDER SYSTEMS — Outreach & Campaign Center (Phase 12)
-- Run AFTER leads.sql + suppression.sql
--
-- campaigns      — one row per named campaign (reusable template)
-- campaign_sends — one row per execution (a campaign can be sent multiple times)
-- ============================================================

-- ── CAMPAIGNS ────────────────────────────────────────────────
create table if not exists campaigns (
  id                  uuid        primary key default gen_random_uuid(),
  -- Identity
  name                text        not null,         -- e.g. "Spring Promo 2026"
  description         text,                         -- internal note
  -- Email content
  subject             text        not null,
  body_text           text        not null,          -- offer body paragraph
  cta_url             text        not null,
  cta_label           text        not null default 'Learn More',
  expires_at          timestamptz,
  -- Audience filters (defaults: null = all opted-in leads)
  filter_city         text,
  filter_business_type text,
  filter_country      text,
  -- Status
  status              text        not null default 'draft'
                        check (status in ('draft', 'active', 'paused', 'archived')),
  -- Stats (denormalised from campaign_sends)
  total_sends         integer     not null default 0,
  total_sent          integer     not null default 0,
  total_failed        integer     not null default 0,
  -- Timestamps
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── CAMPAIGN SENDS ────────────────────────────────────────────
-- Each time a campaign is actually sent, a send record is created.
create table if not exists campaign_sends (
  id                  uuid        primary key default gen_random_uuid(),
  campaign_id         uuid        not null references campaigns(id) on delete cascade,
  -- Audience at time of send
  recipients_count    integer     not null default 0,
  sent_count          integer     not null default 0,
  failed_count        integer     not null default 0,
  suppressed_count    integer     not null default 0,
  -- Status
  status              text        not null default 'pending'
                        check (status in ('pending', 'sending', 'sent', 'failed')),
  error_message       text,
  -- Who sent it
  sent_by             text        not null default 'admin',
  -- Timestamps
  started_at          timestamptz not null default now(),
  completed_at        timestamptz
);

-- Indexes
create index if not exists idx_campaigns_status       on campaigns(status);
create index if not exists idx_campaigns_created      on campaigns(created_at desc);
create index if not exists idx_campaign_sends_cid     on campaign_sends(campaign_id);
create index if not exists idx_campaign_sends_status  on campaign_sends(status);

-- updated_at trigger
drop trigger if exists campaigns_updated_at on campaigns;
create trigger campaigns_updated_at
  before update on campaigns
  for each row execute function update_updated_at_column();

-- RLS
alter table campaigns       enable row level security;
alter table campaign_sends  enable row level security;

drop policy if exists "service_role_all_campaigns"      on campaigns;
drop policy if exists "service_role_all_campaign_sends" on campaign_sends;

create policy "service_role_all_campaigns"
  on campaigns for all to service_role using (true) with check (true);

create policy "service_role_all_campaign_sends"
  on campaign_sends for all to service_role using (true) with check (true);
