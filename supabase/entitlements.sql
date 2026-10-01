-- ============================================================
-- KITA BUILDER SYSTEMS — Feature & Entitlement Engine
-- Phase 11 · Run AFTER clients.sql
--
-- Three tables:
--   features            — master registry of every gated capability
--   plan_features       — default on/off per subscription plan
--   client_entitlements — per-client admin overrides
--
-- Resolution order:
--   client_entitlements (if row exists) → overrides plan_features
--   plan_features (if no override)      → plan default
--   false                               → if neither row exists
-- ============================================================

-- ── 1. FEATURES ──────────────────────────────────────────────
-- One row per gated capability. Add new features here without
-- touching any application code — just seed a row + plan_features.
create table if not exists features (
  key         text primary key,        -- e.g. 'whatsapp', 'coupons'
  label       text not null,           -- Human-readable: "WhatsApp Integration"
  description text,                    -- One sentence explaining what it does
  category    text not null default 'general',
                                       -- 'booking' | 'crm' | 'analytics' |
                                       -- 'integrations' | 'branding' | 'platform'
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ── 2. PLAN_FEATURES ─────────────────────────────────────────
-- Default entitlement for each plan. Upsert when plans change.
create table if not exists plan_features (
  plan        text not null,           -- 'trial' | 'starter' | 'growth' | 'agency'
  feature_key text not null references features(key) on delete cascade,
  enabled     boolean not null default false,
  limit_value integer,                 -- nullable: max sites, max staff, etc.
  limit_unit  text,                    -- 'sites' | 'staff' | 'bookings_per_month'
  primary key (plan, feature_key)
);

-- ── 3. CLIENT_ENTITLEMENTS ───────────────────────────────────
-- Admin overrides per client. Only rows that differ from plan default
-- need to exist here. Absence = use plan default.
create table if not exists client_entitlements (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id) on delete cascade,
  feature_key text not null references features(key) on delete cascade,
  enabled     boolean not null,        -- true = grant, false = revoke
  limit_value integer,                 -- override limit (null = use plan default)
  override_reason text,                -- admin note: why this was overridden
  overridden_by   text,                -- admin identifier
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (client_id, feature_key)
);

-- Indexes
create index if not exists idx_plan_features_plan       on plan_features(plan);
create index if not exists idx_plan_features_feature    on plan_features(feature_key);
create index if not exists idx_client_entitlements_cid  on client_entitlements(client_id);

-- updated_at trigger (reuses function from clients.sql)
drop trigger if exists client_entitlements_updated_at on client_entitlements;
create trigger client_entitlements_updated_at
  before update on client_entitlements
  for each row execute function update_updated_at_column();

-- RLS — service role only (admin panel uses service role key)
alter table features            enable row level security;
alter table plan_features       enable row level security;
alter table client_entitlements enable row level security;

drop policy if exists "service_role_all_features"            on features;
drop policy if exists "service_role_all_plan_features"       on plan_features;
drop policy if exists "service_role_all_client_entitlements" on client_entitlements;

create policy "service_role_all_features"
  on features for all to service_role using (true) with check (true);

create policy "service_role_all_plan_features"
  on plan_features for all to service_role using (true) with check (true);

create policy "service_role_all_client_entitlements"
  on client_entitlements for all to service_role using (true) with check (true);

-- ── 4. SEED — FEATURES REGISTRY ──────────────────────────────
insert into features (key, label, description, category) values
  -- Booking
  ('booking_widget',        'Online Booking Widget',       '24/7 booking form on public site',                                    'booking'),
  ('booking_reminders',     'Booking Reminders',           'Email + SMS reminders 24h before appointment',                        'booking'),
  ('booking_deposit',       'Booking Deposit',             'Require % deposit at booking time via Stripe',                        'booking'),
  ('booking_calendar_view', 'Booking Calendar View',       'Weekly/monthly calendar view in owner dashboard',                     'booking'),
  ('block_dates',           'Block Out Dates',             'Owner marks unavailable dates/times',                                  'booking'),
  ('auto_confirm',          'Auto-Confirm Toggle',         'Toggle between auto-confirm and manual confirmation',                  'booking'),
  -- CRM
  ('contact_form',          'Contact / Inquiry Form',      '"Not ready to book?" form capturing leads',                           'crm'),
  ('leads_dashboard',       'Leads Dashboard',             'View and manage inquiry leads in owner dashboard',                    'crm'),
  ('customer_accounts',     'Customer Accounts',           'Optional customer registration and persistent profiles',              'crm'),
  ('customer_database',     'Customer Database',           'Searchable customer list with booking history and spend',             'crm'),
  ('coupons',               'Coupon & Promotion Engine',   'Create discount codes with limits, expiry, and service filters',      'crm'),
  -- Analytics
  ('site_analytics',        'Site Analytics (14-day)',     '14-day page view chart and booking status breakdown',                 'analytics'),
  ('attribution_tracking',  'Attribution Tracking',        'UTM + source tracking on bookings and leads',                        'analytics'),
  ('geo_analytics',         'Geographic Analytics',        'Country/region/city breakdown of site visitors',                     'analytics'),
  ('heatmaps',              'Behavioral Heatmaps',         'Click, scroll and engagement heatmaps (privacy-first)',               'analytics'),
  -- Integrations
  ('whatsapp',              'WhatsApp Integration',        'WhatsApp booking button + notification to business',                  'integrations'),
  ('messenger',             'Messenger Integration',       'Facebook Messenger booking channel',                                  'integrations'),
  ('google_calendar',       'Google Calendar Sync',        'Sync confirmed bookings to owner Google Calendar',                    'integrations'),
  -- Branding
  ('white_label',           'White-Label Mode',            'Remove KITA branding — use agency name, logo, and domain',           'branding'),
  ('custom_domain',         'Custom Domain',               'Point a custom domain to the client site',                           'branding'),
  -- Platform
  ('ai_assistant',          'AI Assistant',                '9-tool chat-based site editor in owner dashboard',                   'platform'),
  ('promotion_blasts',      'Promotion Blasts',            'Send targeted offers to opted-in leads in the KITA network',         'platform'),
  ('max_sites',             'Max Sites',                   'Maximum number of client sites allowed (limit_value = count)',        'platform'),
  ('priority_support',      'Priority Support',            'Faster response times and dedicated support channel',                'platform'),
  ('onboarding_call',       'Dedicated Onboarding Call',   'Scheduled onboarding call with KITA team',                          'platform')
on conflict (key) do nothing;

-- ── 5. SEED — PLAN DEFAULTS ───────────────────────────────────
-- trial
insert into plan_features (plan, feature_key, enabled, limit_value, limit_unit) values
  ('trial', 'booking_widget',        true,  null, null),
  ('trial', 'booking_reminders',     false, null, null),
  ('trial', 'booking_deposit',       false, null, null),
  ('trial', 'booking_calendar_view', false, null, null),
  ('trial', 'block_dates',           true,  null, null),
  ('trial', 'auto_confirm',          true,  null, null),
  ('trial', 'contact_form',          false, null, null),
  ('trial', 'leads_dashboard',       false, null, null),
  ('trial', 'customer_accounts',     false, null, null),
  ('trial', 'customer_database',     false, null, null),
  ('trial', 'coupons',               false, null, null),
  ('trial', 'site_analytics',        true,  null, null),
  ('trial', 'attribution_tracking',  false, null, null),
  ('trial', 'geo_analytics',         false, null, null),
  ('trial', 'heatmaps',              false, null, null),
  ('trial', 'whatsapp',              false, null, null),
  ('trial', 'messenger',             false, null, null),
  ('trial', 'google_calendar',       false, null, null),
  ('trial', 'white_label',           false, null, null),
  ('trial', 'custom_domain',         false, null, null),
  ('trial', 'ai_assistant',          true,  null, null),
  ('trial', 'promotion_blasts',      false, 0,    'blasts_per_month'),
  ('trial', 'max_sites',             true,  1,    'sites'),
  ('trial', 'priority_support',      false, null, null),
  ('trial', 'onboarding_call',       false, null, null)
on conflict (plan, feature_key) do nothing;

-- starter
insert into plan_features (plan, feature_key, enabled, limit_value, limit_unit) values
  ('starter', 'booking_widget',        true,  null, null),
  ('starter', 'booking_reminders',     false, null, null),
  ('starter', 'booking_deposit',       false, null, null),
  ('starter', 'booking_calendar_view', false, null, null),
  ('starter', 'block_dates',           true,  null, null),
  ('starter', 'auto_confirm',          true,  null, null),
  ('starter', 'contact_form',          true,  null, null),
  ('starter', 'leads_dashboard',       true,  null, null),
  ('starter', 'customer_accounts',     false, null, null),
  ('starter', 'customer_database',     false, null, null),
  ('starter', 'coupons',               false, null, null),
  ('starter', 'site_analytics',        true,  null, null),
  ('starter', 'attribution_tracking',  false, null, null),
  ('starter', 'geo_analytics',         false, null, null),
  ('starter', 'heatmaps',              false, null, null),
  ('starter', 'whatsapp',              false, null, null),
  ('starter', 'messenger',             false, null, null),
  ('starter', 'google_calendar',       false, null, null),
  ('starter', 'white_label',           false, null, null),
  ('starter', 'custom_domain',         false, null, null),
  ('starter', 'ai_assistant',          true,  null, null),
  ('starter', 'promotion_blasts',      false, 0,    'blasts_per_month'),
  ('starter', 'max_sites',             true,  1,    'sites'),
  ('starter', 'priority_support',      false, null, null),
  ('starter', 'onboarding_call',       false, null, null)
on conflict (plan, feature_key) do nothing;

-- growth
insert into plan_features (plan, feature_key, enabled, limit_value, limit_unit) values
  ('growth', 'booking_widget',        true,  null, null),
  ('growth', 'booking_reminders',     true,  null, null),
  ('growth', 'booking_deposit',       false, null, null),
  ('growth', 'booking_calendar_view', true,  null, null),
  ('growth', 'block_dates',           true,  null, null),
  ('growth', 'auto_confirm',          true,  null, null),
  ('growth', 'contact_form',          true,  null, null),
  ('growth', 'leads_dashboard',       true,  null, null),
  ('growth', 'customer_accounts',     true,  null, null),
  ('growth', 'customer_database',     true,  null, null),
  ('growth', 'coupons',               true,  null, null),
  ('growth', 'site_analytics',        true,  null, null),
  ('growth', 'attribution_tracking',  true,  null, null),
  ('growth', 'geo_analytics',         false, null, null),
  ('growth', 'heatmaps',              false, null, null),
  ('growth', 'whatsapp',              true,  null, null),
  ('growth', 'messenger',             false, null, null),
  ('growth', 'google_calendar',       true,  null, null),
  ('growth', 'white_label',           false, null, null),
  ('growth', 'custom_domain',         false, null, null),
  ('growth', 'ai_assistant',          true,  null, null),
  ('growth', 'promotion_blasts',      true,  2,    'blasts_per_month'),
  ('growth', 'max_sites',             true,  3,    'sites'),
  ('growth', 'priority_support',      true,  null, null),
  ('growth', 'onboarding_call',       false, null, null)
on conflict (plan, feature_key) do nothing;

-- agency
insert into plan_features (plan, feature_key, enabled, limit_value, limit_unit) values
  ('agency', 'booking_widget',        true,  null, null),
  ('agency', 'booking_reminders',     true,  null, null),
  ('agency', 'booking_deposit',       true,  null, null),
  ('agency', 'booking_calendar_view', true,  null, null),
  ('agency', 'block_dates',           true,  null, null),
  ('agency', 'auto_confirm',          true,  null, null),
  ('agency', 'contact_form',          true,  null, null),
  ('agency', 'leads_dashboard',       true,  null, null),
  ('agency', 'customer_accounts',     true,  null, null),
  ('agency', 'customer_database',     true,  null, null),
  ('agency', 'coupons',               true,  null, null),
  ('agency', 'site_analytics',        true,  null, null),
  ('agency', 'attribution_tracking',  true,  null, null),
  ('agency', 'geo_analytics',         true,  null, null),
  ('agency', 'heatmaps',              false, null, null),
  ('agency', 'whatsapp',              true,  null, null),
  ('agency', 'messenger',             true,  null, null),
  ('agency', 'google_calendar',       true,  null, null),
  ('agency', 'white_label',           true,  null, null),
  ('agency', 'custom_domain',         true,  null, null),
  ('agency', 'ai_assistant',          true,  null, null),
  ('agency', 'promotion_blasts',      true,  5,    'blasts_per_month'),
  ('agency', 'max_sites',             true,  10,   'sites'),
  ('agency', 'priority_support',      true,  null, null),
  ('agency', 'onboarding_call',       true,  null, null)
on conflict (plan, feature_key) do nothing;
