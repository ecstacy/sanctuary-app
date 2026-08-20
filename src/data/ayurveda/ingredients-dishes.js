// ─────────────────────────────────────────────────────────────────────────────
//  ingredients-dishes.js — common named DISHES people log, plus plain salt.
//
//  Meal Check kept returning nothing for everyday orders like "dosa" or
//  "sambar" — a real dish, but not an ingredient in the corpus, so it read as
//  gibberish. These are the most-typed Indian restaurant/home dishes, modelled
//  as COMPOSITE ingredients (same precedent as hummus / pesto / instant
//  noodles): one row per dish, doshaEffect DERIVED from its typical make-up
//  (named in each source.note). Plain `salt` (lavana) is here too — it was
//  simply missing (only rockSalt existed).
//
//  These are `reviewStatus: 'reviewed'` — signed off with the founder on
//  2026-08-16 (the dishes are well-characterised and the derivations are
//  directional). Property-derived composites carry source.text 'modern' and
//  confidence 'medium'; salt is classically attested (lavana rasa) so it is
//  source CS / confidence high. Sign convention: −1 pacifies / +1 aggravates.
// ─────────────────────────────────────────────────────────────────────────────

const M = { text: 'modern' }

/** @type {Record<string, import('./ingredients').Ingredient>} */
export const DISH_INGREDIENTS = {
  // ── Plain salt (was missing) ───────────────────────────────────────────────
  salt: {
    id: 'salt', name: 'Salt',
    sanskrit: 'Lavana',
    aliases: ['salt', 'table salt', 'common salt', 'sea salt', 'namak', 'salz'],
    category: 'spice', rasa: ['salty'], virya: 'heating', vipaka: 'sweet',
    guna: ['heavy', 'oily', 'sharp'], doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    whyFavor: 'A pinch kindles taste and digestion and grounds Vata.',
    whyAvoid: 'Heating and water-holding — excess aggravates Pitta and Kapha and unsettles the blood.',
    cautions: ['high_sodium'],
    cautionNote: 'Excess salt is classically and clinically cautioned — a little, not a lot.',
    source: { text: 'CS', verse: 'Sutrasthana 26', note: 'Lavana rasa is classically attested: salty, heating, grounds Vata, aggravates Pitta and Kapha in excess.' },
    reviewStatus: 'reviewed', confidence: 'high',
  },

  // ── South Indian ───────────────────────────────────────────────────────────
  dosa: {
    id: 'dosa', name: 'Dosa',
    aliases: ['dosa', 'masala dosa', 'plain dosa', 'dose'],
    category: 'other', rasa: ['sweet', 'sour'], virya: 'heating', vipaka: 'sour',
    guna: ['light', 'dry'], doshaEffect: { vata: 0, pitta: 1, kapha: 0 },
    whyFavor: 'A fermented rice-and-lentil crepe — light and easier to digest than plain batter.',
    whyAvoid: 'The ferment is mildly souring and it is griddled in oil, so it can nudge Pitta.',
    source: { ...M, note: 'Composite dish (fermented rice + urad batter, griddled). Derived: light, fermented, mildly sour and heating (Pitta↑). A masala dosa with potato filling is heavier.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  idli: {
    id: 'idli', name: 'Idli',
    aliases: ['idli', 'idly', 'steamed rice cake'],
    category: 'other', rasa: ['sweet', 'sour'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light', 'soft'], doshaEffect: { vata: 0, pitta: 0, kapha: 0 },
    whyFavor: 'Steamed, fermented and soft — one of the easiest cooked foods to digest.',
    source: { ...M, note: 'Composite dish (steamed fermented rice + urad). Derived: light, soft, broadly tridoshic-neutral — the steaming and ferment make it very digestible.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  sambar: {
    id: 'sambar', name: 'Sambar',
    aliases: ['sambar', 'sambhar', 'sambaar'],
    category: 'other', rasa: ['sour', 'pungent', 'astringent'], virya: 'heating', vipaka: 'pungent',
    guna: ['light'], doshaEffect: { vata: 0, pitta: 1, kapha: 0 },
    whyFavor: 'A warm, spiced lentil-and-vegetable broth — light, digestive and grounding.',
    whyAvoid: 'Tamarind-sour and spiced, so it can nudge Pitta.',
    source: { ...M, note: 'Composite dish (toor dal + tamarind + vegetables + sambar spices). Derived: light, sour-pungent and heating (Pitta↑), broadly neutral for Vata and Kapha.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  meduVada: {
    id: 'meduVada', name: 'Medu vada',
    aliases: ['vada', 'medu vada', 'urad vada', 'vadai'],
    category: 'other', rasa: ['astringent', 'salty'], virya: 'heating', vipaka: 'pungent',
    guna: ['oily', 'heavy'], doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    whyAvoid: 'A deep-fried urad-dal fritter — oily and heating; adds to Pitta and Kapha.',
    source: { ...M, note: 'Composite dish (ground urad dal, deep-fried). Derived: oily, heavy and heating (Kapha↑, Pitta↑, Vata↓).' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  uttapam: {
    id: 'uttapam', name: 'Uttapam',
    aliases: ['uttapam', 'uthappam', 'ooththappam'],
    category: 'other', rasa: ['sweet', 'sour'], virya: 'neutral', vipaka: 'sweet',
    guna: ['heavy', 'soft'], doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    whyFavor: 'A thick, soft fermented pancake with vegetables — grounding and filling.',
    whyAvoid: 'Thicker than a dosa, so it is a little heavier for Kapha.',
    source: { ...M, note: 'Composite dish (thick fermented rice-urad pancake + vegetables). Derived: soft, heavy, sweet-sour (Kapha↑), gentle on Vata and Pitta.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  rasam: {
    id: 'rasam', name: 'Rasam',
    aliases: ['rasam', 'saaru', 'pepper rasam'],
    category: 'other', rasa: ['sour', 'pungent'], virya: 'heating', vipaka: 'pungent',
    guna: ['light'], doshaEffect: { vata: 0, pitta: 1, kapha: -1 },
    whyFavor: 'A thin, peppery tamarind broth — light, warming and appetite-kindling; clears Kapha.',
    whyAvoid: 'Sour and peppery, so it can add to Pitta.',
    source: { ...M, note: 'Composite dish (tamarind + pepper + tomato + spices, thin broth). Derived: light, sour-pungent and heating (Pitta↑, Kapha↓) — a classic digestive.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  poha: {
    id: 'poha', name: 'Poha',
    aliases: ['poha', 'pohe', 'flattened rice dish', 'aval'],
    category: 'other', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light', 'soft'], doshaEffect: { vata: 0, pitta: 0, kapha: 0 },
    whyFavor: 'Flattened rice, lightly tempered — soft, light and easy to digest.',
    source: { ...M, note: 'Composite dish (flattened rice + light tempering of mustard, curry leaf, onion). Derived: light, soft and broadly neutral.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  dhokla: {
    id: 'dhokla', name: 'Dhokla',
    aliases: ['dhokla', 'khaman'],
    category: 'other', rasa: ['sweet', 'sour', 'astringent'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light', 'soft'], doshaEffect: { vata: 1, pitta: 0, kapha: 0 },
    whyFavor: 'A steamed, fermented gram-flour cake — light and spongy.',
    whyAvoid: 'Gram flour is astringent, so it can be a little Vata-provoking.',
    source: { ...M, note: 'Composite dish (steamed fermented gram-flour batter). Derived: light, soft, sweet-sour-astringent (Vata↑ mildly), gentle on Pitta and Kapha.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // ── North Indian ───────────────────────────────────────────────────────────
  chole: {
    id: 'chole', name: 'Chole',
    aliases: ['chole', 'chana masala', 'chickpea masala', 'chhole'],
    category: 'other', rasa: ['astringent', 'pungent', 'sour'], virya: 'heating', vipaka: 'pungent',
    guna: ['heavy'], doshaEffect: { vata: 0, pitta: 1, kapha: 1 },
    whyAvoid: 'A spiced chickpea curry — substantial and heating; the chickpea is heavy for Kapha and can be gas-forming.',
    source: { ...M, note: 'Composite dish (chickpeas in a spiced onion-tomato gravy). Derived: heavy, astringent-pungent-sour and heating (Kapha↑, Pitta↑).' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  palakPaneer: {
    id: 'palakPaneer', name: 'Palak paneer',
    aliases: ['palak paneer', 'saag paneer', 'spinach paneer'],
    category: 'other', rasa: ['astringent', 'sweet'], virya: 'heating', vipaka: 'pungent',
    guna: ['heavy', 'oily'], doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    allergens: ['dairy'],
    whyFavor: 'Spinach with soft paneer — grounding and nourishing for Vata.',
    whyAvoid: 'Rich with cream and paneer, so it is heavy for Kapha and spiced-heating for Pitta.',
    source: { ...M, note: 'Composite dish (spinach purée + paneer + spices/cream). Derived: heavy, oily, astringent-sweet and heating (Kapha↑, Pitta↑, Vata↓). Dairy.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  dalMakhani: {
    id: 'dalMakhani', name: 'Dal makhani',
    aliases: ['dal makhani', 'daal makhani', 'makhani dal'],
    category: 'other', rasa: ['sweet', 'sour', 'salty'], virya: 'heating', vipaka: 'pungent',
    guna: ['heavy', 'oily'], doshaEffect: { vata: -1, pitta: 1, kapha: 1 },
    allergens: ['dairy'],
    whyFavor: 'Slow-cooked black lentils with butter and cream — very grounding for Vata.',
    whyAvoid: 'Rich with butter and cream — heavy and oily for Kapha, and heating for Pitta.',
    source: { ...M, note: 'Composite dish (black lentil + kidney bean + butter + cream + spices). Derived: heavy, oily and heating (Kapha↑, Pitta↑, Vata↓). Dairy.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  alooGobi: {
    id: 'alooGobi', name: 'Aloo gobi',
    aliases: ['aloo gobi', 'aloo gobhi', 'potato cauliflower'],
    category: 'other', rasa: ['astringent', 'pungent'], virya: 'heating', vipaka: 'pungent',
    guna: ['heavy', 'dry'], doshaEffect: { vata: 1, pitta: 0, kapha: 0 },
    dietTags: ['nightshade'],
    whyAvoid: 'A dry potato-and-cauliflower curry — both are astringent and gas-forming, so it can unsettle Vata.',
    source: { ...M, note: 'Composite dish (potato + cauliflower + spices, dry). Derived: heavy, dry, astringent-pungent (Vata↑), broadly neutral for Pitta and Kapha. Nightshade tag follows the potato.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  upmaDish: {
    id: 'upmaDish', name: 'Upma',
    aliases: ['upma', 'uppma', 'rava upma'],
    category: 'other', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['heavy', 'soft'], doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    whyFavor: 'A soft, savoury semolina porridge — warm and grounding for Vata.',
    whyAvoid: 'Semolina is a refined wheat, so it leans a little to Kapha.',
    source: { ...M, note: 'Composite dish (roasted semolina cooked soft with a spiced tempering). Derived: soft, heavy, sweet (Vata↓, Kapha↑).' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },

  // ── Breads & sandwiches — depth so common terms resolve right ──────────────
  // A generic sandwich (bread + filling); "sandwich"/"cheese sandwich"/"sub"
  // used to mis-match the bare cheese or a tortilla wrap.
  sandwich: {
    id: 'sandwich', name: 'Sandwich',
    aliases: ['sandwich', 'sandwiches', 'cheese sandwich', 'ham sandwich', 'veg sandwich', 'sub', 'submarine', 'panini', 'toastie'],
    category: 'other', rasa: ['sweet', 'salty'], virya: 'neutral', vipaka: 'sweet',
    guna: ['heavy'], doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyAvoid: 'Refined bread with a filling — heavy for Kapha; the reading shifts with what is inside.',
    source: { ...M, note: 'Composite dish (bread + filling). Derived: heavy, sweet-salty (Kapha↑), broadly neutral for Pitta/Vata. A rich/meat/cheese filling raises Pitta and Kapha; add those items to refine the reading.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  baguette: {
    id: 'baguette', name: 'Baguette',
    aliases: ['baguette', 'french bread', 'french stick'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light', 'dry'], doshaEffect: { vata: 1, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyAvoid: 'A crusty refined-wheat loaf — dry for Vata and refined-flour-sweet for Kapha.',
    source: { ...M, note: 'Non-classical. Derived: crusty refined-wheat bread, light and dry (Vata↑, Kapha↑). Gluten.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
  breadRoll: {
    id: 'breadRoll', name: 'Bread roll',
    aliases: ['bread roll', 'dinner roll', 'bun', 'burger bun', 'soft roll'],
    category: 'grain', rasa: ['sweet'], virya: 'neutral', vipaka: 'sweet',
    guna: ['light', 'soft'], doshaEffect: { vata: 0, pitta: 0, kapha: 1 },
    allergens: ['gluten'],
    whyAvoid: 'A soft refined-wheat roll — leans to Kapha.',
    source: { ...M, note: 'Non-classical. Derived: soft refined-wheat roll, light and soft (Kapha↑). Gluten.' },
    reviewStatus: 'reviewed', confidence: 'medium',
  },
}
