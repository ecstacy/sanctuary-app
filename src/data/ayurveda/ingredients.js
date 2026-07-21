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
    dietTags: ['root'],
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
      'Long-cooked with ginger, cumin, black pepper or asafoetida to make the heaviness manageable. That changes how the food is experienced, not its intrinsic properties — the ratings above already describe the dal itself.',
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
      'Soaking well, cooking thoroughly and adding enough unctuousness plus digestive spices (asafoetida, cumin, ginger) is the standard way to make it tolerable for Vata.',
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
    aliases: ['kali mirch', 'pfeffer', 'peppercorn'],
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
    dietTags: ['root'],
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
    dietTags: ['allium', 'root'],
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
    dietTags: ['allium', 'root'],
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
    aliases: ['fried onion', 'sautéed onion', 'gebratene zwiebel', 'onion masala', 'pyaz'],
    category: 'vegetable',
    dietTags: ['allium', 'root'],
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
    aliases: ['badam', 'mandel', 'almonds', 'almond milk'],
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
}

/** Stable list form, for iteration. Includes drafts — filter before display. */
export const ALL_INGREDIENTS = Object.values(INGREDIENTS)
