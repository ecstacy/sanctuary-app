# The Sanctuary — open to-dos

> Last updated: 2026-07-16. This is the durable copy of the working task list —
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
| 12 | **Signed release AAB + data safety + content rating** | A+C | Repo only builds a **debug APK** today. Needs Play App Signing + release keystore (A), versionCode/Name discipline, data-safety form (declare PostHog/Supabase/Crashlytics — consent-gating is a good story), content rating (health & fitness), privacy-policy URL → website `/privacy` (needs #13). Gradle wiring is C. growth-plan §3.1 |
| 13 | **Deploy website → Cloudflare Pages + DNS** | A | `website/` is on main, zero build step. Pages → connect repo → preset **None**, empty build command, output dir `website` → add `www.thesanctuaryteam.com` + apex redirect. **Unblocks #12** (Play requires a public privacy-policy URL). Steps + flip-to-live checklist in `website/README.md` |
| 14 | **`support@thesanctuaryteam.com` forwarding** | A | All four website pages reference it; Play *and* App Store require a working support contact. Cloudflare Email Routing is free, ~5 min once DNS is on Cloudflare |
| 20 | **Hindi human review (text + TTS)** | A | Standing gate. All Hindi is a machine first-pass: UI strings, content overlays, and especially **Azure TTS pronunciation of Sanskrit asana names**. Blocks any Hindi-market content push (growth-plan §1.6 exp. 12) |
| 25 | **Business entity + account structure (parent + brands)** | A | **Decide with a Steuerberater — the one worth-paying-for consult.** Core principle: **one legal entity + one set of accounts operating MANY brands** — NOT separate accounts/companies per app. "Parent with Sanctuary as sub-part" ≠ a holding structure; in Germany that's likely just **one entity (Einzelunternehmen or UG/GmbH) with multiple app brands** (a true holding = UG/GmbH + notary, only for liability isolation/investors). Steps: (a) Steuerberater settles Einzelunternehmen vs UG/GmbH; (b) **keep** the org Google account (do NOT revert org→personal — org is correct + gave the tester exemption); (c) when parent name/domain is chosen, **add it to the same Google Workspace** (Workspace supports multiple domains + changing primary domain — no new account, no reversal); thesanctuaryteam.com stays as an app alias; (d) **one Cloudflare account, all domains as zones** — never one-per-domain; move it under the Workspace identity; (e) Play/Apple/Stripe all owned by that one identity. **Gewerbeanmeldung domain field**: not legally binding, amendable via a cheap Ummeldung (~€20–30) — let the Steuerberater fold any fix in; confirm with the local Gewerbeamt. NOTE: this is admin/legal, not code — Claude can't act on these accounts. |

## 🔒 Security

Full findings + prioritised plan: [security-audit.md](./security-audit.md).
Landed in PR #16: self-grant fix (014, **verified in prod**), promo brute-force
(013), CVEs → 0 vulns, `allowBackup=false`, LICENSE, PII regression test.

| # | Task | Who | Notes |
|---|------|-----|-------|
| 24 | **Confirm founder account isn't left `is_premium=true`** | A | A test during the 014 verification ran as `postgres` and may have stuck (its `rollback` had nothing to roll back if the editor split statements). Check `select id, is_premium, premium_source from profiles where is_premium = true;` → if the founder account appears with a null `premium_source`, reset it. Low stakes, but it would skew the Plus funnel in Dashboard D |
| 22 | **Public-vs-private repo decision** | A | Repo is **PUBLIC**. Legitimate for this stack — committed keys (Supabase anon, PostHog ingest, `google-services.json`) are client-public *by design*, and no real secret was ever committed. But every migration, RLS policy and Edge Function is readable, so RLS must be perfect — cf. the self-grant bug that *was* there. Private is the safer default pre-launch. audit §2 |
| 23a | **Network timeouts** | C | No `AbortController` deadline on Supabase/fetch calls — a hung network leaves spinners forever and can wedge auth/checkout. Reliability + DoS-resilience |
| 23b | **Edge-function auth audit** | C | Confirm `create-customer-portal-session`, `posthog-delete-person`, `oauth-redirect`, `reset-password-redirect` each require a valid JWT or an equivalent guard. **`posthog-delete-person` is the one to scrutinise** — a GDPR delete path that must not be invokable for an arbitrary `distinct_id`. (`stripe-webhook` is already correct: `--no-verify-jwt` + signature check) |
| 23c | **Stripe allowed-countries, server-side** | A | `region.js` hides paid plans in gated regions (India/OIDAR), but that's the *front door*. Configure allowed countries on the Payment Link/Checkout so a crafted request can't complete a sale we're not registered for. audit §7 |
| 23d | **Secret scanning / push protection** | A | gitleaks in CI, or GitHub secret scanning + push protection (free on public repos). The gitignore is now broad, but it's one typo from a leak |
| 23e | **`SCHEDULE_EXACT_ALARM` declaration** | A | May draw extra Play scrutiny (Android 13+). Justified (reminders) — be ready to explain it, or switch to `USE_EXACT_ALARM` (allowed for alarm/reminder apps, no special-access prompt) |

## 🚀 Growth / build

| # | Task | Who | Notes |
|---|------|-----|-------|
| 17 | **Website M2: `/quiz` mini dosha funnel** | C | **Highest-leverage remaining build.** 3–5 question teaser → result card ("You lean Pitta") → store badge with UTMs intact. Every content CTA points here, not at the cold listing — the quiz-result moment converts far better and keeps analytics on the path. Targets: ≥40% completion, ≥25% quiz→badge CTR. Reuse `src/data/doshaQuiz.js`. growth-plan §2.2 |
| 18 | **Website M3–M4: `/poses` SEO library** | C | The compounding asset: 76 `/poses/[slug]` pages generated from `src/data/asanas.js` — video/still, benefits, precautions, instructions + the **dosha-affinity table** (the moat no generic yoga site has). Schema.org `HowTo`, internal-link poses ↔ problems, submit sitemap. This is where Astro earns its place (site is deliberately zero-build today). The esbuild-bundle trick already solves Node-importing `asanas.js` |
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
