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
//  `reviewStatus: 'reviewed'` entries are INVISIBLE to the app. Only 'reviewed'
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
 * @property {string[]} [balancedBy]
 *   Ingredient ids traditionally used to make THIS food digestible — the
 *   asafoetida-and-ginger that make heavy legumes tolerable.
 *
 *   Added at review batch 3 to solve a specific problem without bending the
 *   rules engine. Chickpea and urad dal genuinely need digestive spices, but
 *   making those spices `core` in every dish containing them would delete the
 *   dish for anyone who can't eat one of them, and hard-coding a "needs
 *   spices" exception into the composer would put a food fact inside the
 *   engine. This keeps the principle in the DATA, where it belongs, and leaves
 *   every spice optional.
 *
 *   It is INFORMATIONAL: it never filters, never scores, never blocks. It is
 *   shown to the user as "traditionally balanced with…" and nothing else.
 * @property {string[]} [dietTags]
 *   Pattern-exclusion tags consumed by `exclusionFor()`. Use ONLY the keys in
 *   `DIET_TAGS` (lib/dietSafety.js) — a typo matches no rule and so silently
 *   filters nothing, which is why the vocabulary is asserted in tests.
 *   Absent means "excluded by nothing", so omitting a tag is a claim too.
 *
 *   ⚠ `'root'` follows the PLANT PART, not the processing. A rhizome is still
 *   a rhizome dried, ground or powdered — ginger fresh and dry both carry it,
 *   as does turmeric (review batch 2). The one deliberate exception is
 *   asafoetida: what is eaten is the dried RESIN, not the root, which is why
 *   it is Jain-permitted and the classic allium substitute in Jain cooking.
 * @property {string[]} [allergens]
 *   Canonical allergen keys — see `ALLERGENS` in lib/dietSafety.js. Dairy is
 *   implied by the category and need not be repeated; everything else must be
 *   declared, and `dataset integrity` tests check the ones we can verify.
 * @property {{text:'CS'|'HYP'|'modern', verse?:string, note?:string}} source
 * @property {'draft'|'reviewed'} reviewStatus  Only 'reviewed' is ever shown
 * @property {'high'|'medium'} confidence
 */

import { MODERN_DRAFT_INGREDIENTS } from './ingredients-modern-draft'
import { MODERN_DRAFT_INGREDIENTS_2 } from './ingredients-modern-draft-2'
import { MODERN_DRAFT_INGREDIENTS_3 } from './ingredients-modern-draft-3'
import { DISH_INGREDIENTS } from './ingredients-dishes'
import { MODERN_DRAFT_INGREDIENTS_4 } from './ingredients-modern-draft-4'
import { COMMON_INGREDIENTS } from './ingredients-common'
import { MODERN_DRAFT_INGREDIENTS_5 } from './ingredients-modern-draft-5'
import { MODERN_DRAFT_INGREDIENTS_6 } from './ingredients-modern-draft-6'
import { RECIPES } from './recipes-data'
import { deriveRecipes } from '../../lib/deriveRecipe'

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
    aliases: ['yogurt', 'yoghurt', 'curd', 'dahi', 'joghurt'],
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
    dietTags: ['root'],
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
    // Review batch 2: tagged to MATCH gingerFresh. The earlier fresh/dried
    // asymmetry was wrong — Jain exclusion follows the PLANT PART, not the
    // processing. A rhizome stays a rhizome dried and powdered.
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
    aliases: ['rye bread', 'roggenbrot', 'sourdough rye'],
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

  // ═══════════════════════════════════════════════════════════════════════════
  //  BATCH 2 — drafted 2026-07-21, awaiting fact-check. See
  //  docs/diet-review-batch-2.md. Every row below is `draft` and therefore
  //  INVISIBLE to the app until reviewed.
  //
  //  Drafting rule carried over from batch 1's standing correction: the bias to
  //  guard against is OVER-ATTRIBUTION. A Charaka citation is claimed only
  //  where the food is named in the corpus AND the specific property is what
  //  the text says. Where a property is contested between authorities, or is my
  //  inference, the entry is 'medium' and says so in `source.note` — even when
  //  the food itself is unambiguously classical.
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Grains ────────────────────────────────────────────────────────────────
  wheat: {
    id: 'wheat',
    name: 'Wheat',
    sanskrit: 'Godhuma',
    devanagari: 'गोधूम',
    aliases: ['atta', 'chapati', 'roti', 'weizen', 'wheat flour', 'wholemeal'],
    category: 'grain',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'oily', 'stable'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    bestTime: ['midday'],
    whyFavor:
      'Sweet, cooling and substantial — one of the two grains Charaka treats as building tissue, and steadying for both Vata and Pitta.',
    whyAvoid: 'Heavy and stable, so it adds to Kapha sluggishness when eaten often or late.',
    preparation:
      'Freshly made flatbread is lighter than yeasted bread; both are heavier cold than warm.',
    allergens: ['gluten'],
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  barley: {
    id: 'barley',
    name: 'Barley',
    sanskrit: 'Yava',
    devanagari: 'यव',
    aliases: ['jau', 'gerste', 'pearl barley', 'barley water'],
    category: 'grain',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'rough'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    bestTime: ['midday'],
    bestSeason: ['spring'],
    whyFavor:
      'Light, dry and scraping — the classical grain for reducing Kapha and heaviness, where most cereals do the opposite.',
    whyAvoid: 'The dryness and roughness can unsettle Vata, especially uncooked or cold.',
    allergens: ['gluten'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Review batch 2: pungent (katu) vipaka confirmed as the preferable reading for a Charaka-based dataset, though authorities differ and sweet is also attested.',
    },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  // ── Legumes ───────────────────────────────────────────────────────────────
  uradDal: {
    id: 'uradDal',
    name: 'Urad dal',
    sanskrit: 'Masha',
    devanagari: 'माष',
    aliases: ['black gram', 'black lentil', 'urad', 'dal makhani'],
    category: 'legume',
    rasa: ['sweet'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['heavy', 'oily', 'unctuous'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    bestTime: ['midday'],
    whyFavor:
      'The heaviest and most building of the pulses — genuinely nourishing and strengthening where mung is light and recovering.',
    whyAvoid: 'Heating and heavy: it adds to both Pitta and Kapha, and is slow to digest in quantity.',
    preparation:
      'Long-cooked to make the heaviness manageable. That changes how the food is experienced, not its intrinsic properties — the ratings above already describe the dal itself.',
    balancedBy: ['asafoetida', 'gingerFresh', 'cumin', 'blackPepper'],
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  chickpea: {
    id: 'chickpea',
    name: 'Chickpea',
    sanskrit: 'Chanaka',
    devanagari: 'चणक',
    aliases: ['chana', 'garbanzo', 'kichererbse', 'besan', 'gram flour', 'hummus'],
    category: 'legume',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'rough'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    bestTime: ['midday'],
    whyFavor: 'Dry and astringent — settles Pitta and reduces Kapha without heaviness.',
    whyAvoid:
      'Although classically light (laghu), its pronounced dry (ruksha) and rough (khara) qualities make it Vata-provoking and commonly associated with flatulence — the dryness is the reason, not heaviness.',
    preparation:
      'Soaking well, cooking thoroughly and adding enough unctuousness plus digestive spices is the standard way to make it tolerable for Vata.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  // ── Dairy ─────────────────────────────────────────────────────────────────
  milk: {
    id: 'milk',
    name: 'Cow’s milk',
    sanskrit: 'Kshira',
    devanagari: 'क्षीर',
    aliases: ['milch', 'dairy milk', 'whole milk', 'doodh'],
    category: 'dairy',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'oily', 'soft'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    bestTime: ['evening'],
    whyFavor:
      'Sweet, cooling and nourishing — Charaka treats milk as one of the most building of foods, and it settles both Vata and Pitta.',
    whyAvoid: 'Heavy and oily, so it reliably increases Kapha and congestion.',
    preparation:
      'Traditionally taken warm and spiced (cardamom, ginger, turmeric) rather than cold — warming it is held to make it markedly easier to digest.',
    combosToAvoid: [
      'fish',
      'sour substances, including sour fruit',
      'salt',
      'yoghurt (later tradition — not one of Charaka’s canonical incompatible pairs)',
    ],
    cautions: ['lactose_intolerance'],
    cautionNote:
      'Lactose intolerance is a modern physiological caution, not a classical one — but it overrides everything above for someone who has it.',
    allergens: ['dairy'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Review batch 2: fish, sour substances and salt are the canonical viruddha pairs (Sutrasthana 26). Milk with yoghurt is widely taught but is NOT one of Charaka’s canonical examples, and is labelled as later tradition in the list above.',
    },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  buttermilk: {
    id: 'buttermilk',
    name: 'Buttermilk',
    sanskrit: 'Takra',
    devanagari: 'तक्र',
    aliases: ['chaas', 'chhaas', 'lassi', 'buttermilch', 'thin yoghurt drink'],
    category: 'dairy',
    rasa: ['sour', 'astringent'],
    virya: 'heating',
    vipaka: 'sour',
    guna: ['light', 'dry'],
    doshaEffect: { vata: -1, pitta: 0, kapha: -1 },
    bestTime: ['midday'],
    whyFavor:
      'Light and astringent where yoghurt is heavy — classically the remedy for weak digestion, and one of the few dairy foods that reduces rather than builds Kapha.',
    preparation:
      'Churned and diluted with water, the butter removed. That dilution is what separates takra from yoghurt; undiluted yoghurt does not behave this way.',
    cautions: ['lactose_intolerance'],
    allergens: ['dairy'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Review batch 2: Pitta-neutral accepted. The SOUR VIPAKA is the least certain field here — sources are less uniform on takra than on milk or yoghurt, so it is defensible but not settled. Note also that classical takra is a CLASS of preparations varying by how much butter was removed, how much water was added and how long it was churned; this entry models the general case, not commercial cultured buttermilk specifically.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  butter: {
    id: 'butter',
    name: 'Butter',
    sanskrit: 'Navanita',
    devanagari: 'नवनीत',
    aliases: ['butter', 'makhan', 'unsalted butter'],
    category: 'dairy',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'oily', 'soft'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    whyFavor: 'Cooling and nourishing, gentler than ghee on Pitta and softening for Vata.',
    whyAvoid: 'Heavy and oily — increases Kapha, more so than ghee.',
    allergens: ['dairy'],
    source: {
      text: 'modern',
      note: 'Classical navanita is FRESH butter churned from curd, minimally processed, usually unsalted and eaten fresh. Supermarket butter is pasteurised, stored for weeks, often salted and industrially processed. Ayurveda weighs freshness and processing heavily, so this is not a trivial difference. Rated on the classical properties of fresh butter, with confidence held at medium because the everyday Western product differs.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  hardCheese: {
    id: 'hardCheese',

    name: 'Hard cheese',
    aliases: ['cheese', 'käse', 'kaese', 'gouda', 'cheddar', 'emmental', 'parmesan'],
    category: 'dairy',
    rasa: ['sweet', 'sour'],
    virya: 'heating',
    vipaka: 'sour',
    guna: ['heavy', 'oily', 'dense'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    bestTime: ['midday'],
    whyAvoid:
      'Dense, oily and fermented — among the heaviest foods for Kapha, and the sourness of ageing adds heat to Pitta.',
    cautions: ['lactose_intolerance'],
    cautionNote:
      'Rennet varies and this generic entry cannot tell you which you have. Traditional Parmigiano Reggiano, and many cheddar and gouda styles, are set with animal (slaughter-derived) rennet and are therefore not vegetarian; a great many modern hard cheeses use microbial or vegetable rennet and are. Worth checking the label if that matters to you — we deliberately do not exclude hard cheese wholesale for vegetarians, because most of it now qualifies.',
    allergens: ['dairy'],
    source: {
      text: 'modern',
      note: 'Derived from fermented-dairy principles; no direct analogue exists in the classical texts, which know fresh curd, buttermilk and ghee but not months-matured rennet cheese. Sour rasa from ageing, dense and oily guna.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Sweeteners ────────────────────────────────────────────────────────────
  honey: {
    id: 'honey',
    dietTags: ['animal_derived'],
    name: 'Honey',
    sanskrit: 'Madhu',
    devanagari: 'मधु',
    aliases: ['honig', 'shahad', 'raw honey'],
    category: 'sweetener',
    rasa: ['sweet', 'astringent'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['light', 'dry', 'scraping'],
    doshaEffect: { vata: 1, pitta: 0, kapha: -1 },
    bestTime: ['morning'],
    whyFavor:
      'The one sweet food that reduces Kapha rather than building it — light, dry and scraping, which is why it is the classical sweetener where sweetness would otherwise be a problem.',
    whyAvoid: 'The dryness can aggravate Vata in quantity.',
    preparation:
      'Never heated or cooked. Charaka is unusually emphatic here — among the strongest and most consistently transmitted food-processing prohibitions in the canon — and it is the one rule in this dataset stated as a prohibition rather than a preference. Two caveats: the reasoning is Ayurvedic (changed qualities, difficult digestion, production of ama), NOT a modern toxicological claim; and the texts give no precise temperature threshold, so familiar rules like “never above 40°C” are later interpretation rather than anything Charaka states.',
    combosToAvoid: [
      'equal parts ghee by weight (viruddha ahara, Sutrasthana 26)',
      'hot water',
      'cooking or baking',
    ],
    cautions: ['infant_under_1'],
    cautionNote:
      'The infant caution is modern (botulism risk), not classical, and is absolute — it is a safety flag, not an Ayurvedic one.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Review batch 2: the prohibition on heating honey is confirmed classical and emphatic, and the equal-parts-ghee incompatibility is confirmed as genuine viruddha ahara (Sutrasthana 26) — unlike ghee\u2019s yogavahi attribution, which review rejected. Virya is traditionally debated; heating is the common modern reading rather than a settled classical one.',
    },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  jaggery: {
    id: 'jaggery',
    name: 'Jaggery',
    sanskrit: 'Guda',
    devanagari: 'गुड',
    aliases: ['gur', 'gud', 'palm sugar', 'unrefined cane sugar', 'rohrzucker'],
    category: 'sweetener',
    rasa: ['sweet'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    bestSeason: ['winter'],
    whyFavor: 'Warming and building — settles Vata in a way refined sugar does not.',
    whyAvoid: 'Heavy and heating: it adds to both Pitta and Kapha.',
    preparation:
      'Classical note: aged jaggery (purana guda) is considered lighter and more digestible than freshly made jaggery (nava guda), which is heavier and more Kapha-promoting. The ratings above describe jaggery in general.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  // ── Oils ──────────────────────────────────────────────────────────────────
  sesameOil: {
    id: 'sesameOil',
    name: 'Sesame oil',
    sanskrit: 'Tila taila',
    devanagari: 'तिल तैल',
    aliases: ['til oil', 'gingelly oil', 'sesamöl', 'sesamoel'],
    category: 'oil',
    rasa: ['sweet', 'bitter', 'astringent'],
    virya: 'heating',
    vipaka: 'sweet',
    // Review batch 2: Kapha corrected 0 → +1. Reasoning that the penetrating
    // quality offsets the heaviness was too clever — it is still an oil.
    guna: ['heavy', 'oily', 'subtle_penetrating'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    bestSeason: ['autumn', 'winter'],
    whyFavor:
      'Charaka treats sesame as the foremost of the oils — warming, subtle and penetrating (suksma, the quality that lets it carry effects into the deeper tissues), and the standard oil for settling Vata, internally and for massage.',
    whyAvoid: 'Heating, so it adds to Pitta in summer or in an already-hot state.',
    allergens: ['sesame'],
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  oliveOil: {
    id: 'oliveOil',
    name: 'Olive oil',
    aliases: ['olivenöl', 'olivenoel', 'extra virgin olive oil'],
    category: 'oil',
    rasa: ['sweet', 'astringent'],
    virya: 'neutral',
    vipaka: 'sweet',
    guna: ['oily', 'heavy'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    whyFavor: 'Oily and smooth, so it softens Vata dryness without the heat of sesame.',
    whyAvoid: 'Oily and heavy, so it adds to Kapha.',
    source: {
      text: 'modern',
      note: 'No classical Ayurvedic attribution exists for olive oil. Derived from properties: sweet and mildly astringent rasa, unctuous guna, neither notably heating nor cooling. Uses the neutral virya added in batch 1.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Spices ────────────────────────────────────────────────────────────────
  blackPepper: {
    id: 'blackPepper',
    name: 'Black pepper',
    sanskrit: 'Maricha',
    devanagari: 'मरिच',
    aliases: ['pepper', 'black pepper', 'kali mirch', 'pfeffer', 'peppercorn'],
    category: 'spice',
    rasa: ['pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'sharp'],
    doshaEffect: { vata: 1, pitta: 1, kapha: -1 },
    whyFavor: 'Sharp and penetrating — kindles digestion and cuts Kapha and congestion.',
    whyAvoid: 'Distinctly heating and drying: it adds to Pitta and, in quantity, to Vata.',
    cautions: ['acid_reflux'],
    cautionNote: 'Practical and symptom-based, not a classical contraindication.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  turmeric: {
    id: 'turmeric',
    // Rhizome, so it follows the same plant-part rule as ginger. Signed off in
    // review batch 2 for consistency with that precedent.
    name: 'Turmeric',
    sanskrit: 'Haridra',
    devanagari: 'हरिद्रा',
    aliases: ['haldi', 'kurkuma', 'curcuma'],
    category: 'spice',
    rasa: ['bitter', 'astringent', 'pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: 1, kapha: -1 },
    whyFavor: 'Bitter and drying — classically used to clear Kapha and to purify.',
    whyAvoid: 'Drying and heating in quantity, so it can aggravate Vata and Pitta.',
    preparation: 'Culinary amounts cooked into fat behave far more gently than large doses.',
    cautionNote:
      'We describe traditional use only. Turmeric is heavily marketed with modern therapeutic claims — this dataset makes none of them.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Haridra’s rasa, virya and vipaka are classically described. The DOSHA SCORES — Vata +1 especially — are synthesised from those qualities and are NOT dosha assignments quoted from Charaka. Read the properties as classical and the weighting as derived.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  cumin: {
    id: 'cumin',
    name: 'Cumin',
    sanskrit: 'Jiraka',
    devanagari: 'जीरक',
    aliases: ['jeera', 'zeera', 'kreuzkümmel', 'kreuzkuemmel'],
    category: 'spice',
    // Review batch 2: rasa gains bitter (katu + tikta), and Vata corrected
    // −1 → 0. A pungent, heating, drying spice does not pacify Vata; the
    // classical use for bloating justifies "not aggravating", not "settling".
    rasa: ['pungent', 'bitter'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: 1, kapha: -1 },
    whyFavor:
      'Kindles digestion and relieves bloating — gentle enough among the pungent spices not to unsettle Vata the way pepper does.',
    whyAvoid: 'Heating, so it adds to Pitta.',
    source: {
      text: 'modern',
      note: 'Jiraka is a classical substance, but its complete energetic profile is synthesised from the broader Ayurvedic tradition rather than enumerated in Sutrasthana 27 — so no verse is cited for it here.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  corianderSeed: {
    id: 'corianderSeed',
    name: 'Coriander seed',
    sanskrit: 'Dhanyaka',
    devanagari: 'धान्यक',
    aliases: ['dhania', 'koriander', 'cilantro seed', 'ground coriander'],
    category: 'spice',
    // Review batch 2: was drafted sweet/bitter/astringent, light/oily and
    // tridoshic (−1/−1/−1). Corrected to kashaya + tikta, laghu + ruksha, and
    // Vata 0 — the tridoshic claim was the strongest this schema can make and
    // it did not survive review. Dry spices do not pacify Vata.
    rasa: ['astringent', 'bitter'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 },
    whyFavor:
      'Unusual among digestive spices in being cooling — it supports digestion without adding heat, which is why it suits Pitta where cumin and pepper do not.',
    source: {
      text: 'modern',
      note: 'Dhanyaka is a classical substance, but its complete energetic profile is synthesised from the broader Ayurvedic tradition rather than enumerated in Sutrasthana 27 — so no verse is cited for it here.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  fennel: {
    id: 'fennel',
    name: 'Fennel seed',
    sanskrit: 'Mishreya',
    devanagari: 'मिश्रेया',
    aliases: ['saunf', 'fenchel', 'fennel tea'],
    category: 'spice',
    rasa: ['sweet', 'pungent', 'bitter'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light', 'oily'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 },
    bestTime: ['midday', 'evening'],
    whyFavor:
      'Settles digestion and wind while staying cooling — the reason it is chewed after meals and given as a mild after-dinner tea.',
    source: {
      text: 'modern',
      note: 'Fennel appears in Ayurvedic tradition but is less prominent in the Charaka corpus than cumin or coriander. Rated on properties and consistent traditional use rather than a specific citation.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  cardamom: {
    id: 'cardamom',
    name: 'Cardamom',
    sanskrit: 'Ela',
    devanagari: 'एला',
    aliases: ['elaichi', 'ilaichi', 'kardamom', 'green cardamom'],
    category: 'spice',
    rasa: ['pungent', 'sweet'],
    // Ela is classically SHEETA (cooling) despite being an aromatic pungent
    // spice — kept on the strength of the classical description, not derivation.
    virya: 'cooling',
    // Review batch 4: vipaka pungent → sweet; guna dry → aromatic; and the
    // tridoshic -1/-1/-1 corrected to V0/P-1/K-1 — the same over-claim rejected
    // for coriander. Cooling, digestive and Kapha-reducing without overstating
    // its ability to pacify Vata.
    vipaka: 'sweet',
    guna: ['light', 'aromatic'],
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 },
    whyFavor:
      'Aromatic and digestive without being heating — which is why it is the spice added to milk and to sweet dishes rather than to a hot curry.',
    source: {
      text: 'modern',
      note: 'Ela is a classical substance, but as with cumin and coriander the complete energetic profile is synthesised from the broader tradition rather than enumerated in Sutrasthana 27. ⚠ The tridoshic -1/-1/-1 is the strongest claim this schema makes, and batch 2 rejected exactly that claim for coriander — it needs the same scrutiny here.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  asafoetida: {
    id: 'asafoetida',
    name: 'Asafoetida',
    sanskrit: 'Hingu',
    devanagari: 'हिङ्गु',
    aliases: ['hing', 'heeng', 'asant'],
    category: 'spice',
    rasa: ['pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'oily', 'sharp'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor:
      'The classical answer to gas and bloating — a pinch in cooking is what makes heavy legumes digestible, which is why it appears wherever dal does.',
    whyAvoid: 'Sharp and heating: it adds to Pitta.',
    preparation: 'Always cooked briefly in fat first; raw, it is harsh.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  garlic: {
    id: 'garlic',
    dietTags: ['allium'],
    name: 'Garlic',
    sanskrit: 'Lashuna',
    devanagari: 'लशुन',
    aliases: ['lehsun', 'knoblauch', 'raw garlic'],
    category: 'spice',
    rasa: ['pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['heavy', 'oily', 'sharp', 'penetrating'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    bestSeason: ['winter'],
    whyFavor: 'Strongly warming and penetrating — settles Vata and cuts Kapha.',
    whyAvoid: 'Markedly heating; it aggravates Pitta more than most spices.',
    cautionNote:
      'Excluded by several dietary patterns this app supports (Jain, no-onion-garlic, and much yogic/sattvic practice, which treats it as agitating for the mind rather than harmful to the body). That is a pattern exclusion, not a health caution — and the common claim that “Ayurveda discourages garlic” is historically inaccurate. The avoidance comes from yogic and spiritual discipline, not from Charaka, who treats it as a valuable food.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Lashuna is classical and its heating, Vata-pacifying, Kapha-reducing character is consensus. The sattvic/yogic objection is a separate tradition from Charaka and is recorded as a pattern exclusion, not a classical property.',
    },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  // Review batch 2: split from a single `onion` entry. Cooking changes onion's
  // qualities more than it does most foods — the raw pungency gives way to
  // sweetness and heaviness — and a single row could only average the two,
  // which described neither. Same reasoning as the gingerFresh/gingerDry split.
  onionRaw: {
    id: 'onionRaw',
    name: 'Onion (raw)',
    sanskrit: 'Palandu',
    devanagari: 'पलाण्डु',
    aliases: ['pyaz', 'zwiebel', 'raw onion', 'salad onion', 'red onion'],
    category: 'vegetable',
    dietTags: ['allium'],
    rasa: ['sweet', 'pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['heavy', 'slightly_unctuous', 'sharp'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 0 },
    whyAvoid:
      'Raw, the pungency dominates and it is sharply heating — the form most likely to aggravate Pitta.',
    cautionNote: 'Excluded by Jain and no-onion-garlic patterns, as for garlic.',
    source: {
      text: 'modern',
      note: 'Palandu is named classically but characterised less consistently than lashuna, and the raw/cooked distinction is derived rather than stated in the corpus.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  onionCooked: {
    id: 'onionCooked',
    name: 'Onion (cooked)',
    sanskrit: 'Palandu',
    devanagari: 'पलाण्डु',
    aliases: ['onion', 'onions', 'fried onion', 'sautéed onion', 'gebratene zwiebel', 'onion masala', 'pyaz'],
    category: 'vegetable',
    dietTags: ['allium'],
    rasa: ['sweet', 'pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['heavy', 'oily', 'soft'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    whyFavor: 'Cooked, the sweetness dominates and it becomes grounding for Vata.',
    whyAvoid:
      'Still heating for Pitta, though milder than raw, and its softened heaviness feeds Kapha.',
    preparation:
      'Slow-cooking is what softens the pungency into sweetness. The longer it cooks, the further it moves from the raw profile.',
    cautionNote: 'Excluded by Jain and no-onion-garlic patterns, as for garlic.',
    source: {
      text: 'modern',
      note: 'Palandu is named classically but characterised less consistently than lashuna, and the raw/cooked distinction is derived rather than stated in the corpus.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Vegetables & fruit ────────────────────────────────────────────────────
  potato: {
    id: 'potato',
    // Nightshade — recorded as an avoidance PREFERENCE, not an allergen.
    // It was briefly an allergen, which was a category error: solanaceae is a
    // plant family, and labelling it an allergy overstates a preference as a
    // medical constraint in the UI.
    dietTags: ['root', 'nightshade'],
    name: 'Potato',
    aliases: ['aloo', 'kartoffel', 'potatoes', 'mashed potato'],
    category: 'vegetable',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: 1 },
    whyAvoid:
      'Dry and gas-forming for Vata, heavy for Kapha. Its cooling sweetness does suit Pitta.',
    preparation:
      'Preparation shifts this noticeably: boiled or steamed sits closest to the profile above; roasted or baked is drier and so more Vata-provoking; mashed with butter or ghee is the least Vata-provoking, as the fat offsets the dryness. Deep-fried is a different food again and is not covered by this entry.',
    source: {
      text: 'modern',
      note: 'A New World crop, so necessarily absent from the classical corpus. Derived from properties: sweet and astringent rasa, dry and heavy guna, cooling.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  spinach: {
    id: 'spinach',
    name: 'Spinach',
    sanskrit: 'Palakya',
    devanagari: 'पालक्य',
    aliases: ['palak', 'spinat', 'saag'],
    category: 'vegetable',
    rasa: ['astringent', 'sweet'],
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'rough'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    whyFavor: 'Light, cooling and astringent — suits Pitta heat and Kapha heaviness.',
    whyAvoid: 'Rough and drying, so it unsettles Vata, particularly raw.',
    preparation:
      'Cooked with ghee and spices rather than eaten raw makes it far friendlier to Vata.',
    source: {
      text: 'modern',
      note: 'Leafy greens as a class are described classically as astringent, light and drying, but the specific identification of palakya with modern spinach is not secure. Rated on the class properties.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // Review batch 2: split. Stewing does not merely soften apple's effect on
  // Vata, it REVERSES it — and a `preparation` note on one row cannot carry a
  // sign flip, because the dosha chips at the top of the screen would still
  // say "increases Vata" while the note underneath said the opposite.
  apple: {
    id: 'apple',
    name: 'Apple (raw)',
    aliases: ['apfel', 'seb', 'apples', 'raw apple'],
    category: 'fruit',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light', 'dry', 'rough'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    bestTime: ['morning'],
    bestSeason: ['autumn'],
    whyFavor: 'Light, cooling and astringent — settles Pitta and does not add to Kapha.',
    whyAvoid: 'Raw, the roughness and astringency aggravate Vata.',
    preparation: 'See “Apple (stewed)” — cooking reverses the Vata effect rather than softening it.',
    source: {
      text: 'modern',
      note: 'Not identifiable in the classical corpus. Derived from properties: sweet and astringent rasa, light and rough guna, cooling.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  appleStewed: {
    id: 'appleStewed',
    name: 'Apple (stewed)',
    aliases: ['stewed apple', 'apple compote', 'apfelmus', 'baked apple', 'cooked apple'],
    category: 'fruit',
    rasa: ['sweet', 'astringent'],
    virya: 'neutral',
    vipaka: 'sweet',
    guna: ['soft', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 },
    bestTime: ['morning'],
    bestSeason: ['autumn', 'winter'],
    whyFavor:
      'Warm, soft and moist — stewing substantially changes the energetics, making apple mildly Vata-pacifying rather than Vata-aggravating.',
    preparation: 'Stewed warm with cinnamon or cardamom; the spices add to the warming effect.',
    source: {
      text: 'modern',
      note: 'Not in the classical corpus. Derived from the raw apple profile plus the standard effect of cooking with moisture and warming spice: dryness and roughness give way to softness.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Nuts ──────────────────────────────────────────────────────────────────
  almond: {
    id: 'almond',
    name: 'Almond',
    sanskrit: 'Badama',
    devanagari: 'बादाम',
    aliases: ['badam', 'mandel', 'almonds'],
    category: 'nut_seed',
    rasa: ['sweet'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    bestTime: ['morning'],
    whyFavor: 'Oily, sweet and building — one of the standard foods for settling and nourishing Vata.',
    whyAvoid: 'Heating and heavy, so it adds to Pitta and Kapha.',
    preparation:
      'Traditionally soaked overnight and peeled. The skin is held to be the irritating and hard-to-digest part, and soaking is treated as a requirement rather than a refinement.',
    allergens: ['nuts'],
    source: {
      text: 'modern',
      note: 'Almonds appear in later Ayurvedic and regional tradition more than in the Charaka corpus. Rated on properties and consistent traditional use; the soaking practice is well attested but not cited here.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  BATCH 4 — vegetables, drafted 2026-07-22. See docs/diet-review-batch-4.md.
  //
  //  Breadth batch. Batch 3 review found two dishes misrepresented because
  //  spinach was the only vegetable we had: a "mixed vegetable soup" that was
  //  really a spinach soup (removed), and a "sabzi" that was really spinach
  //  (made generic). This is the set that fixes both.
  //
  //  Two standing rules from earlier reviews are applied throughout:
  //    • A dry or pungent food does NOT pacify Vata. "Doesn't aggravate" is a
  //      0, and that is usually the honest answer.
  //    • Claim a Charaka citation only where the food is named in the corpus
  //      AND the specific property is what the text says. Most of these are
  //      New World crops or unidentifiable, so most are 'modern' / medium.
  //
  //  RAW VS COOKED is the recurring question here, more than in any previous
  //  batch. Where cooking merely softens the effect, one entry carries a
  //  `preparation` note. Where it FLIPS a dosha sign, the entry is split —
  //  the apple/appleStewed precedent, since dosha chips cannot show a sign
  //  that contradicts the note underneath them.
  // ═══════════════════════════════════════════════════════════════════════════

  carrot: {
    id: 'carrot',
    name: 'Carrot',
    aliases: ['gajar', 'karotte', 'möhre', 'moehre', 'carrots'],
    category: 'vegetable',
    dietTags: ['root'],
    rasa: ['sweet', 'astringent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: 1, kapha: -1 },
    bestTime: ['midday'],
    preparation:
      'Cooked with a little fat suits Vata; raw and grated is drier and harder work. The ratings describe it cooked.',
    whyFavor: 'Sweet and light — reduces Kapha without the heaviness of most sweet vegetables.',
    whyAvoid: 'Mildly heating, so it adds to Pitta in quantity.',
    source: {
      text: 'modern',
      note: 'Not securely identifiable in the classical corpus. Derived from properties: sweet with an astringent edge, light, mildly warming.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  beetroot: {
    id: 'beetroot',
    name: 'Beetroot',
    aliases: ['chukandar', 'rote bete', 'beet', 'beets'],
    category: 'vegetable',
    dietTags: ['root'],
    rasa: ['sweet'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['heavy', 'oily'],
    // Review batch 4: Kapha 0 → +1. Warmth doesn't offset the heaviness of a
    // heavy sweet root — the same "too clever" move corrected on sesame oil.
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    bestSeason: ['autumn', 'winter'],
    preparation: 'Cooked rather than raw — raw beetroot is markedly harder to digest.',
    whyFavor: 'Sweet, warming and grounding — settles Vata.',
    whyAvoid: 'Distinctly heating and heavy; it adds to both Pitta and Kapha.',
    source: {
      text: 'modern',
      note: 'Absent from the classical corpus. Derived from properties: strongly sweet, heavy, warming.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // Review batch 4: renamed pumpkin → ash gourd. Classical Kushmanda is
  // Benincasa hispida (ash gourd / winter melon), NOT the New World Cucurbita
  // that "pumpkin" evokes — so the Charaka citation belongs to ash gourd, and
  // the Cucurbita aliases were removed to stop the misread. A separate derived
  // pumpkin entry can be added later if wanted.
  ashGourd: {
    id: 'ashGourd',
    name: 'Ash gourd',
    sanskrit: 'Kushmanda',
    devanagari: 'कूष्माण्ड',
    aliases: ['winter melon', 'wax gourd', 'white pumpkin', 'petha', 'kushmanda'],
    category: 'vegetable',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'soft', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    bestSeason: ['autumn'],
    whyFavor:
      'Sweet, soft and cooling — one of the gentlest vegetables, and settling for both Vata and Pitta.',
    whyAvoid: 'Heavy and moist, so it adds to Kapha.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Kushmanda is classical and identified as ash gourd (Benincasa hispida), not modern pumpkin. Rated on the classical description of a sweet, cooling, heavy gourd.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  bottleGourd: {
    id: 'bottleGourd',
    name: 'Bottle gourd',
    sanskrit: 'Alabu',
    devanagari: 'अलाबु',
    aliases: ['lauki', 'ghiya', 'dudhi', 'calabash', 'flaschenkürbis'],
    category: 'vegetable',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    // Review batch 4: guna corrected light/moist → heavy/dry, to match how
    // Charaka actually characterises Alabu. The dosha neutrality now emerges
    // from those opposing classical qualities rather than modern intuition.
    guna: ['heavy', 'dry'],
    doshaEffect: { vata: 0, pitta: -1, kapha: 0 },
    bestSeason: ['summer'],
    whyFavor:
      'Cooling and settling for Pitta — the standard vegetable for convalescence and hot weather.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Alabu is classically named as heavy and dry; the near-neutral dosha weighting follows from those opposing qualities rather than being quoted.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  okra: {
    id: 'okra',
    name: 'Okra',
    aliases: ['bhindi', 'ladies finger', 'okraschoten', 'lady finger'],
    category: 'vegetable',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'sweet',
    // Review batch 4: 'slimy' → 'picchila', keeping the quality inside the
    // classical guna vocabulary rather than a purely modern descriptor.
    guna: ['light', 'picchila'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    preparation:
      'Cooked dry with spices; the characteristic sliminess is what makes it soothing for Vata and what makes it heavy for Kapha.',
    whyFavor: 'Soft and mucilaginous — soothing to the gut lining, and settling for Vata and Pitta.',
    whyAvoid: 'The same sliminess adds to Kapha.',
    source: {
      text: 'modern',
      note: 'Not clearly identifiable in the corpus. Derived from properties: sweet and astringent, cooling, notably mucilaginous.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  cabbage: {
    id: 'cabbage',
    name: 'Cabbage',
    aliases: ['patta gobhi', 'kohl', 'weißkohl', 'weisskohl', 'white cabbage'],
    category: 'vegetable',
    rasa: ['astringent', 'sweet'],
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'rough'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    preparation:
      'Cooked with oil and warming spices; raw or lightly cooked it is notably gas-forming.',
    whyFavor: 'Light, dry and astringent — reduces both Pitta heat and Kapha heaviness.',
    whyAvoid: 'Rough, drying and gas-forming: among the harder vegetables for Vata.',
    // Review batch 4: made symmetric with cauliflower — the brassica family
    // shares the same default balancing spices.
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: {
      text: 'modern',
      note: 'Absent from the classical corpus. Derived from the brassica pattern: astringent, light, dry, cooling, gas-forming.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  cauliflower: {
    id: 'cauliflower',
    name: 'Cauliflower',
    aliases: ['gobhi', 'phool gobhi', 'blumenkohl'],
    category: 'vegetable',
    rasa: ['astringent', 'sweet'],
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'rough'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    preparation: 'Well cooked with asafoetida, cumin and ginger; the same brassica caveat as cabbage.',
    whyFavor: 'Light and astringent — suits Pitta and Kapha.',
    whyAvoid: 'Drying and gas-forming, so it unsettles Vata.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: {
      text: 'modern',
      note: 'Absent from the classical corpus. Derived from the brassica pattern, as cabbage.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  greenBeans: {
    id: 'greenBeans',
    name: 'Green beans',
    aliases: ['french beans', 'grüne bohnen', 'gruene bohnen', 'string beans'],
    category: 'vegetable',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light', 'soft_when_cooked'],
    doshaEffect: { vata: 0, pitta: -1, kapha: 0 },
    whyFavor:
      'Mild and easy — one of the few vegetables that is close to neutral for everyone, which is why it suits a mixed household.',
    preparation: 'Cooked soft rather than crisp.',
    source: {
      text: 'modern',
      note: 'Absent from the classical corpus. Derived from properties: sweet, mildly astringent, light and cooling. The near-neutral rating is deliberate — this is a mild food and claiming otherwise would overstate it.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  peas: {
    id: 'peas',
    name: 'Green peas',
    aliases: ['matar', 'erbsen', 'garden peas'],
    category: 'vegetable',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    preparation:
      'This profile is for FRESH green peas and intentionally follows the legume/pulse pattern because of their drying, gas-forming tendency. Cooked with fat and spices offsets the dryness for Vata. Dried peas would warrant a separate, heavier profile.',
    whyFavor: 'Light and astringent, cooling for Pitta and drying for Kapha.',
    whyAvoid: 'Dry and gas-forming, as legumes tend to be — unsettling for Vata.',
    source: {
      text: 'modern',
      note: 'Derived from properties. Peas sit between vegetable and pulse; the dryness and gas-forming tendency follow the pulse pattern.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Nightshades ───────────────────────────────────────────────────────────
  // All three carry the `nightshade` tag, which is a PREFERENCE (no_nightshade),
  // never an allergen — batch 2 corrected that category error.
  tomatoRaw: {
    id: 'tomatoRaw',
    name: 'Tomato (raw)',
    aliases: ['tamatar', 'tomate', 'raw tomato', 'salad tomato'],
    category: 'vegetable',
    dietTags: ['nightshade'],
    rasa: ['sour', 'sweet'],
    virya: 'heating',
    vipaka: 'sour',
    guna: ['light', 'moist'],
    // Review batch 4: Kapha +1 → 0. Cooking's real transition is Vata; raw
    // tomato is sour and heating (aggravating Vata and Pitta) but not a
    // Kapha-building food.
    doshaEffect: { vata: 1, pitta: 1, kapha: 0 },
    whyAvoid:
      'Sour and heating — it aggravates both Vata and Pitta raw, which is why it is traditionally eaten cooked and spiced.',
    cautions: ['acid_reflux'],
    cautionNote: 'Practical and symptom-based, not a classical contraindication.',
    source: {
      text: 'modern',
      note: 'A New World crop, necessarily absent from the classical corpus. Derived from properties: pronounced sourness, heating, light.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  tomatoCooked: {
    id: 'tomatoCooked',
    name: 'Tomato (cooked)',
    aliases: ['tomato', 'tomatoes', 'tomato curry', 'passata', 'tomatensoße', 'tomato sauce', 'cooked tomato'],
    category: 'vegetable',
    dietTags: ['nightshade'],
    rasa: ['sour', 'sweet'],
    virya: 'heating',
    vipaka: 'sour',
    guna: ['light', 'oily'],
    doshaEffect: { vata: 0, pitta: 1, kapha: 0 },
    preparation:
      'Cooked down with fat and spices. Split from the raw entry because cooking moves Vata and Kapha from aggravating to neutral — a sign change a preparation note cannot carry.',
    whyAvoid: 'Still sour and heating, so Pitta is unchanged by cooking.',
    cautions: ['acid_reflux'],
    cautionNote: 'Practical and symptom-based, not a classical contraindication.',
    source: {
      text: 'modern',
      note: 'A New World crop. Derived from the raw profile plus the standard effect of cooking with fat: the rawness and sharpness soften, the sourness does not.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  aubergine: {
    id: 'aubergine',
    name: 'Aubergine',
    sanskrit: 'Vartaka',
    devanagari: 'वार्ताक',
    aliases: ['baingan', 'brinjal', 'eggplant', 'aubergine'],
    category: 'vegetable',
    dietTags: ['nightshade'],
    rasa: ['pungent', 'astringent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: 1, kapha: -1 },
    whyFavor: 'Light and warming — reduces Kapha.',
    whyAvoid: 'Heating and pungent, so it adds to Pitta.',
    // Review batch 4: this profile assumes COOKED aubergine — frying or cooking
    // with oil/ghee substantially moderates the drying tendency, which is why
    // it is not rated more Vata-provoking. It also absorbs a lot of fat, which
    // changes how heavy the dish becomes.
    preparation:
      'Roasted or cooked with oil, which moderates its drying tendency; it absorbs a great deal of fat, so the dish can become heavy.',
    source: {
      text: 'modern',
      note: 'Vartaka is named in later Ayurvedic literature more than in the Charaka corpus, and the identification is not certain. Rated on properties.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Cooling / salad vegetables ────────────────────────────────────────────
  cucumber: {
    id: 'cucumber',
    name: 'Cucumber',
    sanskrit: 'Trapusha',
    devanagari: 'त्रपुष',
    aliases: ['kheera', 'gurke', 'salatgurke'],
    category: 'vegetable',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'moist'],
    // Review batch 4: Vata +1 → 0. The moist, sweet, heavy qualities offset
    // the cooling, so cooling alone shouldn't drive it Vata-aggravating.
    doshaEffect: { vata: 0, pitta: -1, kapha: 1 },
    bestSeason: ['summer'],
    bestTime: ['midday'],
    whyFavor: 'Markedly cooling and watery — one of the best foods for summer Pitta.',
    whyAvoid: 'Cold, watery and heavy: it adds to Kapha, and is poor food in cold weather.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Trapusha is classically named and its cooling character is consensus. The Vata and Kapha weightings are synthesised from the cold, watery quality rather than quoted.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // Review batch 4: split. Classical sources treat tender and mature radish
  // very differently — the tender form is mild, the mature aggravates all three
  // doshas — and a single row could only describe one.
  radishTender: {
    id: 'radishTender',
    name: 'Radish (tender)',
    sanskrit: 'Mulaka',
    devanagari: 'मूलक',
    aliases: ['radish', 'mooli', 'young radish', 'radieschen', 'red radish'],
    category: 'vegetable',
    dietTags: ['root'],
    rasa: ['pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'sharp'],
    doshaEffect: { vata: 0, pitta: 1, kapha: -1 },
    preparation: 'Young and cooked is the gentle form Charaka treats favourably.',
    whyFavor: 'Sharp, light and penetrating — cuts Kapha and stimulates a dull appetite.',
    whyAvoid: 'Pungent and heating: it adds to Pitta.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Mulaka is classical, and the tradition explicitly treats the tender form as the wholesome one. This entry is the tender radish.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  radishMature: {
    id: 'radishMature',
    name: 'Radish (mature)',
    sanskrit: 'Mulaka',
    devanagari: 'मूलक',
    aliases: ['daikon', 'large radish', 'white radish', 'rettich', 'old radish'],
    category: 'vegetable',
    dietTags: ['root'],
    rasa: ['pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['heavy', 'dry', 'sharp'],
    doshaEffect: { vata: 1, pitta: 1, kapha: 1 },
    preparation: 'Cooking with fat modifies the effect, and drying changes it again.',
    whyAvoid:
      'The mature root is classically held to aggravate all three doshas — harsher than the tender form in every direction.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Charaka states plainly that large, mature radish aggravates all three doshas; the tridoshic rating reflects the text rather than a derivation.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Fruit ─────────────────────────────────────────────────────────────────
  banana: {
    id: 'banana',
    name: 'Banana',
    sanskrit: 'Kadali',
    devanagari: 'कदली',
    aliases: ['kela', 'banane', 'ripe banana'],
    category: 'fruit',
    rasa: ['sweet'],
    // ⚠ The field to check. Classical sources give banana a SOUR vipaka
    // despite its sweet taste — counter-intuitive, and the opposite of what
    // property-derivation alone would suggest.
    vipaka: 'sour',
    virya: 'cooling',
    guna: ['heavy', 'moist', 'soft'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    whyFavor: 'Sweet, heavy and grounding — settling for Vata.',
    whyAvoid: 'Heavy and moist, so it adds to Kapha. Its sour post-digestive effect makes it less benign for Pitta than the sweet taste suggests.',
    combosToAvoid: ['milk (later Ayurvedic tradition — not verified in Charaka)'],
    source: {
      text: 'modern',
      note: 'Review batch 4: downgraded from a Charaka citation. Kadali\u2019s SOUR vipaka and the banana-with-milk incompatibility are both later-tradition (Sushruta / later compendia), not verified in Charaka. The sour vipaka is retained on that basis; the milk pairing is labelled as later tradition in the list above.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  pomegranate: {
    id: 'pomegranate',
    name: 'Pomegranate (sweet)',
    sanskrit: 'Dadima',
    devanagari: 'दाडिम',
    aliases: ['anar', 'granatapfel', 'pomegranate seeds'],
    category: 'fruit',
    rasa: ['sweet', 'astringent', 'sour'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light'],
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 },
    whyFavor:
      'Light, astringent and cooling — classically among the most highly regarded fruits, and unusual in suiting Pitta and Kapha at once.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Dadima is strongly attested and classically praised. Note the sweet variety is the one described; sour pomegranate is treated differently and is not covered by this entry.',
    },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  grapes: {
    id: 'grapes',
    name: 'Grapes',
    sanskrit: 'Draksha',
    devanagari: 'द्राक्षा',
    aliases: ['angoor', 'trauben', 'raisins', 'kishmish', 'sultanas'],
    category: 'fruit',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    whyFavor:
      'Sweet, cooling and moistening — Charaka rates draksha among the best of the fruits, and it settles both Vata and Pitta.',
    whyAvoid: 'Heavy and sweet, so it adds to Kapha.',
    preparation: 'Profile assumes ripe, sweet grapes; unripe or very sour grapes differ.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  mangoRipe: {
    id: 'mangoRipe',
    name: 'Mango (ripe)',
    sanskrit: 'Amra',
    devanagari: 'आम्र',
    aliases: ['aam', 'mango', 'ripe mango'],
    category: 'fruit',
    rasa: ['sweet'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    bestSeason: ['summer'],
    whyFavor: 'Sweet, heavy and building — settling for Vata and classically regarded as strengthening.',
    whyAvoid: 'Heavy and sweet: it adds to Kapha, and in quantity its warmth tells on Pitta.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Ripe amra is classical. ⚠ The virya is the contested field: ripe mango is commonly described as heating, yet also as settling rather than aggravating Pitta, which sits awkwardly together. Drafted heating with Pitta neutral; worth a decision.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  lemon: {
    id: 'lemon',
    name: 'Lemon',
    sanskrit: 'Nimbuka',
    devanagari: 'निम्बुक',
    aliases: ['nimbu', 'zitrone', 'lime', 'lemon juice'],
    category: 'fruit',
    rasa: ['sour'],
    virya: 'heating',
    vipaka: 'sour',
    guna: ['light', 'sharp'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'Sour and light — stimulates a dull appetite and cuts Kapha, and a squeeze settles Vata.',
    whyAvoid: 'Sour and heating: it adds to Pitta.',
    cautions: ['acid_reflux'],
    cautionNote: 'Practical and symptom-based, not a classical contraindication.',
    source: {
      text: 'modern',
      note: 'Citrus is named in later Ayurvedic literature more than in the Charaka corpus. Rated on properties and consistent traditional use.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  BATCH 5 — the comprehensiveness batch, drafted 2026-07-23. 31 entries.
  //  See docs/diet-review-batch-5.md. Purpose: a base wide enough to build real
  //  meals on, before batch 6 (templates). Emphasis unchanged — Indian staples
  //  + common German/Western foods.
  //
  //  The biggest gap this fills is the DALS: the dataset had only mung and urad,
  //  so no everyday Indian meal could be composed. Toor, masoor and chana are
  //  the three most-eaten, plus paneer, the common vegetables and the everyday
  //  spices.
  //
  //  Standing rules carried from every prior review, applied at draft time:
  //    • a dry or pungent food does NOT pacify Vata — "doesn't aggravate" is 0
  //    • claim a CS citation only where the food is named in the corpus AND the
  //      property is what the text says; otherwise 'modern' / medium
  //    • don't let one quality outweigh several in the dosha score
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Legumes ─────────────────────────────────────────────────────────────────
  toorDal: {
    id: 'toorDal',
    name: 'Toor dal',
    sanskrit: 'Adhaki',
    devanagari: 'आढकी',
    aliases: ['arhar', 'pigeon pea', 'tuvar', 'tur dal', 'split pigeon pea'],
    category: 'legume',
    rasa: ['astringent', 'sweet'],
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    bestTime: ['midday'],
    whyFavor: 'The everyday dal — light, astringent, cooling for Pitta and drying for Kapha.',
    whyAvoid: 'Dry and gas-forming, as pulses are, so it unsettles Vata without help.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  masoorDal: {
    id: 'masoorDal',
    name: 'Masoor dal',
    sanskrit: 'Masura',
    devanagari: 'मसूर',
    aliases: ['red lentil', 'pink lentil', 'split red lentil'],
    category: 'legume',
    rasa: ['sweet', 'astringent'],
    // ⚠ virya to check — Masura is described HEATING by some authorities and
    // cooling by others. Drafted heating (the more common reading), which is
    // unusual for a pulse and worth confirming.
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: 1, kapha: -1 },
    bestTime: ['midday'],
    whyFavor: 'Quick-cooking and light — reduces Kapha.',
    whyAvoid: 'Dry, and if heating, adds to Pitta as well as unsettling Vata.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Masura is classical. Virya is described inconsistently in later Ayurvedic sources; this profile follows the heating interpretation.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  chanaDal: {
    id: 'chanaDal',
    name: 'Chana dal',
    sanskrit: 'Chanaka',
    devanagari: 'चणक',
    aliases: ['split bengal gram', 'split chickpea', 'gram dal'],
    category: 'legume',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'rough'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    bestTime: ['midday'],
    whyFavor: 'The split form of chickpea — dry, astringent, settling Pitta and reducing Kapha.',
    whyAvoid: 'Notably gas-forming and drying; the hardest of the common dals for Vata.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Same classical substance as whole chickpea (Chanaka); split and skinned it is a touch easier.',
    },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  rajma: {
    id: 'rajma',
    name: 'Kidney beans',
    aliases: ['rajma', 'red kidney beans', 'kidneybohnen'],
    category: 'legume',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    // vipaka added at review — inferred (derived), following the pulse pattern.
    vipaka: 'pungent',
    guna: ['heavy', 'dry'],
    doshaEffect: { vata: 1, pitta: 0, kapha: 1 },
    bestTime: ['midday'],
    whyAvoid: 'Heavy AND dry — slow to digest, gas-forming for Vata and heavy for Kapha.',
    preparation: 'Soaked overnight and cooked very thoroughly with warming spices; under-cooked it is hard work.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh'],
    source: {
      text: 'modern',
      note: 'A New World bean, absent from the classical corpus. Derived: heavy, dry, gas-forming — heavier than the classical pulses.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  peanut: {
    id: 'peanut',
    name: 'Peanut',
    aliases: ['groundnut', 'moongphali', 'erdnuss'],
    category: 'legume',
    rasa: ['sweet'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    whyFavor: 'Oily and building — grounding for Vata.',
    whyAvoid: 'Heating and heavy: it adds to both Pitta and Kapha, and is slow to digest.',
    allergens: ['peanuts'],
    source: {
      text: 'modern',
      note: 'A New World legume, not in the classical corpus. Derived from properties: sweet, oily, heavy, warming.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Dairy ───────────────────────────────────────────────────────────────────
  paneer: {
    id: 'paneer',
    name: 'Paneer',
    aliases: ['fresh cheese', 'indian cottage cheese', 'chhena'],
    category: 'dairy',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'oily', 'dense'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    bestTime: ['midday'],
    whyFavor: 'Fresh, unaged and cooling — grounding and building for Vata, gentler than aged cheese for Pitta.',
    whyAvoid: 'Dense and heavy, so it adds to Kapha and is slow to digest in quantity.',
    allergens: ['dairy'],
    cautions: ['lactose_intolerance'],
    source: {
      text: 'modern',
      note: 'Fresh acid-set cheese; the classical corpus knows curd and buttermilk but not paneer specifically. Derived from fresh-dairy properties.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Grains ──────────────────────────────────────────────────────────────────
  brownRice: {
    id: 'brownRice',
    name: 'Brown rice',
    aliases: ['whole rice', 'wholegrain rice', 'vollkornreis'],
    category: 'grain',
    rasa: ['sweet'],
    virya: 'neutral',
    vipaka: 'sweet',
    guna: ['heavy', 'dry'],
    doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    bestTime: ['midday'],
    whyFavor: 'The whole grain keeps its bran — more substantial and slower-releasing than white rice.',
    whyAvoid: 'Heavier and drier than white rice, so it adds to Kapha and needs more chewing.',
    source: {
      text: 'modern',
      note: 'Classical shali is polished white rice. Brown rice is derived: the retained bran makes it heavier, drier and slower than the classical grain.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  semolina: {
    id: 'semolina',
    name: 'Semolina',
    aliases: ['suji', 'sooji', 'rava', 'grieß', 'griess', 'cream of wheat'],
    category: 'grain',
    rasa: ['sweet'],
    virya: 'neutral',
    vipaka: 'sweet',
    guna: ['light', 'soft_when_cooked'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 0 },
    bestTime: ['morning'],
    whyFavor: 'Coarse wheat, quick to cook soft — lighter than whole wheat and easy on Vata.',
    source: {
      text: 'modern',
      note: 'Derived from wheat (Godhuma): coarsely milled and de-branned, so lighter than the whole grain.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  flattenedRice: {
    id: 'flattenedRice',
    name: 'Flattened rice',
    aliases: ['poha', 'pauwa', 'beaten rice', 'flaked rice', 'chira'],
    category: 'grain',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: -1, kapha: 0 },
    bestTime: ['morning'],
    whyFavor: 'Pre-cooked and pressed rice — among the lightest and easiest grains, a classic gentle breakfast.',
    preparation: 'Rinsed and briefly cooked; it needs almost no digesting.',
    source: {
      text: 'modern',
      note: 'A rice product rather than a classical grain in its own right. Derived: lighter and drier than cooked rice.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  pearlMillet: {
    id: 'pearlMillet',
    name: 'Pearl millet',
    sanskrit: 'Bajra',
    devanagari: 'बाजरा',
    aliases: ['bajra', 'bajri', 'perlhirse', 'millet'],
    category: 'grain',
    rasa: ['sweet', 'astringent'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: 1, kapha: -1 },
    bestSeason: ['winter'],
    whyFavor: 'Light, dry and warming — the classic winter grain for reducing Kapha.',
    whyAvoid: 'Dry and heating, so it unsettles Vata and adds to Pitta; poor food in summer.',
    source: {
      text: 'modern',
      note: 'Profile derived from later Ayurvedic and traditional usage rather than a direct classical food monograph — millets sit more in regional than Charaka tradition. Light, dry, warming.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Vegetables ──────────────────────────────────────────────────────────────
  sweetPotato: {
    id: 'sweetPotato',
    name: 'Sweet potato',
    aliases: ['shakarkandi', 'süßkartoffel', 'suesskartoffel'],
    category: 'vegetable',
    dietTags: ['root'],
    rasa: ['sweet'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    whyFavor: 'Sweet, warming and grounding — settling for Vata where ordinary potato is drying.',
    whyAvoid: 'Heavy and sweet, so it adds to Kapha.',
    source: {
      text: 'modern',
      note: 'A New World tuber, absent from the corpus. Derived: sweet, heavy, mildly warming.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  broccoli: {
    id: 'broccoli',
    name: 'Broccoli',
    aliases: ['brokkoli', 'hari gobhi'],
    category: 'vegetable',
    rasa: ['astringent', 'sweet'],
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'rough'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    preparation: 'Cooked with oil and warming spices; raw or lightly steamed it is gas-forming.',
    whyFavor: 'Light, dry and astringent — settles Pitta and reduces Kapha.',
    whyAvoid: 'Rough and gas-forming, so it unsettles Vata.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: {
      text: 'modern',
      note: 'A brassica absent from the classical corpus. Rated on the brassica pattern, as cabbage and cauliflower.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  zucchini: {
    id: 'zucchini',
    name: 'Zucchini',
    aliases: ['courgette', 'zucchini', 'summer squash', 'turai'],
    category: 'vegetable',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light', 'moist'],
    doshaEffect: { vata: 0, pitta: -1, kapha: 0 },
    bestSeason: ['summer'],
    whyFavor: 'Light, watery and cooling — an easy summer vegetable that suits Pitta and does not weigh on Kapha.',
    source: {
      text: 'modern',
      note: 'A summer squash, not classically identified. Derived: sweet, light, cooling, watery — close to the gourd pattern.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  bellPepper: {
    id: 'bellPepper',
    name: 'Bell pepper',
    aliases: ['capsicum', 'shimla mirch', 'paprika', 'sweet pepper'],
    category: 'vegetable',
    dietTags: ['nightshade'],
    rasa: ['pungent', 'sweet'],
    virya: 'heating',
    vipaka: 'pungent',
    // Review: guna moist (watery), not dry.
    guna: ['light', 'moist'],
    doshaEffect: { vata: 0, pitta: 1, kapha: -1 },
    whyFavor: 'Light and mildly pungent — reduces Kapha.',
    whyAvoid: 'A nightshade, warming and slightly drying, so it adds to Pitta.',
    source: {
      text: 'modern',
      note: 'A New World nightshade, absent from the corpus. Derived: mildly pungent, light, warming.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  greenChili: {
    id: 'greenChili',
    name: 'Green chilli',
    aliases: ['hari mirch', 'green chili', 'chilli', 'grüne chili'],
    category: 'spice',
    dietTags: ['nightshade'],
    rasa: ['pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'sharp'],
    doshaEffect: { vata: 0, pitta: 1, kapha: -1 },
    whyFavor: 'Sharp and stimulating — kindles a dull appetite and cuts Kapha.',
    whyAvoid: 'Strongly heating: it aggravates Pitta, and in quantity dries and unsettles Vata.',
    cautions: ['acid_reflux'],
    cautionNote: 'Practical and symptom-based, not a classical contraindication.',
    source: {
      text: 'modern',
      note: 'Chilli is a New World plant, absent from the classical corpus (classical heat came from pepper and ginger). Derived: sharply pungent and heating.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  mushroom: {
    id: 'mushroom',
    name: 'Mushroom',
    aliases: ['khumbi', 'pilz', 'champignon', 'button mushroom'],
    category: 'vegetable',
    rasa: ['sweet', 'astringent'],
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['heavy', 'moist'],
    doshaEffect: { vata: 1, pitta: 0, kapha: 1 },
    preparation: 'Cooked well with warming spices; it holds a lot of water.',
    whyAvoid: 'Heavy, moist and cooling — slow to digest, unsettling for Vata and adding to Kapha.',
    source: {
      text: 'modern',
      note: 'Classical texts treat fungi with caution and do not characterise culinary mushrooms clearly. Derived, and held at medium.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  corianderLeaf: {
    id: 'corianderLeaf',
    name: 'Coriander leaf',
    aliases: ['cilantro', 'hara dhania', 'fresh coriander', 'koriandergrün'],
    category: 'spice',
    rasa: ['astringent', 'bitter'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light'],
    doshaEffect: { vata: 0, pitta: -1, kapha: 0 },
    whyFavor: 'Fresh, light and cooling — the standard finishing herb, and one of the few that soothes Pitta.',
    source: {
      text: 'modern',
      note: 'The fresh leaf of Dhanyaka. Milder and more cooling than the seed; rated on properties.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  curryLeaf: {
    id: 'curryLeaf',
    name: 'Curry leaf',
    sanskrit: 'Surabhinimba',
    devanagari: 'सुरभिनिम्ब',
    aliases: ['kadi patta', 'meetha neem', 'curry patta'],
    category: 'spice',
    rasa: ['bitter', 'pungent', 'astringent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: 0, kapha: -1 },
    whyFavor: 'Aromatic and digestive — tempered into oil at the start of a dish to kindle digestion and cut Kapha.',
    source: {
      text: 'modern',
      note: 'Present in regional and later Ayurvedic use more than in the Charaka corpus. Rated on properties.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Fruit ───────────────────────────────────────────────────────────────────
  orange: {
    id: 'orange',
    name: 'Orange',
    aliases: ['santra', 'orange', 'apfelsine', 'mandarin'],
    category: 'fruit',
    rasa: ['sweet', 'sour'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light', 'moist'],
    // Review: rated fully neutral — sweet, sour and light balance out.
    doshaEffect: { vata: 0, pitta: 0, kapha: 0 },
    bestTime: ['morning'],
    whyFavor: 'Sweet-sour, juicy and refreshing — gentle and near-neutral across the doshas.',
    whyAvoid: 'A very sour one can tell on Pitta.',
    source: {
      text: 'modern',
      note: 'Sweet citrus sits in later tradition more than the Charaka corpus. Derived from properties.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  coconut: {
    id: 'coconut',
    name: 'Coconut',
    sanskrit: 'Narikela',
    devanagari: 'नारिकेल',
    aliases: ['nariyal', 'kokosnuss', 'fresh coconut'],
    category: 'fruit',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    bestSeason: ['summer'],
    whyFavor: 'Sweet, oily and cooling — Charaka regards Narikela as strengthening, and it settles both Vata and Pitta.',
    whyAvoid: 'Heavy and oily, so it adds to Kapha.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  papaya: {
    id: 'papaya',
    name: 'Papaya',
    aliases: ['papita', 'papaya', 'pawpaw'],
    category: 'fruit',
    rasa: ['sweet'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'Ripe, sweet and warming — aids digestion and, unusually for a sweet fruit, does not add to Kapha.',
    whyAvoid: 'Warming, so ripe papaya can tell on Pitta.',
    cautions: ['pregnancy'],
    cautionNote: 'Unripe/green papaya is traditionally avoided in pregnancy; a practical caution, flagged not diagnosed.',
    source: {
      text: 'modern',
      note: 'A New World fruit, absent from the corpus. Derived: sweet, warming, light, digestive.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  dates: {
    id: 'dates',
    name: 'Dates',
    sanskrit: 'Kharjura',
    devanagari: 'खर्जूर',
    aliases: ['khajur', 'datteln', 'medjool'],
    category: 'fruit',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    bestTime: ['morning'],
    whyFavor: 'Sweet, heavy and building — Charaka ranks Kharjura among the restorative fruits, settling Vata and Pitta.',
    whyAvoid: 'Heavy and sweet, so it adds to Kapha.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  amla: {
    id: 'amla',
    name: 'Amla',
    sanskrit: 'Amalaki',
    devanagari: 'आमलकी',
    aliases: ['indian gooseberry', 'amalaki', 'nellikai'],
    category: 'fruit',
    rasa: ['sour', 'astringent', 'sweet', 'bitter', 'pungent'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['light', 'dry'],
    // ⚠ Tridoshic — but unlike the coriander claim we rejected, amla's
    // three-dosha balancing IS classically attested (a foremost rasayana,
    // especially Pitta-pacifying). Drafted as attested; flagged to confirm the
    // Vata -1 specifically, since a dry food pacifying Vata is the exception.
    doshaEffect: { vata: -1, pitta: -1, kapha: -1 },
    whyFavor: 'Foremost of the rasayana (rejuvenative) fruits — cooling, five-tasted, and classically held to balance all three doshas, Pitta most of all.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Amalaki is strongly attested and genuinely tridoshic in the classical texts — the rare case where the three-dosha claim is the tradition\'s, not a derivation. The sour taste (not the dryness) carries the Vata pacification.',
    },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  watermelon: {
    id: 'watermelon',
    name: 'Watermelon',
    aliases: ['tarbooz', 'wassermelone', 'melon'],
    category: 'fruit',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'moist'],
    doshaEffect: { vata: 0, pitta: -1, kapha: 1 },
    bestSeason: ['summer'],
    bestTime: ['midday'],
    whyFavor: 'Cooling and watery — one of the best foods for summer Pitta and heat.',
    whyAvoid: 'Heavy and watery, so it adds to Kapha, and it sits poorly with other foods — best eaten alone.',
    combosToAvoid: ['other foods in the same meal'],
    source: {
      text: 'modern',
      note: 'Not securely classical. Derived: sweet, cooling, heavy, watery.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Spices ──────────────────────────────────────────────────────────────────
  cinnamon: {
    id: 'cinnamon',
    name: 'Cinnamon',
    sanskrit: 'Twak',
    devanagari: 'त्वक्',
    aliases: ['dalchini', 'zimt', 'cassia'],
    category: 'spice',
    rasa: ['pungent', 'sweet', 'astringent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'Warming and sweet-pungent — settles Vata and cuts Kapha, a gentle everyday warming spice.',
    whyAvoid: 'Heating, so it adds to Pitta in quantity.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  clove: {
    id: 'clove',
    name: 'Clove',
    sanskrit: 'Lavanga',
    devanagari: 'लवङ्ग',
    aliases: ['laung', 'nelke', 'cloves'],
    category: 'spice',
    rasa: ['pungent', 'bitter'],
    // ⚠ virya to check — Lavanga is unusual: pungent yet classically often
    // described COOLING (sheeta). Drafted cooling on that basis; flag, as it
    // contradicts what a pungent spice would derive to.
    virya: 'cooling',
    vipaka: 'pungent',
    guna: ['light', 'sharp'],
    doshaEffect: { vata: 0, pitta: 0, kapha: -1 },
    whyFavor: 'Sharp and aromatic — a strong digestive and breath-freshener that cuts Kapha.',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Lavanga is classical. The COOLING virya is the field to confirm — it is the classical description but contradicts the pungent taste.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  mustardSeed: {
    id: 'mustardSeed',
    name: 'Mustard seed',
    sanskrit: 'Sarshapa',
    devanagari: 'सर्षप',
    aliases: ['rai', 'sarson', 'senf', 'black mustard'],
    category: 'spice',
    rasa: ['pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'oily', 'sharp'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'Sharp and warming — popped in hot oil to open a dish, it kindles digestion and cuts Kapha.',
    whyAvoid: 'Strongly heating: it aggravates Pitta.',
    allergens: ['mustard'],
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  fenugreekSeed: {
    id: 'fenugreekSeed',
    name: 'Fenugreek seed',
    sanskrit: 'Methika',
    devanagari: 'मेथिका',
    aliases: ['methi', 'methi seeds', 'bockshornklee'],
    category: 'spice',
    rasa: ['bitter', 'pungent'],
    virya: 'heating',
    vipaka: 'pungent',
    guna: ['light', 'dry', 'unctuous'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'Bitter and warming — kindles digestion and cuts Kapha; classically valued for the mother after childbirth.',
    whyAvoid: 'Heating and bitter, so it adds to Pitta and, in quantity, can be drying.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  tamarind: {
    id: 'tamarind',
    name: 'Tamarind',
    sanskrit: 'Amlika',
    devanagari: 'अम्लिका',
    aliases: ['imli', 'tamarinde', 'tamarind paste'],
    category: 'spice',
    rasa: ['sour'],
    virya: 'heating',
    vipaka: 'sour',
    guna: ['heavy'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    whyFavor: 'Sour and warming — its sourness settles Vata and lifts a flat dish.',
    whyAvoid: 'Sour and heating: it adds to Pitta, and its heaviness to Kapha.',
    cautions: ['acid_reflux'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Amlika is classical and its sour, heating character is consensus.',
    },
    reviewStatus: 'reviewed',
    confidence: 'high',
  },

  // ── Oils ────────────────────────────────────────────────────────────────────
  coconutOil: {
    id: 'coconutOil',
    name: 'Coconut oil',
    aliases: ['nariyal tel', 'kokosöl', 'kokosoel'],
    category: 'oil',
    rasa: ['sweet'],
    virya: 'cooling',
    vipaka: 'sweet',
    guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    bestSeason: ['summer'],
    whyFavor: 'The one cooling cooking oil — settling for Vata and Pitta, and the traditional oil for the hot south and for summer.',
    whyAvoid: 'Heavy and oily, so it adds to Kapha.',
    source: {
      text: 'modern',
      note: 'Derived from coconut (Narikela): sweet, cooling, unctuous — the cooling counterpart to warming sesame oil.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ── Nuts ────────────────────────────────────────────────────────────────────
  cashew: {
    id: 'cashew',
    name: 'Cashew',
    aliases: ['kaju', 'cashewnuss', 'cashew nut'],
    category: 'nut_seed',
    rasa: ['sweet'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    whyFavor: 'Sweet, oily and building — grounding for Vata.',
    whyAvoid: 'Heating and heavy: it adds to Pitta and Kapha.',
    allergens: ['nuts'],
    source: {
      text: 'modern',
      note: 'A New World nut, absent from the corpus. Derived: sweet, oily, heavy, warming.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  walnut: {
    id: 'walnut',
    name: 'Walnut',
    sanskrit: 'Akshota',
    devanagari: 'अक्षोट',
    aliases: ['akhrot', 'walnuss'],
    category: 'nut_seed',
    rasa: ['sweet', 'astringent'],
    virya: 'heating',
    vipaka: 'sweet',
    guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    bestSeason: ['autumn', 'winter'],
    whyFavor: 'Oily and warming — grounding and building for Vata, a good winter nut.',
    whyAvoid: 'Heating and heavy: it adds to Pitta and Kapha.',
    allergens: ['nuts'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27',
      note: 'Akshota is named among the classical nuts; oily, warming, building character is consensus.',
    },
    reviewStatus: 'reviewed',
    confidence: 'medium',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  BATCH 6 — the big breadth batch, drafted 2026-07-24. 44 entries. See
  //  docs/diet-review-batch-6.md. Rounds the dataset out to a genuinely
  //  comprehensive base: more protein (incl. the first animal foods, for
  //  non-veg users the safety layer already supports), millets, everyday
  //  greens and fruit, the remaining common spices, seeds, oils and teas.
  //
  //  Standing rules unchanged (dry/pungent ≠ pacify Vata; CS only when named
  //  in the corpus AND the property attested; don't let one quality outweigh
  //  several). Animal foods sit in category 'animal' so the vegetarian/vegan
  //  patterns exclude them automatically.
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Legumes & protein ───────────────────────────────────────────────────────
  tofu: {
    id: 'tofu', name: 'Tofu', aliases: ['bean curd', 'soya paneer', 'sojaquark'],
    category: 'legume', rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet',
    guna: ['heavy', 'moist'], doshaEffect: { vata: 1, pitta: -1, kapha: 1 },
    whyFavor: 'Soft, cooling and building — a settling protein for Pitta.',
    whyAvoid: 'Heavy and a touch gas-forming: it adds to Vata and Kapha unless well spiced.',
    allergens: ['soy'],
    source: { text: 'modern', note: 'Soy is absent from the classical corpus. Derived: sweet, cooling, heavy, moist.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  besan: {
    id: 'besan', name: 'Gram flour', aliases: ['besan', 'chickpea flour', 'kichererbsenmehl'],
    category: 'legume', rasa: ['astringent', 'sweet'], virya: 'cooling', vipaka: 'pungent',
    guna: ['light', 'dry', 'rough'], doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    whyFavor: 'Ground chickpea — dry and astringent, reducing Pitta and Kapha.',
    whyAvoid: 'Drying and gas-forming for Vata, as chickpea is.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Milled chickpea (Chanaka); inherits the classical whole-food profile — processing changes digestibility, not energetics.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  blackEyedPeas: {
    id: 'blackEyedPeas', name: 'Black-eyed peas', aliases: ['lobia', 'chawli', 'cowpea', 'augenbohnen'],
    category: 'legume', rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'pungent',
    guna: ['light', 'dry'], doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    whyFavor: 'Lighter than most beans — reduces Kapha and settles Pitta.',
    whyAvoid: 'Dry and gas-forming for Vata.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: { text: 'modern', note: 'Derived from the pulse pattern: light, dry, astringent.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  wholeMung: {
    id: 'wholeMung', name: 'Whole mung bean', sanskrit: 'Mudga', devanagari: 'मुद्ग',
    aliases: ['green gram', 'sabut moong', 'mung bean'], category: 'legume',
    rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    whyFavor: 'The whole form of the best of pulses — light and easy, the same as the split dal with its skin on.',
    whyAvoid: 'The skin makes it a touch heavier and more gas-forming than split mung.',
    preparation: 'Soaked and well cooked; the skin needs longer than the split dal.',
    balancedBy: ['ghee', 'cumin', 'gingerFresh', 'asafoetida'],
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Same classical substance (Mudga) as mung dal, unsplit; skin-on so slightly heavier and slower than split mung.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  brownLentil: {
    id: 'brownLentil', name: 'Brown lentil', aliases: ['whole masoor', 'green lentil', 'braune linsen', 'sabut masoor'],
    category: 'legume', rasa: ['astringent', 'sweet'], virya: 'heating', vipaka: 'pungent',
    guna: ['heavy', 'dry'], doshaEffect: { vata: 1, pitta: 1, kapha: -1 },
    whyAvoid: 'Whole and skin-on — heavier and drier than the split red lentil, harder on Vata.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: { text: 'modern', note: 'The whole form of Masura; heavier than the split. Virya heating, as for masoor.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // ── Grains ──────────────────────────────────────────────────────────────────
  fingerMillet: {
    id: 'fingerMillet', name: 'Finger millet', sanskrit: 'Nartaka', devanagari: 'नर्तक',
    aliases: ['ragi', 'nachni', 'fingerhirse'], category: 'grain',
    rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: 0 },
    whyFavor: 'Substantial and cooling — a grounding grain that suits Pitta and hot weather.',
    whyAvoid: 'Heavy and dry, so it can unsettle Vata.',
    source: { text: 'modern', note: 'Derived from later/regional tradition rather than a classical monograph. Virya adopted as cooling (the more commonly cited reading), retained at medium confidence.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  sorghum: {
    id: 'sorghum', name: 'Sorghum', aliases: ['jowar', 'jwari', 'great millet', 'mohrenhirse'],
    category: 'grain', rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet',
    guna: ['light', 'dry'], doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    whyFavor: 'Light, dry and cooling — reduces Kapha and suits Pitta.',
    whyAvoid: 'Drying, so it unsettles Vata.',
    source: { text: 'modern', note: 'Derived from regional tradition. Light, dry, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  quinoa: {
    id: 'quinoa', name: 'Quinoa', aliases: ['quinoa'], category: 'grain',
    rasa: ['sweet', 'astringent'], virya: 'heating', vipaka: 'sweet', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: 0, kapha: -1 },
    whyFavor: 'Light and mildly warming — reduces Kapha; a good protein-rich grain.',
    whyAvoid: 'Light and dry, so it can aggravate Vata without enough fat.',
    balancedBy: ['ghee', 'cumin', 'gingerFresh'],
    source: { text: 'modern', note: 'A New World seed-grain, absent from the corpus. Derived: light, dry, mildly warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  corn: {
    id: 'corn', name: 'Corn', aliases: ['maize', 'makai', 'bhutta', 'mais', 'sweetcorn'],
    category: 'grain', rasa: ['sweet', 'astringent'], virya: 'heating', vipaka: 'sweet',
    guna: ['light', 'dry'], doshaEffect: { vata: 1, pitta: 1, kapha: -1 },
    whyFavor: 'Light, dry and warming — reduces Kapha; best in its own season.',
    whyAvoid: 'Dry and warming, so it unsettles Vata and adds to Pitta.',
    balancedBy: ['ghee', 'butter', 'cumin'],
    source: { text: 'modern', note: 'A New World crop, absent from the corpus. Derived: light, dry, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  pasta: {
    id: 'pasta', name: 'Pasta', aliases: ['noodles', 'nudeln', 'spaghetti', 'macaroni'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet', guna: ['heavy', 'dry'],
    doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    whyFavor: 'Soft and grounding when cooked — settling for Vata.',
    whyAvoid: 'Refined wheat, heavy and sticky, so it adds to Kapha.',
    allergens: ['gluten'],
    balancedBy: ['oliveOil', 'ghee', 'blackPepper'],
    source: { text: 'modern', note: 'Refined durum wheat; derived from wheat (Godhuma), heavier and stickier than the whole grain.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // ── Vegetables ──────────────────────────────────────────────────────────────
  kale: {
    id: 'kale', name: 'Kale', aliases: ['grünkohl', 'gruenkohl', 'curly kale'], category: 'vegetable',
    rasa: ['astringent', 'bitter'], virya: 'cooling', vipaka: 'pungent', guna: ['light', 'dry', 'rough'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    preparation: 'Cooked with oil and warming spices; raw it is rough and gas-forming.',
    whyFavor: 'Bitter, light and cooling — reduces both Pitta and Kapha.',
    whyAvoid: 'Rough and drying, so it unsettles Vata.',
    balancedBy: ['asafoetida', 'cumin', 'gingerFresh', 'ghee'],
    source: { text: 'modern', note: 'A brassica absent from the corpus. Rated on the brassica pattern.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  lettuce: {
    id: 'lettuce', name: 'Lettuce', aliases: ['salat', 'salad leaves', 'kopfsalat'], category: 'vegetable',
    rasa: ['sweet', 'bitter'], virya: 'cooling', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    whyFavor: 'Light, cooling and watery — good for summer Pitta.',
    whyAvoid: 'Raw, light and drying, so it can unsettle Vata and is poor food in cold weather.',
    balancedBy: ['oliveOil', 'ghee', 'blackPepper', 'cumin'],
    source: { text: 'modern', note: 'Not classically identified. Derived from leafy-green properties: light, cooling, astringent.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  leek: {
    id: 'leek', name: 'Leek', aliases: ['lauch', 'porree'], category: 'vegetable', dietTags: ['allium'],
    rasa: ['pungent', 'sweet'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'A milder allium — cooked, sweet and grounding for Vata, and it cuts Kapha.',
    whyAvoid: 'Warming, so it adds to Pitta. Excluded by Jain and no-onion-garlic patterns, like onion.',
    cautionNote: 'Pattern exclusion (allium), not a health caution.',
    source: { text: 'modern', note: 'An allium, characterised by analogy with onion: milder, cooked-sweet, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  asparagus: {
    id: 'asparagus', name: 'Asparagus', aliases: ['spargel'], category: 'vegetable',
    rasa: ['sweet', 'bitter', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 },
    whyFavor: 'Soft, cooling and gently moist — settles both Vata and Pitta, a rare balance.',
    source: { text: 'modern', note: 'Culinary asparagus (distinct from the classical Shatavari root/herb). Derived: sweet, cooling, soft.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  bitterGourd: {
    id: 'bitterGourd', name: 'Bitter gourd', sanskrit: 'Karavellaka', devanagari: 'कारवेल्लक',
    aliases: ['karela', 'bitter melon', 'bittermelone'], category: 'vegetable',
    rasa: ['bitter'], virya: 'cooling', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    whyFavor: 'Intensely bitter, light and cooling — the classic Kapha- and Pitta-reducing vegetable.',
    whyAvoid: 'Bitter and drying, so it aggravates Vata.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Karavellaka is classical; bitter, light, Kapha-reducing character is consensus.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  ridgeGourd: {
    id: 'ridgeGourd', name: 'Ridge gourd', aliases: ['turai', 'tori', 'luffa', 'schwammkürbis'],
    category: 'vegetable', rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: 0, pitta: -1, kapha: 0 },
    whyFavor: 'Light, watery and cooling — an easy everyday gourd, gentle on Pitta.',
    source: { text: 'modern', note: 'A gourd; derived on the light, cooling, watery gourd pattern.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  colocasia: {
    id: 'colocasia', name: 'Colocasia', aliases: ['taro', 'arbi', 'arvi', 'eddoe'],
    category: 'vegetable', dietTags: ['root'], rasa: ['sweet', 'astringent'], virya: 'heating',
    vipaka: 'sweet', guna: ['heavy', 'dry'], doshaEffect: { vata: 1, pitta: 1, kapha: 1 },
    whyAvoid: 'Heavy, dry and gas-forming — hard on Vata and heavy for Kapha.',
    preparation: 'Cooked well with ajwain, asafoetida and warming spices to make it digestible.',
    balancedBy: ['ajwain', 'asafoetida', 'gingerFresh', 'ghee', 'cumin'],
    source: { text: 'modern', note: 'A starchy tuber; derived: heavy, dry, gas-forming if not cooked with digestive spices.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  fenugreekLeaf: {
    id: 'fenugreekLeaf', name: 'Fenugreek leaf', aliases: ['methi', 'methi leaves', 'bockshornkleeblätter'],
    category: 'vegetable', rasa: ['bitter', 'astringent'], virya: 'heating', vipaka: 'pungent',
    guna: ['light', 'dry'], doshaEffect: { vata: 0, pitta: 0, kapha: -1 },
    whyFavor: 'Bitter, light and warming — a leafy green that kindles digestion and cuts Kapha.',
    balancedBy: ['ghee', 'cumin'],
    source: { text: 'modern', note: 'The leaf of Methika; milder than the seed. Bitter, light, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  mintLeaf: {
    id: 'mintLeaf', name: 'Mint', sanskrit: 'Phudina', devanagari: 'फुदीना',
    aliases: ['pudina', 'minze', 'peppermint', 'spearmint'], category: 'spice',
    rasa: ['pungent', 'bitter'], virya: 'cooling', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 },
    whyFavor: 'Cooling yet pungent — a refreshing digestive that settles Pitta and cuts Kapha.',
    source: { text: 'modern', note: 'Present in later/regional tradition. Cooling, light, digestive.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  plantain: {
    id: 'plantain', name: 'Raw banana', aliases: ['plantain', 'kachcha kela', 'cooking banana', 'kochbanane'],
    category: 'vegetable', rasa: ['astringent', 'sweet'], virya: 'cooling', vipaka: 'pungent',
    guna: ['heavy', 'dry'], doshaEffect: { vata: 1, pitta: -1, kapha: 0 },
    whyAvoid: 'Astringent, heavy and dry — quite different from the ripe fruit; can be constipating and gas-forming.',
    preparation: 'Cooked with warming spices; not eaten raw.',
    balancedBy: ['ghee', 'cumin', 'gingerFresh', 'blackPepper'],
    source: { text: 'modern', note: 'The unripe cooking fruit, treated as a starchy vegetable — a distinct astringent, dry profile driven by its unripe state, unlike ripe banana.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // ── Fruit ───────────────────────────────────────────────────────────────────
  pear: {
    id: 'pear', name: 'Pear', aliases: ['nashpati', 'birne'], category: 'fruit',
    rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: 0, pitta: -1, kapha: 0 },
    whyFavor: 'Light, cooling and astringent — settles Pitta and does not add to Kapha.',
    whyAvoid: 'Astringent and a touch rough, so it can unsettle Vata.',
    balancedBy: ['cinnamon', 'gingerFresh'],
    source: { text: 'modern', note: 'Not classically identified. Derived: sweet-astringent, light, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  peach: {
    id: 'peach', name: 'Peach', aliases: ['aadu', 'pfirsich'], category: 'fruit',
    rasa: ['sweet', 'sour'], virya: 'heating', vipaka: 'sour', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 0 },
    whyFavor: 'Sweet-sour and juicy — settling for Vata.',
    whyAvoid: 'Its sourness and warmth can tell on Pitta.',
    balancedBy: ['cardamom', 'cinnamon'],
    source: { text: 'modern', note: 'Not classically identified. Derived: sweet-sour, warming, juicy.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  guava: {
    id: 'guava', name: 'Guava', aliases: ['amrud', 'guave'], category: 'fruit',
    rasa: ['sweet', 'astringent', 'sour'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'rough'],
    doshaEffect: { vata: 1, pitta: -1, kapha: 0 },
    whyFavor: 'Sweet-astringent and cooling — settles Pitta.',
    whyAvoid: 'The seeds and astringency can unsettle Vata; best ripe.',
    balancedBy: ['gingerFresh', 'cumin'],
    source: { text: 'modern', note: 'Later/regional tradition. Derived: sweet-astringent, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  pineapple: {
    id: 'pineapple', name: 'Pineapple', aliases: ['ananas'], category: 'fruit',
    rasa: ['sweet', 'sour'], virya: 'heating', vipaka: 'sour', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'Sweet-sour and warming — a digestive fruit that settles Vata and cuts Kapha.',
    whyAvoid: 'Sour and heating, so a tart one tells on Pitta.',
    balancedBy: ['cinnamon'],
    source: { text: 'modern', note: 'A New World fruit. Derived: sweet-sour, warming, digestive.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  strawberry: {
    id: 'strawberry', name: 'Strawberry', aliases: ['erdbeere', 'berries'], category: 'fruit',
    rasa: ['sweet', 'sour'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: 0, pitta: 0, kapha: 0 },
    whyFavor: 'Sweet-sour, light and cooling — gentle and near-neutral, best fully ripe.',
    balancedBy: ['blackPepper', 'mintLeaf'],
    source: { text: 'modern', note: 'Not classically identified. Derived: sweet-sour, light, cooling — a mild fruit.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  fig: {
    id: 'fig', name: 'Fig', sanskrit: 'Anjira', devanagari: 'अञ्जीर',
    aliases: ['anjeer', 'feige'], category: 'fruit', rasa: ['sweet'], virya: 'cooling',
    vipaka: 'sweet', guna: ['heavy', 'moist'], doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    whyFavor: 'Sweet, soft and building — settles both Vata and Pitta, and gently laxative.',
    whyAvoid: 'Heavy and sweet, so it adds to Kapha.',
    balancedBy: ['cinnamon', 'gingerFresh'],
    source: { text: 'modern', note: 'Anjira appears in later tradition more than the Charaka corpus. Sweet, cooling, building.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  avocado: {
    id: 'avocado', name: 'Avocado', aliases: ['avocado', 'butterfrucht'], category: 'fruit',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    whyFavor: 'Rich, oily and cooling — deeply grounding for Vata and gentle on Pitta.',
    whyAvoid: 'Heavy and oily, so it adds to Kapha.',
    balancedBy: ['blackPepper', 'cumin', 'lemon'],
    source: { text: 'modern', note: 'A New World fruit. Derived: sweet, unctuous, cooling, heavy.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // ── Spices ──────────────────────────────────────────────────────────────────
  nutmeg: {
    id: 'nutmeg', name: 'Nutmeg', sanskrit: 'Jatiphala', devanagari: 'जातीफल',
    aliases: ['jaiphal', 'muskatnuss'], category: 'spice', rasa: ['pungent', 'bitter', 'astringent'],
    virya: 'heating', vipaka: 'pungent', guna: ['light', 'oily'], doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'Warming and grounding — settles Vata and, in a pinch at night, calms and aids sleep.',
    whyAvoid: 'Heating, so it adds to Pitta; potent, so a pinch is enough.',
    cautionNote: 'Traditional use in tiny culinary amounts only; large doses are intoxicating.',
    balancedBy: ['ghee', 'milk'],
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Jatiphala is classical; warming, grounding, calming character is consensus.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  bayLeaf: {
    id: 'bayLeaf', name: 'Bay leaf', sanskrit: 'Tejapatra', devanagari: 'तेजपत्र',
    aliases: ['tej patta', 'lorbeerblatt', 'indian bay leaf'], category: 'spice',
    rasa: ['pungent', 'sweet'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'Warm and aromatic — kindles digestion and settles Vata.',
    whyAvoid: 'Heating, so it adds to Pitta.',
    balancedBy: ['ghee'],
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Tejapatra is classical; warming, digestive character is consensus.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  ajwain: {
    id: 'ajwain', name: 'Carom seed', sanskrit: 'Yavani', devanagari: 'यवानी',
    aliases: ['ajwain', 'ajowan', 'carom', 'bishop’s weed'], category: 'spice',
    rasa: ['pungent', 'bitter'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry', 'sharp'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'The strongest of the everyday digestives — a pinch relieves gas and bloating and settles Vata.',
    whyAvoid: 'Sharply heating, so it adds to Pitta.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Yavani is classical; its powerful carminative, Vata-settling action is consensus.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  saffron: {
    id: 'saffron', name: 'Saffron', sanskrit: 'Kunkuma', devanagari: 'कुंकुम',
    aliases: ['kesar', 'zafran', 'safran'], category: 'spice', rasa: ['pungent', 'bitter', 'sweet'],
    virya: 'heating', vipaka: 'pungent', guna: ['light', 'oily'], doshaEffect: { vata: -1, pitta: -1, kapha: -1 },
    whyFavor: 'Prized and gently warming — classically held to balance all three doshas, and lend colour and calm.',
    cautions: ['pregnancy'],
    cautionNote: 'Large medicinal doses are traditionally cautioned in pregnancy; a pinch in food is the culinary norm.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Kunkuma is classical and traditionally described as tridoshic — attested, not derived (reviewed: published as attested, as with amla).' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  amchur: {
    id: 'amchur', name: 'Dry mango powder', aliases: ['amchur', 'amchoor', 'mango powder'],
    category: 'spice', rasa: ['sour', 'astringent'], virya: 'heating', vipaka: 'sour', guna: ['light', 'dry'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'Sour and tangy — brightens a dish and, being sour, settles Vata.',
    whyAvoid: 'Sour and warming, so it adds to Pitta.',
    cautions: ['acid_reflux'],
    balancedBy: ['corianderSeed', 'cumin'],
    source: { text: 'modern', note: 'Dried unripe mango; a processed souring agent. Sour, light, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // ── Oils ────────────────────────────────────────────────────────────────────
  mustardOil: {
    id: 'mustardOil', name: 'Mustard oil', sanskrit: 'Sarshapa taila', devanagari: 'सर्षप तैल',
    aliases: ['sarson ka tel', 'senföl', 'kachi ghani'], category: 'oil',
    rasa: ['pungent'], virya: 'heating', vipaka: 'pungent', guna: ['oily', 'sharp', 'penetrating'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    whyFavor: 'Sharp, warming and penetrating — the classic winter and northern oil, settling Vata and cutting Kapha.',
    whyAvoid: 'Strongly heating, so it adds to Pitta.',
    balancedBy: ['ghee'],
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Sarshapa taila is classical; pungent, heating, penetrating character is consensus.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  sunflowerOil: {
    id: 'sunflowerOil', name: 'Sunflower oil', aliases: ['sonnenblumenöl', 'sunflower'],
    category: 'oil', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet', guna: ['oily', 'light'],
    doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    whyFavor: 'Light and neutral — a mild everyday oil that softens Vata without much heat.',
    balancedBy: ['gingerFresh', 'blackPepper'],
    source: { text: 'modern', note: 'No classical attribution. Derived: sweet, unctuous, light, neither heating nor cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // ── Sweeteners ──────────────────────────────────────────────────────────────
  caneSugar: {
    id: 'caneSugar', name: 'Cane sugar', sanskrit: 'Sharkara', devanagari: 'शर्करा',
    aliases: ['sugar', 'white sugar', 'zucker', 'cheeni'], category: 'sweetener',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    whyFavor: 'Sweet and cooling — settles Vata and Pitta.',
    whyAvoid: 'Heavy and sweet, so it adds to Kapha; the refined form is the least wholesome of the sugars.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Sharkara is classical; sweet, cooling character is consensus. Refined white sugar is the modern, least-wholesome form.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },

  // ── Nuts & seeds ────────────────────────────────────────────────────────────
  pistachio: {
    id: 'pistachio', name: 'Pistachio', aliases: ['pista', 'pistazie'], category: 'nut_seed',
    rasa: ['sweet'], virya: 'heating', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 }, allergens: ['nuts'],
    whyFavor: 'Oily and building — grounding for Vata.',
    whyAvoid: 'Heating and heavy: it adds to Pitta and Kapha.',
    balancedBy: ['cardamom', 'fennel'],
    source: { text: 'modern', note: 'Later/regional tradition. Derived: sweet, oily, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  flaxSeed: {
    id: 'flaxSeed', name: 'Flax seed', sanskrit: 'Atasi', devanagari: 'अतसी',
    aliases: ['alsi', 'linseed', 'leinsamen'], category: 'nut_seed',
    rasa: ['sweet', 'astringent'], virya: 'heating', vipaka: 'pungent', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    whyFavor: 'Oily and warming — grounding for Vata, and gently laxative when ground.',
    whyAvoid: 'Heating and heavy, so it adds to Pitta and Kapha.',
    balancedBy: ['fennel', 'corianderSeed'],
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Atasi is classical; oily, warming character is consensus.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  sunflowerSeed: {
    id: 'sunflowerSeed', name: 'Sunflower seed', aliases: ['sonnenblumenkerne', 'surajmukhi'],
    category: 'nut_seed', rasa: ['sweet'], virya: 'heating', vipaka: 'sweet', guna: ['oily', 'light'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 0 },
    whyFavor: 'Light and oily — softens Vata.',
    whyAvoid: 'Mildly warming, so it can add to Pitta.',
    balancedBy: ['blackPepper', 'cumin'],
    source: { text: 'modern', note: 'A New World seed. Derived: sweet, oily, light, mildly warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  sesameSeed: {
    id: 'sesameSeed', name: 'Sesame seed', sanskrit: 'Tila', devanagari: 'तिल',
    aliases: ['til', 'sesam', 'gingelly'], category: 'nut_seed',
    rasa: ['sweet', 'bitter', 'astringent'], virya: 'heating', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 }, allergens: ['sesame'],
    whyFavor: 'Warming, oily and building — Charaka ranks Tila among the most nourishing seeds, deeply settling for Vata.',
    whyAvoid: 'Heating and heavy: it adds to Pitta and Kapha.',
    balancedBy: ['fennel', 'corianderSeed'],
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed', confidence: 'high',
  },

  // ── Beverages ───────────────────────────────────────────────────────────────
  blackTea: {
    id: 'blackTea', name: 'Black tea', aliases: ['chai', 'schwarztee', 'assam', 'darjeeling'],
    category: 'beverage', rasa: ['astringent', 'bitter'], virya: 'heating', vipaka: 'pungent',
    guna: ['light', 'dry', 'sharp'], doshaEffect: { vata: 1, pitta: 1, kapha: -1 },
    whyFavor: 'Astringent and stimulating — cuts Kapha and lifts a heavy morning.',
    whyAvoid: 'Drying, sharp and caffeinated: it unsettles Vata and adds heat to Pitta.',
    cautions: ['anxiety', 'insomnia', 'acid_reflux', 'pregnancy'],
    cautionNote: 'Caffeinated; go easy with anxiety, poor sleep or reflux, and in high intake during pregnancy.',
    balancedBy: ['milk', 'cardamom', 'gingerFresh'],
    source: { text: 'modern', note: 'Tea is later than the classical corpus. Derived: astringent, drying, warming, stimulating.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  greenTea: {
    id: 'greenTea', name: 'Green tea', aliases: ['grüner tee', 'gruener tee', 'sencha'],
    category: 'beverage', rasa: ['astringent', 'bitter'], virya: 'cooling', vipaka: 'pungent',
    guna: ['light', 'dry'], doshaEffect: { vata: 1, pitta: 0, kapha: -1 },
    whyFavor: 'Light, astringent and gently cooling — lighter than black tea, and Kapha-reducing.',
    whyAvoid: 'Astringent and drying, so it can unsettle Vata.',
    cautions: ['anxiety', 'insomnia', 'acid_reflux', 'pregnancy'],
    cautionNote: 'Caffeinated (less than black tea); go easy with anxiety, poor sleep or reflux, and in high intake during pregnancy.',
    balancedBy: ['honey', 'gingerFresh'],
    source: { text: 'modern', note: 'Unfermented tea; lighter and cooler than black. Derived from properties.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  herbalTea: {
    id: 'herbalTea', name: 'CCF tea (cumin–coriander–fennel)', aliases: ['ccf tea', 'herbal tea', 'kräutertee', 'kraeutertee', 'cumin coriander fennel', 'digestive tea'],
    category: 'beverage', rasa: ['pungent', 'sweet', 'bitter'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light'], doshaEffect: { vata: 0, pitta: -1, kapha: -1 },
    whyFavor: 'A caffeine-free digestive brew (cumin, coriander, fennel) — light, settling, and gentle on all three.',
    source: { text: 'modern', note: 'Represents the classic CCF digestive infusion, derived from its component spices. A near-neutral, balancing drink.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // ── Animal foods ────────────────────────────────────────────────────────────
  // In category 'animal' so vegetarian/vegan patterns exclude them automatically.
  egg: {
    id: 'egg', name: 'Egg', aliases: ['anda', 'ei', 'eggs', 'chicken egg'], category: 'animal',
    rasa: ['sweet'], virya: 'heating', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 }, allergens: ['egg'],
    whyFavor: 'Rich and building — grounding and strengthening for Vata.',
    whyAvoid: 'Heating and heavy: it adds to Pitta and Kapha, and is slow to digest, especially fried.',
    source: { text: 'modern', note: 'Eggs are treated sparingly in the classical corpus. Derived: sweet, heavy, oily, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  chicken: {
    id: 'chicken', name: 'Chicken', sanskrit: 'Kukkuta', devanagari: 'कुक्कुट',
    aliases: ['murgi', 'huhn', 'poultry'], category: 'animal', rasa: ['sweet'], virya: 'heating',
    vipaka: 'sweet', guna: ['heavy', 'oily'], doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    whyFavor: 'Warming and building — Charaka regards fowl (Kukkuta) as strengthening and grounding for Vata.',
    whyAvoid: 'Heating and heavy: it adds to Pitta and Kapha.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Kukkuta mamsa is named classically among the strengthening meats.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  // ── Batch 7 (reviewed 2026-07-28) — see docs/diet-review-batch-7.md ────────
  // Reviewer decisions applied: many virya/dosha corrections, balancedBy, and
  // confidence calls. Classical rows the reviewer marked High are sourced to the
  // Charaka food catalogue (Sutrasthana 27); Western/regional rows stay modern.

  // Grains & starches
  amaranth: {
    id: 'amaranth', name: 'Amaranth', sanskrit: 'Rajgira', devanagari: 'राजगिरा',
    aliases: ['rajgira', 'ramdana', 'amarant', 'chaulai grain'], category: 'grain',
    rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: 0 }, balancedBy: ['ghee', 'cumin', 'gingerFresh'],
    whyFavor: 'Light and cooling — a gluten-free pseudocereal that suits Pitta.',
    whyAvoid: 'Light and dry, so it can unsettle Vata unless well-oiled.',
    source: { text: 'modern', note: 'Grain amaranth (not the leaves); energetics derived, not classically described. Light, dry, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  buckwheat: {
    id: 'buckwheat', name: 'Buckwheat', sanskrit: 'Kuttu', devanagari: 'कुट्टू',
    aliases: ['kuttu', 'buchweizen', 'kotu', 'sarrasin'], category: 'grain',
    rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: 0 }, balancedBy: ['ghee', 'cumin', 'gingerFresh'],
    whyFavor: 'Light and cooling — a gluten-free fasting grain, gentle on Pitta.',
    whyAvoid: 'Light and dry, so it can unsettle Vata.',
    source: { text: 'modern', note: 'Buckwheat grain; energetics derived, not classically described. Light, dry, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  foxtailMillet: {
    id: 'foxtailMillet', name: 'Foxtail millet', sanskrit: 'Kangu', devanagari: 'कङ्गु',
    aliases: ['kangni', 'kakum', 'korra', 'kolbenhirse'], category: 'grain',
    rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 }, balancedBy: ['ghee', 'cumin', 'gingerFresh'],
    whyFavor: 'Light and cooling — reduces Kapha and suits Pitta; best cooked with ghee.',
    whyAvoid: 'Light and drying, so it can unsettle Vata.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Kangu is named among the classical millets; light, dry, cooling.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  sago: {
    id: 'sago', name: 'Sago (sabudana)', aliases: ['sabudana', 'sabudhana', 'tapioca', 'sago', 'tapioca pearls'],
    category: 'grain', rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, balancedBy: ['cumin', 'blackPepper', 'gingerFresh'],
    whyFavor: 'Bland, cooling and soft — a grounding fasting starch for Vata and hot Pitta.',
    whyAvoid: 'Heavy and starchy, so it adds to Kapha.',
    source: { text: 'modern', note: 'Indian sabudana (tapioca pearls), not true sago-palm starch; energetics derived. Sweet, heavy, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  whiteBread: {
    id: 'whiteBread', name: 'White bread', aliases: ['bread', 'sliced bread', 'sandwich bread', 'maida bread', 'weißbrot', 'refined bread', 'toast', 'white toast'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet', guna: ['heavy', 'dry'],
    doshaEffect: { vata: 1, pitta: 0, kapha: 1 }, balancedBy: ['ghee', 'butter', 'oliveOil'],
    whyAvoid: 'Refined and heavy with little to it — drying for Vata and sluggish for Kapha.',
    source: { text: 'modern', note: 'Standard refined-wheat bread (not whole-grain/sourdough); derived. Heavy, dry.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // Legumes
  soybean: {
    id: 'soybean', name: 'Soybean', aliases: ['soya', 'soja', 'edamame', 'bhat'], category: 'legume',
    rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'pungent', guna: ['heavy', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: 1 }, allergens: ['soy'], balancedBy: ['gingerFresh', 'cumin', 'asafoetida'],
    whyFavor: 'Protein-dense and building.',
    whyAvoid: 'Heavy and gas-forming — slow for Vata and heavy for Kapha.',
    preparation: 'Best well-fermented or as tofu; the whole bean needs long, spiced cooking.',
    source: { text: 'modern', note: 'Whole soybeans (fermented/processed soy modelled separately); derived. Heavy, dry.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  horseGram: {
    id: 'horseGram', name: 'Horse gram', sanskrit: 'Kulattha', devanagari: 'कुलत्थ',
    aliases: ['kulthi', 'hurali', 'kollu', 'kulattha'], category: 'legume',
    rasa: ['astringent', 'pungent'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: 1, kapha: -1 },
    whyFavor: 'Light, dry and warming — Charaka names Kulattha as scraping and Kapha-reducing; traditionally used for stones.',
    whyAvoid: 'Heating and astringent, so it aggravates Pitta and can inflame the blood, and its dryness tells on Vata.',
    cautions: ['acid_reflux'],
    cautionNote: 'Sharp and heating; classically cautioned in bleeding and acidic conditions.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  mothBean: {
    id: 'mothBean', name: 'Moth bean', aliases: ['matki', 'moth', 'dew bean', 'turkish gram'],
    category: 'legume', rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: 0 }, balancedBy: ['ghee', 'cumin', 'gingerFresh', 'asafoetida'],
    whyFavor: 'One of the lighter pulses, especially sprouted — reduces Pitta.',
    whyAvoid: 'Dry, so it can unsettle Vata.',
    source: { text: 'modern', note: 'Whole moth beans (matki); thin classical coverage. Light, dry, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  blackBean: {
    id: 'blackBean', name: 'Black beans', aliases: ['black turtle bean', 'schwarze bohnen', 'frijoles negros'],
    category: 'legume', rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'pungent', guna: ['heavy', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: 0 }, balancedBy: ['cumin', 'gingerFresh', 'asafoetida'],
    whyAvoid: 'Heavy and dry — gas-forming for Vata.',
    preparation: 'Soak overnight and cook thoroughly with digestive spices.',
    source: { text: 'modern', note: 'Phaseolus vulgaris (not urad/Masa); New World bean, derived. Heavy, dry.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // Vegetables
  pumpkin: {
    id: 'pumpkin', name: 'Pumpkin', aliases: ['kaddu', 'red pumpkin', 'kürbis'],
    category: 'vegetable', rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 }, balancedBy: ['gingerFresh', 'blackPepper', 'cumin'],
    whyFavor: 'Sweet, soft and cooling — grounding for Vata and soothing for Pitta.',
    source: { text: 'modern', note: 'Culinary pumpkin (Cucurbita), NOT the classical ash gourd / Kūṣmāṇḍa. Derived: sweet, light, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  drumstick: {
    id: 'drumstick', name: 'Drumstick (moringa)', sanskrit: 'Shigru', devanagari: 'शिग्रु',
    aliases: ['moringa', 'sahjan', 'saijan', 'murungai', 'moringabaum'], category: 'vegetable',
    rasa: ['pungent', 'bitter'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: 1, kapha: -1 }, balancedBy: ['ghee', 'coconut', 'corianderSeed'],
    whyFavor: 'Pungent, light and warming — Charaka names Shigru as kindling digestion and scraping Kapha.',
    whyAvoid: 'Sharp and heating, so it aggravates Pitta.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Profile refers to the edible drumstick pods (Śigru), not leaves or extracts.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  pointedGourd: {
    id: 'pointedGourd', name: 'Pointed gourd', sanskrit: 'Patola', devanagari: 'पटोल',
    aliases: ['parwal', 'parval', 'potol', 'pointed gourd'], category: 'vegetable',
    rasa: ['bitter', 'astringent'], virya: 'cooling', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 }, balancedBy: ['ghee', 'cumin', 'gingerFresh'],
    whyFavor: 'Light and cooling — Charaka praises Patola as wholesome, kindling appetite without heaviness; suits Pitta and Kapha.',
    whyAvoid: 'Very light and drying in excess for a depleted Vata.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  ivyGourd: {
    id: 'ivyGourd', name: 'Ivy gourd', sanskrit: 'Bimbi', devanagari: 'बिम्बी',
    aliases: ['tindora', 'tendli', 'kundru', 'kovakkai'], category: 'vegetable',
    rasa: ['bitter', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 }, balancedBy: ['ghee', 'cumin', 'mustardSeed'],
    whyFavor: 'Light and cooling — an easy everyday vegetable that suits Pitta and Kapha.',
    whyAvoid: 'Light and drying, so use it with a little oil for Vata.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Bimbi (Coccinia grandis, tindora); light, cooling.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  elephantYam: {
    id: 'elephantYam', name: 'Elephant-foot yam', sanskrit: 'Surana', devanagari: 'सूरण',
    aliases: ['suran', 'jimikand', 'ol', 'elephant yam'], category: 'vegetable', dietTags: ['root'],
    rasa: ['pungent', 'astringent'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: 1, kapha: -1 }, balancedBy: ['ghee', 'cumin', 'gingerFresh', 'asafoetida'],
    whyFavor: 'Pungent, light and warming — Charaka names Surana as Kapha-reducing and kindling; classically used for piles.',
    whyAvoid: 'Sharp and heating, so it adds to Pitta; raw or under-cooked it irritates the throat.',
    preparation: 'Must be cooked thoroughly, often with tamarind or sour agents, to remove the acridity.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  turnip: {
    id: 'turnip', name: 'Turnip', aliases: ['shalgam', 'shaljam', 'weiße rübe', 'turnip'],
    category: 'vegetable', dietTags: ['root'], rasa: ['sweet', 'pungent'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: 0, kapha: -1 }, balancedBy: ['ghee', 'cumin', 'corianderSeed'],
    whyFavor: 'Light and warming — a winter root that reduces Kapha.',
    whyAvoid: 'Pungent and drying, so it can unsettle Vata; raw it is gas-forming.',
    source: { text: 'modern', note: 'Cooked-root profile; thin classical coverage. Light, pungent, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  fennelBulb: {
    id: 'fennelBulb', name: 'Fennel (bulb)', aliases: ['saunf bulb', 'fenchel', 'florence fennel'],
    category: 'vegetable', rasa: ['sweet', 'pungent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 }, balancedBy: ['ghee', 'oliveOil', 'cumin'],
    whyFavor: 'Sweet, light and gently cooling — settles digestion, echoing fennel seed; suits Vata and Pitta.',
    source: { text: 'modern', note: 'The edible bulb (Florence fennel), not the seed; derived from fennel’s profile. Sweet, light, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  celery: {
    id: 'celery', name: 'Celery', aliases: ['ajmoda stalk', 'sellerie', 'celery stalk'],
    category: 'vegetable', rasa: ['bitter', 'pungent'], virya: 'cooling', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 }, balancedBy: ['ghee', 'sesameOil', 'cumin'],
    whyFavor: 'Light and cooling — reduces Kapha and is gently diuretic.',
    whyAvoid: 'Light and drying, so raw it can unsettle Vata.',
    source: { text: 'modern', note: 'Celery stalks; derived from the classical seed (Ajmoda). Light, dry, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  brusselsSprouts: {
    id: 'brusselsSprouts', name: 'Brussels sprouts', aliases: ['rosenkohl', 'sprouts'],
    category: 'vegetable', rasa: ['bitter', 'sweet'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: 0, kapha: -1 }, balancedBy: ['ghee', 'cumin', 'blackPepper'],
    whyFavor: 'Light — reduces Kapha, like the rest of the cabbage family.',
    whyAvoid: 'Dry and gas-forming, so it unsettles Vata.',
    preparation: 'Roast or sauté with ghee and digestive spices; raw it is very gas-forming.',
    source: { text: 'modern', note: 'A brassica, absent from the corpus. Derived: light, dry, gas-forming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  artichoke: {
    id: 'artichoke', name: 'Artichoke', aliases: ['artischocke', 'globe artichoke'],
    category: 'vegetable', rasa: ['bitter', 'sweet'], virya: 'cooling', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 }, balancedBy: ['oliveOil', 'ghee', 'cumin'],
    whyFavor: 'Bitter, light and cooling — reduces Kapha and Pitta and supports the liver.',
    whyAvoid: 'Bitter and drying, so it can unsettle Vata.',
    source: { text: 'modern', note: 'Cooked flower bud; absent from the corpus. Derived: bitter, light, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  mustardGreens: {
    id: 'mustardGreens', name: 'Mustard greens', aliases: ['sarson ka saag', 'sarson', 'senfblätter'],
    category: 'vegetable', rasa: ['pungent', 'bitter'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: 1, kapha: -1 }, balancedBy: ['ghee', 'sesameOil', 'cumin'],
    whyFavor: 'Pungent, light and warming — a winter leafy that strongly reduces Kapha.',
    whyAvoid: 'Sharp and heating, so it aggravates Pitta, and dry for Vata.',
    preparation: 'Traditionally slow-cooked with ghee, which softens the sharpness.',
    source: { text: 'modern', note: 'Cooked mustard greens; derived from mustard (Sarshapa). Pungent, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // Fruit
  jamun: {
    id: 'jamun', name: 'Java plum (jamun)', sanskrit: 'Jambu', devanagari: 'जम्बु',
    aliases: ['jamun', 'jambul', 'black plum', 'naval pazham'], category: 'fruit',
    rasa: ['astringent', 'sweet'], virya: 'cooling', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 }, balancedBy: ['rockSalt', 'blackPepper'],
    whyFavor: 'Astringent and cooling — Charaka names Jambu as reducing Kapha and Pitta; traditionally valued in diabetes.',
    whyAvoid: 'Astringent and drying, so it aggravates Vata, especially on an empty stomach.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  jackfruit: {
    id: 'jackfruit', name: 'Jackfruit (ripe)', sanskrit: 'Panasa', devanagari: 'पनस',
    aliases: ['kathal', 'chakka', 'jackfrucht'], category: 'fruit',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, balancedBy: ['blackPepper', 'gingerFresh'],
    whyFavor: 'Sweet, heavy and cooling — Charaka names Panasa among strengthening fruits; grounding for Vata and Pitta.',
    whyAvoid: 'Very heavy and slow to digest, so it adds to Kapha.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Profile refers to ripe jackfruit; tender/green jackfruit is lighter and would be modelled separately.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  raisins: {
    id: 'raisins', name: 'Raisins', sanskrit: 'Draksha', devanagari: 'द्राक्षा',
    aliases: ['currants', 'kishmish', 'munakka', 'rosinen', 'dried grapes', 'sultanas'], category: 'fruit',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, balancedBy: ['fennel', 'cardamom'],
    whyFavor: 'Sweet, soft and cooling — Charaka ranks Draksha first among fruits, restorative and settling for Vata and Pitta.',
    whyAvoid: 'Sweet and heavy, so it adds to Kapha.',
    preparation: 'Best soaked overnight, which makes them softer and more cooling.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Dried grapes (Draksha); drying concentrates sweetness vs fresh grapes.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  muskmelon: {
    id: 'muskmelon', name: 'Muskmelon', aliases: ['kharbuja', 'cantaloupe', 'melon', 'zuckermelone'],
    category: 'fruit', rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 }, bestSeason: ['summer'], balancedBy: ['blackPepper', 'gingerFresh'],
    whyFavor: 'Sweet, watery and cooling — a hydrating summer fruit that soothes Vata and Pitta.',
    whyAvoid: 'Best eaten alone, not combined with heavy foods or dairy.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Ripe muskmelon; sweet, light, cooling, hydrating.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  sweetLime: {
    id: 'sweetLime', name: 'Sweet lime (mosambi)', aliases: ['mosambi', 'musambi', 'sweet lime', 'sathukudi'],
    category: 'fruit', rasa: ['sweet', 'sour'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 }, balancedBy: ['blackPepper', 'rockSalt'],
    whyFavor: 'Mild, sweet and cooling — gentler than orange, soothing for Vata and Pitta.',
    source: { text: 'modern', note: 'Ripe mosambi; juice best fresh. Derived: mostly sweet, mildly sour, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  plum: {
    id: 'plum', name: 'Plum', aliases: ['aloo bukhara', 'pflaume', 'plum'], category: 'fruit',
    rasa: ['sweet', 'sour'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 }, balancedBy: ['cinnamon', 'gingerFresh'],
    whyFavor: 'Sweet-sour, juicy and cooling — grounding for Vata and gently laxative.',
    source: { text: 'modern', note: 'Ripe fresh plums (unripe are more sour, more Pitta-provoking). Derived: light, moist, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  apricot: {
    id: 'apricot', name: 'Apricot', aliases: ['khubani', 'aprikose', 'apricot', 'khumani'], category: 'fruit',
    rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 }, balancedBy: ['cinnamon', 'gingerFresh'],
    whyFavor: 'Sweet, soft and cooling — settling for Vata and Pitta.',
    source: { text: 'modern', note: 'Ripe fresh apricots (dried apricots modelled separately). Derived: light, moist, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  cherry: {
    id: 'cherry', name: 'Cherry', aliases: ['kirsche', 'cherries', 'cherry'], category: 'fruit',
    rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 }, balancedBy: ['cinnamon', 'gingerFresh'],
    whyFavor: 'Sweet, light and cooling — settling for Vata and Pitta.',
    source: { text: 'modern', note: 'Ripe sweet cherries (sour cherries would be a separate entry). Derived: light, moist, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  kiwi: {
    id: 'kiwi', name: 'Kiwi', aliases: ['kiwifrucht', 'kiwi fruit'], category: 'fruit',
    rasa: ['sweet', 'sour'], virya: 'cooling', vipaka: 'sour', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 }, balancedBy: ['cinnamon', 'gingerFresh'],
    whyFavor: 'Tangy, light and cooling — refreshing and rich in vitamin C.',
    source: { text: 'modern', note: 'Ripe kiwi (unripe is markedly more sour). Derived: light, moist, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  blueberry: {
    id: 'blueberry', name: 'Blueberry', aliases: ['heidelbeere', 'blaubeere', 'neelbadari', 'blueberries'],
    category: 'fruit', rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 }, balancedBy: ['cinnamon'],
    whyFavor: 'Sweet-astringent, light and cooling — suits Pitta and Kapha.',
    source: { text: 'modern', note: 'Fresh ripe blueberries (dried are sweeter, drier). New World berry, derived.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  custardApple: {
    id: 'custardApple', name: 'Custard apple', sanskrit: 'Sitaphala', devanagari: 'सीताफल',
    aliases: ['sitaphal', 'sharifa', 'sugar apple', 'annone'], category: 'fruit',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, balancedBy: ['cardamom', 'cinnamon', 'gingerFresh'],
    whyFavor: 'Very sweet, soft and cooling — grounding for Vata and soothing for Pitta.',
    whyAvoid: 'Sweet and heavy, so it clearly adds to Kapha.',
    source: { text: 'modern', note: 'Ripe custard apple (unripe is markedly astringent). Derived: sweet, heavy, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // Nuts & seeds
  lotusSeed: {
    id: 'lotusSeed', name: 'Lotus seed', sanskrit: 'Padmabija', devanagari: 'पद्मबीज',
    aliases: ['lotus seed', 'kamal gatta', 'kamal beej', 'lotussamen'], category: 'nut_seed',
    rasa: ['sweet', 'astringent'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 }, balancedBy: ['ghee', 'cardamom'],
    whyFavor: 'Sweet, light and cooling — suits Pitta and Kapha.',
    whyAvoid: 'Light and dry, so pair with a little ghee for Vata.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'True lotus seeds (Nelumbo nucifera, Padma). Distinct from makhana (Euryale ferox / fox nut), which — being slightly more nourishing (V−1) — should get its own entry.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  pumpkinSeed: {
    id: 'pumpkinSeed', name: 'Pumpkin seeds', aliases: ['kaddu ke beej', 'kürbiskerne', 'pepitas'],
    category: 'nut_seed', rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, balancedBy: ['blackPepper', 'gingerFresh'],
    whyFavor: 'Oily and grounding — settling for Vata and gentle on Pitta.',
    whyAvoid: 'Heavy and oily, so it adds to Kapha.',
    source: { text: 'modern', note: 'Raw/lightly-roasted seeds; absent from the corpus. Derived: sweet, heavy, oily, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  chiaSeed: {
    id: 'chiaSeed', name: 'Chia seeds', aliases: ['chia', 'chiasamen'],
    category: 'nut_seed', rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, balancedBy: ['gingerFresh', 'cinnamon'],
    whyFavor: 'Cooling and soothing once soaked and gelled — settling for Vata and Pitta.',
    preparation: 'Soak/hydrate before eating; dry chia needs plenty of fluid.',
    source: { text: 'modern', note: 'Soaked chia; New World seed, derived. Sweet, heavy, moist, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  hazelnut: {
    id: 'hazelnut', name: 'Hazelnut', aliases: ['haselnuss', 'filbert', 'hazelnuts'],
    category: 'nut_seed', rasa: ['sweet', 'astringent'], virya: 'heating', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 }, allergens: ['nuts'], balancedBy: ['cardamom', 'cinnamon'],
    whyFavor: 'Oily, warming and building — grounding for Vata.',
    whyAvoid: 'Oily and heating, so it adds to Pitta and Kapha.',
    source: { text: 'modern', note: 'Raw/dry-roasted hazelnuts; absent from the corpus. Derived: heavy, oily, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  chestnut: {
    id: 'chestnut', name: 'Chestnut', aliases: ['maroni', 'esskastanie', 'chestnuts'],
    category: 'nut_seed', rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, balancedBy: ['cinnamon', 'gingerFresh'],
    whyFavor: 'Sweet and starchy — a low-fat nut, gentler on Pitta and grounding for Vata.',
    whyAvoid: 'Heavy, so it adds to Kapha.',
    source: { text: 'modern', note: 'Cooked chestnuts — starchier and less oily than most tree nuts. Derived: sweet, heavy, moist.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // Spices & herbs
  longPepper: {
    id: 'longPepper', name: 'Long pepper (pippali)', sanskrit: 'Pippali', devanagari: 'पिप्पली',
    aliases: ['pippali', 'pipli', 'long pepper'], category: 'spice',
    rasa: ['pungent'], virya: 'heating', vipaka: 'sweet', guna: ['light', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 }, balancedBy: ['ghee'],
    whyFavor: 'Pungent and warming with a sweet vipaka — Charaka prizes Pippali as a digestive and rejuvenative that settles Vata and clears Kapha.',
    whyAvoid: 'Heating, so it aggravates Pitta; classically cautioned against long, heavy use.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Pippalī; more nourishing and less drying than black pepper (Marica).' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  holyBasil: {
    id: 'holyBasil', name: 'Holy basil (tulsi)', sanskrit: 'Surasa', devanagari: 'सुरसा',
    aliases: ['tulsi', 'tulasi', 'holy basil', 'sacred basil'], category: 'spice',
    rasa: ['pungent', 'bitter'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: 0, pitta: 1, kapha: -1 }, balancedBy: ['ghee', 'corianderSeed'],
    whyFavor: 'Pungent, light and warming — Surasa clears Kapha and the chest and kindles digestion.',
    whyAvoid: 'Sharp and heating, so it aggravates Pitta.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Culinary leaves or tea, not concentrated extract/oil.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  rockSalt: {
    id: 'rockSalt', name: 'Rock salt (saindhava)', sanskrit: 'Saindhava', devanagari: 'सैन्धव',
    aliases: ['sendha namak', 'saindhava', 'himalayan salt', 'steinsalz'], category: 'spice',
    rasa: ['salty'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    whyFavor: 'Charaka names Saindhava the best of salts — light and, uniquely, cooling, so it settles Vata without much aggravating Pitta.',
    whyAvoid: 'Still a salt, so large amounts add to Kapha and cause fluid retention.',
    source: { text: 'CS', verse: 'Sutrasthana 27' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  dillSeed: {
    id: 'dillSeed', name: 'Dill seed', aliases: ['sowa', 'suva', 'dill', 'dillsamen'], category: 'spice',
    rasa: ['pungent', 'bitter'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 }, balancedBy: ['ghee'],
    whyFavor: 'Pungent and warming — a digestive and carminative that settles Vata and clears Kapha.',
    whyAvoid: 'Heating, so it aggravates Pitta.',
    source: { text: 'modern', note: 'Culinary dill (Anethum graveolens); distinct from fennel despite the historical Śatapuṣpā overlap. Derived.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  starAnise: {
    id: 'starAnise', name: 'Star anise', aliases: ['chakra phool', 'badian', 'sternanis', 'star anise'],
    category: 'spice', rasa: ['sweet', 'pungent'], virya: 'heating', vipaka: 'sweet', guna: ['light', 'dry'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 }, balancedBy: ['ghee'],
    whyFavor: 'Sweet-pungent and warming — a carminative that settles Vata and clears Kapha.',
    whyAvoid: 'Heating, so it adds to Pitta.',
    source: { text: 'modern', note: 'Chinese star anise (Illicium verum); absent from the corpus. Derived: sweet-pungent, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  mace: {
    id: 'mace', name: 'Mace', sanskrit: 'Jatipatri', devanagari: 'जातिपत्री',
    aliases: ['javitri', 'jaepatri', 'macis', 'mace'], category: 'spice',
    rasa: ['pungent', 'bitter'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 }, balancedBy: ['ghee'],
    whyFavor: 'Aromatic, pungent and warming — the aril of nutmeg (Jatipatri), it kindles digestion and settles Vata.',
    whyAvoid: 'Heating, so it aggravates Pitta; use sparingly.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Jatipatri, companion to nutmeg (Jatiphala); similar aromatic warming profile.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  nigella: {
    id: 'nigella', name: 'Nigella seed', aliases: ['kalonji', 'kalaunji', 'black cumin', 'schwarzkümmel'],
    category: 'spice', rasa: ['pungent', 'bitter'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 }, balancedBy: ['ghee'],
    whyFavor: 'Pungent, light and warming — a digestive that settles Vata and strongly clears Kapha.',
    whyAvoid: 'Heating, so it aggravates Pitta.',
    source: { text: 'modern', note: 'Nigella sativa (kalonji); not black sesame/caraway/Bunium. Derived: pungent, light, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  rosemary: {
    id: 'rosemary', name: 'Rosemary', aliases: ['rosmarin', 'rusmari', 'rosemary'],
    category: 'spice', rasa: ['pungent', 'bitter'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 }, balancedBy: ['oliveOil', 'ghee'],
    whyFavor: 'Aromatic, light and warming — stimulating and Kapha-clearing.',
    whyAvoid: 'Pungent and heating, so it adds to Pitta.',
    source: { text: 'modern', note: 'Culinary rosemary leaves; Mediterranean herb, absent from the corpus. Derived: pungent, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  thyme: {
    id: 'thyme', name: 'Thyme', aliases: ['thymian', 'thyme'],
    category: 'spice', rasa: ['pungent', 'bitter'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry'],
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 }, balancedBy: ['oliveOil', 'ghee'],
    whyFavor: 'Pungent, light and warming — a digestive and expectorant that settles Vata and clears Kapha.',
    whyAvoid: 'Heating, so it aggravates Pitta.',
    source: { text: 'modern', note: 'Culinary thyme leaves; Mediterranean herb, absent from the corpus. Derived: pungent, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  poppySeed: {
    id: 'poppySeed', name: 'Poppy seed', sanskrit: 'Khasatila', devanagari: 'खसतिल',
    aliases: ['khus khus', 'khaskhas', 'posta dana', 'mohn'], category: 'spice',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, balancedBy: ['cardamom', 'gingerFresh'],
    whyFavor: 'Sweet, oily and grounding — settling and mildly sedative, good for Vata; a natural thickener.',
    whyAvoid: 'Heavy and oily, so it adds to Kapha; binding in excess.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Culinary poppy seed (khus khus), not opium; sweet, heavy, oily.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },

  // Oils
  peanutOil: {
    id: 'peanutOil', name: 'Peanut oil', aliases: ['groundnut oil', 'moongphali tel', 'erdnussöl'],
    category: 'oil', rasa: ['sweet'], virya: 'heating', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 }, allergens: ['peanuts'], balancedBy: ['turmeric', 'cumin'],
    whyFavor: 'Heavy, oily and warming — grounding for Vata and stable for high-heat cooking.',
    whyAvoid: 'Heavy and heating, so it adds to Pitta and Kapha.',
    source: { text: 'modern', note: 'Culinary peanut oil; New World crop, derived. Heavy, oily, warming.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  almondOil: {
    id: 'almondOil', name: 'Almond oil', aliases: ['badam tel', 'mandelöl', 'sweet almond oil'],
    category: 'oil', rasa: ['sweet'], virya: 'heating', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 1 }, allergens: ['nuts'], balancedBy: ['cardamom'],
    whyFavor: 'Rich, sweet and warming — nourishing and grounding for Vata, gentle enough to finish dishes.',
    whyAvoid: 'Heavy, so it adds to Kapha.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Culinary sweet almond oil (not bitter almond); derived from almond (Vatama). Sweet, oily, warming.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },

  // Sweeteners
  rockCandy: {
    id: 'rockCandy', name: 'Rock candy (mishri)', sanskrit: 'Sharkara', devanagari: 'शर्करा',
    aliases: ['mishri', 'misri', 'khadi shakkar', 'kandiszucker', 'sugar candy'], category: 'sweetener',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    whyFavor: 'Sweet and cooling — Charaka regards Sharkara as the most cooling of sugars, soothing for Vata and Pitta.',
    whyAvoid: 'Still a sugar, so it adds to Kapha in excess.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Crystallized form of cane sugar (Miśrī/Śarkarā) — same energetics as caneSugar.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  mapleSyrup: {
    id: 'mapleSyrup', name: 'Maple syrup', aliases: ['ahornsirup', 'maple'], category: 'sweetener',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, balancedBy: ['cinnamon', 'gingerFresh'],
    whyFavor: 'Sweet and cooling — a gentler-glycemic liquid sweetener, soothing for Pitta.',
    whyAvoid: 'Still sweet and heavy, so it adds to Kapha.',
    source: { text: 'modern', note: 'Pure maple syrup; energetically closer to sugar syrup than to honey (madhu). Derived: sweet, heavy, cooling.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // Beverages
  coconutWater: {
    id: 'coconutWater', name: 'Coconut water', sanskrit: 'Narikela jala', devanagari: 'नारिकेलजल',
    aliases: ['nariyal pani', 'tender coconut water', 'kokoswasser'], category: 'beverage',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['light', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 }, bestSeason: ['summer'],
    whyFavor: 'Sweet, light and cooling — tender-coconut water hydrates and settles Vata and Pitta without heaviness.',
    whyAvoid: 'Cooling, so go easy when Kapha or digestion is low.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Fresh tender-coconut water, not canned drinks or coconut milk; distinct from the heavier flesh.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  sugarcaneJuice: {
    id: 'sugarcaneJuice', name: 'Sugarcane juice', sanskrit: 'Ikshu rasa', devanagari: 'इक्षुरस',
    aliases: ['ganne ka ras', 'ikshu', 'zuckerrohrsaft'], category: 'beverage',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'moist'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, bestSeason: ['summer'], balancedBy: ['gingerFresh'],
    whyFavor: 'Sweet, heavy and cooling — Charaka names Ikshu as strengthening and diuretic, soothing for Vata and Pitta.',
    whyAvoid: 'Sweet and heavy, so it adds to Kapha; spoils quickly once pressed.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Fresh sugarcane juice (Ikṣu rasa); similar energetics to crystallized sugar.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  cocoa: {
    id: 'cocoa', name: 'Cocoa', aliases: ['cacao', 'kakao', 'unsweetened cocoa', 'drinking cocoa'],
    category: 'beverage', rasa: ['bitter', 'astringent', 'sweet'], virya: 'heating', vipaka: 'pungent', guna: ['light', 'dry', 'sharp'],
    doshaEffect: { vata: 1, pitta: 1, kapha: -1 },
    whyFavor: 'Bitter and stimulating — clears Kapha and lifts a heavy mood in small amounts.',
    whyAvoid: 'Bitter, dry and stimulating, so it unsettles Vata and adds to Pitta; the caffeine/theobromine disturbs sleep.',
    cautions: ['insomnia'],
    cautionNote: 'Stimulant; avoid late in the day, especially for Vata and Pitta.',
    source: { text: 'modern', note: 'Unsweetened cocoa prepared as a beverage, NOT chocolate confectionery (darkChocolate would be a separate food). Derived: bitter, light, heating, stimulating.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // Dairy
  cream: {
    id: 'cream', name: 'Cream', sanskrit: 'Santanika', devanagari: 'सन्तानिका',
    aliases: ['malai', 'sahne', 'heavy cream', 'fresh cream'], category: 'dairy',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, allergens: ['dairy'], balancedBy: ['blackPepper', 'gingerFresh', 'cinnamon'],
    whyFavor: 'Rich, sweet and cooling — deeply nourishing and grounding for Vata, soothing for Pitta.',
    whyAvoid: 'Very heavy and oily, so it strongly adds to Kapha.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Unsweetened dairy cream / milk-skin (Santanika); whipped/sweetened cream modelled separately.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  khoa: {
    id: 'khoa', name: 'Khoa (reduced milk)', aliases: ['mawa', 'khoya', 'milchmasse'], category: 'dairy',
    rasa: ['sweet'], virya: 'cooling', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 }, allergens: ['dairy'], balancedBy: ['cardamom', 'gingerFresh', 'saffron'],
    whyFavor: 'Concentrated, sweet and building — very grounding for Vata.',
    whyAvoid: 'Extremely heavy and slow, so it strongly adds to Kapha; heavier than fresh milk.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Plain unsweetened khoa (mawa); milk sweets made from it modelled separately. Concentrated milk: sweet, heavy, oily.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },

  // Animal
  fishFreshwater: {
    id: 'fishFreshwater', name: 'Fish (freshwater)', sanskrit: 'Matsya', devanagari: 'मत्स्य',
    aliases: ['machli', 'fisch', 'rohu', 'freshwater fish'], category: 'animal',
    rasa: ['sweet'], virya: 'heating', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 }, allergens: ['fish'], balancedBy: ['gingerFresh', 'blackPepper', 'cumin'],
    whyFavor: 'Sweet, warming and building — Charaka regards Matsya as strengthening and grounding for Vata.',
    whyAvoid: 'Heating and heavy, so it adds to Pitta and Kapha; classically cautioned combined with milk.',
    cautionNote: 'Charaka warns against fish with milk (viruddha ahara — an incompatible combination).',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'General freshwater-fish profile (Matsya); species vary in heaviness.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  goatMeat: {
    id: 'goatMeat', name: 'Goat meat', sanskrit: 'Aja mamsa', devanagari: 'अजमांस',
    aliases: ['mutton', 'chevon', 'ziegenfleisch', 'bakra'], category: 'animal',
    rasa: ['sweet'], virya: 'heating', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 0, kapha: 0 }, balancedBy: ['gingerFresh', 'blackPepper', 'cumin'],
    whyFavor: 'Building yet balanced — Charaka singles out Aja (goat) as the most wholesome of the common meats, not overly aggravating to any dosha.',
    whyAvoid: 'Still heavy and slow to digest; too much taxes a weak digestive fire.',
    source: { text: 'CS', verse: 'Sutrasthana 27', note: 'Aja mamsa; classically the most balanced of the common meats.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },
  prawn: {
    id: 'prawn', name: 'Prawn', aliases: ['shrimp', 'jhinga', 'garnele', 'prawns'], category: 'animal',
    rasa: ['sweet', 'salty'], virya: 'heating', vipaka: 'sweet', guna: ['heavy', 'oily'],
    doshaEffect: { vata: -1, pitta: 1, kapha: 1 }, allergens: ['shellfish'], balancedBy: ['gingerFresh', 'blackPepper', 'cumin'],
    whyFavor: 'Rich and warming — building and grounding for Vata.',
    whyAvoid: 'Heating, heavy and oily, so it clearly adds to Pitta and Kapha; a common allergen.',
    source: { text: 'modern', note: 'Plain cooked prawns; shellfish sit at the margins of the corpus. Derived: sweet-salty, heavy, oily, heating.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
}

// ── Modern-diet review batch ──────────────────────────────────────────────
// A separate module of Western/global/processed foods, all `reviewStatus:
// 'draft'` so they stay INVISIBLE to the app until a human fact-checks each and
// flips the flag. Merged here (not shipped separately) so getIngredient() and
// the integrity tests see them as real draft rows of the one dataset.
Object.assign(INGREDIENTS, MODERN_DRAFT_INGREDIENTS)
Object.assign(INGREDIENTS, MODERN_DRAFT_INGREDIENTS_2)
Object.assign(INGREDIENTS, MODERN_DRAFT_INGREDIENTS_3)
Object.assign(INGREDIENTS, DISH_INGREDIENTS)
Object.assign(INGREDIENTS, MODERN_DRAFT_INGREDIENTS_4)
Object.assign(INGREDIENTS, COMMON_INGREDIENTS)
Object.assign(INGREDIENTS, MODERN_DRAFT_INGREDIENTS_5)
Object.assign(INGREDIENTS, MODERN_DRAFT_INGREDIENTS_6)

// ── Derived recipes ─────────────────────────────────────────────────────────
// Composite dishes computed from the (now fully-assembled) base ingredients +
// a cooking method, rather than hand-rated. Folded in last so they can resolve
// any base above; each part is used only if it is reviewed, so a recipe never
// derives from an unreviewed fact. See lib/deriveRecipe.js, recipes-data.js.
Object.assign(
  INGREDIENTS,
  deriveRecipes(RECIPES, (id) => {
    const e = INGREDIENTS[id]
    return e && e.reviewStatus === 'reviewed' ? e : null
  }),
)

/** Stable list form, for iteration. Includes drafts — filter before display. */
export const ALL_INGREDIENTS = Object.values(INGREDIENTS)
