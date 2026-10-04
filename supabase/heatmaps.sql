-- ============================================================
-- KITA BUILDER SYSTEMS — Behavioral Heatmaps (Phase 13)
-- Run AFTER schema.sql
--
-- Privacy-first: stores aggregate interaction data only.
-- No PII, no individual user tracking, no raw IPs.
-- Requires explicit opt-in consent from site visitors.
--
-- Event types:
--   click  — x/y position of a click (as % of page dimensions)
--   scroll — maximum scroll depth reached (as % of page height)
-- ============================================================

create table if not exists heatmap_events (
  id            uuid        primary key default gen_random_uuid(),
  site_id       uuid        not null references sites(id) on delete cascade,
  -- What happened
  event_type    text        not null check (event_type in ('click', 'scroll')),
  -- Click position (% of page width/height — 0.0 to 1.0)
  click_x       numeric(5,4),    -- null for scroll events
  click_y       numeric(5,4),    -- null for scroll events
  -- Scroll depth (% of page height reached — 0.0 to 1.0)
  scroll_depth  numeric(5,4),    -- null for click events
  -- Page context
  path          text        not null default '/',
  -- Session bucket — anonymous hash (no user identity)
  session_id    text,            -- client-generated random UUID per visit
  -- Timestamp
  recorded_at   timestamptz not null default now()
);

-- Indexes for aggregation queries
create index if not exists idx_heatmap_site_type  on heatmap_events(site_id, event_type);
create index if not exists idx_heatmap_site_path  on heatmap_events(site_id, path);
create index if not exists idx_heatmap_recorded   on heatmap_events(recorded_at desc);

-- RLS: public can insert (client-side tracking), service_role full access
alter table heatmap_events enable row level security;

drop policy if exists "public_insert_heatmap"       on heatmap_events;
drop policy if exists "service_role_all_heatmap"    on heatmap_events;

create policy "public_insert_heatmap"
  on heatmap_events for insert to anon, authenticated
  with check (true);

create policy "service_role_all_heatmap"
  on heatmap_events for all to service_role
  using (true) with check (true);
