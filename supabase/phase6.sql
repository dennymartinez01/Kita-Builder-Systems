-- ============================================================
-- KITA BUILDER SYSTEMS - Phase 6: Smart Booking System
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- 1. Add auto_confirm toggle to sites
alter table sites
  add column if not exists auto_confirm boolean not null default true;

-- 2. Add cancel_token to bookings (used for self-service cancel/reschedule)
alter table bookings
  add column if not exists cancel_token text,
  add column if not exists customer_email text,
  add column if not exists rescheduled_from uuid references bookings(id) on delete set null;

-- Unique index on cancel_token for fast lookup
create unique index if not exists idx_bookings_cancel_token
  on bookings(cancel_token) where cancel_token is not null;

-- 3. blocked_dates table — owner marks unavailable dates/times
create table if not exists blocked_dates (
  id         uuid primary key default gen_random_uuid(),
  site_id    uuid not null references sites(id) on delete cascade,
  date       date not null,
  start_time text,             -- null = full day block, e.g. '09:00'
  end_time   text,             -- null = full day block, e.g. '17:00'
  reason     text,             -- e.g. "Public holiday", "Staff training"
  created_at timestamptz not null default now()
);

create index if not exists idx_blocked_dates_site_date on blocked_dates(site_id, date);

-- RLS
alter table blocked_dates enable row level security;
create policy if not exists "public_all_blocked_dates" on blocked_dates for all using (true) with check (true);

-- ============================================================
-- TIMEZONE SUPPORT
-- ============================================================

-- Add timezone to sites (IANA timezone string e.g. "Australia/Sydney")
alter table sites
  add column if not exists timezone text not null default 'UTC';

-- Add timezone to bookings for immutable record (snapshot at booking time)
alter table bookings
  add column if not exists site_timezone text not null default 'UTC';
