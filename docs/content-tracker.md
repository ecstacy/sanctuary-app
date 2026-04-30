# Content Buildout Tracker

> Live status of every asana / pranayama / Ayurveda entry.
> Update this file in the same PR as any content change.
> See [`content-buildout.md`](./content-buildout.md) for schema + workflow.

## Status legend

- `[ ]` not started
- `[D]` **DRAFTED** — schema entry exists, fields populated
- `[I]` **IMAGERY** — Kling prompt added to `kling-asana-prompts.md`
- `[R]` **REVIEWED** — Akash fact-checked content vs. source books
- `[S]` **SAFETY_PASS** — Akash signed off contraindications
- `[L]` **LIVE** — fully shipped, in active rotation

A row is launch-ready only when all five gates are checked.

---

## Pilot 10 (validates schema, then we batch the rest)

| # | ID | English | Cat | Source | D | I | R | S | L | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `tadasana` | Mountain Pose | standing | modern | ✓ | ✓ | ✓ | ✓ | ✓ | Shipped 3402def. |
| 2 | `adhoMukhaSvanasana` | Down Dog | inversion | modern | ✓ | ✓ | ✓ | ✓ | ✓ | Shipped 3402def. Renamed from `downwardDog`. |
| 3 | `virabhadrasanaII` | Warrior II | standing | modern | ✓ | ✓ | ✓ | ✓ | ✓ | Shipped 3402def. Renamed from `warrior2`. |
| 4 | `trikonasana` | Triangle | standing | modern | ✓ | ✓ | ✓ | ✓ | ✓ | Shipped 3402def. NEW pose + image. |
| 5 | `bhujangasana` | Cobra | backbend | modern | ✓ | ✓ | ✓ | ✓ | ✓ | Shipped 3402def. Renamed from `cobra`. |
| 6 | `setuBandhaSarvangasana` | Bridge | backbend | modern | ✓ | ✓ | ✓ | ✓ | ✓ | Shipped 3402def. Renamed from `bridge`. |
| 7 | `paschimottanasana` | Seated Forward Bend | forward_fold | **HYP 1.30-31** | ✓ | ✓ | ✓ | ✓ | ✓ | Shipped 3402def. First HYP citation. |
| 8 | `ardhaMatsyendrasana` | Half Lord of the Fishes | twist | modern (HYP 1.27 origin) | ✓ | ✓ | ✓ | ✓ | ✓ | Shipped 3402def. Renamed from `seatedTwist`. |
| 9 | `balasana` | Child's Pose | restorative | modern | ✓ | ✓ | ✓ | ✓ | ✓ | Shipped 3402def. |
| 10 | `savasana` | Corpse | restorative | **HYP 1.32** | ✓ | ✓ | ✓ | ✓ | ✓ | Shipped 3402def. HYP-named asana. |

**Pilot status: 10/10 DRAFTED.** Imagery exists for 9 (legacy clips, may need regeneration per Kling doc); Trikonasana clip yet to generate.

---

## Batch 2: asanas 11-40 (after pilot ships)

Pulled from `content-buildout.md` §7 with category balance preserved.
Empty rows pre-filled so we can fill in the columns as we go.

### Standing (12 remaining of 15 in §7)

| # | ID | English | Source | D | I | R | S | L |
|---|---|---|---|---|---|---|---|---|
| 11 | `vrksasana` | Tree | modern | ✓ | | | | |
| 12 | `utkatasana` | Chair | modern | ✓ | | | | |
| 13 | `virabhadrasanaI` | Warrior I | modern | ✓ | | | | |
| 14 | `virabhadrasanaIII` | Warrior III | modern | ✓ | | | | |
| 15 | `parsvakonasana` | Side Angle | modern | ✓ | | | | |
| 16 | `parsvottanasana` | Pyramid | modern | ✓ | | | | |
| 17 | `prasaritaPadottanasana` | Wide-Legged Forward Fold | modern | ✓ | | | | |
| 18 | `anjaneyasana` | Low Lunge | modern | ✓ | | | | |
| 19 | `uttanasana` | Standing Forward Fold | modern | ✓ | | | | |
| 20 | `utthitaHastaPadangusthasana` | Hand-to-Big-Toe | modern | ✓ | | | | |
| 21 | `garudasana` | Eagle | modern | ✓ | | | | |
| 22 | `natarajasana` | Dancer's | modern | ✓ | | | | |

### Seated (11 remaining of 12 in §7)

| # | ID | English | Source | D | I | R | S | L |
|---|---|---|---|---|---|---|---|---|
| 23 | `sukhasana` | Easy Pose | modern | ✓ | | | | |
| 24 | `padmasana` | Lotus | **HYP 1.44-49** | ✓ | | | | |
| 25 | `siddhasana` | Accomplished | **HYP 1.35-38** | ✓ | | | | |
| 26 | `vajrasana` | Thunderbolt | modern (HYP-adjacent) | ✓ | | | | |
| 27 | `ardhaPadmasana` | Half Lotus | modern | ✓ | | | | |
| 28 | `baddhaKonasana` | Bound Angle | modern | ✓ | | | | |
| 29 | `upavishtaKonasana` | Wide-Angle Seated Forward | modern | ✓ | | | | |
| 30 | `januSirsasana` | Head-to-Knee | modern | ✓ | | | | |
| 31 | `gomukhasana` | Cow Face | **HYP 1.20** | ✓ | | | | |
| 32 | `marichyasanaC` | Marichi's Pose C | modern | ✓ | | | | |
| 33 | `virasana` | Hero | **HYP 1.21** | ✓ | | | | |

### Supine (7 remaining of 8 in §7)

| # | ID | English | Source | D | I | R | S | L |
|---|---|---|---|---|---|---|---|---|
| 34 | `suptaBaddhaKonasana` | Reclined Bound Angle | modern | ✓ | | | | |
| 35 | `suptaPadangusthasana` | Reclined Hand-to-Big-Toe | modern | ✓ | | | | |
| 36 | `suptaMatsyendrasana` | Supine Twist | modern (HYP 1.27 origin) | ✓ | | | | |
| 37 | `apanasana` | Knees-to-Chest | modern | ✓ | | | | |
| 38 | `legsUpTheWall` | Legs Up the Wall | modern (HYP 3.78 mudra origin) | ✓ | | | | |
| 39 | `jatharaParivartanasana` | Belly Twist | modern | ✓ | | | | |
| 40 | `dhanurasana` | Bow | **HYP 1.25** | ✓ | | | | |

### Prone (5 remaining of 6 in §7) — split to batch 3

---

## Batch 3: asanas 41-70

| # | ID | English | Source | D | I | R | S | L |
|---|---|---|---|---|---|---|---|---|
| 41 | `salabhasana` | Locust | modern | | | | | |
| 42 | `ardhaSalabhasana` | Half Locust | modern | | | | | |
| 43 | `makarasana` | Crocodile | modern | | | | | |
| 44 | `sasangasana` | Rabbit | modern | | | | | |
| 45 | `halasana` | Plow | modern (HYP 3.69 lineage) | | | | | |
| 46 | `sarvangasana` | Shoulder Stand | modern (HYP Viparita Karani family) | | | | | |
| 47 | `sirsasana` | Headstand | modern | | | | | |
| 48 | `bharadvajasana` | Bharadvaja's Twist | modern | | | | | |
| 49 | `marichyasanaA` | Marichi's Pose A | modern | | | | | |
| 50 | `parivrttaTrikonasana` | Revolved Triangle | modern | | | | | |
| 51 | `suptaVirasana` | Reclined Hero | modern (HYP 1.21 origin) | | | | | |
| 52 | `suptaSukhasana` | Reclined Easy | modern | | | | | |
| 53 | `suryaNamaskarA` | Sun Salutation A | modern | | | | | |
| 54 | `suryaNamaskarB` | Sun Salutation B | modern | | | | | |
| 55 | `chandraNamaskar` | Moon Salutation | modern | | | | | |
| 56 | `cardiacWarmup` | Cat-Cow Flow | modern | | | | | |
| 57 | `ekaPadaRajakapotasana` | Pigeon | modern (HYP 1.51 lineage) | | | | | |
| 58 | `malasana` | Garland Squat | modern | | | | | |
| 59 | `mandukasana` | Frog | modern | | | | | |
| 60 | `ardhaPigeonForwardFold` | Half Pigeon Forward Fold | modern | | | | | |

---

## Stretch tier: 61-80 (advanced + arm balances; ship if time allows)

| # | ID | English | Source | D | I | R | S | L |
|---|---|---|---|---|---|---|---|---|
| 61 | `kapotasana` | King Pigeon | modern | | | | | |
| 62 | `bakasana` | Crow | modern | | | | | |
| 63 | `kakasana` | Crane | modern | | | | | |
| 64 | `chaturangaDandasana` | Four-Limbed Staff | modern | | | | | |
| 65 | `vasishthasana` | Side Plank | modern | | | | | |
| 66 | `astavakrasana` | Eight-Angle | modern | | | | | |
| 67 | `pasasana` | Noose | modern | | | | | |
| 68 | `adhoMukhaVrksasana` | Handstand | modern | | | | | |
| 69 | `kurmasana` | Tortoise | **HYP 1.22** | | | | | |
| 70 | `kukkutasana` | Cock | **HYP 1.23** | | | | | |
| 71 | `mayurasana` | Peacock | **HYP 1.30** *(separate from Paschimottanasana 1.30-31)* | | | | | |
| 72 | `simhasana` | Lion | **HYP 1.50-52** | | | | | |
| 73 | `bhadrasana` | Auspicious | **HYP 1.53-54** | | | | | |
| 74 | `swastikasana` | Swastika | **HYP 1.19** | | | | | |
| 75 | `uttanaKurmasana` | Stretched Tortoise | **HYP 1.24** | | | | | |

*Stretch-tier 11 entries plus 4 stretches from earlier categories =
~80 total target.* If we cap v1 at 65 LIVE, the Charaka-side content
in batches 9–11 still fills out a credible launch.

---

## Pranayama (6)

Same schema as asanas. Lives in `src/data/pranayamas.js` (new file
in batch 9).

| # | ID | English | Source | D | I | R | S | L |
|---|---|---|---|---|---|---|---|---|
| P1 | `nadiShodhana` | Alternate Nostril | **HYP 2.7-10** | | n/a | | | |
| P2 | `ujjayi` | Victorious Breath | **HYP 2.51-53** | | n/a | | | |
| P3 | `bhramari` | Humming Bee | **HYP 2.68** | | n/a | | | |
| P4 | `sheetali` | Cooling | **HYP 2.57-58** | | n/a | | | |
| P5 | `bhastrika` | Bellows | **HYP 2.61-67** | | n/a | | | |
| P6 | `kapalabhati` | Skull-Shining | **HYP 2.36-37** | | n/a | | | |

Pranayamas don't get full pose-figure imagery — they get a small
illustrated breath diagram per technique (drawn separately, not via
Kling).

---

## Ayurveda content (batch 10)

Lives in `src/data/ayurveda/`:

- `dosha-prakriti.js` — Vata, Pitta, Kapha base profiles (CS Sutrasthana)
- `dietary.js` — favor / avoid lists per dosha
- `dinacharya.js` — daily routine recommendations (CS Sutrasthana Ch. 5)

| # | File | Source | D | R | L |
|---|---|---|---|---|---|
| A1 | dosha-prakriti.js | CS Sutrasthana 8 | | | |
| A2 | dietary.js | CS Sutrasthana 25-27 | | | |
| A3 | dinacharya.js | CS Sutrasthana 5 | | | |

---

## Programs (batch 11)

3 new structured programs combining the catalog above.

| ID | Title | Asanas pulled from | D | R | L |
|---|---|---|---|---|---|
| `morning7Day` | 7-Day Morning Reset | Standing + sun salutations + breath | | | |
| `backPainSeries` | Back Pain Relief Series | Bridge, Cobra, Bhujangasana, Down Dog, twists | | | |
| `preBedWindDown` | Pre-Bed Wind-Down | Forward folds, supported bridge, child, savasana | | | |

---

## Status snapshot (auto-update on each content PR)

```
PILOT             10 / 10 drafted  (3 schema-validated entries + 7 migrated)
BATCH 2 (11-40)    0 / 30
BATCH 3 (41-60)    0 / 20
STRETCH (61-75)    0 / 15
PRANAYAMAS         0 / 6
AYURVEDA           0 / 3
PROGRAMS           0 / 3
─────────────────────────────────
TOTAL             10 / 87  (11.5%)
```
