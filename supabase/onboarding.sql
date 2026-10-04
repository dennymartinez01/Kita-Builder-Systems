-- ─────────────────────────────────────────────────────────────
-- Client Onboarding — Phase 17
-- Tracks per-client checklist step completion.
-- Run once in Supabase SQL Editor.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS client_onboarding_steps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  step_key     text NOT NULL,          -- e.g. 'add_logo', 'publish_site'
  completed    boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),

  UNIQUE (client_id, step_key)         -- one row per client per step
);

-- Index for fast per-client lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_client ON client_onboarding_steps(client_id);

-- RLS: service role only (admin API manages all onboarding ops)
ALTER TABLE client_onboarding_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_onboarding" ON client_onboarding_steps;
CREATE POLICY "service_role_all_onboarding"
  ON client_onboarding_steps
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
