# Diet & Nutrition Feature — Build Plan

> Status: **Plan, pre-build** (2026-07-16). Owner: Akash (review) + Claude (drafting).
> Sources: **Charaka Samhita (CS)** — the classical text on āhāra (diet) — with
> Hatha Yoga Pradipika secondary. Same citation + fact-check bar as
> [content-buildout.md](./content-buildout.md).
> Companion: [growth-plan.md](./growth-plan.md) (monetization), the daily-session
> composer (`src/lib/dailySession.js`) is the architectural template.

## 1. What we're building

Two features, one knowledge base:

1. **Ingredient / dish lookup** (free) — search a food → its effect on the
   doshas, *why* it's good or not for you, *when* to eat it, cautions, and the
   Charaka citation.
2. **Meal guidance** (Plus) — "what should I eat / cook right now" tuned to the
   user's **current imbalance, constitution, season, and allergies**, optionally
   from **ingredients they already have**. Structured meal *ideas* (named dishes
   + why + timing), not step-by-step recipes.

### Locked decisions (from planning Q&A, 2026-07-16)

| Decision | Choice |
|---|---|
| Knowledge source | **Curated, Charaka-cited, human-reviewed DB. Deterministic. LLM only later, constrained.** |
| Monetization | **Freemium** — search free, meal planner = Plus |
| Meal output depth | **Structured meal ideas** (named dishes + why + timing; NOT full recipes) |
| Personalization inputs | **Vikriti + Prakriti + Season + Allergies/restrictions** |
| Language | EN-first authoring (de/hi overlays later, per i18n architecture) |

## 2. The anti-hallucination architecture (the whole point)

The facts never come from a language model. They come from a curated dataset,
each entry fact-checked against Charaka and gated by review status. Search is a
**lookup**; meal guidance is a **rules composer** over that data (exactly like
the daily-session engine). **There is no fact-generation step, so there is no
hallucination surface.**

Three honesty mechanisms are first-class, not afterthoughts:

- **Coverage honesty.** A food not in the reviewed dataset returns *"we don't
  have reliable Ayurvedic guidance on this yet"* — never a guess. Only
  `reviewStatus: 'reviewed'` entries ship.
- **Confidence labelling.** Classical-consensus facts (rice, ghee, ginger) are
  `high`. Foods absent from the classical corpus (quinoa, avocado, kimchi) are
  classified *by their properties* (rasa/virya/vipaka are derivable from
  taste/heaviness/potency) and marked `medium` with a visible "derived, not
  classically cited" note.
- **Safety escalation.** Any query or profile touching pregnancy, a named
  medical condition, medication, or a disordered-eating signal surfaces a
  disclaimer and *"please consult a qualified practitioner or doctor"* — and the
  planner softens rather than asserts. See §6.

## 3. Knowledge model

Extends the existing `src/data/ayurveda/dietary.js` (keep `RASAS`; it's the
skeleton). New canonical dataset `src/data/ayurveda/ingredients.js`:

```ts
type Ingredient = {
  // Identity
  id:        string        // camelCase, e.g. 'ginger', 'basmatiRice', 'mungDal'
  name:      string        // 'Ginger'
  sanskrit?: string        // 'Ardraka' (fresh) / 'Shunthi' (dried)
  aliases:   string[]      // ['fresh ginger', 'adrak']
  category:  'grain'|'legume'|'vegetable'|'fruit'|'dairy'|'spice'|'oil'|'nut_seed'|'sweetener'|'beverage'|'animal'|'other'

  // Ayurvedic classification — THE FACTS (human-reviewed)
  rasa:   Taste[]                              // primary tastes, e.g. ['pungent','sweet']
  virya:  'heating' | 'cooling'                // potency (uṣṇa/śīta)
  vipaka: 'sweet' | 'sour' | 'pungent'         // post-digestive effect
  guna:   string[]                             // qualities: ['light','oily','sharp',...]
  doshaEffect: { vata: -1|0|1, pitta: -1|0|1, kapha: -1|0|1 }  // -1 pacify / 0 neutral / +1 aggravate

  // Usage guidance
  bestTime?:    ('morning'|'midday'|'evening')[]
  bestSeason?:  ('spring'|'summer'|'autumn'|'winter')[]
  preparation?: string        // notes where prep flips the effect (raw vs cooked, spiced)
  whyFavor?:    string        // short, factual, citation-backed
  whyAvoid?:    string
  combosToAvoid?: string[]    // viruddha āhāra — incompatible combinations, e.g. milk + sour fruit
  cautions?:    string[]      // flags, NOT medical claims: 'pregnancy','high_pitta','acid_reflux'

  // Provenance & trust
  source:       { text: 'CS'|'HYP'|'modern', verse?: string, note?: string }
  reviewStatus: 'draft' | 'reviewed'      // only 'reviewed' ships
  confidence:   'high' | 'medium'         // classical consensus vs property-derived
}
```

A **"dish"** is a lightweight named template that *references* ingredient ids;
its net dosha effect is **derived from its constituents and shown transparently**
(never asserted independently). This keeps dishes honest and cheap to add.

## 4. Feature 1 — Ingredient / dish search (free)

- Reuse the Discover search pattern (`DiscoverPage.jsx`): name/alias substring,
  prose fields word-boundary matched (avoids the "mal"→Vrksasana class of
  false positive we already fixed).
- Result view: dosha effect (V/P/K chips), the six-taste breakdown, virya/vipaka,
  **"why this is good / not ideal for *your* dosha"** (resolved against the user's
  target dosha — §7), best time & season, combos to avoid, cautions, and the
  **Charaka citation + confidence badge**.
- Coverage miss → honest "not in our reference yet" + a way to suggest it.
- Free tier: this is the growth/retention/SEO hook (mirrors the /poses web
  library idea — ingredient pages are searchable content).

## 5. Feature 2 — Meal guidance / "nutritionist" (Plus)

A deterministic composer, `src/lib/mealComposer.js`, mirroring
`dailySession.js` (seeded PRNG → stable-per-day, varied day-to-day).

**Inputs:** resolved target dosha (§7), season, time-of-day, allergy/restriction
profile (§6), and optional `availableIngredients[]`.

**Logic:**
1. Filter out every allergen / restricted item — **hard filter, no exceptions**
   (an Ayurvedic "favor" never overrides a peanut allergy).
2. Rank remaining ingredients: prefer `doshaEffect[target] < 0` (pacifying),
   matching `bestSeason`/`bestTime`; downrank aggravating ones.
3. Slot into **meal-idea templates** keyed by (time-of-day × dosha) — e.g.
   *"warm spiced oatmeal with ghee & stewed apple"*. Named dish + the *why* +
   the timing. No quantities, no cooking steps (keeps us out of recipe/technique
   liability).
4. If `availableIngredients` given: rank templates by how well they're covered
   by what the user has, and explicitly call out which of *their* items are
   favorable vs best-avoided right now.
5. Emit `reasons[]` (plain-language "chosen to settle your aggravated Vata"),
   citations, a confidence/coverage line, and the standing disclaimer.

Gated behind Plus via the existing `PaywallSheet` (`surface: 'diet_planner'`).

## 6. Safety & liability (non-negotiable)

An Ayurvedic diet tool intersects allergies, medical conditions, pregnancy,
medication, and disordered eating. Design requirements:

- **The exclusion path fails CLOSED.** Every bug found here so far had one
  shape: the filter looks present and does nothing, so the user is told an
  excluded food suits them — invisible from the UI, and always the harmful
  direction. Four such bugs were live at once (dead `dietTags`, honey passing a
  vegan filter, `halal`/`kosher` declared with no rule, and case-sensitive
  matching against client-written jsonb). The standing rules, all tested:
  category-implied allergens so a forgotten tag can't unfilter a food; input
  normalisation on both sides; a canonical tag vocabulary (a typo matches no
  rule); a test asserting every declared pattern has a rule; and for
  halal/kosher, **exclude rather than imply an approval we cannot certify**.
- **Allergen vs preference is a real distinction, not a wording choice.** An
  allergen is a safety constraint whose two failure directions are wildly
  asymmetric, so we over-restrict without hesitation. A preference (vegan,
  Jain, no-nightshade) is a choice where BOTH errors cost something — telling a
  vegetarian all hard cheese is off-limits is a wrong answer, not a safe one.
  Keep the vocabularies separate: `nightshade` was briefly an allergen and had
  to be moved, because a botanical family is not a medical category and the UI
  was calling an avoidance choice an allergy.
  ⚠ **Chunk 3 note:** `diet_prefs` storage does not exist yet, so no stored
  user data carries the old key. When it lands, `nightshade` belongs under
  patterns (`no_nightshade`) and must not appear in the allergen picker.
- **Allergy/restriction profile** — a small opt-in step (allergens +
  veg/vegan/jain/no-onion-garlic/etc.), stored on `profiles.diet_prefs` (jsonb;
  same client-writable pattern as `notification_prefs`, **not** an entitlement
  column — cf. migration 014). Applied as a hard filter everywhere.
- **Persistent disclaimer** — "general Ayurvedic guidance for wellbeing, **not
  medical or nutritional advice**; consult a qualified practitioner or doctor
  for conditions, allergies, pregnancy, or medication." Mirrors the app's
  existing not-medical-advice stance in `/terms`.
- **Seek-help triggers** — pregnancy, a named condition, medication, or a
  disordered-eating signal → surface the disclaimer prominently and *decline to
  over-specify*, pointing to a professional. This is the "mention where we're
  not sure and suggest to seek help" requirement, made concrete.
- **No medical claims, ever** — we say "traditionally considered cooling / may
  aggravate Pitta," never "cures / treats / prevents." Cautions are flags, not
  diagnoses.
- **Copyright** — extend `dietary.js`'s existing policy: paraphrase the verses,
  cite the reference, never reproduce copyrighted modern translations.

## 7. Personalization — resolving the target dosha

Ayurvedic diet targets the **aggravated** dosha (vikriti), read against
constitution and season — not just the birth constitution. The app already has
all four signals. Resolution order:

1. **Vikriti** — if a recent vikriti check-in exists, target the aggravated
   dosha. (This is the clinically correct target and our differentiator — most
   apps only know constitution.)
2. **Prakriti** — fall back to the quiz constitution when there's no recent
   check-in.
3. **Season overlay** — nudge toward cooling in summer / warming in winter
   regardless (ritucharya).
4. **Allergies/restrictions** — hard filter over everything above.

Gently educate the user on vikriti-vs-prakriti at the point of use ("your
constitution is Pitta, but this week you're running Vata-high — so we're
settling Vata"). Turns a correctness nuance into a trust-building moment.

## 8. Cross-cutting (our standing bars)

- **Analytics-first** (`track.js` + `analytics-events.md`): `diet_search`,
  `ingredient_viewed` (with confidence + coverage_hit), `meal_composed`,
  `meal_idea_tapped`, `diet_prefs_set`, `diet_paywall_shown`, safety-trigger
  events. Feeds a Discover/engagement dashboard.
- **Accessibility** (WCAG 2.1 AA) on every new surface.
- **i18n** EN-first; de/hi overlays via the existing content-i18n architecture.
  Ingredient names need Devanagari + transliteration like asanas.
- **Plus gating** reuses `PaywallSheet` + `useIsPremium`.

## 9. Build sequence (chunks — agree before coding, like daily-session)

| Chunk | Deliverable | Notes |
|---|---|---|
| **0 — Foundations** | Ingredient schema in `ingredients.js`; safety/disclaimer + seek-help framework; copyright policy; analytics events; i18n scaffolding | No user-facing feature yet; sets the guardrails first |
| **1 — Dataset v1** | ~60 highest-frequency foods fully classified + **Akash-reviewed** (grains, dals, common veg/fruit, dairy, core spices, oils, sweeteners, common beverages). Expandable to ~200 | The real content lift. Claude drafts from the Charaka framework; Akash fact-checks against his copies. `reviewStatus` gates shipping |
| **2 — Search (free)** | ✅ **Shipped 2026-07-21.** Food search inside the Discover box + a Food & Ayurveda section + `/ingredient/:id` detail view (dosha effect, why, classical properties, preparation, combos, cautions, citation + confidence); coverage-honest misses. Target dosha resolved by `lib/dietTarget.js` (vikriti → prakriti → none). Route is PUBLIC — the free-tier hook, and the Discover strip is reachable anonymously | Reuses Discover search; free tier |
| **3 — Diet profile** | ✅ **Shipped 2026-07-21.** `/diet-preferences` picker (allergens vs patterns, visually separate), `profiles.diet_prefs` jsonb (migration 017), `useDietPrefs` as the single read/write path, exclusion badges in Discover food search, entry point in Profile. **Health consent bumped to v2** — v1's text covered "dosha results and wellness inputs" and did NOT cover an allergy, so storing one under it would have been processing outside consent | Safety foundation for the planner |
| **4 — Meal composer (Plus)** | ✅ **Built 2026-07-21, ships dark.** `lib/mealComposer.js` (pure, seeded, mirrors dailySession) + 14 templates in `data/ayurveda/meals.js` + `/meals` Plus-gated UI. **Templates assert NO Ayurvedic facts** — no doshaEffect, no authored why, no citation; everything is derived at runtime from reviewed ingredient rows and shown with its inputs. A test enforces that. Templates are `draft` pending a CULINARY review (docs/diet-review-batch-3-meals.md) | Mirrors dailySession.js; Plus-gated |
| **5 — Integration & polish** | Entry points (Discover, Dosha profile, Home?), Plus funnel wiring, a11y pass, analytics verification, on-device check | |
| **6 — (Later, optional) Constrained LLM** | NL ingredient parsing ("what can I make with rice + spinach") + prose rephrasing that ONLY restates retrieved curated facts. Needs guardrails + an eval set + explicit "adds nothing new" contract | Only after the deterministic core proves out; keeps the hallucination bar |

## 10. Decided (2026-07-16)

- **Regional emphasis (Chunk 1):** **Indian staples + the most common Western
  foods eaten in Germany.** Indian foods map cleanly to classical citations
  (`high` confidence); the German-Western set (bread, oats, potato, dairy,
  common veg/fruit, coffee) will lean on property-derived classification
  (`medium` + "derived" note) — acceptable and honestly labelled.
- **Placement:** a **dedicated Diet section on Discover**, **inside Discover
  search**, and a **Home "meal of the day" nudge widget**. (So Feature 2's
  composer also powers a Home widget, like Today's Practice.)
- **Longer game:** this dataset becomes a **source of truth to enrich the rest
  of the app** (dinacharya, recommendations, seasonal content) once built.

## 10b. ⚠ The sign-convention trap (read before writing any food→dosha logic)

The two datasets encode dosha numbers with **opposite signs**, because they
measure different things:

| Data | Field | `+1` means | `-1` means |
|---|---|---|---|
| `asanas.js`, `pranayamas.js` | `doshaAffinity` | **balancing** (good fit) | caution |
| `dietary.js` | `RASAS[t].effect` | **aggravates** | pacifies (good) |

Both are individually correct — a food's effect is classically described as
raising or lowering a dosha, a practice by its suitability — but the same
number means the opposite thing in each, and nothing in the raw data says so.

**This already caused a real bug.** Generating the public `/poses` pages, the
food convention was applied to asana data: all 76 pages rendered
"Increases vata" where the truth was "Balancing", inverting the advice while
looking entirely plausible.

**Rule for this feature: never read these numbers raw.** Convert through
`src/lib/doshaSemantics.js`, which normalizes both domains to one vocabulary
(`balancing` / `neutral` / `caution`):

```js
import { practiceSuitability, foodSuitability } from '../lib/doshaSemantics'
practiceSuitability(asana.doshaAffinity.vata)   // +1 → 'balancing'
foodSuitability(RASAS.sweet.effect.vata)        // -1 → 'balancing'
```

The inversion lives in that one module, under test
(`doshaSemantics.test.js` asserts `practiceSuitability(n) === foodSuitability(-n)`).
New food entries should keep the `dietary.js` convention for consistency with
the classical sources — just never compare them to practice numbers directly.

## 11. Open questions / risks

- **Coverage of non-classical foods.** The classical corpus has no "avocado" or
  "quinoa." Classify by derivable properties (rasa/virya/vipaka), mark
  `confidence: medium` + "derived" note. The German-Western set will produce
  more `medium` entries — expected, and labelled.
- **Review throughput.** Dataset correctness is the entire value; the
  `reviewed` gate means the feature is only as big as Akash's fact-checking
  bandwidth. Ship incrementally (60 → 200) rather than blocking on a full corpus.
- **LLM layer economics** (Chunk 6) — model choice, cost, offline story — defer
  until the core exists.
