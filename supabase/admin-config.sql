-- KITA Builder Systems — Admin Config Table
-- Stores operator-level settings that can be changed at runtime without redeployment.
-- Run this once in Supabase SQL Editor.

create table if not exists admin_config (
  id          text primary key default 'singleton', -- always one row
  stripe_mode text not null default 'test'          -- 'test' | 'live'
    check (stripe_mode in ('test', 'live')),
  updated_at  timestamptz default now()
);

-- Insert the default singleton row if it doesn't exist
insert into admin_config (id, stripe_mode)
values ('singleton', 'test')
on conflict (id) do nothing;

-- RLS: only service_role can read/write (admin API calls use service role key)
alter table admin_config enable row level security;

create policy if not exists "service_role_all_admin_config"
  on admin_config
  for all
  to service_role
  using (true)
  with check (true);
