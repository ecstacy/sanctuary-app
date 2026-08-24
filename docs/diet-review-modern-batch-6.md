# Modern-diet review batch 6 (16 entries) — bread depth

> **✅ APPLIED & LIVE — 2026-08-24.** All reviewer corrections applied and all 16 flipped `draft → reviewed` (+ signoff). Changes: roti V−1, missiRoti V−1, pav V0, cornbread V+1 & high_sugar removed, crumpet V0, breadstick K+1, pumpernickel V−1, cornTortilla V+1; guṇa tandooriRoti/ciabatta Heavy+Dry, englishMuffin Light+Dry; bhatura caution processed→deep_fried; brioche high_sugar removed.

_All rows are `reviewStatus: 'draft'` — invisible to the app until fact-checked and flipped to `reviewed` (add the id to `REVIEWED_SIGNED_OFF` in `dietSafety.test.js`). Source: property-derived (`modern`, `confidence: medium`). Sign convention: doshaEffect −1 pacifies / +1 aggravates._

**Why this batch:** "bread" was thin — white / rye / sourdough / whole-wheat + a few dishes, but **no roti/chapati** (a staple for this audience) and none of the everyday Western loaves. Filling these lets the meal-check search **recommend the exact bread** the user ate instead of collapsing everything to "white bread" — the difference between a trusted verdict and a rough guess.

**Already reviewed (don't re-add):** whiteBread, ryeBread, sourdoughBread, wholeWheatBread, breadRoll, pita, naan, baguette, pretzel, garlicBread, bagel, croissant, breadcrumbs.

**How to review:** tick ✅ or note a correction next to the row (same as batches 3–5). Full derivations live in each entry's `source.note` in `ingredients-modern-draft-6.js`.

## Indian flatbreads (6)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Roti / chapati | `roti` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
- | ☐ | **Roti / chapati** | `roti` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - ghee

tags:
  - flatbread
  - whole_grain

notes:
  - Refers to a fresh whole-wheat chapati/roti.
  - Dry or stale rotis become more Vata-aggravating.
  - Stuffed parathas should be modelled separately.
- The main refinement I'd recommend is Vata −1. Fresh chapati is a warm, soft, freshly cooked whole grain bread, and its moisture and nourishment generally outweigh any drying effect of the wheat itself. The current V0 would be more appropriate for a cold or dry leftover roti than for the freshly prepared food most users expect.

| ☐ | Tandoori roti | `tandooriRoti` | sweet | heating | V 0 · P 0 · K +1 | allergen:gluten |
- | ☐ | **Tandoori roti** | `tandooriRoti` | sweet | heating | V 0 · P 0 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - ghee

tags:
  - flatbread

notes:
  - Refers to plain whole-wheat tandoori roti.
  - Brushing with butter or ghee would make it slightly more Vata-pacifying.
- The only refinement I'd add is documenting the guṇas as Heavy + Dry.

| ☐ | Bhatura | `bhatura` | sweet, sour | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:processed |
- | ☐ | **Bhatura** | `bhatura` | sweet, sour | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:processed |
- allergens:
  - gluten

cautions:
  - processed

balancedBy:
  - chole

tags:
  - fried
  - flatbread

notes:
  - Refers to a classic fermented bhatura.
  - Typically paired with chole, whose legumes and spices change the overall meal profile.
- The only thing I'd revisit is the meaning of caution:processed. If that tag is meant to identify ultra-processed foods, bhatura doesn't fit well. A more specific caution such as deep_fried or refined_grain would communicate the concern more accurately

| ☐ | Thepla | `thepla` | sweet, pungent | heating | V −1 · P +1 · K 0 | allergen:gluten |
- | ☐ | **Thepla** | `thepla` | sweet, pungent | heating | V −1 · P +1 · K 0 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - yogurt

tags:
  - flatbread

notes:
  - Refers to classic methi thepla.
  - Sweeter or less-spiced versions may be slightly more Kapha-promoting.
- 

| ☐ | Missi roti | `missiRoti` | sweet, astringent, pungent | heating | V 0 · P +1 · K −1 | allergen:gluten |
- | ☐ | **Missi roti** | `missiRoti` | sweet, astringent, pungent | heating | V −1 · P +1 · K −1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - yogurt

tags:
  - flatbread
  - legume

notes:
  - Refers to a traditional missi roti made with whole wheat and besan.
  - Versions with substantial onion or green chili are slightly more Pitta-provoking.
- One caveat
    This recommendation assumes a traditional missi roti that contains a meaningful proportion of wheat flour (often around 40–60%) and is served fresh with a little fat. If you were modelling a very high-besan, low-oil version, V0 would be a reasonable alternative because besan's drying quality becomes more prominent.
    Confidence - Moderate to high. The only refinement I'd suggest is V−1 instead of V0. In practice, fresh missi roti is usually eaten hot with some fat, which tends to offset the drying nature of gram flour while preserving its clear Kapha-reducing effect.

| ☐ | Pav | `pav` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten |
- | ☐ | **Pav** | `pav` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - vegetableCurry

tags:
  - bread

notes:
  - Refers to a plain fresh pav.
  - Buttered pav or pav toasted with butter becomes more oily and slightly more Vata-pacifying.
- The only change I'd recommend is V0 instead of V−1. Although fresh pav is soft, it is still a refined, baked bread and generally doesn't provide the same grounding, moist quality as a freshly cooked whole-wheat chapati. This also keeps your bread category internally consistent.


## Western loaves & rolls (10)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Ciabatta | `ciabatta` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
- | ☐ | **Ciabatta** | `ciabatta` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - oliveOil

tags:
  - bread

notes:
  - Refers to fresh plain ciabatta.
  - Toasted ciabatta becomes noticeably drier and may shift toward Vata +1.
- The only refinement I'd add is documenting the guṇas as Heavy + Dry, which reflects the baked crust and chewy texture while recognizing that the high-hydration crumb keeps ciabatta from becoming strongly Vata-aggravating.

| ☐ | Focaccia | `focaccia` | sweet, salty | neutral | V −1 · P 0 · K +1 | allergen:gluten |
- | ☐ | **Focaccia** | `focaccia` | sweet, salty | neutral | V −1 · P 0 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - rosemary

tags:
  - bread

notes:
  - Refers to classic olive oil focaccia.
  - Variants with cheese or cured meats are heavier and may increase Kapha further.
- The only refinement I'd suggest is explicitly classifying focaccia as Heavy + Oily, since its generous olive oil content is its defining energetic characteristic and explains why it is more Vata-pacifying than other baked wheat breads.

| ☐ | Brioche | `brioche` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
- | ☐ | **Brioche** | `brioche` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
- allergens:
  - gluten
  - dairy
  - egg

cautions:
  - high_sugar

balancedBy:
  - berries

tags:
  - bread
  - enriched_bread

notes:
  - Refers to plain brioche.
  - Sweet-filled or chocolate brioche is more Kapha-promoting.
- The only point I'd revisit is whether caution:high_sugar matches your project's threshold. Energetically it's reasonable, but nutritionally plain brioche is often richer in butter and eggs than in sugar. If your caution tags are intended to flag foods with particularly high added sugar, you might instead reserve that tag for sweeter brioche products rather than the base bread.

| ☐ | Cornbread | `cornbread` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten · caution:high_sugar |
- | ☐ | **Cornbread** | `cornbread` | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten | —
- allergens:
  - gluten   # if wheat flour is included

balancedBy:
  - butter

tags:
  - bread

notes:
  - Refers to a traditional cornbread.
  - Gluten-free versions made solely with cornmeal should omit the gluten allergen.
  - Sweetened or honey cornbread may warrant `caution:high_sugar`.
- The most important refinement is Vata +1, reflecting cornbread's characteristic dry, crumbly texture. I also recommend making both the gluten allergen and high_sugar caution conditional, as traditional recipes vary considerably.

| ☐ | English muffin | `englishMuffin` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
- | ☐ | **English muffin** | `englishMuffin` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - butter

tags:
  - bread

notes:
  - Refers to a plain English muffin.
  - Toasting makes it slightly drier and may shift it toward Vata +1.
- The only refinement I'd suggest is explicitly classifying English muffins as Light + Dry, reflecting their airy, griddled texture and common use as a toasted bread while keeping them distinct from both soft rolls and crisp toast.

| ☐ | Crumpet | `crumpet` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten |
- | ☐ | **Crumpet** | `crumpet` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - butter

tags:
  - bread

notes:
  - Refers to a plain crumpet.
  - Well-toasted crumpets become drier and may shift toward Vata +1.
- The only substantive refinement I'd recommend is V0. Although a fresh crumpet is soft and moist, its typical preparation and consumption (split, toasted, often with a crisp exterior) make it less consistently Vata-pacifying than fresh flatbreads or enriched breads.

| ☐ | Breadstick / grissini | `breadstick` | sweet | neutral | V +1 · P 0 · K 0 | allergen:gluten |
- | ☐ | **Breadstick / grissini** | `breadstick` | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - oliveOil

tags:
  - bread
  - cracker

notes:
  - Refers to plain Italian grissini.
  - Seeded or cheese-coated versions are more Kapha-promoting.
- The only refinement I'd recommend is Kapha +1, because despite their dryness, breadsticks are still refined wheat breads and fit well with the rest of your grain products as mildly Kapha-promoting.

| ☐ | Pumpernickel | `pumpernickel` | sweet, sour | neutral | V 0 · P +1 · K +1 | allergen:gluten |
- | ☐ | **Pumpernickel** | `pumpernickel` | sweet, sour | neutral | V −1 · P +1 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - cucumber

tags:
  - bread
  - sourdough
  - whole_grain

notes:
  - Refers to traditional pumpernickel made with rye and sourdough.
  - Lighter commercial rye breads may be somewhat drier and closer to V0.

| ☐ | Flatbread (generic) | `flatbread` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
- | ☐ | **Flatbread (generic)** | `flatbread` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten | 
- allergens:
  - gluten

tags:
  - bread

notes:
  - Generic placeholder entry.
  - Use specific entries (chapati, naan, pita, lavash, tortilla, thepla, etc.) whenever possible for more accurate energetics.
- 

| ☐ | Corn tortilla | `cornTortilla` | sweet | neutral | V 0 · P 0 · K +1 | (gluten-free) |
- | ☐ | **Corn tortilla** | `cornTortilla` | sweet | neutral | V +1 · P 0 · K +1 | (gluten-free) |
- balancedBy:
  - avocado

tags:
  - flatbread
  - gluten_free

notes:
  - Refers to a traditional corn tortilla.
  - Fresh tortillas are less drying than packaged tortillas but remain lighter than wheat flatbreads.
- The main refinement I'd recommend is Vata +1. Traditional corn tortillas are thinner, drier, and less oily than most wheat flatbreads, making them mildly Vata-aggravating while remaining neutral for Pitta and mildly Kapha-promoting.


---

## Open questions

- **Roti dosha.** I set plain roti to a mild `K +1` (whole-wheat staple, no oil). Some would argue a plain phulka is close to neutral (V0 P0 K0) since it's so light/digestible — flag if you'd prefer neutral.
- **Cornbread / cornbread gluten.** Cornbread is usually a corn+wheat bake → tagged gluten. Pure-cornmeal versions are gluten-free — flag if you want the gluten-free form as the default.
- **Breadstick Vata.** Tagged `V +1` (dry, crisp, light). If you read grissini as too minor to move Vata, I can set V 0.

## Notes / corrections

_(add feedback per item here)_
