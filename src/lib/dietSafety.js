// ─────────────────────────────────────────────────────────────────────────────
//  dietSafety.js — the guardrails around every piece of diet guidance
//
//  A diet feature sits on top of allergies, medical conditions, pregnancy,
//  medication and disordered eating. Those are not edge cases to bolt on later;
//  they decide whether this feature is safe to ship at all. So the rules live
//  in one module, are unit-tested, and are applied by BOTH the search view and
//  the meal composer — never re-implemented per surface.
//
//  Three separate jobs, deliberately not conflated:
//    1. ALLERGEN FILTERING — absolute. An Ayurvedic "favor this" NEVER
//       overrides "this person is allergic to it". Hard filter, no ranking,
//       no exceptions.
//    2. SEEK-HELP TRIGGERS — when a query or profile touches pregnancy, a named
//       condition, medication, or a disordered-eating signal, we say less, not
//       more, and point to a professional.
//    3. FRAMING — we describe traditional properties ("considered cooling"),
//       never clinical claims ("treats", "cures", "prevents").
//
//  See docs/diet-feature-plan.md §6.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Canonical allergen keys. Ingredient rows tag themselves with these, and the
 * user's diet profile stores the same keys, so filtering is an exact set
 * comparison rather than fuzzy text matching on food names.
 */
export const ALLERGENS = {
  DAIRY:     'dairy',
  GLUTEN:    'gluten',
  NUTS:      'nuts',
  PEANUTS:   'peanuts',
  SOY:       'soy',
  EGG:       'egg',
  FISH:      'fish',
  SHELLFISH: 'shellfish',
  SESAME:    'sesame',
  MUSTARD:   'mustard',
  // NOTE: 'nightshade' was here and was a CATEGORY ERROR — a botanical family
  // is not an allergen. It moved to DIET_PATTERNS.NO_NIGHTSHADE +
  // DIET_TAGS.NIGHTSHADE, which is where an avoidance preference belongs.
  // Keeping it here made the UI call it an allergy, overstating a preference
  // as a medical constraint. A test asserts it does not come back.
}

/**
 * Dietary patterns, kept separate from allergens: an allergy is a safety
 * constraint, a pattern is a preference. Both filter, but they're reported
 * differently — "excluded (allergy)" vs "excluded (your diet)".
 */
export const DIET_PATTERNS = {
  VEGETARIAN:      'vegetarian',
  VEGAN:           'vegan',
  EGGETARIAN:      'eggetarian',      // lacto-ovo: eggs allowed, no meat/fish
  PESCATARIAN:     'pescatarian',     // veg + fish/seafood (and eggs), no meat/poultry
  JAIN:            'jain',            // no roots/alliums
  NO_ONION_GARLIC: 'no_onion_garlic', // sattvic / observance
  HALAL:           'halal',
  KOSHER:          'kosher',
  NO_BEEF:         'no_beef',         // e.g. Hindu observance
  NO_PORK:         'no_pork',         // common observance; halal already implies it
  // An avoidance preference, not an allergy — potato, tomato, aubergine and
  // peppers are a plant family, and people avoid them for comfort or belief
  // rather than anaphylaxis. Sits here so the UI says "your preference",
  // never "you are allergic". Parallels NO_ONION_GARLIC exactly.
  NO_NIGHTSHADE:   'no_nightshade',
}

/**
 * Pattern-exclusion tags an ingredient row can carry. Canonical, because a
 * TYPO IN A TAG IS A SILENT SAFETY FAILURE: `'alium'` matches no rule, so the
 * food quietly stops being filtered and the user is told it suits them. The
 * vocabulary is validated in dev (see `assertKnownTags`) and asserted in tests
 * rather than trusted.
 */
export const DIET_TAGS = {
  ALLIUM:         'allium',          // onion/garlic family — Jain, no-onion-garlic
  // Follows the PLANT PART, not the processing: a rhizome stays a rhizome
  // dried and powdered (ginger fresh AND dry, turmeric). The exception is
  // asafoetida, where what is eaten is the dried resin rather than the root —
  // which is why Jain cooking permits it as the standard allium substitute.
  ROOT:           'root',            // underground part — Jain
  ANIMAL_DERIVED: 'animal_derived',  // from an animal but not meat/dairy (honey)
  ANIMAL_RENNET:  'animal_rennet',   // slaughter-derived enzyme — not vegetarian
  GELATIN:        'gelatin',         // slaughter-derived (bones/skin) — not vegetarian
  MEAT:           'meat',            // red meat OR poultry — the flesh marker a
                                     // COMPOSITE dish carries so veg/pescatarian
                                     // filters catch it (a whole animal food is
                                     // caught by its 'animal' category instead).
                                     // pork/beef are ADDITIONAL finer tags.
  PORK:           'pork',            // halal, kosher, no_pork
  BEEF:           'beef',            // no_beef (Hindu observance)
  ALCOHOL:        'alcohol',         // halal
  SHELLFISH:      'shellfish',       // kosher
  NIGHTSHADE:     'nightshade',      // solanaceae — no_nightshade
}

/**
 * Allergens that follow inescapably from the category, applied whether or not
 * the row remembered to declare them.
 *
 * Only total mappings belong here. `dairy` is one: there is no dairy-category
 * food that is not a dairy allergen. `nut_seed` is NOT — sesame and sunflower
 * are seeds, not nuts, and mapping the category to 'nuts' would both
 * over-exclude and mislabel. Where the mapping isn't total, the row declares
 * its own allergens and `dataset integrity` tests enforce that it did.
 */
const IMPLIED_ALLERGENS_BY_CATEGORY = {
  dairy: [ALLERGENS.DAIRY],
}

const ALLERGEN_VALUES = new Set(Object.values(ALLERGENS))
const PATTERN_VALUES  = new Set(Object.values(DIET_PATTERNS))
const TAG_VALUES      = new Set(Object.values(DIET_TAGS))

/**
 * Normalise a user- or data-supplied key list to canonical form.
 *
 * `diet_prefs` is client-written jsonb, so 'Dairy', ' dairy ' and 'DAIRY' all
 * reach us in practice. An exact Set comparison against 'dairy' fails on every
 * one of them — and fails OPEN, silently telling an allergic user their
 * allergen is fine. Normalising both sides is the difference between a filter
 * and the appearance of one.
 */
function normaliseKeys(list) {
  if (!Array.isArray(list)) return []
  return list
    .filter((k) => typeof k === 'string')
    .map((k) => k.trim().toLowerCase().replace(/[\s-]+/g, '_'))
    .filter(Boolean)
}

/**
 * Every allergen this ingredient carries: declared plus category-implied,
 * normalised. Exported because the UI must be able to show exactly what the
 * filter sees, not its own re-derivation.
 * @param {object} ingredient
 * @returns {string[]}
 */
export function allergensOf(ingredient) {
  const declared = normaliseKeys(ingredient?.allergens)
  const implied  = IMPLIED_ALLERGENS_BY_CATEGORY[ingredient?.category] || []
  return [...new Set([...declared, ...implied])]
}

/** Normalised pattern tags for an ingredient. */
export function tagsOf(ingredient) {
  return normaliseKeys(ingredient?.dietTags)
}

/**
 * Which kind of animal food this is, for the eating-style patterns
 * (eggetarian, pescatarian, vegetarian, vegan). 'egg' | 'seafood' | 'meat' |
 * null.
 *
 * Whole animal foods (category 'animal') derive it from the allergen they
 * carry: egg → 'egg'; fish/shellfish → 'seafood'; anything else → 'meat'.
 *
 * COMPOSITE dishes (category 'other' — a chicken curry, a fish stew) have no
 * 'animal' category to key off, so they slipped through every animal-food
 * filter. They now declare flesh explicitly: the MEAT dietTag → 'meat', and a
 * fish/shellfish allergen → 'seafood' (a reliable proxy; only seafood carries
 * those). Egg is deliberately NOT derived for composites — an egg-containing
 * cake is not an "animal food" these patterns exclude.
 */
export function animalKind(ingredient) {
  const alg = allergensOf(ingredient)
  const tags = tagsOf(ingredient)
  if (tags.includes(DIET_TAGS.MEAT)) return 'meat'
  if (ingredient?.category !== 'animal') {
    if (alg.includes('fish') || alg.includes('shellfish')) return 'seafood'
    return null
  }
  if (alg.includes('egg')) return 'egg'
  if (alg.includes('fish') || alg.includes('shellfish')) return 'seafood'
  return 'meat'
}

/**
 * Dev-only guard against unknown keys in the dataset. An unrecognised allergen
 * or tag can never match a rule, so it fails open — exactly the failure this
 * module exists to prevent. Loud in dev, silent in production (a warning must
 * never be the thing that breaks a user's app).
 * @returns {string[]} the unknown keys found, for tests to assert on
 */
export function unknownSafetyKeys(ingredient) {
  const bad = [
    ...allergensOf(ingredient).filter((a) => !ALLERGEN_VALUES.has(a)),
    ...tagsOf(ingredient).filter((t) => !TAG_VALUES.has(t)),
  ]
  if (bad.length && import.meta.env?.DEV) {
    console.warn(
      `[dietSafety] ${ingredient?.id}: unknown safety keys ${bad.join(', ')} — ` +
      'these match no rule and so filter nothing.',
    )
  }
  return bad
}

/**
 * Why an ingredient was excluded. The UI must distinguish these — telling
 * someone their allergen was "not ideal for your dosha" would be dangerous
 * understatement.
 * @typedef {'allergen'|'pattern'|null} ExclusionReason
 */

/**
 * Reasons to stop advising and point to a professional. Matched against the
 * user's free-text query and their stored profile flags.
 *
 * Deliberately broad: a false positive costs one extra disclaimer, a false
 * negative means an app confidently advising someone who needs a clinician.
 */
export const SEEK_HELP_TRIGGERS = {
  pregnancy: [
    'pregnan', 'expecting', 'trimester', 'breastfeed', 'nursing', 'lactating',
    'schwanger', 'stillen',
  ],
  medical: [
    'diabet', 'cancer', 'chemo', 'kidney', 'renal', 'liver', 'cirrhosis',
    'thyroid', 'hypothyroid', 'hyperthyroid', 'crohn', 'colitis', 'ibs', 'ibd',
    'ulcer', 'gastritis', 'celiac', 'coeliac', 'heart disease', 'hypertension',
    'blood pressure', 'cholesterol', 'anaemia', 'anemia', 'epilep', 'pcos',
    'endometriosis', 'autoimmune', 'hiv', 'transplant',
  ],
  medication: [
    'medication', 'medicine', 'prescription', 'blood thinner', 'warfarin',
    'insulin', 'antibiotic', 'steroid', 'chemotherapy', 'antidepressant',
    'lithium', 'statin',
  ],
  // Handled with particular care — see needsSofterHandling().
  disorderedEating: [
    'anorexi', 'bulimi', 'binge', 'purge', 'starve', 'starving myself',
    'eating disorder', 'ed recovery', 'orthorexi', 'laxative',
    'lose weight fast', 'stop eating', 'not eating',
  ],
}

/** Standing disclaimer. Shown on every diet surface, not buried in settings. */
export const DIET_DISCLAIMER =
  'General Ayurvedic guidance for wellbeing — not medical or nutritional ' +
  'advice. For conditions, allergies, pregnancy, or medication, please consult ' +
  'a qualified practitioner or your doctor.'

/** Shown when a seek-help trigger fires, in place of specific guidance. */
export const SEEK_HELP_MESSAGE =
  'This is beyond what general Ayurvedic guidance should answer. Please speak ' +
  'to a qualified Ayurvedic practitioner or your doctor — they can account for ' +
  'your full situation in a way this app cannot.'

/** Shown for disordered-eating signals: supportive, and never diet advice. */
export const DISORDERED_EATING_MESSAGE =
  'We are not able to give guidance here, and we do not want to. If food or ' +
  'eating feels distressing, talking to a doctor or a support service is worth ' +
  'far more than anything an app can offer.'

const norm = (s) => String(s ?? '').toLowerCase()

/**
 * Scan free text for seek-help triggers.
 * @param {string} text
 * @returns {{triggered: boolean, categories: string[]}}
 */
export function detectSeekHelp(text) {
  const t = norm(text)
  if (!t.trim()) return { triggered: false, categories: [] }
  const categories = Object.entries(SEEK_HELP_TRIGGERS)
    .filter(([, terms]) => terms.some((term) => t.includes(term)))
    .map(([category]) => category)
  return { triggered: categories.length > 0, categories }
}

/**
 * Disordered-eating signals get a different response from other triggers:
 * supportive language, and NO dietary guidance at all — not even softened.
 * @param {string[]} categories
 */
export function needsSofterHandling(categories) {
  return (categories || []).includes('disorderedEating')
}

/**
 * Pick the message for a set of triggered categories.
 * @param {string[]} categories
 */
export function messageForTriggers(categories) {
  if (needsSofterHandling(categories)) return DISORDERED_EATING_MESSAGE
  return SEEK_HELP_MESSAGE
}

/**
 * Is this ingredient excluded for this user, and why?
 *
 * Allergens are checked FIRST and reported distinctly, because conflating
 * "you're allergic" with "doesn't suit your dosha" would be a dangerous
 * understatement in the UI.
 *
 * @param {object} ingredient
 * @param {{allergens?: string[], patterns?: string[]}} dietPrefs
 * @returns {{excluded: boolean, reason: ExclusionReason, key: string|null}}
 */
export function exclusionFor(ingredient, dietPrefs = {}) {
  const userAllergens = new Set(normaliseKeys(dietPrefs?.allergens))
  const patterns      = new Set(normaliseKeys(dietPrefs?.patterns))
  const tags          = new Set(tagsOf(ingredient))
  const cat           = ingredient?.category

  unknownSafetyKeys(ingredient)   // dev-only warning; no effect on the result

  // ── Allergens first, and ALL of them ──────────────────────────────────
  // Reported before any pattern rule: conflating "you are allergic to this"
  // with "this doesn't fit your diet" would be a dangerous understatement.
  // Sorted so the reported key is deterministic rather than dependent on the
  // order the row happened to list its allergens in.
  const allergenHits = allergensOf(ingredient).filter((a) => userAllergens.has(a)).sort()
  if (allergenHits.length > 0) {
    return {
      excluded: true,
      reason:   'allergen',
      key:      allergenHits[0],
      all:      allergenHits.map((k) => ({ reason: 'allergen', key: k })),
    }
  }

  // ── Pattern rules ─────────────────────────────────────────────────────
  // Each is (does this pattern apply) → (does this food violate it). Every
  // pattern in DIET_PATTERNS must appear here: a declared pattern with no
  // rule is a filter the user believes is on while it does nothing, which is
  // how `allium`/`root` sat dead for a release.
  const hits = []
  const veg    = patterns.has(DIET_PATTERNS.VEGETARIAN)
  const vegan  = patterns.has(DIET_PATTERNS.VEGAN)
  const egget  = patterns.has(DIET_PATTERNS.EGGETARIAN)
  const pesc   = patterns.has(DIET_PATTERNS.PESCATARIAN)
  const jain   = patterns.has(DIET_PATTERNS.JAIN)
  const noOG   = patterns.has(DIET_PATTERNS.NO_ONION_GARLIC)
  const halal  = patterns.has(DIET_PATTERNS.HALAL)
  const kosher = patterns.has(DIET_PATTERNS.KOSHER)
  const kind   = animalKind(ingredient)   // 'egg' | 'seafood' | 'meat' | null

  const add = (key) => hits.push({ reason: 'pattern', key })

  // Any animal food is out for veg/vegan. Whole animal foods are caught by
  // their 'animal' category; composite dishes (category 'other') by their kind
  // — 'meat' (MEAT tag) or 'seafood' (fish/shellfish allergen).
  if ((veg || vegan) && (cat === 'animal' || kind !== null)) add(vegan ? 'vegan' : 'vegetarian')

  // A food that CONTAINS egg or dairy — but isn't itself a whole animal food —
  // still violates veg/vegan (a cake, french toast, custard). The category
  // rules only catch whole animal/dairy foods, so these slip through. This
  // app's "vegetarian" excludes egg (eggetarian is the lacto-ovo pattern), so
  // an egg-containing dish is out for both — even a dairy-category custard that
  // also has egg. Dairy is out for vegan only (lacto-vegetarians keep it), and
  // dairy-category foods are already handled by the rule below, so the dairy
  // check here is only for composites.
  if (cat !== 'animal') {
    const alg = allergensOf(ingredient)
    if ((veg || vegan) && alg.includes('egg')) add(vegan ? 'vegan' : 'vegetarian')
    if (vegan && cat !== 'dairy' && alg.includes('dairy')) add('vegan')
  }
  // Eating styles that admit SOME animal foods. Eggetarian (lacto-ovo) keeps
  // eggs and excludes the rest; pescatarian keeps fish/seafood (and eggs) and
  // excludes meat & poultry. Both are looser than vegetarian, so they only
  // matter when vegetarian/vegan is NOT also set.
  if (egget && (kind === 'meat' || kind === 'seafood' || (cat === 'animal' && kind !== 'egg'))) add('eggetarian')
  if (pesc && kind === 'meat') add('pescatarian')
  if (cat === 'dairy' && vegan) add('vegan')
  // Animal-derived but neither meat nor dairy — honey, which no category rule
  // catches (it is a 'sweetener'). Vegans exclude it; vegetarians do not.
  if (tags.has(DIET_TAGS.ANIMAL_DERIVED) && vegan) add('vegan')
  // Rennet is slaughter-derived, so a cheese made with it is not vegetarian
  // even though its category is dairy. Vegetarians are the group this
  // protects; vegans are already excluded by the dairy rule above.
  if (tags.has(DIET_TAGS.ANIMAL_RENNET) && (veg || vegan)) add(vegan ? 'vegan' : 'vegetarian')
  // Gelatin is boiled from animal bones/skin — slaughter-derived, so like rennet
  // it is excluded for vegetarians as well as vegans.
  if (tags.has(DIET_TAGS.GELATIN) && (veg || vegan)) add(vegan ? 'vegan' : 'vegetarian')
  if (tags.has(DIET_TAGS.ALLIUM) && (jain || noOG)) add(jain ? 'jain' : 'no_onion_garlic')
  if (tags.has(DIET_TAGS.ROOT) && jain) add('jain')
  if (tags.has(DIET_TAGS.NIGHTSHADE) && patterns.has(DIET_PATTERNS.NO_NIGHTSHADE)) add('no_nightshade')

  // Halal / kosher. We cannot certify anything, so these rules are
  // deliberately conservative: they exclude what is definitely out and, for
  // meat, exclude rather than imply approval — silence would read as "this is
  // fine for you", and under-restriction is the harmful direction. The UI
  // wording must stay "we can't confirm", never "this is halal".
  // `kind === 'meat'` extends these to composite meat dishes (fish/egg stay
  // permitted, as they are under both codes).
  if (halal && (tags.has(DIET_TAGS.PORK) || tags.has(DIET_TAGS.ALCOHOL) || cat === 'animal' || kind === 'meat')) add('halal')
  if (kosher && (tags.has(DIET_TAGS.PORK) || tags.has(DIET_TAGS.SHELLFISH) || cat === 'animal' || kind === 'meat')) add('kosher')

  // Single-food observances, keyed on an explicit tag so they exclude exactly
  // the one food and nothing else. (No beef/pork foods exist in the dataset
  // yet, so these currently match nothing — they are correct for when they do.)
  if (patterns.has(DIET_PATTERNS.NO_BEEF) && tags.has(DIET_TAGS.BEEF)) add('no_beef')
  if (patterns.has(DIET_PATTERNS.NO_PORK) && tags.has(DIET_TAGS.PORK)) add('no_pork')

  if (hits.length > 0) {
    return { excluded: true, reason: 'pattern', key: hits[0].key, all: hits }
  }

  return { excluded: false, reason: null, key: null, all: [] }
}

/**
 * Every declared pattern must have a rule in `exclusionFor`. Exported so a
 * test can assert it, because the failure mode is invisible: a pattern with no
 * rule looks exactly like a pattern nothing happens to violate.
 */
export const PATTERNS_WITH_RULES = Object.freeze([
  DIET_PATTERNS.VEGETARIAN, DIET_PATTERNS.VEGAN, DIET_PATTERNS.EGGETARIAN,
  DIET_PATTERNS.PESCATARIAN, DIET_PATTERNS.JAIN, DIET_PATTERNS.NO_ONION_GARLIC,
  DIET_PATTERNS.HALAL, DIET_PATTERNS.KOSHER, DIET_PATTERNS.NO_BEEF,
  DIET_PATTERNS.NO_PORK, DIET_PATTERNS.NO_NIGHTSHADE,
])

/** Exported for the same reason as PATTERNS_WITH_RULES. */
export const ALLERGEN_KEYS = Object.freeze([...ALLERGEN_VALUES])
export const PATTERN_KEYS  = Object.freeze([...PATTERN_VALUES])

/**
 * Hard filter. Anything excluded is REMOVED, never merely down-ranked — the
 * meal composer must not be able to surface an allergen no matter how well it
 * scores on dosha fit.
 *
 * @param {object[]} ingredients
 * @param {{allergens?: string[], patterns?: string[]}} dietPrefs
 */
export function filterSafe(ingredients, dietPrefs = {}) {
  return (ingredients || []).filter((i) => !exclusionFor(i, dietPrefs).excluded)
}
