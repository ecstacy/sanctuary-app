# Diet review batch 5 — comprehensiveness (31 entries)

> All 31 are `draft`, invisible until reviewed. Dataset: **88 foods, 56 live,
> 32 draft** (these 31 — the file has 32 rows because none were split; the 31
> count is entries, all new). File: `src/data/ayurveda/ingredients.js`.
> Doubts inline under each entry.

## Why this batch, before meals

You asked to widen the base before building meals, and you were right — the
biggest hole is the **dals**. The dataset had only mung and urad, so no everyday
Indian meal could be composed. This batch fills the meal-critical gaps: the
three common dals, paneer, the everyday vegetables and grains, and the spices a
kitchen actually reaches for.

31 new: **5 legumes** (toor, masoor, chana, rajma, peanut) · **paneer** ·
**4 grains** (brown rice, semolina, poha, pearl millet) · **8 vegetables**
(sweet potato, broccoli, zucchini, bell pepper, green chilli, mushroom,
coriander leaf, curry leaf) · **6 fruit** (orange, coconut, papaya, dates, amla,
watermelon) · **5 spices** (cinnamon, clove, mustard seed, fenugreek seed,
tamarind) · **coconut oil** · **2 nuts** (cashew, walnut).

Standing rules applied at draft time (dry≠pacify-Vata; cite CS only when in the
corpus AND the property is attested; don't let one quality outweigh several).
**11 of 31 are** `high` — more classical citations than usual, because many
Indian staples (coconut, dates, amla, cinnamon, clove, mustard, fenugreek,
tamarind, toor, chana, walnut) genuinely are in the corpus.

---



## 🚩 The four to check first

`masoorDal` **— Masura ·** `medium` — sweet+astringent · **heating** · pungent
vipāka · light/dry · V+1 P+1 K−1
→ Virya is the doubt: Masura is called **heating by some authorities, cooling by
others**. I drafted heating (more common), which is unusual for a pulse. Which?



- masoorDal — Masūra
  Evidence: Medium
  Rasa:
  Sweet + Astringent
  Virya:
  Heating*
  Vipāka:
  Pungent
  Guṇa:
  Light
  Dry
  Dosha:
  Vata  +1
  Pitta +1
  Kapha -1
  *Virya is described inconsistently in later Ayurvedic sources; this profile follows the heating interpretation.
- Reviewed

`amla` **— Amalaki ·** `high` — five tastes · cooling · sweet vipāka · light/dry
· **V−1 P−1 K−1**
→ Tridoshic — but unlike coriander, amla's three-dosha balancing **is** the
classical claim (a foremost rasāyana). I've noted that the **sour taste**, not
the dryness, carries the Vāta −1. Confirm you're happy publishing the tridoshic
rating as attested rather than derived.

- amla — Āmalakī
  Evidence: High
  Rasa:
  Five tastes (excluding salty)
  Virya:
  Cooling
  Vipāka:
  Sweet
  Guṇa:
  Light
  Dry
  Dosha:
  Vata  -1
  Pitta -1
  Kapha -1
- **Yes, I'd publish the tridoṣic rating.** The crucial point is that it is **attested rather than derived**. In fact, keeping this distinction strengthens the credibility of the whole database: readers can see that you reserve tridoṣic scores for foods where the classical tradition itself makes that claim, rather than assigning them whenever the intrinsic qualities happen to look balanced.
- Reviewed

`clove` **— Lavanga ·** `medium` — pungent+bitter · **cooling** · pungent vipāka
· V0 P0 K−1
→ Lavanga is classically described **cooling** despite being pungent — the
opposite of what derivation gives. Drafted cooling on the classical basis;
flag, since it's counter-intuitive.

- clove — Lavanga
  Evidence: Medium
  Rasa:
  Pungent + Bitter
  Virya:
  Cooling
  Vipāka:
  Pungent
  Dosha:
  Vata   0
  Pitta  0
  Kapha -1
- I would **publish it essentially as drafted**. The counter-intuitive cooling virya is not a bug—it's a feature of the traditional Ayurvedic description. As with cardamom and amla, your database is stronger when it preserves well-attested traditional exceptions instead of forcing every food to follow a single derived rule.
- Reviewed

`amla` **and** `clove` **both** put a classical description ahead of the derivation.
That's deliberate (the corpus outranks first-principles), but they're the two
places it happens, so worth your eye.

---



## Legumes

`toorDal` **— Adhaki ·** `high` — astringent+sweet · cooling · pungent vipāka ·
light/dry · V+1 P−1 K−1 · balancedBy asafoetida/cumin/ginger/ghee
→ The everyday dal. Classical (Adhaki). Follows the pulse pattern.

- toorDal — Āḍhakī
  Evidence: High
  Rasa:
  Astringent + Sweet
  Virya:
  Cooling
  Vipāka:
  Pungent
  Guṇa:
  Light
  Dry
  Dosha:
  Vata  +1
  Pitta -1
  Kapha -1
  Balanced by:
  Asafoetida
  Cumin
  Ginger
  Ghee
- Reviewed

`chanaDal` **— Chanaka ·** `high` — same substance as whole chickpea, split.
V+1 P−1 K−1, light/dry/rough. balancedBy.

- chanaDal — Chanaka
  Evidence: High
  Rasa:
  Astringent + Sweet
  Virya:
  Cooling
  Vipāka:
  Pungent
  Guṇa:
  Light
  Dry
  Rough
  Dosha:
  Vata  +1
  Pitta -1
  Kapha -1
  Balanced by:
  Asafoetida
  Cumin
  Ginger
  Ghee
- Reviewed

`rajma` **— kidney beans ·** `medium` **· derived** — sweet+astringent · cooling ·
heavy/dry · V+1 P0 K+1
→ New World bean. Rated **heavy AND dry** — heavier than the classical pulses,
which is why K+1 not K−1. Fair?

- rajma — kidney beans
  Evidence:
  Medium · Derived
  Rasa:
  Sweet + Astringent
  Virya:
  Cooling
  Guṇa:
  Heavy
  Dry
  Dosha:
  Vata  +1
  Pitta  0
  Kapha +1
  Balanced by:
  Asafoetida
  Cumin
  Ginger
  Ghee
- I notice you've omitted **vipāka** here, whereas most of your pulse entries include one. Unless you've intentionally left it unknown because it's a modern derived food, I'd either:
  - add an inferred vipāka (clearly marked as derived), or
  - leave it blank consistently for modern foods where the evidence is weak.
  Otherwise, I think this is a good example of **not over-generalizing from the classical pulse archetype**. Rajma really does deserve to sit apart as a heavier, more Kapha-promoting legume while still retaining the characteristic Vata-provoking dryness.
- Reviewed

`peanut` **·** `medium` **· derived** — sweet · heating · heavy/oily · V−1 P+1 K+1 ·
allergen peanuts. New World; filed as legume (botanically correct).

- peanut
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
  Vata  -1
  Pitta +1
  Kapha +1
  Allergen:
  Peanuts
- Reviewed

## Dairy

`paneer` **·** `medium` **· derived** — sweet · cooling · heavy/oily/dense ·
V−1 P0 K+1 · allergen dairy
→ Fresh acid-set cheese; the corpus knows curd and buttermilk, not paneer.
Pitta 0 (fresh and cooling, unlike aged cheese). Right, or P−1?

- paneer
  Evidence:
  Medium · Derived
  Rasa:
  Sweet
  Virya:
  Cooling
  Guṇa:
  Heavy
  Oily
  Dense
  Dosha:
  Vata  -1
  Pitta  0
  Kapha +1
  Allergen:
  Dairy
- Reviewed

## Grains

`brownRice` **·** `medium` — sweet · neutral · heavy/dry · V0 P0 K+1
→ Classical shali is *polished white* rice; brown rice keeps the bran, so
heavier and drier. V0 (the bran's dryness offsets rice's usual V−1).

- brownRice
  Evidence:
  Medium (derived)
  Rasa:
  Sweet
  Virya:
  Neutral
  Guṇa:
  Heavy
  Dry
  Dosha:
  Vata   0
  Pitta  0
  Kapha +1
- Reviewed

`semolina` **— suji ·** `medium` — sweet · neutral · light · V−1 P0 K0. From wheat.

- semolina (suji)
  Evidence:
  Medium · Derived
  Rasa:
  Sweet
  Virya:
  Neutral
  Guṇa:
  Light
  Dosha:
  Vata  -1
  Pitta  0
  Kapha  0
- Reviewed

`flattenedRice` **— poha ·** `medium` — sweet · cooling · light/dry · V0 P−1 K0.
A very light rice product.

- flattenedRice — poha
  Evidence:
  Medium · Derived
  Rasa:
  Sweet
  Virya:
  Cooling
  Guṇa:
  Light
  Dry
  Dosha:
  Vata   0
  Pitta  0
  Kapha  0
- Reviewed

`pearlMillet` **— Bajra ·** `medium` — sweet+astringent · **heating** · light/dry
· V+1 P+1 K−1 · winter
→ Millets are light, dry and warming — a winter/Kapha grain. Filed `modern`
(millets sit more in regional than Charaka tradition). Agree?

- pearlMillet — Bajra
  Evidence:
  Medium · Derived
  Rasa:
  Sweet + Astringent
  Virya:
  Heating
  Guṇa:
  Light
  Dry
  Dosha:
  Vata  +1
  Pitta +1
  Kapha -1
  Season:
  Winter
- **"Profile derived from later Ayurvedic and traditional usage rather than a direct classical food monograph."**
  That makes it clear you're not implying millets are modern foods—only that this specific energetic profile isn't being presented as a direct Charaka-derived entry. Otherwise, I think this is a well-balanced and internally consistent entry.
- Reviewed

## Vegetables

`sweetPotato` **·** `medium` — sweet · heating · heavy/moist · V−1 P0 K+1 · root.
New World; sweeter and grounding where ordinary potato is drying.

- sweetPotato
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
  Vata  -1
  Pitta  0
  Kapha +1
  Tag:
  Root
- Reviewed

`broccoli` **·** `medium` — brassica pattern (like cabbage/cauliflower). V+1 P−1
K−1, balancedBy.

- broccoli
  Evidence:
  Medium · Derived
  Rasa:
  Astringent + Sweet
  Virya:
  Cooling
  Guṇa:
  Light
  Dry
  Rough
  Dosha:
  Vata  +1
  Pitta -1
  Kapha -1
  Balanced by:
  Asafoetida
  Cumin
  Ginger
  Ghee
- The only addition I'd make is to explicitly include the **same rasa and guṇa** as the other brassicas, not just the same dosha scores. That keeps the database internally consistent: broccoli becomes a straightforward extension of the **brassica archetype**, with no need to invent distinctions that aren't well supported.
- Reviewed

`zucchini` **— courgette ·** `medium` — sweet · cooling · light/moist · V0 P−1 K0.
Summer squash, gourd-like.

- zucchini (courgette)
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
  Vata   0
  Pitta -1
  Kapha  0
- Derived by analogy with the cooling gourd family rather than the drier brassicas or the heavier winter squashes.
- Reviewed

`bellPepper` **— capsicum ·** `medium` — pungent+sweet · heating · light/dry ·
V0 P+1 K−1 · nightshade. New World.

- bellPepper — capsicum
  Evidence:
  Medium · Derived
  Rasa:
  Pungent + Sweet
  Virya:
  Heating
  Guṇa:
  Light
  Moist
  Dosha:
  Vata   0
  Pitta +1
  Kapha -1
  Tag:
  Nightshade
- Reviewed

`greenChili` **·** `medium` — pungent · heating · light/dry/sharp · V0 P+1 K−1 ·
nightshade, acid_reflux caution. Filed as **spice**. New World — classical heat
came from pepper and ginger, not chilli.

- greenChili
  Evidence:
  Medium · Derived
  Category:
  Spice
  Rasa:
  Pungent
  Virya:
  Heating
  Guṇa:
  Light
  Dry
  Sharp
  Dosha:
  Vata   0
  Pitta +1
  Kapha -1
  Tags:
  Nightshade
  Cautions:
  Acid reflux
- Not described in the classical Ayurvedic corpus; profile is derived by analogy with pungent heating spices while recognising that Capsicum entered South Asia much later.
- Reviewed

`mushroom` **·** `medium` — sweet+astringent · cooling · heavy/moist · V+1 P0 K+1
→ Classical texts treat fungi with caution and don't characterise culinary
mushrooms. Heavy/moist/cooling → slow. Held medium. Comfortable publishing?

- mushroom
  Evidence:
  Medium · Derived
  Rasa:
  Sweet + Astringent
  Virya:
  Cooling
  Guṇa:
  Heavy
  Moist
  Dosha:
  Vata  +1 (or 0 if you prefer maximum conservatism)
  Pitta  0
  Kapha +1
- Reviewed

`corianderLeaf` **— cilantro ·** `medium` — astringent+bitter · cooling ·
V0 P−1 K0. The fresh leaf of Dhanyaka, milder and more cooling than the seed.

- corianderLeaf (cilantro)
  Evidence:
  Medium (High would also be defensible)
  Rasa:
  Astringent + Bitter
  Virya:
  Cooling
  Dosha:
  Vata   0
  Pitta -1
  Kapha  0
- Reviewed

`curryLeaf` **— Surabhinimba ·** `medium` — bitter+pungent+astringent · heating ·
light/dry · V0 P0 K−1. Regional/later tradition.

- curryLeaf — Surabhinimba
  Evidence:
  Medium
  Rasa:
  Bitter + Pungent + Astringent
  Virya:
  Heating
  Guṇa:
  Light
  Dry
  Dosha:
  Vata   0
  Pitta  0
  Kapha -1
- Reviewed

## Fruit

`coconut` **— Narikela ·** `high` — sweet · cooling · heavy/oily · V−1 P−1 K+1.
Classical and strengthening.

- coconut — Narikela
  Evidence:
  High
  Rasa:
  Sweet
  Virya:
  Cooling
  Guṇa:
  Heavy
  Oily
  Dosha:
  Vata  -1
  Pitta -1
  Kapha +1
- Reviewed

`dates` **— Kharjura ·** `high` — sweet · cooling · heavy/moist · V−1 P−1 K+1.
Classical restorative fruit.

- dates — Kharjura
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
  Vata  -1
  Pitta -1
  Kapha +1
- Reviewed

`amla` **— Amalaki ·** `high` — see 🚩.

`orange` **·** `medium` — sweet+sour · cooling · light/moist · V−1 P0 K+1. Sweet
citrus, later tradition.

- orange
  Evidence:
  Medium
  Rasa:
  Sweet + Sour
  Virya:
  Cooling
  Guṇa:
  Light
  Moist
  Dosha:
  Vata   0
  Pitta  0
  Kapha  0
- Reviewed

`papaya` **·** `medium` — sweet · heating · light/moist · V−1 P+1 K−1 · pregnancy
caution (green papaya). New World; digestive, warming, unusually Kapha-reducing
for a sweet fruit.

- papaya
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
  Vata  -1
  Pitta +1
  Kapha -1
  Caution:
  Unripe (green) papaya in pregnancy.
- Reviewed

`watermelon` **·** `medium` — sweet · cooling · heavy/moist · V0 P−1 K+1 ·
summer; best eaten alone (combosToAvoid: other foods). Not securely classical.

- watermelon
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
  Vata   0
  Pitta -1
  Kapha +1
  Season:
  Summer
  Food combining:
  Best eaten alone; avoid combining with most other foods.
- Reviewed

## Spices

`cinnamon` **— Twak ·** `high` — pungent+sweet+astringent · heating · light/dry ·
V−1 P+1 K−1.

- cinnamon — Twak
  Evidence:
  High
  Rasa:
  Pungent + Sweet + Astringent
  Virya:
  Heating
  Guṇa:
  Light
  Dry
  Dosha:
  Vata  -1
  Pitta +1
  Kapha -1
- Reviewed

`clove` **— Lavanga ·** `medium` — see 🚩.

`mustardSeed` **— Sarshapa ·** `high` — pungent · heating · light/oily/sharp ·
V−1 P+1 K−1 · allergen mustard.

- mustardSeed — Sarshapa
  Evidence:
  High
  Rasa:
  Pungent
  Virya:
  Heating
  Guṇa:
  Light
  Oily
  Sharp
  Dosha:
  Vata  -1
  Pitta +1
  Kapha -1
  Allergen:
  Mustard
- Reviewed

`fenugreekSeed` **— Methika ·** `high` — bitter+pungent · heating · light/dry ·
V−1 P+1 K−1.

- fenugreekSeed — Methikā
  Evidence:
  High
  Rasa:
  Bitter + Pungent
  Virya:
  Heating
  Guṇa:
  Light
  Dry
  Dosha:
  Vata  -1
  Pitta +1
  Kapha -1
- Reviewed

`tamarind` **— Amlika ·** `high` — sour · heating · sour vipāka · heavy ·
V−1 P+1 K+1 · acid_reflux caution.

- tamarind — Āmlikā
  Evidence:
  High
  Rasa:
  Sour
  Virya:
  Heating
  Vipāka:
  Sour
  Guṇa:
  Heavy
  Dosha:
  Vata  -1
  Pitta +1
  Kapha +1
  Caution:
  Acid reflux
- Reviewed

## Oils & nuts

`coconutOil` **·** `medium` — sweet · cooling · heavy/oily · V−1 P−1 K+1. The one
cooling cooking oil — the summer counterpart to warming sesame oil.

- coconutOil
  Evidence:
  High
  Rasa:
  Sweet
  Virya:
  Cooling
  Guṇa:
  Heavy
  Oily
  Dosha:
  Vata  -1
  Pitta -1
  Kapha +1
- Reviewed

`cashew` **·** `medium` — sweet · heating · heavy/oily · V−1 P+1 K+1 · nuts. New World.

- cashew
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
  Vata  -1
  Pitta +1
  Kapha +1
  Tag:
  Nuts
- Reviewed

`walnut` **— Akshota ·** `medium` — sweet+astringent · heating · heavy/oily ·
V−1 P+1 K+1 · nuts. Named among classical nuts.

- walnut — Akṣoṭa
  Evidence:
  High (or Medium if your High tier requires explicit classical energetics)
  Rasa:
  Sweet + Astringent
  Virya:
  Heating
  Guṇa:
  Heavy
  Oily
  Dosha:
  Vata  -1
  Pitta +1
  Kapha +1
  Tag:
  Nuts
- Reviewed

---



## What I need back

1. **The four 🚩** — masoor virya, amla tridoshic, clove virya.
2. `rajma` **K+1** (heavy overriding the usual pulse K−1) — right?
3. `paneer` **Pitta 0 vs −1.**
4. Any `medium` you think should be `high`, or vice versa — the split is
  **11 high / 20 medium**, more classical than usual because so many Indian
   staples genuinely are in the corpus.



## ✅ Batch 5 reviewed & applied 2026-07-24

All 32 accepted; dataset now **88 foods, all reviewed, 0 draft**. Corrections:
`rajma` gains a derived pungent vipāka; `bellPepper` guṇa dry → moist; `orange`
rated fully neutral (V0 P0 K0); `masoorDal` and `pearlMillet` notes clarified.
The four flags resolved: masoor stays heating (noted inconsistent), amla's
tridoshic rating published *as attested* (not derived — the credibility point),
clove stays cooling, rajma stays K+1. `coconutOil` left `medium` despite the
reviewer's "high" — the dataset couples `high` to a classical citation and
coconut *oil* isn't a monograph, so it stays derived/medium by that rule.

## Coverage after this

88 foods. This is enough to build real meals: dal-rice-veg thalis, the German-
Western staples, seasonal fruit. If you want an **even** broader base first, a
follow-on batch could add the remaining common items — other millets (ragi,
jowar), toor's cousins, tofu, more greens (methi, mint, kale), berries, other
citrus, cloves' fellow warming spices (nutmeg, star anise), tea. But 88 is a
solid floor for batch 6 (meal templates) whenever you're ready.