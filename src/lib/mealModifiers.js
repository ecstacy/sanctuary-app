// ─────────────────────────────────────────────────────────────────────────────
//  mealModifiers.js — what a descriptor does to the reading.
//
//  Increment 2 of the input-understanding rework (#57). The structured parser
//  (#56) keeps leftover descriptors on each item; here they earn their keep:
//
//   • PREP_MODIFIERS — a preparation nudges the dosha math. Same sign convention
//     as food doshaEffect (−1 pacifies / +1 aggravates), kept SMALL and clamped
//     (like portionWeight) so the verdict stays directional, not a calorie count.
//     "iced coffee" reads cooler than hot; "fried" reads heavier and hotter.
//
//   • IMPLIED_ADDITIONS — a descriptor that implies an undeclared companion food
//     ("milky"/"latte" → milk, "sweetened" → sugar). Injected as real, removable
//     items so the reading reflects what was actually drunk, and the user can
//     correct it via the editable chips.
//
//  Pure data + helpers, no imports — mealCheck.js stays a supabase-free module.
// ─────────────────────────────────────────────────────────────────────────────

const DOSHAS = ['vata', 'pitta', 'kapha']

// Preparation → bounded dosha delta. Cooking method changes the qualities:
// frying adds oil+heat (Kapha, Pitta); dry heat lightens (−Kapha) but dries
// (+Vata); cold pacifies Pitta but unsettles Vata/Kapha.
export const PREP_MODIFIERS = {
  iced:      { pitta: -0.3, vata: 0.2, kapha: 0.2 },
  chilled:   { pitta: -0.3, vata: 0.2, kapha: 0.2 },
  cold:      { pitta: -0.2, vata: 0.2, kapha: 0.2 },
  frozen:    { pitta: -0.3, vata: 0.3, kapha: 0.2 },
  fried:     { pitta: 0.3, kapha: 0.4 },
  'deep-fried': { pitta: 0.4, kapha: 0.5 },
  crispy:    { kapha: 0.3, pitta: 0.2 },
  grilled:   { kapha: -0.3, vata: 0.2 },
  roasted:   { kapha: -0.3, vata: 0.2 },
  toasted:   { kapha: -0.2, vata: 0.2 },
  baked:     { kapha: -0.1 },
  steamed:   { pitta: -0.1, kapha: -0.1 },
  boiled:    { kapha: -0.1 },
  poached:   { pitta: -0.1 },
  raw:       { vata: 0.3 },
  spicy:     { pitta: 0.4, vata: 0.2, kapha: -0.2 },
  buttered:  { kapha: 0.3, pitta: 0.1 },
  cheesy:    { kapha: 0.4, pitta: 0.1 },
  smoked:    { pitta: 0.3, vata: 0.2 },
  pickled:   { pitta: 0.3, kapha: 0.2 },
  salted:    { pitta: 0.2, kapha: 0.2 },
  burnt:     { pitta: 0.3, vata: 0.2 },
}

// Descriptor → companion ingredient(s) to infer, each with a modest portion.
// Only unambiguous implications; everything else is left to the user's chips.
export const IMPLIED_ADDITIONS = {
  milky:      [{ id: 'milk', portion: 0.6 }],
  latte:      [{ id: 'milk', portion: 0.7 }],
  cappuccino: [{ id: 'milk', portion: 0.6 }],
  macchiato:  [{ id: 'milk', portion: 0.4 }],
  creamy:     [{ id: 'milk', portion: 0.5 }],
  sweetened:  [{ id: 'caneSugar', portion: 0.4 }],
  sugary:     [{ id: 'caneSugar', portion: 0.5 }],
}

// Sum the prep deltas for a set of modifiers, clamped so prep can nudge but
// never dominate a food's own effect. Returns null when no modifier applies.
export function prepDeltaFor(modifiers = []) {
  const acc = { vata: 0, pitta: 0, kapha: 0 }
  let any = false
  for (const m of modifiers) {
    const d = PREP_MODIFIERS[m]
    if (!d) continue
    any = true
    for (const k of DOSHAS) acc[k] += d[k] || 0
  }
  if (!any) return null
  for (const k of DOSHAS) acc[k] = Math.max(-0.6, Math.min(0.6, acc[k]))
  return acc
}

// Companion foods implied by a set of modifiers (deduped by id).
export function impliedAdditionsFor(modifiers = []) {
  const out = []
  const seen = new Set()
  for (const m of modifiers) {
    for (const add of IMPLIED_ADDITIONS[m] || []) {
      if (seen.has(add.id)) continue
      seen.add(add.id)
      out.push(add)
    }
  }
  return out
}
