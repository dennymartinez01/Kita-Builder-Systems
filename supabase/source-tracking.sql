-- ─────────────────────────────────────────────────────────────
-- Source Tracking — Phase 20
-- Adds structured source fields to the clients table.
-- Run once in Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────

-- source_channel: how the client originally found KITA
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS source_channel text
    CHECK (source_channel IN ('organic','referral','outreach','audit','campaign','direct','other')),
  ADD COLUMN IF NOT EXISTS source_detail text;  -- e.g. campaign name, referrer name, audit URL

-- Backfill existing `source` column values into source_channel where possible
UPDATE clients
SET source_channel = CASE
  WHEN source = 'booking'   THEN 'organic'
  WHEN source = 'referral'  THEN 'referral'
  WHEN source = 'outreach'  THEN 'outreach'
  WHEN source = 'audit'     THEN 'audit'
  WHEN source = 'direct'    THEN 'direct'
  ELSE 'other'
END
WHERE source_channel IS NULL AND source IS NOT NULL;
