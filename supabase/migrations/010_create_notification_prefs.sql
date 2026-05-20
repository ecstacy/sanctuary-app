-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 010 — Notification preferences
--
-- Per-user opt-ins for app notifications, stored as a single JSONB column
-- on profiles. We pick JSONB over separate columns because:
--   1. We'll add notification types as we ship them (streak save, vikriti
--      drift, seasonal). JSONB grows without a schema change per type.
--   2. The client reads the whole blob in a single profile fetch — no
--      extra round-trips per page.
--   3. The shape is small enough that JSONB doesn't pay an indexing cost.
--
-- SHAPE
-- ─────
--   {
--     "practice_reminder": { "enabled": true, "time": "07:00" },
--     // future:
--     // "streak_save":     { "enabled": true },
--     // "vikriti_drift":   { "enabled": true },
--     // "seasonal":        { "enabled": false }
--   }
--
-- A key being absent means the user hasn't been asked yet — we treat as
-- "ask on next relevant moment" rather than implicit on/off. The
-- defaulting + permission flow is handled client-side; the DB just
-- stores whatever the client writes.
-- ═══════════════════════════════════════════════════════════════════════════

alter table profiles
  add column if not exists notification_prefs jsonb not null default '{}'::jsonb;

-- No index needed — this column is read alongside the rest of the profile,
-- never queried in isolation.

-- Comment for future maintainers.
comment on column profiles.notification_prefs is
  'Per-type notification opt-ins. Key per type (practice_reminder, streak_save, vikriti_drift, etc.) each with {enabled, ...type-specific config}. Absence of a key means the user hasn''t been asked yet.';
