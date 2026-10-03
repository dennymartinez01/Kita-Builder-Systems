-- ============================================================
-- KITA BUILDER SYSTEMS — Global Suppression List (Phase 12)
-- Run AFTER leads.sql
--
-- Any email address in this table is permanently blocked from
-- receiving promotion blasts. Unsubscribes are honoured forever.
--
-- Sources:
--   unsubscribe  — customer clicked unsubscribe link in email
--   admin        — manually added by operator
--   bounce       — email bounced (future: Resend webhook)
--   complaint    — spam complaint (future: Resend webhook)
-- ============================================================

create table if not exists suppression_list (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null unique,
  reason      text        not null default 'unsubscribe'
                check (reason in ('unsubscribe', 'admin', 'bounce', 'complaint', 'other')),
  source      text,                   -- e.g. 'promotion_blast', 'manual', blast_id
  notes       text,                   -- admin internal note
  added_at    timestamptz not null default now()
);

-- Index for fast suppression check in /api/leads/promote
create index if not exists idx_suppression_email on suppression_list(email);

-- RLS
alter table suppression_list enable row level security;

-- Public can insert (unsubscribe action from email link)
drop policy if exists "public_insert_suppression"      on suppression_list;
drop policy if exists "service_role_all_suppression"   on suppression_list;

create policy "public_insert_suppression"
  on suppression_list for insert to anon, authenticated
  with check (reason = 'unsubscribe');

create policy "service_role_all_suppression"
  on suppression_list for all to service_role
  using (true) with check (true);
