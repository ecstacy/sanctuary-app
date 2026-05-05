// ─── Dinacharya — Charaka's daily routine ───────────────────────────────────
//
// Source citations — Charaka Samhita (CS):
//   - Sutrasthana 5 (Matrāśitīya Adhyāya):
//     full chapter on "the proper measure of food and the daily regimen".
//     The dinacharya practices below paraphrase the verses on:
//       • Brahma muhurta (waking before sunrise) — CS 5.4
//       • Tongue scraping (jihvā nirlekhana) — CS 5.74-77
//       • Oil pulling (gaṇḍūṣa) and oil holding (kavala) — CS 5.78-80
//       • Self-massage (abhyaṅga) — CS 5.85-91
//       • Bathing (snāna) — CS 5.94
//       • Eating regimen — CS 5.4-13
//   - Sutrasthana 7 (Naveganadhāraṇīya):
//     verses on natural urges (defecation, urination, sleep) — CS 7.3-25
//   - Ashtanga Hridayam Sutrasthana 2 (Vagbhata, ~7th c.) — referenced
//     as a parallel source for some of the modern timing conventions.
//
// Source-text policy: practices are paraphrased from the Sanskrit verses
// and pre-1923 English translations. Modern Ayurvedic books (Frawley,
// Lad, Svoboda) and online articles are NEVER lifted verbatim — verse
// references and re-paraphrasing only.
//
// ⚠ Important caveat: this is reference content. Practices like
// abhyanga and gandusha require the right materials (sesame oil,
// copper tongue scraper) and a few weeks of consistency to feel
// the benefit. Surface to users as "morning ritual menu" rather
// than mandates.

// ─── Dosha clock — which dosha governs which time of day ────────────────
// CS Sutrasthana 7 implies (and Vagbhata makes explicit) that the
// three doshas govern different parts of the day. Modern practitioners
// teach this as the "dosha clock" — a useful mnemonic for matching
// activities to natural energy.

export const DOSHA_TIMES = {
  morning: [
    { window: '6:00–10:00 AM', dosha: 'kapha', note: 'Heavy, slow time. Best for grounding routines and exercise. Lying past 7 AM deepens stagnation.' },
    { window: '10:00 AM–2:00 PM', dosha: 'pitta', note: 'Sharp, fiery, productive time. Peak digestion at noon — eat the day\'s largest meal here.' },
  ],
  afternoon: [
    { window: '2:00–6:00 PM', dosha: 'vata', note: 'Light, mobile, creative time. Good for art, conversation, problem-solving.' },
  ],
  evening: [
    { window: '6:00–10:00 PM', dosha: 'kapha', note: 'Heavy, slow again. Wind down. Light meal early in the window.' },
    { window: '10:00 PM–2:00 AM', dosha: 'pitta', note: 'Pitta time — staying awake here drives metabolism into overdrive. Sleep by 10 PM ideally.' },
    { window: '2:00–6:00 AM', dosha: 'vata', note: 'Vata time — light sleep, dreams, naturally inclined toward awareness. Brahma muhurta 1.5 hours before sunrise (~4:30) is the most spiritually receptive moment of the day.' },
  ],
}

// ─── Daily practices (in approximate morning-to-evening order) ──────────

export const DINACHARYA_PRACTICES = [

  // ── 1. Wake before sunrise ────────────────────────────────────────────
  {
    id: 'wakeUp',
    name: 'Wake at Brahma Muhurta',
    sanskrit: 'Brahma Muhūrta',
    devanagari: 'ब्रह्म मुहूर्त',
    iast: 'brahma muhūrta',
    timeWindow: '~4:30–5:30 AM (90 minutes before sunrise)',
    doshaTime: 'vata',
    duration: 'one-time',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 5.4',
      note: 'Brahma muhurta is the 48-minute window beginning ~96 minutes before sunrise. The ancient texts (Charaka, Sushruta, Yoga Sutras commentaries) all recommend it.',
    },
    benefits: [
      'Vata predominates — naturally inclined toward subtle awareness and meditation',
      'The mind is calmer pre-sunrise than at any other time',
      'Aligns waking with nature\'s own rhythm',
      'Allows time for the rest of the morning practice without rushing',
    ],
    howTo: [
      'Set an alarm 90 minutes before local sunrise — for most people 4:30–5:30 AM.',
      'Avoid hitting snooze. Once woken, sit up immediately.',
      'Drink a glass of warm water within 5 minutes of waking.',
      'Begin the rest of the morning practice in order.',
    ],
    tools: ['alarm clock (kept across the room helps)', 'warm water'],
    contraindications: [
      'If you\'re sleep-deprived, prioritize 7+ hours of sleep over the early rise. Build up to brahma muhurta gradually.',
      'Pregnant women in the third trimester may need more rest; follow the body.',
      'Shift workers can\'t practice this literally — the principle (consistent wake time, before peak kapha) still applies.',
    ],
  },

  // ── 2. Eliminate ──────────────────────────────────────────────────────
  {
    id: 'eliminate',
    name: 'Morning Elimination',
    sanskrit: 'Mala Tyāga',
    devanagari: 'मल त्याग',
    iast: 'mala tyāga',
    timeWindow: 'within 30 min of waking',
    doshaTime: 'vata',
    duration: '5-10 min',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 7.3-7',
      note: 'Charaka Sutrasthana 7 (Naveganadhāraṇīya) lists the natural urges that should never be suppressed; defecation in the morning is the primary one.',
    },
    benefits: [
      'Clears apana vata — the downward-moving energy responsible for elimination',
      'Sets the digestive tone for the day',
      'Indicator of digestive health — daily formed bowel movement is a health marker in Ayurveda',
    ],
    howTo: [
      'Drink a glass of warm water (or warm water with lemon) on rising.',
      'Wait 5-15 minutes for the gastrocolic reflex to engage.',
      'Sit on the toilet without rushing. A small footstool that elevates the knees can help.',
      "Don't strain. If nothing comes after 5 minutes, get up and try later.",
    ],
    tools: ['warm water', 'optional: small footstool'],
    contraindications: [
      'Chronic constipation needs medical evaluation, not just lifestyle changes.',
      'Pregnancy — gentle, never strain.',
    ],
  },

  // ── 3. Tongue scraping ────────────────────────────────────────────────
  {
    id: 'tongueScraping',
    name: 'Tongue Scraping',
    sanskrit: 'Jihvā Nirlekhana',
    devanagari: 'जिह्वा निर्लेखन',
    iast: 'jihvā nirlekhana',
    timeWindow: 'morning, before brushing teeth',
    doshaTime: 'kapha',
    duration: '30 sec',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 5.74-77',
      note: 'Charaka prescribes daily tongue scraping with a metal scraper. The accumulation on the tongue overnight is "ama" (digestive residue) — removing it is a foundational Ayurvedic practice.',
    },
    benefits: [
      'Removes overnight ama (toxic residue) from the tongue',
      'Improves taste perception — food tastes more vivid through the day',
      'Stimulates the digestive organs via reflex points on the tongue',
      'Reduces oral bacteria; supports breath freshness',
    ],
    howTo: [
      'Stand in front of the bathroom mirror. Stick out the tongue.',
      'Place the U-shaped scraper at the back of the tongue.',
      'Pull the scraper forward gently, applying light pressure.',
      'Rinse the scraper between strokes. Repeat 5-7 times.',
      'Rinse the mouth with warm water.',
      'Now brush teeth.',
    ],
    tools: [
      'Copper tongue scraper (traditional, antibacterial). Stainless steel is acceptable.',
      'Plastic scrapers and the back of a spoon are inferior — skip if those are all that\'s available.',
    ],
    contraindications: [
      'Avoid if you have severe oral injury, mouth ulcers, or recent tongue surgery.',
      'Light pressure only — aggressive scraping can damage taste buds.',
    ],
  },

  // ── 4. Oil pulling ────────────────────────────────────────────────────
  {
    id: 'oilPulling',
    name: 'Oil Pulling',
    sanskrit: 'Gaṇḍūṣa / Kavala',
    devanagari: 'गण्डूष',
    iast: 'gaṇḍūṣa',
    timeWindow: 'morning, after tongue scraping',
    doshaTime: 'kapha',
    duration: '5-15 min',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 5.78-80',
      note: 'Charaka distinguishes gaṇḍūṣa (filling the mouth completely) from kavala (a smaller mouthful). Sesame oil is the traditional medium; modern users often substitute coconut for taste.',
    },
    benefits: [
      'Pulls oil-soluble bacteria and ama out of the gums and teeth',
      'Strengthens the jaw, gums, and teeth',
      'Improves voice clarity and breath freshness',
      'Considered cleansing for the head and sinuses',
    ],
    howTo: [
      'Take 1 tablespoon of warm sesame oil (or coconut oil) in the mouth.',
      'Swish gently and continuously for 5-15 minutes. Move the oil around all areas of the mouth.',
      'DO NOT swallow. The oil collects bacteria and toxins.',
      'Spit the oil into a trash can (NOT the sink — it can clog drains).',
      'Rinse the mouth with warm water. Brush teeth as usual.',
    ],
    tools: [
      'Cold-pressed sesame oil (traditional) or virgin coconut oil',
      'Trash can (NOT the sink)',
    ],
    contraindications: [
      'Skip if you have severe mouth ulcers, recent dental surgery, or active oral infection.',
      'Do not swallow — the oil contains pulled bacteria.',
      'For coconut oil: it solidifies below 76°F. Warm slightly before use.',
      'Pregnancy: safe.',
    ],
  },

  // ── 5. Drink warm water ──────────────────────────────────────────────
  {
    id: 'warmWater',
    name: 'Warm Water on Rising',
    sanskrit: 'Uṣṇa Jala Pāna',
    devanagari: 'उष्ण जल पान',
    iast: 'uṣṇa jala pāna',
    timeWindow: 'within 5 min of waking; again 30 min before each meal',
    doshaTime: 'kapha',
    duration: '1-2 min',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 27.211 (general principle of warm water for digestion)',
      note: 'Charaka emphasizes warm water (uṣṇa jala) over cold for digestion and detoxification. Modern practice is a glass on rising and before each meal.',
    },
    benefits: [
      'Stimulates the gastrocolic reflex — supports morning elimination',
      'Hydrates after the long overnight fast',
      'Warms the digestive fire (agni)',
      'Helps loosen ama accumulated overnight',
    ],
    howTo: [
      'Heat 1-2 cups of water until comfortably warm (not boiling, not lukewarm).',
      'Optional: add a squeeze of lemon (vata-balancing, supports digestion).',
      'Optional: add a pinch of fresh grated ginger or cumin for kapha-aggravation days.',
      'Sip slowly over 2-3 minutes. Do not gulp.',
      'Repeat 30 min before each meal.',
    ],
    tools: ['kettle, mug, optional: lemon, ginger, cumin'],
    contraindications: [
      'Pitta types in summer — use lukewarm rather than hot.',
      'Hot lemon water in excess can erode tooth enamel; rinse afterward.',
    ],
  },

  // ── 6. Abhyanga (self-oil massage) ───────────────────────────────────
  {
    id: 'abhyanga',
    name: 'Self-Oil Massage',
    sanskrit: 'Abhyaṅga',
    devanagari: 'अभ्यङ्ग',
    iast: 'abhyaṅga',
    timeWindow: 'morning, before bathing',
    doshaTime: 'kapha',
    duration: '10-20 min',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 5.85-91',
      note: 'Charaka praises abhyanga as a cornerstone of daily routine. The verses describe oils suited to each dosha, the strokes (long on limbs, circular on joints), and the post-massage bathing.',
    },
    benefits: [
      'Pacifies vata — the warm oil counters dryness and instability',
      'Supports skin, joints, and lymphatic flow',
      'Calms the nervous system before the day begins',
      'Slows visible aging (a CS Sutrasthana 5 claim borne out by modern dermatology research on facial oils)',
    ],
    howTo: [
      'Warm 2-4 tablespoons of oil — sesame for vata/kapha, coconut for pitta — to slightly above body temperature.',
      'Sit on a towel you don\'t mind getting oily.',
      'Apply oil to the crown of the head first. Gentle circular motion.',
      'Move to the face, ears, neck. Long strokes on the limbs (arms, legs); circular on joints (shoulders, elbows, hips, knees, ankles).',
      'Spend extra time on the soles of the feet — vata-rich and grounding.',
      'Rest 10-15 minutes for absorption (a good time to meditate or sit quietly).',
      'Bathe in warm (not hot) water. Use a mild cleanser; some oil should remain on the skin afterward.',
    ],
    tools: [
      'Warm sesame, coconut, or almond oil (~$10 for 16 oz, lasts months)',
      'Old towel for the floor; a "yoga towel" works',
      'Warm bathroom',
    ],
    contraindications: [
      'Skip during fever, severe cold, or severe indigestion',
      "Skip during menstruation (some traditions; others say it's fine — listen to the body)",
      'Skip if you have severe ama (foul body odor, thick coated tongue, heavy lethargy) — abhyanga can drive ama deeper. Resolve digestive issues first.',
      'Pregnant women: skip the deep abdominal massage; light strokes only.',
      'Skip on areas with broken skin, fresh wounds, or active infection.',
    ],
  },

  // ── 7. Asana practice ─────────────────────────────────────────────────
  {
    id: 'morningAsana',
    name: 'Morning Asana Practice',
    sanskrit: 'Āsana Sādhana',
    devanagari: 'आसन साधना',
    iast: 'āsana sādhana',
    timeWindow: 'morning, after bathing',
    doshaTime: 'kapha',
    duration: '20-60 min',
    source: {
      text: 'modern',
      note: 'Charaka does not prescribe asana per se (the systematic asana tradition is post-Hatha-Yoga-Pradipika). Modern dinacharya integrates the morning yoga session as a near-universal practice.',
    },
    benefits: [
      'Counters kapha\'s heaviness through movement',
      'Builds heat after the cool overnight period',
      'Mobilizes the spine, hips, and shoulders for the day',
      'Sets the tone of the body before any other input',
    ],
    howTo: [
      'Roll out the mat in a quiet space.',
      'Start with 2-3 rounds of Cat-Cow (`cardiacWarmup`) to wake the spine.',
      'Do 3-5 rounds of Sun Salutation A (`suryaNamaskarA`).',
      'Add standing poses appropriate to your dosha (see DOSHAS pacification guidance).',
      'Close with seated forward fold (`paschimottanasana`) and Savasana.',
    ],
    tools: ['yoga mat', 'optional: blocks, strap, bolster'],
    contraindications: [
      'Skip Sun Salutations during pregnancy past first trimester — substitute the gentler standing-only flow.',
      'Skip vigorous flow if you have an active injury, illness, or fever.',
    ],
  },

  // ── 8. Pranayama ──────────────────────────────────────────────────────
  {
    id: 'morningPranayama',
    name: 'Morning Pranayama',
    sanskrit: 'Prāṇāyāma',
    devanagari: 'प्राणायाम',
    iast: 'prāṇāyāma',
    timeWindow: 'morning, after asana',
    doshaTime: 'kapha → pitta',
    duration: '5-15 min',
    source: {
      text: 'modern',
      note: 'Pranayama after asana is a Hatha Yoga Pradipika sequence (Ch. 1 prepares with asana, Ch. 2 introduces pranayama). Combined here with the daily routine.',
    },
    benefits: [
      'Establishes breath rhythm for the day',
      'Calms the autonomic nervous system before work begins',
      'Vata: Nadi Shodhana to balance. Pitta: Sheetali in summer. Kapha: Bhastrika or Kapalabhati to energize.',
    ],
    howTo: [
      'Sit in a comfortable seated position (Sukhasana, Padmasana, or Vajrasana).',
      'Begin with 3-5 minutes of Nadi Shodhana — the universally safe starter.',
      'Add a 1-2 minute round of dosha-specific pranayama if appropriate.',
      'Close with 1 minute of natural breath observation.',
    ],
    tools: ['cushion or folded blanket for sitting'],
    contraindications: [
      'Pranayamas with retentions or vigorous breath (Bhastrika, Kapalabhati) have heavy contraindications — see pranayamas.js.',
      'Pregnant women: stick to Nadi Shodhana and Bhramari. Skip retentions, Bhastrika, Kapalabhati.',
    ],
  },

  // ── 9. Meditation ─────────────────────────────────────────────────────
  {
    id: 'meditation',
    name: 'Morning Meditation',
    sanskrit: 'Dhyāna',
    devanagari: 'ध्यान',
    iast: 'dhyāna',
    timeWindow: 'morning, after pranayama',
    doshaTime: 'pitta (transitioning into the active day)',
    duration: '10-30 min',
    source: {
      text: 'CS',
      verse: 'Sharirasthana 1.137-150',
      note: 'Charaka mentions cultivation of the mind alongside the physical body in the chapter on body-mind constitution. The systematic meditation prescription comes from Patanjali\'s Yoga Sutras (~2nd c. BCE) and is integrated here as part of dinacharya.',
    },
    benefits: [
      'Establishes mental orientation for the day',
      'Caps the autonomic regulation begun by pranayama',
      'Builds concentration capacity over weeks of consistent practice',
      'Reduces measurable stress markers',
    ],
    howTo: [
      'Stay seated after pranayama — do not move the body to a different cushion.',
      'Choose a focus: breath observation (most accessible), mantra repetition, or open awareness.',
      'Start with 10 minutes; build to 20-30 over weeks.',
      'When the mind wanders (it will), gently return to the focus without judgment.',
    ],
    tools: ['cushion or folded blanket', 'optional: timer'],
    contraindications: [
      'Severe trauma history may make extended quiet meditation destabilizing — work with a teacher.',
      'Active acute mental health crisis (suicidality, psychosis): seek clinical support, not extended solo meditation.',
    ],
  },

  // ── 10. Light breakfast ──────────────────────────────────────────────
  {
    id: 'breakfast',
    name: 'Light Breakfast',
    sanskrit: 'Prātaḥ Bhojana',
    devanagari: 'प्रातः भोजन',
    iast: 'prātaḥ bhojana',
    timeWindow: '7-9 AM (kapha time)',
    doshaTime: 'kapha',
    duration: '15-30 min',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 5.4-13',
      note: 'Charaka outlines the right time, quantity, and quality of meals. Breakfast should be light and easy to digest, especially for kapha types.',
    },
    benefits: [
      'Supplies energy for the morning',
      'For vata types: stabilizes blood sugar after the overnight fast',
      'For kapha types: a small breakfast or skipping breakfast is often better',
      'For pitta types: don\'t skip — pitta gets cranky',
    ],
    howTo: [
      'Vata: warm cooked oatmeal with ghee, dates, and cinnamon. Or stewed apples with cardamom.',
      'Pitta: cooked oatmeal with milk and cardamom. Or sweet ripe fruit with rose tea.',
      'Kapha: small portion of stewed apples with ginger. Or a cup of warm spiced tea — optionally skip breakfast entirely.',
      'Eat sitting down. Chew thoroughly.',
    ],
    tools: ['warm food, not from the fridge'],
    contraindications: [
      'Skipping breakfast aggravates vata and pitta — try a warm spiced milk or stewed fruit at minimum.',
    ],
  },

  // ── 11. Lunch as the main meal ───────────────────────────────────────
  {
    id: 'lunch',
    name: 'Lunch (Main Meal)',
    sanskrit: 'Madhyāhna Bhojana',
    devanagari: 'मध्याह्न भोजन',
    iast: 'madhyāhna bhojana',
    timeWindow: '12-1 PM (peak pitta — peak agni)',
    doshaTime: 'pitta',
    duration: '20-40 min',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 5.4',
      note: 'Charaka places the largest meal at midday when the digestive fire (agni) is strongest. This is one of the most concrete and impactful Ayurvedic dietary rules.',
    },
    benefits: [
      'Aligns with peak agni — easiest digestion of the day',
      'Provides energy for the productive afternoon',
      'Reduces the late-evening overeating pattern',
    ],
    howTo: [
      'Eat the day\'s LARGEST meal at this time.',
      'Sit, eat without screens, chew thoroughly.',
      'Include all six tastes if possible (especially in vata types).',
      'Take a 5-10 minute walk after eating — supports digestion.',
    ],
    tools: ['actual plate, not a desk'],
    contraindications: [
      'Modern work schedules often make this difficult; do the best you can.',
      'Skip with severe acute illness; eat lightly.',
    ],
  },

  // ── 12. Light dinner ─────────────────────────────────────────────────
  {
    id: 'dinner',
    name: 'Light Dinner',
    sanskrit: 'Sāyaṃ Bhojana',
    devanagari: 'सायं भोजन',
    iast: 'sāyaṃ bhojana',
    timeWindow: '6-7 PM (before sunset, kapha time begins)',
    doshaTime: 'kapha',
    duration: '20-30 min',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 5.4',
      note: 'Charaka recommends finishing the last meal before sunset, when agni dims for the night. Modern teaching adapts to "before kapha-time deepens" — about 7 PM.',
    },
    benefits: [
      'Allows full digestion before sleep',
      'Reduces overnight fermentation and ama buildup',
      'Improves sleep quality and morning elimination',
      'Supports a 12-14 hour overnight fasting window — modern research backs this for metabolic health',
    ],
    howTo: [
      'Eat by 7 PM ideally; absolutely no later than 9 PM.',
      'Choose easily-digested foods: kitchari (rice + mung dal), soup, stewed vegetables.',
      'Avoid raw food, heavy cheese, red meat at dinner.',
      'Take a 5-10 minute slow walk after eating.',
    ],
    tools: ['cookable food, not takeout pizza'],
    contraindications: [
      'Skipping dinner aggravates vata — eat a small light meal even if not hungry.',
      'Late shifts may require flexibility; aim for the principle of "lighter than lunch" if not the timing.',
    ],
  },

  // ── 13. Sleep at brahma muhurta\'s pair ──────────────────────────────
  {
    id: 'sleep',
    name: 'Sleep by 10 PM',
    sanskrit: 'Nidrā',
    devanagari: 'निद्रा',
    iast: 'nidrā',
    timeWindow: '10 PM start (before pitta time begins at 10 PM)',
    doshaTime: 'kapha (sleep onset) → pitta (deep sleep)',
    duration: '7-9 hours',
    source: {
      text: 'CS',
      verse: 'Sutrasthana 21.36-38, Sutrasthana 7.13',
      note: 'Charaka distinguishes proper sleep (timely, sufficient) from improper sleep (during the day, in excess, or at the wrong time). Sleep is one of the three pillars of life (along with diet and brahmacharya / disciplined behavior).',
    },
    benefits: [
      'Aligns with kapha\'s natural settling — falling asleep is easier in the 6-10 PM window',
      'Prevents the "second wind" that hits at 10 PM as pitta time begins',
      'Allows a full 7-9 hour cycle while still rising at brahma muhurta',
      'Sleep before midnight is empirically more restorative than sleep after midnight (modern research and Ayurveda agree)',
    ],
    howTo: [
      'Begin wind-down practices at 9 PM — dim lights, no screens, quiet activity.',
      'Optional: foot massage with warm oil (very calming for vata).',
      'Optional: 5 min of Nadi Shodhana or Bhramari pranayama.',
      'Bed by 10 PM. If not asleep within 20 minutes, get up and read until drowsy — stay off screens.',
      'Bedroom cool, dark, quiet.',
    ],
    tools: ['nighttime routine', 'optional: foot oil, eye pillow'],
    contraindications: [
      'Insomnia is sometimes medical — chronic insomnia warrants a healthcare evaluation.',
      'Shift workers can\'t do this literally; the principles (consistent sleep time, dark cool room, wind-down practices) still help.',
      'New parents: skip the prescriptive timing; sleep when possible.',
    ],
  },

]

// ─── Helpers ───────────────────────────────────────────────────────────
export function getDinacharyaPractice(id) {
  return DINACHARYA_PRACTICES.find(p => p.id === id)
}

export function getDoshaTime(timeOfDay) {
  return DOSHA_TIMES[timeOfDay] || []
}

// ─── Top-level exports for convenient lookup ───────────────────────────
export const DINACHARYA = {
  practices: DINACHARYA_PRACTICES,
  doshaTimes: DOSHA_TIMES,
  source: 'Charaka Samhita Sutrasthana 5 (primary) + Sutrasthana 7 + Vagbhata Ashtanga Hridayam Sutrasthana 2 (parallel)',
}
