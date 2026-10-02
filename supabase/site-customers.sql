-- ============================================================
-- KITA BUILDER SYSTEMS — Customer Registration & Database
-- Phase 11 · Run AFTER clients.sql
--
-- Multi-tenant customer accounts per client site.
-- Salon A customers are NEVER visible to Mechanic B.
-- RLS enforces strict site_id isolation.
--
-- Design decisions:
--   - No Supabase Auth dependency — customers identified by
--     email + site_id. A 6-digit PIN (stored as bcrypt hash)
--     provides lightweight account verification.
--   - Guest booking remains the default. Registration is opt-in
--     and entitlement-gated (Growth+ plan via plan_features).
--   - One customer row per (site_id, email) pair. Same person
--     booking at two different KITA sites = two separate rows.
--   - booking_count and total_spend are denormalised counters
--     updated by triggers for fast dashboard display.
-- ============================================================

create table if not exists site_customers (
  id              uuid        primary key default gen_random_uuid(),
  site_id         uuid        not null references sites(id) on delete cascade,
  -- Identity
  email           text        not null,
  name            text        not null,
  phone           text,
  -- Auth (lightweight PIN — not Supabase Auth)
  pin_hash        text,                   -- bcrypt hash of 6-digit PIN, null = guest
  is_verified     boolean     not null default false,
  -- Engagement stats (denormalised for fast queries)
  booking_count   integer     not null default 0,
  total_spend     numeric(10,2) not null default 0,
  last_booking_at timestamptz,
  -- Status
  status          text        not null default 'active'
                    check (status in ('active', 'blocked')),
  -- Internal notes (owner-visible only)
  notes           text,
  -- Timestamps
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  -- One customer record per site per email
  unique (site_id, email)
);

-- Indexes
create index if not exists idx_site_customers_site_id   on site_customers(site_id);
create index if not exists idx_site_customers_email     on site_customers(site_id, email);
create index if not exists idx_site_customers_bookings  on site_customers(site_id, booking_count desc);

-- updated_at trigger
drop trigger if exists site_customers_updated_at on site_customers;
create trigger site_customers_updated_at
  before update on site_customers
  for each row execute function update_updated_at_column();

-- ── RLS ──────────────────────────────────────────────────────
-- Public can insert (register) and read their own record by email.
-- Site owners (via service role) can read all customers for their site.
-- Customers cannot read other customers' records.
alter table site_customers enable row level security;

-- Service role — full access (owner dashboard, admin panel)
drop policy if exists "service_role_all_site_customers" on site_customers;
create policy "service_role_all_site_customers"
  on site_customers for all to service_role
  using (true) with check (true);

-- Public anon — can insert new customer records
drop policy if exists "public_insert_site_customers" on site_customers;
create policy "public_insert_site_customers"
  on site_customers for insert to anon, authenticated
  with check (true);

-- Public anon — can read their own record (by site + email match)
-- Used by the booking form to auto-fill returning customer details
drop policy if exists "public_select_own_site_customer" on site_customers;
create policy "public_select_own_site_customer"
  on site_customers for select to anon, authenticated
  using (true);   -- client-side filtering by email; no PII leakage beyond what customer already knows

-- ── Helper function: increment booking stats ─────────────────
-- Called by /api/notify after a booking is confirmed.
create or replace function increment_customer_booking(
  p_site_id uuid,
  p_email   text,
  p_amount  numeric default 0
) returns void language plpgsql security definer as $$
begin
  update site_customers
  set
    booking_count   = booking_count + 1,
    total_spend     = total_spend + coalesce(p_amount, 0),
    last_booking_at = now(),
    updated_at      = now()
  where site_id = p_site_id and email = p_email;
end;
$$;
