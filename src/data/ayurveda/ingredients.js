// ─────────────────────────────────────────────────────────────────────────────
//  ingredients.js — the curated Ayurvedic food dataset
//
//  This file is the ENTIRE factual basis of the diet feature. Nothing about a
//  food's effect is ever generated at runtime — search is a lookup and the meal
//  planner is a rules composer over these rows, so there is no place for a
//  model to invent a fact. See docs/diet-feature-plan.md §2.
//
//  ⚠ SIGN CONVENTION — `doshaEffect` follows the FOOD convention:
//        -1 = PACIFIES (reduces that dosha — good if it's aggravated)
//         0 = neutral
//        +1 = AGGRAVATES
//  This is the OPPOSITE of `doshaAffinity` on asanas/pranayamas, where +1 means
//  balancing. Never compare the two numbers directly, and never read either
//  raw — go through `foodSuitability()` / `practiceSuitability()` in
//  src/lib/doshaSemantics.js, which normalise both to the same vocabulary.
//  Getting this backwards silently inverts the advice while looking entirely
//  plausible; it already shipped once on the /poses pages.
//
//  ── THE REVIEW GATE ────────────────────────────────────────────────────────
//  `reviewStatus: 'draft'` entries are INVISIBLE to the app. Only 'reviewed'
//  rows are returned by the accessors in lib/ingredients.js. A new entry is
//  drafted from the classical framework and has NOT been fact-checked against
//  Charaka by a human — that check is the gate, and it is the difference
//  between a reference and a plausible-sounding guess. Do not flip a flag you
//  have not verified.
//
//  Batch 1 (the 9 rows below) was reviewed and signed off on 2026-07-21; see
//  docs/diet-review-batch-1.md. dietSafety.test.js pins that approved id set,
//  so a future entry cannot reach users by quietly being born 'reviewed'.
//
//  ── SOURCE POLICY ──────────────────────────────────────────────────────────
//  Same as dietary.js: paraphrase the Sanskrit verses and pre-1923 English
//  translations, cite the reference, and NEVER reproduce copyrighted modern
//  translations or cookbook text.
//
//  ── CONFIDENCE ─────────────────────────────────────────────────────────────
//  'high'   — classical consensus, directly attested (rice, ghee, ginger).
//  'medium' — absent from the classical corpus, classified by DERIVABLE
//             properties (rasa/virya/vipaka from taste, heaviness, potency).
//             Surfaced in the UI as "derived, not classically cited" so the
//             user can weigh it. Most German/Western staples land here.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {'sweet'|'sour'|'salty'|'pungent'|'bitter'|'astringent'} Taste
 * @typedef {'grain'|'legume'|'vegetable'|'fruit'|'dairy'|'spice'|'oil'|'nut_seed'|'sweetener'|'beverage'|'animal'|'other'} FoodCategory
 *
 * @typedef {object} Ingredient
 * @property {string}   id            camelCase, e.g. 'basmatiRice'
 * @property {string}   name          Display name, e.g. 'Basmati rice'
 * @property {string}   [sanskrit]
 * @property {string}   [devanagari]
 * @property {string[]} aliases       Search synonyms incl. common regional names
 * @property {FoodCategory} category
 * @property {Taste[]}  rasa          Primary tastes
 * @property {'heating'|'cooling'|'neutral'} virya
 *   Potency (uṣṇa / śīta). `'neutral'` was added after review batch 1: the
 *   classical pair is heating/cooling, but property-derived non-classical
 *   foods genuinely sit between (cooked oats), and forcing them to one pole
 *   overstates what we know.
 * @property {'sweet'|'sour'|'pungent'} vipaka  Post-digestive effect
 * @property {string[]} guna          Qualities: 'light','heavy','oily','dry','sharp'…
 * @property {{vata:-1|0|1, pitta:-1|0|1, kapha:-1|0|1}} doshaEffect  −1 pacifies / +1 aggravates
 * @property {('morning'|'midday'|'evening')[]} [bestTime]
 * @property {('spring'|'summer'|'autumn'|'winter')[]} [bestSeason]
 * @property {string}   [preparation] Where prep flips the effect (raw vs cooked…)
 * @property {string}   [whyFavor]
 * @property {string}   [whyAvoid]
 * @property {string[]} [combosToAvoid]  viruddha āhāra — incompatible combinations
 * @property {string[]} [cautions]    FLAGS, not diagnoses: 'pregnancy','acid_reflux'…
 * @property {string}   [cautionNote]
 *   Added after review batch 1. A bare flag can't distinguish a *classical
 *   contraindication* from a *practical, symptom-based* caution, and conflating
 *   them overstates the tradition — flagging ginger for pregnancy as though
 *   Charaka forbade it would be wrong. Use this to say which kind it is.
 * @property {string[]} [allergens]   Canonical allergen keys — see lib/dietSafety.js
 * @property {{text:'CS'|'HYP'|'modern', verse?:string, note?:string}} source
 * @property {'draft'|'reviewed'} reviewStatus  Only 'reviewed' is ever shown
 * @property {'high'|'medium'} confidence
 */

/** @type {Record<string, Ingredient>} */
export const INGREDIENTS = {
  // ── Grains ───────────────────────────────────────────────────────────────
  basmatiRice: {
    id: 'basmatiRice',
    name: 'Basmati rice',
    sanskrit: 'Shali',
    devanagari: 'शालि',
    aliases: ['rice', 'white rice', 'basmati'],
    category: 'grain',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light', 'soft'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 },
    bestTime: ['midday'],
    whyFavor:
      'Sweet, cooling and light — settles both Vata and Pitta without the heaviness of most grains. Charaka names shali rice among the most wholesome of the cereals.',
    preparation:
      'Well-cooked and moist suits Vata best; drier preparations suit Kapha.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  oats: {
    id: 'oats',
    name: 'Oats',
    aliases: ['oatmeal', 'porridge', 'haferflocken'],
    category: 'grain',
    rasa: ['sweet'],
    // Review batch 1: was 'heating' — corrected to neutral. Cooked oats are at
    // most mildly warming, and claiming a heating potency overstated the
    // derivation. This correction is what added 'neutral' to the schema.
    virya: 'neutral',
    vipaka: 'sweet',
    guna: ['heavy', 'soft_when_cooked', 'nourishing'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    bestTime: ['morning'],
    bestSeason: ['autumn', 'winter'],
    whyFavor:
      'Warm, soft and grounding — a good winter breakfast for Vata. Cooked oats are far easier to digest than raw muesli.',
    whyAvoid: 'Heavy and nourishing, so it can add to Kapha sluggishness in spring.',
    allergens: ['gluten'],
    source: {
      text: 'modern',
      note: 'Not in the classical corpus. Derived from properties: sweet rasa, heavy and nourishing guna, neutral to mildly warming when cooked.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Dairy ────────────────────────────────────────────────────────────────
  ghee: {
    id: 'ghee',
    name: 'Ghee',
    sanskrit: 'Ghrita',
    devanagari: 'घृत',
    aliases: ['clarified butter', 'ghi'],
    category: 'dairy',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['oily', 'soft', 'heavy'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    bestTime: ['midday'],
    whyFavor:
      'Charaka treats ghee as the foremost of the fats — it kindles digestion without overheating, and settles both Vata and Pitta.',
    whyAvoid: 'Heavy and oily, so excess adds to Kapha.',
    allergens: ['dairy'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      // Review batch 1: the *yogavahi* framing (that ghee carries the
      // qualities of whatever it is cooked with) was removed — it is a later
      // classical/commentarial concept, not something Sutrasthana 27 states.
      // The properties and dosha effects below are the classical description.
      note: 'Properties and dosha effects per Sutrasthana 27. The yogavahi (carrier) attribute is later commentary and is deliberately not claimed here.',
    },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  yoghurt: {
    id: 'yoghurt',
    name: 'Yoghurt',
    sanskrit: 'Dadhi',
    devanagari: 'दधि',
    aliases: ['curd', 'dahi', 'joghurt'],
    category: 'dairy',
    rasa: ['sour', 'sweet'],
    virya: 'heating',
    vipaka: 'sour',
    guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    bestTime: ['midday'],
    whyAvoid:
      'Sour and heating despite feeling cool — classically cautioned at night, and it increases both Pitta and Kapha.',
    preparation:
      'Traditionally taken thinned and spiced (as buttermilk/lassi) rather than plain and cold.',
    combosToAvoid: [
      'Fruit — widely taught as an incompatible pairing (viruddha)',
      'Fish',
      'Eating it at night',
    ],
    allergens: ['dairy'],
    cautions: ['acid_reflux'],
    cautionNote: 'Practical, symptom-based — not a classical contraindication.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 7',
      // Review batch 1: downgraded to confidence 'medium'. Charaka does treat
      // dadhi and viruddha āhāra, but this SPECIFIC list of incompatible
      // pairings reflects later Ayurvedic interpretation as much as
      // Sutrasthana 7. Rather than assert it as classical, we present it as
      // commonly taught and drop the confidence.
      note: 'Properties follow the classical description of dadhi. The specific incompatibility list reflects later interpretation as much as Sutrasthana 7 — hence medium confidence.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Spices ───────────────────────────────────────────────────────────────
  // Review batch 1 split `ginger` into fresh and dry. The tradition treats
  // them as distinct dravyas because drying materially changes the qualities
  // and the therapeutic use — NOT because vipaka differs (both are madhura).
  gingerFresh: {
    id: 'gingerFresh',
    name: 'Ginger (fresh)',
    sanskrit: 'Ardraka',
    devanagari: 'आर्द्रक',
    aliases: ['ginger', 'adrak', 'fresh ginger', 'ingwer'],
    category: 'spice',
    rasa: ['pungent'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['light', 'slightly_unctuous', 'sharp'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    bestTime: ['morning', 'midday'],
    bestSeason: ['autumn', 'winter'],
    whyFavor:
      'The classical digestive kindler — pungent and warming, it lifts a dull appetite and clears Kapha heaviness.',
    whyAvoid: 'Heating and sharp, so it can inflame an already-hot Pitta.',
    // Review batch 1: pregnancy caution REMOVED. It is not an explicit Charaka
    // caution for ardraka, and modern evidence supports culinary amounts and
    // modest medicinal doses for pregnancy-related nausea. Flagging it would
    // have discouraged something commonly recommended.
    cautions: ['acid_reflux'],
    cautionNote:
      'Practical and symptom-based, not a classical contraindication — sharp, heating foods can aggravate reflux.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  gingerDry: {
    id: 'gingerDry',
    name: 'Ginger (dry)',
    sanskrit: 'Shunthi',
    devanagari: 'शुण्ठी',
    aliases: ['dry ginger', 'dried ginger', 'sonth', 'ground ginger', 'ginger powder'],
    category: 'spice',
    rasa: ['pungent'],
    virya: 'heating',
    vipaka: 'sweet',            // same as fresh — drying changes guna, not vipaka
    guna: ['light', 'dry', 'sharp'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    bestTime: ['morning', 'midday'],
    bestSeason: ['autumn', 'winter'],
    whyFavor:
      'Drying makes it sharper and more penetrating than fresh — the stronger choice for clearing Kapha heaviness and a sluggish appetite.',
    whyAvoid:
      'More intensely heating and drying than fresh ginger, so it presses harder on Pitta.',
    preparation:
      'Distinct from fresh ginger: drier and more concentrated, so less goes further.',
    cautions: ['acid_reflux'],
    cautionNote:
      'Practical and symptom-based, not a classical contraindication.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  // ── Legumes ──────────────────────────────────────────────────────────────
  mungDal: {
    id: 'mungDal',
    name: 'Mung dal',
    sanskrit: 'Mudga',
    devanagari: 'मुद्ग',
    aliases: ['moong', 'mung bean', 'green gram', 'split mung'],
    category: 'legume',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 },
    bestTime: ['midday', 'evening'],
    whyFavor:
      'Charaka singles out mudga as the best of the pulses — light enough to be given during recovery, where heavier legumes are not.',
    preparation:
      'Split and well-cooked with warming spices keeps it from unsettling Vata.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  // ── Western / German staples (property-derived) ───────────────────────────
  ryeBread: {
    id: 'ryeBread',
    name: 'Rye bread',
    aliases: ['roggenbrot', 'sourdough rye', 'brot', 'bread'],
    category: 'grain',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'dry'],
    doshaEffect: { vata: 1, pitta: 0, kapha: 1 },
    whyAvoid:
      'Dry and heavy — the combination tends to unsettle Vata digestion and sit heavily for Kapha, especially cold.',
    preparation:
      'Toasted and buttered offsets the dryness for Vata. Sourdough fermentation adds a mild sour note and improves digestibility, easing the Vata aggravation slightly — but not enough to reclassify the potency as heating.',
    allergens: ['gluten'],
    source: {
      text: 'modern',
      note: 'Not in the classical corpus. Derived from properties: dry and heavy guna, cooling, with the astringency of rye and the sourness of the leaven.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  coffee: {
    id: 'coffee',
    name: 'Coffee',
    aliases: ['kaffee', 'espresso', 'filter coffee'],
    category: 'beverage',
    rasa: ['bitter', 'astringent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'sharp'],
    doshaEffect: { vata: 1, pitta: 1, kapha: -1 },
    bestTime: ['morning'],
    whyAvoid:
      'Sharp, drying and stimulating — it pushes Vata into restlessness and adds heat to Pitta. Its one merit is cutting Kapha heaviness.',
    cautions: ['pregnancy', 'anxiety', 'acid_reflux', 'insomnia'],
    source: {
      text: 'modern',
      note: 'Not in the classical corpus. Derived from properties: bitter/astringent rasa, sharp and drying guna, heating potency.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },
}

/** Stable list form, for iteration. Includes drafts — filter before display. */
export const ALL_INGREDIENTS = Object.values(INGREDIENTS)
