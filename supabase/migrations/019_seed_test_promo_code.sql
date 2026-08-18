-- ─────────────────────────────────────────────────────────────────────────────
--  019_seed_test_promo_code.sql — a second internal test code
--
--  SANCTUARY-TEAM is one-per-user (promo_redemptions is unique per user+code),
--  so once the founder account has redeemed it there is no fresh grant left for
--  testing the upgrade flow. This adds a second permanent full_grant code for
--  the same internal purpose.
--
--  ⚠ PUBLIC REPO. This migration is world-readable, so the code below is
--  effectively public (as SANCTUARY-TEAM already is in 007). It's capped low so
--  a leaked code can't hand out many grants; it is NOT a code to publish in
--  marketing. Mint campaign codes directly in the dashboard, not here.
-- ─────────────────────────────────────────────────────────────────────────────

insert into promo_codes (code, kind, duration_days, max_redemptions, notes)
values ('SANCTUARY-TEAM-1', 'full_grant', null, 5, 'Founder testing — second internal code')
on conflict (code) do nothing;
