# Diet review batch 7 — depth + the classical long tail (58 entries)

> ✅ SIGNED OFF 2026-07-28 — all 58 reviewed and live. Dataset now **190 foods,
> all 190 reviewed, 0 draft**. Reviewer decisions applied to
> `src/data/ayurveda/ingredients.js`; ids added to the REVIEWED_SIGNED_OFF gate.
> The 5 flags were resolved: no exact verse citations; dill/fennel kept distinct
> (dillSeed = modern, fennel seed stays classical); goatMeat kept V−1/P0/K0;
> cocoa kept as an unsweetened-beverage entry (darkChocolate deferred); pumpkin
> kept separate from the classical ash gourd. NOTE: descriptive `tags:` were not
> stored (dietTags is safety-only) except root→dietTags on elephantYam/turnip;
> `lotusSeed` kept at medium (its doc block was mislabelled with raisins' data).

## What this rounds out

133 → 190. Batch 6 made the base *broad*; batch 7 goes for **depth and the
classical long tail** — the named foods from Charaka's Sūtrasthāna 27
(Annapāna-vidhi) that we hadn't captured yet, plus the German/Western staples
that a de-locale user will actually search for.

58 new:

- **6 grains/starches** — amaranth (rajgira), buckwheat (kuttu), foxtail
millet, sago (sabudana), white bread.  *(that's 5 — see note)*
- **4 legumes** — soybean, horse gram (Kulattha 🏛), moth bean, black beans.
- **12 vegetables** — pumpkin, drumstick/moringa (Shigru 🏛), pointed gourd
(Patola 🏛), ivy gourd, elephant-foot yam (Sūraṇa 🏛), turnip, fennel bulb,
celery, brussels sprouts, artichoke, mustard greens.  *(11 — see note)*
- **11 fruit** — java plum/jamun (Jambu 🏛), ripe jackfruit (Panasa 🏛),
raisins (Drākṣā 🏛), muskmelon, sweet lime (mosambi), plum, apricot, cherry,
kiwi, blueberry, custard apple.
- **5 nuts/seeds** — lotus seed/makhana, pumpkin seed, chia, hazelnut, chestnut.
- **10 spices/herbs** — long pepper (Pippali 🏛), holy basil/tulsi (Surasa 🏛),
rock salt (Saindhava 🏛), dill seed, star anise, mace, nigella (kalonji),
rosemary, thyme, poppy seed.
- **2 oils** — peanut oil, almond oil.
- **2 sweeteners** — rock candy/mishri (Śarkarā 🏛), maple syrup.
- **3 beverages** — coconut water (🏛), sugarcane juice (Ikṣu 🏛), cocoa.
- **2 dairy** — cream (malai), khoa/mawa.
- **3 animal** — freshwater fish (Matsya 🏛), goat meat (Aja māṃsa 🏛), prawn.

🏛 = **directly attested in the classical food catalogue** and drafted `high`;
everything else is `medium` (derived from taste/potency/heaviness, or a
Western/regional food outside the corpus). **19 of 58 are** `high`**.**

**Animal foods** sit in category `'animal'`, so vegetarian/vegan patterns
exclude them automatically. Fish carries `fish`, prawn `shellfish`. If you'd
rather not carry meat/fish at all, say so and I'll drop the three — plus batch
6's egg + chicken — in one go; they're isolated.

Standing rules applied: FOOD sign convention (−1 pacifies), no invented
sub-verse numbers (classical rows cite `Sūtrasthāna 27`, the food chapter, and
nothing finer than I can stand behind), Western staples flagged "derived, not
classically cited," every doubt written into the `source.note`.

---



## 🚩 Check first

These are the calls I'm least sure of — please confirm before I flip them live.

**1. Sanskrit / classical identity of the 🏛 rows.**
For the attested foods I've given the classical name (Kulattha, Shigru, Patola,
Sūraṇa, Jambu, Panasa, Drākṣā, Pippali, Surasa, Saindhava, Śarkarā, Ikṣu,
Matsya, Aja, coconut water). The *energetics* follow classical consensus, but
I've deliberately **not** cited verse numbers below "Sūtrasthāna 27." If you
want tighter citations (e.g. Pippali in the Vidhi-śoṇita or the Rasāyana
chapters), flag which ones and I'll add them at review — I won't fabricate them.  
- No, don't need to cite the exact source. Rather keep it simple:  
`id: pippali`

`sanskrit: Pippali`

`evidence: High`

`editorialSources:`

  `- Charaka Samhita`

  `- Sushruta Samhita`

  `- Ashtanga Hridaya`

`verificationStatus: verified`

**2.** `dillSeed` **— Śatapuṣpā.** Classical Śatapuṣpā is often identified as
**fennel**, not dill; the two are conflated across sources. I've labelled the
row *dill* (sowa/suva, the common Indian kitchen seed) but sourced it `modern`
with the identity doubt in the note. Confirm the naming, or tell me to split
fennel-seed (already live as `fennel`) from dill entirely.  
- **Yes—split them.**

- **Fennel Seed** → **Śatapuṣpā**, **High**, classical.
- **Dill Seed (Sowa/Suva)** → **Medium · Derived**, modern culinary entry with an explicit identity note.

That approach is the most academically defensible and aligns with the provenance standards you've applied throughout the rest of the database.

**3.** `goatMeat` **V−1 P0 K0.** Charaka singles out Aja (goat) as the most
*balanced* of the common meats — not much aggravating any dosha. I've encoded
that as genuinely tridoshic-neutral (only a mild Vata pacification from its
building quality). That's a strong-sounding claim for a meat; confirm you're
happy with the neutral P/K, or I'll nudge them to +1 to match the general
"meat is heating/heavy" heuristic.

- I actually think this **strengthens** the credibility of the database. It demonstrates that your dosha scores are **evidence-led rather than formula-led**. Users will quickly see that you're not simply applying "heavy + heating = P+1 K+1" to every food, but preserving well-attested classical exceptions where they exist.

**4.** `cocoa` **as a** `beverage`**.** It's really chocolate-and-drink both; I filed it
under beverage with an `insomnia` caution (stimulant). Fine, or split
`darkChocolate` out separately?

- I'd make the beverage entry explicit:
  ```
  cocoa
  ```
  or
  ```
  hotCocoa
  ```
  with a note such as:
  > *Profile refers to unsweetened cocoa prepared as a beverage, not chocolate confectionery.*
  That avoids ambiguity and makes it easy to add **darkChocolate**, **milkChocolate**, or **cacao nibs** later without changing existing data.
  ### Final recommendation
  - ✅ **Keep** `cocoa` **as a beverage entry** (Medium · Derived, stimulant cautions).
  - ✅ **Add** `darkChocolate` **as a separate food** when you expand the database.
  - ❌ Don't use one entry to represent both—they differ enough in composition and energetics that users would reasonably expect separate profiles.

**5.** `pumpkin` **vs** `ashGourd`**.** Ash gourd (Kūṣmāṇḍa) is already live and *is*
the classical one. Red pumpkin (kaddu) is the regional food; I kept them
separate and marked pumpkin `modern`. Confirm that's the split you want.

- ✅ **Ash gourd (Kūṣmāṇḍa)** → **High**, classical entry.
- ✅ **Pumpkin (red pumpkin/kaddu)** → **Medium · Derived**, separate modern entry.
- ✅ Include a cross-reference note on the pumpkin entry that it is **not** the classical Kūṣmāṇḍa.

---



## Counting note

Two of the group tallies above read one short (grains, vegetables) — the prose
was written before I settled the final list; the **authoritative count is 58**,
verified by the dataset (`190 total, 0 duplicate ids, all keys === id`) and the
`dietSafety` suite (40/40 green, including the unknown-safety-key gate — the two
tree-nut/peanut rows use the canonical `nuts`/`peanuts` allergen keys).

## The full list, by confidence

`high` **(19, classical):**   
1. horseGram · I

- **Evidence:** High
- **Rasa:** Astringent + Pungent
- **Virya:** Heating
- **Guṇa:** Light + Dry
- **Doshas:** **V+1 / P+1 / K−1**  

drumstick ·
- balancedBy:
  - ghee
  - coconut
  - coriander

tags:
  - vegetable

notes:
  - Profile refers to the edible drumstick pods (Śigru), not the leaves or medicinal extracts.
  - Heating and light; traditionally valued for reducing Kapha.
- drumstick — Śigru

  Evidence: High

  Rasa:
  Pungent + Bitter

  Virya:
  Heating

  Guṇa:
  Light + Dry

  Dosha:
  Vata   0
  Pitta  +1
  Kapha  -1


pointedGourd ·
- balancedBy:
  - ghee
  - cumin
  - ginger

tags:
  - vegetable

notes:
  - Classical Patola; profile refers to the commonly consumed pointed gourd.
  - Traditionally regarded as a light, cooling vegetable supportive for Pitta and Kapha.

- pointedGourd — Patola

  Evidence: High

  Rasa:
  Bitter + Astringent

  Virya:
  Cooling

  Guṇa:
  Light + Dry

  Dosha:
  Vata   0
  Pitta  -1
  Kapha  -1   

elephantYam · 
- balancedBy:
  - ghee
  - cumin
  - ginger
  - asafoetida

tags:
  - tuber

notes:
  - Classical Sūraṇa (elephant foot yam).
  - Traditionally cooked with digestive spices to improve digestibility and reduce irritation.

-elephantYam — Sūraṇa

  Evidence: High

  Rasa:
  Pungent + Astringent

  Virya:
  Heating

  Guṇa:
  Light + Dry

  Dosha:
  Vata   0
  Pitta  +1
  Kapha  -1 

jamun ·
balancedBy:
  - rockSalt
  - blackPepper

tags:
  - fruit

notes:
  - Classical Jambu.
  - Naturally astringent fruit with cooling energetics.

- jamun — Jambu

  Evidence: High

  Rasa:
  Astringent + Sweet

  Virya:
  Cooling

  Guṇa:
  Light + Dry

  Dosha:
  Vata   +1
  Pitta  -1
  Kapha  -1


jackfruit · 
- balancedBy:
  - blackPepper
  - ginger

tags:
  - fruit

notes:
  - Profile refers primarily to ripe jackfruit (Panasa).
  - Tender (unripe) jackfruit is less sweet and may exhibit somewhat lighter, less Kapha-promoting qualities than the ripe fruit.

- I'd consider separate entries for:
Ripe jackfruit
Tender (green) jackfruit

- jackfruit — Panasa

  Evidence: High

  Rasa:
  Sweet

  Virya:
  Cooling

  Guṇa:
  Heavy + Moist

  Dosha:
  Vata   -1
  Pitta  -1
  Kapha  +1

raisins · 

lotusSeed · 
balancedBy:
  - fennel
  - cardamom

tags:
  - dried_fruit

notes:
  - Classical Drākṣā.
  - Represents dried grapes (raisins); fresh grapes may be modelled separately if desired.

-  The only point I'd clarify is scope:
If your existing grapes entry already represents Drākṣā in the classical sense, then raisins and grapes should either:be separate entries with nearly identical energetics and a note that drying concentrates sweetness, or
share a single canonical energetic profile if your ontology doesn't distinguish fresh vs. dried forms.

Given the level of detail elsewhere in your database, I'd lean toward separate entries, because they're distinct foods in everyday use, even though their Ayurvedic energetics remain very similar.

- raisins — Drākṣā

  Evidence: High

  Rasa:
  Sweet

  Virya:
  Cooling

  Guṇa:
  Heavy + Moist

  Dosha:
  Vata   -1
  Pitta  -1
  Kapha  +1

longPepper ·
- balancedBy:
  - ghee
  - licorice

tags:
  - spice

notes:
  - Classical Pippalī.
  - Distinguished from black pepper by its more nourishing, less drying profile.
  - Traditionally used in rasāyana formulations as well as digestive preparations.

- I would keep Pippalī clearly separate from:
  Black pepper (Marica)
  Long pepper root (Pippalīmūla), if you ever add medicinal botanicals.
  Although all are pungent, they are not energetically identical in Ayurveda.

- longPepper — Pippalī

  Evidence: High

  Rasa:
  Pungent

  Virya:
  Heating

  Guṇa:
  Light + Oily

  Dosha:
  Vata   -1
  Pitta  +1
  Kapha  -1

holyBasil · 
- balancedBy:
  - ghee
  - coriander

tags:
  - herb
  - beverage

notes:
  - Classical Surasā.
  - Profile refers to culinary leaves or tea, not concentrated extracts or essential oil.

holyBasil — Surasā

  Evidence: High

  Rasa:
  Pungent + Bitter

  Virya:
  Heating

  Guṇa:
  Light + Dry

  Dosha:
  Vata   0
  Pitta  +1
  Kapha  -1

rockSalt · 
- balancedBy: []

tags:
  - seasoning

notes:
  - Classical Saindhava Lavaṇa.
  - Distinguished from other salts in Ayurveda by its cooling nature and comparatively balanced doshic effects.

- rockSalt — Saindhava Lavaṇa

  Evidence: High

  Rasa:
  Salty

  Virya:
  Cooling

  Guṇa:
  Light + Moist

  Dosha:
  Vata   -1
  Pitta   0
  Kapha  +1

rockCandy ·
-  balancedBy: []

tags:
  - sweetener

notes:
  - Classical crystallized sugar (Miśrī/Śarkarā).
  - Traditionally regarded as cooling despite its sweetness.

- ✅ Evidence: High
✅ Profile: identical to Śarkarā
✅ Separate entry: justified for usability, with a note that it is the crystallized form of cane sugar rather than a different energetic substance.

- rockCandy — Miśrī (Śarkarā)

  Evidence:
  High

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

coconutWater · 

- balancedBy: []

tags:
  - beverage
  - natural_drink

notes:
  - Profile refers to fresh coconut water, not canned beverages or coconut milk.
  - Distinct from coconut flesh, which is heavier and more Kapha-promoting.

- coconutWater — Nārikela Jala

  Evidence: High

  Rasa:
  Sweet

  Virya:
  Cooling

  Guṇa:
  Light + Moist

  Dosha:
  Vata   -1
  Pitta  -1
  Kapha   0

sugarcaneJuice · 
- balancedBy:
  - ginger

tags:
  - beverage

notes:
  - Classical fresh sugarcane juice (Ikṣu Rasa).
  - Distinct from crystallized sugar (Śarkarā), although both share broadly similar energetics.

- sugarcaneJuice — Ikṣu Rasa

  Evidence: High

  Rasa:
  Sweet

  Virya:
  Cooling

  Guṇa:
  Heavy + Moist

  Dosha:
  Vata   -1
  Pitta  -1
  Kapha  +1

fishFreshwater ·
- balancedBy:
  - ginger
  - blackPepper
  - cumin

tags:
  - animal_protein

notes:
  - Represents the general classical profile of freshwater fish.
  - Individual species may differ in heaviness and digestibility.

- I would distinguish this from any future:
  saltwater fish
  shellfish
  oily fish (e.g. salmon, mackerel)
  lean white fish

- fishFreshwater — Matsya

  Evidence: High

  Rasa:
  Sweet

  Virya:
  Heating

  Guṇa:
  Heavy + Oily

  Dosha:
  Vata   -1
  Pitta  +1
  Kapha  +1

goatMeat. 
- balancedBy:
  - ginger
  - blackPepper
  - cumin

tags:
  - animal_protein

notes:
  - Classical Aja (goat meat).
  - Traditionally regarded as the most balanced of the commonly consumed meats, with relatively little tendency to aggravate Pitta or Kapha compared with other meats.

- goatMeat — Aja

  Evidence: High

  Rasa:
  Sweet

  Virya:
  Heating

  Guṇa:
  Heavy + Oily

  Dosha:
  Vata   -1
  Pitta   0
  Kapha   0

`medium` **(39, derived / Western / regional):** 
amaranth · 
- balancedBy:
  - ghee
  - cumin
  - ginger

tags:
  - pseudocereal
  - gluten_free

notes:
  - Profile refers to grain amaranth (Amaranthus spp.), not amaranth leaves.
  - Energetics are derived from Ayurvedic principles rather than explicit classical descriptions.

- I would keep amaranth grain and amaranth leaves as separate entries if you ever include both. Their Ayurvedic profiles are likely to differ substantially:
  Grain → nourishing pseudocereal.
  Leaves → leafy green with more bitter/astringent qualities.

- amaranth

  Evidence: Medium · Derived

  Rasa:
  Sweet + Astringent

  Virya:
  Cooling

  Guṇa:
  Light + Dry

  Dosha:
  Vata   +1
  Pitta  -1
  Kapha   0

buckwheat · 
- balancedBy:
  - ghee
  - cumin
  - ginger

tags:
  - pseudocereal
  - gluten_free

notes:
  - Profile refers to buckwheat grain.
  - Energetics are derived from Ayurvedic principles rather than explicit classical descriptions.

- Evidence: Medium · Derived
  Rasa: Sweet + Astringent
  Virya: Cooling
  Guṇa: Light + Dry
  Doshas: V+1 / P−1 / K0

foxtailMillet · 

- balancedBy:
  - ghee
  - cumin
  - ginger

tags:
  - millet
  - gluten_free

notes:
  - Profile refers to whole foxtail millet.
  - Traditionally cooked with ghee or digestive spices to offset its drying nature.

- foxtailMillet

  Evidence: High

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
  Kapha  -1

sago · 

- balancedBy:
  - cumin
  - blackPepper
  - ginger

tags:
  - starch
  - gluten_free

notes:
  - Profile refers to Indian sabudana (tapioca pearls), not true sago palm starch.
  - Energetics are derived from Ayurvedic principles rather than classical textual descriptions.

- I would actually consider renaming the entry to sabudana if your audience is primarily Indian. "Sago" is commonly used in Indian English, but botanically it's ambiguous.

- id: sabudana

  displayName: Sago (Sabudana)

  aliases:
    - Tapioca pearls

- Evidence: Medium · Derived
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Heavy + Moist
  Doshas: V−1 / P−1 / K+1

whiteBread · 
- balancedBy:
  - ghee
  - butter
  - oliveOil

tags:
  - baked_good
  - refined_grain

notes:
  - Profile refers to standard refined wheat bread.
  - Whole-grain and sourdough breads should be modelled separately if included.

- I would not merge:
  White bread
  Whole wheat bread
  Sourdough
  Flatbreads (chapati, naan, etc.)

- whiteBread

  Evidence: Medium · Derived

  Rasa:
  Sweet

  Virya:
  Neutral

  Guṇa:
  Heavy + Dry

  Dosha:
  Vata   +1
  Pitta   0
  Kapha  +1


soybean · 

- balancedBy:
  - ginger
  - cumin
  - asafoetida

tags:
  - legume
  - high_protein

notes:
  - Profile refers to whole soybeans.
  - Fermented soy foods (such as miso, tempeh and natto) and processed products (such as tofu or soy milk) should be modelled separately.

- Evidence: Medium
  Rasa: Sweet + Astringent
  Virya: Cooling
  Guṇa: Heavy + Dry
  Doshas: V+1 / P−1 / K+1


mothBean · 
- balancedBy:
  - ghee
  - cumin
  - ginger
  - asafoetida

tags:
  - legume
  - high_protein

notes:
  - Profile refers to whole moth beans (matki).
  - Sprouted moth beans may be somewhat lighter but retain broadly similar energetics.

- mothBean

  Evidence: Medium

  Rasa:
  Sweet + Astringent

  Virya:
  Cooling

  Guṇa:
  Light + Dry

  Dosha:
  Vata   +1
  Pitta  -1
  Kapha   0

blackBean · 
- balancedBy:
  - cumin
  - ginger
  - asafoetida

tags:
  - legume
  - new_world

notes:
  - Refers to Phaseolus vulgaris (black bean), not black gram (urad dal, Māṣa).
  - Soaking and cooking with digestive spices reduces its Vata-provoking qualities.

- Evidence: Medium · Derived
  Rasa: Sweet + Astringent
  Virya: Cooling
  Guṇa: Heavy + Dry
  Doshas: V+1 / P−1 / K0

pumpkin ·  

- balancedBy:
  - ginger
  - blackPepper
  - cumin

tags:
  - squash
  - modern_food

notes:
  - Refers to culinary pumpkin (Cucurbita spp.), not classical ash gourd (Kūṣmāṇḍa).
  - Roasting concentrates sweetness and may make it slightly more Kapha-promoting than boiling or steaming.

- Evidence: Medium · Derived
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Light + Moist
  Doshas: V−1 / P−1 / K0


ivyGourd · 
- balancedBy:
  - ghee
  - cumin
  - mustardSeeds

tags:
  - vegetable
  - gourd

notes:
  - Refers to ivy gourd (Coccinia grandis), also known as tindora or tindli.
  - Cooking with a little oil or ghee moderates its drying quality.

- Evidence: High
  Rasa: Bitter + Astringent
  Virya: Cooling
  Guṇa: Light + Dry
  Doshas: V0 / P−1 / K−1

turnip · 
- balancedBy:
  - ghee
  - cumin
  - coriander

tags:
  - root_vegetable

notes:
  - Profile refers to the cooked root.
  - Raw turnip is more pungent and drying than cooked.

- Evidence: Medium
  Rasa: Sweet + Pungent
  Virya: Heating
  Guṇa: Light + Dry
  Doshas: V+1 / P0 / K−1

fennelBulb · 
- balancedBy:
  - ghee
  - oliveOil
  - cumin

tags:
  - vegetable
  - apiaceae

notes:
  - Refers to the edible fennel bulb (Florence fennel), not fennel seeds.
  - Raw bulb is slightly more pungent; cooking enhances its sweetness.

- fennelBulb
  Evidence:
  Medium
  Rasa:
  Sweet
  Pungent

  Virya:
  Cooling

  Guṇa:
  Light
  Moist

  Dosha:
  Vata   -1
  Pitta  -1
  Kapha   0

celery · 
balancedBy:
  - ghee
  - sesameOil
  - cumin

tags:
  - vegetable
  - apiaceae

notes:
  - Profile refers to celery stalks.
  - Raw celery is more Vata-provoking than cooked celery.

- Evidence: Medium
  Rasa: Bitter + Pungent
  Virya: Cooling
  Guṇa: Light + Dry
  Doshas: V+1 / P−1 / K−1

brusselsSprouts · 
- balancedBy:
  - ghee
  - cumin
  - blackPepper

tags:
  - cruciferous
  - vegetable

notes:
  - Profile refers to cooked Brussels sprouts.
  - Roasting or sautéing with ghee and digestive spices helps reduce their Vata-provoking qualities.

- Evidence: Medium · Derived
  Rasa: Bitter + Sweet
  Virya: Heating
  Guṇa: Light + Dry
  Doshas: V+1 / P0 / K−1


artichoke ·  
- balancedBy:
  - oliveOil
  - ghee
  - cumin

tags:
  - vegetable
  - mediterranean

notes:
  - Profile refers to the cooked flower bud (globe artichoke).
  - Serving with oil or ghee helps offset its drying quality.

- Evidence: Medium
  Rasa: Bitter + Sweet
  Virya: Cooling
  Guṇa: Light + Dry
  Doshas: V+1 / P−1 / K−1


mustardGreens · 
balancedBy:
  - ghee
  - sesameOil
  - cumin

tags:
  - leafy_green
  - brassica

notes:
  - Profile refers to cooked mustard greens.
  - Cooking with ghee or oil reduces their Vata-provoking qualities.

- Evidence: Medium
  Rasa: Pungent + Bitter
  Virya: Heating
  Guṇa: Light + Dry
  Doshas: V+1 / P+1 / K−1

muskmelon · 
- balancedBy:
  - blackPepper
  - ginger

tags:
  - fruit
  - melon

notes:
  - Profile refers to ripe muskmelon.
  - Traditionally best eaten alone rather than combined with heavy foods or dairy.

- Evidence: High
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Light + Moist
  Doshas: V−1 / P−1 / K0

sweetLime · 
balancedBy:
  - blackPepper
  - rockSalt

tags:
  - citrus
  - fruit

notes:
  - Profile refers to ripe sweet lime (mosambi).
  - Fresh juice is cooling but is best consumed immediately after preparation.

- Evidence: Medium
  Rasa: Sweet + Sour
  Virya: Cooling
  Guṇa: Light + Moist
  Doshas: V−1 / P−1 / K0

plum · 
balancedBy:
  - cinnamon
  - ginger

tags:
  - fruit
  - stone_fruit

notes:
  - Profile refers to ripe fresh plums.
  - Unripe plums are considerably more sour and may be more Pitta-provoking than this generic profile.

- Evidence: Medium
  Rasa: Sweet + Sour
  Virya: Cooling
  Guṇa: Light + Moist
  Doshas: V−1 / P−1 / K0

apricot · 
balancedBy:
  - cinnamon
  - ginger

tags:
  - fruit
  - stone_fruit

notes:
  - Profile refers to ripe fresh apricots.
  - Dried apricots should be modelled separately, as drying concentrates sweetness and changes their energetic profile.

- Evidence: Medium
  Rasa: Sweet + Astringent
  Virya: Cooling
  Guṇa: Light + Moist
  Doshas: V−1 / P−1 / K0

cherry · 
balancedBy:
  - cinnamon
  - ginger

tags:
  - fruit
  - stone_fruit

notes:
  - Profile refers to ripe sweet cherries.
  - Sour cherries have a more pronounced sour taste and may warrant a separate entry if included.

- Evidence: Medium
  Rasa: Sweet + Astringent
  Virya: Cooling
  Guṇa: Light + Moist
  Doshas: V−1 / P−1 / K0


kiwi ·  
balancedBy:
  - cinnamon
  - ginger

tags:
  - fruit
  - modern_food

notes:
  - Profile refers to ripe kiwi fruit.
  - Unripe kiwi is significantly more sour and may be less suitable for Pitta.

- Evidence: Medium · Derived
  Rasa: Sweet + Sour
  Virya: Cooling
  Guṇa: Light + Moist
  Doshas: V−1 / P−1 / K0


blueberry · 
balancedBy:
  - cinnamon

tags:
  - berry
  - modern_food

notes:
  - Profile refers to fresh ripe blueberries.
  - Dried blueberries are sweeter and more drying and should be modelled separately if included.

- Evidence: Medium · Derived
  Rasa: Sweet + Astringent
  Virya: Cooling
  Guṇa: Light + Dry
  Doshas: V0 / P−1 / K−1

custardApple · 
balancedBy:
  - cardamom
  - cinnamon
  - ginger

tags:
  - fruit
  - tropical
  - modern_food

notes:
  - Profile refers to ripe custard apple (Annona squamosa).
  - Unripe fruit is markedly more astringent and should not be represented by this profile.

- Evidence: Medium · Derived
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Heavy + Moist
  Doshas: V−1 / P−1 / K+1


pumpkinSeed · 
balancedBy:
  - blackPepper
  - ginger

tags:
  - seed
  - modern_food

notes:
  - Profile refers to raw or lightly roasted pumpkin seeds without added salt or oil.
  - Heavy consumption may increase Kapha despite their nutritional benefits.
- Evidence: Medium · Derived
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Heavy + Oily
  Doshas: V−1 / P−1 / K+1

chiaSeed · 
- balancedBy:
  - ginger
  - cinnamon

tags:
  - seed
  - modern_food

notes:
  - Profile refers to soaked or properly hydrated chia seeds.
  - Dry chia seeds should be consumed with adequate fluids.

- Evidence: Medium · Derived
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Heavy + Moist
  Doshas: V−1 / P−1 / K+1


hazelnut · 
- balancedBy:
  - cardamom
  - cinnamon

tags:
  - nut
  - tree_nut

notes:
  - Profile refers to raw or dry-roasted hazelnuts without added sugar or salt.
  - Nut butters should be modelled separately if included.

- Evidence: Medium
  Rasa: Sweet + Astringent
  Virya: Heating
  Guṇa: Heavy + Oily
  Doshas: V−1 / P+1 / K+1


chestnut ·  
- balancedBy:
  - cinnamon
  - ginger

tags:
  - nut
  - tree_nut

notes:
  - Profile refers to cooked edible chestnuts.
  - Chestnuts are significantly starchier and less oily than most tree nuts.

- Evidence: Medium
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Heavy + Moist
  Doshas: V−1 / P−1 / K+1


dillSeed · 
- balancedBy:
  - ghee

tags:
  - spice
  - seed

notes:
  - Refers to culinary dill seed (Anethum graveolens).
  - Profile is distinct from fennel seed despite historical overlap in the identification of Śatapuṣpā.

- Evidence: Medium · Derived (or Medium if you classify later Ayurvedic foods separately)
  Rasa: Pungent + Bitter
  Virya: Heating
  Guṇa: Light + Dry
  Doshas: V−1 / P+1 / K−1


starAnise · 
- balancedBy:
  - ghee

tags:
  - spice

notes:
  - Refers to Chinese star anise (Illicium verum).
  - Do not confuse with Japanese star anise (Illicium anisatum), which is not used as a culinary spice.

- Evidence: Medium
  Rasa: Sweet + Pungent
  Virya: Heating
  Guṇa: Light + Dry
  Doshas: V−1 / P+1 / K−1


mace · 
- balancedBy:
  - ghee

tags:
  - spice

notes:
  - Refers to the dried aril of nutmeg (Jātipatrī).
  - Distinct from nutmeg (Jātīphala), although both share broadly similar energetics.

This gives mace a profile consistent with the classical aromatic spices while keeping it distinct from the seed (nutmeg) for usability.

- Evidence: High
  Rasa: Pungent + Bitter
  Virya: Heating
  Guṇa: Light + Dry
  Doshas: V−1 / P+1 / K−1


nigella · 
- balancedBy:
  - ghee

tags:
  - spice
  - seed

notes:
  - Refers to Nigella sativa (kalonji, black cumin).
  - Not to be confused with black sesame, black cumin (Bunium persicum), or black caraway.

- Evidence: Medium
  Rasa: Pungent + Bitter
  Virya: Heating
  Guṇa: Light + Dry
  Doshas: V−1 / P+1 / K−1

rosemary · 
- balancedBy:
  - oliveOil
  - ghee

tags:
  - herb
  - mediterranean

notes:
  - Profile refers to culinary rosemary leaves.
  - Fresh and dried rosemary have broadly similar energetics.

- Evidence: Medium
  Rasa: Pungent + Bitter
  Virya: Heating
  Guṇa: Light + Dry
  Doshas: V−1 / P+1 / K−1


thyme · 
- balancedBy:
  - oliveOil
  - ghee

tags:
  - herb
  - mediterranean

notes:
  - Profile refers to culinary thyme leaves.
  - Fresh and dried thyme have broadly similar energetics.

- Evidence: Medium
  Rasa: Pungent + Bitter
  Virya: Heating
  Guṇa: Light + Dry
  Doshas: V−1 / P+1 / K−1

poppySeed · 
- balancedBy:
  - cardamom
  - ginger

tags:
  - seed
  - culinary_seed

notes:
  - Refers to culinary poppy seeds (khus khus), not opium latex or medicinal opium preparations.
  - Widely used in traditional Indian cooking and desserts.

- Evidence: High
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Heavy + Oily
  Doshas: V−1 / P−1 / K+1


peanutOil · 
- balancedBy:
  - turmeric
  - cumin

tags:
  - oil
  - modern_food

notes:
  - Profile refers to culinary peanut oil.
  - Refined and cold-pressed oils may differ slightly in culinary properties but share broadly similar energetics.

- Evidence: Medium · Derived
  Rasa: Sweet
  Virya: Heating
  Guṇa: Heavy + Oily
  Doshas: V−1 / P+1 / K+1


almondOil · 
- balancedBy:
  - cardamom

tags:
  - oil
  - tree_nut

notes:
  - Profile refers to culinary sweet almond oil.
  - Distinct from bitter almond oil, which should not be used as a culinary oil.

- Evidence: High
  Rasa: Sweet
  Virya: Heating
  Guṇa: Heavy + Oily
  Doshas: V−1 / P0 / K+1


mapleSyrup ·
- balancedBy:
  - cinnamon
  - ginger

tags:
  - sweetener
  - syrup
  - modern_food

notes:
  - Refers to pure maple syrup without added sugar.
  - Energetics are inferred from Ayurvedic principles rather than classical textual descriptions.

- Evidence: Medium · Derived
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Heavy + Moist
  Doshas: V−1 / P−1 / K+1

One editorial note: I would intentionally avoid treating maple syrup as "honey-like." Despite both being liquid sweeteners, Ayurvedically its profile is much closer to sugar syrup than to madhu (honey), which is a well-established classical exception.

cocoa · 
mentioned above

cream · 
- balancedBy:
  - blackPepper
  - ginger
  - cinnamon

tags:
  - dairy

notes:
  - Refers to unsweetened dairy cream.
  - Whipped cream or sweetened cream desserts should be modelled separately.

- Evidence: High
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Heavy + Oily
  Doshas: V−1 / P−1 / K+1

khoa · 
- balancedBy:
  - cardamom
  - ginger
  - saffron

tags:
  - dairy
  - traditional_food

notes:
  - Refers to plain unsweetened khoa (khoya/mawa).
  - Milk sweets prepared from khoa (e.g. peda, burfi, gulab jamun base) should be modelled separately.

- Evidence: High
  Rasa: Sweet
  Virya: Cooling
  Guṇa: Heavy + Oily
  Doshas: V−1 / P−1 / K+1

prawn.
- balancedBy:
  - ginger
  - blackPepper
  - cumin

tags:
  - seafood

notes:
  - Refers to plain cooked prawns without battering or frying.
  - Cooking method can significantly influence digestibility and doshic effects.

- Evidence: Medium
  Rasa: Sweet + Salty
  Virya: Heating
  Guṇa: Heavy + Oily
  Doshas: V−1 / P+1 / K+1

## Allergens declared

`soybean`→soy · `hazelnut`/`almondOil`→nuts · `peanutOil`→peanuts ·
`fishFreshwater`→fish · `prawn`→shellfish · `cream`/`khoa`→dairy (also implied
by category). Nut/peanut/soy/fish/shellfish rows will be filtered for anyone
who set those allergies before any Ayurvedic "favor" is ever shown.