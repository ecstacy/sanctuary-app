// ─── Dosha Prakriti — Charaka-sourced base profiles ────────────────────────
//
// Source citations — all from Charaka Samhita (CS):
//   - Sutrasthana 1 (Dīrghañjīvitīya):        introduction to doshas
//   - Sutrasthana 12 (Vatakalākalīya):        dedicated chapter on Vata
//   - Sutrasthana 17 (Kiyantashirāsīya):      Pitta description
//   - Sutrasthana 18 (Trishothīya):           dosha imbalance signs
//   - Sutrasthana 21 (Ashtauninditīya):       body types incl. kapha
//   - Vimanasthana 8.95-100:                  prakriti (constitution) types
//
// Source-text policy: paraphrased from public-domain Sanskrit verses and
// pre-1923 English translations (Avinash Chandra Kaviratna 1890,
// P. V. Sharma 1981 verse references). Modern commentaries
// (Bhagwan Dash, Sharma) are NEVER lifted verbatim — only verse
// references are used.
//
// ⚠ Schema note: this is not the same shape as asanas/pranayamas — dosha
// profiles are reference material, not practice instructions. They feed
// the personalization engine (which already reads `profile.dosha_details`)
// and surface as informational content on the Dosha Profile page.

export const DOSHAS = {

  // ── Vata ───────────────────────────────────────────────────────────────
  vata: {
    id: 'vata',
    sanskrit: 'Vata',
    devanagari: 'वात',
    iast: 'vāta',
    english: 'Vata',
    aliases: ['Vayu', 'Wind humor'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 12.4-7',
      note: 'Chapter 12 (Vatakalākalīya) of the Charaka Sutrasthana is dedicated to Vata. Its qualities and seats are enumerated there; CS 12.4-7 in particular describes the gunas listed below.',
    },

    // ── Elemental composition (Pancha Mahabhuta) ──
    elements: ['vāyu (air)', 'ākāśa (ether)'],

    // ── Qualities (Gunas) — the 7 attributes that define vata's behavior ──
    // The Sanskrit roots are foundational. We paraphrase but don't drop
    // them — they appear directly in CS Sutrasthana 12.4.
    qualities: [
      { sanskrit: 'śīta',    english: 'cold',     note: 'hands, feet, and digestion run cool' },
      { sanskrit: 'rūkṣa',   english: 'dry',      note: 'skin, hair, joints, and tissues run dry' },
      { sanskrit: 'laghu',   english: 'light',    note: 'thin frame, light bones, light digestion' },
      { sanskrit: 'cala',    english: 'mobile',   note: 'restless mind, irregular movement, variable energy' },
      { sanskrit: 'sūkṣma',  english: 'subtle',   note: 'pervades the smallest channels' },
      { sanskrit: 'khara',   english: 'rough',    note: 'rough skin, brittle nails and hair' },
      { sanskrit: 'viśada',  english: 'clear',    note: 'clarity of perception when balanced' },
    ],

    // ── Body type (Sharira-prakriti) ──
    body: {
      build: 'Thin, light frame. Visible joints and tendons. Often tall or short — rarely medium.',
      skin: 'Dry, rough, cool. May crack in winter. Tans easily, ages early.',
      hair: 'Dry, frizzy, often dark. Splits and breaks easily.',
      face: 'Thin features. Small or sunken eyes. Low or irregular brow.',
      digestion: 'Variable — strong sometimes, sluggish other times. Tends toward gas and constipation.',
      sleep: 'Light, easily disturbed. Often wakes 2-4 AM (peak vata time).',
      energy: 'Bursts of energy followed by fatigue. Hard to sustain.',
    },

    // ── Mental characteristics (Manasa-prakriti) ──
    mind: {
      balanced: [
        'Creative and imaginative — generates ideas easily',
        'Quick learner; adaptable; loves variety and novelty',
        'Enthusiastic and talkative when comfortable',
        'Spiritually inclined — drawn to subtle and abstract',
      ],
      imbalanced: [
        'Anxious, worried, scattered, ungrounded',
        'Difficulty completing tasks — many starts, few finishes',
        'Talks fast, interrupts, struggles to be still',
        'Insomnia, racing thoughts, especially at night',
      ],
    },

    // ── Imbalance signs (Vikriti — when vata aggravates) ──
    imbalanceSigns: [
      'Anxiety and worry without clear cause',
      'Insomnia or fragmented sleep, especially waking 2-4 AM',
      'Constipation, gas, bloating, dry stools',
      'Joint pain, especially in cold or windy weather',
      'Dry skin, cracked lips, brittle nails',
      'Cold hands and feet',
      'Restlessness, fidgeting, inability to settle',
      'Forgetfulness or scattered focus',
      'Tinnitus or sensitivity to sound',
    ],

    // ── Common imbalance triggers ──
    triggers: [
      'Cold weather (autumn into early winter — vata season)',
      'Travel, especially long flights or jet lag',
      'Skipping meals or eating irregularly',
      'Excess raw or cold food',
      'Excess stimulation (loud noise, busy schedules, overwork)',
      'Insufficient sleep',
      'Dryness — low humidity environments',
    ],

    // ── Pacification approach ──
    pacification: {
      principle: 'Like increases like; opposites bring balance. Vata is cold, dry, light, and mobile — pacify with warmth, oil, weight, and routine.',
      lifestyle: [
        'Establish regular daily routines — same wake time, meal times, sleep time',
        'Stay warm — layered clothing, warm beverages, warm room',
        'Daily abhyanga (self-oil massage) with warm sesame oil',
        'Slow down — fewer commitments, longer transitions between tasks',
        'Prioritize 7-9 hours sleep; in bed by 10 PM',
        'Choose grounding, restorative yoga over vigorous flow',
        'Pranayama: Nadi Shodhana, Bhramari (avoid Bhastrika, Kapalabhati)',
        'Meditation for at least 10 min/day — counters mental scatter',
      ],
    },

    // ── User-facing tagline ──
    tagline: 'Creative, quick, and adaptable. Thrives on routine and warmth.',
    season: 'autumn into early winter (October-January in northern hemisphere)',
    timesOfDay: '2-6 AM and 2-6 PM',
  },

  // ── Pitta ──────────────────────────────────────────────────────────────
  pitta: {
    id: 'pitta',
    sanskrit: 'Pitta',
    devanagari: 'पित्त',
    iast: 'pitta',
    english: 'Pitta',
    aliases: ['Fire humor'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 17.41-46, Vimanasthana 8.97',
      note: 'Pitta qualities and seats are described in CS Sutrasthana 17 (Kiyantashirāsīya) and elaborated in Vimanasthana 8.97 in the prakriti classification.',
    },

    elements: ['agni (fire)', 'jala (water)'],

    qualities: [
      { sanskrit: 'uṣṇa',     english: 'hot',          note: 'warm body, strong digestion, heated emotions' },
      { sanskrit: 'tīkṣṇa',   english: 'sharp',        note: 'sharp intellect, sharp digestion, sharp tongue' },
      { sanskrit: 'laghu',    english: 'light (slightly oily)', note: 'medium build, not heavy' },
      { sanskrit: 'snigdha',  english: 'oily',         note: 'oily skin, may break out' },
      { sanskrit: 'drava',    english: 'liquid',       note: 'sweat profusely, easy thirst' },
      { sanskrit: 'sara',     english: 'flowing/mobile', note: 'metabolism is active and moving' },
      { sanskrit: 'amla',     english: 'sour-smelling', note: 'body odor leans sour or pungent' },
    ],

    body: {
      build: 'Medium frame, well-proportioned. Athletic when in shape.',
      skin: 'Soft, warm, often reddish or freckled. Sunburns easily. Prone to acne, rashes, eczema.',
      hair: 'Fine, often reddish, blond, or premature gray. Tendency toward early thinning or balding.',
      face: 'Sharp features. Bright, intense eyes (often green, blue, or hazel). Strong jaw.',
      digestion: 'Strong, sometimes too strong. Hungry on schedule; cranky when meals delayed (the "hangry" phenotype).',
      sleep: 'Sound when calm, but easily disturbed by overheating. May wake 10 PM-2 AM (peak pitta time).',
      energy: 'Sustained, focused. Drives hard; risks burnout.',
    },

    mind: {
      balanced: [
        'Sharp intellect, strong analytical and decision-making capacity',
        'Goal-oriented, ambitious, courageous',
        'Natural leader; clear communicator',
        'Passionate, charismatic',
      ],
      imbalanced: [
        'Irritable, impatient, critical of self and others',
        'Anger that flares quickly, especially when hungry or hot',
        'Perfectionism that becomes self-punishing',
        'Workaholic patterns; difficulty resting',
        'Judgmental, competitive, jealous',
      ],
    },

    imbalanceSigns: [
      'Heartburn, acid reflux, ulcers',
      'Skin rashes, acne, eczema, hot flashes',
      'Inflammation — joints, sinuses, gut',
      'Anger, irritation, road rage',
      'Excess sweating, body heat, hot flashes',
      'Diarrhea, especially with stress',
      'Premature gray hair or hair loss',
      'Eye strain, redness, sensitivity to light',
      'Burnout — exhaustion after sustained drive',
    ],

    triggers: [
      'Heat — summer afternoons, hot climates, hot kitchens',
      'Spicy, sour, salty, fried, fermented foods',
      'Skipping meals (hunger triggers anger)',
      'Excess caffeine, alcohol',
      'Competitive environments, time pressure, deadlines',
      'Suppressing emotions, especially anger',
      'Excess sun exposure',
    ],

    pacification: {
      principle: 'Pitta is hot, sharp, and intense — pacify with cooling, sweetness, and ease.',
      lifestyle: [
        "Don't skip meals — eat at regular times, especially lunch",
        "Stay cool — avoid midday sun, prefer cooler rooms",
        'Choose calming, restorative yoga over hot vinyasa flows',
        'Pranayama: Sheetali, Nadi Shodhana, Bhramari',
        'Spend time in nature — water, trees, moonlight',
        'Slow down ambitions; track your relationship with time pressure',
        'Bedtime by 10 PM (peak pitta time runs 10 PM-2 AM)',
        'Cool oils for abhyanga: coconut, sunflower (instead of sesame)',
      ],
    },

    tagline: 'Sharp, focused, and ambitious. Cools through ease and sweetness.',
    season: 'summer (June-September in northern hemisphere)',
    timesOfDay: '10 AM-2 PM and 10 PM-2 AM',
  },

  // ── Kapha ──────────────────────────────────────────────────────────────
  kapha: {
    id: 'kapha',
    sanskrit: 'Kapha',
    devanagari: 'कफ',
    iast: 'kapha',
    english: 'Kapha',
    aliases: ['Shleshma', 'Phlegm humor', 'Earth-water humor'],
    source: {
      text: 'CS',
      verse: 'Sutrasthana 21, Vimanasthana 8.96',
      note: 'Kapha-dominant body types are described in CS Sutrasthana 21 (Ashtauninditīya) — the chapter on the eight-body classifications; specific qualities and seats appear in Vimanasthana 8.96.',
    },

    elements: ['pṛthvī (earth)', 'jala (water)'],

    qualities: [
      { sanskrit: 'guru',     english: 'heavy',  note: 'solid build, slow metabolism' },
      { sanskrit: 'śīta',     english: 'cold',   note: 'tends to feel cold, slow circulation' },
      { sanskrit: 'mṛdu',     english: 'soft',   note: 'soft skin, gentle disposition' },
      { sanskrit: 'snigdha',  english: 'oily',   note: 'oily/lubricated skin and joints' },
      { sanskrit: 'manda',    english: 'slow',   note: 'slow digestion, slow speech, slow change' },
      { sanskrit: 'sthira',   english: 'stable', note: 'steady, reliable, hard to upset' },
      { sanskrit: 'sāndra',   english: 'dense',  note: 'dense, heavy tissues' },
      { sanskrit: 'śleṣma',   english: 'sticky', note: 'tends toward congestion, mucus' },
    ],

    body: {
      build: 'Solid, sturdy frame. Often broader and heavier than vata or pitta. Easy weight gain, hard weight loss.',
      skin: 'Soft, smooth, often pale or cool. Slow to wrinkle. Tends toward congestion, oily skin.',
      hair: 'Thick, lustrous, often wavy or curly. Strong roots, slow grayer.',
      face: 'Round, full features. Large, calm eyes. Soft, often sweet expression.',
      digestion: 'Slow but steady. Can skip meals without trouble; doesn\'t feel sharp hunger.',
      sleep: 'Deep and abundant. Tends to oversleep; sluggish on waking.',
      energy: 'Steady and enduring. Slow to start; powerful once moving. Stamina for the long haul.',
    },

    mind: {
      balanced: [
        'Calm, patient, loyal — the steadying presence in any group',
        'Compassionate, nurturing, reliable',
        'Long memory, deep retention',
        'Forgiving, slow to anger',
      ],
      imbalanced: [
        'Lethargic, low motivation, hard to start moving',
        'Excessive attachment — to people, possessions, food, routines',
        'Resistance to change, even when change is needed',
        'Sadness, depression, heaviness',
        'Possessive or clingy in relationships',
      ],
    },

    imbalanceSigns: [
      'Weight gain, especially in the chest and belly',
      'Lethargy, oversleeping, hard to wake',
      'Sinus congestion, mucus, frequent colds',
      'Sluggish digestion, food sitting heavy',
      'Water retention, swelling',
      'Depression, sadness without trigger',
      'Allergies, especially seasonal',
      'Slow metabolism, low body temperature',
      'Possessiveness, hoarding tendencies',
    ],

    triggers: [
      'Cold, damp weather (late winter into spring — kapha season)',
      'Heavy, oily, sweet foods — especially dairy, sugar, fried',
      'Daytime napping (sleeping during kapha hours 6-10 AM/PM stagnates)',
      'Sedentary lifestyle, lack of movement',
      'Cold drinks, ice cream',
      'Suppressing change, holding on to what no longer serves',
      'Overeating, especially in the evening',
    ],

    pacification: {
      principle: 'Kapha is heavy, cold, and slow — pacify with warmth, lightness, and movement.',
      lifestyle: [
        'Wake before 6 AM — kapha time begins at 6 AM, lying past it deepens stagnation',
        'Vigorous exercise daily — movement is medicine for kapha',
        'Choose dynamic, warming yoga: Sun Salutations, Warrior series, vinyasa',
        'Pranayama: Bhastrika, Kapalabhati (the heating, energizing breaths)',
        'Skip naps; if tired, take a walk instead',
        'Eat the day\'s lightest meal at dinner; the heaviest at lunch',
        'Spice meals generously — ginger, black pepper, turmeric, cumin',
        'Variety in routines — kapha craves sameness; introduce novelty',
        'Stay warm and dry — avoid cold rain, damp basements',
      ],
    },

    tagline: 'Calm, steady, and enduring. Thrives on movement and lightness.',
    season: 'late winter into spring (February-May in northern hemisphere)',
    timesOfDay: '6-10 AM and 6-10 PM',
  },

}

// ─── Dual-dosha types (the 90% of users in real life) ──────────────────
// Most users are dual-dominant. These short profiles describe the
// blended behavior and which dosha to pacify more aggressively.

export const DUAL_DOSHA_NOTES = {
  'vata-pitta': {
    description: 'Creative drive — vata\'s ideas + pitta\'s focus to execute. Often productive, but burns out quickly when stressed.',
    pacify: 'Whichever is currently aggravated. In summer pacify pitta; in autumn/winter pacify vata.',
  },
  'pitta-vata': {
    description: 'Same as vata-pitta, with pitta dominant. Tends toward higher intensity and more pronounced anger when imbalanced.',
    pacify: 'Pitta first in most seasons except deep autumn/winter where vata flares.',
  },
  'pitta-kapha': {
    description: 'Strong, athletic build with pitta\'s drive. Stable but can become rigid. Tends toward heat AND congestion.',
    pacify: 'Pitta in summer; kapha in late winter/spring.',
  },
  'kapha-pitta': {
    description: 'Steady stamina with focused intelligence. Solid leadership type. Risks: stagnation + burnout.',
    pacify: 'Kapha first in most seasons; pitta in summer.',
  },
  'vata-kapha': {
    description: 'Less common. Light frame with kapha\'s resilience. Both tend cold — extra warmth required.',
    pacify: 'Whichever is symptomatic. Both pacify with warm, oily, grounded.',
  },
  'kapha-vata': {
    description: 'Steady frame with vata\'s creativity. Often artists, writers. Can swing between heaviness and scatter.',
    pacify: 'Both with warmth and routine. Move daily — kapha needs it; vata thrives on it.',
  },
  'tridoshic': {
    description: 'Equal three doshas. Rare but balanced. Adapt seasonal practices to whichever dosha\'s season is active.',
    pacify: 'Follow the seasonal schedule: vata in autumn, kapha in spring, pitta in summer.',
  },
}

// ─── Helpers ───────────────────────────────────────────────────────────
export function getDosha(id) {
  return DOSHAS[id]
}

export function getAllDoshaIds() {
  return Object.keys(DOSHAS)
}
