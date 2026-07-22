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
2. **Are the** `coreIds` **right** — is anything missing that would make it a
  different meal, or present that doesn't belong?
3. **Is** `core` **vs** `optional` **correct?** Already re-sorted against the rule we
  agreed (see the bottom of this doc) — this is a spot-check, not a full pass.
   It has teeth: a filtered **core** ingredient drops the whole idea, a
   filtered **optional** one just goes missing from it.
4. **Is the slot right** (morning / midday / evening)?
5. **Is the** `prep` **line true?** One line, a hint not a method — we deliberately
  ship no quantities or steps.

Anything you'd reject, just say why — as before, the *why* improves the next set.

---



## The templates



### Morning

**1.** `spicedOatPorridge` **— Warm spiced oat porridge**
core: **oats** · optional: ghee, dry ginger, jaggery, almond · autumn/winter
prep: *"Cooked soft with plenty of liquid rather than eaten as raw muesli."*
→ ✅ **Re-sorted.** Ghee moved to optional and dropped from the name, so a
dairy-allergic user now gets the porridge without it.

**2.** `stewedAppleBreakfast` **— Stewed apple with cardamom**
core: appleStewed · optional: ghee, jaggery
→ **My doubt:** the name says cardamom but there is **no cardamom in the dataset** — it wasn't in batch 2. So the name promises an ingredient the app can't show or filter. Rename, or add cardamom in a later batch? 

-  add cardamom in a later batch

**3.** `ricePorridge` **— Soft rice porridge**
core: **basmati rice** · optional: ghee, fresh ginger, cumin · morning + evening
→ ✅ **Re-sorted.** Ghee optional, dropped from the name.

**4.** `honeyWarmWater` **— Honey with lukewarm water**
core: honey · spring
prep: *"Lukewarm, never hot — heating honey is classically held to spoil it."*
→ **My doubt:** is this a *meal*? It's really a practice. It may belong in dinacharya rather than here. Also worth checking that prep line lands, since it's the dataset's one outright prohibition. 

-  This is not a meal, rather dinacharya

### Midday

**5.** `kitchari` **— Mung dal kitchari**
core: **mung dal, basmati rice** · optional: ghee, fresh ginger, cumin,
turmeric, asafoetida, coriander seed
→ ✅ **Re-sorted** to core rice + dal. This is the case that shows what the rule
buys: a dairy-allergic user now gets kitchari without the ghee instead of
losing the dish. There's a test for exactly this.

**6.** `riceDalGhee` **— Rice and dal**
core: **basmati rice, mung dal** · optional: ghee, cumin, turmeric, asafoetida
→ 🔴 **The rule made this worse, and it now needs a decision.** After
re-sorting, this is *identical* to `kitchari` — same core, same slot, a subset of the same optional list. The composer would offer two suggestions differing only in name. I've left it as a draft rather than deleting it, because dropping a template is your call, but I'd remove it. -

- remove it

**7.** `chickpeaCurry` **— Spiced chickpeas with rice**
core: chickpea, basmati rice · optional: asafoetida, cumin, fresh ginger,
turmeric, cooked onion
prep: *"Soaked well and cooked thoroughly with digestive spices."*
→ **My doubt:** your batch-2 note was that chickpea needs *unctuousness plus
digestive spices* to be tolerable. Those are all `optional` here, so the app can suggest chickpeas to a Vata-aggravated user with none of them. Should some be core? 

-  chickpeas are Core. 

**8.** `chapatiSabzi` **— Chapati with cooked greens** core: wheat, spinach · optional: ghee, cumin, garlic, cooked onion → Note "sabzi" generally means any cooked vegetable; I've tied it to spinach because that's what the dataset has. -    

- Keep it generic, Only having Spinach is very limtting. Add more vegetables in the next batch. 

**9.** `barleySoup` **— Barley soup**
core: **barley** · optional: black pepper, dry ginger, spinach, cooked onion,
turmeric · spring
→ ✅ **Renamed to "Barley soup."** The vegetables are all optional, so the old
name promised something a filter could remove.

**10.** `buttermilkRice` **— Rice with buttermilk**
core: basmati rice, buttermilk · optional: cumin, coriander seed · summer
prep: *"Buttermilk thinned with water, not thick yoghurt."*
→ Meant as curd rice / dahi bhaat. Is the takra-not-yoghurt distinction worth
making here, given your batch-2 note that classical takra is a whole class?

- I would **keep the Takra–yogurt distinction**, because it reflects a genuine Ayurvedic difference. However, I'd phrase it as a reference to the **Takra ingredient/preparation** rather than as "not thick yoghurt," since Takra itself is a spectrum of preparations.
  So I'd revise the prep line to something like:
  > **Use diluted Takra (prepared by churning cultured yogurt with water) rather than plain thick yogurt.**
  That preserves the Ayurvedic distinction without implying that there is only one valid form of Takra.



**11.** `potatoWithGhee` **— Mashed potato**
core: **potato** · optional: ghee, cumin, black pepper, asafoetida
prep: *"Mashed with ghee or butter rather than baked dry — the fat is what
offsets the dryness."*
→ ✅ **Re-sorted and renamed to "Mashed potato."** Worth noting what the rule
buys here: with ghee optional, the derived verdict for the core alone is
**"increases Vata"** — which is *true* of dry mashed potato. The old core-ghee
version derived a gentler verdict that only held if you actually added the fat.
→ Still open: does this read as a meal or a side?

- To me more as a side carb

### Evening

**12.** `uradDalStew` **— Slow-cooked urad dal**
core: urad dal · optional: ghee, asafoetida, fresh ginger, garlic ·
autumn/winter
prep: *"Long-cooked with digestive spices — it is heavy without them."*
→ **My doubt:** same shape as #7. The prep line says it needs spices, but every
spice is optional, so the app can suggest bare urad dal.

- This doesn't make sense unless someone explicitly mentions to avoid some spices, bare urad dal would be a wrong recommendation in my opinion, unless the user has explicitly indicated that they don't want those spices.

**13.** `spicedMilk` **— Warm spiced milk**
core: milk · optional: dry ginger, turmeric, jaggery
prep: *"Warmed and spiced rather than drunk cold. Not taken with a salty or sour meal."* → The second clause encodes milk's viruddha combinations. Right place for it?

- Yes, feels natural

**14.** `vegetableSoupSesame` **— Warm greens soup**
core: **spinach** · optional: sesame oil, fresh ginger, cumin, black pepper,
cooked onion · autumn/winter
→ ✅ **Re-sorted** to core spinach, sesame oil optional; renamed to "Warm greens
soup".

- This is wrong, a vegetable soup doesn't mean a spinach soup. Rather a mixed vegetable soup is more popular than a spinach soup. Just falling back to a random green vegetable like Spinach doesn't make sense in most cases. 

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

## ✅ All five resolved 2026-07-21


| Item                    | Decision                              | What changed                                                                                                                                                                                                                                                                               |
| ----------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `riceDalGhee` duplicate | **Delete**                            | Removed. 14 → 13 templates.                                                                                                                                                                                                                                                                |
| Cardamom                | **Add it**                            | `cardamom` (Ela) added to the ingredient dataset as `draft` — it's new content, so it goes through the same gate as everything else. `stewedAppleBreakfast` renamed to **"Stewed apple"** and lists cardamom as optional; it stays invisible until reviewed, so the name can't promise it. |
| `honeyWarmWater`        | **A practice, not a meal**            | New `kind` field. It's `'practice'` and is **excluded from** `/meals` **entirely** — not ranked low, since low-ranked still means "we're offering you this to eat". Wiring it into the dinacharya surface is a chunk-5 job.                                                                |
| `potatoWithGhee`        | **A preparation, not a meal**         | `kind: 'preparation'`. Still shown (you do eat it) but labelled **"Component"** and ranked below full meals.                                                                                                                                                                               |
| Chickpea / urad spices  | **New field, don't touch the engine** | New `balancedBy` on the ingredient.                                                                                                                                                                                                                                                        |




### The `balancedBy` field

Your call here was the right one and better than either option I was weighing.
Making the spices `core` would have deleted the dish for anyone who can't eat
one of them; special-casing "heavy legumes need spices" in the composer would
have put a food fact inside the rules engine, where nobody would look for it.

`balancedBy` keeps the principle **in the data**:

```js
chickpea: { …, balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'] }
uradDal:  { …, balancedBy: ['asafoetida', 'gingerFresh', 'cumin', 'blackPepper'] }
```

It is **purely informational** — it never filters, never scores, never blocks.
It renders as *"Traditionally balanced with asafoetida, cumin, ginger"* on both
the ingredient page and the meal card, and every spice stays optional. It also
respects the safety filter: a dairy-allergic user sees the chickpea advice
**without ghee**, verified.

⚠️ **These are new claims on two rows you already approved**, so `balancedBy` on
`chickpea` and `uradDal` needs your sign-off with the rest of this batch. Other
foods could carry it later; I've only added it where you raised the issue.

### Verified

```
templates=13  riceDalGheeGone=true  cardamom=draft
IDEA Spiced chickpeas with rice   balancedBy=Asafoetida/Cumin/Ginger (fresh)/Ghee
IDEA Slow-cooked urad dal         balancedBy=Asafoetida/Ginger (fresh)/Cumin/Black pepper
IDEA Mashed potato [COMPONENT]
honeyShown=false  notAMeal=1
appleName="Stewed apple"  appleOptional=Ghee/Jaggery
chickpeaBalancedBy_dairyAllergy=Asafoetida/Cumin/Ginger (fresh)   <- ghee correctly dropped
```



## ✅ Batch-3 review applied 2026-07-22

| # | Your call | What changed |
|---|---|---|
| 2 | Cardamom in a **later batch** | `cardamom` stays in the dataset as **`draft`** — queued, invisible, and it'll ride along with the next ingredient batch. `stewedAppleBreakfast` is already renamed "Stewed apple", so nothing promises it meanwhile. |
| 4 | `honeyWarmWater` is **dinacharya** | Already `kind: 'practice'`, excluded from `/meals`, and now surfaced on the Dinacharya page (chunk 5). |
| 6 | `riceDalGhee` — **remove** | Done. |
| 7 | **Chickpeas are core** | No change — chickpea + rice stay core, spices stay optional, and `balancedBy` carries the digestibility principle. |
| 8 | **Keep it generic** | `chapatiSabzi` → **"Chapati with cooked vegetables"**, core is **wheat alone**, spinach demoted to optional. You were right that spinach-in-core quietly turned *sabzi* into *spinach*. |
| 10 | Keep the takra distinction, phrased as the **preparation** | prep now reads: *"Use diluted takra — cultured yoghurt churned with water — rather than plain thick yoghurt. Takra is itself a spectrum of preparations, so this points at the method, not at one exact product."* |
| 11 | **A side carb** | `kind: 'preparation'` kept; the user-facing label changed from the vague "Component" to **"Side"**. |
| 12 | Bare urad dal would be a wrong recommendation | **My doubt was overblown — the app already does what you want.** Optional ingredients are shown by DEFAULT and only disappear when the user's own filter removes them. The card reads *"Urad dal + Ghee, Asafoetida, Ginger, Garlic"*. "Optional" describes what a restriction may remove, not what we hide. |
| 13 | Viruddha clause reads naturally | No change. |
| 14 | `vegetableSoupSesame` is **wrong** | **Removed.** You're right that a mixed-vegetable soup is not a spinach soup, and spinach is the only green we have — so there is no honest version of this dish yet. Re-add once the vegetable set exists. |

**12 templates now** (14 → 13 → 12).

### One thing your #12 note exposed

Urad dal listed asafoetida and ginger as optional ingredients *and* again under
"traditionally balanced with" — two separate-looking recommendations for the
same spice. The meal card now **omits anything the dish already lists**, so
urad dal shows *"+ Ghee, Asafoetida, Ginger, Garlic"* and *"traditionally
balanced with Cumin, Black pepper"* — the companions it doesn't already have.

### ⚠️ Nothing was marked reviewed

You gave corrections but no approvals, so all 12 templates are still `draft`
and **`/meals` and the Home widget both show nothing** in the build now on your
phone. That's the gate working as designed, not a bug. Say the word and I'll
flip the ones you're happy with.

## What's left to review

**13 meal templates** (as listed above, already re-sorted), plus two things that
rode in on this batch:

1. `cardamom` — a new ingredient, so a batch-1/2-style classical check.
  ⚠️ I've drafted it **tridoshic (−1/−1/−1)**, which is exactly the claim you
   rejected for coriander in batch 2. It deserves the same scrutiny. Its
   cooling virya is also unusual for an aromatic pungent spice — that's the
   classical description rather than what derivation would suggest.
2. `balancedBy` **on** `chickpea` **and** `uradDal` — new claims on approved rows.

