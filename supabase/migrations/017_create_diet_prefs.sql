-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 017 — Diet preferences (allergens + dietary patterns)
--
-- Backs the hard safety filter in src/lib/dietSafety.js. Same JSONB-on-profiles
-- shape as notification_prefs (010), for the same reasons: it grows without a
-- schema change, and it arrives in the single profile fetch the client already
-- makes.
--
-- SHAPE
-- ─────
--   {
--     "allergens": ["dairy", "nuts"],          -- ALLERGENS keys, lib/dietSafety.js
--     "patterns":  ["vegetarian", "jain"],     -- DIET_PATTERNS keys
--     "updated_at": "2026-07-21T10:00:00Z"
--   }
--
-- An absent or empty key means "not told us", NOT "no restrictions" — the
-- client must never present an empty profile as a cleared one.
--
-- ⚠ WHY THIS IS NOT AN ENTITLEMENT COLUMN
-- ───────────────────────────────────────
-- Deliberately client-writable, unlike is_premium et al (see migration 014).
-- The threat models are opposite. Granting yourself premium steals revenue, so
-- the client is untrusted there. Declaring your own allergy only ever restricts
-- what the app shows YOU, and the user is the only authority on it — so the
-- write path must be as frictionless as possible. A user who cannot record a
-- peanut allergy because a server round-trip failed is the bad outcome here.
--
-- ⚠ SPECIAL CATEGORY DATA (GDPR Art. 9)
-- ─────────────────────────────────────
-- Allergies and dietary restrictions are health data, more squarely than
-- anything the app stored before. Two consequences, both enforced client-side
-- (see lib/healthConsent.js, bumped to CONSENT_VERSION 2 for this):
--   1. Nothing is written here without explicit health-data consent whose text
--      actually MENTIONS dietary restrictions. Version 1 said "dosha results
--      and wellness inputs (mood, energy, sleep)" — which does not cover an
--      allergy, so storing one under it would be processing outside consent.
--   2. These values must NEVER reach analytics. Events carry COUNTS only
--      (allergen_count, pattern_count) — never the keys. See
--      docs/analytics-events.md §5.14.
-- ═══════════════════════════════════════════════════════════════════════════

alter table profiles
  add column if not exists diet_prefs jsonb not null default '{}'::jsonb;

-- No index: read with the rest of the profile, never queried in isolation, and
-- never used to segment users — which we could not do anyway, see above.

comment on column profiles.diet_prefs is
  'Allergens + dietary patterns for the diet feature''s hard safety filter. Shape: {allergens: string[], patterns: string[], updated_at: timestamptz}. SPECIAL CATEGORY (GDPR Art. 9) — requires health-data consent v2+, and must never be sent to analytics in any form other than counts.';

-- ── RLS sanity ─────────────────────────────────────────────────────────────
-- profiles already has owner-only select/update policies from earlier
-- migrations, and 014's trigger guards only the entitlement columns, so an
-- ordinary client update touching diet_prefs passes. Verify with:
--
--   -- as an authenticated user, in the app (NOT the SQL editor, which runs
--   -- privileged and has no JWT — that gave a false pass twice before):
--   await supabase.from('profiles')
--     .update({ diet_prefs: { allergens: ['nuts'], patterns: [] } })
--     .eq('id', user.id)
--   -- expect: no error, and a follow-up select returns the value.
