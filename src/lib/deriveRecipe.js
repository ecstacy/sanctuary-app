// ─────────────────────────────────────────────────────────────────────────────
//  deriveRecipe.js — a dish's energetics, COMPUTED from its ingredients.
//
//  The scalable core of the food database. A composite dish is not authored
//  with its own hand-rated dosha/rasa/guna — those drift from the ingredients
//  underneath and are the source of every consistency bug (the meat-tag gap
//  being the last). Instead a recipe declares only culinary facts —
//  `ingredientIds` + a cooking `method` — and this derives an ingredient-shaped
//  object the rest of the app consumes exactly like a hand-authored food.
//
//  What is derived, and how:
//    • doshaEffect — Σ ingredient effects + method delta, clamped to −1/0/+1.
//    • rasa        — the tastes present, most-common first, + any the method adds.
//    • virya       — a heating/cooling vote across ingredients + the method nudge.
//    • vipaka      — the majority post-digestive taste.
//    • guna        — the qualities present + the method's (fried → oily, heavy).
//    • allergens   — the union (via allergensOf, so category-implied ones count).
//    • dietTags    — the union, PLUS a 'meat' tag when any ingredient is meat, so
//      veg/pescatarian/halal exclusion falls out automatically (no per-dish tag).
//
//  A recipe is only as reviewed as its weakest input: an ingredient that is
//  draft or unknown is skipped, and a recipe left with no resolvable ingredients
//  derives nothing (null) rather than a hollow guess.
// ─────────────────────────────────────────────────────────────────────────────

import { methodOf } from './cookingMethods'
import { allergensOf, animalKind, DIET_TAGS } from './dietSafety'

const DOSHAS = ['vata', 'pitta', 'kapha']
const clampSign = (n) => (n > 0 ? 1 : n < 0 ? -1 : 0)

// Unique, first-seen order, capped. Small helper for merging taste/quality lists.
function mergeUnique(lists, cap = Infinity) {
  const out = []
  for (const list of lists) for (const v of list || []) if (v && !out.includes(v)) out.push(v)
  return cap === Infinity ? out : out.slice(0, cap)
}

// Most-common first (ingredients that share a taste weigh more), then capped.
function byFrequency(lists, cap) {
  const count = new Map()
  for (const list of lists) for (const v of list || []) count.set(v, (count.get(v) || 0) + 1)
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v).slice(0, cap)
}

const VIRYA_HEAT = { heating: 1, cooling: -1, neutral: 0 }

/**
 * Derive a full ingredient-shaped food from a recipe definition.
 * @param {{id,name,aliases?,ingredientIds:string[],method?:string,note?:string,reviewStatus?:string,category?:string}} recipe
 * @param {(id:string)=>object|null|undefined} resolve  id → ingredient (reviewed only)
 * @returns {object|null} an INGREDIENTS-compatible entry, or null if nothing resolves
 */
export function deriveRecipe(recipe, resolve) {
  const method = methodOf(recipe.method)
  const parts = (recipe.ingredientIds || []).map(resolve).filter(Boolean)
  if (parts.length === 0) return null

  // Dosha — sum the constituents, add the method delta, clamp to the vocabulary.
  const doshaEffect = {}
  for (const d of DOSHAS) {
    const sum = parts.reduce((a, p) => a + (p.doshaEffect?.[d] || 0), 0) + (method.dosha[d] || 0)
    doshaEffect[d] = clampSign(sum)
  }

  // Taste, post-digestive taste, qualities.
  const rasa = mergeUnique([byFrequency(parts.map((p) => p.rasa), 3), method.rasa], 4)
  const vipaka = byFrequency(parts.map((p) => (p.vipaka ? [p.vipaka] : [])), 1)[0] || 'sweet'
  const guna = mergeUnique([byFrequency(parts.map((p) => p.guna), 3), method.guna], 4)

  // Virya — a heating/cooling vote plus the method nudge.
  const heatVote = parts.reduce((a, p) => a + (VIRYA_HEAT[p.virya] || 0), 0) + method.heat
  const virya = heatVote > 0 ? 'heating' : heatVote < 0 ? 'cooling' : 'neutral'

  // Safety — allergens and diet tags flow up from the parts. Meat is added when
  // any part is meat, so composite meat dishes are excluded automatically.
  const allergens = mergeUnique(parts.map((p) => allergensOf(p)))
  const dietTags = mergeUnique(parts.map((p) => p.dietTags))
  if (parts.some((p) => animalKind(p) === 'meat') && !dietTags.includes(DIET_TAGS.MEAT)) {
    dietTags.push(DIET_TAGS.MEAT)
  }

  const names = parts.map((p) => p.name).join(', ')
  const label = method.label ? ` (${method.label})` : ''

  return {
    id: recipe.id,
    name: recipe.name,
    aliases: recipe.aliases || [],
    category: recipe.category || 'other',
    rasa,
    virya,
    vipaka,
    guna,
    doshaEffect,
    ...(allergens.length ? { allergens } : {}),
    ...(dietTags.length ? { dietTags } : {}),
    source: {
      text: 'derived',
      note: `Derived recipe: ${names}${label}. Dosha, taste, vīrya and qualities computed from its constituents and cooking method — not hand-rated.`,
    },
    confidence: 'medium',
    reviewStatus: recipe.reviewStatus || 'draft',
    isDerivedRecipe: true,
  }
}

/**
 * Derive a whole map of recipes into an id → food object map, dropping any that
 * resolve to nothing. Used to fold recipes into the ingredient collection.
 */
export function deriveRecipes(recipes, resolve) {
  const out = {}
  for (const r of Object.values(recipes)) {
    const derived = deriveRecipe(r, resolve)
    if (derived) out[r.id] = derived
  }
  return out
}
