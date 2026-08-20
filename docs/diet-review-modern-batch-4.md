# Modern-diet review batch 4 (50 entries) — sweets, more dishes, drinks, condiments & pantry

_All rows are `reviewStatus: 'draft'` — invisible to the app until fact-checked and flipped to `reviewed` (add the id to `REVIEWED_SIGNED_OFF` in `dietSafety.test.js`). Source: property-derived (`modern`, `confidence: medium`). Sign convention: doshaEffect −1 pacifies / +1 aggravates._

**What this batch is:** the biggest gaps left after batches 1–3 + the dishes set — desserts & sweets, more world dishes, drinks, condiments & spice blends, and remaining pantry whole-foods. Composite dishes are one row each (dosha derived from typical constituents, in each `source.note`).

**How to review:** tick ✅ if it looks right, or note a correction under the row (freeform, same as batches 1–3 — I'll apply your edits and flip the flags).

## Desserts & sweets (10)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Gulab jamun** | sweet | heating | V −1 · P +1 · K +1 | allergen:dairy · caution:high_sugar |

- gulabJamun

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Heating

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha  +1

- allergens:
  - dairy

cautions:
  - high_sugar

balancedBy:
  - cardamom

tags:
  - indian
  - dessert
  - fried

notes:
  - Refers to traditional gulab jamun made from khoya or milk solids.
  - Served warm or at room temperature, with similar overall energetics.

- 

| ☐ | **Jalebi** | sweet, sour | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:high_sugar |

- jalebi

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Sour

    Virya:
    Heating

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha  +1

- allergens:
  - gluten

cautions:
  - high_sugar

balancedBy:
  - fennelTea

tags:
  - indian
  - dessert
  - fried

notes:
  - Refers to traditional fermented jalebi.
  - Freshly fried and syrup-soaked versions have similar overall energetics.

- 
| ☐ | **Kheer** (rice pudding) | sweet | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sugar |

- kheer

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Cooling

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - dairy

cautions:
  - high_sugar

balancedBy:
  - cardamom

tags:
  - indian
  - dessert
  - pudding

notes:
  - Refers to traditional rice kheer.
  - Vermicelli or millet-based kheer has broadly similar energetics.
  - Nut-rich versions are slightly heavier but retain the same dosha profile.

- The main refinement I'd suggest is explicitly classifying kheer as Heavy + Moist, which accurately reflects its creamy, milk-based nature and distinguishes it from fried Indian desserts while remaining consistent with Ayurvedic principles.

| ☐ | **Halwa** | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy · caution:high_sugar |

- halwa

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Heating

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - gluten
  - dairy

cautions:
  - high_sugar

balancedBy:
  - cardamom

tags:
  - indian
  - dessert

notes:
  - Refers to a traditional semolina or wheat halwa prepared with ghee.
  - Carrot and moong dal halwa have broadly similar energetics.

- The main refinement I'd suggest is explicitly classifying halwa as Heavy + Oily, which reflects the central role of ghee in traditional preparations and distinguishes it from milk-based desserts like kheer.

| ☐ | **Laddu** | sweet | heating | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sugar |

- laddu

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Heating

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - dairy

cautions:
  - high_sugar

balancedBy:
  - cardamom

tags:
  - indian
  - dessert

notes:
  - Refers to traditional ghee-based laddus such as besan or atta laddu.
  - Coconut or sesame laddus have broadly similar energetics but may warrant separate entries if you distinguish by primary ingredient.

- The only refinement I'd suggest is explicitly assigning Heavy + Oily guṇa, which accurately reflects the dense, ghee-rich nature of traditional laddus and keeps them consistent with other cooked Indian sweets like halwa.


| ☐ | **Barfi** | sweet | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sugar |

- barfi

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Cooling

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - dairy

cautions:
  - high_sugar

balancedBy:
  - cardamom

tags:
  - indian
  - dessert

notes:
  - Refers to traditional milk-based barfi.
  - Coconut, pistachio, and cashew barfi have broadly similar energetics, though nut-rich varieties are slightly heavier.

- The main refinement I'd suggest is explicitly classifying barfi as Heavy + Oily, reflecting its dense, milk-solid and ghee-rich composition while preserving its overall cooling dairy-based energetics.

| ☐ | **Cake** (sponge) | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |

- cakeSponge

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Heating

    Guṇa:
    Light
    Moist

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - gluten
  - dairy
  - egg

cautions:
  - high_sugar

balancedBy:
  - berries

tags:
  - dessert
  - baked

notes:
  - Refers to a plain sponge cake without frosting or fillings.
  - Chocolate, buttercream, or cream-filled cakes should be modelled separately.

- The only refinement I'd suggest is Light + Moist guṇa, which better reflects the airy, tender nature of a plain sponge cake and clearly distinguishes it from denser baked goods like muffins or pound cakes.

| ☐ | **Brownie** | sweet, bitter | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
    - | ☐ | **Brownie** | sweet, bitter | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
- allergens:
  - gluten
  - dairy
  - egg

cautions:
  - high_sugar

balancedBy:
  - berries

tags:
  - dessert
  - baked
  - chocolate

notes:
  - Refers to a classic chocolate brownie.
  - Fudgy and cakey brownies share similar energetics.
  - Nut-containing brownies should additionally include `allergen:nuts`.

- The only refinement I'd suggest is explicitly classifying brownies as Heavy + Moist, which reflects their dense, buttery texture and distinguishes them from lighter cakes and fried desserts.

| ☐ | **Cheesecake** | sweet, sour | cooling | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |

- | ☐ | **Cheesecake** | sweet, sour | cooling | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |
- allergens:
  - gluten
  - dairy
  - egg

cautions:
  - high_sugar

balancedBy:
  - berries

tags:
  - dessert
  - baked

notes:
  - Refers to a classic baked cheesecake.
  - New York, quark, and baked cream cheese cheesecakes have broadly similar energetics.
  - Fruit toppings may add a secondary sour note but do not materially change the dosha profile.
- The only refinement I'd suggest is explicitly classifying cheesecake as Heavy + Moist, reflecting its dense, creamy dairy base and distinguishing it from oily fried desserts.

| ☐ | **Custard** | sweet | cooling | V −1 · P 0 · K +1 | allergen:dairy, egg · caution:high_sugar |

- | ☐ | **Custard** | sweet | cooling | V −1 · P 0 · K +1 | allergen:dairy, egg · caution:high_sugar |
- allergens:
  - dairy
  - egg

cautions:
  - high_sugar

balancedBy:
  - berries

tags:
  - dessert
  - pudding

notes:
  - Refers to traditional egg custard or vanilla custard.
  - Baked and stirred custards have broadly similar energetics.

- The only refinement I'd suggest is explicitly classifying custard as Heavy + Moist, which accurately reflects its creamy dairy base and keeps it consistent with other milk-based desserts in your taxonomy.


## More world dishes (9)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Omelette** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:egg |
- | ☐ | **Omelette** | sweet, salty | heating | V −1 · P +1 · K 0 | allergen:egg |
- allergens:
  - egg

balancedBy:
  - herbs

tags:
  - breakfast

notes:
  - Refers to a plain omelette.
  - Cheese omelettes are heavier and may warrant Kapha +1.
  - Vegetable omelettes retain a similar dosha profile.

- Confidence - Moderate to high. The main refinement I'd recommend is Kapha 0. A plain omelette is warming and nourishing, but without substantial dairy or refined starches it is generally less Kapha-promoting than foods such as pizza, cheesecake, or fried chicken.

| ☐ | **Hot dog** | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:high_sodium, processed |

- | ☐ | **Hot dog** | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:high_sodium, processed |

- allergens:
  - gluten

cautions:
  - high_sodium
  - processed

balancedBy:
  - sauerkraut

tags:
  - fast_food

notes:
  - Refers to a classic hot dog in a bun.
  - Apply a product-specific diet tag (e.g. `beef`, `pork`, `chicken`, `turkey`) when the meat type is known.

- 
| ☐ | **Chicken nuggets** | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:processed |

- | ☐ | **Chicken nuggets** | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten · caution:processed |

- allergens:
  - gluten

cautions:
  - processed

balancedBy:
  - cucumber

tags:
  - fast_food
  - poultry
  - fried_food

notes:
  - Refers to classic breaded chicken nuggets.
  - Spicy or heavily seasoned nuggets may have a stronger Pitta effect.

- 
| ☐ | **Meatballs** | sweet, salty | heating | V −1 · P +1 · K +1 | — |

- | ☐ | **Meatballs** | sweet, salty | heating | V −1 · P +1 · K +1 | — |

- balancedBy:
  - parsley

tags:
  - meat

notes:
  - Refers to generic meatballs.
  - Apply a product-specific diet tag (e.g. `beef`, `pork`, `chicken`, `lamb`, `turkey`) when the meat type is known.
  - Cheese-filled or cream-sauce preparations are slightly more Kapha-promoting but retain the same overall profile.

- 
| ☐ | **Gnocchi** | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten · tag:nightshade |

- | ☐ | **Gnocchi** | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten · tag:nightshade |
- allergens:
  - gluten

tags:
  - italian
  - pasta
  - nightshade

balancedBy:
  - sage

notes:
  - Refers to traditional potato gnocchi served plain.
  - Cream or tomato sauces should be modelled separately, as they can shift the overall energetics.

- The main refinement I'd recommend is Vata −1. The soft, moist, boiled nature of potato gnocchi makes it substantially more Vata-pacifying than dry grain products, while your Pitta 0 and Kapha +1 classifications are well balanced.

| ☐ | **Garlic bread** | sweet, pungent, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy |

- | ☐ | **Garlic bread** | sweet, pungent, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy |
- allergens:
  - gluten
  - dairy

balancedBy:
  - parsley

tags:
  - bread
  - side

notes:
  - Refers to classic buttered garlic bread.
  - Cheese-topped garlic bread is slightly heavier but retains the same overall dosha profile.

- 
| ☐ | **Onion rings** | sweet, pungent, salty | heating | V 0 · P +1 · K +1 | allergen:gluten |

- | ☐ | **Onion rings** | sweet, pungent, salty | heating | V −1 · P +1 · K +1 | allergen:gluten |

- allergens:
  - gluten

balancedBy:
  - ketchup

tags:
  - side
  - fried_food

notes:
  - Refers to classic battered and deep-fried onion rings.
  - Beer-battered and panko-coated versions have similar energetics.

- The only change I'd recommend is Vata −1. In Ayurveda, the deep-frying and oil content are the dominant energetic influences, making onion rings much closer to fried chicken or samosas than to raw or sautéed onions.


| ☐ | **Miso soup** | salty, astringent | heating | V −1 · P +1 · K 0 | allergen:soy · caution:high_sodium |

- | ☐ | **Miso soup** | salty, umami | neutral | V −1 · P 0 · K 0 | allergen:soy · caution:high_sodium |
- allergens:
  - soy

cautions:
  - high_sodium

balancedBy:
  - scallions

tags:
  - japanese
  - soup
  - fermented

notes:
  - Refers to traditional miso soup with tofu and seaweed.
  - Spicy miso soups should be modelled separately.

- The biggest refinements are Neutral virya and Pitta 0. A traditional miso soup is a light, hydrating broth whose warming serving temperature doesn't outweigh its overall gentle energetic nature. I would also replace Astringent with Sweet if you're adhering strictly to the six classical Ayurvedic rasas.

| ☐ | **Paella** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:fish |

- | ☐ | **Paella** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:fish |
- allergens:
  - fish

balancedBy:
  - lemon

tags:
  - spanish
  - rice_dish

notes:
  - Refers to a traditional seafood or mixed paella.
  - Vegetarian paella has broadly similar energetics but is typically slightly lighter.

- The only refinement I'd suggest is explicitly classifying paella as Heavy + Moist, which reflects its stock-cooked rice and distinguishes it from drier fried rice and oilier fried dishes. Also Paella can also be made with other meats, so we need separate entries for them. 

## Drinks (8)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Milkshake** | sweet | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sugar |

- | ☐ | **Milkshake** | sweet | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sugar |

- allergens:
  - dairy

cautions:
  - high_sugar

balancedBy:
  - cinnamon

tags:
  - beverage
  - dessert

notes:
  - Refers to a classic dairy milkshake.
  - Chocolate milkshakes may justify Pitta +1 if you create a separate variant due to the cocoa content.

- The only refinement I'd suggest is explicitly classifying milkshakes as Heavy + Moist, which accurately reflects their rich, creamy consistency and keeps them consistent with other dairy-based desserts in your taxonomy.

| ☐ | **Smoothie** | sweet, sour | cooling | V −1 · P 0 · K +1 | (declare dairy per recipe) |

- | ☐ | **Smoothie** | sweet, sour | cooling | V 0 · P 0 · K +1 | (declare dairy per recipe) |
- balancedBy:
  - ginger

tags:
  - beverage

notes:
  - Refers to a fruit-based smoothie.
  - Declare dairy, soy, or nuts according to the recipe.
  - Green smoothies and protein smoothies should be modelled separately if desired.
- Because "smoothie" is an extremely broad category, I think V0 · P0 · K+1 is the most robust default. If you later add entries such as banana yogurt smoothie, berry smoothie, or green smoothie, they can each receive more specific dosha profiles.

| ☐ | **Latte** | bitter, sweet | heating | V 0 · P +1 · K +1 | allergen:dairy · caution:caffeine |

- | ☐ | **Latte** | bitter, sweet | heating | V −1 · P 0 · K +1 | allergen:dairy · caution:caffeine |
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
  - Refers to a classic dairy latte.
  - Plant-based lattes may differ slightly depending on the milk used.
  - Extra espresso shots increase the heating effect.

- The biggest refinement is recognizing that the large proportion of steamed milk substantially changes the energetics compared with espresso or black coffee. A classic latte is generally more Vata-pacifying and less Pitta-provoking than plain coffee, while still remaining a warming beverage.

| ☐ | **Iced coffee** | bitter, sweet | heating | V +1 · P +1 · K 0 | caution:caffeine, high_sugar |
- | ☐ | **Iced coffee** | bitter, sweet | heating | V +1 · P +1 · K +1 | caution:caffeine, high_sugar |
- cautions:
  - caffeine
  - high_sugar

balancedBy:
  - cardamom

tags:
  - beverage
  - coffee

notes:
  - Refers to a sweetened iced coffee.
  - Unsweetened black iced coffee is better classified as Kapha 0 (or even Kapha −1 in some traditions).
  - Milk or cream further increases Kapha.

- The only substantive change I'd recommend is Kapha +1 if your default iced coffee is sweetened (as implied by the high_sugar caution). If you intend the base entry to represent unsweetened iced coffee, then your original Kapha 0 is appropriate.

| ☐ | **Sparkling water** | astringent | cooling | V +1 · P 0 · K −1 | — |
- | ☐ | **Sparkling water** | neutral | cooling | V +1 · P −1 · K −1 | — |
- balancedBy:
  - lime

tags:
  - beverage

notes:
  - Refers to plain, unsweetened sparkling water.
  - Flavored or sweetened sparkling waters should be modelled separately.

- The main refinements I'd recommend are treating sparkling water as having no meaningful rasa and recognizing that, despite increasing Vata through carbonation, it still has a cooling, Pitta-reducing effect as plain water.

| ☐ | **Whiskey** | pungent, bitter | heating | V +1 · P +1 · K −1 | tag:alcohol |

- | ☐ | **Whiskey** | pungent, bitter | heating | V +1 · P +1 · K −1 | tag:alcohol |

tags:
  - alcohol

balancedBy:
  - water

notes:
  - Refers to neat whiskey or whiskey on the rocks.
  - Sugary whiskey cocktails should be modelled separately because mixers substantially increase Kapha.

- The only refinement I'd suggest is explicitly assigning Light + Dry guṇa, which captures the classic Ayurvedic understanding of distilled spirits as warming, dehydrating, and Vata- and Pitta-aggravating while reducing Kapha.

| ☐ | **Bubble tea** | sweet | heating | V −1 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |

- | ☐ | **Bubble tea** | sweet | heating | V 0 · P +1 · K +1 | allergen:dairy · caution:caffeine, high_sugar |

- allergens:
  - dairy

cautions:
  - caffeine
  - high_sugar

balancedBy:
  - ginger

tags:
  - beverage
  - tea

notes:
  - Refers to a classic milk tea with tapioca pearls.
  - Fruit teas, matcha bubble tea, and dairy-free versions should be modelled separately if desired.

- The biggest refinement is Vata 0 rather than Vata −1. The combination of cold serving temperature and caffeine offsets much of the Vata-pacifying effect of the milk and sweetness, making a neutral Vata effect a better default for a typical iced bubble tea.

| ☐ | **Tomato juice** | sour, sweet, salty | heating | V 0 · P +1 · K 0 | tag:nightshade · caution:acid_reflux |

- | ☐ | **Tomato juice** | sour, sweet, salty | heating | V 0 · P +1 · K 0 | tag:nightshade · caution:acid_reflux |
- tags:
  - nightshade

cautions:
  - acid_reflux

balancedBy:
  - celery

notes:
  - Refers to plain tomato juice.
  - Commercial salted versions retain the same overall dosha profile.
  - Spiced tomato juice (e.g. with black pepper or hot sauce) is more Pitta-provoking.

- The only refinement I'd suggest is explicitly classifying tomato juice as Light + Moist, which reflects its liquid nature while preserving its characteristic Pitta-increasing effect due to acidity.


## Condiments & spice blends (9)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Garam masala** | pungent, astringent | heating | V 0 · P +1 · K −1 | — |

- | ☐ | **Garam masala** | pungent, astringent | heating | V −1 · P +1 · K −1 | — |
- balancedBy:
  - ghee

tags:
  - spice_blend

notes:
  - Refers to a traditional North Indian garam masala.
  - Recipes vary, but the overall energetic profile remains consistently warming.

- The main refinement I'd recommend is Vata −1. Although individual spices vary, the overall purpose of garam masala is to warm and stimulate digestion, making it generally Vata-pacifying while still increasing Pitta and reducing Kapha.

| ☐ | **Chilli powder** | pungent | heating | V +1 · P +1 · K −1 | tag:nightshade |

- | ☐ | **Chilli powder** | pungent | heating | V +1 · P +1 · K −1 | tag:nightshade |
- tags:
  - spice
  - nightshade

balancedBy:
  - ghee

notes:
  - Refers to ground dried chili peppers.
  - Kashmiri chili powder is generally milder but retains the same overall energetic direction.

- 
| ☐ | **Curry powder** | pungent, bitter | heating | V 0 · P +1 · K −1 | — |

- | ☐ | **Curry powder** | pungent, bitter | heating | V −1 · P +1 · K −1 | — |
- balancedBy:
  - ghee

tags:
  - spice_blend

notes:
  - Refers to a generic Western-style curry powder.
  - Hot curry powders with a high chili content may warrant a stronger Vata- and Pitta-aggravating profile.

- The main refinement I'd recommend is Vata −1. Unlike pure chili powder, a typical curry powder is formulated as a balanced digestive spice blend, so its overall effect is generally warming and Vata-supportive while still increasing Pitta and reducing Kapha.

| ☐ | **Apple cider vinegar** | sour | heating | V −1 · P +1 · K −1 | caution:acid_reflux |

- | ☐ | **Apple cider vinegar** | sour | heating | V −1 · P +1 · K −1 | caution:acid_reflux |
- cautions:
  - acid_reflux

balancedBy:
  - water

tags:
  - fermented
  - condiment

notes:
  - Refers to plain apple cider vinegar.
  - Best consumed diluted rather than undiluted.

- The only refinement I'd suggest is explicitly classifying apple cider vinegar as Light + Sharp, which better captures its penetrating, digestive nature than a generic drying quality.

| ☐ | **Balsamic vinegar** | sour, sweet | heating | V −1 · P +1 · K 0 | — |

- | ☐ | **Balsamic vinegar** | sour, sweet | heating | V −1 · P +1 · K 0 | — |

- balancedBy:
  - olive_oil

tags:
  - fermented
  - condiment

notes:
  - Refers to traditional or commercial balsamic vinegar.
  - Balsamic glaze is substantially sweeter and would warrant a separate entry.

- The only refinement I'd suggest is explicitly classifying balsamic vinegar as Light + Sharp, reflecting its fermented, digestive nature while preserving its milder, sweeter character compared with apple cider vinegar.

| ☐ | **Sriracha / hot sauce** | pungent, sour, salty | heating | V 0 · P +1 · K −1 | tag:nightshade |

- | ☐ | **Sriracha / hot sauce** | pungent, sour, salty | heating | V +1 · P +1 · K −1 | tag:nightshade |

- tags:
  - condiment
  - nightshade

balancedBy:
  - yogurt

notes:
  - Refers to classic chili-based hot sauces such as sriracha.
  - Extra-hot sauces retain the same direction but have a stronger Pitta effect.

- The only substantive change I'd recommend is Vata +1. Like chili powder, hot sauce combines strong heat with dryness, and the added vinegar reinforces its tendency to aggravate Vata while increasing Pitta and reducing Kapha.


| ☐ | **Fish sauce** | salty, sour | heating | V 0 · P +1 · K 0 | allergen:fish · caution:high_sodium |

- | ☐ | **Fish sauce** | salty, sour | heating | V −1 · P +1 · K 0 | allergen:fish · caution:high_sodium |
- allergens:
  - fish

cautions:
  - high_sodium

balancedBy:
  - lime

tags:
  - condiment
  - fermented

notes:
  - Refers to traditional fermented fish sauce.
  - Used as a seasoning rather than a primary ingredient.

- The only substantive change I'd recommend is Vata −1. In Ayurveda, the salty taste generally helps pacify Vata, and because fish sauce is consumed in small amounts as a liquid seasoning, that effect outweighs any drying influence from fermentation.

| ☐ | **BBQ sauce** | sweet, sour, salty | heating | V −1 · P +1 · K +1 | tag:nightshade · caution:high_sugar |

- | ☐ | **BBQ sauce** | sweet, sour, salty | heating | V −1 · P +1 · K +1 | tag:nightshade · caution:high_sugar |
- tags:
  - condiment
  - nightshade

cautions:
  - high_sugar

balancedBy:
  - vinegar

notes:
  - Refers to a classic tomato-based BBQ sauce.
  - Smoky or spicy BBQ sauces retain the same overall profile but may have a slightly stronger Pitta effect.

- The only refinement I'd suggest is explicitly classifying BBQ sauce as Heavy + Moist, reflecting its thick, sugary composition and distinguishing it from lighter, sharper condiments such as vinegar and hot sauce.

| ☐ | **Mango pickle (achar)** | sour, salty, pungent | heating | V −1 · P +1 · K 0 | caution:high_sodium |

- | ☐ | **Mango pickle (achar)** | sour, salty, pungent | heating | V −1 · P +1 · K 0 | caution:high_sodium |

- cautions:
  - high_sodium

balancedBy:
  - plainRice

tags:
  - condiment
  - fermented

notes:
  - Refers to traditional North Indian mango achar.
  - Regional variations differ in spice blend but have broadly similar energetics.

- The only refinement I'd suggest is explicitly classifying mango pickle as Oily + Sharp, which reflects its oil-based preservation and strongly stimulating nature while preserving its balanced effect on Kapha.

## Pantry whole-foods (14)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Bean sprouts** | astringent, sweet | cooling | V +1 · P −1 · K −1 | — |

- | ☐ | **Bean sprouts** | astringent, sweet | cooling | V 0 · P −1 · K −1 | — |
- balancedBy:
  - sesameOil

tags:
  - sprout

notes:
  - Refers to fresh mung bean or soybean sprouts.
  - Lightly cooking sprouts makes them more Vata-friendly than eating them raw.
- The main refinement I'd recommend is Vata 0 instead of +1. While sprouts retain the astringency of legumes, their high water content and tender texture make them considerably less Vata-aggravating than dried beans, especially when lightly cooked.

| ☐ | **Seaweed** (nori/kelp) | salty, astringent | cooling | V +1 · P 0 · K −1 | caution:high_sodium |

- | ☐ | **Seaweed** (nori/kelp) | salty, astringent | cooling | V 0 · P −1 · K −1 | caution:high_sodium |
- cautions:
  - high_sodium

balancedBy:
  - sesameOil

tags:
  - sea_vegetable

notes:
  - Refers to edible seaweeds such as nori and kelp.
  - Seasoned roasted seaweed snacks are saltier and slightly more Vata-aggravating.

- Because you've grouped nori and kelp into one entry, I think V0 · P−1 · K−1 is the most balanced default. The salty taste offsets much of the drying effect on Vata, while the cooling nature is sufficient to give a mild Pitta-reducing influence.

| ☐ | **Broad beans** (fava) | sweet, astringent | neutral | V +1 · P −1 · K 0 | — |

- | ☐ | **Broad beans** (fava) | sweet, astringent | neutral | V +1 · P −1 · K −1 | — |

- balancedBy:
  - ghee

tags:
  - legume

notes:
  - Refers to cooked broad (fava) beans.
  - Fresh young fava beans are slightly less drying than mature dried beans.

- The main refinement I'd recommend is Kapha −1. Broad beans share the classic Ayurvedic characteristics of many legumes—light, astringent, and mildly drying—which makes them more Kapha-reducing than neutral while still tending to increase Vata.

| ☐ | **Butter beans** (lima) | sweet, astringent | cooling | V +1 · P −1 · K 0 | — |

- | ☐ | **Butter beans** (lima) | sweet, astringent | cooling | V 0 · P −1 · K 0 | — |
- balancedBy:
  - cumin

tags:
  - legume

notes:
  - Refers to cooked butter (lima) beans.
  - Slow-cooked beans are more Vata-friendly than undercooked beans.

- 
| ☐ | **Brie** | sweet, sour | cooling | V −1 · P 0 · K +1 | tag:animal_rennet |

- | ☐ | **Brie** | sweet, sour | cooling | V −1 · P 0 · K +1 | — |
- balancedBy:
  - pears

tags:
  - cheese

notes:
  - Refers to classic Brie.
  - Add `animal_rennet` only when the specific product is confirmed to use animal rennet.

- The only change I'd make is removing the default animal_rennet tag. Unlike Parmesan, Brie is widely produced with both animal and microbial rennet, so your own editorial rule of tagging only when inherent or confirmed is the most consistent approach.

| ☐ | **Halloumi** | salty, sweet | heating | V −1 · P +1 · K +1 | (rennet varies — check) |

- | ☐ | **Halloumi** | salty, sweet | heating | V −1 · P +1 · K +1 | — |
- balancedBy:
  - mint

tags:
  - cheese

notes:
  - Refers to traditional halloumi.
  - Apply `animal_rennet` only when the specific product is confirmed to use animal rennet.
- The only refinement I'd make is editorial: remove the inline rennet note and instead follow your global rule that animal_rennet is added only when the specific product is confirmed to use it. This keeps your database consistent and avoids cluttering individual entries.

| ☐ | **Condensed milk** | sweet | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sugar |
- | ☐ | **Condensed milk** | sweet | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sugar |
- allergens:
  - dairy

cautions:
  - high_sugar

balancedBy:
  - cardamom

tags:
  - dairy
  - sweetener

notes:
  - Refers to sweetened condensed milk.
  - Unsweetened evaporated milk has a different profile and should be modelled separately.

- The only refinement I'd suggest is explicitly classifying condensed milk as Heavy + Oily, reflecting its concentrated, creamy nature and distinguishing it from lighter liquid dairy products.

| ☐ | **Pine nuts** | sweet | heating | V −1 · P +1 · K +1 | allergen:nuts |

- | ☐ | **Pine nuts** | sweet | neutral | V −1 · P 0 · K +1 | allergen:nuts |
- allergens:
  - nuts

balancedBy:
  - basil

tags:
  - nuts
  - seeds

notes:
  - Refers to raw pine nuts.
  - Heavily roasted or salted pine nuts are slightly more heating but retain the same overall dosha direction.

- The main refinement I'd recommend is Neutral virya with Pitta 0. Pine nuts are rich and nourishing but are not generally regarded as intrinsically heating in the way that warming spices or roasted foods are. They fit best alongside other mild, oil-rich nuts.

| ☐ | **Brazil nuts** | sweet | neutral | V −1 · P 0 · K +1 | allergen:nuts |

- | ☐ | **Brazil nuts** | sweet | neutral | V −1 · P 0 · K +1 | allergen:nuts |
- allergens:
  - nuts

balancedBy:
  - cinnamon

tags:
  - nuts

notes:
  - Refers to raw or lightly roasted Brazil nuts.
  - Because of their very high selenium content, moderation is advisable even though this is a nutritional rather than Ayurvedic consideration.
- The only refinement I'd suggest is explicitly classifying Brazil nuts as Heavy + Oily, reflecting their exceptionally rich fat content and keeping them consistent with other nourishing tree nuts.

| ☐ | **Molasses** | sweet, bitter | heating | V −1 · P +1 · K +1 | — |

- | ☐ | **Molasses** | sweet, bitter | neutral | V −1 · P 0 · K +1 | — |
- balancedBy:
  - ginger

tags:
  - sweetener

notes:
  - Refers to unsulfured molasses.
  - Blackstrap molasses is more bitter and mineral-rich but has a similar overall dosha profile.
- The main refinement I'd recommend is Neutral virya with Pitta 0. Molasses is certainly richer and more robust than refined sugar, but its overall Ayurvedic effect is better described as nourishing and grounding rather than distinctly heating.

| ☐ | **Passion fruit** | sweet, sour | cooling | V −1 · P 0 · K 0 | — |
- | ☐ | **Passion fruit** | sweet, sour | cooling | V −1 · P 0 · K 0 | — |
- balancedBy:
  - mint

tags:
  - fruit

notes:
  - Refers to ripe fresh passion fruit.
  - Sweetened passion fruit products or syrups should be modelled separately.
- The only refinement I'd suggest is explicitly classifying passion fruit as Light + Moist, reflecting its juicy, refreshing nature while preserving its balanced effects on Pitta and Kapha.


| ☐ | **Mandarin** | sweet, sour | cooling | V −1 · P 0 · K 0 | — |

- | ☐ | **Mandarin** | sweet, sour | cooling | V −1 · P −1 · K 0 | — |
- balancedBy:
  - mint

tags:
  - fruit
  - citrus

notes:
  - Refers to ripe fresh mandarins or clementines.
  - Juice concentrates or sweetened canned mandarins should be modelled separately.

- The only change I'd suggest is Pitta −1. Ripe mandarins are generally sweeter and less acidic than many other citrus fruits, and their cooling, juicy nature gives them a mildly Pitta-pacifying effect.

| ☐ | **Spelt** | sweet | neutral | V 0 · P 0 · K +1 | allergen:gluten |
- | ☐ | **Spelt** | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten |

- allergens:
  - gluten

balancedBy:
  - ghee

tags:
  - grain
  - whole_grain

notes:
  - Refers to cooked whole spelt or plain spelt flour.
  - Sprouted spelt and refined spelt flour may differ slightly in digestibility but retain the same overall energetic profile.

- The main refinement I'd recommend is Vata −1. Cooked spelt is a nourishing, sweet grain that is generally more grounding than drying, making it a better fit alongside oats and other wholesome cereal grains than alongside neutral or Vata-aggravating foods.


| ☐ | **Polenta** (cornmeal) | sweet | neutral | V 0 · P 0 · K +1 | — |
- | ☐ | **Polenta** (cornmeal) | sweet | neutral | V −1 · P 0 · K +1 | — |
- balancedBy:
  - oliveOil

tags:
  - grain

notes:
  - Refers to freshly cooked polenta.
  - Grilled or fried polenta has a slightly more heating profile but retains the same overall dosha direction.

- The main refinement I'd recommend is Vata −1. Freshly cooked polenta is warm, soft, and moist, making it considerably more Vata-pacifying than dry cornmeal while remaining neutral for Pitta and mildly Kapha-promoting.

---

## Open questions

- **Meat tagging.** Hot dog / meatballs are often pork or beef — kept generic; add a product-specific `pork`/`beef` dietTag if you'd prefer them tagged by default.
 - - **Variable meat sources.** Composite meat dishes are generic by default unless a specific meat is implied. Apply a product-specific diet tag (e.g. `beef`, `pork`, `chicken`, `lamb`, `turkey`) when known.


- **Halloumi rennet.** Many halloumi brands use vegetarian rennet, so I left the `animal_rennet` tag OFF (unlike brie/feta). Flag if you'd rather it be tagged.

    - **Halloumi rennet.** `animal_rennet` is not applied by default because halloumi may be made with either animal or vegetarian/microbial rennet. Add the tag only when the specific product is confirmed to use animal rennet.

## Notes / corrections

_(add feedback per item here)_
