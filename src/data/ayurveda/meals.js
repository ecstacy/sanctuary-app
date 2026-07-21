// ─────────────────────────────────────────────────────────────────────────────
//  meals.js — meal-idea templates
//
//  A template is a NAMED COMBINATION OF INGREDIENT IDS. That is nearly all it
//  is, and the restraint is the point.
//
//  ⚠ A TEMPLATE ASSERTS NO AYURVEDIC FACTS.
//  ────────────────────────────────────────
//  There is no `doshaEffect` here, and there is no authored "why this suits
//  Vata" prose. Both are DERIVED at runtime from the constituent ingredients
//  (lib/mealComposer.js → `explainIdea`). If a dish were allowed to carry its
//  own dosha rating, that rating could drift from — or quietly contradict —
//  the reviewed ingredient data underneath it, and nothing would catch it.
//  Deriving means a dish can only ever say what its ingredients already say.
//
//  What a template MAY carry is culinary, not classical: the name, which
//  ingredients, when it is eaten, and a preparation hint. Those are cooking
//  facts, and getting one wrong produces a bad recipe rather than false
//  Ayurvedic guidance.
//
//  ── THE REVIEW GATE ────────────────────────────────────────────────────────
//  Same gate as ingredients: only `reviewStatus: 'reviewed'` templates ever
//  reach a user. But the REVIEW IS A DIFFERENT KIND OF CHECK — "is this a real
//  dish, and are these the right ingredients for it?" is a culinary question,
//  not a Charaka one. It should be much faster than an ingredient batch.
//
//  ── NO RECIPES ─────────────────────────────────────────────────────────────
//  No quantities, no steps, no times. Meal IDEAS only (diet-feature-plan §5).
//  That keeps us out of cooking-instruction liability and away from implying a
//  precision the tradition doesn't have. `prep` is a one-line hint, not a
//  method.
//
//  ── CORE VS OPTIONAL ───────────────────────────────────────────────────────
//  `coreIds` define the dish: remove one and it is a different meal, so if any
//  core ingredient is filtered out (allergen, pattern) the WHOLE idea is
//  dropped rather than silently served without it. `optionalIds` are additions
//  that get individually filtered — a dish is not ruined by dropping them.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} MealTemplate
 * @property {string}   id
 * @property {string}   name          Culinary name. Not a claim.
 * @property {string[]} coreIds       Ingredient ids that DEFINE the dish
 * @property {string[]} [optionalIds] Additions, filtered individually
 * @property {('morning'|'midday'|'evening')[]} slots
 * @property {('spring'|'summer'|'autumn'|'winter')[]} [seasons]
 * @property {string}   [prep]        ONE-LINE hint. Never a method.
 * @property {'draft'|'reviewed'} reviewStatus
 *
 * Deliberately absent: doshaEffect, whyFavor, confidence, source. A template
 * makes no Ayurvedic claim, so it needs no provenance of its own — its
 * provenance is whatever its ingredients carry.
 */

/** @type {Record<string, MealTemplate>} */
export const MEAL_TEMPLATES = {
  // ── Morning ───────────────────────────────────────────────────────────────
  spicedOatPorridge: {
    id: 'spicedOatPorridge',
    name: 'Warm spiced oat porridge with ghee',
    coreIds: ['oats', 'ghee'],
    optionalIds: ['gingerDry', 'jaggery', 'almond'],
    slots: ['morning'],
    seasons: ['autumn', 'winter'],
    prep: 'Cooked soft with plenty of liquid rather than eaten as raw muesli.',
    reviewStatus: 'draft',
  },

  stewedAppleBreakfast: {
    id: 'stewedAppleBreakfast',
    name: 'Stewed apple with cardamom',
    coreIds: ['appleStewed'],
    optionalIds: ['ghee', 'jaggery'],
    slots: ['morning'],
    prep: 'Stewed until soft and eaten warm.',
    reviewStatus: 'draft',
  },

  ricePorridge: {
    id: 'ricePorridge',
    name: 'Soft rice porridge with ghee',
    coreIds: ['basmatiRice', 'ghee'],
    optionalIds: ['gingerFresh', 'cumin'],
    slots: ['morning', 'evening'],
    prep: 'Cooked well past the point of firmness, loose rather than fluffy.',
    reviewStatus: 'draft',
  },

  honeyWarmWater: {
    id: 'honeyWarmWater',
    name: 'Honey with lukewarm water',
    coreIds: ['honey'],
    slots: ['morning'],
    seasons: ['spring'],
    // The one preparation rule in this dataset stated as a prohibition.
    prep: 'Lukewarm, never hot — heating honey is classically held to spoil it.',
    reviewStatus: 'draft',
  },

  // ── Midday ────────────────────────────────────────────────────────────────
  kitchari: {
    id: 'kitchari',
    name: 'Mung dal kitchari',
    coreIds: ['mungDal', 'basmatiRice', 'ghee'],
    optionalIds: ['gingerFresh', 'cumin', 'turmeric', 'asafoetida', 'corianderSeed'],
    slots: ['midday', 'evening'],
    prep: 'Cooked together until soft enough to need no chewing.',
    reviewStatus: 'draft',
  },

  riceDalGhee: {
    id: 'riceDalGhee',
    name: 'Rice and dal with ghee',
    coreIds: ['basmatiRice', 'mungDal', 'ghee'],
    optionalIds: ['cumin', 'turmeric', 'asafoetida'],
    slots: ['midday'],
    reviewStatus: 'draft',
  },

  chickpeaCurry: {
    id: 'chickpeaCurry',
    name: 'Spiced chickpeas with rice',
    coreIds: ['chickpea', 'basmatiRice'],
    optionalIds: ['asafoetida', 'cumin', 'gingerFresh', 'turmeric', 'onionCooked'],
    slots: ['midday'],
    prep: 'Soaked well and cooked thoroughly with digestive spices.',
    reviewStatus: 'draft',
  },

  chapatiSabzi: {
    id: 'chapatiSabzi',
    name: 'Chapati with cooked greens',
    coreIds: ['wheat', 'spinach'],
    optionalIds: ['ghee', 'cumin', 'garlic', 'onionCooked'],
    slots: ['midday'],
    prep: 'Greens cooked in fat rather than eaten raw.',
    reviewStatus: 'draft',
  },

  barleySoup: {
    id: 'barleySoup',
    name: 'Barley and vegetable soup',
    coreIds: ['barley'],
    optionalIds: ['blackPepper', 'gingerDry', 'spinach', 'onionCooked', 'turmeric'],
    slots: ['midday'],
    seasons: ['spring'],
    reviewStatus: 'draft',
  },

  buttermilkRice: {
    id: 'buttermilkRice',
    name: 'Rice with buttermilk',
    coreIds: ['basmatiRice', 'buttermilk'],
    optionalIds: ['cumin', 'corianderSeed'],
    slots: ['midday'],
    seasons: ['summer'],
    prep: 'Buttermilk thinned with water, not thick yoghurt.',
    reviewStatus: 'draft',
  },

  potatoWithGhee: {
    id: 'potatoWithGhee',
    name: 'Mashed potato with ghee and cumin',
    coreIds: ['potato', 'ghee'],
    optionalIds: ['cumin', 'blackPepper', 'asafoetida'],
    slots: ['midday'],
    prep: 'Mashed with fat rather than baked dry.',
    reviewStatus: 'draft',
  },

  // ── Evening ───────────────────────────────────────────────────────────────
  uradDalStew: {
    id: 'uradDalStew',
    name: 'Slow-cooked urad dal',
    coreIds: ['uradDal'],
    optionalIds: ['ghee', 'asafoetida', 'gingerFresh', 'garlic'],
    slots: ['evening'],
    seasons: ['autumn', 'winter'],
    prep: 'Long-cooked with digestive spices — it is heavy without them.',
    reviewStatus: 'draft',
  },

  spicedMilk: {
    id: 'spicedMilk',
    name: 'Warm spiced milk',
    coreIds: ['milk'],
    optionalIds: ['gingerDry', 'turmeric', 'jaggery'],
    slots: ['evening'],
    prep: 'Warmed and spiced rather than drunk cold. Not taken with a salty or sour meal.',
    reviewStatus: 'draft',
  },

  vegetableSoupSesame: {
    id: 'vegetableSoupSesame',
    name: 'Warm vegetable soup with sesame oil',
    coreIds: ['sesameOil', 'spinach'],
    optionalIds: ['gingerFresh', 'cumin', 'blackPepper', 'onionCooked'],
    slots: ['evening'],
    seasons: ['autumn', 'winter'],
    reviewStatus: 'draft',
  },
}

/** Stable list form. Includes drafts — filter before display. */
export const ALL_MEAL_TEMPLATES = Object.values(MEAL_TEMPLATES)
