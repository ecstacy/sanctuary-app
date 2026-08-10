// ─────────────────────────────────────────────────────────────────────────────
//  consumableForms.js — turn a pacifying ingredient into an ACTIONABLE step.
//
//  Meal Check's rebalance section used to list bare ingredient names ("Fennel",
//  "Cumin") — which don't tell the user what to actually do. This maps each
//  common remedy food to a consumable form + a short how-to ("steep as a tea",
//  "whisk into a sweet lassi"), so the suggestion is a next step, not a lookup.
//
//  Two layers:
//    • curatedFor(target)  — a few marquee combos per raised dosha (CCF cooler,
//      sweet lassi, ginger tea). Each is gated by a safety predicate so we never
//      suggest dairy to a vegan, etc.
//    • formFor(ingredient) — a per-ingredient form for whatever the engine
//      surfaced, with a category fallback so every food gets a usable how-to.
//
//  Copy is English here (domain content, like DOSHA_DATA); de/hi fall back to it
//  until localized. Kinds: 'drink' | 'eat' drive the icon and grouping.
// ─────────────────────────────────────────────────────────────────────────────

// Per-ingredient forms for the foods most likely to surface as remedies.
// `title` overrides the ingredient's own name when the form has a distinct name
// (e.g. a tea); otherwise the localized ingredient name is used.
const BY_ID = {
  // Pitta coolers
  fennel:        { kind: 'drink', emoji: '🍵', howTo: 'Chew ½ tsp of seeds after eating, or steep them in hot water for a cooling tea.' },
  corianderSeed: { kind: 'drink', emoji: '🍵', howTo: 'Steep 1 tsp of crushed seeds in hot water for 5 minutes; sip warm.' },
  corianderLeaf: { kind: 'eat',   emoji: '🌿', howTo: 'Scatter fresh over your next plate, or blend into a cooling chutney.' },
  cumin:         { kind: 'drink', emoji: '🍵', howTo: 'Dry-roast lightly, then steep ½ tsp in hot water — an easy after-meal digestive.' },
  cardamom:      { kind: 'drink', emoji: '🍵', howTo: 'Crush a pod or two into warm water or milk — cooling and fragrant.' },
  mintLeaf:      { kind: 'drink', emoji: '🌿', howTo: 'Steep a few fresh leaves for a cooling mint tea, or add to water.' },
  cucumber:      { kind: 'eat',   emoji: '🥒', howTo: 'Eat a few slices fresh, or blend into a cooling raita.' },
  coconut:       { kind: 'eat',   emoji: '🥥', howTo: 'A little fresh coconut on its own — sweet and cooling.' },
  coconutWater:  { kind: 'drink', emoji: '🥥', howTo: 'Sip a small glass at room temperature.' },
  rockCandy:     { kind: 'drink', emoji: '🍬', howTo: 'Dissolve a little in cool water for a gently sweet, cooling drink.' },
  amla:          { kind: 'eat',   emoji: '🫐', howTo: 'A spoon of amla — one of the best cooling tonics for Pitta.' },
  grapes:        { kind: 'eat',   emoji: '🍇', howTo: 'A small bunch of sweet grapes on their own.' },
  pear:          { kind: 'eat',   emoji: '🍐', howTo: 'Eat a ripe pear — sweet and cooling.' },
  muskmelon:     { kind: 'eat',   emoji: '🍈', howTo: 'A few pieces on their own (melons digest best eaten alone).' },
  sweetLime:     { kind: 'drink', emoji: '🍊', howTo: 'Fresh sweet-lime juice, not chilled.' },

  // Warming / Kapha & Vata
  gingerFresh:   { kind: 'drink', emoji: '🍵', howTo: 'Simmer a few slices for 5 minutes for a warming tea; sip before or after eating.' },
  gingerDry:     { kind: 'drink', emoji: '🍵', howTo: 'Stir a pinch into hot water — stronger and drier than fresh; kindles digestion.' },
  blackPepper:   { kind: 'eat',   emoji: '🌶️', howTo: 'A few grinds over warm food — a little sparks the digestive fire.' },
  turmeric:      { kind: 'drink', emoji: '🥛', howTo: 'Whisk a pinch into warm milk (golden milk) or hot water.' },
  cinnamon:      { kind: 'drink', emoji: '🍵', howTo: 'Steep a small piece of bark in hot water, or add to tea.' },
  clove:         { kind: 'drink', emoji: '🍵', howTo: 'Steep a clove or two in hot water — warming and clearing.' },
  fenugreekSeed: { kind: 'drink', emoji: '🍵', howTo: 'Soak ½ tsp overnight and take with warm water in the morning.' },
  ajwain:        { kind: 'drink', emoji: '🍵', howTo: 'Steep ¼ tsp in hot water — quick relief for heavy, gassy digestion.' },
  holyBasil:     { kind: 'drink', emoji: '🌿', howTo: 'Steep a few tulsi leaves for a warming, clearing tea.' },
  honey:         { kind: 'drink', emoji: '🍯', howTo: 'Stir a little into warm (never boiling) water — lightening for Kapha.' },

  // Grounding / Vata
  ghee:          { kind: 'eat',   emoji: '🧈', howTo: 'A small spoon stirred into warm food — grounding and easy to digest.' },
  milk:          { kind: 'drink', emoji: '🥛', howTo: 'Warm a cup with a pinch of cardamom or nutmeg before the evening.' },
  dates:         { kind: 'eat',   emoji: '🌴', howTo: 'A couple of soft dates — sweet, grounding, quick energy.' },
  sesameOil:     { kind: 'eat',   emoji: '🫗', howTo: 'Cook your next meal in a little — warming and nourishing for Vata.' },
}

// Category fallback so anything the engine surfaces still gets a usable how-to.
const BY_CAT = {
  spice:     { kind: 'drink', emoji: '🍵', how: (n) => `Steep a little ${n.toLowerCase()} in hot water for 5 minutes; sip warm after eating.` },
  beverage:  { kind: 'drink', emoji: '🥤', how: (n) => `Have a small cup of ${n.toLowerCase()}.` },
  dairy:     { kind: 'eat',   emoji: '🥛', how: (n) => `A little ${n.toLowerCase()} helps settle things.` },
  fruit:     { kind: 'eat',   emoji: '🍎', how: (n) => `Eat a few pieces of fresh ${n.toLowerCase()} on their own.` },
  vegetable: { kind: 'eat',   emoji: '🥗', how: (n) => `Add some ${n.toLowerCase()} to your next plate.` },
  nut_seed:  { kind: 'eat',   emoji: '🌰', how: (n) => `A small handful of ${n.toLowerCase()}.` },
  sweetener: { kind: 'drink', emoji: '🍯', how: (n) => `Stir a little ${n.toLowerCase()} into warm water.` },
  oil:       { kind: 'eat',   emoji: '🫒', how: (n) => `Cook your next meal in a little ${n.toLowerCase()}.` },
  grain:     { kind: 'eat',   emoji: '🍚', how: (n) => `Favour ${n.toLowerCase()} at your next meal.` },
  legume:    { kind: 'eat',   emoji: '🍲', how: (n) => `Cook ${n.toLowerCase()} soft and well-spiced at your next meal.` },
}

// Resolve an ingredient → a consumable form. `name` is the (localized) display
// name from the caller; used as the card title unless the form overrides it.
export function formFor(ingredient, name) {
  const nm = name || ingredient?.name || ''
  const byId = BY_ID[ingredient?.id]
  if (byId) return { kind: byId.kind, emoji: byId.emoji, title: byId.title || nm, howTo: byId.howTo }
  const c = BY_CAT[ingredient?.category] || { kind: 'eat', emoji: '🍽️', how: (n) => `Have a little ${n.toLowerCase()}.` }
  return { kind: c.kind, emoji: c.emoji, title: nm, howTo: c.how(nm) }
}

// Marquee combos per raised dosha — the genuinely-best next step, with a how-to.
// `isSafe(id)` must return false for any ingredient the user excludes (allergen /
// diet pattern), so we never suggest e.g. a dairy lassi to a vegan. `id` links
// the card to a representative ingredient's detail page.
export function curatedFor(target, isSafe = () => true) {
  const out = []
  if (target === 'pitta') {
    if (['cumin', 'corianderSeed', 'fennel'].every(isSafe)) {
      out.push({ id: 'fennel', kind: 'drink', emoji: '🍵', title: 'CCF cooler',
        howTo: 'Steep ½ tsp each of cumin, coriander & fennel seeds in hot water for 5 minutes. Sip warm after eating.' })
    }
    if (isSafe('yoghurt')) {
      out.push({ id: 'yoghurt', kind: 'drink', emoji: '🥛', title: 'Sweet lassi',
        howTo: 'Whisk yoghurt with water, a little sugar & a pinch of cardamom — sweet, smooth and cooling.' })
    }
  }
  if (target === 'kapha') {
    if (isSafe('gingerFresh')) {
      out.push({ id: 'gingerFresh', kind: 'drink', emoji: '🍵', title: 'Ginger tea',
        howTo: 'Simmer a few slices of fresh ginger for 5 minutes; add a little honey once it’s warm (not hot).' })
    }
  }
  if (target === 'vata') {
    if (isSafe('milk')) {
      out.push({ id: 'milk', kind: 'drink', emoji: '🥛', title: 'Warm spiced milk',
        howTo: 'Warm a cup of milk with a pinch of cardamom or nutmeg — grounding and calming before the evening.' })
    }
    if (isSafe('gingerFresh')) {
      out.push({ id: 'gingerFresh', kind: 'drink', emoji: '🍵', title: 'Ginger tea',
        howTo: 'Steep fresh ginger in hot water; sip warm to kindle digestion.' })
    }
  }
  return out
}
