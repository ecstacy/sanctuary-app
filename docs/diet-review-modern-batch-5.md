# Modern-diet review batch 5 (46 entries) — pantry, Japanese, coffee, condiments & recipes

_All rows are `reviewStatus: 'draft'` — invisible to the app until fact-checked and flipped to `reviewed` (add the id to `REVIEWED_SIGNED_OFF` in `dietSafety.test.js`). Source: property-derived (`modern`, `confidence: medium`). Sign convention: doshaEffect −1 pacifies / +1 aggravates._

**What this batch is:** the follow-up to batch 4 — more everyday pantry & groceries, a Japanese set, coffee types, condiments, and more world recipes. Composite dishes are one row each (dosha derived from typical constituents, in each `source.note` in `ingredients-modern-draft-5.js`).

**How to review:** tick ✅ if it looks right, or note a correction under/next to the row (freeform, same as batches 3–4 — I'll apply your edits and flip the flags). Full derivations (guṇa, why, allergen reasoning) live in each entry's `source.note`.

## Pantry & groceries (12)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Farro | `farro` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |

- | ☐ | **Farro** | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - oliveOil

tags:
  - grain
  - whole_grain

notes:
  - Refers to cooked farro.
  - Applies broadly whether the product is emmer, einkorn, or spelt sold as farro.

- 
| ☐ | Cornstarch | `cornstarch` | sweet | cooling | V 0 · P 0 · K +1 | — |
| ☐ | Breadcrumbs / panko | `breadcrumbs` | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten · caution:processed |
| ☐ | Rice flour | `riceFlour` | sweet | cooling | V 0 · P 0 · K +1 | — |
| ☐ | Coconut flour | `coconutFlour` | sweet | cooling | V 0 · P −1 · K 0 | — |
| ☐ | Cashew butter | `cashewButter` | sweet | heating | V −1 · P +1 · K +1 | allergen:nuts |
| ☐ | Cocoa powder | `cocoaPowder` | bitter, astringent | heating | V +1 · P +1 · K −1 | caution:caffeine |
| ☐ | Dried cranberries | `driedCranberries` | sweet, sour | heating | V −1 · P +1 · K 0 | caution:high_sugar |
| ☐ | Vermicelli / sevai | `vermicelli` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten (rice vermicelli = none) |
| ☐ | Tapioca / sabudana | `tapioca` | sweet | cooling | V −1 · P 0 · K +1 | — |
| ☐ | Rice paper | `ricePaper` | sweet | neutral | V 0 · P 0 · K 0 | — |
| ☐ | Graham cracker | `grahamCracker` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten · caution:high_sugar, processed |

## Japanese (10)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Udon | `udon` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten |
| ☐ | Soba | `soba` | sweet, astringent | neutral | V +1 · P 0 · K −1 | (gluten if wheat-blended) |
| ☐ | Tempura | `tempura` | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten (+shellfish for prawn) |
| ☐ | Teriyaki chicken | `teriyakiChicken` | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:soy, gluten |
| ☐ | Tonkatsu / katsu | `tonkatsu` | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten · tag pork/chicken |
| ☐ | Mochi | `mochi` | sweet | cooling | V −1 · P 0 · K +1 | caution:high_sugar |
| ☐ | Sake | `sake` | sweet, pungent | heating | V +1 · P +1 · K −1 | tag:alcohol |
| ☐ | Wasabi | `wasabi` | pungent | heating | V +1 · P +1 · K −1 | — |
| ☐ | Matcha latte | `matchaLatte` | bitter, sweet | neutral | V −1 · P 0 · K +1 | allergen:dairy · caution:caffeine |
| ☐ | Onigiri | `onigiri` | sweet, salty | neutral | V −1 · P 0 · K +1 | (+fish for salmon/tuna) |

## Coffee types (7)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Espresso | `espresso` | bitter | heating | V +1 · P +1 · K −1 | caution:caffeine |
| ☐ | Americano | `americano` | bitter | heating | V +1 · P +1 · K −1 | caution:caffeine |
| ☐ | Mocha | `mocha` | bitter, sweet | heating | V 0 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |
| ☐ | Macchiato | `macchiato` | bitter | heating | V +1 · P +1 · K 0 | allergen:dairy · caution:caffeine |
| ☐ | Cortado | `cortado` | bitter, sweet | heating | V 0 · P +1 · K +1 | allergen:dairy · caution:caffeine |
| ☐ | Affogato | `affogato` | sweet, bitter | heating | V 0 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |
| ☐ | Frappé | `frappe` | sweet, bitter | heating | V +1 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |

_Note: `latte` and `icedCoffee` already exist (batch 4); `cappuccino`/`flat white` are aliases of `latte`._

## Condiments (9)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Aioli / garlic mayo | `aioli` | pungent, sour | heating | V −1 · P +1 · K +1 | allergen:egg |
| ☐ | Ranch dressing | `ranchDressing` | sour, salty | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sodium |
| ☐ | Hoisin sauce | `hoisinSauce` | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:soy · caution:high_sodium, high_sugar |
| ☐ | Oyster sauce | `oysterSauce` | salty, sweet | heating | V −1 · P +1 · K 0 | allergen:shellfish · caution:high_sodium |
| ☐ | Harissa | `harissa` | pungent, sour | heating | V +1 · P +1 · K −1 | tag:nightshade |
| ☐ | Chimichurri | `chimichurri` | pungent, sour | heating | V 0 · P +1 · K −1 | — |
| ☐ | Relish | `relish` | sour, sweet, salty | heating | V 0 · P +1 · K 0 | caution:high_sodium, high_sugar |
| ☐ | Tartar sauce | `tartarSauce` | sour, salty | heating | V −1 · P +1 · K +1 | allergen:egg |
| ☐ | Honey mustard | `honeyMustard` | sweet, pungent | heating | V 0 · P +1 · K 0 | caution:high_sugar |

## More world recipes (8)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Shakshuka | `shakshuka` | sour, salty, pungent | heating | V 0 · P +1 · K 0 | allergen:egg · tag:nightshade |
| ☐ | Poke bowl | `pokeBowl` | salty, sweet | neutral | V 0 · P 0 · K 0 | allergen:fish, soy |
| ☐ | Bánh mì | `banhMi` | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:processed |
| ☐ | Katsu curry | `katsuCurry` | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten |
| ☐ | Buddha bowl | `buddhaBowl` | sweet, astringent | neutral | V −1 · P −1 · K 0 | (+sesame for tahini dressing) |
| ☐ | French toast | `frenchToast` | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
| ☐ | Scone | `scone` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten, dairy · caution:high_sugar |
| ☐ | Minestrone | `minestrone` | sweet, astringent | heating | V 0 · P −1 · K −1 | allergen:gluten · tag:nightshade |

---

## Open questions

- **Vermicelli / soba gluten.** `vermicelli` (wheat sevai vs rice) and `soba` (pure buckwheat vs wheat-blended) both vary by product — I tagged the common wheat form as gluten; flag if you'd rather the rice/buckwheat (gluten-free) form be the default.
- **Meat tagging.** `teriyakiChicken`, `tonkatsu`, `katsuCurry`, `banhMi` — meat is implied but not tagged as a diet tag by default (poultry/pork). Add product-specific tags if you'd prefer them tagged.
- **Onigiri / poke fish.** `onigiri` is tagged fish only in the note (fillings vary); `pokeBowl` carries `allergen:fish` by default since raw fish is intrinsic. Flag if you want onigiri to carry fish by default too.

## Notes / corrections

_(add feedback per item here)_
