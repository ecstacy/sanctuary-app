-- ─────────────────────────────────────────────────────────────────────────
--  016 — Stop the avatars bucket leaking user IDs
--
--  THE FINDING
--  ───────────
--  Anyone holding the PUBLIC anon key could list the `avatars` bucket:
--
--      POST /storage/v1/object/list/avatars  {"prefix":"","limit":100}
--
--  and the folder names are raw user UUIDs, because the upload path is
--  `${user.id}/avatar.ext`. That makes every user's id — and the live user
--  count — publicly enumerable at launch. It is information disclosure, not
--  a breach (RLS still demands a valid JWT for anything useful), but ids are
--  a target list for any future bug that takes a user_id.
--
--  Cause: this policy, created in the Supabase dashboard and therefore
--  invisible to this repo until it was probed from outside —
--
--      "Avatars are publicly accessible"  SELECT  to public
--      USING (bucket_id = 'avatars')
--
--  ...grants SELECT on every row of storage.objects in the bucket, and SELECT
--  on storage.objects is exactly what LIST reads.
--
--  WHY DROPPING IT IS SAFE (verified, not assumed)
--  ───────────────────────────────────────────────
--  The bucket is genuinely public, so objects are served by
--  `/storage/v1/object/public/avatars/...` which bypasses RLS entirely.
--  Confirmed by fetching an avatar with NO apikey header at all → HTTP 200.
--  So `getPublicUrl()` in ProfilePage keeps working; only *listing* stops.
--
--  Replacement keeps a scoped SELECT for authenticated users over their OWN
--  folder, so a signed-in user can still list/manage their own avatar.
-- ─────────────────────────────────────────────────────────────────────────

-- ── 1. Remove the blanket public SELECT (the enumeration vector) ──────────
drop policy if exists "Avatars are publicly accessible" on storage.objects;

-- Owner-scoped SELECT: a user may list their own folder, nobody else's.
-- Public *display* does not depend on this (public bucket, see above).
drop policy if exists "avatars_select_own" on storage.objects;
create policy "avatars_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ── 2. Harden the upload policy ──────────────────────────────────────────
-- The existing "Users can upload own avatar" (INSERT, authenticated) reported
-- qual = NULL. For INSERT the clause that matters is WITH CHECK, which wasn't
-- inspected — so it may or may not have been scoped. If it wasn't, any
-- authenticated user could write into ANOTHER user's folder and replace their
-- avatar. Recreated with an explicit owner check so the outcome is correct
-- either way; for a correctly-scoped original this is a no-op in effect.
drop policy if exists "Users can upload own avatar" on storage.objects;
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 3. Update policy — the app uses upsert:true, so UPDATE runs too ───────
-- The original was already scoped on USING; recreated here with a matching
-- WITH CHECK so a user cannot *move* their object into someone else's folder
-- (USING alone controls which rows they may touch, not what they may write).
drop policy if exists "Users can update own avatar" on storage.objects;
drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ── Verification ─────────────────────────────────────────────────────────
--  MUST now fail (anon listing — the whole point):
--    curl -X POST "$URL/storage/v1/object/list/avatars" \
--      -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
--      -H "Content-Type: application/json" -d '{"prefix":"","limit":100}'
--    → expect [] or an error, NOT a list of user-id folders.
--
--  MUST still work (display — public bucket bypasses RLS):
--    curl -I "$URL/storage/v1/object/public/avatars/<uid>/avatar.jpg"  → 200
--
--  MUST still work in-app: Profile → change photo (upload + display).
--  ⚠ Verify that on-device before considering this done — these policies are
--  the only thing standing between the feature working and silently failing.
