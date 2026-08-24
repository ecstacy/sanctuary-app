# Food database architecture — how it scales

_The decision (2026-08-24): stop hand-rating composite dishes. Base ingredients are authored and human-reviewed; dishes are **derived** from ingredients + a cooking method._

## The two kinds of food

| | Base ingredient | Composite dish (recipe) |
|---|---|---|
| Examples | rice, spinach, chicken, ghee, cumin | dal fry, tomato pasta, curd rice |
| Count | finite (~300–400 real foods) | effectively infinite |
| Where | `ingredients*.js` (hand-authored) | `recipes-data.js` (culinary only) |
| Carries dosha/rasa/guṇa? | **yes**, hand-rated | **no — derived** |
| Review | classical (Charaka) — slow, careful | culinary ("right ingredients + method?") — fast |
| Gate | `reviewStatus: 'reviewed'` + `REVIEWED_SIGNED_OFF` | same |

**Why:** composite dishes were 26% of the dataset, impossible to keep consistent (a dish's hand-rated `doshaEffect`/allergens/tags drift from its ingredients — the meat-tag gap was exactly this), and never-ending to author. Deriving means a dish can only ever say what its reviewed ingredients already say.

## How derivation works

`lib/deriveRecipe.js` turns a recipe def into an ingredient-shaped food:
- **doshaEffect** — Σ ingredient effects + the cooking-method delta, clamped to −1/0/+1.
- **rasa / vipaka / guṇa** — the tastes and qualities present, most-common first, + the method's.
- **vīrya** — a heating/cooling vote across ingredients + the method nudge.
- **allergens** — the union (via `allergensOf`, so category-implied ones count).
- **dietTags** — the union, **plus an automatic `meat` tag** when any part is meat → veg/pescatarian/halal exclusion falls out with no per-dish tagging.

`lib/cookingMethods.js` holds the ~15 method transforms (fried → +oily/heavy/+Kapha/+Pitta; simmered → grounding; fermented → +sour/heating; raw → +Vata/dry; …). A method is a small delta, so "fried potato" ≠ "boiled potato" without authoring either twice.

Derived recipes are `Object.assign`ed into `INGREDIENTS` at load (`ingredients.js`, after all base batches), so `getIngredient` / `searchIngredients` / meal-check / the composer treat them as ordinary foods. Each part is used only if it is **reviewed**, so a recipe never derives from an unreviewed fact.

## Adding a dish (the whole job now)

1. Add an entry to `recipes-data.js`:
   ```js
   dalFry: {
     id: 'dalFry', name: 'Dal fry', aliases: ['tadka dal'],
     ingredientIds: ['toorDal', 'tomatoCooked', 'onionCooked', 'garlic', 'cumin', 'ghee'],
     method: 'tempered', reviewStatus: 'reviewed',
   },
   ```
   Only reviewed ingredient ids; pick a method from `cookingMethods.js`.
2. Add its id to `REVIEWED_SIGNED_OFF` in `dietSafety.test.js`.
3. `npm test`. That's it — dosha, allergens, meat-tag, taste all derive.

No classical review, no hand-rated numbers, no new consistency surface.

## Still hand-authored (base ingredients)

New *base* foods (a new grain, vegetable, spice, pasta type) still go through a
normal draft → human-review → `reviewed` batch, because their classical
properties are real facts that must be checked. Rice *shapes* / pasta *shapes*
don't need separate entries — they don't change dosha; one base + a recipe's
method covers the variety.

## Not yet migrated

The ~132 existing hand-rated composite dishes (`ingredients-dishes.js`,
`ingredients-modern-draft-*.js`) still carry authored values. They can be
converted to recipes incrementally; new dishes should always be recipes.
