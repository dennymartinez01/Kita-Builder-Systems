-- ============================================================
-- KITA BUILDER SYSTEMS - Staff Booking Column
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- Run AFTER schema.sql
-- ============================================================

-- Add staff_id and staff_name to bookings table
alter table bookings
  add column if not exists staff_id   uuid references staff(id) on delete set null,
  add column if not exists staff_name text;

-- Index for filtering bookings by staff
create index if not exists idx_bookings_staff_id on bookings(staff_id);
