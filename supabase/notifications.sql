-- ============================================================
-- KITA BUILDER SYSTEMS — Admin Notification Center
-- Phase 11 · Run AFTER events.sql
--
-- Stores which platform events have been surfaced as admin
-- notifications, and whether they have been read.
--
-- Design:
--   - Not every event creates a notification — only events that
--     require admin attention (new booking, payment, error, etc.)
--   - Notifications reference events via event_id FK
--   - read_at null = unread; timestamptz = read
-- ============================================================

create table if not exists admin_notifications (
  id           uuid        primary key default gen_random_uuid(),
  event_id     uuid        not null references events(id) on delete cascade,
  event_type   text        not null,   -- denormalised for fast queries without join
  category     text        not null,
  summary      text        not null,
  severity     text        not null default 'info',
  -- Routing context (nullable — depends on event)
  client_id    uuid        references clients(id) on delete set null,
  site_id      uuid        references sites(id)   on delete set null,
  -- Read state
  read_at      timestamptz,            -- null = unread
  created_at   timestamptz not null default now()
);

-- Indexes
create index if not exists idx_notif_read_at    on admin_notifications(read_at)    where read_at is null;
create index if not exists idx_notif_created_at on admin_notifications(created_at desc);
create index if not exists idx_notif_event_id   on admin_notifications(event_id);
create index if not exists idx_notif_severity   on admin_notifications(severity);

-- RLS — service role only
alter table admin_notifications enable row level security;

drop policy if exists "service_role_all_notifications" on admin_notifications;
create policy "service_role_all_notifications"
  on admin_notifications for all to service_role
  using (true) with check (true);
