-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 012 — Account language preference
--
-- Adds `profiles.language` so a user's chosen UI language follows their
-- account across devices. Until this column exists the client falls back to
-- the on-device sticky choice (localStorage `sanctuary.lang`) + auth
-- user_metadata, which are device-local — so a fresh device wouldn't inherit
-- the preference.
--
-- WHY NULLABLE, NO CHECK CONSTRAINT
-- ─────────────────────────────────
--   • NULL means "no account-level choice yet" — the client then uses its
--     own detection/sticky precedence (see src/i18n/detect.js). We must NOT
--     default to 'en', or every existing account would look like it had
--     explicitly chosen English.
--   • Deliberately no `CHECK (language IN (...))`. Pinning the allowed set in
--     the DB means every new supported language needs a migration, and a
--     stale constraint silently rejects writes — that was the exact shape of
--     the "switching to Hindi reverts" bug (a rejected write left the row on
--     the old value, which the client then re-applied). The client already
--     validates against SUPPORTED_LANGUAGES before writing; the DB just
--     stores whatever the client persists.
--
-- The client writes this in ProfilePage.handleChangeLanguage (alongside the
-- localStorage sticky + auth metadata mirror). It reads it in
-- AuthContext.fetchProfile → syncLanguageFromProfile, which now yields to an
-- explicit on-device choice so this value only leads on a fresh device.
-- ═══════════════════════════════════════════════════════════════════════════

alter table profiles
  add column if not exists language text;

-- No index — read alongside the rest of the profile, never queried alone.

comment on column profiles.language is
  'Preferred UI language (BCP-47 short code, e.g. en/de/hi). NULL = no account-level choice yet (client falls back to on-device detection). No CHECK constraint on purpose: the client validates against SUPPORTED_LANGUAGES, and a DB constraint would reject newly-added languages until migrated.';
