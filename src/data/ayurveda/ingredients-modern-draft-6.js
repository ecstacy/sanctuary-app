// ─────────────────────────────────────────────────────────────────────────────
//  ingredients-modern-draft-6.js — MODERN BATCH 6: BREAD DEPTH (all `draft`)
//
//  "Bread" was thin — white/rye/sourdough/whole-wheat + a few dishes, but no
//  roti/chapati (a staple for this audience) and none of the everyday Western
//  loaves. This batch fills that so the meal-check search RECOMMENDS the exact
//  bread a user ate instead of collapsing everything to "white bread", which is
//  the difference between a trusted verdict and a rough guess.
//
//  ⚠ EVERY row is `reviewStatus: 'draft'` and INVISIBLE to the app until a human
//  reviews it — review sheet at docs/diet-review-modern-batch-6.md. Property-
//  derived (source.text 'modern', confidence 'medium'). Sign convention:
//  −1 pacifies / +1 aggravates.
// ─────────────────────────────────────────────────────────────────────────────

const M = { text: 'modern' }

/** @type {Record<string, import('./ingredients').Ingredient>} */
export const MODERN_DRAFT_INGREDIENTS_6 = {

  // ── Indian flatbreads ───────────────────────────────────────────────────────
  roti: {
    id: 'roti', name: 'Roti',
    aliases: ['roti', 'chapati', 'chapatti', 'phulka', 'wheat roti'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light'], doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyFavor: 'A plain whole-wheat flatbread, dry-cooked without oil — a light, everyday staple.',
    whyAvoid: 'A whole wheat grain, so a big stack still leans a little to Kapha.',
    source: { ...M, note: 'Composite (whole-wheat dough, griddle-cooked, no oil). Derived: sweet, light and neutral — a digestible staple grain (Kapha↑ mildly). Gluten.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  tandooriRoti: {
    id: 'tandooriRoti', name: 'Tandoori roti',
    aliases: ['tandoori roti', 'tandoori bread'],
    category: 'grain', rasa: ['sweet'], virya: 'heating', vipaka: 'sweet',
    guna: ['light', 'dry'], doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyFavor: 'A whole-wheat flatbread baked in a clay oven — a little crisper and warmer than a plain roti.',
    whyAvoid: 'Whole wheat, so it still leans a little to Kapha; the char adds a touch of heat.',
    source: { ...M, note: 'Composite (whole-wheat dough baked in a tandoor). Derived: sweet, light-dry, mildly warming from the char (Kapha↑). Gluten.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  bhatura: {
    id: 'bhatura', name: 'Bhatura',
    aliases: ['bhatura', 'bhature'],
    category: 'grain', rasa: ['sweet', 'sour'], virya: 'heating', vipaka: 'pungent',
    guna: ['heavy', 'oily'], doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    allergens: ['gluten'], cautions: ['processed'],
    whyAvoid: 'A deep-fried, leavened refined-flour bread — oily, heavy and heating.',
    source: { ...M, note: 'Composite (fermented refined-flour dough, deep-fried and puffed). Derived: sweet-sour, heavy, oily and heating (Kapha↑, Pitta↑, Vata↓). Gluten; processed.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  thepla: {
    id: 'thepla', name: 'Thepla',
    aliases: ['thepla', 'methi thepla'],
    category: 'grain', rasa: ['sweet', 'pungent'], virya: 'heating', vipaka: 'pungent',
    guna: ['heavy', 'oily'], doshaEffect: { vata: -1, pitta: 1, kapha: 0 },
    allergens: ['gluten'],
    whyFavor: 'A spiced whole-wheat flatbread with oil and fenugreek — warming and digestive.',
    whyAvoid: 'Oil and pungent spices make it heating, so a lot can nudge Pitta.',
    source: { ...M, note: 'Composite (whole-wheat + fenugreek + spices, shallow-fried). Derived: sweet-pungent, heavy, oily and warming (Vata↓, Pitta↑); spices keep it broadly Kapha-neutral. Gluten.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  missiRoti: {
    id: 'missiRoti', name: 'Missi roti',
    aliases: ['missi roti', 'besan roti', 'gram-flour roti'],
    category: 'grain', rasa: ['sweet', 'astringent', 'pungent'], virya: 'heating', vipaka: 'pungent',
    guna: ['heavy', 'dry'], doshaEffect: { vata: 0, pitta: 1, kapha: -1 },
    allergens: ['gluten'],
    whyFavor: 'A gram-and-wheat flatbread with spices — hearty, clearing and warming for Kapha.',
    whyAvoid: 'Gram flour is drying and the spices heat Pitta.',
    source: { ...M, note: 'Composite (besan + wheat + spices, griddle-cooked). Derived: sweet-astringent-pungent, heavy, dry and warming (Pitta↑, Kapha↓). Gluten (wheat blend).' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  pav: {
    id: 'pav', name: 'Pav',
    aliases: ['pav', 'ladi pav', 'bread pav'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['heavy', 'soft'], doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyAvoid: 'A soft, refined-flour dinner roll — light-tasting but refined and sweet, so it adds to Kapha.',
    source: { ...M, note: 'Composite (soft refined-flour leavened roll). Derived: sweet, soft, heavy (Vata↓, Kapha↑). Gluten.' },
    reviewStatus: 'draft', confidence: 'medium',
  },

  // ── Western loaves & rolls ──────────────────────────────────────────────────
  ciabatta: {
    id: 'ciabatta', name: 'Ciabatta',
    aliases: ['ciabatta'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light'], doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyAvoid: 'An airy white Italian loaf — refined wheat, so it leans to Kapha.',
    source: { ...M, note: 'Non-classical. Derived: airy refined-wheat loaf, sweet and light (Kapha↑). Gluten.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  focaccia: {
    id: 'focaccia', name: 'Focaccia',
    aliases: ['focaccia'],
    category: 'grain', rasa: ['sweet', 'salty'], virya: 'neutral', vipaka: 'sweet',
    guna: ['heavy', 'oily'], doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyAvoid: 'An olive-oil-rich, salted flatbread loaf — oily and refined; heavy for Kapha.',
    source: { ...M, note: 'Non-classical. Derived: refined-wheat loaf baked with olive oil + salt, sweet-salty, heavy and oily (Vata↓, Kapha↑). Gluten.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  brioche: {
    id: 'brioche', name: 'Brioche',
    aliases: ['brioche'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['heavy', 'oily'], doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    allergens: ['gluten', 'dairy', 'egg'], cautions: ['high_sugar'],
    whyAvoid: 'A rich, buttery, egg-and-sugar enriched bread — heavy and sweet; strong on Kapha.',
    source: { ...M, note: 'Non-classical. Derived: enriched refined-wheat bread (butter + egg + sugar), sweet, heavy and oily (Vata↓, Kapha↑). Gluten/dairy/egg; high sugar.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  cornbread: {
    id: 'cornbread', name: 'Cornbread',
    aliases: ['cornbread', 'corn bread'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['heavy', 'dry'], doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    allergens: ['gluten'], cautions: ['high_sugar'],
    whyAvoid: 'A sweet, crumbly corn-and-wheat bake — dry-crumbly yet sweet-heavy; leans to Kapha.',
    source: { ...M, note: 'Non-classical. Derived: cornmeal + wheat bake, sweet, heavy and dry (Kapha↑). Usually contains wheat — gluten; high sugar.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  englishMuffin: {
    id: 'englishMuffin', name: 'English muffin',
    aliases: ['english muffin'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light'], doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyAvoid: 'A griddled refined-wheat roll — refined, so it leans to Kapha.',
    source: { ...M, note: 'Non-classical. Derived: griddled refined-wheat roll, sweet and light (Kapha↑). Gluten.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  crumpet: {
    id: 'crumpet', name: 'Crumpet',
    aliases: ['crumpet'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['heavy', 'soft'], doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyAvoid: 'A soft, spongy griddle bread — refined and dense; adds to Kapha.',
    source: { ...M, note: 'Non-classical. Derived: soft griddled refined-wheat batter bread, sweet and heavy-soft (Vata↓, Kapha↑). Gluten.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  breadstick: {
    id: 'breadstick', name: 'Breadstick',
    aliases: ['breadstick', 'breadsticks', 'grissini'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light', 'dry'], doshaEffect: { vata: 1, pitta: 0, kapha: 0 },
    allergens: ['gluten'],
    whyAvoid: 'A dry, crisp baked stick — light and drying, so it can unsettle Vata.',
    source: { ...M, note: 'Non-classical. Derived: crisp baked refined-wheat stick, sweet, light and dry (Vata↑); too light to weigh on Kapha. Gluten.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  pumpernickel: {
    id: 'pumpernickel', name: 'Pumpernickel',
    aliases: ['pumpernickel', 'dark rye bread'],
    category: 'grain', rasa: ['sweet', 'sour'], virya: 'neutral', vipaka: 'sweet',
    guna: ['heavy'], doshaEffect: { vata: 0, pitta: 1, kapha: 1 },
    allergens: ['gluten'],
    whyAvoid: 'A dense, dark, slightly sour rye loaf — heavy; the sourness can nudge Pitta.',
    source: { ...M, note: 'Non-classical. Derived: dense whole-rye sourdough loaf, sweet-sour and heavy (Kapha↑, Pitta↑ from sourness). Gluten (rye).' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  flatbread: {
    id: 'flatbread', name: 'Flatbread',
    aliases: ['flatbread', 'plain flatbread'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light'], doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyAvoid: 'A plain unleavened wheat flatbread — refined-to-wholemeal wheat; leans a little to Kapha.',
    source: { ...M, note: 'Non-classical, generic. Derived: plain wheat flatbread, sweet and light (Kapha↑). Gluten. A catch-all when the specific flatbread is unknown.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
  cornTortilla: {
    id: 'cornTortilla', name: 'Corn tortilla',
    aliases: ['corn tortilla', 'corn tortillas'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light'], doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    whyFavor: 'A thin corn flatbread — light and gluten-free.',
    whyAvoid: 'A starchy corn flatbread, so it leans a little to Kapha.',
    source: { ...M, note: 'Non-classical. Derived: masa (corn) flatbread, sweet and light (Kapha↑), gluten-free — distinct from the wheat tortilla/wrap.' },
    reviewStatus: 'draft', confidence: 'medium',
  },
}
