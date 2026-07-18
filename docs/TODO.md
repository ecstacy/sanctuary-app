# The Sanctuary — open to-dos

> Last updated: 2026-07-23. This is the durable copy of the working task list —
> readable any time, no session needed. Keep it current when things land.
>
> **A** = needs Akash (accounts, devices, decisions) · **C** = Claude can do it
> Companion docs: [growth-plan.md](./growth-plan.md) ·
> [security-audit.md](./security-audit.md) · [analytics-events.md](./analytics-events.md)

---

## 🔴 Launch-critical

| # | Task | Who | Notes |
|---|------|-----|-------|
| 11 | **Play ORG account: D-U-N-S → registration → pay $25** | A | ✅ **Tester gate REMOVED.** Account was converted personal→organization, and the 12-tester/14-day closed-test rule applies to **personal accounts only** — org accounts are exempt (verified vs Google docs 2026-07-16). Now a **waiting chain, not a wall**: (1) German business registration completes (in motion); (2) request **D-U-N-S** number — free, dnb.com Germany, ~30 days, needs the registered business to exist, don't pay a reseller; (3) finish Play org account + one-time **$25** fee. The "charges" you hit = that $25 (non-recurring, unlike Apple's $99/yr). Nothing else blocks on this — website/security/app build proceed in parallel. See #25 for the account/entity structure. |
| 12 | **Signed release AAB + data safety + content rating** | A+C | ⚠️ Also **unblocks #31** (App Links needs the signing SHA-256) and **confirm the AAB is NOT debuggable** — Capacitor's WebView-debugging and logging protections both key off that, and silently vanish if it is. Repo only builds a **debug APK** today. Needs Play App Signing + release keystore (A), versionCode/Name discipline, data-safety form (declare PostHog/Supabase/Crashlytics — consent-gating is a good story), content rating (health & fitness), privacy-policy URL → website `/privacy` (needs #13). Gradle wiring is C. growth-plan §3.1 |
| 13 | **Deploy website → Cloudflare Pages + DNS** | A | `website/` is on main, zero build step. Pages → connect repo → preset **None**, empty build command, output dir `website` → add `www.thesanctuaryteam.com` + apex redirect. **Unblocks #12** (Play requires a public privacy-policy URL). Steps + flip-to-live checklist in `website/README.md` |
| 14 | **`support@thesanctuaryteam.com` forwarding** | A | All four website pages reference it; Play *and* App Store require a working support contact. Cloudflare Email Routing is free, ~5 min once DNS is on Cloudflare |
| 20 | **Hindi human review (text + TTS)** | A | Standing gate. All Hindi is a machine first-pass: UI strings, content overlays, and especially **Azure TTS pronunciation of Sanskrit asana names**. Blocks any Hindi-market content push (growth-plan §1.6 exp. 12) |
| 25 | **Business entity + account structure (parent + brands)** | A | **Decide with a Steuerberater — the one worth-paying-for consult.** Core principle: **one legal entity + one set of accounts operating MANY brands** — NOT separate accounts/companies per app. "Parent with Sanctuary as sub-part" ≠ a holding structure; in Germany that's likely just **one entity (Einzelunternehmen or UG/GmbH) with multiple app brands** (a true holding = UG/GmbH + notary, only for liability isolation/investors). Steps: (a) Steuerberater settles Einzelunternehmen vs UG/GmbH; (b) **keep** the org Google account (do NOT revert org→personal — org is correct + gave the tester exemption); (c) when parent name/domain is chosen, **add it to the same Google Workspace** (Workspace supports multiple domains + changing primary domain — no new account, no reversal); thesanctuaryteam.com stays as an app alias; (d) **one Cloudflare account, all domains as zones** — never one-per-domain; move it under the Workspace identity; (e) Play/Apple/Stripe all owned by that one identity. **Gewerbeanmeldung domain field**: not legally binding, amendable via a cheap Ummeldung (~€20–30) — let the Steuerberater fold any fix in; confirm with the local Gewerbeamt. NOTE: this is admin/legal, not code — Claude can't act on these accounts. |

## 🔒 Security

Full findings + prioritised plan: [security-audit.md](./security-audit.md).
Landed: self-grant fix (014, **verified in prod**), promo brute-force (013),
CVEs → 0 vulns, `allowBackup=false`, LICENSE, PII regression test (PR #16);
reflected-XSS fix in the password-reset bridge + network timeouts (PR #20,
**deployed & verified against prod**); detection signals (015) + inexact alarms
(PR #21). Monitoring runbook: [security-monitoring.md](./security-monitoring.md).

| # | Task | Who | Notes |
|---|------|-----|-------|
| 24 | **Confirm founder account isn't left `is_premium=true`** | A | A test during the 014 verification ran as `postgres` and may have stuck (its `rollback` had nothing to roll back if the editor split statements). Check `select id, is_premium, premium_source from profiles where is_premium = true;` → if the founder account appears with a null `premium_source`, reset it. Low stakes, but it would skew the Plus funnel in Dashboard D |
| 22 | **Public-vs-private repo decision** | A | Repo is **PUBLIC**. Legitimate for this stack — committed keys (Supabase anon, PostHog ingest, `google-services.json`) are client-public *by design*, and no real secret was ever committed. But every migration, RLS policy and Edge Function is readable, so RLS must be perfect — cf. the self-grant bug that *was* there. Private is the safer default pre-launch. audit §2 |
| 23a | ~~Network timeouts~~ | ✅ | **DONE** — `lib/fetchWithTimeout.js` wired into the Supabase client's `global.fetch`, so every query/auth/RPC/edge call has a 15s deadline. Voice manifest bounded at 8s with TTS fallback. |
| 23b | ~~Edge-function auth audit~~ | ✅ | **DONE — and it found a live reflected XSS** in `reset-password-redirect` (raw query params in a JS string *and* an href). Fixed with validation + per-context encoding + CSP, **deployed and verified against production**. Also corrected config drift (`verify_jwt` said true; prod served 200 unauthenticated — left as-is it would have broken every password reset). `posthog-delete-person` was already safe: it derives its target from the caller's own token. |
| 23c | **Stripe allowed-countries, server-side** | A | ⏸ **BLOCKED — no Stripe account exists yet.** Do this as part of *creating* the account, not after. `region.js` only hides paid plans in gated regions (India/OIDAR); it's the friendly front door. The actual lock is allowed-countries on the Payment Link/Checkout so a crafted request can't complete a sale we're not registered for. Until an account exists, Plus can't be purchased at all — so there's no live exposure. audit §7 |
| 23d | ~~Secret scanning / push protection~~ | ✅ | **DONE** — enabled in GitHub Settings → Code security. Worth one sanity check: push a fake key to a throwaway branch and confirm it's blocked. An untested control isn't a control. |
| 23e | ~~Drop `SCHEDULE_EXACT_ALARM`~~ (⏳ on-device check pending) | ✅ | **DONE** — permission removed (verified absent from the *merged* manifest) and alarms are now inexact. Still unconfirmed on hardware that reminders fire; APK is built. | **Recommendation changed after checking the code.** targetSdk is **36**, so this permission is *denied by default* on Android 14+ and the user must manually enable "Alarms & reminders" — a silent-failure path for reminders. A yoga reminder does **not** need second-precision (07:00 firing at 07:05 is fine). Switching `allowWhileIdle: true` → inexact removes the permission, the Play declaration burden, **and** the permission-dependency failure mode. `USE_EXACT_ALARM` is the wrong swap — it's reserved for alarm-clock/calendar apps and invites rejection. |
| 31 | 🔴 **App Links: reset token interceptable via custom scheme** | A+C | The deep link uses a **custom scheme with no host/autoVerify**, and any Android app can register the same scheme. OAuth is safe (**PKCE** — an interceptor lacks the code_verifier), but **password reset is not**: intercepting `token_hash` lets an attacker call `verifyOtp` with the *public* anon key and get a session → **account takeover**. Fix = **Android App Links** (https intent-filter + `autoVerify` + `/.well-known/assetlinks.json`). ⚠️ **Sequence matters — doing it early is worse:** assetlinks needs the release signing SHA-256 (from Play Console, so after **#12**), then deploy the file (**#13**), *then* add the https filter, then repoint the Supabase reset-email redirect. Verify with `adb shell pm get-app-links com.sanctuary.app`. audit §21 |
| 30 | 🔴 **Auth hardening: 6-char passwords + no email confirmation** | A | **CONFIRMED BY TEST:** server accepts `abcdef` — the client's 8-char rule is cosmetic (direct API call bypasses it). Real policy is Supabase's default **6, no character classes**, so `123456` is a valid password. Plus `mailer_autoconfirm: true` (any email, no ownership proof), which also **undercuts the promo rate-limit (013)** — that's keyed on `user_id`, and free unlimited accounts make the per-user budget a speed bump, leaving code *entropy* to do the real work. **FIX (free tier): Authentication → Sign In / Providers → Email** → raise min length to 8+, enable required character classes; decide on Confirm email. ⚠️ NOT under "Auth → Policies" (that's RLS) — my earlier direction was wrong. **Leaked-password protection needs the Pro plan**, which is why it's not visible on Free — a plan limit, not a misconfiguration. After raising the minimum, check SignupPage surfaces the server error text. **Also delete test account `pwtest-657000@sanctuary-pwtest.invalid`** (Authentication → Users). audit §19–20 |
| 29 | ~~`avatars` bucket publicly listable~~ (⏳ verify upload on-device) | ✅ | **FIXED — migration 016, applied & verified.** Anon listing now returns `[]` (was user UUIDs); public avatar URL still 200. Also hardened the INSERT `WITH CHECK` (unscoped would have let any authenticated user overwrite another's avatar) and added a matching UPDATE `WITH CHECK`. Remaining: confirm Profile → change photo still uploads on-device. audit §16 |
| 28 | **Security monitoring — one alert still dead** | A | ✅ 014 guard **re-verified after 015** (blocked with 42501). Signals shipped (015): entitlement-write attempts log `SECURITY_SIGNAL` to Postgres logs; `security_promo_abuse` / `security_promo_codes_probed` views over promo attempts. Alerts **verified armed via API**: A2 login-failure ✓, X5 error-spike ✓ — but **`Completion WoW drop` is enabled yet has EMPTY bounds, so it can never fire**, and it's a *relative* change wrongly configured as absolute. Decide: disable until launch (recommended — no meaningful threshold at ~1 user) or rebuild as percent-change later. Runbook: [security-monitoring.md](./security-monitoring.md) |

## 🚀 Growth / build

| # | Task | Who | Notes |
|---|------|-----|-------|
| 17 | ~~Website M2: `/quiz` funnel~~ | ✅ | **DONE & merged.** Mirrors the app's real instrument (same 5 dimensions/weights, taglines verbatim) so web and app can't contradict each other. Also fixed two attribution bugs that would have silently killed install tracking on the best-converting path. |
| 18 | ~~Website M3–M4: `/poses` SEO library~~ | ✅ | **DONE & merged.** 76 pages generated by `scripts/build-pose-pages.mjs` (`npm run poses:pages`) — a generator, NOT Astro, to keep the site zero-build. Verification caught an inverted dosha sign that would have reversed the advice on every page; now fixed at the source via `lib/doshaSemantics.js`. |
| 19 | **Verify `install_attributed` end-to-end** | A+C | ⚠️ **Never proven.** The spine is merged and compiles and the no-referrer path is graceful — but **adb sideloads return no referrer by design**, so attribution has never actually been observed working. Needs an internal-testing track (#11/#12). Test: visit `?utm_source=test&utm_campaign=x` → Play badge → install from Play → confirm `install_attributed` + `acquisition_source`/`acquisition_campaign` land in PostHog |

## 📱 iOS (decided: free-tier first)

Purchase gate is **done** (PR #16): Apple 3.1.1 requires IAP, Plus sells via
Stripe → no purchase path and no external link on iOS. Entitlement untouched,
so Plus bought on Android/web still works.

| # | Task | Who | Notes |
|---|------|-----|-------|
| 15 | **Install Xcode → `cap add ios` + plugin audit** | A→C | **Blocked on Xcode** (~10GB; only Command Line Tools present, `xcodebuild` unavailable). Then: `npx cap add ios`, audit plugins. Known Android-only local plugins: `InstallReferrerPlugin` (already platform-guarded, no-ops correctly) and `ExternalBrowserPlugin` (**unverified on iOS** — registered with a web fallback, native behaviour unchecked) |
| 16 | **Apple Developer Program $99/yr** | A | The only hard cost in the whole plan. Needed for TestFlight/App Store, *not* for `cap add ios` or local builds. Decide by M2 if the M3–M4 window is real. growth-plan §3.2 |

## 🧹 Housekeeping

| # | Task | Who | Notes |
|---|------|-----|-------|
| 9 | **Merge PR #16** | A | Security batch (audit + P0/P1 fixes) **+ the iOS free-tier gate**, which is logically separate — say the word and I'll split it out. ⚠️ Migration 014 is **already applied and verified in prod**; merging is just the code catching up |
| 10 | **Install latest build on Pixel + verify** | A+C | APK builds from main; the Pixel keeps dropping off USB/wireless adb. Three changes merged in PR #13 have **never been eyeballed on-device**: pre-practice plan list, recommendation poses → asana detail, Ayurvedic tip contrast on the Pitta theme |

---

## Known unverified (be honest about these)

- **Install attribution** (#19) — merged, compiles, never observed working.
- **iOS gate** — verified by unit test only; no iOS device/build exists yet.
- **PR #13 UX changes** (#10) — merged without on-device confirmation.
- **`ExternalBrowserPlugin` on iOS** — unknown until the platform is added.
