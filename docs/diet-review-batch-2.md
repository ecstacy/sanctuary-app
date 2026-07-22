# Diet dataset — review batch 2 (24 entries)

> **You are the fact-check gate.** These were drafted from the classical
> framework by Claude and have **not** been verified. All 24 are `draft`, so the
> app shows none of them. Batch 1's 9 reviewed entries are live.
>
> Source: **Charaka Samhita**, primarily Sutrasthana 25–27 (āhāra) and
> Sutrasthana 26 (viruddha āhāra / incompatibles). File:
> `src/data/ayurveda/ingredients.js`.

## What changed since batch 1

Your review produced one standing correction — **I was over-attributing**,
reaching for a Charaka citation where the claim was later commentary or modern
consensus. I've applied that as a drafting rule here: a `CS` citation is claimed
only where the food is named in the corpus **and** the specific property is what
the text says. Where a property is contested between authorities, or is my
inference, the entry is `medium` and `source.note` says exactly which part is
shaky — **even when the food itself is unmistakably classical**.

That's why several obviously-classical foods (turmeric, cumin, coriander,
buttermilk) are `medium`. Nine of 24 are `high`, down from six of eight in batch

1. If that split still feels generous, tell me — it's the calibration I most

need.

The three schema additions from batch 1 are in use: `virya: 'neutral'` (olive
oil), `cautionNote` (milk, honey, black pepper, garlic, onion, turmeric), and
`source.note` scoping (barley, milk, buttermilk, honey, turmeric, cumin,
coriander, garlic, onion).

## How to review

Unchanged from batch 1 — check rasa/virya/vipāka, the dosha signs
(⚠️ `-1` = **pacifies**, `+1` = **aggravates**), whether the citation holds, and
whether `high` vs `medium` matches your judgement. Accept / correct / reject.

**A one-line verdict per entry is plenty.** For most of these I've written the
specific thing I'm unsure about into the entry list below — answering just those
would be a complete review.

---



## 🚩 Read these five first

These are the entries where I think I'm most likely to be wrong. If your time is
limited, spend it here.


| #   | Entry           | The specific doubt                                                                                                                                                                  |
| --- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2   | `barley`        | I drafted **pungent vipāka**. Authorities differ and sweet is also attested. Which?                                                                                                 |
| 6   | `buttermilk`    | Rated **Pitta 0**. Sour + heating argues for `+1`; the classical use of takra in digestive/Pitta conditions argues against. I split the difference, which may be the worst of both. |
| 15  | `cumin`         | Rated **Vata −1** despite a pungent, heating, drying profile — pungency usually *raises* Vata. I went −1 on the strength of the classical use for bloating. Is that right?          |
| 16  | `corianderSeed` | Rated **tridoshic (−1/−1/−1)**. That's the strongest claim this schema can make and "good for everyone" should be hard to earn. Does it?                                            |
| 9   | `honey`         | The **equal-parts-ghee** incompatibility is universally repeated — but is it *Charaka*, or later commentary? Same question that caught ghee's *yogavahi* in batch 1.                |


---



## The entries



### Grains

**1.** `wheat` **— Godhuma ·** `high` **· CS Sut. 27**
sweet · cooling · sweet vipāka · heavy/oily/stable · V−1 P−1 K+1
→ Check: is wheat genuinely Vata-*and*-Pitta pacifying, or is the heaviness enough to make it Vata-neutral? - looks fine

`reviewStatus: 'reviewed'`

**2.** `barley` **— Yava ·** `high` **· CS Sut. 27** 🚩
sweet+astringent · cooling · **pungent** vipāka · light/dry/rough · V+1 P−1 K−1 → See the doubt table. Everything but vipāka I'm confident in. - **Katu Vipāka is defensible and, in my view, preferable** for a Charaka-based database.  
  
`reviewStatus: 'reviewed'`

### Legumes

**3.** `uradDal` **— Masha ·** `high` **· CS Sut. 27**
sweet · heating · sweet vipāka · heavy/oily · V−1 P+1 K+1

- One point worth adding, though not changing the dosha scores, is that **proper preparation matters**. Traditional use often includes spices such as ginger, cumin, black pepper, or asafoetida to improve digestibility. This modifies how people experience the food but does not alter its intrinsic Ayurvedic properties.

`reviewStatus: 'reviewed'`  


**4.** `chickpea` **— Chanaka ·** `high` **· CS Sut. 27**
sweet+astringent · cooling · pungent vipāka · light/dry/rough · V+1 P−1 K−1
→ Check: I've called it *light*, which sits oddly next to "notably gas-forming". Is chickpea classically laghu?

- Instead of implying that chickpea is heavy because it causes gas, consider a note like:
  > **"Although classically Laghu (light), its pronounced Rūkṣa (dry) and Khara (rough) qualities make it Vāta-provoking and commonly associated with flatulence unless prepared with adequate unctuousness and digestive spices."**



`reviewStatus: 'reviewed'`

### Dairy

**5.** `milk` **— Kshira ·** `high` **· CS Sut. 27**
sweet · cooling · sweet vipāka · heavy/oily · V−1 P−1 K+1
→ Check: I list four incompatibles — **fish, sour fruit, salt, yoghurt**. Are all four in the viruddha material, or have I padded the list?

- Replace **"fruit"** with **"sour fruits / sour substances."**
- There is **no widely recognized passage in Charaka Sutrasthana 26** that explicitly lists:
  > milk + yogurt
  as one of the canonical incompatible pairs.
- Viruddha (CS Sutrasthana 26)
  ✓ Fish
  ✓ Sour substances (including sour fruits)
  ✓ Salt
  Later Ayurvedic guidance
  • Milk with yogurt/curd (traditional recommendation; not one of Charaka's canonical incompatibility examples)

`reviewStatus: 'reviewed'`

**6.** `buttermilk` **— Takra ·** `medium` **· CS Sut. 27** 🚩
sour+astringent · heating · sour vipāka · light/dry · V−1 P**0** K−1
→ See the doubt table.

- You've listed:
  > **Sour (Amla) Vipāka**
  I would mark this as **medium confidence**, because there is less uniformity across Ayurvedic sources than there is for yogurt or milk. Some later texts and compendia differ in how they describe Takra's post-digestive effect.
  For a Charaka-focused database:
  - **Amla Vipāka is defensible**, but I would annotate it as less certain than the other properties.
  - I would **not** upgrade this to "high confidence."
- Takra is not a single product in classical Ayurveda. Traditional texts distinguish different forms depending on:
  - how much butter has been removed,
  - the amount of water added,
  - the degree of churning.
  These variants have somewhat different effects. If your database models only one generic "buttermilk," that's perfectly reasonable, but it's worth noting that the classical category is broader than modern cultured buttermilk sold commercially.


|                  |
| ---------------- |
| **Vipāka: Sour** |



|                                                                                                       |
| ----------------------------------------------------------------------------------------------------- |
| ⚠ Reasonable, but lower confidence than the other properties; I'd flag it as the least certain field. |




`reviewStatus: 'reviewed'`



**7.** `butter` **— Navanita ·** `medium` **· derived**
sweet · cooling · sweet vipāka · heavy/oily · V−1 P−1 K+1
→ Deliberately `medium`: classical *navanita* is fresh unsalted butter churned from curd, not salted cultured supermarket butter. Is that distinction worth making to users, or over-scrupulous?

## Is the fresh-vs-supermarket distinction important?

**Yes, but keep it concise.**

There are several meaningful differences.

### Classical Navanīta

- freshly churned
- usually from cultured curd
- minimally processed
- typically unsalted
- consumed fresh

### Modern supermarket butter

Often:

- pasteurized
- refrigerated for weeks or months
- sometimes salted
- industrially processed
- composition varies by country

Ayurveda places considerable importance on **freshness and processing**, so these are not trivial differences.

`reviewStatus: 'reviewed'`



**8.** `hardCheese` **—** `medium` **· derived**
sweet+sour · heating · sour vipāka · heavy/oily/dense · V−1 P+1 K+1
→ Aged rennet cheese has no classical counterpart at all. Sanity-check the derivation.

- Rather than trying to force aged cheese into the same certainty as milk or yogurt, I'd explicitly indicate the derivation.
  For example:
  ```

  ```
  ```
  Evidence:
  Derived from fermented dairy principles.
  No direct classical equivalent.
  ```
  That tells users exactly why the confidence is lower.
- Derived from fermented dairy principles; no direct analogue exists in the classical Ayurvedic texts.

`reviewStatus: 'reviewed'`

### Sweeteners

**9.** `honey` **— Madhu ·** `high` **· CS Sut. 27** 🚩
sweet+astringent · heating · sweet vipāka · light/dry/scraping · V+1 P0 K−1
→ Two things: the ghee question above, and — the **never heat honey** rule is the only *prohibition* in this dataset (everything else is a preference). Confirm that's a fair reading of how emphatic Charaka is.

- Virya: Traditionally debated (often listed as heating in modern Ayurveda).
- Is Charaka emphatic?
  **Yes.**
  Among dietary recommendations in the Charaka tradition, the warning against **heated honey** is unusually strong. Heated honey is described as becoming unsuitable or harmful, and this teaching has been repeated consistently throughout later Ayurvedic literature.
  So, within the Ayurvedic canon, this is **one of the strongest and most consistently transmitted food-processing prohibitions**.
- Two important caveats:
  1. **Charaka does not frame this as a modern toxicological claim.** The rationale is Ayurvedic (changes in qualities, difficult digestion, production of *āma*), not based on modern chemistry.
  2. The classical texts do **not define a precise temperature threshold**. Modern claims such as "anything above 40 °C" or "never put honey in warm tea" are later interpretations rather than explicit statements in Charaka.

`reviewStatus: 'reviewed'`

**10.** `jaggery` **— Guda ·** `high` **· CS Sut. 27**
sweet · heating · sweet vipāka · heavy/oily · V−1 P+1 K+1

- Classical Ayurveda distinguishes:
  - **Nava Guḍa (fresh/new jaggery)** – generally considered heavier, more Kapha-promoting, and more difficult to digest.
  - **Purāṇa Guḍa (aged jaggery)** – regarded as lighter and more digestible.
  This distinction appears across the classical Ayurvedic tradition and is more clinically relevant than changing the intrinsic dosha profile.
  For a general food database, you don't need separate entries, but a note is worthwhile:
  > **Classical note:** Aged jaggery is generally considered more digestible than freshly prepared jaggery.

`reviewStatus: 'reviewed'`

### Oils

**11.** `sesameOil` **— Tila taila ·** `high` **· CS Sut. 27**
sweet+bitter+astringent · heating · sweet vipāka · heavy/oily/penetrating · V−1 P+1 K**0**
→ Check: Kapha neutral for an oil? I reasoned that sesame's penetrating quality offsets its heaviness. That may be too clever.

- I might use **"subtle/penetrating"** rather than just "penetrating," because **Sūkṣma** is an important classical concept that explains sesame oil's ability to carry effects into deeper tissues.
- Kapha to +1

`reviewStatus: 'reviewed'`

**12.** `oliveOil` **—** `medium` **· derived**
sweet+astringent · **neutral** virya · sweet vipāka · oily/heavy · V−1 P0 K+1
→ First use of the `neutral` virya you added in batch 1.

- Virya: Neutral (derived; no classical Ayurvedic attribution exists for olive oil).

`reviewStatus: 'reviewed'`

### Spices

**13.** `blackPepper` **— Maricha ·** `high` **· CS Sut. 27**
pungent · heating · pungent vipāka · light/dry/sharp · V+1 P+1 K−1

`reviewStatus: 'reviewed'`

**14.** `turmeric` **— Haridra ·** `medium` **· CS Sut. 27**
bitter+astringent+pungent · heating · pungent vipāka · V+1 P+1 K−1
→ `medium` because **Vata +1** is my inference from the dryness, not an explicit classical statement. Note I've made *no* therapeutic claims — turmeric is the most over-marketed item in this dataset and I've kept it to traditional use only.

- I'd keep this as:
  > **Medium · Classical properties with inferred dosha weighting**
- Importantly, **I would not present "Vata +1" as an explicit statement from Charaka**. It's a synthesis of Haridrā's qualities rather than a direct dosha assignment.
- Haridrā's rasa, virya, and vipāka are classically described. The dosha scores—especially Vata +1—are derived from those intrinsic properties rather than quoted directly from Charaka.

`reviewStatus: 'reviewed'`

**15.** `cumin` **— Jiraka ·** `medium` **· CS Sut. 27** 🚩 — see doubt table

- Medium — classical substance; complete energetic profile synthesized from the broader Ayurvedic tradition rather than explicitly enumerated in CS Sutrasthana 27.
- Jīraka (Cumin)
  Evidence:
  Medium – classical ingredient; profile synthesized from Ayurvedic tradition
  Rasa:
  Katu
  Tikta
  Virya:
  Uṣṇa
  Vipāka:
  Katu
  Guṇa:
  Laghu
  Rūkṣa
  Dosha:
  Vata   0
  Pitta +1
  Kapha -1

`reviewStatus: 'reviewed'`

**16.** `corianderSeed` **— Dhanyaka ·** `medium` **· CS Sut. 27** 🚩 — see doubt table

> **Medium — Classical ingredient; energetic profile synthesized from the broader Ayurvedic tradition.**

- Dhānyaka (Coriander Seed)
  Evidence:
  Medium – classical ingredient; profile synthesized from Ayurvedic tradition
  Rasa:
  Kashaya
  Tikta
  Virya:
  Śīta
  Vipāka:
  Madhura
  Guṇa:
  Laghu
  Rūkṣa
  Dosha:
  Vata   0
  Pitta -1
  Kapha -1

`reviewStatus: 'reviewed'`

**17.** `fennel` **— Mishreya ·** `medium` **· derived**
sweet+pungent+bitter · cooling · sweet vipāka · V−1 P−1 K0
→ Rated on properties + consistent traditional use; fennel is less prominent in the Charaka corpus than cumin or coriander. Is that fair, or is there a citation I'm missing?

- Fennel (Miśreyā)
  Evidence:
  Medium – traditional Ayurvedic profile
  Rasa:
  Sweet + Pungent + Bitter
  Virya:
  Cooling
  Vipāka:
  Sweet
  Dosha:
  Vata  -1
  Pitta -1
  Kapha  0

`reviewStatus: 'reviewed'`

**18.** `asafoetida` **— Hingu ·** `high` **· CS Sut. 27**
pungent · heating · pungent vipāka · light/oily/sharp · V−1 P+1 K−1



`reviewStatus: 'reviewed'`

**19.** `garlic` **— Lashuna ·** `high` **· CS Sut. 27**
pungent · heating · pungent vipāka · heavy/oily/sharp/penetrating · V−1 P+1 K−1
→ I've recorded the sattvic/yogic objection as a **pattern exclusion, not a classical property** — Charaka doesn't disapprove of garlic; a different tradition does. Is that the right separation?

- Yes—I think that's the **right separation**, and it's one of the places where keeping your evidence layers distinct will make the database much more reliable.
- **Intrinsic food properties** → belong in the food entry.
- **Sattvic/yogic avoidance** → belongs in a separate "dietary tradition" or "pattern exclusion" layer
- Many modern summaries say:
  > Garlic is rajasic and tamasic, therefore Ayurveda discourages it.
  That's historically inaccurate.
  The avoidance of garlic in some traditions is primarily tied to **yogic and spiritual disciplines**, not because classical Ayurveda considered it an unsuitable food in general.



`reviewStatus: 'reviewed'`

**20.** `onion` **— Palandu ·** `medium` **· derived**
pungent+sweet · heating · pungent vipāka · heavy/oily · V−1 P+1 K+1
→ Raw and cooked onion genuinely differ, and the ratings are a **compromise between them**. That's unsatisfying — if you think it warrants a split like ginger, say so and I'll split it.

- Yes, split. Not because the classical texts require it, but because **culinary preparation materially changes its Ayurvedic qualities** in a way that's more pronounced than for many other foods.
- Raw Onion
  Evidence:  
  Medium
  Rasa:  
  Sweet + Pungent
  Virya:  
  Heating
  Vipāka:  
  Pungent
  Guṇa:
  - Heavy
  - Slightly Oily
  - Sharp
  Dosha:
  - Vata −1
  - Pitta +1
  - Kapha 0
  ---
  ### Cooked Onion
  Evidence:  
  Medium
  Rasa:
  - Sweet
  - Mildly Pungent
  Virya:
  - Heating (milder)
  Vipāka:
  - Pungent
  Guṇa:
  - Heavy
  - Oily
  - Soft
  Dosha:
  - Vata −1
  - Pitta +1 (or 0 if you're deliberately emphasizing the softening effect)
  - Kapha +1



`reviewStatus: 'reviewed'`

### Vegetables & fruit

**21.** `potato` **—** `medium` **· derived**
sweet+astringent · cooling · sweet vipāka · heavy/dry · V+1 P−1 K+1
→ New World crop, so necessarily absent from the corpus.

- **Boiled/steamed**: closer to your baseline profile.
- **Roasted/baked**: drier → relatively more Vata-provoking.
- **Mashed with butter/ghee**: less Vata-provoking because the added fat offsets dryness.
- **Deep-fried**: the oil changes the preparation substantially, but that's better treated as a separate food (e.g., fries) rather than altering the potato entry.
- 



`reviewStatus: 'reviewed'`

**22.** `spinach` **— Palakya ·** `medium` **· derived**
astringent+sweet · cooling · pungent vipāka · light/dry/rough · V+1 P−1 K−1
→ `modern` rather than `CS` because the identification of *palakya* with modern spinach isn't secure. Rated on the leafy-green class properties instead. Do you agree with that caution?

- Yes. I think your caution is **well justified**, and it's actually a good example of being more rigorous than many Ayurvedic food databases.
- Modern spinach evaluated using Ayurvedic principles for leafy greens
- **Medium · Derived**
- 
  I agree with that approach. It's methodologically sound to avoid attaching a Charaka citation when the botanical equivalence itself is uncertain. Deriving the profile from the broader Ayurvedic understanding of leafy greens is a more defensible choice than asserting a direct classical identification. That kind of restraint will make the database more credible to readers familiar with the primary sources.



`reviewStatus: 'reviewed'`



**23.** `apple` **—** `medium` **· derived**
sweet+astringent · cooling · sweet vipāka · light/dry/rough · V+1 P−1 K−1
→ Note the preparation: stewed apple **reverses** the Vata effect rather than softening it.

- agreed: "Stewing substantially changes the energetics, making apple mildly Vata-pacifying rather than Vata-aggravating."
- Better to split

`reviewStatus: 'reviewed'`

### Nuts

**24.** `almond` **— Badama ·** `medium` **· derived**
sweet · heating · sweet vipāka · heavy/oily · V−1 P+1 K+1
→ `modern` because almonds sit more in later/regional tradition than in Charaka. The soak-and-peel practice is stated as traditional, not cited.

`reviewStatus: 'reviewed'`

---



## ⚠️ One batch-1 amendment needs your sign-off

Wiring these entries exposed that `exclusionFor()` has always honoured
`dietTags` (`'allium'`, `'root'`) but **no entry had ever set them** — the rule
was live and doing nothing. Fixing it meant tagging existing rows, including two
you already approved:

- `gingerFresh` **→ tagged** `root` (excluded for Jain)
- `gingerDry` **→ deliberately NOT tagged** (permitted in Jain practice)

That asymmetry is a factual claim about Jain observance on rows you've already
signed off, so it needs your yes.

A second pass hardened the whole exclusion path (see the commit). Two of those
fixes are **content claims in batch 2 that need your verdict alongside the rest**:

- `potato` **→** `allergens: ['nightshade']`**.** `'nightshade'` has been a
canonical allergen key since chunk 0, and potato is the first food in the
dataset that actually is one — so the filter existed and matched nothing.
- `hardCheese` **→** `dietTags: ['animal_rennet']`, which now excludes it for
**vegetarians**, not just vegans. Traditional parmesan, and many gouda and
cheddar styles, are set with slaughter-derived rennet. Microbial-rennet
versions exist, so this over-excludes some cheeses — deliberately, because
the other error tells a vegetarian that slaughter-derived rennet suits them.
If you'd rather split into rennet/microbial entries, say so.

Also: `honey → animal_derived` (a `'sweetener'`, so no category rule caught it
— **a vegan asking about honey was previously told it suited them**),
`garlic`/`onion` → `allium`+`root`, `potato` → `root`.

**One I did NOT tag, and want your call on:** turmeric is a rhizome like
ginger. By the same logic as `gingerFresh` it would be Jain-excluded fresh —
but our entry is generic and mostly describes dried powder, which follows the
`gingerDry` precedent. Left untagged rather than guessed at.

## After reviewing

Change `reviewStatus: 'draft'` → `'reviewed'` on what you accept, then tell me —
I'll add the approved ids to `REVIEWED_BATCH_1` in `dietSafety.test.js` (which
pins the signed-off set, and will **fail** until I do; that failure is the gate
working, not a bug).

## ✅ Outcome — reviewed and applied 2026-07-21

All 24 accepted. **24 entries in, 26 rows out** (two splits), so the dataset is
now **35 reviewed, 0 draft** — the whole thing is live.

### Corrections applied

| Entry | Change |
|---|---|
| `barley` | Pungent (katu) vipāka **confirmed** as the preferable reading; note records that authorities differ |
| `uradDal` | Preparation note added, with the point that spicing changes how it's *experienced*, not its intrinsic properties |
| `chickpea` | `laghu` **stands**; `whyAvoid` rewritten so the dryness (rūkṣa/khara), not heaviness, is named as the reason it provokes Vāta |
| `milk` | Only **fish, sour substances, salt** are canonical viruddha; milk+yoghurt relabelled inline as later tradition |
| `buttermilk` | Pitta-neutral accepted; sour vipāka marked **least certain field**; note added that takra is a *class* of preparations, not one product |
| `butter` | Fresh-vs-supermarket distinction kept and expanded — Ayurveda weighs freshness and processing heavily |
| `hardCheese` | Provenance reworded to say plainly: derived from fermented-dairy principles, no classical analogue |
| `honey` | Heating prohibition **confirmed emphatic**, plus both caveats: the reasoning is Ayurvedic not toxicological, and no temperature threshold is classical |
| `jaggery` | Aged (purāṇa) vs fresh (nava) digestibility note added |
| **`sesameOil`** | **Kapha 0 → +1.** My "penetrating offsets heavy" reasoning was too clever — it's still an oil. Guṇa → *sūkṣma* (subtle, penetrating) |
| `oliveOil` | Note states outright that no classical attribution exists |
| `turmeric` | Note now says the **dosha scores are synthesised**, not quoted from Charaka — properties classical, weighting derived |
| **`cumin`** | **Vāta −1 → 0**; rasa gains bitter (katu+tikta); citation dropped to derived |
| **`corianderSeed`** | **Tridoshic claim did not survive.** Vāta −1 → 0; rasa → kaṣāya+tikta; guṇa → laghu+rūkṣa; citation dropped to derived |
| `fennel` | Confirmed as drafted |
| `garlic` | Separation endorsed; note now states the "Ayurveda discourages garlic" claim is **historically inaccurate** — the avoidance is yogic, not Charaka's |
| **`onion` → `onionRaw` + `onionCooked`** | **Split.** Raw K0, cooked K+1 |
| `potato` | Preparation detail (boiled / roasted / mashed / fried) added |
| `spinach` | Caution on the *palakya* identification endorsed |
| **`apple` → `apple` + `appleStewed`** | **Split.** Stewed reverses the Vāta sign (V+1 → V−1) |
| `wheat`, `blackPepper`, `asafoetida`, `almond` | Accepted as drafted |

### The pattern in this batch

Batch 1's correction was over-attribution in the **citations**. This batch's is
over-claiming in the **dosha scores** — and specifically in one direction:
I kept rating dry, pungent, heating things as Vāta-pacifying. Cumin, coriander
and sesame oil all moved the same way, and `corianderSeed`'s tridoshic −1/−1/−1
was the extreme case. **Standing rule for batch 3: a dry or pungent food does
not pacify Vāta.** "Doesn't aggravate" is a 0, and that is usually the honest
answer. Reserve −1 for genuinely unctuous, grounding, or explicitly attested
cases.

### ✅ The three open items — resolved 2026-07-21

| Item | Decision |
|---|---|
| `honey` + equal parts ghee | **Keep as a classical citation** — genuine viruddha āhāra, CS Sutrasthana 26. Unlike the *yogavāhī* attribution, this one holds. |
| `gingerDry` root tag | **Add**, matching `gingerFresh`. |
| `turmeric` root tag | **Add**, for consistency with the ginger precedent. |

**The rule this establishes, now recorded in the schema and under test:**
Jain exclusion follows the **plant part**, not the processing. A rhizome stays
a rhizome dried, ground or powdered. My earlier fresh-vs-dried asymmetry was
wrong and has been reversed.

**One deliberate exception**, which the rule would otherwise catch:
**asafoetida**. Hing is the dried *resin*, not the root itself — which is why
Jain cooking permits it, and uses it as the standard allium substitute.
Excluding it would break the very diet the pattern exists to serve. Left
untagged on purpose, and there is now a test saying so, so nobody "fixes" it
later.

This also cleanly separates the two layers the reviewer asked for:
**evidence** (is the claim classical?) and **pattern** (does an observance
exclude it?). Honey+ghee is an evidence-layer decision; the rhizome tags are
pattern-layer, and neither should borrow reasoning from the other.

### ✅ The two safety-layer questions — resolved 2026-07-21

**`potato` → nightshade: changed to a preference, not an allergen.**
Calling solanaceae an allergen was a category mismatch — a botanical family is
not a medical allergen category, and putting it in `ALLERGENS` made the UI tell
the user *"you've told us this is an allergen for you"* about what is really an
avoidance choice. `'nightshade'` is now a `dietTags` value with a matching
`DIET_PATTERNS.NO_NIGHTSHADE`, exactly parallel to `allium` / `no_onion_garlic`.
It reports as `reason: 'pattern'`, so the copy says preference rather than
allergy. A test asserts it never returns to the allergen vocabulary.

**`hardCheese` → animal rennet: exclusion removed, note added.**
The entry is generic — its aliases cover gouda, cheddar, emmental and parmesan
— and most modern hard cheese uses microbial or vegetable rennet, so excluding
it wholesale would be wrong for the majority case. It now carries a
`cautionNote` naming which styles are traditionally animal-set and suggesting a
label check.

This reverses my earlier "over-restriction is the safe failure" reasoning, and
it's worth being explicit about why: that rule holds for **allergens**, where
the two error directions are wildly asymmetric. For a **preference**, both
errors cost something — telling a vegetarian that all hard cheese is off-limits
is a real wrong answer, not a safe one. Safety-vs-preference is what decides
which way to lean, and it is the same distinction the potato fix turns on.

The `animal_rennet` tag, rule and test all stay live, exercised by a fixture,
so a specific `parmigianoReggiano` entry can use them the day we add one.

### Note to self on the format

The doubt table didn't render for you in Cursor, which made the five entries
I most needed checked the five hardest to find. **Batch 3 puts every doubt
inline under its own entry** — no separate table, no cross-references.

## What I most need back

1. **Is the** `high`**/**`medium` **split right now?** I deliberately downgraded several
  classical foods after batch 1. Overcorrected, or about right?
2. **The five 🚩 entries.**
3. **Onion** — compromise entry, or split raw/cooked like ginger?

