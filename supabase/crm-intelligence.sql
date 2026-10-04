-- ─────────────────────────────────────────────────────────────
-- CRM Intelligence — Phase 15
-- Adds attribution columns to site_customers + leads,
-- creates a lead_client_matches view for cross-signal matching.
-- Run this once in Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────

-- 1. Add attribution columns to site_customers
--    (nullable — backfilled by /api/notify on new bookings)
ALTER TABLE site_customers
  ADD COLUMN IF NOT EXISTS utm_source   text,
  ADD COLUMN IF NOT EXISTS utm_medium   text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content  text,
  ADD COLUMN IF NOT EXISTS utm_term     text,
  ADD COLUMN IF NOT EXISTS referrer     text,
  ADD COLUMN IF NOT EXISTS landing_page text;

-- 2. Add attribution columns to leads
--    (nullable — backfilled by /api/inquire on new contact form submissions)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS utm_source   text,
  ADD COLUMN IF NOT EXISTS utm_medium   text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content  text,
  ADD COLUMN IF NOT EXISTS utm_term     text,
  ADD COLUMN IF NOT EXISTS referrer     text,
  ADD COLUMN IF NOT EXISTS landing_page text;

-- 3. Add matched_client_id to leads so we can record confirmed matches
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS matched_client_id uuid REFERENCES clients(id) ON DELETE SET NULL;

-- Index for match lookups
CREATE INDEX IF NOT EXISTS idx_leads_matched_client ON leads(matched_client_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_site_customers_email ON site_customers(email);

-- 4. lead_client_matches view
--    Joins leads → site_customers → clients on email OR phone.
--    Returns every (lead, client) pair that shares an identifier,
--    enriched with attribution data from both sides.
CREATE OR REPLACE VIEW lead_client_matches AS
SELECT
  l.id                        AS lead_id,
  l.site_id                   AS lead_site_id,
  l.name                      AS lead_name,
  l.email                     AS lead_email,
  l.phone                     AS lead_phone,
  l.source                    AS lead_source,
  l.status                    AS lead_status,
  l.message                   AS lead_message,
  l.service_interest          AS lead_service_interest,
  l.created_at                AS lead_created_at,
  -- Lead attribution
  l.utm_source                AS lead_utm_source,
  l.utm_medium                AS lead_utm_medium,
  l.utm_campaign              AS lead_utm_campaign,
  l.referrer                  AS lead_referrer,
  l.landing_page              AS lead_landing_page,
  -- Matched client
  c.id                        AS client_id,
  c.name                      AS client_name,
  c.email                     AS client_email,
  c.subscription_plan         AS client_plan,
  c.subscription_status       AS client_status,
  c.created_at                AS client_created_at,
  -- Site customer record (booking attribution)
  sc.id                       AS site_customer_id,
  sc.site_id                  AS customer_site_id,
  sc.utm_source               AS customer_utm_source,
  sc.utm_medium               AS customer_utm_medium,
  sc.utm_campaign             AS customer_utm_campaign,
  sc.referrer                 AS customer_referrer,
  sc.landing_page             AS customer_landing_page,
  sc.booking_count            AS customer_booking_count,
  sc.total_spend              AS customer_total_spend,
  sc.last_booking_at          AS customer_last_booking_at,
  -- Match signal: how the match was found
  CASE
    WHEN lower(trim(l.email)) = lower(trim(c.email)) THEN 'email'
    WHEN l.phone IS NOT NULL AND c.phone IS NOT NULL
         AND regexp_replace(l.phone, '\D', '', 'g') = regexp_replace(c.phone, '\D', '', 'g')
         AND length(regexp_replace(l.phone, '\D', '', 'g')) >= 7
         THEN 'phone'
    ELSE 'unknown'
  END                         AS match_signal,
  -- Attribution agreement: did the lead and booking come from the same source?
  CASE
    WHEN l.utm_source IS NOT NULL
         AND sc.utm_source IS NOT NULL
         AND lower(l.utm_source) = lower(sc.utm_source)
         THEN true
    ELSE false
  END                         AS attribution_agrees

FROM leads l
-- Match via email first
JOIN clients c ON lower(trim(l.email)) = lower(trim(c.email))
LEFT JOIN site_customers sc ON sc.email = l.email

UNION

-- Match via phone (strip non-digits, require 7+ digit match)
SELECT
  l.id,
  l.site_id,
  l.name,
  l.email,
  l.phone,
  l.source,
  l.status,
  l.message,
  l.service_interest,
  l.created_at,
  l.utm_source,
  l.utm_medium,
  l.utm_campaign,
  l.referrer,
  l.landing_page,
  c.id,
  c.name,
  c.email,
  c.subscription_plan,
  c.subscription_status,
  c.created_at,
  sc.id,
  sc.site_id,
  sc.utm_source,
  sc.utm_medium,
  sc.utm_campaign,
  sc.referrer,
  sc.landing_page,
  sc.booking_count,
  sc.total_spend,
  sc.last_booking_at,
  'phone' AS match_signal,
  CASE
    WHEN l.utm_source IS NOT NULL
         AND sc.utm_source IS NOT NULL
         AND lower(l.utm_source) = lower(sc.utm_source)
         THEN true
    ELSE false
  END

FROM leads l
JOIN clients c
  ON l.phone IS NOT NULL
  AND c.phone IS NOT NULL
  AND regexp_replace(l.phone, '\D', '', 'g') = regexp_replace(c.phone, '\D', '', 'g')
  AND length(regexp_replace(l.phone, '\D', '', 'g')) >= 7
  -- Exclude rows already matched by email to avoid duplicates
  AND lower(trim(l.email)) != lower(trim(c.email))
LEFT JOIN site_customers sc ON sc.email = c.email;

-- 5. RLS: lead_client_matches is a view — inherits from underlying tables.
--    No direct RLS needed; access controlled via service role in the API.
