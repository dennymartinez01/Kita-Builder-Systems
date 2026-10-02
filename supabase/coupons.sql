-- ============================================================
-- KITA BUILDER SYSTEMS — Coupon & Promotion Engine
-- Phase 11 · Run AFTER clients.sql
--
-- WooCommerce-style coupon codes per client site.
-- Validation is always server-side — client preview only.
-- ============================================================

create table if not exists coupons (
  id                    uuid        primary key default gen_random_uuid(),
  site_id               uuid        not null references sites(id) on delete cascade,
  -- Code
  code                  text        not null,            -- e.g. 'WELCOME20'
  description           text,                            -- owner-visible note
  -- Discount
  discount_type         text        not null default 'percentage'
                          check (discount_type in ('percentage', 'fixed')),
  discount_value        numeric(10,2) not null,          -- e.g. 20 (%) or 15.00 ($)
  -- Constraints
  min_booking_amount    numeric(10,2) default 0,         -- minimum service price to apply
  max_discount          numeric(10,2),                   -- cap for percentage discounts (null = no cap)
  usage_limit           integer,                         -- total uses allowed (null = unlimited)
  per_customer_limit    integer default 1,               -- max uses per customer email (null = unlimited)
  applicable_service_ids jsonb default '[]'::jsonb,      -- [] = all services; [uuid, ...] = specific
  -- Validity window
  starts_at             timestamptz default now(),
  expires_at            timestamptz,                     -- null = never expires
  -- State
  active                boolean     not null default true,
  usage_count           integer     not null default 0,  -- denormalised total uses
  -- Timestamps
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- One code per site (case-insensitive enforced in app layer)
  unique (site_id, code)
);

-- Indexes
create index if not exists idx_coupons_site_id  on coupons(site_id);
create index if not exists idx_coupons_code     on coupons(site_id, code);
create index if not exists idx_coupons_active   on coupons(site_id, active) where active = true;

-- updated_at trigger
drop trigger if exists coupons_updated_at on coupons;
create trigger coupons_updated_at
  before update on coupons
  for each row execute function update_updated_at_column();

-- ── coupon_usages — tracks per-booking redemptions ───────────
create table if not exists coupon_usages (
  id          uuid        primary key default gen_random_uuid(),
  coupon_id   uuid        not null references coupons(id) on delete cascade,
  site_id     uuid        not null references sites(id)   on delete cascade,
  booking_id  uuid,                   -- FK to bookings.id (nullable — set after booking saved)
  customer_email text,                -- for per_customer_limit enforcement
  discount_applied numeric(10,2) not null,
  used_at     timestamptz not null default now()
);

create index if not exists idx_coupon_usages_coupon_id on coupon_usages(coupon_id);
create index if not exists idx_coupon_usages_email     on coupon_usages(coupon_id, customer_email);

-- ── RLS ──────────────────────────────────────────────────────
alter table coupons       enable row level security;
alter table coupon_usages enable row level security;

drop policy if exists "service_role_all_coupons"        on coupons;
drop policy if exists "public_select_active_coupons"    on coupons;
drop policy if exists "service_role_all_coupon_usages"  on coupon_usages;

-- Service role — full CRUD (owner dashboard, validation API)
create policy "service_role_all_coupons"
  on coupons for all to service_role using (true) with check (true);

-- Public — can read active coupons for a site (needed for validate endpoint fallback)
-- Real validation happens server-side; this just allows the anon client to not error
create policy "public_select_active_coupons"
  on coupons for select to anon, authenticated
  using (active = true);

create policy "service_role_all_coupon_usages"
  on coupon_usages for all to service_role using (true) with check (true);
