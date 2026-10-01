-- ============================================================
-- KITA BUILDER SYSTEMS — Universal Event Stream
-- Phase 11 · Run after clients.sql
--
-- Single table for every meaningful platform action.
-- Powers: Notification Center, Admin Audit Trail, Analytics.
--
-- Resolution pattern:
--   Every route/service calls logEvent() → row inserted here
--   /admin/events reads + filters this table
--   Notifications (Phase 11 #10) query this table for unread items
-- ============================================================

create table if not exists events (
  id           uuid        primary key default gen_random_uuid(),
  -- When
  occurred_at  timestamptz not null default now(),
  -- What happened
  event_type   text        not null,   -- 'booking.created', 'site.created', etc.
  category     text        not null,   -- 'booking' | 'site' | 'client' | 'subscription'
                                       -- | 'entitlement' | 'payment' | 'auth' | 'system'
  severity     text        not null default 'info'
                             check (severity in ('info', 'warning', 'error', 'critical')),
  -- Who did it
  actor_type   text,                   -- 'admin' | 'client' | 'customer' | 'system'
  actor_id     text,                   -- free-form identifier (email, uuid, 'system')
  -- What it affected
  client_id    uuid        references clients(id) on delete set null,
  site_id      uuid        references sites(id)   on delete set null,
  entity_type  text,                   -- 'booking' | 'client' | 'site' | 'entitlement'
  entity_id    text,                   -- uuid or slug of the affected entity
  -- Extra detail
  metadata     jsonb,                  -- arbitrary key-value pairs for context
  summary      text,                   -- human-readable one-line description
  ip_address   text,                   -- optional — for auth events
  created_at   timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_events_occurred_at  on events(occurred_at desc);
create index if not exists idx_events_event_type   on events(event_type);
create index if not exists idx_events_category     on events(category);
create index if not exists idx_events_client_id    on events(client_id) where client_id is not null;
create index if not exists idx_events_site_id      on events(site_id)   where site_id   is not null;
create index if not exists idx_events_severity     on events(severity);

-- ── RLS ──────────────────────────────────────────────────────
-- Service role only — all writes go through server-side logEvent()
-- which uses createServerClient() (service role key).
alter table events enable row level security;

drop policy if exists "service_role_all_events" on events;
create policy "service_role_all_events"
  on events for all to service_role
  using (true) with check (true);
