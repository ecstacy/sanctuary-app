# Modern-diet review batch 6 (16 entries) — bread depth

_All rows are `reviewStatus: 'draft'` — invisible to the app until fact-checked and flipped to `reviewed` (add the id to `REVIEWED_SIGNED_OFF` in `dietSafety.test.js`). Source: property-derived (`modern`, `confidence: medium`). Sign convention: doshaEffect −1 pacifies / +1 aggravates._

**Why this batch:** "bread" was thin — white / rye / sourdough / whole-wheat + a few dishes, but **no roti/chapati** (a staple for this audience) and none of the everyday Western loaves. Filling these lets the meal-check search **recommend the exact bread** the user ate instead of collapsing everything to "white bread" — the difference between a trusted verdict and a rough guess.

**Already reviewed (don't re-add):** whiteBread, ryeBread, sourdoughBread, wholeWheatBread, breadRoll, pita, naan, baguette, pretzel, garlicBread, bagel, croissant, breadcrumbs.

**How to review:** tick ✅ or note a correction next to the row (same as batches 3–5). Full derivations live in each entry's `source.note` in `ingredients-modern-draft-6.js`.

## Indian flatbreads (6)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Roti / chapati | `roti` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
| ☐ | Tandoori roti | `tandooriRoti` | sweet | heating | V 0 · P 0 · K +1 | allergen:gluten |
| ☐ | Bhatura | `bhatura` | sweet, sour | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:processed |
| ☐ | Thepla | `thepla` | sweet, pungent | heating | V −1 · P +1 · K 0 | allergen:gluten |
| ☐ | Missi roti | `missiRoti` | sweet, astringent, pungent | heating | V 0 · P +1 · K −1 | allergen:gluten |
| ☐ | Pav | `pav` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten |

## Western loaves & rolls (10)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Ciabatta | `ciabatta` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
| ☐ | Focaccia | `focaccia` | sweet, salty | neutral | V −1 · P 0 · K +1 | allergen:gluten |
| ☐ | Brioche | `brioche` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
| ☐ | Cornbread | `cornbread` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten · caution:high_sugar |
| ☐ | English muffin | `englishMuffin` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
| ☐ | Crumpet | `crumpet` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten |
| ☐ | Breadstick / grissini | `breadstick` | sweet | neutral | V +1 · P 0 · K 0 | allergen:gluten |
| ☐ | Pumpernickel | `pumpernickel` | sweet, sour | neutral | V 0 · P +1 · K +1 | allergen:gluten |
| ☐ | Flatbread (generic) | `flatbread` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
| ☐ | Corn tortilla | `cornTortilla` | sweet | neutral | V 0 · P 0 · K +1 | (gluten-free) |

---

## Open questions

- **Roti dosha.** I set plain roti to a mild `K +1` (whole-wheat staple, no oil). Some would argue a plain phulka is close to neutral (V0 P0 K0) since it's so light/digestible — flag if you'd prefer neutral.
- **Cornbread / cornbread gluten.** Cornbread is usually a corn+wheat bake → tagged gluten. Pure-cornmeal versions are gluten-free — flag if you want the gluten-free form as the default.
- **Breadstick Vata.** Tagged `V +1` (dry, crisp, light). If you read grissini as too minor to move Vata, I can set V 0.

## Notes / corrections

_(add feedback per item here)_
