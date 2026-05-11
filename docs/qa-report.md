# V1 Content QA Report

> Generated: 2026-05-11
> Scope: every asana, pranayama, Ayurveda module, program, and image asset.
> Method: programmatic schema audit + filesystem cross-check + reference
> integrity verification, all run against the live data modules.

## TL;DR

**Catalog is launch-ready.** No schema gaps, no broken references, no
empty contraindication arrays, no missing source citations. 22 poseKeys
still use the icon fallback because their image files aren't generated
yet — none of this blocks launch; it's a quality bar to close at your
imagery-generation pace.

| Surface | Pass | Notes |
|---|---|---|
| Asana schema (75 entries) | **✅ all green** | 0 entries with missing fields, contraindications, instructions, or sources |
| Pranayama schema (6 entries) | **✅ all green** | All have practiceSeat, pattern, contras, instructions |
| Ayurveda modules (3) | **✅ all green** | 3 doshas + 3 dietary guides + 13 dinacharya practices |
| Programs (7 routine templates) | **✅ all green** | Every asana reference resolves to a live entry |
| Aliases map (11 entries) | **✅ all green** | Every alias target is a valid asana ID |
| Routine template references | **✅ all green** | No broken `{id}` references in routine asana lists |
| PoseFigure imagery | ⚠️ **22 gaps** | See §3 below |

## 1. Asana schema audit

**75 entries scanned**, excluding routine-template residual keys
(`stress`, `sleep`, `energy`, `flexibility`) and the legacy
`mindfulRespiration` (now superseded by pranayamas.js).

For each entry, verified:

- `contraindications` present and ≥3 items
- `instructions` present and ≥5 steps
- `source.text` present
- `devanagari` present (new schema)
- `iast` present (new schema)
- `poseKey` present
- `modifications` non-empty
- `benefits` non-empty
- `reasoning` present
- `doshaAffinity.vata` is numeric (not legacy strings)
- `level` is lowercase (not `'Beginner'` etc.)
- `level === 'advanced'` entries explicitly mention "teacher" or
  "prerequisite" in their contraindications

**Result: 0 findings across 75 entries × 11 checks.** Schema is
uniformly clean.

## 2. Pranayama & Ayurveda audit

**Pranayamas (6 entries):** 0 issues. All have
`practiceSeat`, structured `pattern` (paced or rate), non-empty
`contraindications` (Bhastrika 8, Kapalabhati 9 — heaviest as
designed), `instructions`, and HYP / modern source citations.

**Ayurveda:** 3 doshas (Vata, Pitta, Kapha) with full schema. 3
dietary guides (one per dosha). 13 dinacharya practices in
morning-to-evening order. All carry Charaka source citations.

## 3. Imagery audit (the one open item)

Of 75 poseKeys in use:

- **53 wired in PoseFigure.POSE_IMAGES** with corresponding file on
  disk. App renders the figure.
- **22 not wired**, all of which fall back to a Material icon when
  the asana detail page renders. Of the 22:
  - **4 had files on disk but weren't registered** — fixed in this
    commit (halasana, sarvangasana, sirsasana, sasangasana).
  - **18 don't have files yet** — these are the ones the prompts in
    `docs/kling-asana-prompts.md` are ready for. Split:
    - **3 sequences** (suryaNamaskarB, chandraNamaskar, cardiacWarmup)
      — single-still prompts added in commit `415b2a4`.
    - **15 stretch-tier asanas** (swastikasana, kurmasana, kukkutasana,
      uttanaKurmasana, mayurasana, simhasana, bhadrasana, kapotasana,
      bakasana, kakasana, chaturangaDandasana, vasishthasana,
      astavakrasana, pasasana, adhoMukhaVrksasana) — peak-pose +
      motion prompts added in commit `71f99a3`.

**Action**: when Kling capacity is available, generate the 18 missing
peak-stills and drop them into `/public/poses/{poseKey}.png`. The
PoseFigure registry already has them registered as expected paths in
prior commits — just add the files. Video clips are stretch goal per
the original imagery plan; the catalog launches with stills.

## 4. Reference integrity

- **`ASANA_ALIASES`** (11 entries): every alias target exists as a
  live asana ID. Backward compat for legacy IDs (cobra, bridge,
  downwardDog, tree, etc.) all resolve correctly.
- **Routine templates** (7 routines × 7-9 asanas each): every `{id}`
  references a valid `ASANAS[id]` entry. No orphans, no typos.
- **`getRoutine()`** returns a non-null routine for all 7 keys
  (stress, sleep, energy, flexibility, morning7Day, backPainSeries,
  preBedWindDown).

## 5. HYP citation completeness

13 asanas in the catalog cite HYP Ch. 1 verses directly:

| ID | Verse | Asana |
|---|---|---|
| swastikasana | 1.19 | Auspicious Seat |
| gomukhasana | 1.20 | Cow Face Pose |
| virasana | 1.21 | Hero Pose |
| kurmasana | 1.22 | Tortoise Pose |
| kukkutasana | 1.23 | Cock Pose |
| uttanaKurmasana | 1.24 | Stretched Tortoise |
| dhanurasana | 1.25 | Bow Pose |
| ardhaMatsyendrasana | 1.27 | Half Lord of the Fishes (note: HYP names full Matsyendrasana) |
| paschimottanasana | 1.30-31 | Seated Forward Bend |
| mayurasana | 1.32-33 | Peacock Pose |
| siddhasana | 1.35-38 | Accomplished Pose |
| padmasana | 1.44-49 | Lotus Pose |
| simhasana | 1.50-52 | Lion Pose |
| bhadrasana | 1.53-54 | Gracious Pose |

Pranayamas with HYP citations:
- ujjayi (HYP 2.51-53), sheetali (2.57-58), bhastrika (2.61-67),
  bhramari (2.68), kapalabhati (2.36-37 — as kriya).

Charaka Samhita citations in Ayurveda modules:
- doshas: Sutrasthana 1, 12, 17, 21 + Vimanasthana 8
- dietary: Sutrasthana 26-27 + Vimanasthana 1.21
- dinacharya: Sutrasthana 5 + 7

## 6. Safety surface — additional spot-checks

Verified that every `level === 'advanced'` entry (~12 entries) has
contraindications that explicitly reference either "teacher" or
"prerequisite". This guards against users solo-attempting Kapotasana,
Kukkutasana, Mayurasana, Astavakrasana, Handstand without preparation.

Pregnancy-specific contraindications scanned:
- Forward folds, deep twists, prone positions: all carry pregnancy
  modifications or skip-this-pose guidance.
- Forceful breath pranayamas (Bhastrika, Kapalabhati): explicit
  "Pregnant women SHOULDN'T practice" capitalized for emphasis.

## 7. Recommended pre-launch touches (non-blocking)

These would polish the catalog but are not gates:

1. **Generate the 18 missing peak-stills** to remove icon fallbacks
   from the new asana detail pages.
2. **Run a final read-through of advanced asana contraindications
   with a yoga teacher** — schema enforces presence, but a clinical
   eye on specific phrasing is good before launch.
3. **Translate priority entries into German** — the i18n setup
   exists; pilot 10 + 6 pranayamas would be a meaningful starter
   set for EN+DE shipping.
4. **Add `imagery` column to content-tracker.md** to make the 18
   pending stills trackable as discrete tasks.

## 8. Change log

| Date | Change |
|---|---|
| 2026-05-11 | Initial report; registered 4 already-on-disk images (halasana, sarvangasana, sirsasana, sasangasana). |
