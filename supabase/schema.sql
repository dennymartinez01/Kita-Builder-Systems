-- ============================================================
-- KITA BUILDER SYSTEMS - Supabase Database Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. SITES TABLE
-- One row per generated client website
-- ============================================================
create table if not exists sites (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  business_name   text not null,
  business_type   text not null check (business_type in ('salon','clinic','pet','cafe','mechanic')),
  owner_email     text,
  owner_pin       text not null default '1234',
  theme_json      jsonb not null default '{}',
  published       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- 2. SERVICES TABLE
-- Services offered by a business (linked to site)
-- ============================================================
create table if not exists services (
  id               uuid primary key default gen_random_uuid(),
  site_id          uuid not null references sites(id) on delete cascade,
  name             text not null,
  price            numeric(10,2) not null default 0,
  duration_minutes integer not null default 60,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 3. STAFF TABLE
-- Staff members of a business
-- ============================================================
create table if not exists staff (
  id          uuid primary key default gen_random_uuid(),
  site_id     uuid not null references sites(id) on delete cascade,
  name        text not null,
  role        text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- 4. BOOKINGS TABLE
-- Customer appointments / reservations
-- ============================================================
create table if not exists bookings (
  id              uuid primary key default gen_random_uuid(),
  site_id         uuid not null references sites(id) on delete cascade,
  service_id      uuid references services(id),
  customer_name   text not null,
  customer_phone  text not null,
  service_name    text not null,
  booking_date    date not null,
  booking_time    text not null,
  car_model       text,             -- mechanic only
  pet_name        text,             -- pet clinic only
  notes           text,
  status          text not null default 'pending'
                    check (status in ('pending','confirmed','cancelled')),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (MVP - open access, tighten in v2)
-- ============================================================
alter table sites    enable row level security;
alter table services enable row level security;
alter table staff    enable row level security;
alter table bookings enable row level security;

-- Allow all operations for MVP (replace with user-scoped policies in v2)
create policy "public_all_sites"    on sites    for all using (true) with check (true);
create policy "public_all_services" on services for all using (true) with check (true);
create policy "public_all_staff"    on staff    for all using (true) with check (true);
create policy "public_all_bookings" on bookings for all using (true) with check (true);

-- ============================================================
-- INDEXES for performance
-- ============================================================
create index if not exists idx_services_site_id on services(site_id);
create index if not exists idx_staff_site_id    on staff(site_id);
create index if not exists idx_bookings_site_id on bookings(site_id);
create index if not exists idx_bookings_date    on bookings(booking_date);
create index if not exists idx_sites_slug       on sites(slug);
