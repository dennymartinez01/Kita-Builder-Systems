-- ============================================================
-- KITA BUILDER SYSTEMS - Client Management System (Phase 9)
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- 1. CLIENTS TABLE
create table if not exists clients (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  email                 text unique not null,
  phone                 text,
  country               text,                -- e.g. 'AU', 'PH', 'US', 'UK'
  city                  text,                -- e.g. 'Sydney', 'Manila', 'Los Angeles'
  subscription_plan     text not null default 'starter'
                          check (subscription_plan in ('starter', 'growth', 'agency', 'custom', 'trial')),
  subscription_status   text not null default 'trial'
                          check (subscription_status in ('trial', 'active', 'overdue', 'cancelled', 'paused')),
  trial_ends_at         timestamptz,
  stripe_customer_id    text,
  source                text,                -- 'outreach' | 'referral' | 'organic' | 'audit' | 'direct'
  notes                 text,                -- Admin internal notes
  onboarding_complete   boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- 2. Link sites to clients
alter table sites
  add column if not exists client_id uuid references clients(id) on delete set null;

create index if not exists idx_sites_client_id on sites(client_id);
create index if not exists idx_clients_email on clients(email);
create index if not exists idx_clients_country on clients(country);
create index if not exists idx_clients_status on clients(subscription_status);

-- 3. RLS
alter table clients enable row level security;
create policy "public_all_clients" on clients for all using (true) with check (true);

-- 4. Auto-update updated_at trigger
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at
  before update on clients
  for each row
  execute function update_updated_at_column();
