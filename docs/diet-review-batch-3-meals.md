# Diet review batch 3 — meal templates (14)

> **This review is a different kind of check, and should be much faster.**
> Batches 1 and 2 asked "is this claim true to Charaka?" This one asks
> **"is this a real dish, and are these the right ingredients for it?"** —
> a culinary question, not a classical one.
>
> All 14 are `draft`, so `/meals` currently shows nothing.
> File: `src/data/ayurveda/meals.js`.

## Why there's so little to check

A template **asserts no Ayurvedic facts**. There is no `doshaEffect`, no
`whyFavor` prose, no `confidence` and no citation on any of these rows — a test
enforces that. Everything the app says about a dish is **derived at runtime**
from its ingredients, which you have already reviewed:

> *Mung dal kitchari* → **Settles Vata** — mung dal, rice, ghee

That sentence is assembled from three reviewed rows. If a template could carry
its own dosha rating, that rating could drift from the ingredient data
underneath it and nothing would catch it. So the only things you're checking
here are the ones a template is actually allowed to claim:

1. **Is this a real dish** people actually eat?
2. **Are the `coreIds` right** — is anything missing that would make it a
   different meal, or present that doesn't belong?
3. **Is `core` vs `optional` correct?** This one has teeth: if a **core**
   ingredient is filtered out by an allergy, the whole idea is dropped. If an
   **optional** one is, the dish survives without it. Putting ghee in `core`
   when it's really optional silently removes a dish from every dairy-allergic
   user.
4. **Is the slot right** (morning / midday / evening)?
5. **Is the `prep` line true?** One line, a hint not a method — we deliberately
   ship no quantities or steps.

Anything you'd reject, just say why — as before, the *why* improves the next set.

---

## The templates

### Morning

**1. `spicedOatPorridge` — Warm spiced oat porridge with ghee**
core: oats, ghee · optional: dry ginger, jaggery, almond · autumn/winter
prep: *"Cooked soft with plenty of liquid rather than eaten as raw muesli."*
→ **My doubt:** is **ghee core or optional?** I made it core because the dish is
named for it, but that means anyone with a dairy allergy loses the porridge
entirely rather than getting it without ghee. I think that's wrong and it
should be optional. Your call.

**2. `stewedAppleBreakfast` — Stewed apple with cardamom**
core: appleStewed · optional: ghee, jaggery
→ **My doubt:** the name says cardamom but there is **no cardamom in the
dataset** — it wasn't in batch 2. So the name promises an ingredient the app
can't show or filter. Rename, or add cardamom in a later batch?

**3. `ricePorridge` — Soft rice porridge with ghee**
core: basmati rice, ghee · optional: fresh ginger, cumin · morning + evening
→ Same core-ghee question as #1.

**4. `honeyWarmWater` — Honey with lukewarm water**
core: honey · spring
prep: *"Lukewarm, never hot — heating honey is classically held to spoil it."*
→ **My doubt:** is this a *meal*? It's really a practice. It may belong in
dinacharya rather than here. Also worth checking that prep line lands, since
it's the dataset's one outright prohibition.

### Midday

**5. `kitchari` — Mung dal kitchari**
core: mung dal, basmati rice, ghee · optional: fresh ginger, cumin, turmeric,
asafoetida, coriander seed
→ The reference dish. Core-ghee question applies again, though here it's more
defensible.

**6. `riceDalGhee` — Rice and dal with ghee**
core: basmati rice, mung dal, ghee · optional: cumin, turmeric, asafoetida
→ **My doubt: is this just kitchari again?** Same three core ingredients. If
they're not meaningfully different dishes, one should go — two near-identical
suggestions makes the list look padded.

**7. `chickpeaCurry` — Spiced chickpeas with rice**
core: chickpea, basmati rice · optional: asafoetida, cumin, fresh ginger,
turmeric, cooked onion
prep: *"Soaked well and cooked thoroughly with digestive spices."*
→ **My doubt:** your batch-2 note was that chickpea needs *unctuousness plus
digestive spices* to be tolerable. Those are all `optional` here, so the app can
suggest chickpeas to a Vata-aggravated user with none of them. Should some be
core?

**8. `chapatiSabzi` — Chapati with cooked greens**
core: wheat, spinach · optional: ghee, cumin, garlic, cooked onion
→ Note "sabzi" generally means any cooked vegetable; I've tied it to spinach
because that's what the dataset has.

**9. `barleySoup` — Barley and vegetable soup**
core: barley · optional: black pepper, dry ginger, spinach, cooked onion,
turmeric · spring
→ **My doubt:** core is barley alone, so "vegetable soup" is a name whose
vegetables are all optional. Honest, or misleading?

**10. `buttermilkRice` — Rice with buttermilk**
core: basmati rice, buttermilk · optional: cumin, coriander seed · summer
prep: *"Buttermilk thinned with water, not thick yoghurt."*
→ Meant as curd rice / dahi bhaat. Is the takra-not-yoghurt distinction worth
making here, given your batch-2 note that classical takra is a whole class?

**11. `potatoWithGhee` — Mashed potato with ghee and cumin**
core: potato, ghee · optional: cumin, black pepper, asafoetida
→ Built directly on your batch-2 preparation note (mashed with fat is the
least Vata-provoking form). Does it read as a real meal or a side?

### Evening

**12. `uradDalStew` — Slow-cooked urad dal**
core: urad dal · optional: ghee, asafoetida, fresh ginger, garlic ·
autumn/winter
prep: *"Long-cooked with digestive spices — it is heavy without them."*
→ **My doubt:** same shape as #7. The prep line says it needs spices, but every
spice is optional, so the app can suggest bare urad dal.

**13. `spicedMilk` — Warm spiced milk**
core: milk · optional: dry ginger, turmeric, jaggery
prep: *"Warmed and spiced rather than drunk cold. Not taken with a salty or
sour meal."*
→ The second clause encodes milk's viruddha combinations. Right place for it?

**14. `vegetableSoupSesame` — Warm vegetable soup with sesame oil**
core: sesame oil, spinach · optional: fresh ginger, cumin, black pepper,
cooked onion · autumn/winter
→ **My doubt:** sesame oil as a *core* ingredient makes the dish sound like it's
mostly oil. Probably should be optional with a vegetable as core.

---

## The pattern in my own doubts

Six of the fourteen are the same question: **I've been putting things in `core`
because they're in the dish's name, when `core` actually means "remove this and
the whole suggestion disappears for anyone who can't eat it."** That's a
filtering decision dressed up as a naming decision.

If you agree, the rule is probably: **`core` = the ingredients that carry the
meal's bulk and identity; fats and spices go in `optional` unless the dish is
literally nothing without them.** Tell me and I'll re-sort all fourteen against
that rule rather than case by case.

## Coverage note

14 templates across 3 slots is thin — a Kapha user in summer will see the same
few ideas repeatedly. That's deliberate for a first pass, and worth expanding
once the *shape* is right. No point generating 40 with a core/optional rule
that turns out to be wrong.
