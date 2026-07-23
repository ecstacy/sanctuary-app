// ─────────────────────────────────────────────────────────────────────────────
//  FoodIcon — line-art glyphs for the diet dataset
//
//  WHY NOT MATERIAL SYMBOLS
//  ────────────────────────
//  The app uses Material Symbols everywhere else, and it should. But its food
//  vocabulary is thin and generic: ghee, yoghurt, buttermilk and milk all
//  collapse onto `water_full`; cumin, turmeric, pepper and asafoetida all onto
//  `local_fire_department`. A grid where half the items share a flame is worse
//  than no icon at all — it reads as decoration and actively misleads.
//
//  So these are drawn to the food. They stay in the app's visual language:
//  1.5px strokes, `currentColor`, 24×24, no fill, no colour of their own.
//
//  WHY NOT EMOJI
//  ─────────────
//  🍚 is instantly legible and would have been far less work, but it drags a
//  second illustration style (full-colour, vendor-specific, differently
//  weighted) into a monochrome line-art UI. It would look pasted in.
//
//  ACCESSIBILITY
//  ─────────────
//  Always decorative. Every place these appear also renders the food's NAME as
//  text, so nothing depends on recognising a glyph — hence `aria-hidden` and
//  no title element.
// ─────────────────────────────────────────────────────────────────────────────

// Each entry is the inner geometry of a 24×24 icon. Kept as raw elements so
// the wrapper can own stroke width, colour and sizing in one place.
const SHAPES = {
  // ── Grains & bread ──────────────────────────────────────────────────────
  // A filled bowl with heaped contents — rice, and the base for other bowls.
  riceBowl: (
    <>
      <path d="M3.5 11h17c0 4.7-3.8 8.5-8.5 8.5S3.5 15.7 3.5 11Z" />
      <path d="M7.5 11c0-1.4 2-2.5 4.5-2.5s4.5 1.1 4.5 2.5" />
      <path d="M10 6.5c.6-.8.6-1.6 0-2.4M14 6.5c.6-.8.6-1.6 0-2.4" />
    </>
  ),
  // Bowl with a spoon — porridge, soup, anything eaten loose.
  porridge: (
    <>
      <path d="M3 11.5h14c0 4.4-3.1 7.5-7 7.5s-7-3.1-7-7.5Z" />
      <path d="M19 5.5c1.4 0 2 1.2 2 2.8s-.6 2.7-2 2.7Z" />
      <path d="M19 11v8" />
    </>
  ),
  // An ear of grain — wheat, barley.
  grainEar: (
    <>
      <path d="M12 21V9" />
      <path d="M12 9c0-2.2 1.3-4 3-4 0 2.2-1.3 4-3 4ZM12 9c0-2.2-1.3-4-3-4 0 2.2 1.3 4 3 4Z" />
      <path d="M12 14c0-2.2 1.3-4 3-4 0 2.2-1.3 4-3 4ZM12 14c0-2.2-1.3-4-3-4 0 2.2 1.3 4 3 4Z" />
    </>
  ),
  // A round flatbread with char marks — chapati, roti.
  flatbread: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9.5h.01M14.5 8.5h.01M11.5 13h.01M15 14.5h.01M8 14h.01" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  // A sliced loaf — rye and other yeasted breads.
  loaf: (
    <>
      <path d="M3.5 12.5c0-3.6 3.8-6.5 8.5-6.5s8.5 2.9 8.5 6.5v3.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
      <path d="M8 9.5v8M12 8.8v9M16 9.5v8" />
    </>
  ),

  // ── Legumes ─────────────────────────────────────────────────────────────
  // Loose split pulses in a heap — dal, chickpeas.
  pulses: (
    <>
      <ellipse cx="8" cy="15" rx="3" ry="2.2" />
      <ellipse cx="15" cy="16" rx="3" ry="2.2" />
      <ellipse cx="11.5" cy="10.5" rx="3" ry="2.2" />
      <ellipse cx="17" cy="10" rx="2.4" ry="1.8" />
    </>
  ),

  // ── Dairy ───────────────────────────────────────────────────────────────
  // A milk bottle.
  milkBottle: (
    <>
      <path d="M10 2.5h4v2.2l2.2 3.1c.5.7.8 1.6.8 2.5v9.2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9.2c0-.9.3-1.8.8-2.5L10 4.7Z" />
      <path d="M7.2 13h9.6" />
    </>
  ),
  // A wide jar with a lid — ghee, butter, anything spooned.
  jar: (
    <>
      <path d="M5.5 9h13v10a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2Z" />
      <path d="M4.5 5.5h15V9h-15Z" />
      <path d="M9.5 13.5h5" />
    </>
  ),
  // A cup of set curd with a swirl — yoghurt, buttermilk.
  curdCup: (
    <>
      <path d="M5.5 7.5h13l-1.2 11.2a2 2 0 0 1-2 1.8H8.7a2 2 0 0 1-2-1.8Z" />
      <path d="M9 11.8c1-.9 2-.9 3 0s2 .9 3 0" />
    </>
  ),
  // A wedge of hard cheese with holes.
  cheeseWedge: (
    <>
      <path d="M3 16.5 12.5 6.5H21v10Z" />
      <circle cx="16" cy="12" r="1.2" />
      <circle cx="11.5" cy="14" r="1" />
    </>
  ),

  // ── Sweeteners & oils ───────────────────────────────────────────────────
  // A honey dipper over a drip.
  honeyDipper: (
    <>
      <path d="M12 2.5v6" />
      <path d="M8.5 10c0-2 1.6-3.5 3.5-3.5S15.5 8 15.5 10s-1.6 4-3.5 4-3.5-2-3.5-4Z" />
      <path d="M9.2 9h5.6M9 11.4h6" />
      <path d="M12 16.5c1.4 1.7 2.1 3 2.1 3.8a2.1 2.1 0 0 1-4.2 0c0-.8.7-2.1 2.1-3.8Z" />
    </>
  ),
  // A rough block — jaggery, solid sugar.
  block: (
    <>
      <path d="M4 9.5 12 5l8 4.5-8 4.5Z" />
      <path d="M4 9.5V15l8 4.5V14M20 9.5V15l-8 4.5" />
    </>
  ),
  // A narrow-necked oil bottle with a drop.
  oilBottle: (
    <>
      <path d="M10.5 2.5h3v3.8l2.6 2.9c.6.7.9 1.5.9 2.4v7.4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-7.4c0-.9.3-1.7.9-2.4l2.6-2.9Z" />
      <path d="M12 13.5c1 1.2 1.5 2.1 1.5 2.7a1.5 1.5 0 0 1-3 0c0-.6.5-1.5 1.5-2.7Z" />
    </>
  ),

  // ── Spices ──────────────────────────────────────────────────────────────
  // Scattered seeds — cumin, coriander, fennel, pepper.
  seeds: (
    <>
      <ellipse cx="7.5" cy="8" rx="2" ry="1.2" transform="rotate(-25 7.5 8)" />
      <ellipse cx="15" cy="7.5" rx="2" ry="1.2" transform="rotate(15 15 7.5)" />
      <ellipse cx="11" cy="12.5" rx="2" ry="1.2" transform="rotate(-10 11 12.5)" />
      <ellipse cx="17" cy="13.5" rx="2" ry="1.2" transform="rotate(30 17 13.5)" />
      <ellipse cx="8" cy="17" rx="2" ry="1.2" transform="rotate(20 8 17)" />
      <ellipse cx="14.5" cy="18" rx="2" ry="1.2" transform="rotate(-15 14.5 18)" />
    </>
  ),
  // A knobbly rhizome — fresh and dry ginger, turmeric.
  rhizome: (
    <>
      <path d="M6.5 14.5c-1.5-1.5-1.2-4 .8-5 1.6-.8 2.6.2 3.7-.7 1.2-1 .8-2.6 2.3-3.2 2-.8 4 .8 4 2.9 0 1.6-1.2 2.3-1.2 3.6 0 1.5 1.3 2.2.7 3.8-.7 1.9-3.2 2.5-4.7 1.2-1-.9-.8-2-2-2.3-1.4-.3-2.4.8-3.6-.3Z" />
      <path d="M9.5 12.2c.6.4.9 1 .9 1.8M14 10.5c-.5.5-.7 1.1-.6 1.9" />
    </>
  ),
  // A garlic bulb with cloves.
  garlicBulb: (
    <>
      <path d="M12 4.5c.9 1.2.9 2.2 0 3" />
      <path d="M12 7.5c3.3 0 5.5 3 5.5 6.3 0 3-2.3 5.2-5.5 5.2s-5.5-2.2-5.5-5.2c0-3.3 2.2-6.3 5.5-6.3Z" />
      <path d="M12 7.7v11.3M8.6 9.6c-.7 2.9-.6 6.2.3 9M15.4 9.6c.7 2.9.6 6.2-.3 9" />
    </>
  ),
  // A cardamom / seed pod.
  pod: (
    <>
      <path d="M12 3.5c3 2.6 4.5 5.5 4.5 8.7 0 4.3-2 7.3-4.5 7.3s-4.5-3-4.5-7.3c0-3.2 1.5-6.1 4.5-8.7Z" />
      <path d="M12 5.5v13.5" />
    </>
  ),

  // ── Vegetables & fruit ──────────────────────────────────────────────────
  // An onion with a shoot.
  onion: (
    <>
      <path d="M12 6.5c3.6 0 6 3.2 6 6.6 0 3.6-2.6 6.4-6 6.4s-6-2.8-6-6.4c0-3.4 2.4-6.6 6-6.4Z" />
      <path d="M12 6.5c-.4-1.5.2-2.7 1.8-3.4M12 6.5c-1.1-1-1.2-2 .1-3" />
      <path d="M9.2 8.7c-1 2.8-1 5.9 0 8.8M14.8 8.7c1 2.8 1 5.9 0 8.8" />
    </>
  ),
  // A tuber with eyes.
  tuber: (
    <>
      <path d="M4.8 12.6c-.7-3.3 2.2-6.4 6-6.7 3.4-.3 5.7 1 7.4 3 1.9 2.3 1.7 5.6-.6 7.4-2.6 2-6 2.4-9 1.2-2.1-.9-3.4-2.6-3.8-4.9Z" />
      <path d="M9.5 11h.01M13.5 10h.01M12 14.5h.01M16 13h.01" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  // Leafy greens.
  leaf: (
    <>
      <path d="M4.5 19.5c-1-6.5 3-13 12-14.5 1.5 8.5-3.5 14-12 14.5Z" />
      <path d="M16.5 5C12 8 8.5 12.5 6.5 18" />
    </>
  ),
  // An apple with a leaf.
  apple: (
    <>
      <path d="M12 8c-1.2-1-2.7-1.3-4-.8-2 .8-3 3-3 5.6 0 3.4 2.3 7.7 4.6 7.7.9 0 1.6-.5 2.4-.5s1.5.5 2.4.5c2.3 0 4.6-4.3 4.6-7.7 0-2.6-1-4.8-3-5.6-1.3-.5-2.8-.2-4 .8Z" />
      <path d="M12 8V5.2" />
      <path d="M12.2 5.2c1.6-.4 2.7-1.3 3.1-2.7-1.7-.2-2.8.6-3.1 2.7Z" />
    </>
  ),
  // An almond / nut.
  nut: (
    <>
      <path d="M12 3.5c3.4 3 5.2 6.3 5.2 9.7 0 4.2-2.3 7.3-5.2 7.3s-5.2-3.1-5.2-7.3c0-3.4 1.8-6.7 5.2-9.7Z" />
      <path d="M12 7.5c1.4 3 1.4 6.6 0 10.5" />
    </>
  ),

  // A tapered root with fronds — carrot.
  carrot: (
    <>
      <path d="M8.5 9.5 12 21l6.5-9.5c.6-.9.3-2.1-.7-2.6l-3-1.6c-1-.5-2.2-.2-2.8.7Z" />
      <path d="M13 7 12 3M13.5 7.3 17 4.6M11.5 7.6 8 5.6" strokeLinecap="round" />
    </>
  ),
  // A round gourd with ribs — pumpkin, squash, bottle gourd.
  gourd: (
    <>
      <path d="M12 7c4 0 7 2.8 7 6.5S16 20 12 20s-7-2.8-7-6.5S8 7 12 7Z" />
      <path d="M9.3 8c-1 3.4-1 7.1 0 10.8M14.7 8c1 3.4 1 7.1 0 10.8" />
      <path d="M12 7V4.5M12 4.5c1.4-.6 2.5-.3 3.3 1" strokeLinecap="round" />
    </>
  ),
  // A dense round head with a stem — cabbage, cauliflower.
  brassica: (
    <>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 6V3.5" strokeLinecap="round" />
      <path d="M7.2 10c2.5 1.3 4.1 3.7 4.8 7M16.8 10c-2.5 1.3-4.1 3.7-4.8 7" />
    </>
  ),
  // A round fruit with a leafy stem — tomato.
  tomato: (
    <>
      <circle cx="12" cy="13.5" r="6.8" />
      <path d="M12 6.7V4.5" strokeLinecap="round" />
      <path d="M12 6.7c-1.6-1.4-3-1.5-4.2-.4 1.2 1.5 2.6 1.9 4.2 1.3ZM12 6.7c1.6-1.4 3-1.5 4.2-.4-1.2 1.5-2.6 1.9-4.2 1.3Z" />
    </>
  ),
  // A long ridged fruit — cucumber, courgette.
  cucumber: (
    <>
      <path d="M17.8 6.2c2 2 1 6.2-2.2 9.4s-7.4 4.2-9.4 2.2-1-6.2 2.2-9.4 7.4-4.2 9.4-2.2Z" />
      <path d="M10.5 9.5c1 .3 1.6 1 1.8 2M13.5 12.5c1 .3 1.6 1 1.8 2" strokeLinecap="round" />
    </>
  ),
  // A curved fruit — banana.
  banana: (
    <>
      <path d="M4.5 8c0 6.5 4.5 11 11 11 2.2 0 3.6-.7 4-2-3.5 0-6.4-1-8.6-3.2C8.7 11.6 7.7 8.7 7.7 5.2c-1.3.4-2 1.3-3.2 2.8Z" />
      <path d="M7.7 5.2 7 3.5" strokeLinecap="round" />
    </>
  ),
  // A segmented citrus half — lemon, lime.
  citrus: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="5.2" />
      <path d="M12 6.8v10.4M7.4 9.4l9.2 5.2M7.4 14.6l9.2-5.2" />
    </>
  ),
  // A bunch of small round fruit — grapes, raisins.
  grapes: (
    <>
      <circle cx="9" cy="11" r="2.1" />
      <circle cx="15" cy="11" r="2.1" />
      <circle cx="12" cy="14.8" r="2.1" />
      <circle cx="12" cy="7.6" r="2.1" />
      <circle cx="9.6" cy="18.2" r="1.8" />
      <path d="M12 5.5V3M12 3c1.5-.4 2.6 0 3.3 1.3" strokeLinecap="round" />
    </>
  ),
  // A rounded fruit with a crown — pomegranate.
  crownedFruit: (
    <>
      <circle cx="12" cy="13.5" r="6.8" />
      <path d="M12 6.7V4M10.3 4.6 12 2.8l1.7 1.8" strokeLinecap="round" />
      <path d="M9.5 12.5h.01M14.5 12.5h.01M12 16h.01" strokeLinecap="round" strokeWidth="2" />
    </>
  ),
  // An oval stone fruit with a leaf — mango.
  mango: (
    <>
      <path d="M15.5 6.5c3 1.6 4 5.4 2.2 8.7s-5.6 4.7-8.6 3.1-4-5.4-2.2-8.7c1.5-2.7 5-4.9 8.6-3.1Z" />
      <path d="M14.8 6.8c.6-1.9 2-2.9 4-3-.1 1.9-1.1 3-3 3.4" />
    </>
  ),

  // ── Beverages ───────────────────────────────────────────────────────────
  // A cup with steam and a handle.
  hotCup: (
    <>
      <path d="M4.5 10h13v5.5a4 4 0 0 1-4 4H8.5a4 4 0 0 1-4-4Z" />
      <path d="M17.5 11.5H19a2.2 2.2 0 0 1 0 4.4h-1.5" />
      <path d="M8.5 6.8c.7-.9.7-1.8 0-2.7M12 6.8c.7-.9.7-1.8 0-2.7" strokeLinecap="round" />
    </>
  ),
}

// Per-ingredient mapping. Explicit rather than derived from `category`, which
// is what made the old icons useless — a category is a filing decision, not a
// description of what the thing looks like.
const BY_ID = {
  basmatiRice: 'riceBowl',
  oats: 'porridge',
  wheat: 'grainEar',
  barley: 'grainEar',
  ryeBread: 'loaf',

  mungDal: 'pulses',
  uradDal: 'pulses',
  chickpea: 'pulses',

  milk: 'milkBottle',
  ghee: 'jar',
  butter: 'jar',
  yoghurt: 'curdCup',
  buttermilk: 'curdCup',
  hardCheese: 'cheeseWedge',

  honey: 'honeyDipper',
  jaggery: 'block',
  sesameOil: 'oilBottle',
  oliveOil: 'oilBottle',

  blackPepper: 'seeds',
  cumin: 'seeds',
  corianderSeed: 'seeds',
  fennel: 'seeds',
  asafoetida: 'seeds',
  cardamom: 'pod',
  gingerFresh: 'rhizome',
  gingerDry: 'rhizome',
  turmeric: 'rhizome',
  garlic: 'garlicBulb',

  onionRaw: 'onion',
  onionCooked: 'onion',
  potato: 'tuber',
  spinach: 'leaf',
  apple: 'apple',
  appleStewed: 'apple',
  almond: 'nut',
  coffee: 'hotCup',

  // Batch 4 — vegetables and fruit
  carrot: 'carrot',
  beetroot: 'tuber',
  radishTender: 'carrot',
  radishMature: 'carrot',
  ashGourd: 'gourd',
  bottleGourd: 'gourd',
  okra: 'pod',
  cabbage: 'brassica',
  cauliflower: 'brassica',
  greenBeans: 'pod',
  peas: 'pod',
  tomatoRaw: 'tomato',
  tomatoCooked: 'tomato',
  aubergine: 'gourd',
  cucumber: 'cucumber',
  banana: 'banana',
  pomegranate: 'crownedFruit',
  grapes: 'grapes',
  mangoRipe: 'mango',
  lemon: 'citrus',
}

// Fallback when an id has no glyph yet — still better than one flame for every
// spice, and deliberately dull so a missing mapping is noticeable rather than
// quietly acceptable.
const BY_CATEGORY = {
  grain: 'grainEar', legume: 'pulses', vegetable: 'leaf', fruit: 'apple',
  dairy: 'milkBottle', spice: 'seeds', oil: 'oilBottle', nut_seed: 'nut',
  sweetener: 'block', beverage: 'hotCup', animal: 'pulses', other: 'riceBowl',
}

function foodShapeFor(ingredient) {
  if (!ingredient) return 'riceBowl'
  return BY_ID[ingredient.id] || BY_CATEGORY[ingredient.category] || 'riceBowl'
}

/**
 * @param {object} props
 * @param {object} [props.ingredient]  an ingredient row (id + category)
 * @param {string} [props.shape]       override, for meal cards with no single food
 * @param {number} [props.size]        px, default 24
 */
export default function FoodIcon({ ingredient, shape, size = 24, className = '' }) {
  const key = shape || foodShapeFor(ingredient)
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {SHAPES[key] || SHAPES.riceBowl}
    </svg>
  )
}
