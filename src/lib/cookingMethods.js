// ─────────────────────────────────────────────────────────────────────────────
//  cookingMethods.js — how preparation shifts a dish's energetics.
//
//  A cooking method is a small, directional transform applied on top of a
//  dish's summed ingredients (see deriveRecipe). It is why "fried potato" and
//  "boiled potato" are not the same food without either being authored twice:
//  the same potato, a different method delta.
//
//  Each entry is a nudge, not an assertion:
//    • dosha — partial {vata,pitta,kapha} added to the ingredient sums before
//      they are clamped to the −1/0/+1 display vocabulary.
//    • guna  — qualities the method imparts (fried → oily, heavy).
//    • rasa  — a taste the method creates (fermentation → sour).
//    • heat  — a virya nudge: +1 toward heating, −1 toward cooling, 0 neutral.
//
//  Sign convention matches the dataset: dosha −1 pacifies / +1 aggravates.
//  Deliberately conservative — a method shifts by at most one step per dosha.
// ─────────────────────────────────────────────────────────────────────────────

export const COOKING_METHODS = {
  raw:       { label: 'raw',         dosha: { vata: 1 },                    guna: ['dry'],           rasa: [], heat: 0 },
  steamed:   { label: 'steamed',     dosha: {},                             guna: ['moist', 'soft'], rasa: [], heat: 0 },
  boiled:    { label: 'boiled',      dosha: {},                             guna: ['moist', 'soft'], rasa: [], heat: 0 },
  simmered:  { label: 'simmered',    dosha: { vata: -1 },                   guna: ['moist', 'soft'], rasa: [], heat: 0 },
  stewed:    { label: 'stewed',      dosha: { vata: -1 },                   guna: ['moist', 'soft'], rasa: [], heat: 0 },
  sauteed:   { label: 'sautéed',     dosha: { pitta: 1 },                   guna: ['oily'],          rasa: [], heat: 1 },
  stirFried: { label: 'stir-fried',  dosha: { pitta: 1 },                   guna: ['oily'],          rasa: [], heat: 1 },
  fried:     { label: 'fried',       dosha: { kapha: 1, pitta: 1, vata: -1 }, guna: ['oily', 'heavy'], rasa: [], heat: 1 },
  roasted:   { label: 'roasted',     dosha: { vata: 1 },                    guna: ['dry'],           rasa: [], heat: 1 },
  baked:     { label: 'baked',       dosha: {},                             guna: ['dry'],           rasa: [], heat: 0 },
  grilled:   { label: 'grilled',     dosha: { pitta: 1 },                   guna: ['dry', 'light'],  rasa: [], heat: 1 },
  tempered:  { label: 'tempered',    dosha: {},                             guna: ['oily'],          rasa: [], heat: 1 }, // tadka
  fermented: { label: 'fermented',   dosha: { pitta: 1, kapha: -1 },        guna: [],                rasa: ['sour'], heat: 1 },
  pickled:   { label: 'pickled',     dosha: { pitta: 1 },                   guna: [],                rasa: ['sour'], heat: 1 },
  none:      { label: '',            dosha: {},                             guna: [],                rasa: [], heat: 0 },
}

export const COOKING_METHOD_KEYS = Object.freeze(Object.keys(COOKING_METHODS))

/** Resolve a method key to its transform, defaulting to a no-op. */
export function methodOf(key) {
  return COOKING_METHODS[key] || COOKING_METHODS.none
}
