# Meal Check — "I ate X, what does it do to me?"

**The feature:** the user tells the app what they ate ("eggs with toast and
avocado"), the app asks only the clarifying questions it actually needs, then
returns a personal verdict — *how this meal moves YOUR doshas* — plus concrete
counter-measures: what to eat/drink to rebalance, and which pranayama or
practice helps. Example target output:

> **Eggs + toast + avocado → warms Pitta.** Your Pitta is already running high
> this week, so this breakfast pushes in the wrong direction. To settle it:
> a few spoons of fresh yoghurt-buttermilk (takra) or coriander tea — and
> 5 minutes of Sheetali or Nadi Shodhana would cool the system.

## Non-negotiables (inherited from the diet feature)

1. **No runtime-invented facts.** The verdict is a deterministic composition
   over `ingredients.js` reviewed rows — same rule as search and the meal
   planner. If an item isn't in the dataset, we say so; we never guess its
   properties. (An LLM may later help with *parsing free text into ingredient
   ids* — never with deciding what a food does.)
2. **Sign convention.** Food `doshaEffect` −1 pacifies / +1 aggravates; practice
   `doshaAffinity` +1 balances. Everything goes through `foodSuitability()` /
   `practiceSuitability()` in `doshaSemantics.js`. Never compare raw numbers.
3. **Safety outranks dosha fit.** `exclusionFor()` (allergens, diet pattern)
   applies to REMEDY suggestions too — never suggest yoghurt to a vegan or
   lassi to someone dairy-excluded.
4. **Personalise to current state.** Verdict is framed against **vikriti**
   (this week's state) when available, falling back to prakriti — matching the
   home screen's "Your state this week" logic.
5. **Not a diagnosis.** Same disclaimer posture as the rest of the diet surface.

## Flow

```
[input] ──parse──> [matched ids + unknowns]
                        │
             ┌──────────┴─────────┐
             ▼                    ▼
   [clarify: unknowns]   [clarify: variants]     ← only if needed, max ~3 taps
   "berries — closest     "tomato: raw or
    we know: strawberry,   cooked?"  (raw/cooked
    blueberry, skip"       rows differ)
             └──────────┬─────────┘
                        ▼
              [compose verdict]
     net per-dosha direction (weighted sum of
     doshaEffect over matched rows) × user's
     vikriti/prakriti → headline + per-dosha bars
                        ▼
              [counter-measures]
     • food antidotes: `balancedBy` ids of the
       offending rows, plus reviewed foods that
       pacify the raised dosha (bestTime-aware,
       dietPrefs-filtered)
     • practice: pranayama/asana with +1 affinity
       for the raised dosha (Sheetali for Pitta…)
     • timing note: bestTime/viruddha warnings if
       the combo itself is flagged (e.g. milk+sour)
```

### Input & parsing (chunk A)
- Free-text field with **chip autocomplete** driven by `searchIngredients()`
  (name + sanskrit + aliases already cover hinglish/german names). Typing
  "eggs toast avocado" tokenises on commas/"and"/"with", matches each token,
  and shows resolved chips the user can correct.
- Unmatched tokens become a clarifying chip: nearest matches (same category
  first) + "skip this item". Skipped items are shown in the result as
  "not counted — we don't have reviewed data for X yet" (honest coverage gap;
  also log `meal_check_coverage_miss` so we know what to review next).
- Variant disambiguation only where the dataset actually splits rows
  (raw/cooked tomato & onion, fresh/dry ginger, ripe/raw banana, apple
  raw/stewed…). Detect: multiple matches sharing a base alias.
- Optional context question (single tap): "When was this?" morning/midday/
  evening — enables bestTime commentary. Default to current slot.

### Verdict engine (chunk B) — pure lib, fully unit-tested
`src/lib/mealCheck.js`:
- `parseMeal(text) → { matched: [ids], ambiguous: [...], unknown: [...] }`
- `assessMeal(ids, profile) → { perDosha: {vata,pitta,kapha}, headlineDosha,
   direction, severity, verdictKey }` — weighted sum of `doshaEffect` (spices
   weigh less than staples: weight by category, e.g. spice 0.5, staple 1),
   normalised to direction (raises/settles/neutral) per dosha; headline is the
   dosha most raised **that the user is already prone to** (vikriti primary
   first, then prakriti primary).
- `remediesFor(assessment, profile, dietPrefs) → { foods: [...], practices:
   [...] }` — foods: union of the offending rows' `balancedBy` + top reviewed
   pacifiers of the raised dosha (rank: classical confidence, bestTime matches
   now, not excluded); practices: pranayamas/asanas with `+1` affinity via
   `practiceSuitability`, prefer pranayama (doable right after a meal — no
   inversions after eating).
- Also surface `combosToAvoid` hits *within the meal itself* (viruddha āhāra:
  e.g. milk + citrus in one meal) as a separate callout.
- Tests: sign-correctness fixtures (the ginger/tofu/basmati trio), the
  eggs+toast+avocado example end-to-end, exclusion of dairy remedies under a
  vegan pref, empty/unknown-only meals.

### UI (chunk C)
- Entry points: a "How was your meal?" card in the To Nourish section of Home
  (post-midday), and a button on the Diet surface.
- Screen: input → (inline clarify chips) → result card:
  - headline verdict + a mini 3-bar per-dosha readout (reuses quiz-bar visual
    language, dosha colours)
  - "To rebalance" — 2–3 food chips (tap → ingredient detail) + 1–2 practice
    chips (tap → pranayama detail, deep-link ready to start)
  - derived-not-classical badge where applicable; disclaimer footer
- i18n from day one (en/de/hi keys); voice not needed.

### Persistence + analytics (chunk D)
- Log entries locally (and to Supabase `meal_logs` if we want cross-device —
  needs a migration + RLS; can defer, start local-only).
- Events: `meal_check_started/completed`, `meal_check_coverage_miss` (with the
  unmatched token — the single best signal for which foods to review next),
  `meal_check_remedy_tapped` (food vs practice).
- A day-level rollup ("today's meals net-raised Pitta") can later feed the
  vikriti reconciler — out of scope for v1, note only.

**Coverage review buckets (in our `searches` table, not analytics).** The
structured parser (#56) can match a base food and drop the rest, which would
otherwise hide a gap behind a "hit". Three things to review when growing the
dataset:
- `source='meal_check' AND result_count=0` — genuinely unknown foods (the
  primary gap list; add these to the dataset).
- `source='meal_check_modifier' AND result_count=0` — descriptors we kept but
  couldn't act on ("cappuccino", "latte", "oat", "smoothie"); frequency here
  reveals missing variants/foods hiding behind a partial base match. Benign
  words ("black", "hot") also land here — rank by frequency and eyeball.
- `source='meal_check' AND result_count=1 AND context->>'partial'='true'` —
  matches that were only partial; `context->'residual'` lists the unexplained
  words for that specific input.

## Free vs Plus (decision)
Recommended per the premium-teaser principle: **free = the verdict** (real
insight, real value), **Plus = the remedies** ("To rebalance" section behind
the plum CTA, showing one blurred/teased item). Mirrors the Lunch Ideas
gating already on Home.

## Explicitly out of scope for v1
- LLM/natural-language parsing beyond tokeniser+alias match (revisit only if
  coverage-miss telemetry shows chips aren't enough).
- Quantities/calories — Ayurvedic verdict is directional, not nutritional.
- Photo input.
- Day-level vikriti feedback loop (noted above).

## Order & estimates
| Chunk | What | Size |
|---|---|---|
| B | `mealCheck.js` engine + tests (do first — pure logic, provable) | ~½ day |
| A | parsing/autocomplete UI + clarify chips | ~½ day |
| C | result card + entry points + i18n | ~1 day |
| D | analytics + (optional) persistence | ~¼ day |

Ship gate: engine tests green incl. sign fixtures; on-Pixel walkthrough of the
example meal; analytics events visible in PostHog.
