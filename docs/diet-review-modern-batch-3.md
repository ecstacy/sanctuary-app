# Modern-diet review batch 3 (53 entries) — eating out & store snacks

_All rows are `reviewStatus: 'draft'` — invisible to the app until fact-checked and flipped to `reviewed` (add the id to `REVIEWED_SIGNED_OFF` in `dietSafety.test.js`). Source: property-derived (`modern`, `confidence: medium`). Sign convention: doshaEffect −1 pacifies / +1 aggravates._

**What this batch is:** the meals people ORDER OUT and the snacks they BUY — composite dishes modelled as one row each (same precedent as hummus / pesto / ketchup / instant noodles / fries). The doshaEffect is DERIVED from typical constituents (listed in each `source.note`). Recipes vary by restaurant/brand, so these are directional reads of a "standard" version.

**How to review:** tick ✅ if it looks right, or note a correction under the row (freeform, same as batches 1–2 — I'll apply your edits and flip the flags). Composite dishes are judged as the WHOLE plate, so a rich sauce or deep-fry usually dominates a lighter base.

## Eating out — restaurant & takeaway (33)

| ✔ | Dish | rasa | vīrya | doshaEffect | flags |
|---|------|------|-------|-------------|-------|
| ☐ | **Pizza** (margherita) | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy |

- pizzaMargherita

    Evidence:
    Medium · Derived

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

- allergens:
  - gluten
  - dairy

balancedBy:
  - arugula

tags:
  - fast_food
  - italian

notes:
  - Refers to a classic Margherita pizza.
  - Spicy toppings (e.g. chili or pepperoni) would increase the Pitta effect.
  - Extra cheese or stuffed crust would further increase Kapha.

- The only minor editorial suggestion is to keep the allergen format consistent with your other entries, for example: allergen:gluten, allergen:dairy rather than mixing tagged and untagged allergen labels.


| ☐ | **Cheeseburger** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy · tag:beef |

- cheeseburger

    Evidence:
    Medium · Derived

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
  - gluten
  - dairy

tags:
  - fast_food
  - beef

balancedBy:
  - lettuce

notes:
  - Refers to a classic beef cheeseburger.
  - Bacon, spicy sauces, or double patties would further increase Pitta and Kapha.

- 
| ☐ | **Sushi** | sweet, salty, sour | cooling | V 0 · P 0 · K +1 | allergen:fish, soy |

- sushi

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Salty
    Sour

    Virya:
    Cooling

    Guṇa:
    Light
    Moist

    Dosha:
    Vata    0
    Pitta   0
    Kapha   0

- allergens:
  - fish
  - soy

balancedBy:
  - wasabi

tags:
  - japanese

notes:
  - Refers to standard nigiri or maki with fish.
  - Tempura rolls, mayonnaise-based rolls, and cream cheese rolls should be modelled separately.

- Confidence - Moderate. "Sushi" is a broad category, so the exact profile depends on what's included. For a generic fish-based sushi entry (nigiri and simple maki), I think V0 · P0 · K0 is the most balanced representation. If you instead mean salmon-heavy rolls, mayonnaise-based rolls, or deep-fried specialty rolls, then Kapha +1 would be appropriate. For a general database, I'd reserve K+1 for those richer variants rather than sushi as a whole.

| ☐ | **Ramen** (restaurant) | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten, soy · caution:high_sodium |

- ramen

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Sweet
    Umami

    Virya:
    Heating

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha  +1

- allergens:
  - gluten
  - soy

cautions:
  - high_sodium

tags:
  - japanese
  - noodle_soup

balancedBy:
  - bokChoy

notes:
  - Refers to a typical restaurant ramen.
  - Tonkotsu ramen is generally richer than shio or shoyu ramen.
  - Instant ramen should be modelled separately.

- The only refinement I'd suggest is not replacing or expanding the Ayurvedic rasa system with "umami." If you want to capture that characteristic, it's better stored as a separate culinary descriptor or note, while keeping the classical rasa field limited to the traditional six tastes.

| ☐ | **Pad thai** | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:peanuts, fish, egg |

- padThai

    Evidence:
    Medium · Derived

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

- allergens:
  - peanuts
  - fish
  - egg

balancedBy:
  - lime

tags:
  - thai
  - noodle_dish

notes:
  - Refers to a traditional restaurant-style Pad Thai.
  - Extra chili increases the Pitta effect.
  - Shrimp, chicken, or tofu versions share broadly similar energetics.

- The only refinement I'd make is explicitly assigning Heavy + Oily guṇa, which distinguishes Pad Thai from lighter noodle dishes and accurately reflects its stir-fried, peanut- and oil-rich preparation.

| ☐ | **Fried rice** | salty, sweet | heating | V 0 · P +1 · K +1 | allergen:soy, egg |

- friedRice

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

- allergens:
  - soy
  - egg

balancedBy:
  - bokChoy

tags:
  - rice_dish
  - stir_fry

notes:
  - Refers to a typical restaurant-style fried rice.
  - Seafood or meat versions retain similar overall energetics.

- The only substantive change I'd make is Vata −1. The combination of warm rice, oil, and stir-frying makes fried rice noticeably more Vata-pacifying than plain steamed rice, while retaining the expected Pitta +1 and Kapha +1 profile of a rich, restaurant-style dish.


| ☐ | **Spring roll** (fried) | salty, sweet | heating | V 0 · P +1 · K +1 | allergen:gluten |

- friedSpringRoll

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

- allergens:
  - gluten

balancedBy:
  - lettuce

tags:
  - fried_food
  - appetizer

notes:
  - Refers to a deep-fried wheat-wrapper spring roll.
  - Fresh rice-paper spring rolls should be modelled separately.

- The only substantive change I'd recommend is Vata −1. In Ayurveda, the oiliness and warmth of deep-frying generally outweigh the drying quality of a crisp pastry shell, making fried spring rolls more grounding than neutral while retaining their clear Pitta- and Kapha-increasing tendencies.


| ☐ | **Fresh summer roll** | sweet, astringent | cooling | V 0 · P −1 · K 0 | — |

- freshSummerRoll

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Astringent
    Fresh herbs: often add subtle pungent or bitter notes depending on the filling

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
  - peanutSauce

tags:
  - vietnamese
  - fresh_roll

notes:
  - Refers to fresh rice-paper summer rolls.
  - Peanut dipping sauce should be modelled separately, as it substantially increases Kapha.

- 
| ☐ | **Dumplings** (steamed) | sweet, salty | heating | V −1 · P 0 · K +1 | allergen:gluten, soy |

- steamedDumplings

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Salty

    Virya:
    Neutral

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - gluten
  - soy

balancedBy:
  - blackVinegar

tags:
  - dumpling

notes:
  - Refers to plain steamed dumplings.
  - Pan-fried dumplings (potstickers) should be modelled separately with a slightly more heating profile.

- The only substantive change I'd recommend is Heating → Neutral. Steamed dumplings are warming to eat because they're served hot, but their intrinsic energetic quality is better represented as neutral, with the moist, soft preparation making them Vata-pacifying and mildly Kapha-promoting without significantly aggravating Pitta.

| ☐ | **Fried dumplings** (gyoza) | sweet, salty | heating | V 0 · P +1 · K +1 | allergen:gluten, soy |

- friedDumplings

    Evidence:
    Medium · Derived

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
  - gluten
  - soy

balancedBy:
  - cabbage

tags:
  - dumpling
  - pan_fried

notes:
  - Refers to pan-fried gyoza or potstickers.
  - Deep-fried dumplings would be even more heating and oily.

- The only substantive change I'd recommend is Vata −1. The combination of pan-frying, oil, and a moist filling makes fried dumplings more grounding than neutral, while retaining the expected warming and Kapha-promoting characteristics of a pan-fried wheat-based dish.

| ☐ | **Tacos** | salty, pungent, sweet | heating | V 0 · P +1 · K +1 | tag:nightshade |

- tacos

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Pungent
    Sweet

    Virya:
    Heating

    Guṇa:
    Moderately Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha  +1

- tags:
  - mexican
  - nightshade

balancedBy:
  - cilantro

notes:
  - Refers to a typical restaurant taco with seasoned filling and salsa.
  - Fish tacos are generally lighter.
  - Bean tacos are slightly more Vata-provoking.
  - Cheese- and sour cream-heavy tacos increase Kapha further.

- Confidence - Moderate. The biggest source of uncertainty is the broadness of "tacos." For a generic restaurant taco, I think V−1 · P+1 · K+1 is a better default than V0 · P+1 · K+1, because the warm tortilla and moist filling usually outweigh any drying qualities. If you later split tacos into fish, vegetarian, and beef variants, those can each receive more specific dosha profiles.

| ☐ | **Burrito** (meat) | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy |

- burrito

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Salty
    Sour

    Virya:
    Heating

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha  +1

- allergens:
  - gluten
  - dairy

tags:
  - mexican

balancedBy:
  - cilantro

notes:
  - Refers to a typical restaurant-style meat burrito.
  - Cheese- and sour cream-heavy versions further increase Kapha.
  - Extra chili increases the Pitta effect.


| ☐ | **Veggie burrito** (bean) | sweet, astringent | neutral | V 0 · P 0 · K +1 | allergen:gluten, dairy |

- veggieBurrito

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Astringent
    Salty

    Virya:
    Neutral

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - gluten
  - dairy

tags:
  - mexican
  - vegetarian

balancedBy:
  - cilantro

notes:
  - Refers to a typical restaurant bean burrito.
  - Vegan versions without cheese are slightly lighter but retain a similar overall profile.

- Confidence - Moderate to high. The biggest variable is what you mean by "veggie burrito." If it's a restaurant-style bean burrito, I recommend V−1, because the warm tortilla, rice, and moist filling more than offset the Vata-provoking nature of the beans. If you later add a vegan bean-and-vegetable burrito with no cheese and minimal oil, then V0 would be a reasonable alternative.

| ☐ | **Quesadilla** | sweet, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy |

- quesadilla

    Evidence:
    Medium · Derived

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
  - gluten
  - dairy

balancedBy:
  - salsa

tags:
  - mexican

notes:
  - Refers to a classic cheese quesadilla.
  - Chicken or beef fillings increase the nourishing quality but don't substantially change the overall dosha profile.

- 
| ☐ | **Nachos** | salty | heating | V +1 · P +1 · K +1 | allergen:dairy · tag:nightshade · caution:high_sodium |

- nachos

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
    Vata    0
    Pitta  +1
    Kapha  +1

- allergens:
  - dairy

cautions:
  - high_sodium

tags:
  - mexican
  - nightshade

balancedBy:
  - guacamole

notes:
  - Refers to loaded restaurant-style nachos with cheese.
  - Plain tortilla chips should be modelled separately.

- Confidence
    Moderate to high. The recommendation depends on what "nachos" means in your database:
    Plain tortilla chips → V+1 · P+1 · K+1 is appropriate.
    Loaded restaurant nachos (the usual interpretation) → V0 · P+1 · K+1 is a better default because the cheese and other toppings offset much of the dryness.

| ☐ | **Falafel** | astringent, pungent | heating | V 0 · P +1 · K +1 | — |

- falafel

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Astringent
    Pungent

    Virya:
    Heating

    Guṇa:
    Heavy
    Dry

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  +1

- balancedBy:
  - tahini

tags:
  - middle_eastern
  - fried_food

notes:
  - Refers to traditional deep-fried falafel.
  - Baked falafel is lighter and less Kapha-promoting.

| ☐ | **Shawarma / doner** | salty, pungent | heating | V −1 · P +1 · K +1 | allergen:gluten |

- shawarmaDoner

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Pungent
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
  - gluten

balancedBy:
  - lettuce

tags:
  - middle_eastern
  - fast_food

notes:
  - Refers to a typical shawarma or döner wrap/sandwich.
  - Garlic or yogurt sauces increase the nourishing quality, while spicy sauces further increase Pitta.

- Confidence - High. I would keep your dosha profile unchanged. The only refinement I'd suggest is adding Sweet to the rasa, reflecting the meat and flatbread, which contribute an important madhura quality in Ayurvedic terms despite the dish tasting predominantly salty and spicy.

| ☐ | **Butter chicken** | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:dairy |

- butterChicken

    Evidence:
    Medium · Derived

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

- allergens:
  - dairy

balancedBy:
  - cilantro

tags:
  - indian
  - curry

notes:
  - Refers to a traditional restaurant-style butter chicken.
  - Extra cream or butter further increases Kapha.
  - Spicier regional versions further increase Pitta.

- The only addition I'd make is explicitly assigning Heavy + Oily guṇa, which distinguishes it from lighter tomato- or broth-based curries.

| ☐ | **Tikka masala** | sweet, sour, pungent | heating | V −1 · P +1 · K +1 | allergen:dairy |

- tikkaMasala

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Sour
    Pungent

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

balancedBy:
  - cilantro

tags:
  - indian
  - curry

notes:
  - Refers to a standard restaurant-style chicken tikka masala.
  - Spicier preparations further increase Pitta.
  - Cream-heavy versions move closer to butter chicken energetically.


| ☐ | **Biryani** | sweet, pungent, salty | heating | V −1 · P +1 · K +1 | — |

- biryani

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Pungent
    Salty
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

- balancedBy:
  - raita

tags:
  - indian
  - rice_dish

notes:
  - Refers to a traditional biryani.
  - Vegetable, chicken, and lamb biryanis share broadly similar energetics.
  - Very spicy regional biryanis may have a stronger Pitta effect.

- The only optional refinement is adding Astringent if your database aims to capture secondary energetic tastes.

| ☐ | **Samosa** | salty, pungent | heating | V 0 · P +1 · K +1 | allergen:gluten · tag:nightshade |

- samosa

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Pungent
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
  - gluten

tags:
  - indian
  - fried_food
  - nightshade

balancedBy:
  - mintChutney

notes:
  - Refers to a traditional potato samosa.
  - Meat samosas have a very similar energetic profile.

- Confidence - High. I would adjust Vata from 0 to −1 and add Sweet to the rasa. In Ayurveda, the wheat pastry and potato filling contribute an important nourishing (madhura) quality, while the warmth and oil from deep-frying make the overall effect more Vata-pacifying than neutral.

| ☐ | **Pakora / bhaji** | astringent, pungent | heating | V 0 · P +1 · K +1 | — |

- pakora

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Astringent
    Pungent

    Virya:
    Heating

    Guṇa:
    Heavy
    Oily

    Dosha:
    Vata    0
    Pitta  +1
    Kapha  +1

- balancedBy:
  - mintChutney

tags:
  - indian
  - fried_food

notes:
  - Refers to traditional deep-fried pakoras or onion bhajis.
  - Spinach, potato, and onion variants share similar overall energetics.

- The only refinement I'd recommend is adding Sweet to the rasa, since gram flour (besan) is fundamentally a sweet-astringent legume. The frying process largely offsets the drying nature of the flour, making V0 an appropriate overall classification.

| ☐ | **Pho** | salty, sweet | heating | V −1 · P 0 · K 0 | caution:high_sodium |

- pho

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Sweet
    Pungent

    Virya:
    Heating

    Guṇa:
    Light
    Moist

    Dosha:
    Vata   -1
    Pitta   0
    Kapha   0

- cautions:
  - high_sodium

balancedBy:
  - beanSprouts

tags:
  - vietnamese
  - noodle_soup

notes:
  - Refers to a typical beef or chicken pho.
  - Extra chili increases the Pitta effect.
  - Rich bone-broth versions may be slightly more Kapha-promoting.

- The only optional refinement is acknowledging the mild Pungent quality contributed by its characteristic spices and fresh garnishes.

| ☐ | **Fish and chips** | salty | heating | V −1 · P +1 · K +1 | allergen:fish, gluten · tag:nightshade · caution:high_sodium |

- fishAndChips

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

- allergens:
  - fish
  - gluten

tags:
  - british
  - fried_food
  - nightshade

cautions:
  - high_sodium

balancedBy:
  - peas

notes:
  - Refers to a traditional battered fish and chips meal.
  - Grilled fish with chips should be modelled separately.

- The only refinement I'd suggest is adding Sweet to the rasa, since both the wheat batter and potatoes contribute an important madhura quality in Ayurvedic terms, even though the dominant sensory impression is salty.

| ☐ | **Fried chicken** | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten |

- friedChicken

    Evidence:
    Medium · Derived

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
  - gluten

balancedBy:
  - coleslaw

tags:
  - fried_food
  - poultry

notes:
  - Refers to classic battered or breaded fried chicken.
  - Spicy fried chicken should be modelled separately.

- 
| ☐ | **Chicken wings** | salty, pungent, sweet | heating | V −1 · P +1 · K +1 | — |

- chickenWings

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Pungent
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
  - celery

tags:
  - poultry

notes:
  - Refers to typical restaurant-style chicken wings.
  - Buffalo, peri-peri, or extra-spicy wings may have a stronger Pitta effect.
  - Breaded fried wings are slightly heavier than roasted or grilled wings.

- 
| ☐ | **Caesar salad** | salty, sour | heating | V −1 · P +1 · K +1 | allergen:dairy, egg, fish, gluten |

- caesarSalad

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Sour
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
  - egg
  - fish
  - gluten

balancedBy:
  - lemon

tags:
  - salad

notes:
  - Refers to a classic Caesar salad.
  - Grilled chicken is optional and does not substantially alter the overall dosha profile.

- Confidence - High. I would keep your dosha profile unchanged. The only refinement I'd suggest is adding Sweet to the rasa, reflecting the wheat croutons, Parmesan, and optional chicken, while preserving Caesar salad's identity as a rich, warming, Vata-pacifying salad.

| ☐ | **Club sandwich / BLT** | salty, sweet | heating | V −1 · P +1 · K +1 | allergen:gluten, egg, dairy |

- clubSandwich

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Sweet
    Sour

    Virya:
    Heating

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta  +1
    Kapha  +1

- allergens:
  - gluten
  - egg
  - dairy

balancedBy:
  - lettuce

tags:
  - sandwich

notes:
  - Refers to a classic club sandwich or BLT with mayonnaise.
  - Cheese and extra bacon further increase Kapha.

- The only optional refinement is adding Sour to the rasa if your default definition assumes mayonnaise and tomato, which is typical for both club sandwiches and most BLTs.

| ☐ | **Lasagna** | sweet, sour, salty | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy |

- lasagna

    Evidence:
    Medium · Derived

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

- allergens:
  - gluten
  - dairy

balancedBy:
  - arugula

tags:
  - italian
  - pasta
  - baked

notes:
  - Refers to a traditional baked lasagna.
  - Meat and vegetarian lasagnas have broadly similar energetics.
  - Extra cheese or cream further increases Kapha.

- 
| ☐ | **Mac and cheese** | sweet, salty | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy |

- macAndCheese

    Evidence:
    Medium · Derived

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
    Pitta   0
    Kapha  +1

- allergens:
  - gluten
  - dairy

balancedBy:
  - blackPepper

tags:
  - pasta
  - comfort_food

notes:
  - Refers to a classic macaroni and cheese.
  - Baked versions have similar energetics.
  - Spicy or buffalo mac and cheese should be modelled separately.

- 
| ☐ | **Risotto** | sweet, salty | heating | V −1 · P 0 · K +1 | allergen:dairy |

- risotto

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Salty
    Umami

    Virya:
    Heating

    Guṇa:
    Heavy
    Moist

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - dairy

balancedBy:
  - parsley

tags:
  - italian
  - rice_dish

notes:
  - Refers to a classic Parmesan or mushroom risotto.
  - Seafood or saffron risottos have broadly similar energetics.

- The only refinement I'd suggest is explicitly classifying risotto as Heavy + Moist rather than oily, which better reflects its creamy, stock-based preparation and distinguishes it from baked cheese dishes and fried foods.

| ☐ | **Pancakes** | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg |

- pancakes

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

- allergens:
  - gluten
  - dairy
  - egg

balancedBy:
  - berries

tags:
  - breakfast

notes:
  - Refers to plain pancakes.
  - Sweet toppings (e.g. syrup, jam, chocolate spread) increase the Kapha-promoting effect.
  - Savoury pancakes should be modelled separately.

- The only refinement I'd suggest is Heavy + Moist as the guṇa, which better captures the soft, tender nature of pancakes and distinguishes them from crisp or deep-fried foods.

| ☐ | **Waffles** | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg |

- waffles

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Heating

    Guṇa:
    Heavy
    Dry

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - gluten
  - dairy
  - egg

balancedBy:
  - berries

tags:
  - breakfast

notes:
  - Refers to plain waffles.
  - Sweet toppings substantially increase the Kapha-promoting effect.
  - Belgian waffles are typically richer but share similar energetics.

- The only refinement I'd suggest is classifying waffles as Heavy + Dry, which distinguishes them from pancakes while remaining consistent with their crisp texture and baked preparation.

## Store snacks — packaged & grab-and-go (20)

| ✔ | Snack | rasa | vīrya | doshaEffect | flags |
|---|-------|------|-------|-------------|-------|
| ☐ | **Protein bar** | sweet | neutral | V 0 · P 0 · K +1 | caution:processed |

- proteinBar

    Evidence:
    Low · Derived

    Rasa:
    Sweet

    Virya:
    Neutral

    Guṇa:
    Heavy
    Dry

    Dosha:
    Vata   +1
    Pitta   0
    Kapha  +1

- cautions:
  - processed

balancedBy:
  - warmWater

tags:
  - snack

notes:
  - Refers to a typical commercial protein bar.
  - Nut-based bars are generally oilier, while high-fiber bars tend to be drier.
  - Homemade whole-food protein bars may have different energetics.

- Confidence - Moderate. Because protein bars vary enormously, there is no single perfect classification. For a generic commercial protein bar, however, I think V+1 · P0 · K+1 with Heavy + Dry is the most robust default, reflecting their processed, compact, and often drying nature.

| ☐ | **Granola bar** | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten, nuts · caution:high_sugar |

- granolaBar

    Evidence:
    Low · Derived

    Rasa:
    Sweet

    Virya:
    Neutral

    Guṇa:
    Heavy
    Dry

    Dosha:
    Vata   +1
    Pitta   0
    Kapha  +1

- allergens:
  - gluten
  - nuts

cautions:
  - high_sugar

balancedBy:
  - warmMilk

tags:
  - snack

notes:
  - Refers to a typical commercial granola bar.
  - Low-sugar or nut-heavy versions may be slightly less Kapha-promoting.

- The only refinement I'd suggest is explicitly assigning Heavy + Dry guṇa, which accurately reflects the compact, processed nature of most commercial granola bars and distinguishes them from softer, more moist snack foods.

| ☐ | **Chocolate bar** (filled) | sweet | heating | V −1 · P +1 · K +1 | allergen:dairy, nuts · caution:high_sugar |

- filledChocolateBar

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
  - nuts

cautions:
  - high_sugar

balancedBy:
  - berries

tags:
  - confectionery

notes:
  - Refers to a typical filled milk chocolate bar (e.g. caramel, nougat, or nut-filled).
  - Dark chocolate should be modelled separately due to its higher cocoa content and lower sugar.

- 
| ☐ | **Gummy candy** | sweet, sour | heating | V −1 · P +1 · K +1 | tag:gelatin · caution:high_sugar |

- gummyCandy

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Sour

    Virya:
    Neutral

    Guṇa:
    Heavy
    Sticky

    Dosha:
    Vata    0
    Pitta   0
    Kapha  +1

- tags:
  - confectionery
  - gelatin

cautions:
  - high_sugar

balancedBy:
  - warmWater

notes:
  - Refers to a typical fruit-flavored gummy candy.
  - Sour-coated gummies have a slightly stronger Pitta-provoking tendency but generally remain in the same dosha category.

- Confidence - Moderate. Gummies are a modern processed food with no direct classical Ayurvedic equivalent. I think a Neutral / V0 / P0 / K+1 profile better reflects their high sugar content, lack of fat, and absence of inherently warming ingredients, while still recognizing their strong Kapha-promoting nature.

| ☐ | **Pretzels** | salty, sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten · caution:high_sodium |

- pretzels

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Sweet

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

cautions:
  - high_sodium

balancedBy:
  - hummus

tags:
  - snack

notes:
  - Refers to plain baked pretzels.
  - Soft pretzels with butter are heavier and slightly more Vata-pacifying than hard snack pretzels.

- The only refinement I'd suggest is classifying pretzels as Light + Dry, which better reflects their crisp, low-fat, baked nature and clearly distinguishes them from heavier baked goods and fried snacks.

| ☐ | **Tortilla chips** | salty | heating | V +1 · P +1 · K +1 | caution:high_sodium |

- tortillaChips

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Sweet

    Virya:
    Heating

    Guṇa:
    Light
    Dry
    Oily

    Dosha:
    Vata   +1
    Pitta  +1
    Kapha  +1

- cautions:
  - high_sodium

balancedBy:
  - guacamole

tags:
  - snack
  - mexican

notes:
  - Refers to plain salted tortilla chips.
  - Loaded nachos should be modelled separately.

- The only refinements I'd suggest are adding Sweet to the rasa (from the corn) and explicitly distinguishing tortilla chips from loaded nachos through their dry, crisp guṇa.

| ☐ | **Cheese puffs** | salty, sweet | heating | V +1 · P +1 · K +1 | allergen:dairy · caution:processed, high_sodium |

- cheesePuffs

    Evidence:
    Low · Derived

    Rasa:
    Salty
    Sweet

    Virya:
    Heating

    Guṇa:
    Light
    Dry
    Oily

    Dosha:
    Vata   +1
    Pitta  +1
    Kapha  +1

- allergens:
  - dairy

cautions:
  - processed
  - high_sodium

balancedBy:
  - freshVegetables

tags:
  - snack

notes:
  - Refers to puffed corn cheese snacks.
  - Baked versions are slightly less oily but retain similar overall energetics.

- The main refinement I'd suggest is lowering the evidence to Low · Derived and explicitly classifying cheese puffs as Dry + Oily, which best reflects their airy yet oil-coated, ultra-processed nature.

| ☐ | **Trail mix** | sweet, astringent | heating | V −1 · P +1 · K +1 | allergen:nuts |

- trailMix

    Evidence:
    Low · Derived

    Rasa:
    Sweet
    Astringent

    Virya:
    Neutral

    Guṇa:
    Heavy
    Oily
    Dry

    Dosha:
    Vata    0
    Pitta   0
    Kapha  +1

- allergens:
  - nuts

balancedBy:
  - freshFruit

tags:
  - snack

notes:
  - Refers to a classic trail mix of nuts, seeds, and dried fruit.
  - Chocolate-containing trail mixes are slightly more heating.
  - Salted trail mixes have a somewhat stronger Pitta effect.

- Confidence - Moderate. Because trail mix varies enormously by brand and ingredients, there isn't a single canonical Ayurvedic profile. For a generic mix of nuts, seeds, and dried fruit, I think Neutral virya with V0 · P0 · K+1 is the most broadly applicable default. If you instead mean a nut-heavy trail mix with chocolate, your original Heating / P+1 profile would be reasonable.

| ☐ | **Dried apricots** | sweet, sour | neutral | V 0 · P 0 · K +1 | — |

- driedApricots

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Sour

    Virya:
    Neutral

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta   0
    Kapha  +1

- balancedBy:
  - warmWater

tags:
  - dried_fruit

notes:
  - Refers to unsulphured dried apricots.
  - Soaking before eating reduces the drying effect and makes them more Vata-friendly.

- Confidence
High. The main refinement I'd recommend is Vata +1. Drying fundamentally changes the energetic qualities of fruit in Ayurveda, making dried apricots more Vata-provoking than their fresh counterparts, while their concentrated sweetness still gives them a mild Kapha-increasing effect.

| ☐ | **Fruit leather** | sweet, sour | neutral | V 0 · P +1 · K +1 | caution:high_sugar |

- fruitLeather

    Evidence:
    Low · Derived

    Rasa:
    Sweet
    Sour

    Virya:
    Neutral

    Guṇa:
    Light
    Dry

    Dosha:
    Vata   +1
    Pitta   0
    Kapha  +1

- cautions:
  - high_sugar

balancedBy:
  - warmWater

tags:
  - dried_fruit
  - snack

notes:
  - Refers to unsweetened or lightly sweetened fruit leather.
  - Commercial versions with added sugar further increase Kapha.

- Confidence - Moderate to high. Because fruit leather is a modern processed food, the profile is necessarily inferred. I think V+1 · P0 · K+1 best reflects the combination of dehydration (Vata) and concentrated sugars (Kapha), while avoiding overemphasizing the sour component for Pitta in the absence of strongly heating qualities.

| ☐ | **Flapjack (oat bar)** | sweet | neutral | V −1 · P 0 · K +1 | allergen:gluten · caution:high_sugar |

- flapjack

    Evidence:
    Low · Derived

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

- allergens:
  - gluten

cautions:
  - high_sugar

balancedBy:
  - berries

tags:
  - snack
  - baked

notes:
  - Refers to a traditional British oat flapjack made with oats, butter, and syrup.
  - Commercial versions with chocolate or dried fruit remain broadly similar energetically.

- 
| ☐ | **Biscuits** (digestive) | sweet | neutral | V +1 · P 0 · K +1 | allergen:gluten, dairy |

- digestiveBiscuits

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
    Kapha  +1

- allergens:
  - gluten
  - dairy

balancedBy:
  - tea

tags:
  - snack
  - baked

notes:
  - Refers to plain digestive biscuits.
  - Chocolate-coated digestives should be modelled separately due to their richer, more heating profile.

- The only refinement I'd suggest is explicitly assigning Light + Dry guṇa, which accurately reflects the crisp, baked nature of digestive biscuits and distinguishes them from richer baked goods like flapjacks or cakes.

| ☐ | **Chocolate chip cookie** | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |

- chocolateChipCookie

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
    Pitta  +1
    Kapha  +1

- allergens:
  - gluten
  - dairy
  - egg

cautions:
  - high_sugar

balancedBy:
  - milk

tags:
  - dessert
  - baked

notes:
  - Refers to a classic butter-based chocolate chip cookie.
  - Dark chocolate chip cookies have a slightly stronger heating tendency.

- Confidence - Moderate to high. The only substantive change I'd recommend is Pitta +1. While the cookie itself isn't spicy, the inclusion of chocolate and its warming energetic qualities makes it more Pitta-provoking than plain buttery baked goods such as flapjacks or shortbread.

| ☐ | **Donut** | sweet | heating | V −1 · P +1 · K +1 | allergen:gluten, dairy · caution:high_sugar |

- donut

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
  - gluten
  - dairy

cautions:
  - high_sugar

balancedBy:
  - blackCoffee

tags:
  - dessert
  - fried_food

notes:
  - Refers to a classic fried donut.
  - Filled, glazed, or chocolate-coated donuts are slightly richer but retain the same overall energetic profile.


| ☐ | **Muffin** | sweet | heating | V −1 · P 0 · K +1 | allergen:gluten, dairy, egg · caution:high_sugar |

- muffin

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
  - Refers to a plain sweet muffin.
  - Chocolate muffins may justify Pitta +1.
  - Fruit muffins generally retain a similar dosha profile.

- The only refinement I'd emphasize is Heavy + Moist guṇa, which accurately reflects the soft, rich nature of a typical muffin and distinguishes it from fried pastries and crisp baked goods.

| ☐ | **Ice cream bar** | sweet | cooling | V −1 · P −1 · K +1 | allergen:dairy, nuts, soy |

- iceCreamBar

    Evidence:
    Medium · Derived

    Rasa:
    Sweet

    Virya:
    Cooling

    Guṇa:
    Heavy
    Cold
    Oily

    Dosha:
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - dairy
  - nuts
  - soy

balancedBy:
  - berries

tags:
  - frozen_dessert

notes:
  - Refers to a typical dairy-based ice cream bar.
  - Chocolate-coated versions have a slightly more heating influence but retain the same overall dosha profile.

- The main refinement I'd recommend is Pitta 0 rather than −1. While ice cream is cooling, its richness, sugar, and fat prevent it from being strongly Pitta-pacifying in most Ayurvedic interpretations, while it remains distinctly Vata-pacifying and Kapha-promoting.

| ☐ | **Drinkable yoghurt** | sweet, sour | cooling | V −1 · P 0 · K +1 | allergen:dairy · caution:high_sugar |

- drinkableYoghurt

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
    Vata   -1
    Pitta   0
    Kapha  +1

- allergens:
  - dairy

cautions:
  - high_sugar

balancedBy:
  - cinnamon

tags:
  - fermented
  - dairy

notes:
  - Refers to a typical drinkable yogurt.
  - Plain, unsweetened versions are less Kapha-promoting than sweetened commercial varieties.

- The main refinement I'd suggest is explicitly classifying drinkable yogurt as Light + Moist, which distinguishes it from thicker yogurts while remaining consistent with its cooling, nourishing, and mildly Kapha-promoting nature.

| ☐ | **Marshmallow** | sweet | cooling | V 0 · P 0 · K +1 | tag:gelatin · caution:high_sugar |

- marshmallow

    Evidence:
    Low · Derived

    Rasa:
    Sweet

    Virya:
    Neutral

    Guṇa:
    Light
    Soft

    Dosha:
    Vata   0
    Pitta   0
    Kapha  +1

- tags:
  - confectionery
  - gelatin

cautions:
  - high_sugar

balancedBy:
  - herbalTea

notes:
  - Refers to plain marshmallows.
  - Toasted marshmallows become mildly heating but retain a similar dosha profile.

- I think Neutral virya with V0 · P0 · K+1 best captures their soft, sugary, but not particularly nourishing nature.

| ☐ | **Beef jerky** | salty, sweet | heating | V 0 · P +1 · K 0 | tag:beef · caution:high_sodium, processed |

- beefJerky

    Evidence:
    Medium · Derived

    Rasa:
    Salty
    Sweet

    Virya:
    Heating

    Guṇa:
    Heavy
    Dry

    Dosha:
    Vata   +1
    Pitta  +1
    Kapha   0

- tags:
  - beef

cautions:
  - high_sodium
  - processed

balancedBy:
  - freshFruit

notes:
  - Refers to a typical commercial beef jerky.
  - Less salty, minimally processed jerky may be slightly less Pitta-provoking.

- Confidence - High. The strongest Ayurvedic principle here is that dehydration increases dryness, making Vata +1 the most appropriate default despite beef itself generally being Vata-pacifying. Your Pitta +1 and Kapha 0 assessments are otherwise well balanced.

| ☐ | **Mixed nuts** (salted) | sweet, astringent, salty | heating | V −1 · P +1 · K +1 | allergen:nuts · caution:high_sodium |

- mixedNutsSalted

    Evidence:
    Medium · Derived

    Rasa:
    Sweet
    Astringent
    Salty

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

cautions:
  - high_sodium

balancedBy:
  - freshFruit

tags:
  - snack

notes:
  - Refers to a typical roasted, salted mixed nut blend.
  - Chili-coated or heavily spiced nut mixes should be modelled separately.

- Confidence - Moderate to high. Because "mixed nuts" are inherently variable, I think Neutral virya and Pitta 0 are the most robust defaults. If you later create entries such as spicy roasted nuts or honey-roasted nuts, those would reasonably justify a Heating / Pitta +1 classification.


---

## Decisions (resolved 2026-08-16)

- **Meal-vs-snack line.** ✅ Keep these as INGREDIENTS (composite dishes a user logs), separate from meal templates. No conversion.
- **Gelatin.** ✅ Added a real `gelatin` dietTag (lib/dietSafety.js) that excludes vegetarian AND vegan (it's slaughter-derived, like animal rennet). Applied to **gummy candy** and **marshmallow**. Also confirmed: the app never *suggests* junk — the meal composer draws only from curated meal templates; these composites appear only in the searchable reference and when a user logs one for assessment.
- **Prep variability.** ✅ Split the clear energetic swings into their own rows: **fried dumplings** (gyoza) vs steamed dumplings, **fresh summer roll** vs fried spring roll, **veggie burrito** vs meat burrito. (Batch is now 53 rows.)

## Notes / corrections

_(add feedback per item here)_
