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

| # | Entry | The specific doubt |
|---|---|---|
| 2 | `barley` | I drafted **pungent vipāka**. Authorities differ and sweet is also attested. Which? |
| 6 | `buttermilk` | Rated **Pitta 0**. Sour + heating argues for `+1`; the classical use of takra in digestive/Pitta conditions argues against. I split the difference, which may be the worst of both. |
| 15 | `cumin` | Rated **Vata −1** despite a pungent, heating, drying profile — pungency usually *raises* Vata. I went −1 on the strength of the classical use for bloating. Is that right? |
| 16 | `corianderSeed` | Rated **tridoshic (−1/−1/−1)**. That's the strongest claim this schema can make and "good for everyone" should be hard to earn. Does it? |
| 9 | `honey` | The **equal-parts-ghee** incompatibility is universally repeated — but is it *Charaka*, or later commentary? Same question that caught ghee's *yogavahi* in batch 1. |

---

## The entries

### Grains

**1. `wheat` — Godhuma · `high` · CS Sut. 27**
sweet · cooling · sweet vipāka · heavy/oily/stable · V−1 P−1 K+1
→ Check: is wheat genuinely Vata-*and*-Pitta pacifying, or is the heaviness enough to make it Vata-neutral?

**2. `barley` — Yava · `high` · CS Sut. 27** 🚩
sweet+astringent · cooling · **pungent** vipāka · light/dry/rough · V+1 P−1 K−1
→ See the doubt table. Everything but vipāka I'm confident in.

### Legumes

**3. `uradDal` — Masha · `high` · CS Sut. 27**
sweet · heating · sweet vipāka · heavy/oily · V−1 P+1 K+1

**4. `chickpea` — Chanaka · `high` · CS Sut. 27**
sweet+astringent · cooling · pungent vipāka · light/dry/rough · V+1 P−1 K−1
→ Check: I've called it *light*, which sits oddly next to "notably gas-forming". Is chickpea classically laghu?

### Dairy

**5. `milk` — Kshira · `high` · CS Sut. 27**
sweet · cooling · sweet vipāka · heavy/oily · V−1 P−1 K+1
→ Check: I list four incompatibles — **fish, sour fruit, salt, yoghurt**. Are all four in the viruddha material, or have I padded the list?

**6. `buttermilk` — Takra · `medium` · CS Sut. 27** 🚩
sour+astringent · heating · sour vipāka · light/dry · V−1 P**0** K−1
→ See the doubt table.

**7. `butter` — Navanita · `medium` · derived**
sweet · cooling · sweet vipāka · heavy/oily · V−1 P−1 K+1
→ Deliberately `medium`: classical *navanita* is fresh unsalted butter churned from curd, not salted cultured supermarket butter. Is that distinction worth making to users, or over-scrupulous?

**8. `hardCheese` — `medium` · derived**
sweet+sour · heating · sour vipāka · heavy/oily/dense · V−1 P+1 K+1
→ Aged rennet cheese has no classical counterpart at all. Sanity-check the derivation.

### Sweeteners

**9. `honey` — Madhu · `high` · CS Sut. 27** 🚩
sweet+astringent · heating · sweet vipāka · light/dry/scraping · V+1 P0 K−1
→ Two things: the ghee question above, and — the **never heat honey** rule is the only *prohibition* in this dataset (everything else is a preference). Confirm that's a fair reading of how emphatic Charaka is.

**10. `jaggery` — Guda · `high` · CS Sut. 27**
sweet · heating · sweet vipāka · heavy/oily · V−1 P+1 K+1

### Oils

**11. `sesameOil` — Tila taila · `high` · CS Sut. 27**
sweet+bitter+astringent · heating · sweet vipāka · heavy/oily/penetrating · V−1 P+1 K**0**
→ Check: Kapha neutral for an oil? I reasoned that sesame's penetrating quality offsets its heaviness. That may be too clever.

**12. `oliveOil` — `medium` · derived**
sweet+astringent · **neutral** virya · sweet vipāka · oily/heavy · V−1 P0 K+1
→ First use of the `neutral` virya you added in batch 1.

### Spices

**13. `blackPepper` — Maricha · `high` · CS Sut. 27**
pungent · heating · pungent vipāka · light/dry/sharp · V+1 P+1 K−1

**14. `turmeric` — Haridra · `medium` · CS Sut. 27**
bitter+astringent+pungent · heating · pungent vipāka · V+1 P+1 K−1
→ `medium` because **Vata +1** is my inference from the dryness, not an explicit classical statement. Note I've made *no* therapeutic claims — turmeric is the most over-marketed item in this dataset and I've kept it to traditional use only.

**15. `cumin` — Jiraka · `medium` · CS Sut. 27** 🚩 — see doubt table

**16. `corianderSeed` — Dhanyaka · `medium` · CS Sut. 27** 🚩 — see doubt table

**17. `fennel` — Mishreya · `medium` · derived**
sweet+pungent+bitter · cooling · sweet vipāka · V−1 P−1 K0
→ Rated on properties + consistent traditional use; fennel is less prominent in the Charaka corpus than cumin or coriander. Is that fair, or is there a citation I'm missing?

**18. `asafoetida` — Hingu · `high` · CS Sut. 27**
pungent · heating · pungent vipāka · light/oily/sharp · V−1 P+1 K−1

**19. `garlic` — Lashuna · `high` · CS Sut. 27**
pungent · heating · pungent vipāka · heavy/oily/sharp/penetrating · V−1 P+1 K−1
→ I've recorded the sattvic/yogic objection as a **pattern exclusion, not a classical property** — Charaka doesn't disapprove of garlic; a different tradition does. Is that the right separation?

**20. `onion` — Palandu · `medium` · derived**
pungent+sweet · heating · pungent vipāka · heavy/oily · V−1 P+1 K+1
→ Raw and cooked onion genuinely differ, and the ratings are a **compromise between them**. That's unsatisfying — if you think it warrants a split like ginger, say so and I'll split it.

### Vegetables & fruit

**21. `potato` — `medium` · derived**
sweet+astringent · cooling · sweet vipāka · heavy/dry · V+1 P−1 K+1
→ New World crop, so necessarily absent from the corpus.

**22. `spinach` — Palakya · `medium` · derived**
astringent+sweet · cooling · pungent vipāka · light/dry/rough · V+1 P−1 K−1
→ `modern` rather than `CS` because the identification of *palakya* with modern spinach isn't secure. Rated on the leafy-green class properties instead. Do you agree with that caution?

**23. `apple` — `medium` · derived**
sweet+astringent · cooling · sweet vipāka · light/dry/rough · V+1 P−1 K−1
→ Note the preparation: stewed apple **reverses** the Vata effect rather than softening it.

### Nuts

**24. `almond` — Badama · `medium` · derived**
sweet · heating · sweet vipāka · heavy/oily · V−1 P+1 K+1
→ `modern` because almonds sit more in later/regional tradition than in Charaka. The soak-and-peel practice is stated as traditional, not cited.

---

## ⚠️ One batch-1 amendment needs your sign-off

Wiring these entries exposed that `exclusionFor()` has always honoured
`dietTags` (`'allium'`, `'root'`) but **no entry had ever set them** — the rule
was live and doing nothing. Fixing it meant tagging existing rows, including two
you already approved:

- **`gingerFresh` → tagged `root`** (excluded for Jain)
- **`gingerDry` → deliberately NOT tagged** (permitted in Jain practice)

That asymmetry is a factual claim about Jain observance on rows you've already
signed off, so it needs your yes.

A second pass hardened the whole exclusion path (see the commit). Two of those
fixes are **content claims in batch 2 that need your verdict alongside the rest**:

- **`potato` → `allergens: ['nightshade']`.** `'nightshade'` has been a
  canonical allergen key since chunk 0, and potato is the first food in the
  dataset that actually is one — so the filter existed and matched nothing.
- **`hardCheese` → `dietTags: ['animal_rennet']`**, which now excludes it for
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

## What I most need back

1. **Is the `high`/`medium` split right now?** I deliberately downgraded several
   classical foods after batch 1. Overcorrected, or about right?
2. **The five 🚩 entries.**
3. **Onion** — compromise entry, or split raw/cooked like ginger?
