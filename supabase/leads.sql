-- ============================================================
-- KITA BUILDER SYSTEMS — Leads Table (Phase 10)
-- Contact Form + Smart Leads Engine
-- Run AFTER clients.sql
--
-- One row per inquiry/lead capture. Sources:
--   contact_form  — customer filled the inquiry form on client site
--   booking       — customer email captured from a booking
--   audit_inquiry — prospect requested audit from /audit-pitch
-- ============================================================

create table if not exists leads (
  id            uuid        primary key default gen_random_uuid(),
  -- Site context
  site_id       uuid        not null references sites(id) on delete cascade,
  client_id     uuid        references clients(id) on delete set null,
  -- Lead identity
  name          text        not null,
  email         text        not null,
  phone         text,
  -- Inquiry content
  message       text,                   -- free-text from contact form
  service_interest text,                -- which service they asked about
  -- Source tracking
  source        text        not null default 'contact_form'
                  check (source in ('contact_form', 'booking', 'audit_inquiry', 'other')),
  -- Segmentation (copied from site at capture time)
  city          text,
  country       text,
  business_type text,
  -- Promotion opt-in
  opt_in        boolean     not null default false,
  -- Workflow status
  status        text        not null default 'new'
                  check (status in ('new', 'contacted', 'converted', 'closed')),
  -- Internal note (owner-visible)
  notes         text,
  -- Timestamps
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Indexes
create index if not exists idx_leads_site_id    on leads(site_id);
create index if not exists idx_leads_client_id  on leads(client_id) where client_id is not null;
create index if not exists idx_leads_status     on leads(site_id, status);
create index if not exists idx_leads_created_at on leads(created_at desc);
create index if not exists idx_leads_opt_in     on leads(opt_in) where opt_in = true;

-- updated_at trigger (reuses function from clients.sql)
drop trigger if exists leads_updated_at on leads;
create trigger leads_updated_at
  before update on leads
  for each row execute function update_updated_at_column();

-- RLS
alter table leads enable row level security;

-- Public anon can insert (submit inquiry form)
drop policy if exists "public_insert_leads"     on leads;
drop policy if exists "service_role_all_leads"  on leads;

create policy "public_insert_leads"
  on leads for insert to anon, authenticated
  with check (true);

-- Service role full access (owner dashboard + admin panel)
create policy "service_role_all_leads"
  on leads for all to service_role
  using (true) with check (true);
