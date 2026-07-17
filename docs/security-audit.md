# Security Audit & Remediation Plan — The Sanctuary

> Date: 2026-07-16. Scope: full-repo runthrough ahead of soft-launch —
> data privacy, secret/Git exposure, credentials, PII, Supabase RLS, the
> Stripe webhook, Android hardening, API abuse / rate limits / timeouts,
> dependencies, licences, certificates.
> Reviewer: Claude (static review). **Not a penetration test** — findings are
> from reading code, migrations, and config, not from attacking a running
> system. Treat the P0/P1 items as must-fix before public launch.

## TL;DR

The architecture is fundamentally sound: **own-row RLS on every user table,
a signature-verified Stripe webhook, a PII scrubber on analytics, a
`SECURITY DEFINER` promo RPC that's auth-gated and dupe-checked, and a
deep-link handler that only routes to fixed internal paths.** No private keys,
`.env` files, or service-role keys were ever committed (the 6 "secret-pattern"
hits in history are all documentation strings like `sk_live_...` in comments,
not real values).

The real gaps are: **a public repo shipping a client that's fine to be public
but should be a deliberate choice, no promo-code rate limiting, `allowBackup`
left on, dependency CVEs (4 high), and no LICENSE.** None are catastrophic;
all are cheap to fix now and expensive to fix after launch.

Severity key: **P0** = fix before public launch · **P1** = fix in the launch
window · **P2** = hygiene / follow-up.

---

## Findings

### P0 — before public launch

**1. Promo-code redemption has no rate limiting → brute-force risk.**
`redeem_promo_code()` (migration 007) is solid on correctness but a signed-in
user can call it unlimited times. Short/guessable codes (e.g. `LAUNCH50`) can
be enumerated for free Plus grants. It's `SECURITY DEFINER`, so RLS won't save
you.
→ *Fix:* add an attempt-rate guard inside the RPC — a `promo_attempts` table
keyed by `user_id` with a rolling window (e.g. reject >10 failed attempts /
hour), or a per-user cooldown. Pair with **high-entropy codes** (≥10 random
chars, not human-guessable) and keep `max_redemptions` set on every code.

**2. Confirm the public-repo decision, and rotate anything that assumes
privacy.** The repo is **public**. That's *legitimate* for this stack — the
committed values (`VITE_SUPABASE_ANON_KEY` = publishable anon key,
`VITE_POSTHOG_KEY` = write-only ingest key, `google-services.json` = designed
to ship in the APK) are all client-public by design and safe to expose. **But**
it means every migration, RLS policy, and Edge Function logic is readable by
attackers — RLS *must* therefore be perfect (see P1-3), and it means the
PostHog **personal** key and any Stripe/Supabase service keys must *never*
touch a committed file. → *Action:* (a) make an explicit go/no-go on
public-vs-private; if unsure, **private is the safer default pre-launch**.
(b) Confirm `.env.local` (holds the PostHog personal key `phx_…`) is gitignored
— it is. (c) Add secret-scanning (below) so a future slip is caught.

**3. Dependency CVEs — 4 high, 11 moderate.** Notably **react-router
7.0.0–7.15.0**: open redirect via `//` protocol-relative paths, plus XSS in
redirect handling. Also `protobufjs` (DoS) and `ws` (DoS) transitively.
→ *Fix:* `npm audit fix`, then bump react-router to a patched 7.x and
re-run the suite. The router CVEs matter because this app *does* handle
redirect-ish deep links.

### P1 — launch window

**4. Android `allowBackup="true"`** (manifest) lets `adb backup` / cloud
backup pull the app's private storage — which includes the Supabase session
(access + refresh tokens in localStorage/WebView storage) and the PKCE
verifier. On a non-rooted device an attacker with USB access could lift a
logged-in session. → *Fix:* set `android:allowBackup="false"` and
`android:fullBackupContent="false"` (a wellness app has nothing that benefits
from backup, and the tokens are the crown jewels).

**5. 🔴 SELF-GRANT PREMIUM — CONFIRMED VULNERABLE (2026-07-16), FIX WRITTEN
(migration 014, pending deploy).** The live policy was checked and is:
`"Users can update own profile" UPDATE USING (auth.uid() = id) WITH CHECK NULL`
— with no column restriction and no trigger. Any signed-in user could grant
themselves free lifetime Plus with the public anon key. **Migration 014 adds a
`BEFORE UPDATE` trigger that blocks entitlement-column writes from client
roles; it must be applied to production before launch.** The original text of
this finding follows for the record.
`is_premium`, `premium_source`, `premium_expires_at` live on the `profiles`
table, which the client writes to constantly (language, notification prefs,
health consent all `update profiles`). The migration 007 comment claims *"RLS
limits clients to non-entitlement columns"* — **but plain Postgres RLS cannot
restrict which columns an UPDATE touches**, and:

- The `profiles` table is **not created in any migration in this repo** (it's
  defined out-of-band in the Supabase dashboard / an untracked migration).
- **No `profiles` UPDATE policy exists anywhere in the repo**, and **no
  `BEFORE UPDATE` trigger guards the premium columns.**

So the only thing standing between a normal signed-in user and
`is_premium=true` is a policy I *cannot see* — and the in-code comment reflects
a belief (RLS scopes columns) that is technically false. If the dashboard
policy is the obvious `USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`,
then **any user can grant themselves lifetime Plus with a single anon-key
`update`**, bypassing Stripe entirely. This is the highest-impact finding in
the audit.
→ *Verify immediately:* as a normal user, attempt
`supabase.from('profiles').update({ is_premium: true }).eq('id', myId)` with the
anon key. If it succeeds → **P0, launch-blocking.**
→ *Fix:* move entitlement columns to a separate table clients have **no**
UPDATE grant on (only `service_role` + the definer RPC write it), **or** add a
`BEFORE UPDATE` trigger on `profiles` that raises unless the premium columns are
unchanged or the caller is `service_role`. Commit whichever fix as a tracked
migration so this is never again invisible to the repo.

**6. No request timeouts on Supabase / fetch calls.** The client awaits
Supabase and Edge Function calls without an `AbortController` deadline; a hung
network leaves spinners forever and can wedge flows (auth, checkout).
→ *Fix:* wrap network calls in a timeout helper (e.g. 10–15s abort) and
surface a retry. Low security impact, real reliability/DoS-resilience impact.

**7. Stripe country restriction — enforce server-side, not just in the UI.**
`region.js` hides paid plans in gated regions, but the comment correctly notes
the *hard* guard must be Stripe-side. → *Action:* confirm the Payment
Links/Checkout have allowed-countries configured so a crafted request can't
complete a purchase we're not registered to sell.

**8. Edge Function auth posture.** `stripe-webhook` correctly runs
`--no-verify-jwt` + signature check (right call). Audit the *other* functions —
`create-customer-portal-session`, `posthog-delete-person`, `oauth-redirect`,
`reset-password-redirect` — to confirm each either requires a valid JWT or has
its own equivalent guard, and that `posthog-delete-person` (a GDPR delete path)
can't be invoked for an arbitrary `distinct_id` by an unauthenticated caller.

### P2 — hygiene & follow-up

**9. No `LICENSE` file and no `"license"` in package.json.** For a
public repo this leaves IP status ambiguous (default = all rights reserved,
but state it). → *Fix:* add an explicit licence (proprietary/all-rights-
reserved is fine for a commercial app; just make it explicit) and a
`"license"` field.

**10. Secret-scanning in CI.** Add `gitleaks` (or GitHub secret scanning +
push protection, free on public repos) so a future accidental key commit is
blocked at push time. The `.env.local`-only gitignore is one typo away from a
leak.

**11. PII minimisation in analytics — verified good, keep it that way.**
`track.js` `scrub()` drops `email|name|phone|address|lat|lng|user_id|token|…`
keys before any event leaves the device, and consent-gates the whole pipeline.
Add a test that asserts a known-PII payload comes out scrubbed, so a future
event author can't regress it.

**12. `SCHEDULE_EXACT_ALARM` permission** may trigger extra Play review
scrutiny (Android 13+). It's justified (reminders), but be ready to explain it
in the Play data-safety / permissions declaration, or switch to
`USE_EXACT_ALARM` (allowed for alarm/reminder apps without the special access
prompt).

**13. Certificates / signing.** No signing config in the repo (debug-only
builds today) — expected. Ties to task #12: Play App Signing + a release
keystore, kept **out** of git (add `*.jks`/`*.keystore` to `.gitignore`
pre-emptively). HTTPS everywhere is fine (no `usesCleartextTraffic`, so
cleartext is disabled by default on API 28+).

---

## Prioritised remediation plan

| # | Item | Sev | Owner | Effort |
|---|------|-----|-------|--------|
| 5 | **Verify `profiles` can't self-grant premium** (raw anon update test) | P1→P0 if exploitable | me to test, Akash for DB policy | S |
| 1 | Promo-code rate limit + high-entropy codes | P0 | me (migration) | M |
| 3 | `npm audit fix` + react-router bump | P0 | me | S |
| 2 | Public/private repo decision + confirm secret hygiene | P0 | Akash | S |
| 4 | `allowBackup=false` | P1 | me | XS |
| 8 | Edge-function auth audit (esp. posthog-delete-person) | P1 | me to review | S |
| 6 | Network timeouts | P1 | me | M |
| 7 | Stripe allowed-countries server-side | P1 | Akash (Stripe dash) | XS |
| 10 | Secret-scanning / push protection | P2 | Akash (repo settings) | XS |
| 9 | LICENSE + package.json license field | P2 | me | XS |
| 11 | PII-scrub regression test | P2 | me | S |
| 12 | Exact-alarm permission declaration | P2 | Akash (Play) | XS |
| 13 | Release keystore out of git (`.gitignore`) | P2 | me | XS |

**Recommended first move:** finding **5** — a 5-minute test (try to `update`
`is_premium` with the anon key as a normal user). If it succeeds, it jumps to
P0-critical and everything else waits. I can run that test as soon as you're ok
with me hitting the live Supabase with a throwaway check, or you can run it.
