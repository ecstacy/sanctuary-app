// ─────────────────────────────────────────────────────────────────────────────
//  mealVisual — a themed "photo" stand-in for a meal idea.
//
//  Meals are composed dynamically from ingredients, so there is no catalog of
//  meal photos to draw from. Until a real themed-image pipeline exists (the
//  `image` field on an idea is the hook for it), each card gets an intentional,
//  on-palette tile instead of a wall of text: a warm gradient keyed to the
//  dish's dominant ingredient category, and a Material food glyph that reads as
//  the dish. Deterministic and pure, so the same meal always looks the same.
//
//  Refined line-glyphs (not emoji) keep it consistent with the app's icon
//  language and premium feel. Colours come from the Daylight earth palette
//  (see tailwind.config.js) so the tiles sit in the same world as everything
//  else — appetising, not neon.
// ─────────────────────────────────────────────────────────────────────────────

// Warm, muted gradients per ingredient category. from → to (top-left → bottom-
// right), with an `ink` for the glyph that keeps contrast on the lighter end.
const CATEGORY_THEME = {
  grain:     { from: '#f4ead2', to: '#e7cfa0', ink: '#8a6520', icon: 'rice_bowl' },
  legume:    { from: '#f1ddcf', to: '#e3bfa4', ink: '#a24a2b', icon: 'ramen_dining' },
  vegetable: { from: '#e4ede2', to: '#c3dcc4', ink: '#3a6b53', icon: 'nutrition' },
  fruit:     { from: '#f6e4d1', to: '#eec6a6', ink: '#b25a37', icon: 'nutrition' },
  dairy:     { from: '#f3f0e7', to: '#e2ddcb', ink: '#57564c', icon: 'restaurant' },
  nut_seed:  { from: '#efe3d0', to: '#dcc4a0', ink: '#8a6520', icon: 'nutrition' },
  beverage:  { from: '#e4ece4', to: '#cfe0d4', ink: '#3a6b53', icon: 'local_cafe' },
  oil:       { from: '#f4ead2', to: '#e7cfa0', ink: '#8a6520', icon: 'restaurant' },
  spice:     { from: '#f4ead2', to: '#e7cfa0', ink: '#8a6520', icon: 'restaurant' },
  sweetener: { from: '#f6e4d1', to: '#eec6a6', ink: '#b25a37', icon: 'icecream' },
  animal:    { from: '#f1ddcf', to: '#e3bfa4', ink: '#a24a2b', icon: 'egg_alt' },
}

const DEFAULT_THEME = { from: '#efece1', to: '#ddd8c7', ink: '#57564c', icon: 'restaurant' }

// Name keywords win over category — a "salad" is a salad whether its first core
// ingredient is chickpea or quinoa. Each entry may override the glyph and/or the
// category whose gradient is used. Ordered: first match wins, so put the more
// specific dishes before the generic ones.
const KEYWORD_RULES = [
  { re: /\b(salad|slaw)\b/,                         icon: 'nutrition',        cat: 'vegetable' },
  { re: /\b(soup|broth|rasam)\b/,                   icon: 'soup_kitchen',     cat: 'legume' },
  { re: /\b(dal|daal|lentil|khichdi|kitchari)\b/,   icon: 'ramen_dining',     cat: 'legume' },
  { re: /\b(porridge|oats|oatmeal|congee|upma)\b/,  icon: 'breakfast_dining', cat: 'grain' },
  { re: /\b(rice|pulao|pilaf|biryani|risotto)\b/,   icon: 'rice_bowl',        cat: 'grain' },
  { re: /\b(toast|bread|sandwich|roti|chapati|wrap|paratha|flatbread)\b/, icon: 'bakery_dining', cat: 'grain' },
  { re: /\b(egg|omelette|omelet|frittata)\b/,       icon: 'egg_alt',          cat: 'animal' },
  { re: /\b(yoghurt|yogurt|curd|raita|lassi)\b/,    icon: 'restaurant',       cat: 'dairy' },
  { re: /\b(tea|chai|coffee|brew|infusion)\b/,      icon: 'local_cafe',       cat: 'beverage' },
  { re: /\b(smoothie|shake|juice)\b/,               icon: 'local_cafe',       cat: 'fruit' },
  { re: /\b(kheer|pudding|halwa|dessert|sweet)\b/,  icon: 'icecream',         cat: 'sweetener' },
  { re: /\b(curry|stew|sabzi|sabji|masala)\b/,      icon: 'soup_kitchen',     cat: 'vegetable' },
  { re: /\b(paneer|tofu|cheese|mozzarella)\b/,      icon: 'restaurant',       cat: 'dairy' },
]

/**
 * Resolve a meal idea to its tile visual.
 * @param {{name?:string, category?:string, core?:Array<{category?:string}>}} idea
 * @returns {{icon:string, from:string, to:string, ink:string}}
 */
export function mealVisual(idea = {}) {
  const name = String(idea.name || '').toLowerCase()

  const rule = KEYWORD_RULES.find((r) => r.re.test(name))
  const category = (rule && rule.cat) || idea.category || idea.core?.[0]?.category || null
  const theme = (category && CATEGORY_THEME[category]) || DEFAULT_THEME

  return {
    icon: (rule && rule.icon) || theme.icon,
    from: theme.from,
    to:   theme.to,
    ink:  theme.ink,
  }
}
