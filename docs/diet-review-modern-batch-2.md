# Modern-diet review batch 2 (50 entries)

_All rows are `reviewStatus: 'draft'` — invisible to the app until fact-checked and flipped to `reviewed` (add the id to `REVIEWED_SIGNED_OFF` in `dietSafety.test.js`). Source: property-derived (`modern`, `confidence: medium`). Sign convention: doshaEffect −1 pacifies / +1 aggravates._

**How to review:** skim each row's rasa/vīrya and the doshaEffect it implies. Tick ✅ if it looks right, or note a correction under the row (same freeform style as batch 1 — I'll apply your edits and flip the flags). Flag anything to re-categorise, drop, or promote.

## Culinary herbs & spices (6)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Basil** | pungent, bitter | heating | V 0 · P 0 · K −1 | — |

- basil

    Evidence:
    Medium

    Rasa:
    Pungent
    Bitter

    Virya:
    Heating

    Guṇa:
    Light
    Dry

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  -1

- balancedBy:
  - oliveOil

tags:
  - herb

notes:
  - Refers to fresh sweet basil (Ocimum basilicum).
  - Holy basil (Tulsi) should remain a separate entry.

- The only substantive change I'd make is Pitta +1. Since you've already classified the herb as heating, a mild Pitta increase keeps the profile internally consistent. If you intentionally reserve Pitta +1 for much stronger spices (e.g. chili, mustard, long pepper), then your original Pitta 0 is also a defensible editorial choice.

| ☐ | **Oregano** | pungent, bitter | heating | V 0 · P +1 · K −1 | — |

- oregano

    Evidence:
    Medium

    Rasa:
    Pungent
    Bitter

    Virya:
    Heating

    Guṇa:
    Light
    Dry

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  -1

- balancedBy:
  - oliveOil

tags:
  - herb

notes:
  - Refers to culinary oregano (fresh or dried).
  - Dried oregano is somewhat more concentrated, but the overall energetic profile is similar.

- 
| ☐ | **Parsley** | bitter, astringent | neutral | V 0 · P −1 · K −1 | — |

- parsley

    Evidence:
    Medium

    Rasa:
    Bitter
    Astringent

    Virya:
    Neutral

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta  -1
    Kapha  -1

- balancedBy:
  - oliveOil

tags:
  - herb

notes:
  - Refers to fresh culinary parsley.
  - Dried parsley is slightly more drying but has a similar overall profile.

- The only change I'd recommend is Vata +1. Parsley's light, bitter, and astringent nature is enough to make it mildly Vata-provoking, even though it's typically consumed in small amounts.

| ☐ | **Paprika** | pungent, sweet | heating | V 0 · P +1 · K −1 | tag:nightshade |

- paprika

    Evidence:
    Medium

    Rasa:
    Pungent
    Sweet

    Virya:
    Heating

    Guṇa:
    Light
    Dry

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  -1

- tags:
  - spice
  - nightshade

balancedBy:
  - ghee

notes:
  - Refers to sweet paprika powder.
  - Hot paprika and cayenne should be modelled separately with a stronger heating profile.

- 
| ☐ | **Vanilla** | sweet | neutral | V −1 · P 0 · K 0 | — |

- vanilla

    Evidence:
    Medium

    Rasa:
    Sweet
    Bitter

    Virya:
    Neutral

    Guṇa:
    Light
    Dry

    Dosha:
    Vata    0
    Pitta   0
    Kapha  -1

- balancedBy:
  - milk

tags:
  - spice

notes:
  - Refers to natural vanilla bean or pure vanilla powder.
  - Vanilla extract containing alcohol or sweetened vanilla syrup should be modelled separately.

- The key editorial principle is to classify vanilla as a spice, not as a dessert ingredient. By itself, vanilla is light, aromatic, and used in minute quantities, so it doesn't have the nourishing, Vata-pacifying qualities of the sweet foods it's often paired with.

| ☐ | **Lemongrass** | pungent, bitter | heating | V 0 · P 0 · K −1 | — |

- lemongrass

    Evidence:
    Medium

    Rasa:
    Pungent
    Bitter

    Virya:
    Heating

    Guṇa:
    Light
    Dry

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  -1

- balancedBy:
  - coconutMilk

tags:
  - herb

notes:
  - Refers to fresh or dried culinary lemongrass.
  - Lemongrass essential oil should be modelled separately if included.

- The only change I'd make is Pitta +1. Since you've already classified lemongrass as heating, a mild Pitta increase keeps the profile internally consistent with other warming aromatic herbs such as oregano, thyme, and rosemary. If you intentionally reserve Pitta +1 for more strongly heating herbs and spices, your original Pitta 0 is also a reasonable editorial choice.


## Vegetables (6)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Arugula / rocket** | pungent, bitter | heating | V +1 · P +1 · K −1 | — |

- arugula

    Evidence:
    Medium

    Rasa:
    Bitter
    Pungent

    Virya:
    Cooling

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta  -1
    Kapha  -1

- balancedBy:
  - oliveOil

tags:
  - leafy_green

notes:
  - Refers to fresh arugula (rocket).
  - Often paired with oil, cheese, or nuts, which help offset its drying quality.

- Confidence - Moderate. This is one of those foods where modern Ayurvedic sources vary. Some practitioners emphasize its peppery, mustard-like character, while others group it with cooling bitter greens. For a database intended to be internally consistent, I think Cooling / Pitta−1 / Vata+1 / Kapha−1 is the more coherent default.

| ☐ | **Spring onion** | pungent, sweet | heating | V 0 · P +1 · K −1 | — |

- springOnion

    Evidence:
    Medium

    Rasa:
    Pungent
    Sweet

    Virya:
    Heating

    Guṇa:
    Light
    Dry

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  -1

- balancedBy:
  - ghee

tags:
  - allium

notes:
  - Refers to fresh spring onions (scallions/green onions).
  - More pungent than bulb onions but milder than garlic.

- I wouldn't change your proposed profile. It's internally consistent and accurately captures spring onion as a mildly heating, aromatic allium that reduces Kapha, mildly increases Pitta, and has an overall neutral effect on Vata because its warming quality balances its drying nature.

| ☐ | **Shallot** | pungent, sweet | heating | V 0 · P +1 · K 0 | — |

- shallot

    Evidence:
    Medium

    Rasa:
    Pungent
    Sweet

    Virya:
    Heating

    Guṇa:
    Light
    Moist

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha   0

- balancedBy:
  - ghee

tags:
  - allium

notes:
  - Refers to common culinary shallots.
  - Shallots are milder and sweeter than garlic, but more aromatic than onions.

- The main change I'd recommend is Vata −1. Shallots retain enough sweetness and moisture to be mildly Vata-pacifying, distinguishing them from the drier, greener profile of spring onions while remaining lighter than standard onions.

| ☐ | **Snow peas** | sweet, astringent | cooling | V +1 · P −1 · K 0 | — |

- snowPeas

    Evidence:
    Medium

    Rasa:
    Sweet
    Astringent

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta  -1
    Kapha   0

- balancedBy:
  - ghee

tags:
  - legume
  - vegetable

notes:
  - Refers to fresh edible-pod snow peas.
  - Mature green peas should be modelled separately.

- The key distinction is that snow peas behave more like a fresh green vegetable than a dried legume. Their high water content and tender pods moderate the drying, astringent qualities enough that a neutral Vata score is, in my view, the better default.

| ☐ | **Parsnip** | sweet | neutral | V −1 · P 0 · K +1 | tag:root |

- parsnip

    Evidence:
    Medium

    Rasa:
    Sweet

    Virya:
    Heating

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha  +1

- tags:
  - root

balancedBy:
  - blackPepper

notes:
  - Refers to cooked parsnip.
  - Roasting enhances its warming, sweet qualities.

- Confidence - Moderate. This is one of the less well-defined vegetables in Ayurvedic literature. If your database aims for a conservative, internally consistent approach, your original Neutral / P0 profile is perfectly defensible. If you want to reflect parsnip's sweeter, gently warming culinary character, Heating / P+1 is the version I'd choose.

| ☐ | **Bok choy** | sweet, astringent | cooling | V +1 · P −1 · K −1 | — |

- bokChoy

    Evidence:
    Medium

    Rasa:
    Sweet
    Astringent

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta  -1
    Kapha  -1

- balancedBy:
  - sesameOil

tags:
  - leafy_green

notes:
  - Refers to fresh bok choy (pak choi).
  - Stir-frying with oil makes it even more Vata-friendly.

- The main change I'd recommend is Vata 0. Bok choy's high water content and tender texture distinguish it from drier leafy greens, making it considerably less Vata-provoking while preserving its cooling, Pitta-reducing, and Kapha-reducing qualities.


## Fruit (6)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Raspberry** | sweet, sour, astringent | cooling | V 0 · P −1 · K 0 | — |

- raspberry

    Evidence:
    Medium

    Rasa:
    Sweet
    Sour
    Astringent

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta  -1
    Kapha   0

- balancedBy:
  - none

tags:
  - berry

notes:
  - Refers to fresh raspberries.
  - Frozen raspberries have similar energetics once thawed.

- 
| ☐ | **Blackberry** | sweet, sour, astringent | cooling | V 0 · P −1 · K 0 | — |

- blackberry

    Evidence:
    Medium

    Rasa:
    Sweet
    Sour
    Astringent

    Virya:
    Cooling

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta  -1
    Kapha  -1

- balancedBy:
  - yogurt

tags:
  - berry

notes:
  - Refers to fresh blackberries.
  - Cooking them into a compote reduces their drying quality.

- Confidence - Moderate. Different Ayurvedic sources don't consistently distinguish raspberry from blackberry. If your goal is a simple database, keeping both as V0 · P−1 · K0 is perfectly reasonable. If your goal is a more nuanced taxonomy, I think differentiating blackberries as slightly more drying (V+1 · K−1) better reflects their sensory qualities and keeps the berry category internally consistent.

| ☐ | **Cranberry** | sour, astringent | cooling | V +1 · P 0 · K −1 | — |

- cranberry

    Evidence:
    Medium

    Rasa:
    Sour
    Astringent

    Virya:
    Cooling

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta  +1
    Kapha  -1

- balancedBy:
  - honey

tags:
  - berry

notes:
  - Refers to fresh cranberries.
  - Sweetened dried cranberries or cranberry juice cocktails should be modelled separately.

- Confidence - Moderate. This is one of the few foods where rasa and virya pull in opposite directions. If your database consistently gives greater weight to virya, then Pitta 0 is defensible. If, however, you give stronger weight to a dominant sour rasa—as many Ayurvedic practitioners do—then Pitta +1 is the more representative choice.

| ☐ | **Grapefruit** | sour, sweet, bitter | heating | V 0 · P +1 · K −1 | caution:acid_reflux |

- grapefruit

    Evidence:
    Medium

    Rasa:
    Sour
    Sweet
    Bitter

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta   0
    Kapha  -1

- balancedBy:
  - none

tags:
  - citrus

cautions:
  - acid_reflux
  - medication_interactions

notes:
  - Refers to fresh grapefruit.
  - Grapefruit can interact with several prescription medications through CYP3A4 inhibition and should be flagged separately from its Ayurvedic properties.

- Confidence - High. The strongest recommendation here is changing Heating → Cooling. Grapefruit's sour taste can aggravate reflux—which you've already captured with caution:acid_reflux—but that clinical caution is separate from its intrinsic Ayurvedic energetics. The cooling virya and bitter rasa together make a neutral overall Pitta score more internally consistent than Pitta +1.


| ☐ | **Lime** | sour | heating | V −1 · P +1 · K −1 | — |

- lime

    Evidence:
    Medium

    Rasa:
    Sour

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  -1

- balancedBy:
  - none

tags:
  - citrus

notes:
  - Refers to fresh lime.
  - Lime juice may aggravate acid reflux in susceptible individuals despite its cooling virya.

- Confidence - Moderate to high. Ayurvedic literature is not completely uniform on citrus fruits, but if your database aims for internal consistency, treating lime as cooling while allowing its sour rasa to increase Pitta produces a more coherent taxonomy across the citrus family than making lime an exception with a heating virya.

| ☐ | **Lychee** | sweet | heating | V −1 · P +1 · K +1 | — |

- lychee

    Evidence:
    Medium

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

- balancedBy:
  - lime

tags:
  - tropical_fruit

notes:
  - Refers to fresh lychee.
  - Excessive consumption may cause a subjective feeling of heat in some individuals despite its overall cooling profile.

- Confidence - Moderate. This is one of the fruits where traditional systems differ. If your database prioritizes Ayurvedic internal consistency, I'd favor Cooling / P0. If you intentionally incorporate the common traditional observation that lychee is "heaty" when eaten in excess, your original profile is still a defensible editorial choice, but I'd capture that in a note rather than in the intrinsic energetics.


## Grains & breads (5)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Pita bread** | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten |

- pitaBread

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Neutral

    Guṇa:
    Light
    Soft

    Dosha:
    Vata    0
    Pitta   0
    Kapha  +1

- allergens:
  - gluten

balancedBy:
  - oliveOil

tags:
  - bread

notes:
  - Refers to plain wheat pita bread.
  - Whole-wheat pita can be modelled separately if you distinguish refined and whole grains.

- The only substantive change I'd make is Vata 0. Fresh pita is noticeably softer and less drying than toasted or crusty breads, making it a better fit as Vata-neutral while remaining mildly Kapha-promoting.

| ☐ | **Naan** | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, allergen:dairy |

- naan

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Heating

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

allergens:
  - gluten
  - dairy

balancedBy:
  - cilantro

tags:
  - bread

notes:
  - Refers to plain naan.
  - Butter naan and garlic naan may be slightly more Kapha-promoting and, in the case of garlic naan, somewhat more Pitta-provoking.

- I would keep your dosha scores unchanged. The only addition I'd make is explicitly assigning Heavy + Moist guṇa, which explains why naan is noticeably more Vata-pacifying than most other wheat breads while still increasing Kapha.

| ☐ | **Bulgur wheat** | sweet, astringent | neutral | V +1 · P 0 · K +1 | allergen:gluten |

- bulgurWheat

    Evidence:
    Medium

    Rasa:
    Sweet
    Astringent

    Virya:
    Neutral

    Guṇa:
    Light
    Dry

    Dosha:
    Vata    0
    Pitta   0
    Kapha   0

- allergens:
  - gluten

balancedBy:
  - oliveOil

tags:
  - whole_grain

notes:
  - Refers to cooked bulgur wheat.
  - Dry tabbouleh-style preparations may be slightly more Vata-provoking.

- Confidence - Moderate. The biggest variable is whether you're modelling cooked bulgur (which I assume) or the dry grain. For a food database representing foods as normally eaten, V0 · P0 · K0 provides a more balanced and internally consistent profile than treating bulgur like refined wheat bread.

| ☐ | **Rice cake** | sweet | neutral | V +1 · P 0 · K 0 | — |

- riceCake

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Neutral

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta   0
    Kapha   0

- balancedBy:
  - almondButter

tags:
  - snack
  - whole_grain

notes:
  - Refers to plain puffed rice cakes.
  - Flavored or chocolate-coated varieties should be modelled separately.


| ☐ | **Crackers** | sweet, salty | neutral | V +1 · P 0 · K 0 | allergen:gluten |

- crackers

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Salty

    Virya:
    Neutral

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta   0
    Kapha  +1

- allergens:
  - gluten

balancedBy:
  - hummus

tags:
  - snack

notes:
  - Refers to standard wheat crackers.
  - Plain rice or seed crackers should be modelled separately.

- Confidence - Moderate. If your intent is specifically plain water crackers, your original K0 is perfectly defensible. If the entry represents the broad category of commercial wheat crackers, I think K+1 is the better default because of the refined flour and added fat.

## Legumes (3)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Pinto beans** | sweet, astringent | neutral | V +1 · P −1 · K 0 | — |

- pintoBeans

    Evidence:
    Medium

    Rasa:
    Sweet
    Astringent

    Virya:
    Cooling

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta  -1
    Kapha   0

- balancedBy:
  - cumin
  - asafoetida

tags:
  - legume

notes:
  - Refers to cooked pinto beans.
  - Soaking and cooking with digestive spices reduces the Vata-provoking effect.

- Confidence - High. The only change I'd recommend is Cooling virya. Your dosha scores already align well with the classical Ayurvedic treatment of cooked legumes: mildly Vata-provoking, Pitta-reducing, and broadly neutral for Kapha.

| ☐ | **White beans (cannellini)** | sweet, astringent | neutral | V +1 · P −1 · K 0 | — |

- whiteBeans

    Evidence:
    Medium

    Rasa:
    Sweet
    Astringent

    Virya:
    Cooling

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta  -1
    Kapha   0

- balancedBy:
  - oliveOil
  - cumin
  - asafoetida

tags:
  - legume

notes:
  - Refers to cooked cannellini (white) beans.
  - Proper soaking and cooking improve digestibility and reduce Vata aggravation.

- Confidence - High. I would keep cannellini beans essentially identical to pinto beans in your taxonomy. The only refinement I'd make is Cooling virya, which better reflects the broader Ayurvedic treatment of cooked legumes.

| ☐ | **Split peas** | sweet, astringent | neutral | V +1 · P −1 · K −1 | — |

- splitPeas

    Evidence:
    Medium

    Rasa:
    Sweet
    Astringent

    Virya:
    Cooling

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta  -1
    Kapha   0

- balancedBy:
  - cumin
  - asafoetida
  - ghee

tags:
  - legume

notes:
  - Refers to cooked split peas.
  - Split pea soup prepared with ghee or oil is less Vata-provoking than plain boiled peas.

- Confidence - High. The strongest recommendation is Cooling virya. I'd also move Kapha from −1 to 0, since cooked split peas are still a nourishing legume. Their light, drying nature offsets Kapha somewhat, but not enough to make them consistently Kapha-reducing in a simple ±1 scoring system.


## Meat & fish (5)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Lamb / mutton** | sweet | heating | V −1 · P +1 · K +1 | — |

- lambMutton

    Evidence:
    High

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

- balancedBy:
  - mint
  - coriander

tags:
  - meat
  - red_meat

notes:
  - Refers to cooked lamb or mutton.
  - Lean lamb is slightly less Kapha-promoting than fattier cuts but shares the same overall energetic profile.

- 
| ☐ | **Duck** | sweet | heating | V −1 · P +1 · K +1 | — |

- duck

    Evidence:
    High

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

- balancedBy:
  - citrus
  - bitterGreens

tags:
  - meat
  - poultry

notes:
  - Refers to cooked duck meat.
  - Duck breast without skin is somewhat lighter but retains the same overall energetic profile.

- 
| ☐ | **Cod (white fish)** | sweet, salty | heating | V 0 · P +1 · K 0 | allergen:fish |

- cod

    Evidence:
    High

    Rasa:
    Sweet
    Salty

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta  -1
    Kapha   0

- allergens:
  - fish

balancedBy:
  - ginger

tags:
  - seafood
  - white_fish

notes:
  - Refers to lean white fish such as Atlantic cod.
  - Fried or battered cod should be modelled separately.

- Confidence - Moderate. Fish are one of the more variable categories in Ayurveda, and classical texts often discuss fish as a broad group rather than by species. For a modern food database, however, distinguishing lean white fish (cod, haddock, pollock) from fatty fish (salmon, mackerel) produces a more coherent taxonomy. I would classify cod as Cooling / V0 · P−1 · K0, reserving the warming, Kapha-promoting profile for richer oily fish.

| ☐ | **Sardines** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:fish |

- sardines

    Evidence:
    High

    Rasa:
    Sweet
    Salty

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
  - fish

balancedBy:
  - lemon

tags:
  - seafood
  - oily_fish

notes:
  - Refers to fresh or simply cooked sardines.
  - Canned sardines in oil or spicy sauces may be slightly more Kapha- or Pitta-promoting, respectively.

- Confidence - Moderate to high. While classical Ayurveda does not classify modern fish species individually, sardines' high oil content and nourishing nature justify treating them much like salmon in a simplified ±1 scoring system. If you later split fresh sardines from canned sardines, the latter may deserve additional notes for sodium content rather than changes to the intrinsic Ayurvedic profile.

| ☐ | **Sausage** | salty, sweet | heating | V −1 · P +1 · K +1 | caution:high_sodium (often pork — tag per product) |

- sausage

    Evidence:
    Medium · Derived

    Rasa:
    Salty
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

cautions:
  - high_sodium

balancedBy:
  - mustard
  - sauerkraut

tags:
  - processed_meat

notes:
  - Refers to a typical cooked sausage.
  - Add tags such as `pork`, `beef`, or `chicken` depending on the specific product.
  - Smoked or heavily spiced sausages may have a stronger Pitta effect.

- One editorial suggestion: instead of putting "(often pork — tag per product)" in the main row, keep the row generic and rely on product-specific tags (tag:pork, tag:beef, etc.). That makes the database cleaner and lets a single sausage entry work across regional variations.


## Dairy (4)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Cheddar** | sweet, sour, salty | heating | V −1 · P +1 · K +1 | tag:animal_rennet |

- cheddar

    Evidence:
    High

    Rasa:
    Sweet
    Sour
    Salty

    Virya:
    Heating

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha  +1

- balancedBy:
  - blackPepper

tags:
  - cheese
  - aged_cheese
  - animal_rennet

notes:
  - Refers to mature cheddar cheese.
  - Mild and extra-mature cheddar share the same overall energetic profile, with stronger maturation tending to increase the warming quality slightly.

- 
| ☐ | **Parmesan** | salty, sweet | heating | V 0 · P +1 · K +1 | tag:animal_rennet |

- parmesan

    Evidence:
    High

    Rasa:
    Salty
    Sweet

    Virya:
    Heating

    Guṇa:
    Heavy
    Dry

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha  +1

- tags:
  - cheese
  - aged_cheese
  - animal_rennet

balancedBy:
  - blackPepper

notes:
  - Refers to authentic Parmigiano Reggiano or similar aged Parmesan-style cheese.
  - Usually consumed in small amounts as a seasoning.

- Confidence - High. The strongest change I'd recommend is Vata −1. Parmesan is drier than cheddar, but its concentrated, nourishing dairy nature still outweighs the drying effect. Using Heavy + Dry also gives it a distinct identity from cheddar while keeping the dosha profile internally consistent.

| ☐ | **Sour cream** | sour, sweet | heating | V −1 · P +1 · K +1 | — |

- sourCream

    Evidence:
    Medium

    Rasa:
    Sour
    Sweet

    Virya:
    Cooling

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha  +1

- balancedBy:
  - blackPepper

tags:
  - cultured_dairy

notes:
  - Refers to plain cultured sour cream.
  - Reduced-fat versions are slightly lighter but retain similar energetics.

- Confidence - Moderate. The main question is whether your taxonomy treats fermented dairy as intrinsically heating or treats virya and dosha effect separately. If you're aiming for consistency across dairy, I'd classify sour cream as Cooling while retaining Pitta +1 due to its sour, fermented nature. That gives you a cleaner and more consistent model across yogurt, kefir, and other cultured dairy products.

| ☐ | **Ricotta** | sweet | cooling | V −1 · P −1 · K +1 | — |

- ricotta

    Evidence:
    Medium

    Rasa:
    Sweet

    Virya:
    Cooling

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta  -1
    Kapha  +1

- balancedBy:
  - blackPepper

tags:
  - cheese
  - fresh_cheese

notes:
  - Refers to plain fresh ricotta.
  - Whole-milk and whey ricotta share broadly similar energetics.

- Confidence - High. I would keep your dosha profile unchanged. Fresh ricotta is an excellent example of a cooling, sweet dairy food that nourishes Vata, soothes Pitta, and mildly increases Kapha. The only addition I'd make is explicitly assigning Heavy + Moist guṇa to distinguish it from aged cheeses.

## Plant milk & beverages (5)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Rice milk** | sweet | cooling | V 0 · P −1 · K +1 | — |

- riceMilk

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta  -1
    Kapha  +1

- balancedBy:
  - cinnamon

tags:
  - plant_milk

notes:
  - Refers to unsweetened rice milk.
  - Sweetened commercial varieties are more Kapha-promoting.

- Confidence - High. I would keep your proposed dosha scores exactly as they are. The only addition I'd make is explicitly assigning Light + Moist guṇa, which accurately reflects rice milk's watery, sweet nature and distinguishes it from richer dairy and plant milks.

| ☐ | **Masala chai** | sweet, pungent, astringent | heating | V −1 · P +1 · K 0 | allergen:dairy, caution:caffeine |

- masalaChai

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Pungent
    Astringent

    Virya:
    Heating

    Guṇa:
    Light
    Moist

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha   0

- allergens:
  - dairy

cautions:
  - caffeine

balancedBy:
  - none

tags:
  - tea

notes:
  - Refers to traditional masala chai prepared with black tea, milk, spices, and a moderate amount of sweetener.
  - Very sweet or heavily spiced versions may shift the Kapha or Pitta effect, respectively.

- Confidence - High. I would keep your dosha scores unchanged. The warming spice blend is the defining Ayurvedic feature of masala chai, making it Vata-pacifying, mildly Pitta-aggravating, and broadly neutral for Kapha despite the inclusion of milk and sugar in the traditional preparation.

| ☐ | **Lassi (sweet)** | sweet, sour | cooling | V −1 · P 0 · K +1 | allergen:dairy |

- sweetLassi

    Evidence:
    High

    Rasa:
    Sweet
    Sour

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata   -1
    Pitta  -1
    Kapha  +1

- allergens:
  - dairy

balancedBy:
  - cardamom

tags:
  - yogurt_drink

notes:
  - Refers to traditional sweet lassi made with yogurt diluted with water.
  - Mango lassi or heavily sweetened commercial versions may be more Kapha-promoting.

- Confidence - High. This is one of the few foods where classical Ayurvedic guidance is quite specific. Properly prepared sweet lassi is traditionally regarded as more digestible and more Pitta-soothing than yogurt, while still retaining a mild Kapha-promoting effect because of its dairy and sweet taste.

| ☐ | **Apple juice** | sweet | cooling | V 0 · P −1 · K +1 | — |

- appleJuice

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Sour

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta  -1
    Kapha  +1

- balancedBy:
  - cinnamon

tags:
  - juice

notes:
  - Refers to unsweetened 100% apple juice.
  - Clear juice and cloudy juice share broadly similar energetics.
  - Juice is more Kapha-promoting than a whole apple because the fiber is removed.

- Confidence - High. I would keep your dosha scores unchanged. The only refinement I'd suggest is acknowledging the mild Sour rasa, while preserving apple juice's overall cooling, Pitta-soothing, and mildly Kapha-promoting profile.


| ☐ | **Lemonade** | sweet, sour | cooling | V 0 · P 0 · K +1 | caution:high_sugar |

- lemonade

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Sour

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  +1

- cautions:
  - high_sugar

balancedBy:
  - mint

tags:
  - beverage
  - citrus

notes:
  - Refers to traditional sweetened lemonade.
  - Unsweetened lemonade would be less Kapha-promoting.
  - Fresh homemade lemonade is generally preferable to commercial soft-drink versions.

- Confidence - Moderate. The main ambiguity is how much weight you give to virya versus rasa. If your taxonomy generally lets a dominant sour taste increase Pitta despite a cooling virya (as with lime and lemon), then Pitta +1 is the more internally consistent choice. If you instead prioritize virya, your original Pitta 0 is also a defensible simplification.



## Condiments & spreads (6)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Mustard** | pungent | heating | V 0 · P +1 · K −1 | — |

- mustard

    Evidence:
    High

    Rasa:
    Pungent

    Virya:
    Heating

    Guṇa:
    Light
    Dry

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  -1

- balancedBy:
  - yogurt

tags:
  - condiment
  - spice

notes:
  - Refers to prepared mustard or ground mustard seed.
  - Very hot mustard varieties may have a stronger Pitta effect.

- Confidence - High. I wouldn't change your dosha scores. Mustard is one of the clearest examples of a heating, pungent, Kapha-reducing food in Ayurveda, and your proposed profile is internally consistent with both the classical texts and the rest of your spice taxonomy.

| ☐ | **Pesto** | pungent, salty, bitter | heating | V −1 · P +1 · K +1 | allergen:nuts, allergen:dairy |

- pesto

    Evidence:
    Medium · Derived

    Rasa:
    Pungent
    Salty
    Bitter
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
  - nuts
  - dairy

balancedBy:
  - lemon

tags:
  - sauce

notes:
  - Refers to traditional basil pesto with olive oil, pine nuts, Parmesan or Pecorino, garlic, and basil.
  - Vegan pesto or nut-free pesto may differ slightly in energetics.

- Confidence - High. I would keep your dosha profile unchanged. The only refinement I'd suggest is adding Sweet as a secondary rasa. In Ayurveda, the nourishing qualities of olive oil, nuts, and cheese contribute a meaningful madhura component, even if it isn't obvious in the immediate taste.

| ☐ | **Salsa** | sour, pungent, salty | heating | V 0 · P +1 · K −1 | tag:nightshade |

- salsa

    Evidence:
    Medium · Derived

    Rasa:
    Sour
    Pungent
    Salty
    Sweet

    Virya:
    Heating

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  -1

- tags:
  - condiment
  - sauce
  - nightshade

balancedBy:
  - avocado

notes:
  - Refers to fresh tomato-based salsa (pico de gallo or similar).
  - Cooked or smoky salsas may be slightly more heating.

- Confidence - High. I would keep your dosha profile unchanged. The only refinement I'd suggest is acknowledging the subtle Sweet rasa contributed by ripe tomatoes and onions, while preserving salsa's identity as a light, heating, Kapha-reducing condiment.

| ☐ | **Guacamole** | sweet, sour | cooling | V −1 · P 0 · K +1 | — |

- guacamole

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Astringent
    Sour

    Virya:
    Cooling

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- balancedBy:
  - cilantro

tags:
  - dip

notes:
  - Refers to a traditional guacamole made primarily from avocado, lime, onion, cilantro, and salt.
  - Very spicy versions may have a slightly stronger Pitta effect.

- Confidence - High. I would keep your dosha scores unchanged. The only refinement I'd suggest is adding Astringent to better reflect avocado's energetic profile while keeping guacamole's overall identity as a cooling, nourishing, Vata-pacifying dip.

| ☐ | **Jam** | sweet, sour | cooling | V −1 · P 0 · K +1 | caution:high_sugar |

- jam

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Sour

    Virya:
    Neutral

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- cautions:
  - high_sugar

balancedBy:
  - wholeGrainBread

tags:
  - spread

notes:
  - Refers to traditional fruit jam with added sugar.
  - Low-sugar or fruit-only preserves may be slightly less Kapha-promoting.

- Confidence - Moderate to high. The dosha profile is already good. The main refinement I'd recommend is Neutral virya, reflecting that jam is a cooked, concentrated preserve rather than a fresh fruit. That gives it a more consistent place alongside juices, fresh fruit, and other processed fruit products in your taxonomy.


| ☐ | **Tahini** | sweet, bitter, astringent | heating | V −1 · P +1 · K +1 | allergen:sesame |

- tahini

    Evidence:
    High

    Rasa:
    Sweet
    Bitter
    Astringent

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
  - sesame

balancedBy:
  - lemon

tags:
  - seed_butter
  - spread

notes:
  - Refers to plain sesame paste (tahini).
  - Tahini-based sauces with lemon and water may have a slightly milder Pitta effect.

- Confidence - High. I would keep your profile unchanged. Tahini closely reflects the classical Ayurvedic properties of sesame: warming, nourishing, oily, Vata-pacifying, and mildly increasing both Pitta and Kapha. The only addition I'd make is explicitly assigning Heavy + Oily guṇa to align it with other nut and seed butters.


## Nuts (2)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Pecan** | sweet | heating | V −1 · P +1 · K +1 | allergen:nuts |

- pecan

    Evidence:
    Medium

    Rasa:
    Sweet

    Virya:
    Neutral

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - nuts

balancedBy:
  - cinnamon

tags:
  - tree_nut

notes:
  - Refers to raw or dry-roasted pecans.
  - Candied pecans should be modelled separately because of the added sugar.

- Confidence - Moderate. Pecans are not specifically classified in classical Ayurveda, so any profile is inferred. A Neutral / P0 classification is, in my view, the most conservative and internally consistent choice for a database, reserving Heating / P+1 for nuts and seeds with a stronger traditional warming character such as walnuts and sesame.

| ☐ | **Macadamia** | sweet | neutral | V −1 · P 0 · K +1 | allergen:nuts |

- macadamia

    Evidence:
    Medium

    Rasa:
    Sweet

    Virya:
    Neutral

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - nuts

balancedBy:
  - cinnamon

tags:
  - tree_nut

notes:
  - Refers to raw or dry-roasted macadamia nuts.
  - Salted or honey-roasted versions may have stronger Kapha-promoting effects.

- Confidence - High. I wouldn't change your profile. It accurately captures macadamias as a rich, nourishing, neutral tree nut that pacifies Vata, is broadly neutral for Pitta, and modestly increases Kapha.

## Oil & sweeteners (2)

| ✔ | Food | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Rapeseed / canola oil** | sweet | neutral | V −1 · P 0 · K +1 | — |

- rapeseedOil

    Evidence:
    Low · Derived

    Rasa:
    Sweet

    Virya:
    Neutral

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- balancedBy:
  - mustard

tags:
  - cooking_oil

notes:
  - Refers to refined canola (rapeseed) oil.
  - Cold-pressed rapeseed oil has a stronger flavor but similar overall energetics.

- Confidence - Moderate. Since rapeseed/canola oil isn't a classical Ayurvedic ingredient, any classification is necessarily inferred. Your dosha profile is sensible and internally consistent. The only change I'd make is lowering the evidence level to Low · Derived to reflect that this is an extrapolation rather than a traditional classification.


| ☐ | **Brown sugar** | sweet | cooling | V −1 · P −1 · K +1 | — |

- brownSugar

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Neutral

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- balancedBy:
  - cinnamon

tags:
  - sweetener

notes:
  - Refers to commercial brown cane sugar.
  - Traditional jaggery or panela should be modelled separately because they have distinct Ayurvedic and culinary properties.

- Confidence - Moderate to high. The main issue is distinguishing modern brown sugar from traditional unrefined cane sweeteners. For a generic "brown sugar" entry, I think Neutral / P0 is the more accurate and internally consistent classification, while reserving special treatment for jaggery or other traditional cane products.

---

## Notes / corrections

_(add feedback per food here)_
