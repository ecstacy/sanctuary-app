# The Sanctuary — 6-Month Growth Plan

> Status: strategy draft, July 2026. Owner: Akash.
> Decisions locked: **faceless/app-first content · global English first · quiet
> soft-launch (content independent, app is the persistent CTA) · ~5 hrs/week,
> no budget (organic only)**.
> Companion docs: [analytics-events.md](./analytics-events.md),
> [posthog-dashboards.md](./posthog-dashboards.md).

The plan has three parts: **content engine** (YouTube + Instagram, expandable),
**website** (thesanctuaryteam.com), and **app stores** (Play now, iOS later).

---

## 0. The core asset insight

The app *is* the production studio. Nothing needs to be filmed:

| App asset | Content it becomes |
|---|---|
| 76 asana pose videos (Supabase-hosted masters in `media/pose-videos/`) | The visual footage for every Reel/Short |
| Azure TTS voice narration (en/de/hi) | Voiceover track — zero recording |
| Session composer (Today's Practice) | **Auto-generated long-form follow-alongs** — a composed 13-min session, screen-recorded or rendered, *is* a YouTube video |
| Recommendation categories (lower-back, sleep, anxiety, digestion, hips, focus, posture, period pain…) | The editorial calendar — each category is a content series |
| Dosha quiz + dosha content | The differentiator wedge no generic yoga channel has |
| 50 Ayurvedic quotes, dinacharya content | Carousel / quote-card filler at near-zero cost |

**Positioning:** don't compete as "another yoga channel." Compete as
**"yoga that knows your body type"** — Ayurveda-personalized yoga. Generic
yoga content is saturated; dosha-angle content is an underserved wedge with
high curiosity value ("which dosha are you?" is inherently clickable).

**Honest constraints acknowledged up front:**
- Faceless + organic + 5 hrs/wk = slow compounding, not virality-on-demand.
  Targets below are set accordingly; anything above them is upside.
- Attribution from organic social → app installs is fuzzy. We mitigate with
  UTM-carrying links and Play Install Referrer (see §4), but expect directional
  data, not precision.
- Music: never bake licensed tracks into exported video. Add audio from each
  platform's native library at upload time (keeps every platform happy).

---

## 1. Content strategy — YouTube + Instagram

### 1.1 Pillars (and the 80/20)

| # | Pillar | Share | Format | Why |
|---|---|---|---|---|
| P1 | **One Pose, One Problem** — "Can't sleep? Do this for 5 minutes." Pose video + TTS voice + captions | ~40% | Reels/Shorts 30–60s | Volume engine. Maps 1:1 to the app's 11 recommendation categories; infinitely repeatable (76 poses × problems) |
| P2 | **Dosha wedge** — "Why your yoga routine isn't working (it's your dosha)", vata/pitta/kapha explainers, myth-busts | ~25% | Reels/Shorts + carousels | The differentiator. Every one ends in the quiz CTA |
| P3 | **Ayurvedic wisdom / dinacharya** — morning-routine-by-dosha, seasonal tips, quote cards | ~20% | IG carousels + Stories | Saves/shares driver (saves are the algorithm's favorite signal); cheapest to produce |
| P4 | **Product & follow-alongs** — feature moments ("your practice, composed fresh daily"), monthly full-length composed session | ~15% | Reels + monthly YT long-form | Converts the audience; long-form builds YT watch-hours |

### 1.2 Cadence (fits in 5 hrs/week)

| Day | Time | What |
|---|---|---|
| Sun (batch) | 2.5 h | Produce 3 Reels/Shorts + 1 carousel from templates |
| Sun | 30 min | Schedule everything (Meta Business Suite + YouTube — both free) |
| Daily | 10 min | Reply to every comment, 1 Story (reshare/poll) |
| Fri | 30 min | Analytics ritual (§1.5) + pick next week's experiment |

- **3 Reels/Shorts per week**, each cross-posted to *both* IG Reels and YT
  Shorts (one production, two placements). Strip watermarks; upload natively.
- **1 carousel per week** (IG; repurposed to Pinterest from Month 2, §1.7).
- **1 long-form YouTube video per month** (P4): a full composed session
  (10–15 min follow-along, e.g. "13-Minute Ayurvedic Morning Yoga for Pitta").
  Produced by screen-recording/exporting the app's own session — the composer
  does the choreography, the TTS does the narration.
- Tools (all free): CapCut (editing templates), Canva (carousel templates),
  Meta Business Suite + YouTube Studio (scheduling). Build 3 reusable
  templates in week 1 so every asset is fill-in-the-blanks after that.

### 1.3 Six-month arc

| Phase | Months | Focus | Exit criteria |
|---|---|---|---|
| **Foundation** | M1 | Handles + brand kit + 3 templates; 2-week content buffer; link-in-bio funnel live (§4); baseline cadence starts | 12+ posts live, buffer never empty |
| **Volume & learn** | M2–M3 | Full cadence; one experiment variable per week (§1.6); first monthly follow-along; Pinterest repurposing starts | 40+ posts; know our top-quartile hook style; 1 format with >2× median performance identified |
| **Double down** | M4 | Kill the weakest pillar share, double the winner; TikTok cross-posting starts; series branding ("Dosha Diaries", "Pose Rx") | Clear winning series; median views trending up MoM |
| **Compound** | M5–M6 | Series-first calendar; collab/remix experiments; de or hi subtitle test (one month, one market); evaluate paid amplification for M7+ | Targets in §1.4 hit or consciously re-forecast |

### 1.4 Targets (honest, organic, faceless)

**North star: weekly app installs attributable to content** (proxy chain:
profile visits → link clicks → store → install referrer, §4).

| Metric | M2 checkpoint | M4 checkpoint | M6 target |
|---|---|---|---|
| Posts published (cumulative) | 25 | 60 | 100+ |
| IG followers | 300–600 | 1,200–2,500 | **3,000–5,000** |
| YT subscribers | 100–250 | 400–800 | **1,000** (monetization threshold = stretch) |
| Cumulative short-form views | 30–60k | 120–250k | **300–500k** |
| Avg. saves rate on carousels | ≥2% | ≥3% | ≥3% |
| Link-in-bio clicks (cumulative) | 400 | 1,500 | **4,000+** |
| Content-attributed installs (cumulative) | 100–200 | 500–900 | **1,500** |
| Install → dosha-quiz completion (PostHog Dashboard A) | ≥50% | ≥55% | ≥60% |

**Kill/pivot rules:** if at M2 median Reel views < 200 after 25 posts, the
hook format is broken — pivot hooks (not pillars). If at M4 installs < 300
cumulative, the CTA funnel is broken — rework link-in-bio/landing before
making more content. Re-forecast, don't rationalize.

### 1.5 Analytics ritual (30 min, Fridays)

Track in a simple sheet (per post: pillar, hook type, length, views @72h,
retention/hold %, saves, shares, profile visits, link clicks):

1. **Per-platform natives:** IG Insights (reach, saves, profile visits),
   YT Studio (swipe-away rate on Shorts, avg view duration on long-form).
2. **Funnel (owned):** link-in-bio clicks → website → store-badge clicks
   (PostHog on the website, §3) → installs w/ referrer (§4) → Dashboard A
   onboarding funnel → Dashboard C daily-session engagement of that cohort.
3. **Leading indicators over vanity:** 3-second hold rate (hook quality),
   saves per reach (carousel quality), follows per reach (positioning fit).
   These predict; view counts lag.

### 1.6 Experiment backlog (one variable per week, ≥3 posts per variant)

Decision rule: variant wins if top-quartile on hold-rate or saves-rate vs.
trailing 4-week median; winners become the new default.

1. Hook style: question ("Can't sleep?") vs pain-point ("Your lower back hates
   your desk") vs myth-bust ("You're doing savasana wrong")
2. Voiceover vs text-on-screen + music only
3. Length: 30s vs 45–60s vs 90s
4. Dosha-specific framing vs generic framing of the same pose
5. CTA: "take the free dosha quiz" vs "link in bio" vs no CTA (baseline)
6. Carousel depth: 5 slides vs 8–10 slides
7. Posting time: morning (6–8am ET) vs evening (6–9pm ET)
8. First-frame: pose video vs bold text card
9. Series-branded episode vs standalone
10. Trending audio (platform library) vs voice-only
11. Long-form: full follow-along vs "5 poses for X" compilation
12. (M5–6) Subtitled de or hi versions of the top-5 performers — one market,
    one month, measure follows + installs by `app_language` in PostHog

### 1.7 Platform expansion (in order, only when cadence is stable)

| Platform | When | Why / cost |
|---|---|---|
| **Pinterest** | M2 | Yoga is a top-5 Pinterest vertical; carousels + infographics repost with ~zero marginal effort; pins compound via search for years. The sleeper channel for this niche |
| **TikTok** | M4 | Cross-post the same Reels natively; faceless how-to yoga performs; adds a discovery surface for free |
| **YouTube long-form SEO** | M3+ | Follow-along videos rank for "10 minute morning yoga" queries and build watch time |
| WhatsApp Channel / regional | M6+ | Only if/when the India (hi) push begins |
| X / Threads / Lemon8 | Skip | Wrong audience-to-effort ratio for this niche at this capacity |

---

## 2. Website — www.thesanctuaryteam.com

### 2.1 Jobs, in priority order

1. **Convert social traffic → installs** while preserving attribution (UTM →
   Play referrer, §4). The link-in-bio destination.
2. **Own the dosha-quiz teaser** — the single best lead magnet the brand has.
3. **Compound SEO** via a pose library generated from the app's own data.
4. **Satisfy store requirements** — privacy policy, terms, support page (Play
   and App Store both require public URLs).

### 2.2 Sitemap & layout

```
/                    Landing
/quiz                Mini dosha quiz (3–5 questions, teaser)
/poses/              Pose library index
/poses/[slug]        76 SEO pages generated from src/data/asanas.js
/support             Contact + FAQ            (store requirement)
/privacy             Privacy policy           (store requirement)
/terms               Terms of service         (store requirement)
```

**Landing page, top to bottom:**
1. **Hero** — phone mockup playing a pose video; headline in the wedge voice
   (working copy: *"Yoga that knows your body type."*); subline: *"A daily
   practice composed for your dosha, your energy, your day."*; Play badge +
   "iOS coming soon"; single secondary CTA: "Find your dosha →" (/quiz)
2. **How it works** — 3 steps: take the quiz → get Today's Practice → follow
   voice-guided sessions (reuse app screenshots/screen recordings)
3. **Feature trio** — Today's Practice composer · voice guidance in 3
   languages · Ayurvedic check-ins (vikriti)
4. **Pose library teaser** — 6 pose cards linking into /poses/ (SEO internal
   linking)
5. **Social proof strip** — placeholder at launch; feed Play-review quotes in
   as they arrive
6. **Footer** — store badges, social links, legal

**/quiz (the funnel workhorse):** 3–5 question teaser version of the app's
dosha quiz → result card ("You lean Pitta 🔥") → *"Your full profile — and a
practice built around it — lives in the app"* → store badge with UTM intact.
Shares its question data with the app where possible. Every content CTA
points here, not at the raw store listing — the quiz-result moment converts
far better than a cold listing, and we keep analytics on the way through.

**/poses/[slug] (the compounding asset):** generated at build time from
`src/data/asanas.js` (the esbuild-bundle trick from the voice pipeline already
solves Node-importing that file). Each page: pose video/still, benefits,
precautions, step-by-step instructions, and — the moat — the **dosha
affinity table** no generic yoga site has. Schema.org `HowTo` markup.
Internal-link poses ↔ related problems. 76 pages of unique structured content
from data that already exists.

### 2.3 Build & targets

- **Stack:** Astro (static, fast, imports the JS data directly) or plain
  Vite+React SSG; Tailwind with the app's existing design tokens; deploy on
  Cloudflare Pages / Netlify free tier. PostHog web snippet (same project,
  separate `platform: web` — the super-prop already distinguishes).
- **Milestones:**

| When | Ship |
|---|---|
| M1 | Landing + /privacy + /terms + /support live (unblocks Play listing polish); link-in-bio points here with UTMs |
| M2 | /quiz live — becomes the default CTA in all content |
| M3–M4 | /poses/ library live; submit sitemap; Schema.org markup |
| M6 | Targets: indexed for 76 pose pages; 500–1,000 organic visits/mo (SEO is slow — this is seeding, payoff is M6–M12); quiz completion rate ≥40% of /quiz visitors; quiz → store-badge CTR ≥25% |

---

## 3. App stores

### 3.1 Google Play (now — the soft launch)

**Launch checklist (engineering + listing):**
- [ ] Switch from debug APK to **signed release AAB** (Play App Signing);
      versionCode/versionName discipline
- [ ] Data-safety form (declare PostHog/Supabase/Crashlytics collection —
      consent-gated analytics is a good story here)
- [ ] Privacy policy URL → website /privacy (M1 dependency)
- [ ] Content rating questionnaire (health & fitness)
- [ ] **Account-type gotcha:** personal developer accounts created after
      Nov 2023 must run a closed test with **20 testers for 14 days** before
      production access. If the account is personal, start this clock
      *immediately* — it's the longest pole in the launch tent
- [ ] In-app review prompt: reuse the ReminderPrompt pattern — ask after the
      2nd completed daily session (happy moment), never on first run

**Listing (ASO):**
- **Title:** `The Sanctuary — Ayurvedic Yoga` (30 chars; carries both keywords)
- **Short description:** *"Daily yoga composed for your dosha. Voice-guided,
  personalized, in 3 languages."*
- **Keyword targets:** ayurveda yoga · dosha · personalized yoga · daily yoga
  routine · morning yoga · yoga for sleep — long-tail, winnable; avoid
  fighting "yoga" head-on
- **Screenshots (8, story order):** dosha result → Today's Practice card →
  practice player w/ pose video → practice plan → voice/language picker →
  vikriti check-in → streaks → Discover. Caption overlay on each (screenshots
  are read, not tapped)
- **Feature graphic + 30s promo video** cut from pose footage (reuse a Reel)
- **Free native A/B testing:** Play Store listing experiments — test icon and
  first-two-screenshots variants from M2; it's the only free paid-quality
  growth lever on the platform

### 3.2 Apple App Store (target: M3–M4 window)

- `npx cap add ios` — Capacitor supports it; you have the Mac. Apple
  Developer Program **$99/yr** (the plan's only hard cost; decide at M2).
- ⚠️ **Blocking business issue:** Sanctuary Plus currently sells via Stripe.
  Apple **requires In-App Purchase** for digital subscriptions (guideline
  3.1.1) — Stripe checkout inside the iOS app will be rejected. Options:
  1. Launch iOS **free-tier only** first (fastest; Plus upsell web-side is
     still policy-sensitive — don't link to it from the app)
  2. Add StoreKit via a Capacitor IAP plugin + server-side receipt
     validation alongside Stripe (the real fix; ~a chunk of work)
  3. US external-purchase-link entitlement (US-only, messy UX)
  - **Recommendation:** option 1 to enter the store in M3–M4, option 2 as a
    scheduled M5–M6 workstream.
- Listing mirrors Play ASO; App Store screenshots need device-frame exports
  (6.7" + 5.5"). TestFlight the same builds the Pixel gets.

### 3.3 Store targets

| Metric | M2 | M4 | M6 |
|---|---|---|---|
| Play listing conversion (store visits → installs) | ≥25% | ≥28% | ≥30% (listing experiments driving) |
| Rating | ≥4.3 seed | ≥4.4 | ≥4.5, 50+ ratings |
| iOS | — | TestFlight live | Public, free tier |

---

## 4. Attribution spine (content → install → PostHog)

The one piece of light engineering that makes all targets measurable:

1. Every content CTA → `thesanctuaryteam.com/...?utm_source=instagram&utm_campaign=<series>`
2. Website PostHog captures the UTM; store badges append it to the Play URL:
   `...&referrer=utm_source%3Dinstagram%26utm_campaign%3D<series>`
3. App reads **Play Install Referrer** on first launch (small Capacitor
   plugin task) → fires `install_attributed` with the parsed UTMs → lands in
   Dashboard A/C, cohort-filterable.
4. iOS later: Apple Search Ads attribution API or provisional deep links.

Without step 3, "content-attributed installs" degrades to link-click counts —
still directional, but add the referrer read in M1–M2 if at all possible.

---

## 5. Weekly operating rhythm (the whole system on one line each)

- **Sun (3h):** batch 3 Reels + 1 carousel → schedule everything
- **Daily (10m):** comments + 1 Story
- **Fri (30m):** analytics sheet + pick next week's experiment
- **Monthly (2h):** long-form follow-along + re-read §1.4 targets vs. actuals
- **Quarterly:** re-forecast targets honestly; kill what's dead, double what compounds
