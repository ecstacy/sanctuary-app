# Modern-diet review batch 3 (50 entries) — eating out & store snacks

_All rows are `reviewStatus: 'draft'` — invisible to the app until fact-checked and flipped to `reviewed` (add the id to `REVIEWED_SIGNED_OFF` in `dietSafety.test.js`). Source: property-derived (`modern`, `confidence: medium`). Sign convention: doshaEffect −1 pacifies / +1 aggravates._

**What this batch is:** the meals people ORDER OUT and the snacks they BUY — composite dishes modelled as one row each (same precedent as hummus / pesto / ketchup / instant noodles / fries). The doshaEffect is DERIVED from typical constituents (listed in each `source.note`). Recipes vary by restaurant/brand, so these are directional reads of a "standard" version.

**How to review:** tick ✅ if it looks right, or note a correction under the row (freeform, same as batches 1–2 — I'll apply your edits and flip the flags). Composite dishes are judged as the WHOLE plate, so a rich sauce or deep-fry usually dominates a lighter base.

## Eating out — restaurant & takeaway (30)

| ✔ | Dish | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Pizza** (margherita) | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy |
| ☐ | **Cheeseburger** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy · tag:beef |
| ☐ | **Sushi** | sweet, salty, sour | cooling | V 0 · P 0 · K +1 | allergen:fish, soy |
| ☐ | **Ramen** (restaurant) | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten, soy · caution:high_sodium |
| ☐ | **Pad thai** | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:peanuts, fish, egg |
| ☐ | **Fried rice** | salty, sweet | heating | V 0 · P +1 · K +1 | allergen:soy, egg |
| ☐ | **Spring roll** (fried) | salty, sweet | heating | V 0 · P +1 · K +1 | allergen:gluten |
| ☐ | **Dumplings** (steamed) | sweet, salty | heating | V −1 · P 0 · K +1 | allergen:gluten, soy |
| ☐ | **Tacos** | salty, pungent, sweet | heating | V 0 · P +1 · K +1 | tag:nightshade |
| ☐ | **Burrito** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy |
| ☐ | **Quesadilla** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy |
| ☐ | **Nachos** | salty | heating | V +1 · P +1 · K +1 | allergen:dairy · tag:nightshade · caution:high_sodium |
| ☐ | **Falafel** | astringent, pungent | heating | V 0 · P +1 · K +1 | — |
| ☐ | **Shawarma / doner** | salty, pungent | heating | V −1 · P +1 · K +1 | allergen:gluten |
| ☐ | **Butter chicken** | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:dairy |
| ☐ | **Tikka masala** | sweet, sour, pungent | heating | V −1 · P +1 · K +1 | allergen:dairy |
| ☐ | **Biryani** | sweet, pungent, salty | heating | V −1 · P +1 · K +1 | — |
| ☐ | **Samosa** | salty, pungent | heating | V 0 · P +1 · K +1 | allergen:gluten · tag:nightshade |
| ☐ | **Pakora / bhaji** | astringent, pungent | heating | V 0 · P +1 · K +1 | — |
| ☐ | **Pho** | salty, sweet | heating | V −1 · P 0 · K 0 | caution:high_sodium |
| ☐ | **Fish and chips** | salty | heating | V −1 · P +1 · K +1 | allergen:fish, gluten · tag:nightshade · caution:high_sodium |
| ☐ | **Fried chicken** | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten |
| ☐ | **Chicken wings** | salty, pungent, sweet | heating | V −1 · P +1 · K +1 | — |
| ☐ | **Caesar salad** | salty, sour | heating | V −1 · P +1 · K +1 | allergen:dairy, egg, fish, gluten |
| ☐ | **Club sandwich / BLT** | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten, egg, dairy |
| ☐ | **Lasagna** | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy |
| ☐ | **Mac and cheese** | sweet, salty | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy |
| ☐ | **Risotto** | sweet, salty | heating | V −1 · P 0 · K +1 | allergen:dairy |
| ☐ | **Pancakes** | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg |
| ☐ | **Waffles** | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg |

## Store snacks — packaged & grab-and-go (20)

| ✔ | Snack | rasa | vīrya | doshaEffect | flags |
|---|-------|------|-------|-------------|-------|
| ☐ | **Protein bar** | sweet | neutral | V 0 · P 0 · K +1 | caution:processed |
| ☐ | **Granola bar** | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten, nuts · caution:high_sugar |
| ☐ | **Chocolate bar** (filled) | sweet | heating | V −1 · P +1 · K +1 | allergen:dairy, nuts · caution:high_sugar |
| ☐ | **Gummy candy** | sweet, sour | heating | V −1 · P +1 · K +1 | caution:high_sugar (gelatin — non-veg) |
| ☐ | **Pretzels** | salty, sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten · caution:high_sodium |
| ☐ | **Tortilla chips** | salty | heating | V +1 · P +1 · K +1 | caution:high_sodium |
| ☐ | **Cheese puffs** | salty, sweet | heating | V +1 · P +1 · K +1 | allergen:dairy · caution:processed, high_sodium |
| ☐ | **Trail mix** | sweet, astringent | heating | V −1 · P +1 · K +1 | allergen:nuts |
| ☐ | **Dried apricots** | sweet, sour | neutral | V 0 · P 0 · K +1 | — |
| ☐ | **Fruit leather** | sweet, sour | neutral | V 0 · P +1 · K +1 | caution:high_sugar |
| ☐ | **Flapjack (oat bar)** | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten · caution:high_sugar |
| ☐ | **Biscuits** (digestive) | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten, dairy |
| ☐ | **Chocolate chip cookie** | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
| ☐ | **Donut** | sweet | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy · caution:high_sugar |
| ☐ | **Muffin** | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
| ☐ | **Ice cream bar** | sweet | cooling | V −1 · P −1 · K +1 | allergen:dairy, nuts, soy |
| ☐ | **Drinkable yoghurt** | sweet, sour | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sugar |
| ☐ | **Marshmallow** | sweet | cooling | V 0 · P 0 · K +1 | caution:high_sugar (gelatin — non-veg) |
| ☐ | **Beef jerky** | salty, sweet | heating | V 0 · P +1 · K 0 | tag:beef · caution:high_sodium, processed |
| ☐ | **Mixed nuts** (salted) | sweet, astringent, salty | heating | V −1 · P +1 · K +1 | allergen:nuts · caution:high_sodium |

---

## Open questions for review

- **Meal-vs-snack line.** A few restaurant rows (biryani, burrito) are basically full meals — fine as ingredients (a user logs "I had biryani"), but flag if you'd rather they be meal *templates* instead.
- **Gelatin.** Gummy candy and marshmallow usually contain gelatin (non-vegetarian). There's no `gelatin` dietTag yet — noted in prose only. Want a real tag so veg diets exclude them?
- **Variability.** These are "standard" versions. Where a dish swings hard by preparation (steamed vs fried dumplings, veg vs meat burrito), say if you'd like it split into two rows.

## Notes / corrections

_(add feedback per item here)_
