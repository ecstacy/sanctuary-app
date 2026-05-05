// ─── Dietary Guidance — per-dosha favor / avoid lists ──────────────────────
//
// Source citations — Charaka Samhita (CS):
//   - Sutrasthana 25-27 (Yajjapurushiya, Atreyabhadrakapyiya, Annapanavidhi):
//     dedicated chapters on food, drink, and the six tastes (rasa).
//   - Sutrasthana 5 (Matrashitiya):
//     general rules of eating — proper quantity, timing, attitude.
//   - Vimanasthana 1.21:
//     the six tastes (sweet, sour, salty, pungent, bitter, astringent)
//     and how each acts on the doshas.
//
// Source-text policy: this module paraphrases the Sanskrit verses and
// pre-1923 English translations. Modern commentaries (Bhagwan Dash,
// Sharma) and modern Ayurvedic cookbooks are NEVER lifted verbatim.
//
// ⚠ Schema note: this is reference content for the personalization
// engine and the user's Dosha Profile page — not a meal-planner. It
// guides which tastes and food categories to favor or avoid; specific
// recipes are out of scope for v1.
//
// Important caveat for users: dietary guidance in Ayurveda is highly
// individualized. The lists below are general principles for users
// with a CLEARLY DOMINANT prakriti. Most modern users are dual- or
// tri-doshic, so the practical answer is "favor the foods listed for
// whichever dosha is currently aggravated, by season and symptom."

// ─── Six tastes (Rasa) — the foundation ────────────────────────────────
// Charaka and Sushruta both organize food by six tastes. Each taste
// has a known effect on each dosha. This is the pragmatic skeleton.

export const RASAS = {
  sweet: {
    sanskrit: 'Madhura',
    devanagari: 'मधुर',
    iast: 'madhura',
    elements: ['earth', 'water'],
    effect: { vata: -1, pitta: -1, kapha: 1 }, // -1 = pacifying, +1 = aggravating
    examples: 'rice, wheat, milk, ghee, honey (in moderation), ripe sweet fruits, root vegetables',
    note: 'Pacifies vata and pitta; aggravates kapha when in excess. Most foods we love most are sweet — Charaka cautions against excess.',
  },
  sour: {
    sanskrit: 'Amla',
    devanagari: 'अम्ल',
    iast: 'amla',
    elements: ['earth', 'fire'],
    effect: { vata: -1, pitta: 1, kapha: 1 },
    examples: 'lemon, lime, yogurt, vinegar, fermented foods, sour fruits',
    note: 'Pacifies vata; aggravates pitta and kapha when in excess.',
  },
  salty: {
    sanskrit: 'Lavana',
    devanagari: 'लवण',
    iast: 'lavaṇa',
    elements: ['water', 'fire'],
    effect: { vata: -1, pitta: 1, kapha: 1 },
    examples: 'salt, soy sauce, seaweed, salty snacks',
    note: 'Pacifies vata; aggravates pitta and kapha. Modern diets typically have too much.',
  },
  pungent: {
    sanskrit: 'Katu',
    devanagari: 'कटु',
    iast: 'kaṭu',
    elements: ['fire', 'air'],
    effect: { vata: 1, pitta: 1, kapha: -1 },
    examples: 'chili, ginger, black pepper, mustard, raw onions, garlic',
    note: 'Pacifies kapha; aggravates vata and pitta. The "spicy" taste.',
  },
  bitter: {
    sanskrit: 'Tikta',
    devanagari: 'तिक्त',
    iast: 'tikta',
    elements: ['air', 'ether'],
    effect: { vata: 1, pitta: -1, kapha: -1 },
    examples: 'leafy greens (kale, dandelion, arugula), bitter melon, neem, turmeric, coffee',
    note: 'Pacifies pitta and kapha; aggravates vata. Modern diets typically have too little.',
  },
  astringent: {
    sanskrit: 'Kashaya',
    devanagari: 'कषाय',
    iast: 'kaṣāya',
    elements: ['air', 'earth'],
    effect: { vata: 1, pitta: -1, kapha: -1 },
    examples: 'unripe banana, pomegranate, beans, lentils, chickpeas, green tea, broccoli',
    note: 'Pacifies pitta and kapha; aggravates vata when in excess. The "puckering" sensation.',
  },
}

// ─── Per-dosha dietary guidance ─────────────────────────────────────────

export const DIETARY_GUIDANCE = {

  // ── Vata diet ───────────────────────────────────────────────────────
  vata: {
    dosha: 'vata',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 26.42-44, Vimanasthana 1.21',
      note: 'Vata-pacifying foods are characterized by sweet, sour, and salty tastes; warm, moist, and grounding qualities.',
    },
    principle: 'Vata is cold, dry, light, and irregular. Pacify with warm, moist, oily, grounding food — eaten at REGULAR times in a calm setting.',

    tastes: {
      favor: ['sweet (Madhura)', 'sour (Amla)', 'salty (Lavana)'],
      avoid: ['bitter (Tikta) in excess', 'astringent (Kashaya) in excess', 'pungent (Katu) in excess'],
    },

    favor: {
      grains: 'Cooked grains: rice (basmati, brown), oats, wheat, quinoa.',
      vegetables: 'Cooked, warm, oily: sweet potato, carrot, beet, pumpkin, zucchini, asparagus.',
      fruits: 'Sweet, ripe fruits: bananas, dates, mangoes, peaches, plums, cooked apples, soaked raisins.',
      proteins: 'Mung dal, urad dal (well-cooked), eggs, organic chicken or fish (in moderation).',
      dairy: 'Warm milk, ghee, fresh paneer, lassi (sweet, room temperature).',
      oils: 'Generous use — sesame (best), ghee, olive oil. Oil is medicine for vata.',
      spices: 'Warming, grounding spices: ginger, cinnamon, cardamom, cumin, fennel, asafoetida (hing), nutmeg, clove.',
      drinks: 'Warm water, herbal teas (chamomile, ginger, licorice, fennel), warm milk with cardamom and saffron.',
    },

    avoid: {
      generally: 'Cold, raw, dry, light, and rough foods. Foods that increase gas.',
      specific: [
        'Raw salads, especially in cold weather',
        'Cold drinks, ice cream, frozen yogurt',
        'Dry crackers, popcorn, rice cakes (without ghee)',
        'Excess beans (especially black beans, kidney beans, chickpeas — favor mung dal)',
        'Raw cabbage family (raw broccoli, raw cauliflower, raw kale)',
        'Excessive caffeine',
        'Carbonated drinks',
        'Bitter greens in excess',
      ],
    },

    eatingHabits: [
      'Eat at REGULAR times — vata craves and benefits from rhythm',
      'Eat sitting down, in a calm setting — no eating on the go',
      'Eat warm food, not cold from the fridge',
      'Chew thoroughly and slowly',
      "Don't skip meals — vata aggravates quickly when blood sugar drops",
      'Have your largest meal at lunch (12-1 PM, peak agni / digestive fire)',
      'Light dinner, ideally before 7 PM',
      'Drink warm water during and around meals; cold water dampens digestion',
    ],

    seasonal: 'In autumn (vata season), be especially careful: avoid all cold raw food, drink warm spiced tea, increase oils.',
  },

  // ── Pitta diet ──────────────────────────────────────────────────────
  pitta: {
    dosha: 'pitta',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 26.45-47, Vimanasthana 1.21',
      note: 'Pitta-pacifying foods are characterized by sweet, bitter, and astringent tastes; cool, slightly dry, and not-too-oily qualities.',
    },
    principle: 'Pitta is hot, sharp, and slightly oily. Pacify with cool, mild, slightly dry food — and DO NOT skip meals.',

    tastes: {
      favor: ['sweet (Madhura)', 'bitter (Tikta)', 'astringent (Kashaya)'],
      avoid: ['sour (Amla) in excess', 'salty (Lavana) in excess', 'pungent (Katu)'],
    },

    favor: {
      grains: 'Basmati rice, oats (cooked), wheat (in moderation), barley, white quinoa.',
      vegetables: 'Cooling and bitter: leafy greens (kale, lettuce, spinach), zucchini, cucumber, cilantro, fennel, asparagus, broccoli, sweet potato.',
      fruits: 'Sweet, ripe, NOT sour: melons (very cooling), grapes, pears, apples, mangoes (sweet ones), coconut.',
      proteins: 'Mung dal, split peas, tofu, white meat in moderation, freshwater fish.',
      dairy: 'Cool milk (NOT hot), ghee (in moderation), fresh paneer, sweet lassi (with rosewater or cardamom).',
      oils: 'Coconut, sunflower, ghee — cooling oils. Avoid heavy use of sesame.',
      spices: 'Cooling: cilantro, fennel, mint, dill, cardamom, fresh turmeric, small amounts of cumin and coriander.',
      drinks: 'Coconut water, room-temperature water, mint or rose tea, milk with rosewater or cardamom.',
    },

    avoid: {
      generally: 'Hot, sour, salty, pungent, oily, and fermented foods. Anything that builds heat.',
      specific: [
        'Chili, cayenne, paprika, hot sauces',
        'Raw onions, raw garlic, mustard',
        'Vinegar, pickles, fermented foods (kombucha, kimchi, sauerkraut in excess)',
        'Sour fruits: lemons (in excess), tamarind, sour cherries, green apples',
        'Tomatoes (especially raw, especially in summer)',
        'Alcohol (very heating), excess caffeine',
        'Red meat, especially deep-fried',
        'Aged or sharp cheeses',
        'Yogurt eaten in the evening (sour and warming as it digests)',
      ],
    },

    eatingHabits: [
      'EAT AT REGULAR TIMES — never skip lunch, the meal pitta needs most',
      "Don't eat when angry, rushed, or stressed — pitta digests its emotions",
      'Eat the largest meal at midday when agni is strongest',
      'Cool liquids (room temperature, not iced)',
      'Avoid eating directly under the sun in summer',
      'Wait at least 3 hours between meals',
      "Don't eat past 8 PM in summer; pitta-time begins at 10 PM",
    ],

    seasonal: 'Summer is pitta season — be strict about cooling foods. In winter, you can ease up slightly on the cooling rules and add small amounts of warmth.',
  },

  // ── Kapha diet ──────────────────────────────────────────────────────
  kapha: {
    dosha: 'kapha',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 26.48-50, Vimanasthana 1.21',
      note: 'Kapha-pacifying foods are characterized by pungent, bitter, and astringent tastes; light, dry, and warming qualities.',
    },
    principle: 'Kapha is heavy, cold, oily, and slow. Pacify with light, warm, dry, spicy food — eaten in SMALLER QUANTITIES.',

    tastes: {
      favor: ['pungent (Katu)', 'bitter (Tikta)', 'astringent (Kashaya)'],
      avoid: ['sweet (Madhura) in excess', 'sour (Amla) in excess', 'salty (Lavana) in excess'],
    },

    favor: {
      grains: 'Light grains: barley, millet, buckwheat, quinoa, basmati rice (in moderation), corn. Avoid wheat in excess.',
      vegetables: 'Pungent and bitter: leafy greens, cabbage family (cooked), bitter gourd, daikon, radish, garlic, onions, ginger.',
      fruits: 'Astringent and lighter: apples, pears, pomegranate, berries, dried fruits in small amounts. Avoid bananas, dates, avocados.',
      proteins: 'Mung dal, lentils, lima beans, black beans (well-spiced). Skinless chicken or freshwater fish in small amounts.',
      dairy: 'MINIMIZE — small amounts of low-fat warm milk with ginger or turmeric only. Avoid cheese, yogurt, ice cream.',
      oils: 'MINIMIZE — small amounts of mustard oil, corn oil, ghee. Avoid heavy oils.',
      spices: 'GENEROUS use of warming spices: ginger (fresh and dried), black pepper, turmeric, mustard seed, fenugreek, cumin, cardamom, clove, cayenne, asafoetida (hing).',
      drinks: 'Hot ginger tea, tulsi (holy basil) tea, hot water with lemon and honey (1 tsp), hot spiced milk in small amounts.',
    },

    avoid: {
      generally: 'Heavy, oily, cold, sweet, deep-fried foods. Excess dairy. Anything that adds weight or congestion.',
      specific: [
        'Wheat in excess (bread, pasta, pastries)',
        'Dairy: cheese, ice cream, butter (in excess), heavy cream',
        'Sweet desserts, refined sugar, candy',
        'Deep-fried foods',
        'Cold drinks, especially with ice',
        'Bananas, avocados, coconut, dates (too heavy and sweet)',
        'Beef, pork, heavy red meats',
        'Excess salt',
        'Eating between meals (snacks aggravate kapha)',
      ],
    },

    eatingHabits: [
      'Eat LESS than you feel like eating — kapha digestion is slow',
      'Skip breakfast OR have a very light one (warm spiced tea, perhaps a small bowl of stewed apples with cinnamon)',
      'Eat the main meal at lunch — moderate portion',
      'Light dinner before 7 PM',
      'Don\'t eat between meals — give digestion 4-6 hours',
      'Intermittent fasting CAN work for kapha; try a 14-16 hour overnight fast',
      'Hot drinks throughout the day, especially with ginger',
      'NO eating while watching screens — kapha eats unconsciously',
    ],

    seasonal: 'Late winter into spring is kapha season — be strictest then. Light, warm, spiced food. Avoid the heavy comfort foods of winter once February arrives.',
  },

}

// ─── Helpers ───────────────────────────────────────────────────────────
export function getDietaryGuidance(dosha) {
  return DIETARY_GUIDANCE[dosha]
}

export function getRasa(taste) {
  return RASAS[taste]
}
