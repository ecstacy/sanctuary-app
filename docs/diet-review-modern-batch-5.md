# Modern-diet review batch 5 (46 entries) — pantry, Japanese, coffee, condiments & recipes

> **✅ APPLIED & LIVE — 2026-08-24.** All reviewer corrections (dosha/rasa/vīrya/guṇa/allergen/caution) applied to `ingredients-modern-draft-5.js`; all 46 entries flipped `draft → reviewed` and added to `REVIEWED_SIGNED_OFF`. **One exception:** the `tag:poultry` (teriyakiChicken) and `tag:pork` (tonkatsu) additions were **not** applied — `poultry` is not a recognised dietTag, and every other composite meat dish in the dataset (butterChicken, friedChicken, hotDog…) carries **no** meat marker. Tagging two rows would fail validation and be inconsistent. The meat-exclusion gap for composite `other`-category dishes is a **separate systematic task** (add a POULTRY tag + wire vegetarian/pescatarian exclusion + tag *all* such dishes), not a per-row fix here.

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

- The only refinement I'd recommend is Vata −1. Like spelt, farro is a cooked, nourishing whole grain whose moist, substantial nature makes it more Vata-pacifying than neutral while remaining neutral for Pitta and mildly Kapha-promoting.

| ☐ | Cornstarch | `cornstarch` | sweet | cooling | V 0 · P 0 · K +1 | — |
- | ☐ | **Cornstarch** | sweet | cooling | V +1 · P −1 · K +1 | — |
- balancedBy:
  - ghee

tags:
  - starch
  - thickener

notes:
  - Refers to pure cornstarch used as a culinary thickener.
  - Finished dishes thickened with cornstarch should be classified by the overall recipe rather than by the starch alone.
- Cornstarch is an ingredient rather than a standalone food, so Ayurvedic classifications are less explicit. Based on its refined, cooling, and absorbent nature, V+1 · P−1 · K+1 is the most consistent default.

| ☐ | Breadcrumbs / panko | `breadcrumbs` | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten · caution:processed |
- | ☐ | **Breadcrumbs / panko** | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten · caution:processed |
- allergens:
  - gluten

cautions:
  - processed

balancedBy:
  - oliveOil

tags:
  - pantry
  - coating

notes:
  - Refers to plain breadcrumbs or Japanese-style panko.
  - Fried breadcrumb-coated foods should be classified by the finished dish rather than the breadcrumbs alone.

- The only refinement I'd suggest is explicitly classifying breadcrumbs as Light + Dry, reflecting their dehydrated, refined nature and distinguishing them from fresh bread or cooked grain products.

| ☐ | Rice flour | `riceFlour` | sweet | cooling | V 0 · P 0 · K +1 | — |

- | ☐ | **Rice flour** | sweet | cooling | V +1 · P −1 · K +1 | — |
- balancedBy:
  - ghee

tags:
  - flour
  - gluten_free

notes:
  - Refers to plain rice flour.
  - Finished foods made with rice flour should be classified according to the complete recipe.

- For consistency with other flours and starches in your taxonomy, V+1 · P−1 · K+1 is the most coherent default.

| ☐ | Coconut flour | `coconutFlour` | sweet | cooling | V 0 · P −1 · K 0 | — |
- | ☐ | **Coconut flour** | sweet | cooling | V +1 · P −1 · K 0 | — |
- balancedBy:
  - ghee

tags:
  - flour
  - gluten_free

notes:
  - Refers to defatted coconut flour.
  - Finished baked goods should be classified according to the complete recipe rather than the flour alone.
- The main refinement I'd recommend is Vata +1. Coconut flour behaves much more like a dry, absorbent flour than like fresh coconut, so its drying quality outweighs the Vata-pacifying nature associated with whole coconut while still retaining its cooling effect.

| ☐ | Cashew butter | `cashewButter` | sweet | heating | V −1 · P +1 · K +1 | allergen:nuts |
- | ☐ | **Cashew butter** | sweet | neutral | V −1 · P 0 · K +1 | allergen:nuts |
- allergens:
  - nuts

balancedBy:
  - cinnamon

tags:
  - nut_butter

notes:
  - Refers to plain cashew butter without added sugar or oils.
  - Sweetened or chocolate-flavored varieties should be classified separately.
- The main refinement I'd recommend is Neutral virya with Pitta 0. A plain cashew butter is fundamentally a rich, nourishing nut paste, and its mild roasting is generally not enough to classify it as distinctly heating in the way spices or chili-based foods are.

| ☐ | Cocoa powder | `cocoaPowder` | bitter, astringent | heating | V +1 · P +1 · K −1 | caution:caffeine |
- | ☐ | **Cocoa powder** | bitter, astringent | heating | V +1 · P +1 · K −1 | caution:caffeine |
- cautions:
  - caffeine

balancedBy:
  - milk

tags:
  - baking
  - ingredient

notes:
  - Refers to unsweetened cocoa powder.
  - Dutch-process cocoa is somewhat less acidic but has a similar overall energetic profile.
- The only refinement I'd suggest is explicitly classifying cocoa powder as Light + Dry, reflecting its defatted, tannin-rich nature and keeping it clearly distinct from chocolate products made with added fat and sugar.

| ☐ | Dried cranberries | `driedCranberries` | sweet, sour | heating | V −1 · P +1 · K 0 | caution:high_sugar |
- | ☐ | **Dried cranberries** | sweet, sour | heating | V 0 · P +1 · K +1 | caution:high_sugar |
- cautions:
  - high_sugar

balancedBy:
  - walnuts

tags:
  - dried_fruit

notes:
  - Refers to commercially sweetened dried cranberries.
  - Unsweetened dried cranberries would be drier, less Kapha-promoting, and somewhat more Vata-aggravating.
- The biggest refinement I'd recommend is V0 · P+1 · K+1. Because your entry explicitly represents the common sweetened dried cranberries (high_sugar), the added sugar makes them more Kapha-promoting, while the dehydration offsets much of the Vata-pacifying effect found in fresh fruit.

| ☐ | Vermicelli / sevai | `vermicelli` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten (rice vermicelli = none) |
- | ☐ | **Vermicelli / sevai** | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten (rice vermicelli = none) |
- allergens:
  - gluten   # omit for rice vermicelli

balancedBy:
  - ghee

tags:
  - noodles

notes:
  - Refers to plain cooked vermicelli.
  - Wheat vermicelli contains gluten; rice vermicelli does not.
  - Fried vermicelli dishes should be classified by the finished recipe.
- If you keep a single generic vermicelli entry, your current dosha profile is a sensible compromise. The only refinement I'd suggest is explicitly classifying it as Light + Dry, reflecting the refined, noodle-like nature of vermicelli while acknowledging that boiling offsets some of its drying tendency. If you later split wheat vermicelli and rice vermicelli into separate entries, their dosha profiles can be made more specific.

| ☐ | Tapioca / sabudana | `tapioca` | sweet | cooling | V −1 · P 0 · K +1 | — |
- | ☐ | Tapioca / sabudana | `tapioca` | sweet | cooling | V −1 · P 0 · K +1 | — |
- balancedBy:
  - cumin

tags:
  - starch
  - gluten_free

notes:
  - Refers to cooked tapioca pearls (sabudana).
  - Tapioca flour/starch should be modelled separately because it behaves as a dry ingredient rather than a cooked food.
- The only refinement I'd suggest is Pitta −1. Cooked tapioca (sabudana) is a cooling, bland, and soothing starch, making it mildly Pitta-pacifying while remaining nourishing for Vata and Kapha-promoting because of its refined carbohydrate content.

| ☐ | Rice paper | `ricePaper` | sweet | neutral | V 0 · P 0 · K 0 | — |
- | ☐ | **Rice paper** | sweet | neutral | V +1 · P 0 · K 0 | — |
- balancedBy:
  - sesameOil

tags:
  - wrapper
  - gluten_free

notes:
  - Refers to plain rice paper wrappers.
  - Finished dishes (e.g. fresh spring rolls or fried rolls) should be classified according to the overall recipe.
- The main refinement I'd recommend is Vata +1. Rice paper is a refined, lightweight wrapper that offers little moisture or oil on its own, making it slightly more Vata-aggravating than neutral. Its effect in a finished dish, however, is usually dominated by the fillings rather than the wrapper itself.

| ☐ | Graham cracker | `grahamCracker` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten · caution:high_sugar, processed |
- | ☐ | **Graham cracker** | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten · caution:high_sugar, processed |
- allergens:
  - gluten

cautions:
  - high_sugar
  - processed

balancedBy:
  - nutButter

tags:
  - cracker
  - snack

notes:
  - Refers to plain graham crackers.
  - Chocolate-coated or filled varieties should be classified separately.
- The main refinement I'd recommend is Vata +1. While the sweet taste is somewhat grounding, the dry, crisp, baked nature of graham crackers is the stronger energetic influence, making them more consistent with other crackers and dry biscuits than with moist grain foods.


## Japanese (10)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Udon | `udon` | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten |
- | ☐ | **Udon** | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - ginger

tags:
  - noodles

notes:
  - Refers to plain cooked udon noodles.
  - Complete dishes such as curry udon or tempura udon should be classified by the overall recipe.
- The only refinement I'd suggest is explicitly classifying udon as Heavy + Moist, reflecting its soft, cooked nature and keeping it consistent with other boiled wheat noodle dishes.

| ☐ | Soba | `soba` | sweet, astringent | neutral | V +1 · P 0 · K −1 | (gluten if wheat-blended) |
- | ☐ | **Soba** | sweet, astringent | neutral | V 0 · P 0 · K −1 | allergen:gluten (if wheat-blended) |
- allergens:
  - gluten   # only for wheat-blended soba

balancedBy:
  - sesameOil

tags:
  - noodles

notes:
  - Refers to plain cooked soba noodles.
  - Pure buckwheat (juwari) soba is gluten-free.
  - Most commercial soba contains wheat and therefore gluten.
- The only refinement I'd recommend is Vata 0. While buckwheat itself is drying and astringent, soba is consumed as cooked noodles, and that preparation offsets much of the Vata-aggravating effect while preserving its lighter, Kapha-reducing character.

| ☐ | Tempura | `tempura` | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten (+shellfish for prawn) |
- | ☐ | **Tempura** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten (+shellfish for prawn) |
- allergens:
  - gluten
  # add shellfish for prawn tempura

balancedBy:
  - daikon

tags:
  - fried
  - japanese

notes:
  - Refers to classic tempura with wheat batter.
  - The filling (vegetable, fish, shrimp, etc.) may add additional allergens or tags.
- The only refinement I'd suggest is explicitly classifying tempura as Heavy + Oily, reflecting that the deep-frying process is the dominant Ayurvedic influence regardless of the specific ingredient being battered.

| ☐ | Teriyaki chicken | `teriyakiChicken` | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:soy, gluten |
- | ☐ | **Teriyaki chicken** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:soy, gluten |
- allergens:
  - soy
  - gluten

balancedBy:
  - steamedBroccoli

tags:
  - poultry
  - japanese

notes:
  - Refers to a standard soy-based teriyaki chicken.
  - Gluten-free teriyaki made with tamari should omit the gluten allergen.
- The only refinement I'd suggest is explicitly classifying teriyaki chicken as Heavy + Oily, reflecting its cooked meat, sweet glaze, and moderate oil content while keeping it consistent with similar sauced meat dishes.

| ☐ | Tonkatsu / katsu | `tonkatsu` | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten · tag pork/chicken |
- | ☐ | **Tonkatsu / katsu** | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - shreddedCabbage

tags:
  - fried
  - japanese

notes:
  - Refers to the prepared katsu dish.
  - Add `pork` for tonkatsu or `chicken` for chicken katsu when the specific meat is known.
- The only refinement I'd make is editorial: keep the generic "katsu" entry free of a meat tag, or apply pork or chicken only when the specific protein is identified. This is consistent with the tagging policy you've used elsewhere in your database.

| ☐ | Mochi | `mochi` | sweet | cooling | V −1 · P 0 · K +1 | caution:high_sugar |
- | ☐ | **Mochi** | sweet | cooling | V −1 · P 0 · K +1 | — |
- allergens: []

balancedBy:
  - greenTea

tags:
  - rice
  - dessert

notes:
  - Refers to plain mochi made from glutinous rice.
  - Sweet-filled mochi (e.g. red bean or ice cream mochi) should include `caution:high_sugar`.
- The only substantive refinement I'd recommend is making the high_sugar caution conditional on the variety rather than applying it to plain mochi by default. Plain mochi is primarily a starchy rice cake, not an inherently high-sugar food.

| ☐ | Sake | `sake` | sweet, pungent | heating | V +1 · P +1 · K −1 | tag:alcohol |
- | ☐ | **Sake** | sweet, pungent | heating | V +1 · P +1 · K −1 | tag:alcohol |
- tags:
  - alcohol
  - fermented

balancedBy:
  - water

notes:
  - Refers to traditional Japanese sake.
  - Serving temperature (chilled or warm) does not materially change its underlying energetic profile.
- The only refinement I'd suggest is explicitly classifying sake as Light + Dry, reflecting the dehydrating and stimulating qualities common to alcoholic beverages while distinguishing it from heavier grain-based foods.

| ☐ | Wasabi | `wasabi` | pungent | heating | V +1 · P +1 · K −1 | — |
- | ☐ | **Wasabi** | pungent | heating | V 0 · P +1 · K −1 | — |
- balancedBy:
  - rice

tags:
  - condiment

notes:
  - Refers to true wasabi or standard prepared wasabi paste.
  - Most commercial wasabi paste contains horseradish and mustard, but the overall energetic profile remains similar.
- The main refinement I'd recommend is Vata 0. Compared with chili peppers, wasabi's warming quality is more balanced by its aromatic, short-lived pungency, making it less likely to aggravate Vata while still increasing Pitta and reducing Kapha.

| ☐ | Matcha latte | `matchaLatte` | bitter, sweet | neutral | V −1 · P 0 · K +1 | allergen:dairy · caution:caffeine |
- | ☐ | **Matcha latte** | bitter, sweet | neutral | V −1 · P 0 · K +1 | allergen:dairy · caution:caffeine |
- allergens:
  - dairy

cautions:
  - caffeine

balancedBy:
  - cinnamon

tags:
  - beverage
  - tea

notes:
  - Refers to a classic dairy matcha latte.
  - Plant-based versions may differ slightly depending on the milk used.
  - Extra matcha or added syrups may shift the energetic balance.
- The only refinement I'd suggest is explicitly classifying a matcha latte as Heavy + Moist, reflecting the dominant influence of the milk, which softens the stimulating qualities of matcha and makes the drink much more nourishing than plain matcha tea.

| ☐ | Onigiri | `onigiri` | sweet, salty | neutral | V −1 · P 0 · K +1 | (+fish for salmon/tuna) |
- | ☐ | **Onigiri** | sweet, salty | neutral | V −1 · P 0 · K +1 | — |
- balancedBy:
  - pickledPlum

tags:
  - rice
  - japanese

notes:
  - Refers to a plain rice onigiri.
  - Apply additional tags or allergens based on the filling (e.g. `fish` for salmon or tuna, `soy` for seasoned tofu).
- The only refinement I'd recommend is editorial: model onigiri as the rice base, then let the filling determine any additional allergens or dietary tags. This keeps the database more consistent and scalable as you add more onigiri varieties.


## Coffee types (7)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Espresso | `espresso` | bitter | heating | V +1 · P +1 · K −1 | caution:caffeine |
- | ☐ | **Espresso** | bitter | heating | V +1 · P +1 · K −1 | caution:caffeine |
- cautions:
  - caffeine

balancedBy:
  - milk

tags:
  - beverage
  - coffee

notes:
  - Refers to plain espresso with no milk or sugar.
  - Milk-based drinks such as lattes and cappuccinos have a different energetic profile.
- The only refinement I'd suggest is explicitly classifying espresso as Light + Dry, reflecting its concentrated, dehydrating, and stimulating nature, and keeping it distinct from milk-based coffee beverages.

| ☐ | Americano | `americano` | bitter | heating | V +1 · P +1 · K −1 | caution:caffeine |
- | ☐ | **Americano** | bitter | heating | V +1 · P +1 · K −1 | caution:caffeine |
- cautions:
  - caffeine

balancedBy:
  - milk

tags:
  - beverage
  - coffee

notes:
  - Refers to a plain Americano with no milk or sugar.
  - Adding milk shifts the profile toward Vata-pacifying and Kapha-promoting.
- An Americano is energetically very close to espresso—the additional hot water reduces concentration but doesn't meaningfully alter its bitter, heating, drying, and stimulating Ayurvedic profile.

| ☐ | Mocha | `mocha` | bitter, sweet | heating | V 0 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |
- | ☐ | **Mocha** | bitter, sweet | heating | V −1 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |
- allergens:
  - dairy

cautions:
  - caffeine
  - high_sugar

balancedBy:
  - cinnamon

tags:
  - beverage
  - coffee

notes:
  - Refers to a classic dairy mocha.
  - Dark chocolate or less-sweet versions are slightly less Kapha-promoting but have the same overall dosha direction.
- The only substantive refinement I'd recommend is Vata −1. In a typical café mocha, the large amount of steamed milk and added sweetness more than compensate for the drying qualities of coffee and cocoa, making it overall more Vata-pacifying while still increasing both Pitta and Kapha.


| ☐ | Macchiato | `macchiato` | bitter | heating | V +1 · P +1 · K 0 | allergen:dairy · caution:caffeine |
- | ☐ | **Macchiato** | bitter | heating | V +1 · P +1 · K −1 | allergen:dairy · caution:caffeine |
- allergens:
  - dairy

cautions:
  - caffeine

balancedBy:
  - water

tags:
  - beverage
  - coffee

notes:
  - Refers to a traditional espresso macchiato.
  - A latte macchiato has substantially more milk and should be classified closer to a latte.
- The main refinement I'd recommend is Kapha −1 instead of 0. A traditional macchiato contains only a small amount of milk, so its energetics remain much closer to espresso than to milk-based coffee drinks. The espresso still dominates the overall doshic effect.


| ☐ | Cortado | `cortado` | bitter, sweet | heating | V 0 · P +1 · K +1 | allergen:dairy · caution:caffeine |
- | ☐ | **Cortado** | bitter, sweet | heating | V −1 · P +1 · K +1 | allergen:dairy · caution:caffeine |
- allergens:
  - dairy

cautions:
  - caffeine

balancedBy:
  - cinnamon

tags:
  - beverage
  - coffee

notes:
  - Refers to a classic cortado with equal parts espresso and steamed milk.
  - Larger milk-based drinks (e.g. latte) are more Kapha-promoting, while espresso macchiato remains closer to black coffee.
- The main refinement I'd recommend is Vata −1. A cortado contains enough steamed milk to substantially soften coffee's drying qualities while still retaining a warming, stimulating profile, making it a good midpoint between espresso and a latte.


| ☐ | Affogato | `affogato` | sweet, bitter | heating | V 0 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |
- | ☐ | Affogato | `affogato` | sweet, bitter | heating | V 0 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |
- allergens:
  - dairy

cautions:
  - caffeine
  - high_sugar

balancedBy:
  - darkChocolate

tags:
  - dessert
  - coffee

notes:
  - Refers to a classic affogato made with vanilla ice cream and espresso.
  - Gelato or additional toppings do not materially change the overall dosha direction.
- | ☐ | **Affogato** | sweet, bitter | heating | V −1 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |
Review
Evidence
Medium · Derived ✅
Dessert consisting of espresso poured over vanilla ice cream or gelato.
Rasa
Sweet
Bitter
I agree.
Sweet from the ice cream.
Bitter from the espresso.
The sweetness is dominant, but both tastes are clearly represented.
Virya
Heating ✅
Although served cold, the intrinsic virya is determined by the espresso and the warming effect of coffee. The ice cream moderates, but does not reverse, the overall direction.
Guṇa
I recommend:
Heavy
Moist
Affogato is:
rich,
creamy,
dense,
highly nourishing.
These qualities dominate over the coffee.
Doshas
Vata   -1
Pitta  +1
Kapha  +1
Reasoning:
Vata −1: The rich dairy and sweetness outweigh the drying effect of the espresso.
Pitta +1: Coffee still provides a warming, stimulating influence despite the cold serving temperature.
Kapha +1: Ice cream and sugar clearly increase Kapha.
Suggested metadata
allergens:
  - dairy

cautions:
  - caffeine
  - high_sugar

balancedBy:
  - darkChocolate

tags:
  - dessert
  - coffee

notes:
  - Refers to a classic affogato made with vanilla ice cream and espresso.
  - Gelato or additional toppings do not materially change the overall dosha direction.
Editorial consistency
Beverage / Dessert	Guṇa	Doshas
Espresso	Light + Dry	V+1 / P+1 / K−1
Latte	Heavy + Moist	V−1 / P0 / K+1
Mocha	Heavy + Moist	V−1 / P+1 / K+1
Affogato	Heavy + Moist	V−1 / P+1 / K+1


This keeps coffee desserts distinct from coffee beverages, with the dairy and sugar becoming the dominant energetic influence.
Final recommendation
Property	Your draft	Recommendation
Evidence	Medium · Derived	
Rasa	Sweet + Bitter	
Virya	Heating	
Guṇa	Heavy + Moist	
Vata	0	−1
Pitta	+1	✅ +1
Kapha	+1	✅ +1
Allergen	dairy	
Cautions	caffeine, high_sugar	


Confidence
Moderate to high. The only substantive refinement I'd recommend is Vata −1. The generous amount of ice cream provides enough sweetness, fat, and moisture to outweigh the drying quality of the espresso, making affogato overall more Vata-pacifying while still increasing Pitta and Kapha.


| ☐ | Frappé | `frappe` | sweet, bitter | heating | V +1 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |
- | ☐ | **Frappé** | sweet, bitter | cooling | V 0 · P 0 · K +1 | allergen:dairy · caution:caffeine, high_sugar |
- allergens:
  - dairy

cautions:
  - caffeine
  - high_sugar

tags:
  - coffee
  - beverage

notes:
  - Refers to a blended iced coffee drink with milk and sweetener.
  - Greek black frappé without milk should be modelled separately.
- If your database uses "frappé" to mean the modern blended milk-and-ice coffee drink, I think Cooling · V0 · P0 · K+1 is a better representation than treating it like a hot coffee. If instead you intended the Greek black frappé, I'd keep it much closer to iced coffee with Heating · V+1 · P+1 · K−1 and no dairy allergen.



_Note: `latte` and `icedCoffee` already exist (batch 4); `cappuccino`/`flat white` are aliases of `latte`._

## Condiments (9)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Aioli / garlic mayo | `aioli` | pungent, sour | heating | V −1 · P +1 · K +1 | allergen:egg |
- | ☐ | **Aioli / garlic mayo** | sweet, pungent | heating | V −1 · P +1 · K +1 | allergen:egg |
- allergens:
  - egg

balancedBy:
  - lemon

tags:
  - condiment

notes:
  - Refers to both traditional aioli and garlic mayonnaise.
  - Vegan aioli should omit the egg allergen but retains a similar energetic profile.
- The only refinement I'd suggest is making the dominant rasa Sweet + Pungent, since the rich oil/egg base is energetically more significant than the small amount of acid typically present.

| ☐ | Hoisin sauce | `hoisinSauce` | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:soy · caution:high_sodium, high_sugar |
-| ☐ | Hoisin sauce | `hoisinSauce` | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:soy · caution:high_sodium, high_sugar |
-allergens:
  - soy

cautions:
  - high_sodium
  - high_sugar

balancedBy:
  - cucumber

tags:
  - condiment
  - asian

notes:
  - Refers to standard commercial hoisin sauce.
  - Reduced-sugar formulations retain the same overall energetic direction but are somewhat less Kapha-promoting.
-The only refinement I'd add is documenting the guṇa as Heavy + Moist for consistency with similar thick, sweet condiments.

| ☐ | Ranch dressing | `ranchDressing` | sour, salty | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sodium |
-| ☐ | **Ranch dressing** | sweet, sour | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sodium |
-allergens:
  - dairy

cautions:
  - high_sodium

balancedBy:
  - blackPepper

tags:
  - condiment

notes:
  - Refers to classic dairy-based ranch dressing.
  - Vegan ranch should omit the dairy allergen but has a similar overall energetic profile.
-The only refinement I'd recommend is changing the dominant rasa to Sweet + Sour, as the cultured dairy base is energetically more significant than the salt in a typical ranch dressing.


| ☐ | Oyster sauce | `oysterSauce` | salty, sweet | heating | V −1 · P +1 · K 0 | allergen:shellfish · caution:high_sodium |
- | ☐ | **Oyster sauce** | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:shellfish · caution:high_sodium |
- allergens:
  - shellfish

cautions:
  - high_sodium

balancedBy:
  - bok_choy

tags:
  - condiment
  - asian

notes:
  - Refers to standard commercial oyster sauce.
  - Vegetarian "oyster-style" mushroom sauces should be modelled separately.
- The only substantive refinement I'd recommend is Kapha +1. The sugar, thickness, and sweet-salty profile of standard oyster sauce make it more Kapha-promoting than neutral, even though it is typically used in relatively small amounts.

| ☐ | Harissa | `harissa` | pungent, sour | heating | V +1 · P +1 · K −1 | tag:nightshade |
- | ☐ | **Harissa** | pungent, sour | heating | V +1 · P +1 · K −1 | tag:nightshade |
- tags:
  - condiment
  - nightshade

balancedBy:
  - yogurt

notes:
  - Refers to traditional chili-based harissa.
  - Variations with rose petals or extra olive oil remain predominantly heating.
- The only refinement I'd suggest is explicitly classifying harissa as Light + Sharp (or Light + Dry in a simplified guṇa system), reflecting the dominant influence of its concentrated chili and spice content.

| ☐ | Chimichurri | `chimichurri` | pungent, sour | heating | V 0 · P +1 · K −1 | — |
- | ☐ | **Chimichurri** | `chimichurri` | pungent, sour | heating | V 0 · P +1 · K −1 | — |
- balancedBy:
  - grilledVegetables

tags:
  - condiment
  - herb_sauce

notes:
  - Refers to traditional parsley-based chimichurri.
  - Red chimichurri with chili has a similar overall profile but is somewhat more Pitta-provoking.
- The only refinement I'd suggest is explicitly classifying chimichurri as Light + Oily, reflecting the balancing influence of olive oil on the pungent herbs and vinegar. This differentiates it well from dry spice pastes like harissa.

| ☐ | Relish | `relish` | sour, sweet, salty | heating | V 0 · P +1 · K 0 | caution:high_sodium, high_sugar |
- | ☐ | **Relish** | `relish` | sour, sweet, salty | heating | V 0 · P +1 · K +1 | caution:high_sodium, high_sugar |
- cautions:
  - high_sodium
  - high_sugar

tags:
  - condiment

balancedBy:
  - mustard

notes:
  - Refers to standard sweet pickle relish.
  - Savory relishes (e.g. tomato relish or onion relish) may differ slightly depending on ingredients.
- The main refinement I'd recommend is Kapha +1. Because your entry includes both high_sugar and high_sodium, it clearly represents the common sweet pickle relish, whose sugar content makes it mildly Kapha-promoting despite its sour, stimulating character.

| ☐ | Tartar sauce | `tartarSauce` | sour, salty | heating | V −1 · P +1 · K +1 | allergen:egg |
- | ☐ | **Tartar sauce** | `tartarSauce` | sweet, sour | neutral | V −1 · P 0 · K +1 | allergen:egg |
- allergens:
  - egg

balancedBy:
  - lemon

tags:
  - condiment

notes:
  - Refers to classic mayonnaise-based tartar sauce.
  - Commercial versions may contain relish or sugar but retain a similar overall profile.
- The refinements I'd recommend are changing the dominant rasa to Sweet + Sour and the virya to Neutral, reflecting that the mayonnaise base is energetically more significant than the acidic ingredients.

| ☐ | Honey mustard | `honeyMustard` | sweet, pungent | heating | V 0 · P +1 · K 0 | caution:high_sugar |
- | ☐ | **Honey mustard** | sweet, pungent | heating | V 0 · P +1 · K +1 | caution:high_sugar |
- cautions:
  - high_sugar

balancedBy:
  - leafyGreens

tags:
  - condiment

notes:
  - Refers to standard commercial honey mustard.
  - Spicier versions remain Pitta-aggravating, while reduced-sugar versions are slightly less Kapha-promoting.
- The only substantive refinement I'd recommend is Kapha +1. Because your entry explicitly represents the common sweetened condiment (high_sugar), the added honey or sugar makes honey mustard mildly Kapha-promoting while retaining mustard's heating and Pitta-aggravating nature.


## More world recipes (8)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Shakshuka | `shakshuka` | sour, salty, pungent | heating | V 0 · P +1 · K 0 | allergen:egg · tag:nightshade |
- | ☐ | **Shakshuka** | sour, salty, pungent | heating | V −1 · P +1 · K 0 | allergen:egg · tag:nightshade |
- allergens:
  - egg

tags:
  - nightshade
  - egg_dish

balancedBy:
  - parsley

notes:
  - Refers to a classic tomato-based shakshuka.
  - Very spicy versions are more Pitta-aggravating.
- The main refinement I'd recommend is Vata −1. Although tomatoes and spices can aggravate Vata individually, the combination of slow cooking, olive oil, and eggs makes a classic shakshuka overall more grounding than neutral while still clearly increasing Pitta.

| ☐ | Poke bowl | `pokeBowl` | salty, sweet | neutral | V 0 · P 0 · K 0 | allergen:fish, soy |
- | ☐ | Poke bowl | `pokeBowl` | salty, sweet | neutral | V 0 · P 0 · K 0 | allergen:fish, soy |
- allergens:
  - fish
  - soy

balancedBy:
  - ginger

tags:
  - seafood
  - rice_bowl

notes:
  - Refers to a classic poke bowl with rice, raw fish, vegetables, and soy-based dressing.
  - Spicy mayo versions are more Kapha- and Pitta-promoting.
  - Greens-only poke bowls are lighter and less Kapha-promoting than rice-based versions.
- 

| ☐ | Bánh mì | `banhMi` | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:processed |
- | ☐ | **Bánh mì** | `banhMi` | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:processed |
- allergens:
  - gluten

cautions:
  - processed

balancedBy:
  - cucumber

tags:
  - sandwich

notes:
  - Refers to a classic bánh mì.
  - Add specific tags or allergens based on the filling (e.g. `pork`, `chicken`, `fish`, or `soy` for tofu versions).
- The only refinement I'd suggest is documenting Heavy + Oily guṇas and treating the filling-specific tags (pork, chicken, tofu, fish) as variants instead of embedding them into the generic bánh mì entry.

| ☐ | Katsu curry | `katsuCurry` | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten |
- | ☐ | **Katsu curry** | `katsuCurry` | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten |
- allergens:
  - gluten

balancedBy:
  - pickledRadish

tags:
  - japanese
  - curry

notes:
  - Refers to a standard Japanese katsu curry.
  - Add `pork` for tonkatsu curry or `chicken` for chicken katsu curry when the specific protein is known.
- The only refinement I'd recommend is explicitly recording the guṇas as Heavy + Oily and handling the meat type as a variant rather than embedding it in the generic entry.

| ☐ | Buddha bowl | `buddhaBowl` | sweet, astringent | neutral | V −1 · P −1 · K 0 | (+sesame for tahini dressing) |
- | ☐ | Buddha bowl | `buddhaBowl` | sweet, astringent | neutral | V −1 · P −1 · K 0 | (+sesame for tahini dressing) |
- balancedBy:
  - lemon

tags:
  - grain_bowl
  - plant_based

notes:
  - Refers to a typical Buddha bowl with whole grains, legumes, vegetables, and a light dressing.
  - Add allergens based on the dressing or toppings (e.g. `sesame` for tahini, `soy` for tofu, `nuts` for nut-based sauces).
- The only refinement I'd recommend is treating allergens such as sesame as variant-specific rather than including them in the generic Buddha bowl entry, since there is no standard dressing.

| ☐ | French toast | `frenchToast` | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
- | ☐ | **French toast** | `frenchToast` | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
- allergens:
  - gluten
  - dairy
  - egg

cautions:
  - high_sugar

balancedBy:
  - berries

tags:
  - breakfast

notes:
  - Refers to classic French toast.
  - Savory French toast variations may have a slightly different taste profile but similar overall energetics.
- The only refinement I'd suggest is explicitly classifying French toast as Heavy + Moist, reflecting the egg-and-milk enrichment and distinguishing it from ordinary toast.

| ☐ | Scone | `scone` | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten, dairy · caution:high_sugar |
- | ☐ | **Scone** | `scone` | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten, dairy · caution:high_sugar |
- allergens:
  - gluten
  - dairy

cautions:
  - high_sugar

balancedBy:
  - clottedCream

tags:
  - baked_good

notes:
  - Refers to a classic plain or lightly sweetened scone.
  - Fruit or cheese scones retain a similar overall energetic profile.
- The only substantive change I'd recommend is Vata +1. A traditional scone's defining quality is its dry, crumbly texture, which outweighs its butter content from an Ayurvedic perspective, making it more Vata-aggravating than neutral.

| ☐ | Minestrone | `minestrone` | sweet, astringent | heating | V 0 · P −1 · K −1 | allergen:gluten · tag:nightshade |
- | ☐ | **Minestrone** | `minestrone` | sweet, astringent | heating | V −1 · P −1 · K −1 | allergen:gluten · tag:nightshade |
- allergens:
  - gluten   # if made with pasta

tags:
  - soup
  - nightshade

balancedBy:
  - parmesan

notes:
  - Refers to a classic tomato-based minestrone.
  - Omit the gluten allergen if prepared without pasta.
  - Creamy or cheese-rich versions are more Kapha-promoting.
- The biggest source of variability is whether the soup is bean-heavy, pasta-heavy, or mostly vegetables. For a classic Italian minestrone, V−1 · P−1 · K−1 is a reasonable default because the warm broth and long cooking time generally make it more grounding than its individual ingredients might suggest.


---

## Open questions

- **Vermicelli / soba gluten.** `vermicelli` (wheat sevai vs rice) and `soba` (pure buckwheat vs wheat-blended) both vary by product — I tagged the common wheat form as gluten; flag if you'd rather the rice/buckwheat (gluten-free) form be the default.
- **Meat tagging.** `teriyakiChicken`, `tonkatsu`, `katsuCurry`, `banhMi` — meat is implied but not tagged as a diet tag by default (poultry/pork). Add product-specific tags if you'd prefer them tagged.
- **Onigiri / poke fish.** `onigiri` is tagged fish only in the note (fillings vary); `pokeBowl` carries `allergen:fish` by default since raw fish is intrinsic. Flag if you want onigiri to carry fish by default too.

- ✅ Keep
Vermicelli → default gluten, note that rice vermicelli is gluten-free.
Soba → default gluten, note that 100% buckwheat soba is gluten-free.
Onigiri → no default fish allergen; add based on filling.
Poke bowl → default allergen:fish, soy.
🔄 Adjust
For dishes where the protein is explicit in the name, add the corresponding diet tag:
Dish	Add
teriyakiChicken	tag:poultry
tonkatsu	tag:pork


For generic dishes where the protein varies, leave the tag off until specified:
katsuCurry → tag:pork or tag:poultry depending on the cutlet.
banhMi → tag:pork, tag:poultry, tag:fish, or tag:soy depending on the filling.
This gives you a clean, internally consistent rule:
Identity determines defaults. If the food's name specifies the protein, tag it. If the protein is a variant, keep the base entry neutral and apply tags to the specific variant.








SourcesCharaka Samhita Sutrasthana Chapter 26: The Six Tastes – Ayurveda Hub

Suitable and unsuitables for health [Chapter XX]

Toxicological evaluation of banana and milk combination as incompatible diet - An experimental exploration of Samyoga viruddha concept - PMC


## Notes / corrections

_(add feedback per item here)_
