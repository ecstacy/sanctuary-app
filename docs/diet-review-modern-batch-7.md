# Modern-diet review batch 7 (30 entries) — base-ingredient breadth

_All rows are `reviewStatus: 'draft'` — invisible to the app until fact-checked and flipped to `reviewed` (add the id to `REVIEWED_SIGNED_OFF` in `dietSafety.test.js`). Source: property-derived (`modern`, `confidence: medium`). Sign convention: doshaEffect −1 pacifies / +1 aggravates._

**What this batch is:** real single **base** foods a gap-probe surfaced as missing — Indian-kitchen gourds & vegetables, rice varieties, black chickpea & fox nut, a few spices, seeds and fruits, plus modern pantry. **Composite dishes are NOT here** — those are recipes now (`recipes-data.js`, derived). Full derivations live in each entry's `source.note` in `ingredients-modern-draft-7.js`.

**How to review:** tick ✅ or note a correction next to the row (freeform, same as batches 3–6 — I'll apply your edits and flip the flags).

## Indian gourds & vegetables (7)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Snake gourd | `snakeGourd` | sweet, astringent | cooling | V 0 · P −1 · K −1 | — |
| ☐ | Cluster beans | `clusterBeans` | astringent, bitter | cooling | V +1 · P −1 · K −1 | — |
| ☐ | Apple gourd (tinda) | `appleGourd` | sweet | cooling | V 0 · P −1 · K −1 | — |
| ☐ | Banana flower | `bananaFlower` | astringent, bitter | cooling | V 0 · P −1 · K −1 | — |
| ☐ | Water chestnut (singhara) | `waterChestnut` | sweet, astringent | cooling | V 0 · P −1 · K +1 | — |
| ☐ | Raw mango | `rawMango` | sour, astringent | heating | V −1 · P +1 · K 0 | — |
| ☐ | Raw papaya | `rawPapaya` | astringent, pungent | heating | V 0 · P +1 · K −1 | caution:pregnancy (note only) |

## Rice varieties (5)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Red rice (matta) | `redRice` | sweet | neutral | V −1 · P 0 · K +1 | — |
| ☐ | Black rice | `blackRice` | sweet | cooling | V −1 · P −1 · K +1 | — |
| ☐ | Jasmine rice | `jasmineRice` | sweet | cooling | V −1 · P −1 · K +1 | — |
| ☐ | Sushi rice | `sushiRice` | sweet | cooling | V −1 · P −1 · K +1 | — |
| ☐ | Arborio / risotto rice | `arborioRice` | sweet | cooling | V −1 · P 0 · K +1 | — |

## Legume & seed staples (5)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Black chickpea (kala chana) | `kalaChana` | astringent, sweet | cooling | V +1 · P −1 · K −1 | — |
| ☐ | Fox nut (makhana) | `makhana` | sweet, astringent | cooling | V −1 · P −1 · K 0 | — |
| ☐ | Hemp seeds | `hempSeed` | sweet, astringent | cooling | V −1 · P −1 · K +1 | — |
| ☐ | Watermelon seeds (magaz) | `watermelonSeed` | sweet | cooling | V −1 · P −1 · K +1 | — |
| ☐ | Tiger nuts | `tigerNut` | sweet | cooling | V −1 · P −1 · K +1 | (not a nut — no nut allergen) |

## Spices & condiments (4)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Black salt (kala namak) | `blackSalt` | salty | heating | V −1 · P 0 · K 0 | caution:high_sodium |
| ☐ | White pepper | `whitePepper` | pungent | heating | V +1 · P +1 · K −1 | — |
| ☐ | Sumac | `sumac` | sour, astringent | cooling | V −1 · P +1 · K −1 | — |
| ☐ | Allspice | `allspice` | pungent, sweet | heating | V 0 · P +1 · K −1 | — |

## Fruits (6)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Sapota (chikoo) | `sapota` | sweet | cooling | V −1 · P −1 · K +1 | caution:high_sugar |
| ☐ | Dragon fruit | `dragonFruit` | sweet | cooling | V −1 · P −1 · K 0 | — |
| ☐ | Mulberry | `mulberry` | sweet, sour | cooling | V −1 · P 0 · K 0 | — |
| ☐ | Star fruit | `starfruit` | sour, sweet, astringent | cooling | V −1 · P 0 · K −1 | oxalate/kidney (note only) |
| ☐ | Quince | `quince` | astringent, sour, sweet | cooling | V 0 · P −1 · K −1 | eat cooked |
| ☐ | Apricot (fresh) | `apricotFresh` | sweet, sour | cooling | V −1 · P 0 · K 0 | — |

## Modern pantry (3)

| ✔ | Food | id | rasa | vīrya | doshaEffect | flags |
|---|------|----|------|-------|-------------|-------|
| ☐ | Mascarpone | `mascarpone` | sweet | cooling | V −1 · P 0 · K +1 | allergen:dairy |
| ☐ | Nutritional yeast | `nutritionalYeast` | salty, sweet | neutral | V 0 · P 0 · K −1 | — |
| ☐ | Gochujang | `gochujang` | pungent, sweet, salty | heating | V 0 · P +1 · K +1 | allergen:soy,gluten · caution:high_sodium · tag:nightshade |

---

## Open questions / calls to confirm

- **Raw mango** — set to sour/heating/`P +1` (unripe = sour). Some read the astringency as keeping Kapha down more (`K −1`); flag if you'd prefer that.
- **Raw papaya** — traditionally avoided in pregnancy; kept as a `whyAvoid` note rather than a hard diet tag (no pregnancy pattern exists). Flag if you want a tag.
- **Black salt** — modelled as gentler than common salt (`P 0`, `K 0`) per its digestive reputation; keep `high_sodium`. Flag if you'd rather treat it as ordinary salt (`P +1 · K +1`).
- **Fox nut (makhana)** — `K 0` (unusually light for a "nut", so not Kapha-building). Roasted in ghee it edges toward `K +1`; flag if you want the default heavier.
- **Star fruit** — oxalate/kidney caution is clinical, left as prose; flag if you want a caution tag.
- **Rice varieties** — jasmine/sushi/arborio all `cooling` like basmati; if you read the stickier short-grains as more Kapha-heavy (`P 0`), flag.

## Notes / corrections

_(add feedback per item here)_
