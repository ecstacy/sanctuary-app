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
2. **doshaEffect** — ⚠️ **sign convention: `-1` = pacifies, `+1` = aggravates.**
   (Opposite to asanas. See `lib/doshaSemantics.js`.)
3. **The citation** — does the cited chapter actually support this, or is it
   decoration? If it doesn't, that's the most important kind of correction:
   downgrade `source.text` to `'modern'` and `confidence` to `'medium'`.
4. **`confidence`** — `high` only for genuine classical consensus. If it's your
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

### 2. `ghee` — Ghrita · `high` · CS Sutrasthana 27
- **Claim:** rasa sweet · virya **cooling** · vipaka sweet · guna oily, soft, heavy
- **Dosha:** vata −1, pitta −1, kapha **+1** (aggravates)
- **Check:** the "foremost of the fats" framing and the claim that ghee carries
  the qualities of what it's cooked with (*yogavahi*) — is that Charaka, or
  later commentary? If later, downgrade the citation.

### 3. `yoghurt` — Dadhi · `high` · CS Sutrasthana 7
- **Claim:** rasa sour+sweet · virya **heating** · vipaka sour · guna heavy, oily
- **Dosha:** vata −1, pitta +1, kapha +1
- **Combos flagged incompatible (viruddha):** with fruit, with fish, at night
- **Check:** this is the entry most likely to be over-claimed. Are all three
  incompatibilities in Sutrasthana 7, or am I mixing in modern popular
  Ayurveda? Also confirm *heating* — it's counter-intuitive and worth being
  sure about.

### 4. `ginger` — Ardraka (fresh) · `high` · CS Sutrasthana 27
- **Claim:** rasa pungent · virya heating · vipaka **sweet** · guna light, oily, sharp
- **Dosha:** vata −1, pitta +1, kapha −1
- **Check:** vipaka **sweet** for fresh ginger (*ardraka*) — is that right, and
  does it differ for dried (*shunthi*)? If they differ meaningfully, we should
  split them into two entries.
- **Cautions flagged:** acid_reflux, pregnancy.

### 5. `mungDal` — Mudga · `high` · CS Sutrasthana 27
- **Claim:** rasa sweet+astringent · virya cooling · vipaka sweet · guna light, dry
- **Dosha:** vata **0**, pitta −1, kapha −1
- **Check:** Charaka rates mudga best among pulses — confirm. Is vata truly
  neutral, or mildly aggravating given the dryness (+1)?

### 6. `oats` — *no Sanskrit* · `medium` · derived
- **Claim:** rasa sweet · virya **heating** · vipaka sweet · guna heavy, oily
- **Dosha:** vata −1, pitta 0, kapha +1
- **Check:** not in the classical corpus, so this is property-derivation only.
  Is "heating" defensible for cooked oats, or should it be cooling/neutral?
  Correctness here is about whether the *derivation* is sound.

### 7. `ryeBread` — `medium` · derived
- **Claim:** rasa sweet+astringent · virya cooling · vipaka sweet · guna heavy, dry
- **Dosha:** vata **+1**, pitta 0, kapha +1
- **Check:** dry+heavy → vata-aggravating is the standard inference. Does
  sourdough fermentation change it (sour rasa, more heating)?

### 8. `coffee` — `medium` · derived
- **Claim:** rasa bitter+astringent · virya heating · vipaka pungent · guna light, dry, sharp
- **Dosha:** vata +1, pitta +1, kapha −1
- **Check:** widely agreed in modern Ayurveda; confirm you're happy publishing
  it as *derived* rather than cited.
- **Cautions flagged:** pregnancy, anxiety, acid_reflux, insomnia.

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

## What I need back

Even a one-line verdict per entry is enough. Most useful to me:

- Any entry where **the citation doesn't hold** — tells me I'm over-attributing.
- Any **dosha sign** you'd flip — tells me my derivation is off.
- Whether the **`high` vs `medium`** split matches your judgement.

Those three shape how I draft the remaining ~50.
