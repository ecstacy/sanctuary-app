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
//  rows are returned by the accessors in lib/ingredients.js. Everything here
//  starts as draft: these were drafted from the classical framework and have
//  NOT yet been fact-checked against Charaka by a human. That check is the
//  gate, and it is the difference between a reference and a plausible-sounding
//  guess. Do not flip a flag you have not verified.
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
 * @property {'heating'|'cooling'} virya   Potency (uṣṇa / śīta)
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
    reviewStatus: 'draft',
    confidence: 'high',
  },

  oats: {
    id: 'oats',
    name: 'Oats',
    aliases: ['oatmeal', 'porridge', 'haferflocken'],
    category: 'grain',
    rasa: ['sweet'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    bestTime: ['morning'],
    bestSeason: ['autumn', 'winter'],
    whyFavor:
      'Warm, moist and grounding — a good winter breakfast for Vata. Cooked oats are far easier to digest than raw muesli.',
    whyAvoid: 'Heavy and moist, so it can add to Kapha sluggishness in spring.',
    allergens: ['gluten'],
    source: {
      text: 'modern',
      note: 'Not in the classical corpus. Classified from properties: sweet rasa, heavy and oily guna, warming when cooked.',
    },
    reviewStatus: 'draft',
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
      'Charaka treats ghee as the foremost of the fats — it carries the qualities of whatever it is cooked with inward, kindles digestion without overheating, and settles both Vata and Pitta.',
    whyAvoid: 'Heavy and oily, so excess adds to Kapha.',
    allergens: ['dairy'],
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'draft',
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
      'Fruit — a classical incompatible combination (viruddha)',
      'Fish',
      'Hot/cooked meals at night',
    ],
    allergens: ['dairy'],
    cautions: ['acid_reflux'],
    source: { text: 'CS', verse: 'Sutrasthana 7' },
    reviewStatus: 'draft',
    confidence: 'high',
  },

  // ── Spices ───────────────────────────────────────────────────────────────
  ginger: {
    id: 'ginger',
    name: 'Ginger (fresh)',
    sanskrit: 'Ardraka',
    devanagari: 'आर्द्रक',
    aliases: ['adrak', 'fresh ginger', 'ingwer'],
    category: 'spice',
    rasa: ['pungent'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['light', 'oily', 'sharp'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    bestTime: ['morning', 'midday'],
    bestSeason: ['autumn', 'winter'],
    whyFavor:
      'The classical digestive kindler — pungent and warming, it lifts a dull appetite and clears Kapha heaviness.',
    whyAvoid: 'Heating and sharp, so it can inflame an already-hot Pitta.',
    cautions: ['acid_reflux', 'pregnancy'],
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'draft',
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
    reviewStatus: 'draft',
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
    preparation: 'Toasted and buttered offsets the dryness for Vata.',
    allergens: ['gluten'],
    source: {
      text: 'modern',
      note: 'Not in the classical corpus. Derived from properties: dry and heavy guna, cooling, with the astringency of rye and the sourness of the leaven.',
    },
    reviewStatus: 'draft',
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
    reviewStatus: 'draft',
    confidence: 'medium',
  },
}

/** Stable list form, for iteration. Includes drafts — filter before display. */
export const ALL_INGREDIENTS = Object.values(INGREDIENTS)
