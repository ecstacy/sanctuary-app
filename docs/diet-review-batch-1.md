# Diet dataset — review batch 1 (8 entries)

> **You are the fact-check gate.** These were drafted from the classical
> framework by Claude and have **not** been verified. Until you mark them
> reviewed, the app shows nothing — which is the intended behaviour, not a bug.
>
> Source: **Charaka Samhita**, primarily Sutrasthana 25–27 (āhāra / the six
> tastes) and Sutrasthana 7 (incompatibles). File:
> `src/data/ayurveda/ingredients.js`.

## Why this batch is only 8

Proving the loop before scale. If my drafting has a systematic bias — wrong
`vipaka` convention, over-confident citations, mis-set dosha signs — you'll see
it in 8 entries, and I'll correct the *method* before generating 60 more with
the same flaw baked in.

## How to review one entry

For each, check four things against Charaka. They're listed per entry below.

1. **rasa / virya / vipaka** — taste, potency, post-digestive effect.
2. **doshaEffect** — ⚠️ **sign convention:** `-1` **= pacifies,** `+1` **= aggravates.**
  (Opposite to asanas. See `lib/doshaSemantics.js`.)
3. **The citation** — does the cited chapter actually support this, or is it
  decoration? If it doesn't, that's the most important kind of correction:
   downgrade `source.text` to `'modern'` and `confidence` to `'medium'`.
4. `confidence` — `high` only for genuine classical consensus. If it's your
  inference rather than the text's, it's `medium`.

Then either:

- **Accept:** change `reviewStatus: 'draft'` → `'reviewed'`.
- **Correct:** fix the field, then mark reviewed.
- **Reject:** leave as draft and tell me why — the *why* is what improves the
next batch.

⚠️ Don't flip a flag you haven't actually checked. The gate is only worth
something if it means what it says.

---



## The entries



### 1. `basmatiRice` — Basmati rice (Shali) · `high` · CS Sutrasthana 27

- **Claim:** rasa sweet · virya **cooling** · vipaka sweet · guna light, soft
- **Dosha:** vata −1 (pacifies), pitta −1 (pacifies), kapha 0 (neutral)
- **Check:** is *shali* rice specifically the variety Charaka praises among
cereals? Is kapha genuinely neutral, or mildly aggravating (+1)?
- `reviewStatus: 'reviewed'`



### 2. `ghee` — Ghrita · `high` · CS Sutrasthana 27

- **Claim:** rasa sweet · virya **cooling** · vipaka sweet · guna oily, soft, heavy
- **Dosha:** vata −1, pitta −1, kapha **+1** (aggravates)
- **Check:** the "foremost of the fats" framing and the claim that ghee carries  
the qualities of what it's cooked with (*yogavahi*) — is that Charaka, or  
later commentary? If later, downgrade the citation. - **"Yogavahi":** ⚠ Downgrade the citation. Treat it as a later classical/commentarial concept rather than something explicitly stated in **Charaka Samhita Sutrasthana 27**.
- `reviewStatus: 'reviewed'`



### 3. `yoghurt` — Dadhi · `high` · CS Sutrasthana 7

- **Claim:** rasa sour+sweet · virya **heating** · vipaka sour · guna heavy, oily
- **Dosha:** vata −1, pitta +1, kapha +1
- **Combos flagged incompatible (viruddha):** with fruit, with fish, at night
- **Check:** this is the entry most likely to be over-claimed. Are all three
incompatibilities in Sutrasthana 7, or am I mixing in modern popular
Ayurveda? Also confirm *heating* — it's counter-intuitive and worth being sure about. - ⚠ Downgrade to a later Ayurvedic interpretation unless you're citing a later authority rather than Charaka
- `reviewStatus: 'reviewed'`



### 4. `ginger` — Ardraka (fresh) · `high` · CS Sutrasthana 27

- **Claim:** rasa pungent · virya heating · vipaka **sweet** · guna light, oily, sharp
- **Dosha:** vata −1, pitta +1, kapha −1
- **Check:** vipaka **sweet** for fresh ginger (*ardraka*) — is that right, and
does it differ for dried (*shunthi*)? If they differ meaningfully, we should
split them into two entries.
- **Cautions flagged:** acid_reflux, pregnancy.
- This is a good candidate to **split into two entries**. Classical Ayurveda consistently distinguishes **fresh ginger (Ārdraka)** from **dry ginger (Śuṇṭhī)** because drying materially changes its properties and therapeutic actions.
- Recommended database entries
  ### Ārdraka (Fresh Ginger)
  - **Rasa:** Pungent (Katu)
  - **Virya:** Heating (Ushna)
  - **Vipāka:** Sweet (Madhura)
  - **Guṇa:** Light (Laghu), Slightly Unctuous (Snigdha), Sharp (Tikshna)
  - **Dosha:**
    - Vata −1
    - Pitta +1
    - Kapha −1
  ### Śuṇṭhī (Dry Ginger)
  - **Rasa:** Pungent (Katu)
  - **Virya:** Heating (Ushna)
  - **Vipāka:** Sweet (Madhura)
  - **Guṇa:** Light (Laghu), Dry (Rūkṣa), Sharp (Tikshna)
  - **Dosha:**
    - Vata −1
    - Pitta +1
    - Kapha −1 (often more strongly reducing than fresh ginger)
- **Sweet (Madhura) vipāka for fresh ginger:** ✅ Correct.
- **Does dry ginger have a different vipāka?** ❌ No. Both are classically described as having **Madhura Vipāka**.
- **Should they be separate entries?** ✅ Yes—but because of meaningful differences in **guṇa**, heating intensity, and therapeutic application, not because of vipāka.
- **Acid reflux caution:** ⚠ Keep only as a practical, symptom-based caution rather than a classical contraindication.
- **Pregnancy caution:** ⚠ Downgrade. It's not an explicit Charaka caution for fresh ginger, and modern evidence generally supports the safety of culinary amounts and modest medicinal doses for pregnancy-related nausea.
- `reviewStatus: 'reviewed'`



### 5. `mungDal` — Mudga · `high` · CS Sutrasthana 27

- **Claim:** rasa sweet+astringent · virya cooling · vipaka sweet · guna light, dry
- **Dosha:** vata **0**, pitta −1, kapha −1
- **Check:** Charaka rates mudga best among pulses — confirm. Is vata truly neutral, or mildly aggravating given the dryness (+1)? - Truly neutral
- `reviewStatus: 'reviewed'`



### 6. `oats` — *no Sanskrit* · `medium` · derived

- **Claim:** rasa sweet · virya **heating** · vipaka sweet · guna heavy, oily
- **Dosha:** vata −1, pitta 0, kapha +1
- **Check:** not in the classical corpus, so this is property-derivation only.
Is "heating" defensible for cooked oats, or should it be cooling/neutral?
Correctness here is about whether the *derivation* is sound.
- Oats (Avena sativa)
  Evidence:
  Derived Ayurvedic profile (not described in Charaka)
  Rasa:
  Madhura
  Virya:
  Neutral (or Mildly Warming)
  Vipaka:
  Madhura
  Guna:
  Guru (Heavy)
  Soft when cooked
  Moderately nourishing
  Dosha:
  Vata  -1
  Pitta  0
  Kapha +1
- `reviewStatus: 'reviewed'`



### 7. `ryeBread` — `medium` · derived

- **Claim:** rasa sweet+astringent · virya cooling · vipaka sweet · guna heavy, dry
- **Dosha:** vata **+1**, pitta 0, kapha +1
- **Check:** dry+heavy → vata-aggravating is the standard inference. Does sourdough fermentation change it (sour rasa, more heating)? - Yes—but probably not enough to warrant a completely different entry.
- Rasa:
  Sweet + Astringent
  Virya:
  Cooling
  Vipaka:
  Sweet
  Guna:
  Heavy
  Dry
  Dosha
  Vata +1
  Pitta 0
  Kapha +1
- Sourdough fermentation introduces a mild sour taste and generally improves digestibility, which may slightly reduce its Vata-aggravating tendency. However, there is insufficient basis to reclassify its virya from cooling to heating solely because it is sourdough.
- `reviewStatus: 'reviewed'`



### 8. `coffee` — `medium` · derived

- **Claim:** rasa bitter+astringent · virya heating · vipaka pungent · guna light, dry, sharp
- **Dosha:** vata +1, pitta +1, kapha −1
- **Check:** widely agreed in modern Ayurveda; confirm you're happy publishing
it as *derived* rather than cited.
- **Cautions flagged:** pregnancy, anxiety, acid_reflux, insomnia.
- `reviewStatus: 'reviewed'`

---



## After reviewing

Editing `reviewStatus` is all that's needed — no code changes. To sanity-check
that the gate opened:

```bash
npx vitest run src/lib/dietSafety.test.js
```

⚠️ The test **"every seeded entry is still draft"** will now **fail** — that is
expected and is the signal the gate opened. Tell me when you've reviewed and
I'll update that test to assert the reviewed set matches what you actually
approved, so it keeps guarding future entries.

## ✅ Outcome — reviewed and applied 2026-07-21

All 8 accepted; 4 corrected first, and `ginger` split, so the dataset is now
**9 reviewed entries, 0 draft**.

| Entry | Verdict |
|---|---|
| `basmatiRice` | accepted as drafted |
| `ghee` | *yogavahi* claim **removed** from `whyFavor`; `source.note` scopes what Sut. 27 actually supports. Confidence stays `high`. |
| `yoghurt` | combos reworded to "widely taught" rather than attributed to Charaka; `source.note` added; **confidence `high` → `medium`** |
| `gingerFresh` / `gingerDry` | **split into two entries** (Ārdraka / Śuṇṭhī) — differ in guṇa, not vipāka (both `sweet`). **Pregnancy caution removed**; acid-reflux kept but demoted to a practical caution via the new `cautionNote`. |
| `mungDal` | accepted; vata confirmed truly neutral |
| `oats` | **virya `heating` → `neutral`**; guṇa → heavy / soft_when_cooked / nourishing |
| `ryeBread` | accepted; sourdough finding recorded in `preparation` — improves digestibility, **not** grounds to reclassify virya as heating |
| `coffee` | accepted as derived |

### What the review changed about the *method*

Three things the schema couldn't express, now fixed — these matter more than
the 8 rows, because they'd have been baked into the next ~50:

1. **`virya` was a forced binary.** Property-derived foods genuinely sit
   between the poles; `'neutral'` is now valid. Forcing oats to "heating"
   overstated what we know.
2. **A bare caution flag can't say what kind of caution it is.** New
   `cautionNote` distinguishes a classical contraindication from a practical,
   symptom-based one. Flagging ginger for pregnancy as though Charaka forbade
   it was exactly this error.
3. **Provenance was per-entry, not per-claim.** One over-reaching sentence
   dragged a whole otherwise-sound entry's citation down. Handled for now via
   `source.note` + a confidence downgrade.

**Standing correction for batch 2:** the recurring bias was **over-attribution**
— reaching for a Charaka citation where the claim is later commentary or modern
consensus. Default to `'modern'` / `medium` and earn `high`, rather than the
reverse. No dosha sign was flipped, so the derivation itself is sound.

The test `every seeded entry is still draft` has been replaced by
`only entries a human signed off are marked reviewed`, which pins the approved
id set above. 84/84 tests pass.

## What I need back

Even a one-line verdict per entry is enough. Most useful to me:

- Any entry where **the citation doesn't hold** — tells me I'm over-attributing.
- Any **dosha sign** you'd flip — tells me my derivation is off.
- Whether the `high` **vs** `medium` split matches your judgement.

Those three shape how I draft the remaining ~50.