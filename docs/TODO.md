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
| 11 | **Play ORG account: D-U-N-S → registration → pay $25** | A | ✅ **Tester gate REMOVED.** Account was converted personal→organization, and the 12-tester/14-day closed-test rule applies to **personal accounts only** — org accounts are exempt (verified vs Google docs 2026-07-16). Now a **waiting chain, not a wall**: (1) ✅ Gewerbeanmeldung done (2026-06-16, Einzelunternehmen, legal name `Akash Thagela Softwareentwicklung` — see [[legal-entity-identity]]); (2) ✅ **D-U-N-S OBTAINED 2026-08-25** (came the next day — the ~2–4 wk estimate was pessimistic); (3) **NOW ACTIONABLE:** finish Play org account + one-time **$25** fee, and set the **public developer name to the parent brand** (see #26), not the personal name. ⚠️ **Steuernummer NOT needed** for this — a **free app (no IAP) requires no Play payments/tax profile**, so the Finanzamt wait was a false blocker. Launch strategy: ship **free-tier-first** (selling gated off via VITE_SELLING_ENABLED), monetize later when Steuernummer arrives. The "charges" you hit = that $25 (non-recurring, unlike Apple's $99/yr). Nothing else blocks on this — website/security/app build proceed in parallel. See #25 for the account/entity structure. |
| 12 | **Signed release AAB + data safety + content rating** | A | ✅ **Gradle wiring DONE & verified** (signed AAB + APK produced with a throwaway key, `jarsigner` verified, release confirmed **not debuggable**). **Your half:** generate the upload keystore + fill `android/keystore.properties` — full steps in [release-signing.md](./release-signing.md). Then the Play forms: data safety (declare PostHog/Supabase/Crashlytics — consent-gating is a good story), content rating (health & fitness), privacy-policy URL → website `/privacy` (needs #13). ⚠️ Unblocks **#31** (App Links needs the **app signing** SHA-256 from Play Console — *not* the upload key's). ⚠️ Keep the release **non-debuggable**: Capacitor's WebView-debugging and logging protections both key off it. **📌 When D-U-N-S lands (see #11): do this together with the free-tier-first release build** — cut the AAB with `VITE_SELLING_ENABLED` unset (prod defaults selling OFF, free-tier-first; the switch shipped commit 787f253), verify no plan buttons in the prod build, then upload. Monetization flips on later (env=true + rebuild) once the Steuernummer arrives. |
| 13 | **Deploy website → Cloudflare Pages + DNS** | ✅ | **DONE — live for weeks.** `www.thesanctuaryteam.com` serves 200; apex 301-redirects to www (verified 2026-08-24). Unblocks #12 (privacy-policy URL) and #31 (assetlinks host). Deploy/flip-to-live checklist stays in `website/README.md` for future website updates. |
| 14 | **`support@thesanctuaryteam.com` forwarding** | ✅ | **DONE** — mail runs on **Google Workspace** (MX → smtp.google.com, verified 2026-08-24), not Cloudflare Email Routing. `support@` is a working contact for the Play/App Store support-contact fields. |
| 20 | **Hindi human review (text + TTS)** | A | Standing gate. All Hindi is a machine first-pass: UI strings, content overlays, and especially **Azure TTS pronunciation of Sanskrit asana names**. Blocks any Hindi-market content push (growth-plan §1.6 exp. 12) |
| 27 | **Content enrichment backlog** | 🔵 | Map from the 2026-08-26 content audit. **✅ Done:** food pages now surface preparation, traditional pairings (linked), and classical citations (commit bc85e5f); "Best foods for Vata/Pitta/Kapha" dosha hub pages (e37897a); (a) **in-app parity** — IngredientDetailPage already renders the full enrichment (was ahead of the site), plus a personalized **"Calms your &lt;dosha&gt;" food filter** in Discover→Foods (6a14dd7); (b) **vikriti→foods reverse index** — folded into that filter via `resolveDietTarget`, so it reads against the live imbalance not just prakriti (800db14). (c) **viruddha āhāra (food combinations)** — 9 pairings + 2 notes authored & wired (Meal Check + food page + `/food-combinations` guide, all reviewed-gated), **⏳ awaiting founder sign-off** in `docs/diet-review-viruddha-ahara.md` (4c45479); (d) **seasonal guidance (ṛtucharyā)** — 4-season layer derived from season→dosha via reviewed foodSuitability; app "In season" chip + `/foods/seasonal/<season>` generator, **⏳ awaiting sign-off** in `docs/diet-review-rtucharya.md` (autumn/winter dosha decisions) (9784d6c); (e) **guides/blog** — 3 cornerstone guides live at `/guides/` + site-wide nav (0f40538). **Remaining:** more guides over time; author more viruddha pairings if the founder wants breadth. Pose pages already rich (leave). **⚠ Two review docs await the founder** — nothing in (c)/(d) surfaces to users until signed off. |
| 26 | **Parent brand name + public identity** | A | Founder wants to rebrand off the personal legal name "Akash Thagela Softwareentwicklung" toward a **parent brand** hosting many apps. Key fact: the *legal* name is tied to the Einzelunternehmen and only becomes a fantasy *Firma* on incorporation (UG/GmbH or e.K.) — but the **brand is separable NOW**: use it as a **Geschäftsbezeichnung** + the **Play public developer name** (users see the brand; legal entity stays sole-prop until incorporation, then the brand becomes the legal name + GmbH). **Steps:** (a) pick the parent brand (broad, not yoga-specific — shortlist floated 2026-08-25: Stillpoint, Sattva/Sattva Labs, Grove, Cairn, Lumen Labs); (b) **check .com domain + EUIPO trademark (software/health class) + Handelsregister** before committing (Claude can't verify these); (c) set it as the Play developer display name at org-account setup (#11) — it's user-visible and awkward to change later; (d) add the parent domain to the SAME Google Workspace when ready (extend, don't replace — see #25). Incorporation timing/form → Steuerberater (#25). |
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
| 38 | **Exact-match pre-rendered dosha gem** | A+C | The home state card now uses the **proportional WebGL gem** (`DoshaGem`) — accurate for all splits but more muted than the pre-rendered liquid-glass teardrop. The pre-rendered set (`DoshaGemImage` + `lib/doshaOutcome.js` + `public/dosha-gems/*.png`) was **categorical** (10 buckets); single-dominant emblems omitted the 3rd dosha, so a Kapha label pointed at no teal. **The quiz can produce 4,131 exact triples** (per `scoreQuiz`), so one-PNG-per-triple is infeasible — options are: bin to nearest 10% (66 imgs) or 5% (231 imgs), each emblem carrying a proportional 3rd ribbon; then swap `DoshaGemImage` back in with an exact-bin resolver. Enumerator logic captured in this session. Also reconcile `LEGEND_SLOTS` leader-lines to the actual zones. |

## 🎨 Visual consistency pass

Standing principle (see memory `standards`): **every surface uses one visual
language** — tappable entry points are `components/NavRow.jsx` (accent-tinted
squircle icon badge + bold title + one/two-line summary + chevron); info rows
share the same badge without a chevron; body copy is ≥14px. Do these **one
chunk at a time**, each its own commit, **verified in-browser via the dev mock**
(`?devAuth=<dosha>`), then on the Pixel. Landed so far: dosha profile entry rows,
Dietary bridges, Dinacharya legibility.

| # | Chunk | Who | Notes |
|---|-------|-----|-------|
| VC1 | **Dosha profile — Chapter 3 info rows** | C | Season / hours / tastes cards use a `rounded-full` badge + `primaryData.bgColor`; retint to the NavRow squircle badge (color-mix accent) so Ch3 matches the entry rows above. Info rows (no chevron). |
| VC2 | **Home — entry & state cards** | C | ✅ Meal Check entry → NavRow (badge slot added for the trial pill; badge tints to the dosha via theme-mapped `--color-primary`). The state gem card, quiz CTA, vikriti card, and journey stats card are intentionally distinct rich cards and already share the `surface-container-low rounded-2xl border` container language — left as-is. |
| VC3 | **Discover hub tiles** | C | ✅ Browse grid kept (right affordance for a category gallery) but harmonized: squircle badges + ≥14px type on DiscoverPage + DiscoverPractices. DiscoverFoods' three entry rows → shared NavRow. Breathwork uses a different layout — left as-is. Verified in-browser (Kapha). |
| VC4 | **Journey page cards** | C | ✅ It's a stats dashboard (not nav rows), so aligned the card language instead: `rounded-xl`/`rounded-lg` → `rounded-2xl` (outer) + `rounded-xl` (inner), matching the Home journey card + the rest of the app. Verified in-browser (renders with zeros for a fresh user). |
| VC5 | **Recommendations page cards** | C | ✅ Result/practice/also-related cards → `rounded-2xl`; the two circular icon badges → squircle (w-11 rounded-2xl). Verified in-browser via a real "back pain" search (Vata). |
| VC6 | **Meal Check result cards** | C | ✅ Most cards were already rounded-2xl. RemedyCard emoji badge → squircle (w-11 rounded-2xl, color-mix accent); history swipe rows rounded-xl → rounded-2xl. Verified in-browser via a real "fried chicken and coffee" check (Pitta). |
| VC7 | **Profile / Settings list rows** | C | ✅ The grouped iOS-style settings lists are the right pattern (kept the rows), but their containers used `rounded-lg`; bumped the 6 settings groups + dosha card + sign-out button to `rounded-2xl`, matching the app card language. Verified in-browser (Kapha, free). |
| VC8 | **Extract a shared InfoRow/Card + audit** | C | ✅ Added `components/InfoRow.jsx` (non-tappable NavRow sibling — squircle badge + title + body, no chevron); the dosha Ch3 season/hours/tastes rows use it (deduped 3 blocks). Swept every remaining `rounded-lg p-5/p-6` card → `rounded-2xl` across dosha surfaces + Welcome/Preview/VikritiQuiz (0 left). **VC pass complete.** Shared primitives: `NavRow` (tappable), `InfoRow` (info), squircle accent badges, ≥14px body — reach for these on every new surface. |

## 🍽️ Meal Check UX/UI audit (2026-08-21)

Walked the whole flow in-browser via the dev mock (`/meal-check?devAuth=pitta`,
mobile 375×812) with a deliberately messy input ("tomato, smoothie, zorblax and
rice"). Findings below, worst-first. Same rules as the VC pass: **one chunk per
commit, verified in-browser, then the Pixel.**

| # | Chunk | Sev | Notes |
|---|-------|-----|-------|
| MC1 | ✅ **Confirm add control** | 🔴 | Copy `mealCheck.confirmHelp` says "Tap a food to remove it, or add anything we missed" — but the confirm phase renders only remove-chips, the open-composite adder, and unknown-suggestions. A food the parser missed entirely can't be added until the *result* screen (which does have "+ Add item"). Fix: reuse the result screen's add affordance on confirm (or fix the copy — but the affordance is the right call). |
| MC2 | ✅ **Touch targets ≥44×44** | 🔴 | Measured live: chip remove `×` = **20×20**, variant switch = 47×**24**, "+ Add item" = 106×**34**. Standard is ≥44×44. Enlarge hit areas (padding/`::before` hit-slop) without growing the visual chip. |
| MC3 | ✅ **aria-live added** | 🔴 | Measured: **0** live regions. Phase changes (input→confirm→result) and the async verdict are silent to screen readers. Add `aria-live="polite"` to the result headline + a status announcement on phase change. |
| MC4 | ✅ **h1 per phase** | 🟠 | Measured: h1=0, h2=1. Each phase should own a proper `h1` ("Meal Check" / "Is this what you ate?" / the verdict). |
| MC5 | ✅ **Variant switch on confirm** | 🟠 | "tomato" resolved to **Tomato (cooked)** with no signal that a guess was made; the raw⇄cooked switch only exists on the *result* screen. Surface the variant switch (or an "assumed cooked" hint) on confirm, where the user is being asked to confirm. |
| MC6 | ✅ **Sticky confirm CTA** | 🟠 | With an open composite the "See how it affects me" button sits below a ~12-chip smoothie panel — off-screen on a 812px viewport. Make the primary CTA sticky at the bottom of the confirm phase. |
| MC7 | ✅ **Confirm sections reordered (decisions first)** | 🟡 | The "We don't have 'zorblax' yet" prompt renders *after* the smoothie panel, so the thing needing a decision is the easiest to miss. Order the confirm sections by "needs your input first": unknown → ambiguous → open-composite. |
| MC8 | ✅ **Input quick-start chips** | 🟡 | A user with no history sees title + textarea + CTA and ~50% empty screen. Add quick-start chips (recent/common meals, or time-of-day suggestions like "breakfast I usually have") to make the first check one tap. |
| MC9 | ✅ **Trial banner input-phase only** | 🟡 | "Free trial · 7 days left" sits above the content on input, confirm *and* result, pushing the actual content down on a small screen. Show once per session (or only on the input phase). |
| MC10 | ✅ **Constitution bar caption + aria** | 🟡 | The segmented bar in "Effect on your doshas" has no legend/label — it's the constitution split, but nothing says so. Add a caption or `aria-label`/legend. |

---

## Known unverified (be honest about these)

- **Install attribution** (#19) — merged, compiles, never observed working.
- **iOS gate** — verified by unit test only; no iOS device/build exists yet.
- **PR #13 UX changes** (#10) — merged without on-device confirmation.
- **`ExternalBrowserPlugin` on iOS** — unknown until the platform is added.
