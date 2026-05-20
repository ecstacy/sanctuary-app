// ─────────────────────────────────────────────────────────────────────────────
//  protocols.js — three-day pacifying protocols, one per dosha vikriti
//
//  These are the destination behind the VikritiCard's "Plus" action. When a
//  user's last 14 days of self-reports point to elevated Vata, Pitta, or
//  Kapha, this is the structured plan that brings them back. The free path
//  (a single asana / pranayama recommendation) gives immediate value; this
//  is the depth that justifies Plus.
//
//  EDITORIAL VOICE
//  ───────────────
//  Each protocol is written like a real teacher would prescribe: rooted in
//  Charaka Samhita Sutrasthana Ch. 13 (Snehadhyaya / oleation), Ch. 22
//  (Langhana Brimhana / reducing & nourishing therapies), and Ch. 27
//  (Annapana / food and drink), but translated into modern action a
//  user can take this evening without owning a brass tongue scraper.
//
//  Voice rules:
//    • Imperative — "Eat", "Move", "Rest" not "You might consider…"
//    • Specific — "warm sesame oil 1 tbsp" not "use some oil"
//    • Honest about why — each section includes the *reason* this works,
//      drawn from classical theory (qualities pacify their opposites).
//    • No magical thinking — no "manifest your highest self." Doctor's
//      orders, not horoscopes.
//
//  STRUCTURE
//  ─────────
//  Three days, deepest to lightest:
//    Day 1 — DEEP: full pacification, the "I will give you a day off" pass
//    Day 2 — SETTLE: consolidate, layer in challenge
//    Day 3 — INTEGRATE: pick the keystone habit that survives past day 3
//
//  Each day has 5 sections in a fixed order so the user develops muscle
//  memory for the rhythm: Eat → Move → Breathe → Rest → Mindset.
//
//  SECTION KINDS
//  ─────────────
//  Used by ProtocolPage to pick the right icon and accent. Keep this list
//  closed — adding a new kind without updating the page renderer would
//  silently skip the section.
// ─────────────────────────────────────────────────────────────────────────────

export const SECTION_ICONS = {
  food:    'restaurant',
  move:    'self_improvement',
  breath:  'air',
  rest:    'bedtime',
  mindset: 'psychology',
  notice:  'visibility',
}

// ── Vata-pacifying ───────────────────────────────────────────────────────────
// Theme: warm, oily, slow, grounded, predictable. The opposites of Vata's
// cold-dry-light-mobile qualities (Charaka Sutra 1.59).
const VATA_PROTOCOL = {
  id:       'vata',
  vikriti:  'vata',
  title:    'Vata-pacifying protocol',
  subtitle: 'Three days to settle the wind',
  why:      "Vata is the air-and-ether dosha — cold, dry, light, mobile. When it rises, you feel scattered, anxious, depleted, and your sleep gets thin. The remedy is its opposite: warm, oily, slow, predictable. Three days of consistent grounding work resets the pattern.",
  source:   'Charaka Samhita Sutrasthana 13, 22',
  days: [
    {
      day:   1,
      title: 'Ground',
      lede:  "The deepest day. Cancel one optional thing today if you can — the protocol works better on a quiet calendar.",
      sections: [
        {
          kind:  'food',
          title: 'Eat warm, eat oily',
          items: [
            'Hot cooked breakfast — porridge with ghee, dates, cinnamon',
            'Lunch is the largest meal: kitchari, soft rice, root vegetables, sesame oil',
            'Dinner: warm broth or soup, no later than 7pm',
            'Drink: warm water with ginger throughout the day. No iced anything.',
          ],
          note: "Avoid raw salads, crackers, popcorn, cold smoothies, dry fruits eaten dry — all classic Vata-aggravators.",
        },
        {
          kind:  'move',
          title: 'Move slow, hold long',
          items: [
            "5 min Tadasana — feel the earth through your feet",
            "10 min seated forward folds + Supta Baddha Konasana with bolsters",
            "Close with 5 min Balasana, brow heavy on the mat",
          ],
          note: "Hold each pose 5+ breaths. Vata loves novelty — resist the urge to flow quickly between shapes.",
        },
        {
          kind:  'breath',
          title: 'Long, slow exhales',
          items: [
            "5 minutes Nadi Shodhana, alternating nostrils slowly",
            'Make your exhale twice as long as your inhale',
          ],
          note: 'Long exhales engage the vagus nerve — the most direct switch from sympathetic (Vata-aggravating) to parasympathetic.',
        },
        {
          kind:  'rest',
          title: 'Wind down by 9pm',
          items: [
            'Warm bath with a few drops of sesame oil',
            'Phone off and out of the bedroom by 9pm',
            'Asleep by 10:30pm — Vata-aggravation worsens after 10pm',
          ],
        },
        {
          kind:  'mindset',
          title: 'Tonight, nothing to chase',
          items: [
            "Vata's mind is a hummingbird — productive, but it never lands.",
            "For tonight: nothing to optimize. Nothing to prove.",
            "Notice the urge to add one more task. Let it pass.",
          ],
        },
      ],
    },
    {
      day:   2,
      title: 'Settle',
      lede:  "Yesterday's grounding should be just barely showing up — slower mornings, deeper sleep. Today consolidate.",
      sections: [
        {
          kind:  'food',
          title: 'Same warmth, more nourishment',
          items: [
            'Repeat warm breakfast — same time as yesterday if possible (Vata loves rhythm)',
            'Add stewed apples or pears with cardamom as a morning or afternoon snack',
            'Lunch: kitchari again, or rice with mung dal and roasted root vegetables',
            'Continue warm ginger water; consider warm spiced milk with cardamom + nutmeg before bed',
          ],
        },
        {
          kind:  'move',
          title: 'Add one warming flow',
          items: [
            "3 slow Sun Salutations — each one full 10 breaths",
            "Setu Bandha (bridge) — 5 long breaths × 3 rounds",
            "Hold final Savasana 10 minutes, blanket on body",
          ],
          note: 'Slightly more active than Day 1, but still rooted. Sweat is fine; breathlessness is not.',
        },
        {
          kind:  'breath',
          title: 'Bhramari — humming bee',
          items: [
            '5 min Bhramari: inhale through nose, hum the exhale long',
            'Vibration soothes the nervous system more directly than silent breath',
          ],
        },
        {
          kind:  'rest',
          title: 'Self-massage tonight',
          items: [
            'Abhyanga — 5 min warm sesame oil massage before your bath',
            'Feet, calves, shoulders, scalp — that\'s enough',
            'Same 9pm phone curfew, same 10:30 bedtime',
          ],
          note: "Abhyanga is the single most Vata-pacifying practice in classical Ayurveda. The oil + warmth + touch hits all three deficits at once.",
        },
        {
          kind:  'mindset',
          title: 'Settled is strong',
          items: [
            "Vata respects momentum. Two days into a rhythm and your body starts to trust it.",
            'No new commitments today. No big decisions.',
          ],
        },
      ],
    },
    {
      day:   3,
      title: 'Integrate',
      lede:  "The point isn't 3 perfect days — it's the one habit you keep. Pick one and commit.",
      sections: [
        {
          kind:  'food',
          title: 'Pick the keystone',
          items: [
            "Of the food changes, which felt best? Warm breakfast? Lunch as the biggest meal?",
            'Commit to that one — every day, for 30 days',
            "Other meals can drift back. The keystone is what you protect.",
          ],
          note: "One habit kept beats five abandoned. Vata pacification is cumulative.",
        },
        {
          kind:  'move',
          title: 'Full flow, sustainable',
          items: [
            '20 min flow — start grounded (Tadasana), build to Warrior I & II, close with twists + forward folds',
            "Add one challenging pose back: Tree (Vrksasana) or Crow (Bakasana) — Vata needs to remember it can balance",
            '10 min Savasana with a weighted blanket if you have one',
          ],
        },
        {
          kind:  'breath',
          title: 'Pick your breath ritual',
          items: [
            'Nadi Shodhana, Bhramari, or extended exhale — choose the one you\'ll do daily',
            'Tie it to an existing habit: with morning coffee, after evening shower, before bed',
          ],
        },
        {
          kind:  'rest',
          title: 'Protect the sleep window',
          items: [
            "10:30 bedtime is the keystone for Vata. Protect it like a meeting.",
            'Continue the 9pm phone curfew if it helped — most users say it did',
          ],
        },
        {
          kind:  'notice',
          title: "What's shifting?",
          items: [
            "How's your sleep depth, compared to Day 1?",
            "How's your morning energy?",
            "Anxiety level — same, lower, same-but-easier-to-notice?",
          ],
          note: "Tomorrow's checkin will tell us. The drift detection runs again on your new data.",
        },
        {
          kind:  'mindset',
          title: 'Vata loves rhythm — protect your routine',
          items: [
            "The single most Vata-pacifying thing in your life is a predictable schedule.",
            'Same wake time. Same meals. Same bedtime. For Vata, this is medicine.',
          ],
        },
      ],
    },
  ],
}

// ── Pitta-cooling ────────────────────────────────────────────────────────────
// Theme: cool, sweet, gentle, slow. The opposites of Pitta's hot-sharp-
// liquid-light qualities (Charaka Sutra 1.60).
const PITTA_PROTOCOL = {
  id:       'pitta',
  vikriti:  'pitta',
  title:    'Pitta-cooling protocol',
  subtitle: 'Three days to cool the fire',
  why:      "Pitta is the fire-and-water dosha — hot, sharp, intense, driven. When it rises, you feel irritable, critical, overheated, and your skin acts up. The remedy is cooling, sweet, and gentle. Three days of cooling work brings the fire back to where it belongs: in your digestion, not in your mood.",
  source:   'Charaka Samhita Sutrasthana 13, 22',
  days: [
    {
      day:   1,
      title: 'Cool',
      lede:  "Cancel the high-stakes meeting if you can. Pitta rises hardest under deadline pressure — give yourself a softer day.",
      sections: [
        {
          kind:  'food',
          title: 'Cool, sweet, mild',
          items: [
            'Breakfast: sweet fruit (pear, apple, ripe mango, melon), warm but not hot porridge',
            'Lunch: leafy greens, basmati rice, coconut, cucumber, mint',
            'Dinner: light — soup, salad, dal. Eat before 8pm.',
            'Drink: room-temperature water with cucumber + mint; coconut water; rose water',
          ],
          note: "Avoid: chili, garlic, onion, alcohol, vinegar, fermented foods, sour fruits, red meat. All Pitta-aggravators.",
        },
        {
          kind:  'move',
          title: 'Moon-energy practice',
          items: [
            "Moon salutations (Chandra Namaskar) instead of Sun — cool, lateral, soft",
            "10 min forward folds + twists",
            "Pigeon pose (Kapotasana) 3 min per side — releases stored heat in hips",
          ],
          note: 'No competitive yoga today. No racing yourself. Pitta thrives on intensity — that\'s exactly what we\'re NOT giving it.',
        },
        {
          kind:  'breath',
          title: 'Sheetali — cooling breath',
          items: [
            "5 min Sheetali: inhale through curled tongue (or pursed lips), exhale through nose",
            'Air cools as it passes the wet tongue — feels like air conditioning',
          ],
          note: "Sheetali is the single most direct cooling breath. Use it any time during the day if you feel heat rising.",
        },
        {
          kind:  'rest',
          title: 'Cool the body before sleep',
          items: [
            'Cool (not cold) shower 30 min before bed',
            'Bedroom slightly cool — Pitta sleeps poorly when warm',
            "Asleep by 10:30 — Pitta hours (10pm-2am) are when fire peaks; don't be awake for them",
          ],
        },
        {
          kind:  'mindset',
          title: 'This is not a contest',
          items: [
            "Pitta's instinct: optimize this protocol. Beat it. Win at cooling.",
            "Notice that. That's the heat talking.",
            "Today: soften the effort. Find ease.",
          ],
        },
      ],
    },
    {
      day:   2,
      title: 'Soften',
      lede:  'Your edges should be less sharp by now. Today: deepen the cooling.',
      sections: [
        {
          kind:  'food',
          title: 'Continue cool, add bitter + astringent',
          items: [
            'Add bitter greens (kale, arugula, dandelion) and astringent foods (legumes, pomegranate)',
            "Pitta is balanced by sweet, bitter, astringent — these three tastes cool actively",
            "Continue mint, coconut, cucumber. Avoid salty + sour + spicy.",
          ],
        },
        {
          kind:  'move',
          title: 'Cool flow + restorative',
          items: [
            "Slow Moon Salutation × 5",
            "Seated twists — 3 breaths each side, 3 rounds",
            "Supported Setu Bandha (bridge with bolster) — 5 min",
            "Final Savasana with cool damp cloth over eyes",
          ],
        },
        {
          kind:  'breath',
          title: 'Sheetali + Sitkari',
          items: [
            '5 min Sheetali (curled tongue) + Sitkari (teeth-clenched hiss)',
            'Both cool the system — alternate between them or pick the one that feels best',
          ],
        },
        {
          kind:  'rest',
          title: 'Time near water',
          items: [
            "Walk by water if you can — river, lake, ocean. Pitta is pacified by water's element.",
            'If not — a long cool shower or 10 min lying with feet up the wall',
          ],
        },
        {
          kind:  'mindset',
          title: 'Soften the critic',
          items: [
            "Pitta's inner voice is sharp — quick to judge, quick to find fault.",
            "Today: when you catch the critic, name it (\"That's Pitta\") and let it pass without acting on it.",
          ],
        },
      ],
    },
    {
      day:   3,
      title: 'Integrate',
      lede:  'Cooling Pitta is mostly about *not adding fuel*. The keystone is whatever stops the daily aggravation.',
      sections: [
        {
          kind:  'food',
          title: 'Identify the trigger food',
          items: [
            "Of the foods you stopped, which were you eating most? Coffee? Chilies? Alcohol?",
            'That\'s your Pitta-aggravator. Cut it for 30 days, then test how you feel reintroducing it.',
          ],
          note: 'Most Pitta-imbalanced people have one or two trigger foods. Removing them cleanly often eliminates 70% of the heat.',
        },
        {
          kind:  'move',
          title: 'Build the cooling habit',
          items: [
            'A daily 20-min cool flow keeps Pitta in check',
            "Pitta\\'s practice mindset: enjoy the practice, don't perfect it",
            'Save the intensity for sports — keep the yoga gentle',
          ],
        },
        {
          kind:  'breath',
          title: 'Sheetali on demand',
          items: [
            'Use Sheetali whenever you feel heat rising — meetings, traffic, family',
            'It\'s a 60-second pattern interrupt — Pitta\'s most useful breath tool',
          ],
        },
        {
          kind:  'rest',
          title: 'Protect the 10pm bedtime',
          items: [
            "Pitta hours (10pm-2am) are when the fire peaks — if you're awake then, you stay wired",
            'The single best Pitta-pacifying habit: be in bed by 10pm. Yes, really.',
          ],
        },
        {
          kind:  'notice',
          title: "What's shifting?",
          items: [
            "Skin — clearer? Less heat in cheeks/forehead?",
            "Patience — longer fuse with people who used to irritate you?",
            "Sleep — fewer 2am wake-ups?",
          ],
        },
        {
          kind:  'mindset',
          title: 'Soften the effort. Find ease in the work.',
          items: [
            'The Pitta paradox: the people who try hardest to relax do it worst.',
            'You\'re not trying to perform calmness. You\'re trying to stop performing.',
          ],
        },
      ],
    },
  ],
}

// ── Kapha-energizing ─────────────────────────────────────────────────────────
// Theme: light, warm, dry, stimulating, mobile. The opposites of Kapha's
// heavy-slow-cool-oily-smooth qualities (Charaka Sutra 1.61).
const KAPHA_PROTOCOL = {
  id:       'kapha',
  vikriti:  'kapha',
  title:    'Kapha-energizing protocol',
  subtitle: 'Three days to spark the heat',
  why:      "Kapha is the earth-and-water dosha — heavy, slow, cool, sticky. When it rises, you feel sluggish, congested, withdrawn, and progress on anything feels uphill. The remedy is its opposite: light, warm, dry, stimulating. Three days of active pacification gets you out of the stuck.",
  source:   'Charaka Samhita Sutrasthana 13, 22',
  days: [
    {
      day:   1,
      title: 'Spark',
      lede:  "Kapha pacification only works if you do it. There's no gentle version. Today, set an alarm 30 min earlier than usual.",
      sections: [
        {
          kind:  'food',
          title: 'Light, warm, spiced',
          items: [
            "Skip breakfast OR have just warm spiced tea (ginger + black pepper + cinnamon)",
            'Lunch (largest meal): steamed vegetables, lentils, quinoa, plenty of warming spices',
            'Dinner: very small — soup or skip entirely if possible',
            'Drink: hot ginger tea throughout the day; warm water with lemon on waking',
          ],
          note: "Avoid: dairy, sweets, deep-fried, wheat, cold drinks, leftovers. The classic Kapha-aggravators.",
        },
        {
          kind:  'move',
          title: 'Move first thing, move vigorously',
          items: [
            "Wake at 6am — Kapha hours (6-10am) are when stagnation peaks. Don't lie in bed.",
            '10 Sun Salutations, briskly — get the heart rate up',
            'Warrior III, Crow pose, twists with energy',
            'Sweat is the goal — first time you sweat today is your win',
          ],
          note: 'Kapha-pacifying yoga looks more like cardio than yoga. Embrace this.',
        },
        {
          kind:  'breath',
          title: 'Kapalabhati — skull-shining',
          items: [
            "5 min Kapalabhati: sharp exhales through the nose, passive inhales, 30 rounds × 3 sets",
            "Heat-generating, lung-clearing — the most directly Kapha-counteracting breath",
          ],
          note: 'Avoid if pregnant or with high blood pressure / heart conditions.',
        },
        {
          kind:  'rest',
          title: 'Bed before 10pm, no daytime naps',
          items: [
            'Kapha thrives on sleep — too much sleep aggravates more sleep-craving',
            'Stick to 7 hours max tonight',
            "If you nap during the day, you've fed the Kapha. Skip it.",
          ],
        },
        {
          kind:  'mindset',
          title: 'Light up the body from within',
          items: [
            'Kapha\\\'s temptation: comfort, familiarity, "just one more day on the couch"',
            "Today: do one thing that feels slightly hard. Cold shower. A new walking route. Call someone you've been meaning to.",
            'Movement breeds movement.',
          ],
        },
      ],
    },
    {
      day:   2,
      title: 'Stir',
      lede:  'By now your body should be remembering what energy feels like. Push slightly harder today.',
      sections: [
        {
          kind:  'food',
          title: 'Bitter, pungent, astringent',
          items: [
            'Add bitter greens (mustard, kale, dandelion) and pungent spices (mustard seed, ginger, black pepper)',
            'These three tastes actively dry up Kapha excess',
            'Continue skipping or shrinking dinner',
          ],
        },
        {
          kind:  'move',
          title: 'Add resistance',
          items: [
            "Yesterday's Sun Salutations + add a 20-min brisk walk OR a quick strength session",
            'Hold Warrior poses long — 8-10 breaths each',
            'No long Savasana today — 5 min max',
          ],
        },
        {
          kind:  'breath',
          title: 'Bhastrika — bellows breath',
          items: [
            '5 min Bhastrika: forceful inhales AND exhales, like a bellows',
            'Distinct from Kapalabhati — both breaths active, generates internal heat fast',
          ],
          note: 'Avoid if pregnant, with hypertension, or on a full stomach.',
        },
        {
          kind:  'rest',
          title: 'Stay engaged through the afternoon dip',
          items: [
            '2-4pm is Kapha\\\'s drowsy window — fight it with a 5-min walk, not coffee',
            'No naps. Bed at the same time as yesterday (or 30 min earlier).',
          ],
        },
        {
          kind:  'mindset',
          title: 'Variety is medicine',
          items: [
            "Kapha is the dosha of routine taken too far — same food, same chair, same TV.",
            "Today: take one different route. Eat one new food. Talk to one new person.",
          ],
        },
      ],
    },
    {
      day:   3,
      title: 'Integrate',
      lede:  "Kapha rebounds fastest of the doshas — without a daily anchor, you'll be back here in a week. Pick the anchor.",
      sections: [
        {
          kind:  'food',
          title: 'Drop the heaviest meal',
          items: [
            "Of your meals, which feels heaviest? Most likely dinner.",
            'For 30 days: keep dinner small. Soup, broth, light dal. Eat the larger meal earlier.',
            'This single change is the most reliable Kapha-pacifier in the long run.',
          ],
        },
        {
          kind:  'move',
          title: 'Move daily, vigorously',
          items: [
            'Kapha needs movement every single day — 30+ min, breath quickening, sweat',
            'Yoga is good. Walking is fine. Anything that gets you out of "still" mode.',
          ],
        },
        {
          kind:  'breath',
          title: 'Morning heat-builder',
          items: [
            "Kapalabhati first thing in the morning — 3 min — clears the lungs and fog at once",
            'Tie it to wake-up like brushing teeth',
          ],
        },
        {
          kind:  'rest',
          title: 'Wake early, end the day early',
          items: [
            'Sleep window: 10pm to 6am — Kapha thrives on this consistent rhythm',
            'Late nights and late mornings both aggravate Kapha; the body forgets how to feel alert',
          ],
        },
        {
          kind:  'notice',
          title: "What's shifting?",
          items: [
            "Morning fog — clearer faster after waking?",
            "Afternoon energy — fewer crashes?",
            "Mood — less weight, more lift?",
          ],
        },
        {
          kind:  'mindset',
          title: 'Movement breeds movement',
          items: [
            "Kapha at rest stays at rest. Kapha in motion stays in motion.",
            "Your job is to never give the body more than 24 hours of stillness in a row.",
          ],
        },
      ],
    },
  ],
}

export const PROTOCOLS = {
  vata:  VATA_PROTOCOL,
  pitta: PITTA_PROTOCOL,
  kapha: KAPHA_PROTOCOL,
}

export function getProtocol(vikriti) {
  return PROTOCOLS[vikriti] || null
}
