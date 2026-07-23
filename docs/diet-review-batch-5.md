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
**11 of 31 are `high`** — more classical citations than usual, because many
Indian staples (coconut, dates, amla, cinnamon, clove, mustard, fenugreek,
tamarind, toor, chana, walnut) genuinely are in the corpus.

---

## 🚩 The four to check first

**`masoorDal` — Masura · `medium`** — sweet+astringent · **heating** · pungent
vipāka · light/dry · V+1 P+1 K−1
→ Virya is the doubt: Masura is called **heating by some authorities, cooling by
others**. I drafted heating (more common), which is unusual for a pulse. Which?

**`amla` — Amalaki · `high`** — five tastes · cooling · sweet vipāka · light/dry
· **V−1 P−1 K−1**
→ Tridoshic — but unlike coriander, amla's three-dosha balancing **is** the
classical claim (a foremost rasāyana). I've noted that the **sour taste**, not
the dryness, carries the Vāta −1. Confirm you're happy publishing the tridoshic
rating as attested rather than derived.

**`clove` — Lavanga · `medium`** — pungent+bitter · **cooling** · pungent vipāka
· V0 P0 K−1
→ Lavanga is classically described **cooling** despite being pungent — the
opposite of what derivation gives. Drafted cooling on the classical basis;
flag, since it's counter-intuitive.

**`amla` and `clove` both** put a classical description ahead of the derivation.
That's deliberate (the corpus outranks first-principles), but they're the two
places it happens, so worth your eye.

---

## Legumes

**`toorDal` — Adhaki · `high`** — astringent+sweet · cooling · pungent vipāka ·
light/dry · V+1 P−1 K−1 · balancedBy asafoetida/cumin/ginger/ghee
→ The everyday dal. Classical (Adhaki). Follows the pulse pattern.

**`chanaDal` — Chanaka · `high`** — same substance as whole chickpea, split.
V+1 P−1 K−1, light/dry/rough. balancedBy.

**`rajma` — kidney beans · `medium` · derived** — sweet+astringent · cooling ·
heavy/dry · V+1 P0 K+1
→ New World bean. Rated **heavy AND dry** — heavier than the classical pulses,
which is why K+1 not K−1. Fair?

**`peanut` · `medium` · derived** — sweet · heating · heavy/oily · V−1 P+1 K+1 ·
allergen peanuts. New World; filed as legume (botanically correct).

## Dairy

**`paneer` · `medium` · derived** — sweet · cooling · heavy/oily/dense ·
V−1 P0 K+1 · allergen dairy
→ Fresh acid-set cheese; the corpus knows curd and buttermilk, not paneer.
Pitta 0 (fresh and cooling, unlike aged cheese). Right, or P−1?

## Grains

**`brownRice` · `medium`** — sweet · neutral · heavy/dry · V0 P0 K+1
→ Classical shali is *polished white* rice; brown rice keeps the bran, so
heavier and drier. V0 (the bran's dryness offsets rice's usual V−1).

**`semolina` — suji · `medium`** — sweet · neutral · light · V−1 P0 K0. From wheat.

**`flattenedRice` — poha · `medium`** — sweet · cooling · light/dry · V0 P−1 K0.
A very light rice product.

**`pearlMillet` — Bajra · `medium`** — sweet+astringent · **heating** · light/dry
· V+1 P+1 K−1 · winter
→ Millets are light, dry and warming — a winter/Kapha grain. Filed `modern`
(millets sit more in regional than Charaka tradition). Agree?

## Vegetables

**`sweetPotato` · `medium`** — sweet · heating · heavy/moist · V−1 P0 K+1 · root.
New World; sweeter and grounding where ordinary potato is drying.

**`broccoli` · `medium`** — brassica pattern (like cabbage/cauliflower). V+1 P−1
K−1, balancedBy.

**`zucchini` — courgette · `medium`** — sweet · cooling · light/moist · V0 P−1 K0.
Summer squash, gourd-like.

**`bellPepper` — capsicum · `medium`** — pungent+sweet · heating · light/dry ·
V0 P+1 K−1 · nightshade. New World.

**`greenChili` · `medium`** — pungent · heating · light/dry/sharp · V0 P+1 K−1 ·
nightshade, acid_reflux caution. Filed as **spice**. New World — classical heat
came from pepper and ginger, not chilli.

**`mushroom` · `medium`** — sweet+astringent · cooling · heavy/moist · V+1 P0 K+1
→ Classical texts treat fungi with caution and don't characterise culinary
mushrooms. Heavy/moist/cooling → slow. Held medium. Comfortable publishing?

**`corianderLeaf` — cilantro · `medium`** — astringent+bitter · cooling ·
V0 P−1 K0. The fresh leaf of Dhanyaka, milder and more cooling than the seed.

**`curryLeaf` — Surabhinimba · `medium`** — bitter+pungent+astringent · heating ·
light/dry · V0 P0 K−1. Regional/later tradition.

## Fruit

**`coconut` — Narikela · `high`** — sweet · cooling · heavy/oily · V−1 P−1 K+1.
Classical and strengthening.

**`dates` — Kharjura · `high`** — sweet · cooling · heavy/moist · V−1 P−1 K+1.
Classical restorative fruit.

**`amla` — Amalaki · `high`** — see 🚩.

**`orange` · `medium`** — sweet+sour · cooling · light/moist · V−1 P0 K+1. Sweet
citrus, later tradition.

**`papaya` · `medium`** — sweet · heating · light/moist · V−1 P+1 K−1 · pregnancy
caution (green papaya). New World; digestive, warming, unusually Kapha-reducing
for a sweet fruit.

**`watermelon` · `medium`** — sweet · cooling · heavy/moist · V0 P−1 K+1 ·
summer; best eaten alone (combosToAvoid: other foods). Not securely classical.

## Spices

**`cinnamon` — Twak · `high`** — pungent+sweet+astringent · heating · light/dry ·
V−1 P+1 K−1.

**`clove` — Lavanga · `medium`** — see 🚩.

**`mustardSeed` — Sarshapa · `high`** — pungent · heating · light/oily/sharp ·
V−1 P+1 K−1 · allergen mustard.

**`fenugreekSeed` — Methika · `high`** — bitter+pungent · heating · light/dry ·
V−1 P+1 K−1.

**`tamarind` — Amlika · `high`** — sour · heating · sour vipāka · heavy ·
V−1 P+1 K+1 · acid_reflux caution.

## Oils & nuts

**`coconutOil` · `medium`** — sweet · cooling · heavy/oily · V−1 P−1 K+1. The one
cooling cooking oil — the summer counterpart to warming sesame oil.

**`cashew` · `medium`** — sweet · heating · heavy/oily · V−1 P+1 K+1 · nuts. New World.

**`walnut` — Akshota · `medium`** — sweet+astringent · heating · heavy/oily ·
V−1 P+1 K+1 · nuts. Named among classical nuts.

---

## What I need back

1. **The four 🚩** — masoor virya, amla tridoshic, clove virya.
2. **`rajma` K+1** (heavy overriding the usual pulse K−1) — right?
3. **`paneer` Pitta 0 vs −1.**
4. Any `medium` you think should be `high`, or vice versa — the split is
   **11 high / 20 medium**, more classical than usual because so many Indian
   staples genuinely are in the corpus.

## Coverage after this

88 foods. This is enough to build real meals: dal-rice-veg thalis, the German-
Western staples, seasonal fruit. If you want an **even** broader base first, a
follow-on batch could add the remaining common items — other millets (ragi,
jowar), toor's cousins, tofu, more greens (methi, mint, kale), berries, other
citrus, cloves' fellow warming spices (nutmeg, star anise), tea. But 88 is a
solid floor for batch 6 (meal templates) whenever you're ready.
