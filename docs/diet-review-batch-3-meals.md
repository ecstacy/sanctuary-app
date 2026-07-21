# Diet review batch 3 — meal templates (14)

> **This review is a different kind of check, and should be much faster.**
> Batches 1 and 2 asked "is this claim true to Charaka?" This one asks
> **"is this a real dish, and are these the right ingredients for it?"** —
> a culinary question, not a classical one.
>
> All 14 are `draft`, so `/meals` currently shows nothing.
> **Already re-sorted** against the core/optional rule you approved — the
> entries below show their current state, not the first draft.
> File: `src/data/ayurveda/meals.js`.

## Why there's so little to check

A template **asserts no Ayurvedic facts**. There is no `doshaEffect`, no
`whyFavor` prose, no `confidence` and no citation on any of these rows — a test
enforces that. Everything the app says about a dish is **derived at runtime**
from its ingredients, which you have already reviewed:

> *Mung dal kitchari* → **Settles Vata** — mung dal, rice

That sentence is assembled from three reviewed rows. If a template could carry
its own dosha rating, that rating could drift from the ingredient data
underneath it and nothing would catch it. So the only things you're checking
here are the ones a template is actually allowed to claim:

1. **Is this a real dish** people actually eat?
2. **Are the `coreIds` right** — is anything missing that would make it a
   different meal, or present that doesn't belong?
3. **Is `core` vs `optional` correct?** Already re-sorted against the rule we
   agreed (see the bottom of this doc) — this is a spot-check, not a full pass.
   It has teeth: a filtered **core** ingredient drops the whole idea, a
   filtered **optional** one just goes missing from it.
4. **Is the slot right** (morning / midday / evening)?
5. **Is the `prep` line true?** One line, a hint not a method — we deliberately
   ship no quantities or steps.

Anything you'd reject, just say why — as before, the *why* improves the next set.

---

## The templates

### Morning

**1. `spicedOatPorridge` — Warm spiced oat porridge**
core: **oats** · optional: ghee, dry ginger, jaggery, almond · autumn/winter
prep: *"Cooked soft with plenty of liquid rather than eaten as raw muesli."*
→ ✅ **Re-sorted.** Ghee moved to optional and dropped from the name, so a
dairy-allergic user now gets the porridge without it.

**2. `stewedAppleBreakfast` — Stewed apple with cardamom**
core: appleStewed · optional: ghee, jaggery
→ **My doubt:** the name says cardamom but there is **no cardamom in the
dataset** — it wasn't in batch 2. So the name promises an ingredient the app
can't show or filter. Rename, or add cardamom in a later batch?

**3. `ricePorridge` — Soft rice porridge**
core: **basmati rice** · optional: ghee, fresh ginger, cumin · morning + evening
→ ✅ **Re-sorted.** Ghee optional, dropped from the name.

**4. `honeyWarmWater` — Honey with lukewarm water**
core: honey · spring
prep: *"Lukewarm, never hot — heating honey is classically held to spoil it."*
→ **My doubt:** is this a *meal*? It's really a practice. It may belong in
dinacharya rather than here. Also worth checking that prep line lands, since
it's the dataset's one outright prohibition.

### Midday

**5. `kitchari` — Mung dal kitchari**
core: **mung dal, basmati rice** · optional: ghee, fresh ginger, cumin,
turmeric, asafoetida, coriander seed
→ ✅ **Re-sorted** to core rice + dal. This is the case that shows what the rule
buys: a dairy-allergic user now gets kitchari without the ghee instead of
losing the dish. There's a test for exactly this.

**6. `riceDalGhee` — Rice and dal**
core: **basmati rice, mung dal** · optional: ghee, cumin, turmeric, asafoetida
→ 🔴 **The rule made this worse, and it now needs a decision.** After
re-sorting, this is *identical* to `kitchari` — same core, same slot, a subset
of the same optional list. The composer would offer two suggestions differing
only in name. I've left it as a draft rather than deleting it, because dropping
a template is your call, but I'd remove it.

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

**9. `barleySoup` — Barley soup**
core: **barley** · optional: black pepper, dry ginger, spinach, cooked onion,
turmeric · spring
→ ✅ **Renamed to "Barley soup."** The vegetables are all optional, so the old
name promised something a filter could remove.

**10. `buttermilkRice` — Rice with buttermilk**
core: basmati rice, buttermilk · optional: cumin, coriander seed · summer
prep: *"Buttermilk thinned with water, not thick yoghurt."*
→ Meant as curd rice / dahi bhaat. Is the takra-not-yoghurt distinction worth
making here, given your batch-2 note that classical takra is a whole class?

**11. `potatoWithGhee` — Mashed potato**
core: **potato** · optional: ghee, cumin, black pepper, asafoetida
prep: *"Mashed with ghee or butter rather than baked dry — the fat is what
offsets the dryness."*
→ ✅ **Re-sorted and renamed to "Mashed potato."** Worth noting what the rule
buys here: with ghee optional, the derived verdict for the core alone is
**"increases Vata"** — which is *true* of dry mashed potato. The old core-ghee
version derived a gentler verdict that only held if you actually added the fat.
→ Still open: does this read as a meal or a side?

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

**14. `vegetableSoupSesame` — Warm greens soup**
core: **spinach** · optional: sesame oil, fresh ginger, cumin, black pepper,
cooked onion · autumn/winter
→ ✅ **Re-sorted** to core spinach, sesame oil optional; renamed to "Warm greens
soup".

---

## ✅ The core/optional rule — agreed and applied 2026-07-21

> **core = the ingredients that carry the meal's bulk and identity.
> Fats and spices are optional unless the dish is nothing without them.**

All fourteen were re-sorted against it before you review them, rather than
case by case. It's recorded at the top of `meals.js` and enforced by tests.

**The corollary I hadn't seen when I proposed the rule:** a name mustn't
promise an optional ingredient either. "Warm spiced oat porridge **with ghee**"
shown to a dairy-allergic user, minus the ghee, is a dish whose name references
something we just removed. Five names were shortened, and there's now a test
that fails if a template names a fat it treats as optional.

**What changed:** `spicedOatPorridge`, `ricePorridge`, `kitchari`,
`riceDalGhee`, `potatoWithGhee`, `vegetableSoupSesame` (core), plus renames on
those and `barleySoup`. Untouched: `stewedAppleBreakfast`, `honeyWarmWater`,
`chickpeaCurry`, `chapatiSabzi`, `buttermilkRice`, `uradDalStew`, `spicedMilk`
— their cores were already bulk-and-identity.

## Still needing your call

1. 🔴 **`riceDalGhee` is now identical to `kitchari`.** Delete it?
2. **`stewedAppleBreakfast` names cardamom, which isn't in the dataset.**
   Rename, or add cardamom in a later ingredient batch?
3. **`honeyWarmWater` — is it a meal?** It reads more like a practice; it may
   belong in dinacharya instead.
4. **#7 `chickpeaCurry` and #12 `uradDalStew`:** both have prep lines saying
   they *need* digestive spices, but under the rule every spice is optional, so
   the app can suggest bare chickpeas or bare urad dal. The rule is right and I
   don't want to special-case it — but is the `prep` line enough of a carrier
   for that, or should heavy legumes get something stronger?
5. **`potatoWithGhee`** — meal or side?

## Coverage note

14 templates across 3 slots is thin — a Kapha user in summer will see the same
few ideas repeatedly. Deliberate for a first pass. Worth expanding once the
shape is right; no point generating 40 against a rule that might still move.
