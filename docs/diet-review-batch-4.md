# Diet review batch 4 — vegetables & fruit (19 entries)

> All 19 are `draft`, so none appear in the app yet.
> File: `src/data/ayurveda/ingredients.js`. Dataset is now **55 rows: 35 live,
> 20 draft** (these 19 plus `cardamom`, held over from batch 3).
>
> Doubts are written **inline under each entry**, not in a table.

## Why this batch is vegetables

Batch 3 review caught two dishes misrepresented for the same reason — spinach
was the only vegetable we had. A "mixed vegetable soup" was really a spinach
soup (removed), and a "sabzi" was really spinach (made generic). Vegetables
went from 6 rows to 25, which unblocks both and gives the meal composer enough
to stop handing Vata and Pitta users the identical midday list.

## Standing rules applied

Both corrections from earlier rounds, used as drafting rules rather than
things for you to catch again:

1. **A dry or pungent food does not pacify Vāta.** "Doesn't aggravate" is a
  `0`, and it's usually the honest answer. Ten of these are Vāta `0`.
2. **Claim a citation only where the food is named in the corpus *and* the
  property is what the text says.** Most of this batch is New World crops or
   insecure identifications, so **15 of 19 are** `medium`.

**Raw vs cooked** comes up more here than in any previous batch. Where cooking
softens an effect, the entry carries a `preparation` note. Where it **flips a
sign**, the entry is split — the `apple`/`appleStewed` precedent, because the
dosha chips can't display a sign that contradicts the note beneath them.

---



## 🚩 The four I'd check first

`banana` **— Kadali ·** `medium` **· CS Sut. 27**
sweet · cooling · **sour vipāka** · heavy/moist/soft · V−1 P0 K+1
→ Classical sources give banana a **sour** vipāka despite its sweet taste.
That's counter-intuitive and the opposite of what derivation alone suggests —
the same shape as the barley vipāka question in batch 2. Right?
→ Also: I've listed **banana + milk** as incompatible. Widely taught, but is it
*Charaka* or later tradition? Same question that caught ghee's *yogavāhī*.


|                            |                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Banana + milk incompatible | ❌ **Not verified in Charaka**; treat as Suśruta/later Ayurvedic tradition. [siva.sh](http://siva.sh)                     |
| Banana = Amla Vipāka       | ⚠ **Not verified from Charaka** based on the text I checked. Keep only if supported by another primary Ayurvedic source. |


- Reviewed

`mangoRipe` **— Amra ·** `medium` **· CS Sut. 27**
sweet · **heating** · sweet vipāka · heavy/oily · V−1 **P0** K+1
→ The two things I've written don't sit easily together: ripe mango is commonly
described as *heating*, yet also as settling rather than aggravating Pitta. I
drafted heating with Pitta neutral, which is a compromise that may be wrong in
both directions. Your call on which one gives.

- mangoRipe — Amra
  Evidence: Medium
  Rasa: Sweet
  Virya: Heating
  Vipāka: Sweet
  Guṇa: Heavy, Oily
  Dosha:
  Vata  -1
  Pitta  0
  Kapha +1
- Reviewed

`radish` **— Mulaka ·** `medium` **· CS Sut. 27**
pungent · heating · pungent vipāka · light/dry/sharp · V0 P+1 K−1
→ The tradition distinguishes **tender** radish from **large mature** ones
fairly sharply, the mature being much harsher. This entry describes the tender
form and says so. Split, like ginger and onion, or is the note enough?

### I would split

I'd recommend something like:

#### **Radish (Tender / Young)**

- Evidence: **Medium–High**
- Classical basis: CS Sut. 27
- Pungent
- Heating
- Pungent vipāka
- Light / Dry / Sharp
- **V0 (or even −1 if you want to lean into Charaka's tridoṣa-alleviating statement), P+1, K−1**

#### **Radish (Mature)**

Instead of trying to derive the energetics from first principles, simply reflect what Charaka says:

- **Aggravates all three doṣas** (Tridoṣa +1)
- Note that cooking with fat modifies the effect, and drying changes it again.



- Reviewed

`tomatoRaw` **—** `medium` **· derived**
sour+sweet · heating · sour vipāka · V+1 **P+1 K+1**
→ I've rated raw tomato as aggravating **all three doshas**, which is the
mirror image of the tridoshic claim you rejected for coriander in batch 2. It
should get the same scrutiny in the other direction. Split from `tomatoCooked`
because cooking moves Vāta and Kapha to neutral — a sign change.

- I'd score Kapha as **0**, not **+1**.
- 

  |       | Raw | Cooked |
  | ----- | --- | ------ |
  | Vata  | +1  | 0      |
  | Pitta | +1  | +1     |
  | Kapha | 0   | 0      |

  The important transition is really **Vata**. Cooking reduces rawness and makes tomato easier to digest, but it doesn't transform it into a Kapha-promoting food.
- Reviewed

---



## Vegetables

`carrot` — sweet+astringent · heating · pungent vipāka · light/dry · V**0** P+1 K−1 · `root`
→ Vāta 0 rather than −1, per the dry-food rule. Ratings describe it *cooked*.

- carrot
  Evidence:
  Medium – derived
  Rasa:
  Sweet + Astringent
  Virya:
  Heating
  Vipāka:
  Pungent
  Guṇa:
  Light
  Dry
  Dosha:
  Vata   0
  Pitta +1
  Kapha -1
  Pattern tags:
  Root
- Reviewed 

`beetroot` — sweet · heating · sweet vipāka · heavy/oily · V−1 P+1 K**0** · `root`
→ Kapha 0 for a heavy sweet vegetable is the soft spot; I reasoned its warmth
offsets the heaviness. That's the same "too clever" move that got sesame oil
corrected in batch 2, so I'd rather you looked at it.

- beetroot — medium · derived
  Sweet
  Heating
  Sweet vipāka
  Heavy
  Oily
  Vata   -1
  Pitta  +1
  Kapha  +1
  Root
- Reviewed

`pumpkin` **— Kushmanda** · sweet · cooling · sweet vipāka · heavy/soft/moist · V−1 P−1 K+1
→ `CS` cited but `medium`: Kushmanda is classical, but its identification with
modern squashes is approximate. Fair, or should it drop to `modern`?

- I **wouldn't drop it to "modern."** I'd instead fix the taxonomy:
  - ✅ **Kuṣmāṇḍa = ash gourd / winter melon (Benincasa hispida)** → keep the Charaka citation. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC12563348/?utm_source=chatgpt.com)
  - ❌ Don't label that entry simply "pumpkin," because modern readers will assume *Cucurbita* rather than the classical plant.
  - If you also want to cover modern pumpkins, make them a **separate derived entry** with no Charaka attribution.
- Reviewed

`bottleGourd` **— Alabu** · sweet · cooling · sweet vipāka · light/moist · V0 P−1 K0
→ Deliberately mild across the board. The classical convalescent vegetable.

- bottleGourd — Alabu · medium · CS Sut. 27
  Sweet
  Cooling
  Sweet vipāka
  Heavy
  Dry
  Vata   0
  Pitta -1
  Kapha  0
- I would **not** describe Alābu as **light/moist**. Charaka explicitly characterizes it as **heavy and dry**, so I'd align the guṇa with the source and let the dosha neutrality emerge from those opposing classical qualities rather than from modern intuition.
- Reviewed

`okra` — sweet+astringent · cooling · sweet vipāka · light/**slimy** · V−1 P−1 K+1
→ New guṇa value `slimy`, for the mucilaginous quality that is the whole point
of the food. Reasonable addition, or force it into existing vocabulary?

- I would **add the new quality**, but I'd do it as:
  ```
  Guṇa:
  Light
  Picchila (Slimy)
  ```
  rather than introducing a purely modern descriptor. It preserves the Ayurvedic framework while accurately describing what makes okra distinct. I think that's a stronger long-term design than trying to squeeze okra into your existing vocabulary.
- Reviewed

`cabbage` — astringent+sweet · cooling · pungent vipāka · light/dry/rough · V+1 P−1 K−1
`cauliflower` — same profile, plus `balancedBy: [asafoetida, cumin, ginger, ghee]`
→ Both rated on the brassica pattern. **Should cabbage carry** `balancedBy` **too?**
I added it only to cauliflower and can't now justify the asymmetry.

- I'd make them symmetric.
  ```
  cabbage
  balancedBy:
    - asafoetida
    - cumin
    - ginger
    - ghee

  cauliflower
  balancedBy:
    - asafoetida
    - cumin
    - ginger
    - ghee
  ```
  ### One possible future refinement
  If you ever introduce metadata like:
  ```
  digestiveNeed:
    low
    moderate
    high
  ```
  or
  ```
  requiresBalancing: true
  ```
  then you could distinguish:
  - cabbage = moderate,
  - cauliflower = high.
  But with the current schema, a simple `balancedBy` list is binary, so consistency is preferable.
  ## Final verdict
  Yes—I would give **cabbage the same** `balancedBy` **field**.
  The intrinsic Ayurvedic rationale (dry, rough, cooling, Vata-provoking brassica) applies to both, and the asymmetry is harder to defend than the symmetry. If anything, I'd think of the entire **brassica family** as sharing the same default balancing spices, with differences in **how strongly** they're recommended rather than **whether** they're recommended.
- Reviewed

`greenBeans` — sweet+astringent · cooling · light · V0 P−1 K0
→ Near-neutral on purpose: a mild food, and claiming more would overstate it.

- The only thing I'd revisit is whether the entry should include a **vipāka** field for schema consistency. Otherwise, I think this is one of the cleaner derived entries in the database precisely because it resists the temptation to assign stronger effects than the available evidence justifies.
- Reviewed

`peas` — sweet+astringent · cooling · pungent vipāka · light/dry · V+1 P−1 K−1
→ Sits between vegetable and pulse; I followed the pulse pattern for dryness.

- This is where I think a split is more valuable than changing the scores.
  For example:
  - **Green peas (fresh)** → vegetable profile
  - **Dried peas** → pulse profile
- I'd keep:
  ```
  Sweet + Astringent
  Cooling
  Pungent vipāka

  Light
  Dry

  Vata   +1
  Pitta  -1
  Kapha  -1
  ```
  The only refinement I'd suggest is **clarifying the scope**:
  - If the entry is intended for **fresh green peas**, add a note that the profile intentionally follows the legume/pulse pattern because of their drying tendency.
  - If you expect to cover both fresh and dried forms separately in the future, a split would be even cleaner.
  Overall, though, I think your current profile is methodologically consistent with the rest of the database.
- Reviewed

`tomatoCooked` — sour+sweet · heating · sour vipāka · V0 P+1 K0
→ See `tomatoRaw` above.

- I would keep the cooked entry essentially as written:
  ```
  tomatoCooked — medium · derived

  Rasa:
  Sour + Sweet

  Virya:
  Heating

  Vipāka:
  Sour

  Dosha:
  Vata   0
  Pitta +1
  Kapha  0
  ```
  Taken together with the revised raw profile (**V+1 / P+1 / K0**), I think this becomes one of the more convincing preparation splits in your database. It captures a meaningful Ayurvedic distinction while remaining conservative about the inferred dosha effects.

`aubergine` **— Vartaka** · pungent+astringent · heating · pungent vipāka · V0 P+1 K−1
→ `modern`, not `CS`: Vartaka appears more in later literature than in Charaka
and the identification isn't certain. Agree with that caution?

- Because eggplant is such a preparation-dependent food, I'd include a note:
  > **Profile assumes cooked aubergine. Frying or cooking with oil/ghee substantially moderates its drying tendency.**
  That explains why the entry isn't more Vata-provoking.
- I agree with your caution:
  - ✅ **Don't treat aubergine as a securely identified Charaka food.**
  - ✅ **Keep the confidence at Medium.**
  - ✅ **Base the energetics on the later Ayurvedic tradition rather than claiming direct classical authority.**
  Your profile is methodologically consistent with the rest of the database, and I think the conservative attribution is the right choice.
- Reviewed

`cucumber` **— Trapusha** · sweet+astringent · cooling · sweet vipāka · heavy/moist · V+1 P−1 K+1

- cucumber — Trapusha
  Sweet + Astringent
  Cooling
  Sweet vipāka
  Heavy
  Moist
  Vata   0
  Pitta -1
  Kapha +1
- **Vata +1** is the weakest part. Given your own methodology, the moist, sweet, heavy qualities should substantially offset the cooling effect. **Vata 0** is more internally consistent than **+1**.

This is another case where I'd avoid letting a single quality (cooling) outweigh several others in the final dosha score.

- Reviewed

`radish` **— Mulaka** — see 🚩 above.

## Fruit

`banana` **— Kadali** — see 🚩 above.

`pomegranate` **— Dadima** · sweet+astringent+sour · cooling · sweet vipāka · light · V0 P−1 K−1 · `high`
→ One of only four `high` entries here. Classically praised and strongly
attested. Note the entry describes the **sweet** variety; sour pomegranate is
treated differently and isn't covered.

- I'd keep it essentially unchanged:
  ```
  pomegranate (sweet variety) — Dāḍima

  Evidence:
  High

  Rasa:
  Sweet + Astringent + Sour

  Virya:
  Cooling

  Vipāka:
  Sweet

  Guṇa:
  Light

  Dosha:
  Vata   0
  Pitta -1
  Kapha -1
  ```
  The only refinement I'd suggest is making the **"sweet variety"** part of the entry name rather than burying it in a note. That way, users immediately understand that this is a deliberately scoped classical profile and that a separate entry would be needed for sour pomegranate. Overall, I think this deserves to remain one of your **High-confidence** entries.
- Reviewed

`grapes` **— Draksha** · sweet · cooling · sweet vipāka · heavy/moist · V−1 P−1 K+1 · `high`

- The only editorial suggestion—consistent with your treatment of pomegranate—is to note that the profile assumes **ripe, sweet grapes**, since unripe or very sour grapes would not share exactly the same energetics.
- Reviewed

`mangoRipe` **— Amra** — see 🚩 above.

`lemon` **— Nimbuka** · sour · heating · sour vipāka · light/sharp · V−1 P+1 K−1
→ `modern`: citrus sits in later literature more than in Charaka. Vāta −1 for a
*sour* food is consistent with the rule (sour and salty settle Vāta; it's dry
and pungent that don't) — but flagging it since it's the one place I've given a
sharp food a −1.

- lemon — Nimbūka
  Evidence:
  Medium (later Ayurvedic tradition)
  Rasa:
  Sour
  Virya:
  Heating
  Vipāka:
  Sour
  Guṇa:
  Light
  Sharp
  Dosha:
  Vata  -1
  Pitta +1
  Kapha -1
- I would **keep Vata −1**. In fact, I'd argue it's one of the more principled dosha assignments in the database: you're letting the **primary Ayurvedic rule that sour taste pacifies Vata** outweigh secondary qualities like lightness and sharpness. That is more consistent than treating every "sharp" food as automatically Vata-aggravating.
- The weakest field for me is actually **Light**.
  Lemon is certainly not heavy, but I'm not convinced "light" contributes much explanatory value. If your guṇa vocabulary allows it, **Sharp** alone may already capture the salient quality.
  I wouldn't change it unless you're trying to simplify the schema.
- Reviewed

---



## What I need back

1. **The four 🚩 entries.**
2. `cauliflower` **has** `balancedBy` **and** `cabbage` **doesn't** — should both?
3. **Splits:** is `tomatoRaw`/`tomatoCooked` right, and does `radish` need one?
4. **Is** `high` **right for** `pomegranate` **and** `grapes`**?** They're the only two
  fruits I've claimed as classically settled.



## Also still open from batch 3

`cardamom` — you asked for it in a later batch, so it rides with this one.
⚠️ Drafted **tridoshic (−1/−1/−1)**, which is exactly the claim you rejected
for coriander. Its **cooling** virya is also unusual for an aromatic pungent
spice — that's the classical description rather than what derivation suggests.

- I'd draft it like this:
  ```
  cardamom

  Evidence:
  Medium (later Ayurvedic tradition)

  Rasa:
  Pungent (with slight Sweet)

  Virya:
  Cooling

  Vipāka:
  Sweet (or retain whichever later source you're consistently following)

  Guṇa:
  Light
  Aromatic

  Dosha:
  Vata   0
  Pitta -1
  Kapha -1
  ```
  ## Final verdict
  - ✅ **Keep the cooling virya.** It's one of the defining classical characteristics of cardamom and shouldn't be "corrected" to fit a derivation.
  - ❌ **Don't make it tridoṣic (−1/−1/−1).** That runs into the same methodological issue we discussed with coriander.
  - ✅ I would score it **V0 / P−1 / K−1**, which preserves its distinctive cooling, digestive, Kapha-reducing nature without overstating its ability to pacify Vata.
- Reviewed

## ✅ Batch 4 reviewed & applied 2026-07-23

All 19 + cardamom accepted; **19 in, 20 rows out** (radish split), so the
dataset is now **56 foods, all reviewed, 0 draft** — 26 of them vegetables and
fruit.

| Entry | Change |
|---|---|
| **`pumpkin` → `ashGourd`** | Taxonomy fix: Kushmanda is Benincasa (ash gourd), not Cucurbita. Renamed, Cucurbita aliases dropped, CS citation kept. |
| **`radish` → split** | `radishTender` (V0 P+1 K−1) + `radishMature` (**tridoshic +1**, per Charaka on the mature root). |
| `beetroot` | Kapha 0 → **+1** — warmth doesn't offset a heavy sweet root's heaviness. |
| `cucumber` | Vata +1 → **0** — moist/sweet/heavy offsets the cooling. |
| `tomatoRaw` | Kapha +1 → **0** — the real transition on cooking is Vata, not Kapha. |
| `bottleGourd` | guna light/moist → **heavy/dry**, to match Charaka; neutrality now emerges from opposing qualities. |
| `okra` | guna `slimy` → **`picchila`**, keeping it in the classical vocabulary. |
| `cabbage` | added `balancedBy` — symmetric with cauliflower (brassica family). |
| `peas` | scope note: profile is for **fresh** peas, following the pulse pattern. |
| `aubergine` | note: profile assumes **cooked**; oil moderates the dryness. |
| `pomegranate` | renamed **"Pomegranate (sweet)"** — scope in the name, not a note. |
| `grapes` | note: assumes ripe sweet grapes. |
| **`banana`** | Downgraded CS → **modern**. The sour vipāka and banana+milk are later tradition, **not verified in Charaka** — sour vipāka kept on that basis, milk pairing labelled as later tradition. |
| **`cardamom`** (batch-3 holdover) | Not tridoshic: **V0 P−1 K−1**. Cooling kept; vipāka pungent → sweet; guna → light/aromatic. Same over-claim we rejected for coriander. |
| `carrot`, `tomatoCooked`, `greenBeans`, `mangoRipe`, `lemon`, `cauliflower` | accepted as drafted |

### The pattern this batch confirmed

Two recurring corrections, both **"don't let one quality outweigh several."**
Cucumber, beetroot and raw tomato all had a single property (cooling, warmth,
sourness) driving a dosha score the other qualities argued against. And the
over-attribution rule held on the fruit: banana's Charaka citation didn't
survive, cardamom's tridoshic claim didn't either. The plant-part / raw-cooked
splits (radish, tomato) continue the ginger/onion/apple precedent.

Two new guna values entered the vocabulary: `picchila` (mucilaginous) and
`aromatic`, both translated across en/de/hi.

**Unblocks batch 5** — real vegetables now exist for a mixed-vegetable soup and
a `chapatiSabzi` with alternatives.

## After this batch

19 vegetables and fruit unblock the meal templates that were removed or
watered down: a real **mixed vegetable soup**, a `chapatiSabzi` with actual
alternatives, and enough seasonal range that a Kapha user in summer and a Vāta
user in winter stop seeing the same three dishes. That's batch 5 — new meal
templates — and it should wait until these are signed off, since a template
built on a draft ingredient is invisible anyway.