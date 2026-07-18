# thesanctuaryteam.com — marketing site

Zero-dependency static site (plain HTML/CSS/JS — no build step). This is the
M1 skeleton from [docs/growth-plan.md](../docs/growth-plan.md) §2: landing +
privacy + terms + support. The /quiz funnel (M2) and /poses SEO library
(M3–4, generated from `src/data/asanas.js`) come later — introduce Astro only
when the generated pages actually need it.

## Local preview

```bash
python3 -m http.server 8900 --bind 127.0.0.1 --directory website
```

## Deploy (Cloudflare Pages, free)

1. Cloudflare dashboard → Workers & Pages → Create → Pages →
   "Connect to Git" → select this repo.
2. Build settings: **Framework preset: None**, build command: *(empty)*,
   output directory: `website`.
3. Custom domain → add `www.thesanctuaryteam.com` (and apex redirect) —
   Cloudflare walks you through the DNS records.
4. Pretty URLs (`/privacy` → `privacy.html`) work out of the box.

Netlify works identically (publish directory `website`, no build command).

## Flip-to-live checklist (when the Play listing goes public)

- [ ] Remove the "Launching soon" note in `index.html` (one `<p class="cta-note">`)
- [ ] Set up `support@thesanctuaryteam.com` forwarding (Cloudflare Email
      Routing is free) — the address is referenced on all four pages
- [ ] Submit `sitemap.xml` in Google Search Console
- [ ] Verify the Play badge carries `referrer=` UTMs end-to-end
      (visit `/?utm_source=test`, click badge, check the URL)

## Pages

| Path | Purpose |
|---|---|
| `/` | Landing. Hero → Play badge + **"Find your dosha →"** (the primary funnel CTA) |
| `/quiz` | **The funnel workhorse** (growth-plan §2.2). 5-question dosha teaser → result → store badge |
| `/poses/` + 76 × `/poses/<slug>` | **Generated** SEO library — see below |
| `/support`, `/privacy`, `/terms` | Store-required pages |

### The pose library is generated — don't hand-edit it

`website/poses/*.html`, `website/assets/poses/*`, and `sitemap.xml` are
**generated** by `scripts/build-pose-pages.mjs` from `src/data/asanas.js` (the
same canonical data the app renders, so the site and product can't drift).

```bash
npm run poses:pages     # rebuild manifest + regenerate pages + sitemap
```

Re-run after editing `asanas.js`. Output is committed so Cloudflare Pages stays
zero-build. (A generator was chosen over Astro deliberately: the site has no
build step, this repo already has the `scripts/*.mjs` pattern and already
commits generated artifacts like `poseManifest.js`, and the output stays
reviewable in diffs.)

⚠️ **Two traps encoded in that script — read before changing it:**

1. **Dosha sign convention is inverted between asanas and foods.**
   `asanas.js doshaAffinity`: **+1 = Balancing, −1 = Caution**
   (authoritative: `getDoshaTag()` in `src/data/asanas.js`).
   `dietary.js RASAS.effect`: **−1 = pacifying, +1 = aggravating** — the
   opposite. Getting this backwards inverts the advice on all 76 pages while
   looking perfectly plausible. The generator therefore calls the app's own
   `getDoshaTag()` rather than mapping numbers itself — which also handles the
   few legacy entries using the string schema (`'balancing'`).
2. **`POSE_ALIASES`** — a few poses' data keys differ from their image
   filenames (`legsUpWall` → `legUpWall.webp`, `forwardBend` →
   `paschimottanasana.webp`). The map is mirrored from
   `src/components/PoseFigure.jsx`; keep them in sync or those pages lose their
   images.

### About the quiz

`assets/quiz.js` mirrors the app's real instrument (`src/data/doshaQuiz.js`):
the same five trait dimensions and the same weights (3 × body @ 1.5, mind and
lifestyle @ 1.0). The app asks them as 15 agree/somewhat/disagree statements
plus tiebreakers; the web version compresses each dimension to one
forced-choice question. It is deliberately less precise, the result says so,
and that honesty gap *is* the reason to install.

Result copy (taglines) is lifted verbatim from
`src/data/ayurveda/dosha-prakriti.js` so web and app never contradict each
other. **If you change the quiz or the taglines in the app, update this too.**

Events: `quiz_started`, `quiz_question_answered`, `quiz_completed`
(with `primary`/`is_dual`/percentages), `quiz_restarted`, `store_badge_clicked`
(with `placement`).

## Attribution notes

`assets/site.js` re-encodes any `utm_*` params into the Play link's `referrer=`
param (Install Referrer spine — growth-plan §4), fires `store_badge_clicked`
into PostHog (EU, cookieless `memory` persistence — no banner needed), and
captures pageviews with `platform: web`.

Two things it handles that are easy to break:

1. **Campaign persists across internal navigation.** The highest-intent path is
   `/?utm_source=…` → `/quiz` → badge, and that internal hop drops the query
   string. UTMs are saved to `sessionStorage` on first touch (first touch wins)
   so the badge on the quiz *result* still carries the referrer. Without this,
   attribution silently dies on the best-converting path.
2. **Badges rendered after load get bound too.** The quiz result badge doesn't
   exist at load, so `window.sanctuaryApplyAttribution(root)` is exposed and
   called after rendering. A new dynamic badge must call it or it will drop
   both the referrer and the click event.
