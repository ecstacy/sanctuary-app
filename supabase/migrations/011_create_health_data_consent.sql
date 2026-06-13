-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 011 — Health-data consent (GDPR Art. 9)
--
-- Dosha results, mood/energy/stress check-ins, sleep self-reports, and
-- vikriti tracking are SPECIAL CATEGORY DATA under GDPR Article 9. Processing
-- them requires an explicit lawful basis — for a consumer wellness app, that
-- is explicit consent under Art. 9(2)(a).
--
-- This column is the durable, server-side RECORD that consent was given:
-- what was consented to (version), and when. GDPR requires a controller to
-- be able to *demonstrate* consent — a localStorage flag alone isn't enough
-- once a user has an account, so we mirror the decision here.
--
-- SHAPE
-- ─────
--   {
--     "granted":  true,
--     "version":  1,            -- bump when the consent text materially
--                                  changes (new data types / processors) →
--                                  the client re-prompts
--     "at":       "2026-05-22T...Z"
--   }
--
-- Absence (default '{}') = not yet asked. The client gates the dosha quiz
-- (the first health-data collection point) on this being granted.
-- ═══════════════════════════════════════════════════════════════════════════

alter table profiles
  add column if not exists health_data_consent jsonb not null default '{}'::jsonb;

comment on column profiles.health_data_consent is
  'GDPR Art. 9 explicit-consent record for processing health-adjacent data (dosha, check-ins, vikriti). Shape: {granted, version, at}. Empty = not yet asked. Version bump re-prompts the user.';
