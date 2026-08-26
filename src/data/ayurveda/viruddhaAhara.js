// ─────────────────────────────────────────────────────────────────────────────
//  viruddhaAhara.js — incompatible food combinations (विरुद्ध आहार)
//
//  The classical texts don't only rate single foods; they warn that certain
//  COMBINATIONS are incompatible (viruddha) even when each food is wholesome
//  alone — milk with fish, honey heated, curd with sour fruit. This is the one
//  piece of Ayurvedic diet content that has no mainstream equivalent, so it is
//  authored here as first-class, sourced data rather than free-text scattered
//  across ingredients.
//
//  TWO SHAPES
//  ──────────
//    PAIRINGS — two foods that shouldn't meet in the same meal. Matched by TAG
//               (see viruddhaTags below), so "milk × sour fruit" catches lemon,
//               pineapple, and tamarind without listing each.
//    NOTES    — single-food cautions of the samskara/kala kind (heating honey,
//               curd at night). Not a pairing; attaches to one food.
//
//  THE REVIEW GATE (identical to the ingredient diet batches)
//  ──────────────────────────────────────────────────────────
//  Every entry carries `reviewStatus`. Only `'reviewed'` entries are ever read
//  by the app or the website generator — see selectors at the bottom. New
//  entries land as `'draft'` and stay invisible until a human signs them off in
//  docs/diet-review-viruddha-ahara.md. DO NOT flip an entry to 'reviewed' here;
//  that is the founder's call, made in the review doc.
//
//  SEVERITY
//  ────────
//    'classical'   — named incompatible in Caraka/Suśruta/Aṣṭāṅga (cite verse)
//    'traditional' — later tradition / widely taught, not in the saṃhitās
//    'modern'      — a contemporary application of the same principle
// ─────────────────────────────────────────────────────────────────────────────

import { animalKind } from '../../lib/dietSafety.js'

/**
 * Derive the set of viruddha-relevant tags for an ingredient, from fields the
 * ingredient data already carries (id / category / allergens / rasa). Kept
 * conservative — a tag fires only when we're confident — because a false
 * pairing warning erodes trust faster than a missed one.
 * @param {object} ing
 * @returns {Set<string>}
 */
export function viruddhaTags(ing) {
  const t = new Set()
  if (!ing) return t
  const id = ing.id || ''
  const cat = ing.category
  const rasa = ing.rasa || []
  const kind = animalKind(ing)

  // Dairy split: fresh milk vs soured milk behave differently in the texts.
  if (id === 'milk' || id === 'wholeMilk') t.add('milk')
  if (['yoghurt', 'curd', 'buttermilk', 'lassi', 'kefir'].includes(id)) t.add('curd')

  if (id === 'honey') t.add('honey')
  if (id === 'ghee') t.add('ghee')

  // Animal foods.
  if (kind === 'seafood') t.add('fish')
  if (kind === 'meat') t.add('meat')

  // Sour fruits — the curdling risk with milk. Citrus + a few named sour fruits,
  // plus any fruit the data itself rates as sour-tasting.
  if (['lemon', 'lime', 'orange', 'grapefruit', 'pineapple', 'tamarind', 'kokum', 'greenMango', 'rawMango'].includes(id)) t.add('sourFruit')
  if (cat === 'fruit' && rasa.includes('sour')) t.add('sourFruit')

  if (id === 'banana') t.add('banana')
  if (['watermelon', 'muskmelon', 'melon', 'cantaloupe'].includes(id)) t.add('melon')
  if (id === 'radish' || id === 'daikon') t.add('radish')
  if (id === 'salt' || id === 'tableSalt') t.add('salt')

  return t
}

// ── Pairings ──────────────────────────────────────────────────────────────────
// Each: two tag sets that must not co-occur, the reason, a source, a safer swap.
// `a`/`b` are the human labels; `aTags`/`bTags` the matchers.
export const VIRUDDHA_PAIRINGS = [
  {
    id: 'milk-fish',
    a: 'Milk', aTags: ['milk'],
    b: 'Fish', bTags: ['fish'],
    severity: 'classical',
    reason: 'Fish is heating and milk is cooling — opposed potencies (vīrya viruddha) the texts single out as a cause of skin disorders and blocked channels.',
    saferSwap: 'Keep them to separate meals, a few hours apart.',
    source: { text: 'CS', verse: 'Sū. 26.84' },
    reviewStatus: 'draft',
  },
  {
    id: 'milk-meat',
    a: 'Milk', aTags: ['milk'],
    b: 'Meat', bTags: ['meat'],
    severity: 'classical',
    reason: 'Two heavy, nourishing foods that overload digestion when taken together; named among the incompatible combinations.',
    saferSwap: 'Take milk on its own, away from a meat meal.',
    source: { text: 'CS', verse: 'Sū. 26.85' },
    reviewStatus: 'draft',
  },
  {
    id: 'milk-sour-fruit',
    a: 'Milk', aTags: ['milk'],
    b: 'Sour fruit', bTags: ['sourFruit'],
    severity: 'classical',
    reason: 'Sour curdles milk in the stomach; the combination is held to produce toxins (āma) and disturb digestion.',
    saferSwap: 'Eat the fruit on its own; if you want both, leave a clear gap.',
    source: { text: 'CS', verse: 'Sū. 26.84' },
    reviewStatus: 'draft',
  },
  {
    id: 'milk-banana',
    a: 'Milk', aTags: ['milk'],
    b: 'Banana', bTags: ['banana'],
    severity: 'traditional',
    reason: 'A heavy, congesting pair in later tradition — taught to dull digestion (agni) and increase Kapha and āma, despite each being wholesome alone.',
    saferSwap: 'Have banana with a pinch of cardamom instead of with milk.',
    source: { text: null, verse: null },
    reviewStatus: 'draft',
  },
  {
    id: 'milk-salt',
    a: 'Milk', aTags: ['milk'],
    b: 'Salt', bTags: ['salt'],
    severity: 'classical',
    reason: 'Salt with milk is named among the incompatible combinations.',
    saferSwap: 'Keep salt out of milk-based dishes.',
    source: { text: 'CS', verse: 'Sū. 26.84' },
    reviewStatus: 'draft',
  },
  {
    id: 'honey-ghee-equal',
    a: 'Honey', aTags: ['honey'],
    b: 'Ghee', bTags: ['ghee'],
    severity: 'classical',
    reason: 'Honey and ghee in equal quantity (by weight) are specifically called incompatible. Unequal amounts are considered fine.',
    saferSwap: 'If combining, keep the amounts clearly unequal — never one-to-one.',
    source: { text: 'CS', verse: 'Sū. 26.84' },
    reviewStatus: 'draft',
  },
  {
    id: 'curd-sour-fruit',
    a: 'Curd / yoghurt', aTags: ['curd'],
    b: 'Fruit', bTags: ['sourFruit', 'banana'],
    severity: 'modern',
    reason: 'The fruit-and-yoghurt smoothie is a modern instance of the milk-with-sour caution — soured dairy blended with fruit is held to sit heavily and form āma.',
    saferSwap: 'Take fruit on its own, or use a plant base instead of yoghurt.',
    source: { text: null, verse: null },
    reviewStatus: 'draft',
  },
  {
    id: 'melon-milk',
    a: 'Melon', aTags: ['melon'],
    b: 'Milk', bTags: ['milk'],
    severity: 'traditional',
    reason: 'Melons are taught to be eaten alone; paired with milk they are held to disturb digestion.',
    saferSwap: 'Eat melon by itself, away from other foods.',
    source: { text: null, verse: null },
    reviewStatus: 'draft',
  },
  {
    id: 'milk-radish',
    a: 'Milk', aTags: ['milk'],
    b: 'Radish', bTags: ['radish'],
    severity: 'classical',
    reason: 'Pungent radish with milk is named among the incompatible combinations.',
    saferSwap: 'Keep radish dishes separate from milk.',
    source: { text: 'CS', verse: 'Sū. 26.84' },
    reviewStatus: 'draft',
  },
]

// ── Single-food notes (samskara / kāla viruddha) ────────────────────────────────
// Not pairings — a caution about HOW or WHEN one food is taken.
export const VIRUDDHA_NOTES = [
  {
    id: 'honey-heated',
    tags: ['honey'],
    severity: 'classical',
    reason: 'Honey should not be heated or added to hot liquids — processing by heat (saṃskāra viruddha) is held to make it harmful and āma-forming.',
    saferSwap: 'Add honey only once a drink has cooled to warm; never cook with it.',
    source: { text: 'AH', verse: 'Sū. 8' },
    reviewStatus: 'draft',
  },
  {
    id: 'curd-night',
    tags: ['curd'],
    severity: 'traditional',
    reason: 'Curd at night, and curd heated, are cautioned against (kāla / saṃskāra viruddha) — held to increase Kapha and congestion.',
    saferSwap: 'Take curd at midday; never heat it. Buttermilk is the lighter evening option.',
    source: { text: null, verse: null },
    reviewStatus: 'draft',
  },
]

// ── Selectors — the ONLY way the rest of the app reads this data ────────────────
// Both filter to reviewStatus 'reviewed', so drafts never surface.

const REVIEWED_PAIRINGS = VIRUDDHA_PAIRINGS.filter((p) => p.reviewStatus === 'reviewed')
const REVIEWED_NOTES = VIRUDDHA_NOTES.filter((n) => n.reviewStatus === 'reviewed')

const hasAny = (tagSet, wanted) => wanted.some((w) => tagSet.has(w))

/**
 * Reviewed pairings whose two sides are both present among the given foods.
 * @param {object[]} ingredients  resolved ingredient objects
 * @returns {Array<{pairing, aFood, bFood}>}
 */
export function viruddhaInMeal(ingredients) {
  const items = (ingredients || []).filter(Boolean).map((ing) => ({ ing, tags: viruddhaTags(ing) }))
  const out = []
  for (const p of REVIEWED_PAIRINGS) {
    const aFood = items.find((it) => hasAny(it.tags, p.aTags))
    const bFood = items.find((it) => it.ing.id !== aFood?.ing.id && hasAny(it.tags, p.bTags))
    if (aFood && bFood) out.push({ pairing: p, aFood: aFood.ing, bFood: bFood.ing })
  }
  return out
}

/**
 * Reviewed pairings + notes that involve a single ingredient — for its food
 * page ("Don't combine X with…"). Returns the OTHER side's label for pairings.
 * @param {object} ing
 * @returns {{pairings: Array<{pairing, otherLabel}>, notes: object[]}}
 */
export function viruddhaForIngredient(ing) {
  const tags = viruddhaTags(ing)
  if (tags.size === 0) return { pairings: [], notes: [] }
  const pairings = []
  for (const p of REVIEWED_PAIRINGS) {
    if (hasAny(tags, p.aTags)) pairings.push({ pairing: p, otherLabel: p.b })
    else if (hasAny(tags, p.bTags)) pairings.push({ pairing: p, otherLabel: p.a })
  }
  const notes = REVIEWED_NOTES.filter((n) => hasAny(tags, n.tags))
  return { pairings, notes }
}

/** Coverage counts for the review doc / dashboards. */
export function viruddhaCoverage() {
  return {
    pairings: { total: VIRUDDHA_PAIRINGS.length, reviewed: REVIEWED_PAIRINGS.length },
    notes: { total: VIRUDDHA_NOTES.length, reviewed: REVIEWED_NOTES.length },
  }
}
