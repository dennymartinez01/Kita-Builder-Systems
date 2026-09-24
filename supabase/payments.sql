-- ============================================================
-- KITA BUILDER SYSTEMS - Stripe Payment Columns
-- Run this in: Supabase Dashboard > SQL Editor > New Query > Run
-- Run AFTER schema.sql
-- ============================================================

-- Add payment tracking columns to sites table
alter table sites
  add column if not exists payment_status   text not null default 'unpaid'
    check (payment_status in ('unpaid', 'paid', 'free')),
  add column if not exists stripe_customer_id    text,
  add column if not exists stripe_session_id     text,
  add column if not exists stripe_payment_intent text,
  add column if not exists paid_at               timestamptz;

-- Index for quick lookup by session ID (used in webhook)
create index if not exists idx_sites_stripe_session
  on sites(stripe_session_id);

-- Mark existing sites as 'free' (they were created before payments)
update sites set payment_status = 'free' where payment_status = 'unpaid';
