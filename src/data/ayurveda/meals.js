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
//  All 12 below were reviewed and signed off on 2026-07-22; see
//  docs/diet-review-batch-3-meals.md. mealComposer.test.js pins that approved
//  id set, so a future template cannot reach users by being born 'reviewed'.
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
    reviewStatus: 'reviewed',
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
    reviewStatus: 'reviewed',
  },

  ricePorridge: {
    id: 'ricePorridge',
    name: 'Soft rice porridge',
    coreIds: ['basmatiRice'],
    optionalIds: ['ghee', 'gingerFresh', 'cumin'],
    slots: ['morning', 'evening'],
    prep: 'Cooked well past the point of firmness, loose rather than fluffy.',
    reviewStatus: 'reviewed',
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
    reviewStatus: 'reviewed',
  },

  // ── Midday ────────────────────────────────────────────────────────────────
  kitchari: {
    id: 'kitchari',
    name: 'Mung dal kitchari',
    coreIds: ['mungDal', 'basmatiRice'],
    optionalIds: ['ghee', 'gingerFresh', 'cumin', 'turmeric', 'asafoetida', 'corianderSeed'],
    slots: ['midday', 'evening'],
    prep: 'Cooked together until soft enough to need no chewing.',
    reviewStatus: 'reviewed',
  },


  chickpeaCurry: {
    id: 'chickpeaCurry',
    name: 'Spiced chickpeas with rice',
    coreIds: ['chickpea', 'basmatiRice'],
    optionalIds: ['asafoetida', 'cumin', 'gingerFresh', 'turmeric', 'onionCooked'],
    slots: ['midday'],
    prep: 'Soaked well and cooked thoroughly with digestive spices.',
    reviewStatus: 'reviewed',
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
    reviewStatus: 'reviewed',
  },

  barleySoup: {
    id: 'barleySoup',
    name: 'Barley soup',
    coreIds: ['barley'],
    optionalIds: ['blackPepper', 'gingerDry', 'spinach', 'onionCooked', 'turmeric'],
    slots: ['midday'],
    seasons: ['spring'],
    reviewStatus: 'reviewed',
  },

  buttermilkRice: {
    id: 'buttermilkRice',
    name: 'Rice with buttermilk',
    coreIds: ['basmatiRice', 'buttermilk'],
    optionalIds: ['cumin', 'corianderSeed'],
    slots: ['midday'],
    seasons: ['summer'],
    prep: 'Use diluted takra — cultured yoghurt churned with water — rather than plain thick yoghurt. Takra is itself a spectrum of preparations, so this points at the method, not at one exact product.',
    reviewStatus: 'reviewed',
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
    reviewStatus: 'reviewed',
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
    reviewStatus: 'reviewed',
  },

  spicedMilk: {
    id: 'spicedMilk',
    name: 'Warm spiced milk',
    coreIds: ['milk'],
    optionalIds: ['gingerDry', 'turmeric', 'jaggery'],
    slots: ['evening'],
    prep: 'Warmed and spiced rather than drunk cold. Not taken with a salty or sour meal.',
    reviewStatus: 'reviewed',
  },

  // ── Fuller everyday meals (batch 4 — 2026-08-15) ───────────────────────────
  // Founder feedback: the original set read too spare — single-ingredient,
  // convalescent dishes ("rice with buttermilk" alone) rather than meals anyone
  // plans a day around. With the modern-foods batch reviewed, these are proper
  // plates: a grain + a protein + a vegetable, spanning vegan / vegetarian /
  // meat and all three slots. Same rules as above — core = bulk-and-identity,
  // fats & spices & acids stay optional, and the NAME never promises an optional
  // ingredient. The mixed-vegetable soup that batch 3 pulled (only spinach then)
  // returns here honestly, now that the vegetable set exists.
  //
  // Culinary review 2026-08-15: real dishes, sensible ingredient sets; each
  // makes NO Ayurvedic claim — the verdict is derived from its ingredients.

  // ── Morning ──
  avocadoToast: {
    id: 'avocadoToast',
    name: 'Avocado toast',
    coreIds: ['wholeWheatBread', 'avocado'],
    optionalIds: ['oliveOil', 'lemon', 'blackPepper', 'tomatoRaw', 'greenChili'],
    slots: ['morning'],
    prep: 'Ripe avocado mashed onto warm toast, with a squeeze of lemon and cracked pepper.',
    reviewStatus: 'reviewed',
  },

  eggsOnToast: {
    id: 'eggsOnToast',
    name: 'Scrambled eggs on toast',
    coreIds: ['egg', 'wholeWheatBread'],
    optionalIds: ['ghee', 'butter', 'blackPepper', 'spinach', 'tomatoCooked'],
    slots: ['morning'],
    prep: 'Eggs soft-scrambled in a little ghee or butter, served on warm toast.',
    reviewStatus: 'reviewed',
  },

  // ── Midday / evening ──
  salmonRiceGreens: {
    id: 'salmonRiceGreens',
    name: 'Salmon with rice and greens',
    coreIds: ['salmon', 'basmatiRice', 'broccoli'],
    optionalIds: ['ghee', 'lemon', 'gingerFresh', 'blackPepper', 'dillSeed'],
    slots: ['midday', 'evening'],
    seasons: ['autumn', 'winter'],
    prep: 'Salmon baked or pan-seared, served over rice with steamed greens.',
    reviewStatus: 'reviewed',
  },

  chickenRiceVeg: {
    id: 'chickenRiceVeg',
    name: 'Chicken with rice and vegetables',
    coreIds: ['chicken', 'basmatiRice', 'peas'],
    optionalIds: ['turmeric', 'cumin', 'gingerFresh', 'ghee', 'carrot', 'onionCooked'],
    slots: ['midday', 'evening'],
    prep: 'Chicken simmered with warming spices, served with rice and vegetables.',
    reviewStatus: 'reviewed',
  },

  grainBowlHummus: {
    id: 'grainBowlHummus',
    name: 'Grain bowl with roasted vegetables and hummus',
    coreIds: ['quinoa', 'sweetPotato', 'hummus'],
    optionalIds: ['oliveOil', 'cumin', 'lemon', 'spinach', 'bellPepper'],
    slots: ['midday'],
    prep: 'Warm roasted vegetables over quinoa, with a generous spoon of hummus.',
    reviewStatus: 'reviewed',
  },

  tofuStirFryRice: {
    id: 'tofuStirFryRice',
    name: 'Tofu stir-fry with rice',
    coreIds: ['tofu', 'basmatiRice', 'bellPepper'],
    optionalIds: ['gingerFresh', 'soySauce', 'sesameOil', 'broccoli', 'garlic'],
    slots: ['midday', 'evening'],
    prep: 'Tofu and vegetables stir-fried, tossed with a little soy sauce, over rice.',
    reviewStatus: 'reviewed',
  },

  lentilPastaVeg: {
    id: 'lentilPastaVeg',
    name: 'Lentil pasta with vegetables',
    coreIds: ['lentilPasta', 'tomatoCooked'],
    optionalIds: ['oliveOil', 'garlic', 'blackPepper', 'spinach', 'onionCooked'],
    slots: ['midday'],
    prep: 'Lentil pasta tossed with a simple cooked-tomato sauce and greens.',
    reviewStatus: 'reviewed',
  },

  greekSalad: {
    id: 'greekSalad',
    name: 'Greek-style salad',
    coreIds: ['cucumber', 'tomatoRaw', 'feta', 'olives'],
    optionalIds: ['oliveOil', 'lemon', 'mintLeaf', 'onionRaw'],
    slots: ['midday'],
    seasons: ['summer'],
    prep: 'Chopped cucumber and tomato with feta and olives, dressed in olive oil.',
    reviewStatus: 'reviewed',
  },

  paneerPeasChapati: {
    id: 'paneerPeasChapati',
    name: 'Paneer and peas with chapati',
    coreIds: ['paneer', 'peas', 'wheat'],
    optionalIds: ['turmeric', 'cumin', 'gingerFresh', 'tomatoCooked', 'ghee'],
    slots: ['midday', 'evening'],
    prep: 'Paneer and peas in a light spiced tomato base, with chapati.',
    reviewStatus: 'reviewed',
  },

  dalRiceGreens: {
    id: 'dalRiceGreens',
    name: 'Rice and dal with sautéed greens',
    coreIds: ['mungDal', 'basmatiRice', 'spinach'],
    optionalIds: ['ghee', 'cumin', 'turmeric', 'gingerFresh'],
    slots: ['midday', 'evening'],
    prep: 'Soft dal and rice with a side of greens sautéed in a little ghee.',
    reviewStatus: 'reviewed',
  },

  mixedVegSoup: {
    id: 'mixedVegSoup',
    name: 'Mixed vegetable soup',
    coreIds: ['carrot', 'greenBeans', 'spinach'],
    optionalIds: ['barley', 'onionCooked', 'gingerDry', 'blackPepper', 'turmeric', 'oliveOil'],
    slots: ['midday', 'evening'],
    seasons: ['autumn', 'winter'],
    prep: 'Mixed vegetables simmered soft into a warming soup — a barley handful makes it a fuller meal.',
    reviewStatus: 'reviewed',
  },

  // ── More everyday meals (batch 5 — 2026-08-15) ─────────────────────────────
  // Breadth across cuisines and slots — Indian staples, Western breakfasts and
  // sandwiches, salads and soups — all built from already-reviewed ingredients.
  // Same rules: core = bulk-and-identity, fats/spices/acids optional, the name
  // never promises an optional. Culinary review 2026-08-15.

  // ── Morning ──
  muesliYoghurtFruit: {
    id: 'muesliYoghurtFruit',
    name: 'Muesli with yoghurt and fruit',
    coreIds: ['muesli', 'yoghurt', 'banana'],
    optionalIds: ['honey', 'almond', 'apple'],
    slots: ['morning'],
    prep: 'Muesli soaked a little to soften, with yoghurt and fresh fruit.',
    reviewStatus: 'reviewed',
  },

  bananaBerrySmoothie: {
    id: 'bananaBerrySmoothie',
    name: 'Banana and berry smoothie',
    coreIds: ['banana', 'strawberry', 'milk'],
    optionalIds: ['yoghurt', 'honey', 'oats', 'almond'],
    slots: ['morning'],
    prep: 'Blended smooth; at room temperature rather than ice-cold is gentler on digestion.',
    reviewStatus: 'reviewed',
  },

  pohaPeas: {
    id: 'pohaPeas',
    name: 'Flattened rice with peas',
    coreIds: ['flattenedRice', 'peas'],
    optionalIds: ['onionCooked', 'mustardSeed', 'curryLeaf', 'turmeric', 'peanut', 'lemon'],
    slots: ['morning'],
    prep: 'Poha rinsed and steamed soft with a light tempering of spices.',
    reviewStatus: 'reviewed',
  },

  semolinaUpma: {
    id: 'semolinaUpma',
    name: 'Semolina upma',
    coreIds: ['semolina'],
    optionalIds: ['mustardSeed', 'curryLeaf', 'onionCooked', 'peas', 'gingerFresh', 'ghee'],
    slots: ['morning'],
    prep: 'Semolina dry-roasted, then cooked soft with a spiced tempering.',
    reviewStatus: 'reviewed',
  },

  peanutButterBananaToast: {
    id: 'peanutButterBananaToast',
    name: 'Peanut butter and banana toast',
    coreIds: ['wholeWheatBread', 'peanutButter', 'banana'],
    optionalIds: ['honey', 'cinnamon'],
    slots: ['morning'],
    prep: 'Peanut butter and sliced banana on warm toast.',
    reviewStatus: 'reviewed',
  },

  vegetableOmelette: {
    id: 'vegetableOmelette',
    name: 'Vegetable omelette',
    coreIds: ['egg', 'tomatoCooked'],
    optionalIds: ['onionCooked', 'bellPepper', 'spinach', 'blackPepper', 'ghee'],
    slots: ['morning', 'midday'],
    prep: 'Eggs cooked soft with vegetables folded through.',
    reviewStatus: 'reviewed',
  },

  // ── Midday / evening ──
  rajmaChawal: {
    id: 'rajmaChawal',
    name: 'Rajma with rice',
    coreIds: ['rajma', 'basmatiRice'],
    optionalIds: ['onionCooked', 'tomatoCooked', 'cumin', 'gingerFresh', 'turmeric', 'garlic'],
    slots: ['midday', 'evening'],
    prep: 'Kidney beans soaked well and simmered soft in a spiced tomato-onion base, with rice.',
    reviewStatus: 'reviewed',
  },

  dalTadkaRice: {
    id: 'dalTadkaRice',
    name: 'Dal tadka with rice',
    coreIds: ['toorDal', 'basmatiRice'],
    optionalIds: ['ghee', 'cumin', 'garlic', 'tomatoCooked', 'turmeric', 'onionCooked'],
    slots: ['midday', 'evening'],
    prep: 'Toor dal cooked soft and finished with a ghee tempering, with rice.',
    reviewStatus: 'reviewed',
  },

  vegetablePulao: {
    id: 'vegetablePulao',
    name: 'Vegetable pulao',
    coreIds: ['basmatiRice', 'carrot', 'peas'],
    optionalIds: ['greenBeans', 'cashew', 'cardamom', 'clove', 'cinnamon', 'ghee', 'onionCooked'],
    slots: ['midday', 'evening'],
    prep: 'Rice cooked with vegetables and whole spices, loose rather than sticky.',
    reviewStatus: 'reviewed',
  },

  fishCurryRice: {
    id: 'fishCurryRice',
    name: 'Fish curry with rice',
    coreIds: ['fishFreshwater', 'basmatiRice'],
    optionalIds: ['coconutMilk', 'turmeric', 'curryLeaf', 'tamarind', 'gingerFresh', 'onionCooked'],
    slots: ['midday', 'evening'],
    prep: 'Fish simmered gently in a spiced gravy, served with rice.',
    reviewStatus: 'reviewed',
  },

  tunaSandwich: {
    id: 'tunaSandwich',
    name: 'Tuna sandwich',
    coreIds: ['tuna', 'wholeWheatBread'],
    optionalIds: ['mayonnaise', 'lettuce', 'cucumber', 'blackPepper', 'lemon'],
    slots: ['midday'],
    prep: 'Flaked tuna between slices of wholegrain bread with crisp salad.',
    reviewStatus: 'reviewed',
  },

  chickpeaSaladBowl: {
    id: 'chickpeaSaladBowl',
    name: 'Chickpea salad bowl',
    coreIds: ['chickpea', 'cucumber', 'tomatoRaw'],
    optionalIds: ['oliveOil', 'lemon', 'onionRaw', 'mintLeaf'],
    slots: ['midday'],
    seasons: ['summer'],
    prep: 'Cooked chickpeas tossed with chopped salad and a lemon-oil dressing.',
    reviewStatus: 'reviewed',
  },

  quinoaSalad: {
    id: 'quinoaSalad',
    name: 'Quinoa salad',
    coreIds: ['quinoa', 'cucumber', 'tomatoRaw'],
    optionalIds: ['oliveOil', 'lemon', 'mintLeaf', 'chickpea', 'onionRaw'],
    slots: ['midday'],
    seasons: ['summer'],
    prep: 'Cooled quinoa tossed with chopped salad and herbs.',
    reviewStatus: 'reviewed',
  },

  lentilSoup: {
    id: 'lentilSoup',
    name: 'Lentil soup',
    coreIds: ['masoorDal'],
    optionalIds: ['carrot', 'onionCooked', 'cumin', 'garlic', 'tomatoCooked', 'oliveOil'],
    slots: ['midday', 'evening'],
    seasons: ['autumn', 'winter'],
    prep: 'Red lentils simmered soft with vegetables into a hearty soup.',
    reviewStatus: 'reviewed',
  },

  tomatoSoup: {
    id: 'tomatoSoup',
    name: 'Tomato soup',
    coreIds: ['tomatoCooked'],
    optionalIds: ['blackPepper', 'cream', 'garlic', 'oliveOil', 'onionCooked'],
    slots: ['midday', 'evening'],
    prep: 'Tomatoes simmered and blended smooth, finished with a little cream.',
    reviewStatus: 'reviewed',
  },

}

/** Stable list form. Includes drafts — filter before display. */
export const ALL_MEAL_TEMPLATES = Object.values(MEAL_TEMPLATES)
