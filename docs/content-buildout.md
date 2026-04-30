# Content Buildout — Asanas, Pranayama, Ayurveda Knowledge Base

> Status: **Active build plan**.
> Owner: Akash (review) + Claude (drafting).
> Sources: Hatha Yoga Pradipika (HYP) and Charaka Samhita (CS).
> Quality bar: launch-ready. Speed secondary to correctness.

## 1. Why this exists

Today the app ships with **15 asanas**, all tagged Beginner, with thin
metadata — barely enough to demo the engine, not enough to serve a real
user week-over-week. Before launch we need a corpus that:

- can power varied 7-day programs without repetition
- maps user complaints (back pain, insomnia, low energy, anxiety…) to
  multiple legitimate practice options
- carries safety information (contraindications) so the app doesn't
  recommend the wrong pose to the wrong body
- has traditional citations (HYP / CS verse references) for credibility

This doc is the master plan: the schema, the workflow, what gets built
in what order, and how we know we're done.

## 2. Decisions locked in

| Decision | Choice |
|---|---|
| Asana count | **60–80** |
| Pranayama count | **6–8** |
| Mudras / Bandhas | Stretch (post-launch unless time allows) |
| Shatkarmas | Out of scope |
| Dosha + dietary content | In scope, minimal |
| Dinacharya (daily routine) | In scope, minimal |
| Ritucharya (seasonal) | Stretch |
| Conditions covered | ~10 (back pain, neck pain, insomnia, anxiety, low energy, stiff hips, digestion, bloating, posture, headache) |
| Storage | **Hybrid** — canonical in `src/data/asanas.js`, evolutions in Supabase `asana_overrides` |
| Validation | Akash reviews. Safety surface (contraindications) gets a second pass. |
| Source books | Akash has digital copies for fact-check |
| Imagery | Akash generates via Kling. We extend `docs/kling-asana-prompts.md` per new asana. |
| Translations | English-only at launch. EN-first authoring. |
| Pace | Quality over speed. No rigid 6-week deadline. |

## 3. Schema

Single source of truth for the asana shape. Encoded as a JSDoc-style
comment in `src/data/asanas.js`; this is the canonical typing.

```ts
// In src/data/asanas.js — definitions are plain JS objects keyed by id.
type Asana = {
  // Identity
  id:            string                  // Sanskrit transliteration in camelCase, e.g. 'tadasana', 'ardhaMatsyendrasana'
  sanskrit:      string                  // Romanization for titles + search, e.g. 'Tadasana'
  devanagari?:   string                  // Devanagari script, e.g. 'ताडासन'
  iast?:         string                  // IAST with diacritics (academic), e.g. 'tāḍāsana'
  english:       string                  // Common English, e.g. 'Mountain Pose'
  aliases:       string[]                // Alternate names: ['Palm Tree Pose']

  // Source citation
  source: {
    text:  'HYP' | 'GS' | 'modern'       // Hatha Yoga Pradipika, Gheranda Samhita, or modern hatha
    verse?: string                       // e.g. '1.34' — verse reference if applicable
    note?:  string                       // 'Modern derivation of HYP padmasana' if not a direct citation
  }

  // Categorization
  category:      'standing' | 'seated' | 'supine' | 'prone' | 'inversion' | 'twist' | 'balance' | 'forward_fold' | 'backbend' | 'restorative' | 'sequence'
  level:         'beginner' | 'intermediate' | 'advanced'
  poseKey:       string                  // Maps to PoseFigure asset id (image/video/svg)
  icon:          string                  // Material symbol fallback when no PoseFigure

  // Practice mechanics
  durationSeconds:    number             // Recommended hold (excluding entry/exit)
  breathPattern:      'natural' | 'ujjayi' | 'kapalabhati' | 'paced'
  breathCues: {
    enter?:  'inhale' | 'exhale'
    exit?:   'inhale' | 'exhale'
    notes?:  string                      // 'Inhale to lengthen, exhale to deepen'
  }
  voiceCues: {
    enter:   string                      // Single sentence for entry
    hold:    string                      // Mid-pose alignment cue
    breathe: string                      // Breath/awareness cue
    exit:    string                      // Single sentence for exit
  }

  // Anatomical & energetic
  bodyParts:          string[]           // ['lower_back', 'hamstrings', 'core']
  doshaAffinity: {                       // +1 = pacifying, 0 = neutral, -1 = aggravating
    vata:   -1 | 0 | 1
    pitta:  -1 | 0 | 1
    kapha:  -1 | 0 | 1
  }

  // User-need tags (powers search + condition mapping)
  tags:               string[]           // ['back_pain', 'stress_relief', 'insomnia', 'energizing']

  // Sequencing
  prerequisites?:     string[]           // ids of poses to learn first
  counterPoses?:      string[]           // ids of recommended counter-poses
  variations?:        string[]           // ids of harder/easier variants

  // Safety (REQUIRED — never empty)
  contraindications:  string[]           // ['acute lower back injury', 'late pregnancy', 'high blood pressure']
  modifications:      string[]           // ['Use a block under the seat', 'Bend the knees if hamstrings are tight']

  // Outcomes
  benefits:           string[]           // 3-6 specific, evidence-based phrases — never 'general wellness'
  reasoning:          string             // Single paragraph: WHY this pose is given. Drives the 'Why this pose' card.
}
```

### Field policy

- **Every contraindication is required reading.** Never leave the array
  empty — even Tadasana has them ("acute vertigo, recent ankle injury").
- **`reasoning` is the user-facing paragraph** in the existing "Why this
  pose" UI. Maximum ~3 sentences. Concrete physical/energetic rationale,
  not metaphysics.
- **`tags` is the bridge** to the recommendations engine. Stable
  vocabulary — see §6 for the canonical tag list.
- **`source.verse`** uses the format `chapter.verse` (e.g. `1.34` for
  HYP Ch. 1 verse 34). Multiple verses comma-separated: `1.34, 1.35`.

## 4. Source-text policy

The two reference books contain copyrighted modern translations on top
of public-domain original verses. We work as follows:

- **Source verses** (HYP, CS) — public domain. We cite by chapter.verse
  and may quote short Sanskrit fragments.
- **Modern translations / commentaries** (Muktibodhananda, Bhagwan Dash)
  — copyrighted. **We never lift them verbatim.** All our prose is
  original or paraphrased from public-domain English translations
  (Pancham Sinh's 1914 HYP, Vivekananda's writings, Iyengar's published
  asana descriptions paraphrased).
- **Akash fact-checks** the paraphrases against the digital copies
  during review. If a phrasing strays from the source's intent, we fix it.

When in doubt, cite a verse rather than a translation.

### HYP-faithful classification rules

The user wants strict HYP-faithfulness in source attribution. This
imposes three concrete rules:

1. **Only HYP-named asanas get `source.text: 'HYP'`.** HYP Ch. 1
   explicitly names ~15 asanas: Swastikasana, Gomukhasana, Virasana,
   Kurmasana, Kukkutasana, Uttana Kurmasana, Dhanurasana,
   Matsyendrasana, Paschimottanasana, Mayurasana, Savasana,
   Siddhasana, Padmasana, Simhasana, Bhadrasana. Every other entry
   gets `source.text: 'modern'` even if commonly *associated* with
   hatha tradition (Tadasana, Trikonasana, all Virabhadrasana
   variants, Adho Mukha Svanasana — all 20th-century derivations).

2. **HYP mudras stay mudras, not asanas.** Viparita Karani (HYP 3.78-
   83), Maha Mudra, Maha Bandha, etc. are mudras in HYP. We do
   *not* relabel them as asanas. "Legs Up the Wall" exists in our
   catalog as `legsUpTheWall` with `source.text: 'modern'` and
   `source.note: 'Modern restorative simplification of the HYP 3.78
   Viparita Karani mudra. The mudra itself is a stretch goal.'`

3. **Half-variants get the HYP origin in `source.note`.** Ardha
   Matsyendrasana (the modern half twist) cites HYP 1.27 in `note`
   but `source.text: 'modern'` — because HYP only names
   Matsyendrasana (the full bind, named for sage Matsyendra). Same
   for Ardha Padmasana (HYP names Padmasana, 1.44-49).

## 5. Pranayama (in scope, ~6)

Six core breath techniques drawn from HYP Ch. 2. Each gets the same
schema as an asana but with `category: 'pranayama'` and additional
fields for retention pattern.

| ID | Sanskrit | English | Source | Note |
|---|---|---|---|---|
| `nadiShodhana` | नाडीशोधन | Alternate Nostril Breathing | HYP 2.7-10 | Anulom Vilom; pacifies vata, balances |
| `ujjayi` | उज्जायी | Victorious Breath | HYP 2.51-53 | Heating, focused |
| `bhramari` | भ्रामरी | Humming Bee Breath | HYP 2.68 | Calming, anti-anxiety |
| `sheetali` | शीतली | Cooling Breath | HYP 2.57-58 | Cooling, pitta-pacifying |
| `bhastrika` | भस्त्रिका | Bellows Breath | HYP 2.61-67 | Energizing, kapha-reducing |
| `kapalabhati` | कपालभाति | Skull-Shining | HYP 2.36-37 | (Technically a shatkarma in HYP, modern usage as pranayama; we treat as pranayama with strong contraindications) |

Stretch — `bhramari` paired with `shanmukhi mudra` for deeper effect; document the mudra for the future stretch chunk.

## 6. Tag vocabulary (canonical)

The asana → user-need bridge. **New tags require a doc PR.** Lock this
down so the recommender can rely on stable strings.

### Conditions / complaints (10)
`back_pain`, `neck_pain`, `insomnia`, `anxiety`, `low_energy`,
`stiff_hips`, `digestion`, `bloating`, `posture`, `headache`

### States / goals
`stress_relief`, `energizing`, `grounding`, `cooling`, `warming`,
`focus`, `pre_meditation`, `post_workout`, `morning`, `evening`,
`gentle`, `restorative`

### Doshas (already implicit via `doshaAffinity` but tag-form is also useful)
`vata_pacifying`, `pitta_pacifying`, `kapha_pacifying`

### Anatomical foci
`spine_extension`, `spine_flexion`, `lateral`, `rotation`,
`hip_opener`, `hamstring_stretch`, `core_strength`,
`shoulder_opener`, `chest_opener`, `inversion`

## 7. The 80-asana shortlist

Drafted to ensure category balance, condition coverage, and source
faithfulness. **Numbers in parentheses are HYP verse references where
applicable.** Asanas already in the app are marked ✓ (we'll review and
upgrade them to the new schema, not throw them out).

### Standing (15)
- Tadasana ✓ (Mountain) — modern, foundational
- Vrksasana ✓ (Tree) — modern
- Utkatasana (Chair)
- Virabhadrasana I (Warrior I)
- Virabhadrasana II (Warrior II)
- Virabhadrasana III (Warrior III)
- Trikonasana (Triangle)
- Parsvakonasana (Side Angle)
- Parsvottanasana (Pyramid)
- Prasarita Padottanasana (Wide-Legged Forward Fold)
- Anjaneyasana (Low Lunge)
- Uttanasana ✓ (Standing Forward Fold)
- Utthita Hasta Padangusthasana (Hand-to-Big-Toe)
- Garudasana (Eagle) — balance
- Natarajasana (Dancer's) — balance, intermediate

### Seated (12)
- Sukhasana ✓ (Easy Pose)
- Padmasana (Lotus) — HYP 1.44-49
- Siddhasana (Accomplished) — HYP 1.35-38
- Vajrasana (Thunderbolt) — HYP 1.51 (sub)
- Ardha Padmasana (Half Lotus)
- Baddha Konasana (Bound Angle)
- Upavistha Konasana (Wide-Angle Seated Forward)
- Janu Sirsasana (Head-to-Knee)
- Paschimottanasana ✓ (Seated Forward Fold) — HYP 1.30-31
- Gomukhasana (Cow Face)
- Marichyasana C (twist; named after sage Marichi)
- Ardha Matsyendrasana (Half Lord of the Fishes) — HYP 1.27 (Matsyendra's pose)

### Supine (8)
- Savasana ✓ (Corpse) — HYP 1.32 (Shava-asana)
- Supta Baddha Konasana (Reclined Bound Angle)
- Supta Padangusthasana (Reclined Hand-to-Big-Toe)
- Supta Matsyendrasana ✓ (Supine Twist)
- Apanasana (Knees-to-Chest)
- Setu Bandha Sarvangasana ✓ (Bridge)
- Viparita Karani ✓ (Legs-Up-the-Wall) — HYP 3.78-83 (technically a mudra)
- Jathara Parivartanasana (Belly Twist)

### Prone (6)
- Bhujangasana ✓ (Cobra) — HYP 1.27 (alternative interpretation)
- Salabhasana (Locust)
- Ardha Salabhasana (Half Locust)
- Dhanurasana (Bow) — HYP 1.25
- Makarasana (Crocodile)
- Adho Mukha Vrksasana (Handstand) — advanced, stretch

### Forward folds & backbends (separate from category list above for explicit grouping)
Already covered in Standing/Seated/Prone; cross-tag with `spine_flexion`/`spine_extension`.

### Inversions (5)
- Adho Mukha Svanasana ✓ (Downward Dog)
- Sasangasana (Rabbit)
- Halasana (Plow) — HYP 3.69
- Sarvangasana (Shoulder Stand) — HYP 3.78 ("Viparita-karani in some interpretations")
- Sirsasana (Headstand) — advanced

### Twists (4)
- Bharadvajasana (seated)
- Marichyasana A
- Pasasana (Noose) — advanced
- Revolved Triangle (Parivrtta Trikonasana)

### Restorative (6)
- Balasana ✓ (Child's)
- Supta Virasana (Reclined Hero)
- Supta Sukhasana (Reclined Easy)
- Legs Up The Wall (already in supine)
- Reclined Goddess (Supta Baddha Konasana — already)
- Constructive Rest (Western, included for accessibility)

### Sequences (4)
- Surya Namaskar A ✓ (Sun Salutation A)
- Surya Namaskar B (Sun Salutation B)
- Chandra Namaskar (Moon Salutation)
- Spinal warm-up sequence (Cat-Cow + flow)

### Hip openers (5)
- Eka Pada Rajakapotasana ✓ (Pigeon)
- Malasana (Garland Squat)
- Frog Pose (Mandukasana)
- Kapotasana (King Pigeon) — advanced, stretch
- Half Pigeon Forward Fold

### Arm balances & advanced (5) — stretch tier
- Bakasana (Crow)
- Kakasana (Crane)
- Chaturanga Dandasana (Four-Limbed Staff)
- Vasisthasana (Side Plank)
- Astavakrasana (Eight-Angle) — advanced

**Total: ~80 asanas.** Tier the bottom 10–15 as "stretch" so we can
launch with 65 even if life gets in the way.

## 8. Workflow per asana

Each asana goes through these states. Tracked in
`docs/content-tracker.md` (created in pilot week).

```
[ ] DRAFTED      — Claude writes the schema entry from sources
[ ] IMAGERY      — Akash adds Kling prompt + generates image, sets poseKey
[ ] REVIEWED     — Akash fact-checks against books, edits language
[ ] SAFETY_PASS  — Akash explicitly approves contraindications
[ ] LIVE         — merged into src/data/asanas.js, tagged for routine inclusion
```

A draft is **not** considered ready until SAFETY_PASS is checked. The
contraindication review is the single most important quality gate.

## 8.5 ID migration

Existing asana IDs are inconsistent — some Sanskrit (`paschimottanasana`),
some English (`cobra`, `bridge`, `downwardDog`, `tree`). The new schema
mandates Sanskrit camelCase as the canonical ID. Migration plan:

- **Rename to Sanskrit**: `cobra → bhujangasana`, `bridge →
  setuBandhaSarvangasana`, `downwardDog → adhoMukhaSvanasana`,
  `seatedTwist → ardhaMatsyendrasana`, `tree → vrksasana`,
  `pigeon → ekaPadaRajakapotasana`, `legUpWall → legsUpTheWall`,
  `supinetwist → suptaMatsyendrasana`, `warrior1 → virabhadrasanaI`,
  `warrior2 → virabhadrasanaII`.
- **Already Sanskrit (no change)**: `tadasana`, `paschimottanasana`,
  `balasana`, `savasana`, `sukhasana`, `uttanasana`, `suryaNamaskar`,
  `mindfulRespiration`.
- **Backward compat**: an `ASANA_ALIASES` map at the bottom of
  `src/data/asanas.js` lets old IDs still resolve until consumer
  code is fully migrated. Removed once all references are updated.

## 9. Pilot — 10 asanas first

Before authoring 70 more, we validate the schema and workflow on 10
that span every category and edge case. **My pick for the pilot:**

| # | Asana | Why this one |
|---|---|---|
| 1 | Tadasana | Foundation, deceptively simple — tests the "even easy poses have contraindications" rule |
| 2 | Adho Mukha Svanasana | Already in app, tests migration path |
| 3 | Virabhadrasana II | Standing strength, tests breath/voice cue authoring |
| 4 | Trikonasana | Standing lateral, tests `bodyParts` granularity |
| 5 | Bhujangasana | Backbend, source-cited (HYP 1.27) |
| 6 | Setu Bandha Sarvangasana | Stress/sleep tag, tests therapeutic mapping |
| 7 | Paschimottanasana | Seated forward fold, source-cited (HYP 1.30) |
| 8 | Ardha Matsyendrasana | Twist, source-cited (HYP 1.27 / Matsyendra) |
| 9 | Balasana | Restorative, tests `restorative` category fields |
| 10 | Savasana | Source-cited (HYP 1.32), unique category, voice-cue heavy |

After the pilot we'll have:
- Validated schema (any field gaps surface here)
- Authoring template that the next 70 follow
- 5+ tagged routines worth of poses for the new tag system

## 10. Imagery — Kling prompt expansion

Our existing `docs/kling-asana-prompts.md` covers the original ~15.
Per new asana, **we add a section to that doc** with:

- The asana name (Sanskrit + English)
- A still-frame description (subject, environment, body position)
- A motion prompt (5-second loop, breath-only motion)
- The `poseKey` it will be saved as

**Process per asana**:
1. Claude drafts the prompt block in the same style as existing entries
2. Akash runs Kling with the prompt
3. Image goes into `src/components/PoseFigure/assets/` under `poseKey`
4. PoseFigure registry updated

For the pilot 10, I'll bulk-author the prompt blocks into
`docs/kling-asana-prompts.md` once we agree on the schema in §11.

## 11. Out of scope for v1 (explicit list)

To keep this honest:

- Mudras and bandhas (HYP Ch. 3 territory) — stretch
- Shatkarmas (cleansing techniques) — too clinical, excluded
- Ritucharya (seasonal regimens) — stretch, post-launch
- Asanas requiring props that aren't household items (bolsters, blocks
  are fine; full inversion stands aren't)
- Asanas with strong religious framing that could alienate secular users
  (we keep the Sanskrit names but the descriptions are pragmatic, not
  devotional)
- Asanas that are clinically risky to teach via app (deep inversions
  beyond Sirsasana, full lotus held >30s for non-practitioners)

## 12. Success criteria

We're done with v1 content buildout when:

- 60+ asanas LIVE (per §8 state machine)
- 6 pranayamas LIVE
- All 10 conditions in §6 have ≥4 mapped asanas each
- Every asana has a non-empty `contraindications` array
- Every asana has a `poseKey` with a real image (no icon fallbacks for
  shipped asanas)
- The 4 existing routines (stress/sleep/energy/flexibility) each pull
  from ≥6 distinct asanas with no immediate repeats
- 3 new programs exist (e.g. "7-day morning routine", "Back pain relief
  series", "Pre-bed wind-down")
- Akash has reviewed and approved every entry's safety surface
- `docs/kling-asana-prompts.md` has prompts for every new asana

## 13. Next steps

1. Akash signs off on this doc (or sends edits).
2. Claude drafts the **10 pilot asanas** as the first big PR.
   Includes:
   - Schema implementation in `src/data/asanas.js`
   - Migration of the 10 picked asanas (some already exist; others new)
   - Imagery prompt blocks added to `docs/kling-asana-prompts.md`
   - Tag vocabulary committed
   - `docs/content-tracker.md` template
3. Akash reviews + generates images for the 10.
4. We ship the pilot. Iterate the schema if anything's awkward.
5. Bulk-author the next 30, then 30, then the stretch tier.

## 14. Change log

| Date | Author | Change |
|---|---|---|
| 2026-04-28 | initial draft | Plan locked after decisions on scope, depth, storage, validation, imagery, i18n, pace |
