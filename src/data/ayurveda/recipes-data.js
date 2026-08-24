// ─────────────────────────────────────────────────────────────────────────────
//  recipes-data.js — composite dishes as RECIPES, not hand-rated foods.
//
//  Each entry declares only culinary facts: which reviewed ingredients, and how
//  they are cooked. Everything classical — dosha, rasa, vīrya, guṇa, allergens,
//  diet tags — is DERIVED at load time by lib/deriveRecipe.js and folded into
//  the ingredient collection, so meal-check and the composer see a recipe as
//  just another food. This is the scalable path: adding "dishes people cook at
//  home" is a culinary list, never another classical review.
//
//  REVIEW = culinary, not Charaka. "Are these the right ingredients and the
//  right method for this dish?" A wrong answer is a bad recipe, not false
//  Ayurvedic guidance — the guidance is only ever what the ingredients already
//  say. Recipes gate on `reviewStatus: 'reviewed'` like everything else, and
//  their ids are pinned in dietSafety.test.js.
//
//  Methods: see lib/cookingMethods.js. Ingredient ids must be reviewed, or the
//  part is silently dropped from the derivation.
// ─────────────────────────────────────────────────────────────────────────────

export const RECIPES = {
  // ── Rice preparations — one grain, many methods. ─────────────────────────
  jeeraRice: {
    id: 'jeeraRice', name: 'Jeera rice', aliases: ['cumin rice', 'zeera rice'],
    ingredientIds: ['basmatiRice', 'cumin', 'ghee'], method: 'tempered', reviewStatus: 'reviewed',
  },
  lemonRice: {
    id: 'lemonRice', name: 'Lemon rice', aliases: ['chitranna', 'nimmakaya pulihora'],
    ingredientIds: ['basmatiRice', 'lemon', 'mustardSeed', 'curryLeaf', 'peanut', 'turmeric'], method: 'tempered', reviewStatus: 'reviewed',
  },
  curdRice: {
    id: 'curdRice', name: 'Curd rice', aliases: ['thayir sadam', 'yoghurt rice', 'dahi rice'],
    ingredientIds: ['basmatiRice', 'yoghurt', 'mustardSeed', 'curryLeaf'], method: 'tempered',
    // Reviewer override: dahi is classically heating, but curd rice — cooled,
    // soothing, eaten to pacify heat — is culinarily a cooling dish. Pinned
    // cooling / Pitta-neutral / Kapha-building to match its real identity.
    overrideVirya: 'cooling', overrideDosha: { pitta: 0, kapha: 1 },
    reviewStatus: 'reviewed',
  },
  coconutRice: {
    id: 'coconutRice', name: 'Coconut rice', aliases: ['thengai sadam'],
    ingredientIds: ['basmatiRice', 'coconut', 'mustardSeed', 'curryLeaf'], method: 'tempered',
    // Reviewer override: coconut is the dominant note — a cooling, building
    // dish; the light tadka doesn't reverse that. (The equal-weight vote lets a
    // pinch of mustard/curry leaf cancel the coconut, reading it neutral/K−1.)
    overrideVirya: 'cooling', overrideDosha: { kapha: 1 },
    reviewStatus: 'reviewed',
  },
  tomatoRice: {
    id: 'tomatoRice', name: 'Tomato rice', aliases: ['thakkali sadam'],
    ingredientIds: ['basmatiRice', 'tomatoCooked', 'onionCooked', 'mustardSeed', 'curryLeaf'], method: 'tempered', reviewStatus: 'reviewed',
  },

  // ── Everyday sabzis. ─────────────────────────────────────────────────────
  bhindiMasala: {
    id: 'bhindiMasala', name: 'Bhindi masala', aliases: ['okra masala', 'ladyfinger sabzi'],
    ingredientIds: ['okra', 'onionCooked', 'tomatoCooked', 'cumin'], method: 'sauteed',
    // Reviewer override: okra is light and Kapha-reducing; the dish shouldn't
    // read Kapha-building off the onion/tomato. Pinned K0 (2026-08-24).
    overrideDosha: { kapha: 0 },
    reviewStatus: 'reviewed',
  },
  bainganBharta: {
    id: 'bainganBharta', name: 'Baingan bharta', aliases: ['smoked aubergine mash', 'brinjal bharta'],
    ingredientIds: ['aubergine', 'tomatoCooked', 'onionCooked', 'garlic'], method: 'roasted', reviewStatus: 'reviewed',
  },
  alooJeera: {
    id: 'alooJeera', name: 'Aloo jeera', aliases: ['cumin potatoes', 'jeera aloo'],
    ingredientIds: ['potato', 'cumin', 'turmeric'], method: 'sauteed', reviewStatus: 'reviewed',
  },
  vegKorma: {
    id: 'vegKorma', name: 'Vegetable korma', aliases: ['veg kurma', 'navratan korma'],
    ingredientIds: ['carrot', 'peas', 'potato', 'coconut', 'cashew'], method: 'simmered', reviewStatus: 'reviewed',
  },

  // ── Dals & legumes. ──────────────────────────────────────────────────────
  dalFry: {
    id: 'dalFry', name: 'Dal fry', aliases: ['tadka dal', 'dal tadka'],
    ingredientIds: ['toorDal', 'tomatoCooked', 'onionCooked', 'garlic', 'cumin', 'ghee'], method: 'tempered', reviewStatus: 'reviewed',
  },
  rajmaMasala: {
    id: 'rajmaMasala', name: 'Rajma masala', aliases: ['kidney bean curry'],
    ingredientIds: ['rajma', 'tomatoCooked', 'onionCooked', 'garlic', 'cumin'], method: 'simmered', reviewStatus: 'reviewed',
  },

  // ── Breakfast tiffin. ────────────────────────────────────────────────────

  // ── Pasta — one base, different sauces & methods. ────────────────────────
  aglioOlioPasta: {
    id: 'aglioOlioPasta', name: 'Aglio e olio pasta', aliases: ['garlic oil pasta', 'spaghetti aglio olio'],
    ingredientIds: ['pasta', 'garlic', 'oliveOil', 'greenChili'], method: 'sauteed', reviewStatus: 'reviewed',
  },
  tomatoPasta: {
    id: 'tomatoPasta', name: 'Tomato pasta', aliases: ['marinara pasta', 'arrabiata', 'pasta pomodoro'],
    ingredientIds: ['pasta', 'tomatoCooked', 'garlic', 'oliveOil'], method: 'simmered', reviewStatus: 'reviewed',
  },
  mushroomPasta: {
    id: 'mushroomPasta', name: 'Mushroom pasta', aliases: ['creamy mushroom pasta'],
    ingredientIds: ['pasta', 'mushroom', 'garlic', 'oliveOil'], method: 'sauteed', reviewStatus: 'reviewed',
  },

  // ── Migrated meat dishes (were hand-rated in ingredients-modern-draft-3/5).
  //    Now recipes: the 'meat' tag and energetics DERIVE, so veg/pescatarian/
  //    halal exclusion is automatic and can no longer drift. Prose preserved;
  //    extraAllergens carry allergens from minor un-modelled parts (soy glaze,
  //    mayo). ─────────────────────────────────────────────────────────────────
  butterChicken: {
    id: 'butterChicken', name: 'Butter chicken', aliases: ['murgh makhani', 'butter chicken curry'],
    ingredientIds: ['chicken', 'tomatoCooked', 'butter', 'onionCooked', 'garlic'], method: 'simmered',
    whyFavor: 'Rich, creamy and grounding — settling for Vata.',
    whyAvoid: 'Cream, butter and spiced tomato — heavy and oily for Kapha, sour and heating for Pitta.',
    reviewStatus: 'reviewed',
  },
  friedChicken: {
    id: 'friedChicken', name: 'Fried chicken', aliases: ['crispy chicken', 'kfc', 'fried chicken piece'],
    ingredientIds: ['chicken', 'breadcrumbs'], method: 'fried',
    whyAvoid: 'Breaded, deep-fried chicken — very oily and heating; adds to Pitta and Kapha.',
    reviewStatus: 'reviewed',
  },
  chickenNuggets: {
    id: 'chickenNuggets', name: 'Chicken nuggets', aliases: ['nuggets', 'chicken nugget'],
    ingredientIds: ['chicken', 'breadcrumbs'], method: 'fried',
    whyAvoid: 'Breaded, deep-fried processed chicken — oily and heating; heavy for Kapha.',
    reviewStatus: 'reviewed',
  },
  chickenWings: {
    id: 'chickenWings', name: 'Chicken wings', aliases: ['buffalo wings', 'hot wings'],
    ingredientIds: ['chicken'], method: 'fried',
    whyAvoid: 'Fried, sauced wings — oily and sharply heating; strong on Pitta.',
    reviewStatus: 'reviewed',
  },
  meatballs: {
    id: 'meatballs', name: 'Meatballs', aliases: ['meatball', 'kofta'],
    ingredientIds: ['mince', 'breadcrumbs', 'onionCooked'], method: 'fried',
    whyAvoid: 'Fried minced meat — heavy, oily and heating; adds to Pitta and Kapha.',
    reviewStatus: 'reviewed',
  },
  cheeseburger: {
    id: 'cheeseburger', name: 'Cheeseburger', aliases: ['burger', 'hamburger', 'beef burger'],
    ingredientIds: ['beef', 'hardCheese', 'breadRoll', 'onionCooked'], method: 'grilled',
    whyAvoid: 'Beef patty, cheese and a refined bun — heavy, oily and heating; adds to Pitta and Kapha.',
    reviewStatus: 'reviewed',
  },
  hotDog: {
    id: 'hotDog', name: 'Hot dog', aliases: ['hotdog', 'frankfurter'],
    ingredientIds: ['sausage', 'breadRoll'], method: 'none',
    whyAvoid: 'Processed sausage in a refined bun — heavy and salty; leans to Kapha and Pitta.',
    reviewStatus: 'reviewed',
  },
  clubSandwich: {
    id: 'clubSandwich', name: 'Club sandwich', aliases: ['blt sandwich', 'club sarnie'],
    ingredientIds: ['breadRoll', 'chicken', 'bacon', 'tomatoRaw'], method: 'none', extraAllergens: ['egg'],
    whyAvoid: 'Layered bread with meat, bacon and mayo — heavy, moist and salty.',
    reviewStatus: 'reviewed',
  },
  shawarma: {
    id: 'shawarma', name: 'Shawarma / doner kebab', aliases: ['doner kebab', 'gyro', 'kebab wrap'],
    ingredientIds: ['chicken', 'pita', 'onionCooked', 'garlic'], method: 'roasted',
    whyAvoid: 'Spiced roasted meat in a flatbread — heavy, oily, salty and heating.',
    reviewStatus: 'reviewed',
  },
  teriyakiChicken: {
    id: 'teriyakiChicken', name: 'Teriyaki chicken', aliases: ['teriyaki chicken', 'chicken teriyaki'],
    ingredientIds: ['chicken', 'onionCooked'], method: 'grilled', extraAllergens: ['soy', 'gluten'],
    whyAvoid: 'Chicken glazed in a sweet-salty soy sauce — building and heating; sweet-heavy for Kapha.',
    reviewStatus: 'reviewed',
  },
  tonkatsu: {
    id: 'tonkatsu', name: 'Tonkatsu', aliases: ['tonkatsu', 'pork katsu', 'chicken katsu', 'katsu'],
    ingredientIds: ['pork', 'breadcrumbs'], method: 'fried',
    whyAvoid: 'A breaded, deep-fried cutlet — oily, heavy and heating.',
    reviewStatus: 'reviewed',
  },
  katsuCurry: {
    id: 'katsuCurry', name: 'Katsu curry', aliases: ['katsu curry', 'chicken katsu curry'],
    ingredientIds: ['pork', 'breadcrumbs', 'basmatiRice', 'carrot', 'onionCooked'], method: 'fried',
    whyAvoid: 'A breaded fried cutlet with mild curry sauce and rice — oily, heavy and heating.',
    reviewStatus: 'reviewed',
  },
}
