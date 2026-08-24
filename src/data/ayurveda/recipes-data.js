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
    ingredientIds: ['basmatiRice', 'yoghurt', 'mustardSeed', 'curryLeaf'], method: 'tempered', reviewStatus: 'reviewed',
  },
  coconutRice: {
    id: 'coconutRice', name: 'Coconut rice', aliases: ['thengai sadam'],
    ingredientIds: ['basmatiRice', 'coconut', 'mustardSeed', 'curryLeaf'], method: 'tempered', reviewStatus: 'reviewed',
  },
  tomatoRice: {
    id: 'tomatoRice', name: 'Tomato rice', aliases: ['thakkali sadam'],
    ingredientIds: ['basmatiRice', 'tomatoCooked', 'onionCooked', 'mustardSeed', 'curryLeaf'], method: 'tempered', reviewStatus: 'reviewed',
  },

  // ── Everyday sabzis. ─────────────────────────────────────────────────────
  bhindiMasala: {
    id: 'bhindiMasala', name: 'Bhindi masala', aliases: ['okra masala', 'ladyfinger sabzi'],
    ingredientIds: ['okra', 'onionCooked', 'tomatoCooked', 'cumin'], method: 'sauteed', reviewStatus: 'reviewed',
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
  chanaMasala: {
    id: 'chanaMasala', name: 'Chana masala', aliases: ['chole', 'chickpea masala'],
    ingredientIds: ['chickpea', 'tomatoCooked', 'onionCooked', 'garlic', 'cumin'], method: 'simmered', reviewStatus: 'reviewed',
  },
  rajmaMasala: {
    id: 'rajmaMasala', name: 'Rajma masala', aliases: ['kidney bean curry'],
    ingredientIds: ['rajma', 'tomatoCooked', 'onionCooked', 'garlic', 'cumin'], method: 'simmered', reviewStatus: 'reviewed',
  },
  mungKhichdi: {
    id: 'mungKhichdi', name: 'Moong dal khichdi', aliases: ['moong khichdi', 'dal rice'],
    ingredientIds: ['mungDal', 'basmatiRice', 'turmeric', 'cumin', 'ghee'], method: 'simmered', reviewStatus: 'reviewed',
  },

  // ── Breakfast tiffin. ────────────────────────────────────────────────────
  vegetableUpma: {
    id: 'vegetableUpma', name: 'Vegetable upma', aliases: ['rava upma', 'uppittu'],
    ingredientIds: ['semolina', 'peas', 'carrot', 'mustardSeed', 'curryLeaf'], method: 'tempered', reviewStatus: 'reviewed',
  },
  vegetablePoha: {
    id: 'vegetablePoha', name: 'Vegetable poha', aliases: ['kanda poha', 'flattened rice'],
    ingredientIds: ['flattenedRice', 'peas', 'peanut', 'onionCooked', 'mustardSeed', 'curryLeaf', 'turmeric'], method: 'tempered', reviewStatus: 'reviewed',
  },

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
}
