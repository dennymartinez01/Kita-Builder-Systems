-- ============================================================
-- KITA BUILDER SYSTEMS — Trial Account Request System
-- Phase 11 · Run AFTER clients.sql
--
-- Prospects fill a public form at /trial.
-- Admin reviews at /admin/trial-requests → Approve / Reject.
-- On approve: client record created, trial started, welcome email sent.
--
-- A trial_request is separate from a client record —
-- the person requesting a trial is not yet a client.
-- ============================================================

create table if not exists trial_requests (
  id               uuid        primary key default gen_random_uuid(),
  -- Prospect info
  name             text        not null,
  email            text        not null,
  phone            text,
  country          text,
  city             text,
  -- Business info
  business_name    text        not null,
  business_type    text        not null,   -- salon | clinic | pet | cafe | mechanic | other
  website          text,                   -- existing website or social page
  intended_use     text,                   -- free-text: why they want KITA
  -- Trial config requested
  trial_plan       text        not null default 'starter'
                     check (trial_plan in ('starter', 'growth', 'agency')),
  trial_duration_days integer not null default 14
                     check (trial_duration_days in (7, 14, 21, 30, 60)),
  -- Privacy + consent
  privacy_accepted boolean     not null default false,
  -- Workflow status
  status           text        not null default 'pending'
                     check (status in ('pending', 'under_review', 'approved', 'rejected', 'activated', 'expired', 'converted', 'cancelled')),
  -- Admin fields
  reviewed_by      text,                   -- admin identifier
  reviewed_at      timestamptz,
  rejection_reason text,
  admin_notes      text,
  -- Link to created client (set on approve)
  client_id        uuid        references clients(id) on delete set null,
  -- Timestamps
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Indexes
create index if not exists idx_trial_requests_status    on trial_requests(status);
create index if not exists idx_trial_requests_email     on trial_requests(email);
create index if not exists idx_trial_requests_created   on trial_requests(created_at desc);

-- updated_at trigger (reuses function from clients.sql)
drop trigger if exists trial_requests_updated_at on trial_requests;
create trigger trial_requests_updated_at
  before update on trial_requests
  for each row execute function update_updated_at_column();

-- RLS: public can insert (submit a request), service_role can do everything
alter table trial_requests enable row level security;

drop policy if exists "public_insert_trial_requests"      on trial_requests;
drop policy if exists "service_role_all_trial_requests"   on trial_requests;

create policy "public_insert_trial_requests"
  on trial_requests for insert
  to anon, authenticated
  with check (privacy_accepted = true);

create policy "service_role_all_trial_requests"
  on trial_requests for all
  to service_role
  using (true) with check (true);
