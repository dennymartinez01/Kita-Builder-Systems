-- ============================================================
-- KITA BUILDER SYSTEMS — Trial Duration Configuration
-- Phase 11 · Run AFTER clients.sql
--
-- Adds configurable trial duration to the clients table.
-- Replaces hardcoded "14 days" assumption throughout the app.
--
-- New columns:
--   trial_starts_at     — when the trial began (null = not started)
--   trial_duration_days — how many days the trial lasts (default 14)
--
-- trial_ends_at already exists from clients.sql — we keep it as the
-- authoritative expiry timestamp. trial_duration_days + trial_starts_at
-- are the inputs; trial_ends_at is the computed output stored for queries.
-- ============================================================

alter table clients
  add column if not exists trial_starts_at    timestamptz,
  add column if not exists trial_duration_days integer not null default 14
    check (trial_duration_days in (7, 14, 21, 30, 60));

-- Backfill existing trial clients:
-- If trial_ends_at is set but trial_starts_at is null,
-- derive trial_starts_at = trial_ends_at - trial_duration_days
update clients
set trial_starts_at = trial_ends_at - (trial_duration_days || ' days')::interval
where
  trial_ends_at is not null
  and trial_starts_at is null;

-- Index for expiry queries (e.g. "trials expiring today")
create index if not exists idx_clients_trial_ends_at
  on clients(trial_ends_at)
  where trial_ends_at is not null;
