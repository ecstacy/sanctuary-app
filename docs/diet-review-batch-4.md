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
   insecure identifications, so **15 of 19 are `medium`**.

**Raw vs cooked** comes up more here than in any previous batch. Where cooking
softens an effect, the entry carries a `preparation` note. Where it **flips a
sign**, the entry is split — the `apple`/`appleStewed` precedent, because the
dosha chips can't display a sign that contradicts the note beneath them.

---

## 🚩 The four I'd check first

**`banana` — Kadali · `medium` · CS Sut. 27**
sweet · cooling · **sour vipāka** · heavy/moist/soft · V−1 P0 K+1
→ Classical sources give banana a **sour** vipāka despite its sweet taste.
That's counter-intuitive and the opposite of what derivation alone suggests —
the same shape as the barley vipāka question in batch 2. Right?
→ Also: I've listed **banana + milk** as incompatible. Widely taught, but is it
*Charaka* or later tradition? Same question that caught ghee's *yogavāhī*.

**`mangoRipe` — Amra · `medium` · CS Sut. 27**
sweet · **heating** · sweet vipāka · heavy/oily · V−1 **P0** K+1
→ The two things I've written don't sit easily together: ripe mango is commonly
described as *heating*, yet also as settling rather than aggravating Pitta. I
drafted heating with Pitta neutral, which is a compromise that may be wrong in
both directions. Your call on which one gives.

**`radish` — Mulaka · `medium` · CS Sut. 27**
pungent · heating · pungent vipāka · light/dry/sharp · V0 P+1 K−1
→ The tradition distinguishes **tender** radish from **large mature** ones
fairly sharply, the mature being much harsher. This entry describes the tender
form and says so. Split, like ginger and onion, or is the note enough?

**`tomatoRaw` — `medium` · derived**
sour+sweet · heating · sour vipāka · V+1 **P+1 K+1**
→ I've rated raw tomato as aggravating **all three doshas**, which is the
mirror image of the tridoshic claim you rejected for coriander in batch 2. It
should get the same scrutiny in the other direction. Split from `tomatoCooked`
because cooking moves Vāta and Kapha to neutral — a sign change.

---

## Vegetables

**`carrot`** — sweet+astringent · heating · pungent vipāka · light/dry · V**0** P+1 K−1 · `root`
→ Vāta 0 rather than −1, per the dry-food rule. Ratings describe it *cooked*.

**`beetroot`** — sweet · heating · sweet vipāka · heavy/oily · V−1 P+1 K**0** · `root`
→ Kapha 0 for a heavy sweet vegetable is the soft spot; I reasoned its warmth
offsets the heaviness. That's the same "too clever" move that got sesame oil
corrected in batch 2, so I'd rather you looked at it.

**`pumpkin` — Kushmanda** · sweet · cooling · sweet vipāka · heavy/soft/moist · V−1 P−1 K+1
→ `CS` cited but `medium`: Kushmanda is classical, but its identification with
modern squashes is approximate. Fair, or should it drop to `modern`?

**`bottleGourd` — Alabu** · sweet · cooling · sweet vipāka · light/moist · V0 P−1 K0
→ Deliberately mild across the board. The classical convalescent vegetable.

**`okra`** — sweet+astringent · cooling · sweet vipāka · light/**slimy** · V−1 P−1 K+1
→ New guṇa value `slimy`, for the mucilaginous quality that is the whole point
of the food. Reasonable addition, or force it into existing vocabulary?

**`cabbage`** — astringent+sweet · cooling · pungent vipāka · light/dry/rough · V+1 P−1 K−1
**`cauliflower`** — same profile, plus `balancedBy: [asafoetida, cumin, ginger, ghee]`
→ Both rated on the brassica pattern. **Should cabbage carry `balancedBy` too?**
I added it only to cauliflower and can't now justify the asymmetry.

**`greenBeans`** — sweet+astringent · cooling · light · V0 P−1 K0
→ Near-neutral on purpose: a mild food, and claiming more would overstate it.

**`peas`** — sweet+astringent · cooling · pungent vipāka · light/dry · V+1 P−1 K−1
→ Sits between vegetable and pulse; I followed the pulse pattern for dryness.

**`tomatoCooked`** — sour+sweet · heating · sour vipāka · V0 P+1 K0
→ See `tomatoRaw` above.

**`aubergine` — Vartaka** · pungent+astringent · heating · pungent vipāka · V0 P+1 K−1
→ `modern`, not `CS`: Vartaka appears more in later literature than in Charaka
and the identification isn't certain. Agree with that caution?

**`cucumber` — Trapusha** · sweet+astringent · cooling · sweet vipāka · heavy/moist · V+1 P−1 K+1

**`radish` — Mulaka** — see 🚩 above.

## Fruit

**`banana` — Kadali** — see 🚩 above.

**`pomegranate` — Dadima** · sweet+astringent+sour · cooling · sweet vipāka · light · V0 P−1 K−1 · **`high`**
→ One of only four `high` entries here. Classically praised and strongly
attested. Note the entry describes the **sweet** variety; sour pomegranate is
treated differently and isn't covered.

**`grapes` — Draksha** · sweet · cooling · sweet vipāka · heavy/moist · V−1 P−1 K+1 · **`high`**

**`mangoRipe` — Amra** — see 🚩 above.

**`lemon` — Nimbuka** · sour · heating · sour vipāka · light/sharp · V−1 P+1 K−1
→ `modern`: citrus sits in later literature more than in Charaka. Vāta −1 for a
*sour* food is consistent with the rule (sour and salty settle Vāta; it's dry
and pungent that don't) — but flagging it since it's the one place I've given a
sharp food a −1.

---

## What I need back

1. **The four 🚩 entries.**
2. **`cauliflower` has `balancedBy` and `cabbage` doesn't** — should both?
3. **Splits:** is `tomatoRaw`/`tomatoCooked` right, and does `radish` need one?
4. **Is `high` right for `pomegranate` and `grapes`?** They're the only two
   fruits I've claimed as classically settled.

## Also still open from batch 3

**`cardamom`** — you asked for it in a later batch, so it rides with this one.
⚠️ Drafted **tridoshic (−1/−1/−1)**, which is exactly the claim you rejected
for coriander. Its **cooling** virya is also unusual for an aromatic pungent
spice — that's the classical description rather than what derivation suggests.

## After this batch

19 vegetables and fruit unblock the meal templates that were removed or
watered down: a real **mixed vegetable soup**, a `chapatiSabzi` with actual
alternatives, and enough seasonal range that a Kapha user in summer and a Vāta
user in winter stop seeing the same three dishes. That's batch 5 — new meal
templates — and it should wait until these are signed off, since a template
built on a draft ingredient is invisible anyway.
