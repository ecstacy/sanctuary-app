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
//  If a CORE ingredient is filtered out (allergen, pattern) the WHOLE idea is
//  dropped. If an OPTIONAL one is, the dish survives without it. So this split
//  is a filtering decision, and it decides what a restricted user gets to see.
//
//  ⚠ THE RULE (agreed at review, 2026-07-21):
//      core = the ingredients that carry the meal's BULK AND IDENTITY.
//      Fats and spices are OPTIONAL unless the dish is nothing without them.
//
//  The first draft got this wrong in a specific and instructive way: things
//  went in `core` because they appeared in the dish's NAME. "Porridge with
//  ghee" had core ghee, so a dairy-allergic user lost the porridge entirely
//  instead of being offered it without ghee. Six of fourteen were affected.
//
//  Corollary: a NAME must not promise an optional ingredient either, or the
//  same user is shown a dish whose name references something we just removed.
//  Several names were shortened for exactly this reason.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @typedef {object} MealTemplate
 * @property {string}   id
 * @property {string}   name          Culinary name. Not a claim.
 * @property {string[]} coreIds       Ingredient ids that DEFINE the dish
 * @property {string[]} [optionalIds] Additions, filtered individually
 * @property {'meal'|'preparation'|'practice'} [kind]
 *   Defaults to 'meal'. Added at review batch 3, because two rows were not
 *   meals and saying so is more useful than forcing them into the shape:
 *     • 'preparation' — a component rather than a full meal (mashed potato).
 *       Still shown on /meals, labelled, because you do eat it.
 *     • 'practice'    — a dinacharya observance, not food (honey in lukewarm
 *       water). NOT shown on /meals at all; it belongs on the daily-routine
 *       surface, which is not wired up yet.
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
    name: 'Warm spiced oat porridge',
    coreIds: ['oats'],
    optionalIds: ['ghee', 'gingerDry', 'jaggery', 'almond'],
    slots: ['morning'],
    seasons: ['autumn', 'winter'],
    prep: 'Cooked soft with plenty of liquid rather than eaten as raw muesli.',
    reviewStatus: 'draft',
  },

  stewedAppleBreakfast: {
    id: 'stewedAppleBreakfast',
    name: 'Stewed apple',
    coreIds: ['appleStewed'],
    // Cardamom added to the dataset at batch 3 but still DRAFT, so
    // getIngredient hides it and the composer simply won't list it yet. The
    // name no longer promises it either way — same naming rule as the fats.
    optionalIds: ['cardamom', 'ghee', 'jaggery'],
    slots: ['morning'],
    prep: 'Stewed until soft and eaten warm.',
    reviewStatus: 'draft',
  },

  ricePorridge: {
    id: 'ricePorridge',
    name: 'Soft rice porridge',
    coreIds: ['basmatiRice'],
    optionalIds: ['ghee', 'gingerFresh', 'cumin'],
    slots: ['morning', 'evening'],
    prep: 'Cooked well past the point of firmness, loose rather than fluffy.',
    reviewStatus: 'draft',
  },

  honeyWarmWater: {
    id: 'honeyWarmWater',
    name: 'Honey with lukewarm water',
    // Not a meal — a daily-routine observance. Excluded from /meals entirely
    // rather than listed among breakfast ideas.
    kind: 'practice',
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
    coreIds: ['mungDal', 'basmatiRice'],
    optionalIds: ['ghee', 'gingerFresh', 'cumin', 'turmeric', 'asafoetida', 'corianderSeed'],
    slots: ['midday', 'evening'],
    prep: 'Cooked together until soft enough to need no chewing.',
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
    // Review batch 3: kept GENERIC. Spinach was in core, which quietly turned
    // "sabzi" — any cooked vegetable — into "spinach", far narrower than the
    // dish actually is. Wheat is the only true core; the vegetable is now
    // whatever the user has. More vegetables are queued for the next
    // ingredient batch, at which point this gains real alternatives.
    name: 'Chapati with cooked vegetables',
    coreIds: ['wheat'],
    optionalIds: ['spinach', 'ghee', 'cumin', 'garlic', 'onionCooked'],
    slots: ['midday'],
    prep: 'Vegetables cooked in fat rather than eaten raw.',
    reviewStatus: 'draft',
  },

  barleySoup: {
    id: 'barleySoup',
    name: 'Barley soup',
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
    prep: 'Use diluted takra — cultured yoghurt churned with water — rather than plain thick yoghurt. Takra is itself a spectrum of preparations, so this points at the method, not at one exact product.',
    reviewStatus: 'draft',
  },

  potatoWithGhee: {
    id: 'potatoWithGhee',
    name: 'Mashed potato',
    // A component, not a full meal. Shown, but labelled as such.
    kind: 'preparation',
    coreIds: ['potato'],
    optionalIds: ['ghee', 'cumin', 'blackPepper', 'asafoetida'],
    slots: ['midday'],
    // Worth noting what the rule buys here: with ghee optional, the derived
    // verdict for the core alone is "increases Vata" — which is TRUE of dry
    // mashed potato. The old core-ghee version derived a gentler verdict that
    // only held if you added the fat.
    prep: 'Mashed with ghee or butter rather than baked dry — the fat is what offsets the dryness.',
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

  // Review batch 3: `vegetableSoupSesame` REMOVED. It was a mixed-vegetable
  // soup in name and a spinach soup in fact, because spinach is the only green
  // in the dataset. Falling back to one arbitrary vegetable misrepresents the
  // dish, and there is no honest version of it until the vegetable set exists.
  // Re-add with the next ingredient batch.

}

/** Stable list form. Includes drafts — filter before display. */
export const ALL_MEAL_TEMPLATES = Object.values(MEAL_TEMPLATES)
