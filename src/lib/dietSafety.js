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
  NIGHTSHADE:'nightshade',
}

/**
 * Dietary patterns, kept separate from allergens: an allergy is a safety
 * constraint, a pattern is a preference. Both filter, but they're reported
 * differently — "excluded (allergy)" vs "excluded (your diet)".
 */
export const DIET_PATTERNS = {
  VEGETARIAN:      'vegetarian',
  VEGAN:           'vegan',
  JAIN:            'jain',            // no roots/alliums
  NO_ONION_GARLIC: 'no_onion_garlic', // sattvic / observance
  HALAL:           'halal',
  KOSHER:          'kosher',
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
  const userAllergens = new Set(dietPrefs.allergens || [])
  const hit = (ingredient?.allergens || []).find((a) => userAllergens.has(a))
  if (hit) return { excluded: true, reason: 'allergen', key: hit }

  const patterns = new Set(dietPrefs.patterns || [])
  const cat = ingredient?.category
  if (cat === 'animal' && (patterns.has(DIET_PATTERNS.VEGETARIAN) || patterns.has(DIET_PATTERNS.VEGAN))) {
    return { excluded: true, reason: 'pattern', key: patterns.has(DIET_PATTERNS.VEGAN) ? 'vegan' : 'vegetarian' }
  }
  if (cat === 'dairy' && patterns.has(DIET_PATTERNS.VEGAN)) {
    return { excluded: true, reason: 'pattern', key: 'vegan' }
  }
  const tags = new Set(ingredient?.dietTags || [])
  if (tags.has('allium') && (patterns.has(DIET_PATTERNS.NO_ONION_GARLIC) || patterns.has(DIET_PATTERNS.JAIN))) {
    return { excluded: true, reason: 'pattern', key: patterns.has(DIET_PATTERNS.JAIN) ? 'jain' : 'no_onion_garlic' }
  }
  if (tags.has('root') && patterns.has(DIET_PATTERNS.JAIN)) {
    return { excluded: true, reason: 'pattern', key: 'jain' }
  }

  return { excluded: false, reason: null, key: null }
}

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
