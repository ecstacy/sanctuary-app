// ─── Canonical Pranayama Dataset ────────────────────────────────────────────
// Single source of truth for breath techniques used across the app.
//
// SCHEMA — see docs/content-buildout.md §3 + §5 for the full contract.
// Pranayamas extend the asana schema with breath-specific fields:
//   practiceSeat: which seated asana ID is recommended
//                 (sukhasana | siddhasana | padmasana | virasana | vajrasana)
//   pattern: structured timing for the technique. Two shapes:
//     - paced:    { inhale, holdAfterIn?, exhale, holdAfterEx?, ratio? }
//     - rate:     { rate, totalSeconds, rounds }
//                 (used for Bhastrika / Kapalabhati where breaths/min matters)
//
// Pranayamas have HEAVIER safety constraints than most asanas. Every entry
// surfaces explicit cardiovascular and pregnancy contraindications. The
// `level` field reflects practice safety, not just difficulty — Bhastrika
// and Kapalabhati are level 'intermediate' even though the mechanics are
// simple, because the autonomic effect is potent.
//
// Source citations: HYP Ch. 2 names 8 pranayamas. Of our 6, four are
// HYP-named (Ujjayi 2.51-53, Sheetali 2.57-58, Bhastrika 2.61-67,
// Bhramari 2.68). Kapalabhati appears in HYP 2.36-37 as a shatkarma
// (kriya) but modern usage treats it as pranayama. Nadi Shodhana is
// modern but consistent with HYP 2.7-10 preparatory description.

export const PRANAYAMAS = {

  // ── Nadi Shodhana — Alternate Nostril Breathing ────────────────────────
  nadiShodhana: {
    id: 'nadiShodhana',
    sanskrit: 'Nadi Shodhana',
    devanagari: 'नाडी शोधन',
    iast: 'nāḍī śodhana',
    english: 'Alternate Nostril Breathing',
    aliases: ['Channel Cleansing Breath', 'Anuloma Viloma'],
    source: {
      text: 'modern',
      verse: '2.7-10',
      note: 'Modern formalization of the alternate-nostril practice described in the Hatha Yoga Pradipika 2.7-10 as preparation for pranayama. The named "Nadi Shodhana" technique was codified in 20th-century lineages.',
    },
    category: 'pranayama',
    level: 'beginner',
    poseKey: 'nadiShodhana',
    icon: 'compare_arrows',
    durationSeconds: 300,
    practiceSeat: 'sukhasana',
    breathPattern: 'paced',
    pattern: {
      inhale: 4,        // counts
      exhale: 4,
      ratio: '1:1',     // sama vritti — equal in/out
      notes: 'Equal-count inhale and exhale through alternating nostrils. Build to longer counts (6:6, 8:8) over weeks. NEVER force the count.',
    },
    breathCues: {
      notes: 'Equal-count breath through one nostril at a time. Each round = 4 breath cycles total (in left, out right, in right, out left).',
    },
    instructions: [
      'Sit comfortably in Sukhasana on a folded blanket. Spine tall, shoulders relaxed.',
      'Form Vishnu mudra with the RIGHT hand: fold the index and middle fingers into the palm, leaving thumb, ring, and little fingers extended.',
      'Bring the right hand to the face. Close the RIGHT nostril with the right thumb.',
      'Inhale slowly through the LEFT nostril, counting to 4.',
      'Close the LEFT nostril with the right ring finger. Release the thumb. Exhale slowly through the RIGHT nostril, counting to 4.',
      'Inhale through the RIGHT nostril (count 4). Close right with thumb. Release ring finger. Exhale LEFT nostril (count 4). That completes one full round.',
      'Continue for 5-10 minutes. Always finish a round on an exhale through the LEFT nostril.',
    ],
    voiceCues: {
      enter: 'Sit comfortably with the spine tall. Form Vishnu mudra with the right hand — index and middle finger folded in, thumb and ring finger extended.',
      hold: 'Close the right nostril with the thumb. Inhale slowly through the left. Close the left with the ring finger. Release the thumb. Exhale through the right.',
      breathe: 'Inhale right, close right, exhale left. Inhale left, close left, exhale right. One full round. Stay with the count — equal in, equal out.',
      exit: 'Always finish on an exhale through the left nostril. Lower the right hand. Sit for one breath in stillness before opening the eyes.',
    },
    bodyParts: ['nervous_system', 'lungs', 'sinuses', 'mind'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 1 },
    tags: [
      'pranayama', 'breathwork', 'meditation_prep', 'morning', 'evening',
      'vata_pacifying', 'pitta_pacifying', 'kapha_pacifying', 'tri_doshic',
      'anxiety', 'stress_relief', 'cant_focus', 'racing_mind', 'cant_sleep',
      'balance', 'centering', 'beginner_friendly',
    ],
    contraindications: [
      "Don't practice with a severe head cold or fully blocked nasal passages — the alternation requires air through both sides",
      "Skip with deviated septum or recent nasal surgery",
      "Pregnant women can practice freely without breath retention",
      "If you have severe asthma, practice without any breath retention and stop if breathless",
    ],
    modifications: [
      "Practice without the hand mudra — simply alternate mental focus from left to right nostril",
      "Reduce the count to 2-3 if 4 feels strained",
      "Practice for shorter durations (2-3 min) and build up",
      "Rest the elbow on a cushion if the arm fatigues during longer sessions",
    ],
    benefits: [
      "Balances the autonomic nervous system — single most-studied pranayama for HRV",
      "Quiets the mind — direct preparation for meditation",
      "Tri-doshic — works for everyone, every season",
      "Most reliable pranayama for users new to breathwork",
    ],
    reasoning: "Nadi Shodhana is the gateway pranayama. It's safe for almost everyone, instantly calming, and builds the breath awareness that all other pranayamas depend on. Practice it before any seated meditation, or as a 5-minute reset during a stressful day. The Sanskrit means 'channel-cleansing' — the channels in question are the energetic nadis, but in modern terms, the autonomic nervous system.",
  },

  // ── Ujjayi — Victorious Breath ─────────────────────────────────────────
  ujjayi: {
    id: 'ujjayi',
    sanskrit: 'Ujjayi',
    devanagari: 'उज्जायी',
    iast: 'ujjāyī',
    english: 'Victorious Breath',
    aliases: ['Ocean Breath', 'Throat Breath', 'Darth Vader Breath'],
    source: {
      text: 'HYP',
      verse: '2.51-53',
      note: "Named explicitly in Hatha Yoga Pradipika Ch. 2. The text describes the soft sound at the throat and its calming effect on the mind.",
    },
    category: 'pranayama',
    level: 'beginner',
    poseKey: 'ujjayi',
    icon: 'graphic_eq',
    durationSeconds: 600,
    practiceSeat: 'sukhasana',
    breathPattern: 'paced',
    pattern: {
      inhale: 4,
      exhale: 6,
      ratio: '1:1.5',
      notes: 'Slight constriction at the back of the throat creates a soft ocean-wave sound on both inhale and exhale. Both breaths through the nose. Used during asana practice (vinyasa) AND seated.',
    },
    breathCues: {
      notes: 'Whisper "haaa" with the mouth closed — the constriction at the throat is what creates the ocean sound. Inhale 4 counts, exhale 6 counts.',
    },
    instructions: [
      'Sit comfortably with the spine tall.',
      'To find the throat constriction: open the mouth and exhale a soft "haaaa" as if fogging up a mirror.',
      'Now keep the same throat shape but close the mouth — the breath now passes through the nose with the throat slightly narrowed.',
      'Listen for the soft ocean-wave or "Darth Vader" sound on each breath. Sound should be gentle, not forced.',
      'Inhale through the nose with the throat constriction for 4 counts.',
      'Exhale through the nose, same constriction, for 6 counts. The exhale is slightly longer.',
      'Continue for 5-15 minutes seated, OR carry the breath through your asana practice.',
    ],
    voiceCues: {
      enter: 'Sit tall. Open the mouth and exhale a soft "haaaa" as if fogging a mirror. Notice the slight narrowing at the back of the throat.',
      hold: 'Close the mouth. Keep the same throat shape. Breathe through the nose. Listen for the soft ocean sound — gentle, not forced.',
      breathe: 'Inhale 4 counts with the ocean sound. Exhale 6 counts. Each breath is slow, audible to yourself only.',
      exit: 'Release the throat constriction. Take three soft natural breaths. Notice the warmth in the chest.',
    },
    bodyParts: ['lungs', 'throat', 'nervous_system', 'diaphragm'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: [
      'pranayama', 'breathwork', 'morning', 'during_practice', 'meditation_prep',
      'vata_pacifying', 'kapha_pacifying', 'focus', 'concentration',
      'warming', 'energizing', 'cant_focus', 'racing_mind', 'beginner_friendly',
    ],
    contraindications: [
      "Don't practice with severe respiratory infection, active asthma flare, or COPD",
      "Skip if the throat constriction makes you cough or feel breathless",
      "Avoid forcing the sound — louder isn't better; ujjayi should be barely audible to yourself",
      "Pregnant women can practice freely",
    ],
    modifications: [
      "Practice with a quieter constriction — the breath should be felt, not forced",
      "Drop the count and just keep the sound steady — match natural breath length",
      "Practice during 3-5 rounds of Sun Salutation as a vinyasa breath",
      "If the throat fatigues, pause and breathe naturally for a minute",
    ],
    benefits: [
      "Most-used pranayama in modern asana practice — the breath that links movement to meditation",
      "Creates a self-feedback loop: hearing your own breath keeps you focused on it",
      "Slows the breath rate, downregulating the sympathetic nervous system",
      "Generates internal heat — useful in cold weather or sluggish kapha-heavy days",
    ],
    reasoning: "Ujjayi is the breath of vinyasa yoga — once users learn it, every asana practice becomes a meditation in motion. The Sanskrit means 'victorious' because the breath sound is said to resemble a conqueror's roar; in practice, it's a gentle ocean wave. Use during sun salutations and longer flows, OR seated for 5-10 minutes as a focusing meditation.",
  },

  // ── Bhramari — Humming Bee Breath ──────────────────────────────────────
  bhramari: {
    id: 'bhramari',
    sanskrit: 'Bhramari',
    devanagari: 'भ्रामरी',
    iast: 'bhrāmarī',
    english: 'Humming Bee Breath',
    aliases: ['Bee Breath'],
    source: {
      text: 'HYP',
      verse: '2.68',
      note: "Named in Hatha Yoga Pradipika Ch. 2.68. The text describes the breath as producing a low humming sound resembling a bee, said to bring great inner happiness.",
    },
    category: 'pranayama',
    level: 'beginner',
    poseKey: 'bhramari',
    icon: 'graphic_eq',
    durationSeconds: 300,
    practiceSeat: 'sukhasana',
    breathPattern: 'paced',
    pattern: {
      inhale: 4,
      exhale: 8,
      ratio: '1:2',
      notes: 'Inhale through the nose; exhale with a soft sustained humming "M-m-m" sound, lips closed, jaw soft. Exhale is twice as long as the inhale to maximize vagal stimulation.',
    },
    breathCues: {
      notes: 'Inhale through the nose. Exhale with a humming sound — like a soft sustained "mmmmmm" — until the breath is fully out.',
    },
    instructions: [
      'Sit comfortably with the spine tall. Soften the jaw.',
      'Optional: form Shanmukhi mudra — close the eyes, plug both ears with the thumbs, rest the index fingers above the eyebrows, middle fingers at the eye corners, ring fingers at the nose corners, little fingers at the lip corners.',
      'Inhale slowly through the nose, counting to 4.',
      'Close the lips lightly. Exhale through the nose with a sustained humming "M-m-m" sound for 6-8 counts.',
      'Feel the vibration resonate in the front of the skull, behind the eyes.',
      'Repeat for 8-12 rounds, or 5 minutes total.',
      "After the last round, sit silently for one breath and notice the quiet that follows.",
    ],
    voiceCues: {
      enter: 'Sit tall. Soften the jaw. Optionally close the ears with the thumbs.',
      hold: 'Inhale slowly through the nose. Close the lips. Exhale with a long humming sound.',
      breathe: 'The hum resonates in the front of the skull. Feel the vibration behind the eyes. Each exhale is twice as long as the inhale.',
      exit: 'After the last round, drop the hum and sit silently. Listen to the quiet behind the breath.',
    },
    bodyParts: ['vagus_nerve', 'nervous_system', 'mind', 'sinuses', 'throat'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: [
      'pranayama', 'breathwork', 'evening', 'pre_sleep', 'meditation_prep',
      'vata_pacifying', 'pitta_pacifying', 'cooling',
      'anxiety', 'stress_relief', 'racing_mind', 'cant_sleep', 'cant_relax',
      'headache_relief', 'tinnitus_relief', 'beginner_friendly',
    ],
    contraindications: [
      "Skip with active ear infection or severe sinus infection",
      "Don't practice during a migraine — the vibration can intensify the pain",
      "Pregnant women can practice freely (excellent for late-pregnancy anxiety)",
      "If the sound makes you feel dizzy, shorten the duration",
    ],
    modifications: [
      "Practice without Shanmukhi mudra — just hum with eyes closed",
      "Lower the pitch of the hum — find the resonance that feels strongest in the head",
      "Reduce to a quiet hum if you're in a shared space",
      "Practice for shorter durations (1-2 minutes) if dizziness occurs",
    ],
    benefits: [
      "Most direct vagal-tone stimulation in the catalog — measurable HRV increase within minutes",
      "Reduces anxiety and physiological stress markers",
      "Pre-sleep favorite for users with racing thoughts at night",
      "The vibration soothes the nervous system without effort or focus required",
    ],
    reasoning: "Bhramari is the most underrated pranayama — quietly powerful for anxiety and insomnia. The sustained humming on the exhale stimulates the vagus nerve via vibration, which downregulates the sympathetic nervous system within 5-10 breaths. Useful when other forms of meditation feel inaccessible — it's hard to maintain a racing thought while humming.",
  },

  // ── Sheetali — Cooling Breath ──────────────────────────────────────────
  sheetali: {
    id: 'sheetali',
    sanskrit: 'Sheetali',
    devanagari: 'शीतली',
    iast: 'śītalī',
    english: 'Cooling Breath',
    aliases: ['Sheetkari (alternative for those who can\'t curl the tongue)'],
    source: {
      text: 'HYP',
      verse: '2.57-58',
      note: "Named in Hatha Yoga Pradipika Ch. 2.57-58. The text describes the practice as cooling, satisfying hunger and thirst, and pacifying excess heat.",
    },
    category: 'pranayama',
    level: 'beginner',
    poseKey: 'sheetali',
    icon: 'ac_unit',
    durationSeconds: 180,
    practiceSeat: 'sukhasana',
    breathPattern: 'paced',
    pattern: {
      inhale: 4,
      exhale: 4,
      ratio: '1:1',
      notes: 'Inhale through a curled tongue (like sucking through a straw). Exhale through the nose. The curled-tongue inhale cools the air entering the body.',
    },
    breathCues: {
      notes: 'Inhale through the curled tongue. Close the mouth. Exhale through the nose. Notice the cool sensation in the throat on the inhale.',
    },
    instructions: [
      'Sit comfortably with the spine tall.',
      'Open the mouth and curl the sides of the tongue up and inward, forming a tube or straw shape. (If you can\'t curl your tongue — about 30% of people can\'t — practice Sheetkari instead: clench the teeth lightly and inhale through the gaps.)',
      'Extend the curled tongue slightly past the lips.',
      'Inhale slowly through the curled tongue, counting to 4. Notice the cool air on the tongue.',
      'Pull the tongue back into the mouth. Close the lips.',
      'Exhale slowly through the nose, counting to 4.',
      'Repeat for 8-12 rounds. NEVER practice in cold weather — the body is already cool enough.',
    ],
    voiceCues: {
      enter: 'Sit tall. Open the mouth and curl the tongue lengthwise into a tube shape. Extend it slightly past the lips.',
      hold: 'Inhale slowly through the curled tongue — feel the cool air on the surface of the tongue.',
      breathe: 'Pull the tongue in. Close the lips. Exhale through the nose. The cooling builds with each round.',
      exit: 'Release the tongue. Rest the lips lightly closed. Take three natural breaths. Notice the cool sensation in the throat and chest.',
    },
    bodyParts: ['mouth', 'throat', 'lungs', 'nervous_system'],
    doshaAffinity: { vata: 0, pitta: 1, kapha: 0 },
    tags: [
      'pranayama', 'breathwork', 'cooling', 'summer', 'midday',
      'pitta_pacifying', 'after_intense_practice',
      'feeling_overheated', 'reduce_anger', 'reduce_irritation',
      'fever_relief', 'thirst_relief', 'beginner_friendly',
    ],
    contraindications: [
      "Don't practice in cold weather or when chilled — Sheetali aggressively cools",
      "Skip with low blood pressure",
      "Avoid with chronic constipation (the cooling effect can slow digestion further)",
      "Don't practice with severe asthma or chronic bronchitis",
      "Pregnant women can practice in summer; skip in cold weather or if chilled",
      "If you can't curl the tongue, practice Sheetkari (clenched teeth, inhale through the gaps) instead",
    ],
    modifications: [
      "Sheetkari variant: lightly clench the teeth, smile, and inhale through the gaps. Same cooling effect for non-tongue-curlers.",
      "Reduce duration to 1-2 minutes if cooling feels too strong",
      "Practice with a small inhale through pursed lips if neither curl nor clench works",
      "Always exit by sitting for a minute and re-warming the breath",
    ],
    benefits: [
      "Direct cooling effect on the autonomic nervous system — reduces body heat in minutes",
      "Pacifies pitta — useful when feeling angry, irritated, or overheated",
      "Reduces the intensity of hot flashes",
      "Can lower fever by a small but noticeable amount",
    ],
    reasoning: "Sheetali is the pranayama for hot summer afternoons, post-intense-practice cool-downs, and any time pitta runs high (anger, irritation, sleepless from heat). The curled-tongue inhale physically cools the air entering the lungs. Skip in winter — the body needs warmth, not cooling. The Sanskrit śītalī means 'cooling' and the effect is unmistakable within 5-8 rounds.",
  },

  // ── Bhastrika — Bellows Breath ─────────────────────────────────────────
  bhastrika: {
    id: 'bhastrika',
    sanskrit: 'Bhastrika',
    devanagari: 'भस्त्रिका',
    iast: 'bhastrikā',
    english: 'Bellows Breath',
    aliases: ['Bellows'],
    source: {
      text: 'HYP',
      verse: '2.61-67',
      note: "Named in Hatha Yoga Pradipika Ch. 2.61-67. The text describes vigorous bellows-like breathing followed by retention. Modern teaching usually omits the deep retention for safety.",
    },
    category: 'pranayama',
    level: 'intermediate',
    poseKey: 'bhastrika',
    icon: 'air',
    durationSeconds: 90,
    practiceSeat: 'sukhasana',
    breathPattern: 'rate',
    pattern: {
      rate: 60,             // breaths per minute (one full cycle = inhale + exhale)
      roundSeconds: 30,
      rounds: 3,
      restBetweenRounds: 30,
      notes: 'Forceful inhale AND forceful exhale through the nose, equal effort on both. Like working a bellows — strong, audible, rhythmic. About 60 breaths per minute. STOP IMMEDIATELY if dizzy or lightheaded.',
    },
    breathCues: {
      notes: 'Forceful inhale, forceful exhale through the nose. Equal effort on both directions. Sound is loud and rhythmic — bellows-like. 30 seconds per round, 3 rounds with 30-second rests between.',
    },
    instructions: [
      'WARNING: Bhastrika is a vigorous practice. Read the contraindications carefully before practicing. Stop immediately if dizzy.',
      'Sit comfortably with the spine very tall. Hands rest on the knees.',
      'Take 3 normal breaths to settle.',
      'Begin Bhastrika: inhale forcefully through the nose, expanding the belly and chest. Exhale forcefully through the nose, contracting the belly. Both directions equally strong.',
      'Maintain a rhythmic pace of about 60 breaths per minute (one breath per second). The sound is audible and rhythmic.',
      'Continue for 30 seconds, then stop and breathe naturally for 30 seconds. Notice the warmth and vibration.',
      'Repeat for 2 more rounds (3 total). After the final round, sit quietly for 1-2 minutes before standing up.',
    ],
    voiceCues: {
      enter: 'Sit very tall. Hands on the knees. Take three settling breaths.',
      hold: 'Begin: forceful inhale, forceful exhale, both through the nose. Equal effort. Belly expands on inhale, contracts on exhale.',
      breathe: 'Stay rhythmic — about one breath per second. 30 seconds. Stop if dizzy.',
      exit: 'Stop. Sit silently. Watch the breath return to natural. Notice the warmth in the chest and the alertness in the mind.',
    },
    bodyParts: ['lungs', 'diaphragm', 'nervous_system', 'belly'],
    doshaAffinity: { vata: -1, pitta: 0, kapha: 1 },
    tags: [
      'pranayama', 'breathwork', 'morning', 'energizing', 'warming',
      'kapha_pacifying', 'sluggishness', 'low_energy', 'wake_up',
      'cardiovascular', 'intermediate', 'cold_weather',
    ],
    contraindications: [
      "Pregnant women SHOULDN'T practice — the abdominal force is unsafe",
      "Skip with high blood pressure, heart disease, or recent cardiac event",
      "Don't practice with hernia, abdominal injury, or recent abdominal surgery",
      "Skip during menstruation",
      "Avoid with severe asthma, COPD, or recent lung infection",
      "Don't practice on a full stomach — wait 3-4 hours after eating",
      "Skip with severe vertigo or balance disorders",
      "STOP IMMEDIATELY if dizzy, lightheaded, or breathless",
    ],
    modifications: [
      "Practice with reduced force — call it 'vigorous nasal breathing' instead of true Bhastrika until the body is conditioned",
      "Reduce the round duration to 15 seconds for the first month",
      "Reduce to 1-2 rounds total",
      "Skip and practice Kapalabhati if the inhale force feels too much",
      "If new to breathwork, practice Nadi Shodhana for 4-6 weeks before attempting Bhastrika",
    ],
    benefits: [
      "Most heating pranayama in the catalog — useful for cold mornings and sluggish kapha days",
      "Increases oxygen delivery and circulation rapidly",
      "Energizing without caffeine — produces alert calm within 1-2 minutes",
      "Strengthens the respiratory muscles",
    ],
    reasoning: "Bhastrika is the espresso of pranayama — fast-acting, energizing, and not for everyone. The contraindications are extensive on purpose: rapid forceful breathing affects heart rate, blood pressure, and intracranial pressure. Save it for users with healthy cardiovascular systems on cold sluggish mornings. Never practice late at night — the alertness is real and lasts for hours.",
  },

  // ── Kapalabhati — Skull-Shining Breath ─────────────────────────────────
  kapalabhati: {
    id: 'kapalabhati',
    sanskrit: 'Kapalabhati',
    devanagari: 'कपालभाति',
    iast: 'kapālabhāti',
    english: 'Skull-Shining Breath',
    aliases: ['Skull Shining', 'Breath of Fire (informal)'],
    source: {
      text: 'HYP',
      verse: '2.36-37',
      note: "Hatha Yoga Pradipika Ch. 2.36-37 lists Kapalabhati as one of the six shatkarmas (cleansing techniques), not as a pranayama. Modern lineages teach it as a pranayama with similar contraindications. We classify it as pranayama for app organization while preserving the HYP citation.",
    },
    category: 'pranayama',
    level: 'intermediate',
    poseKey: 'kapalabhati',
    icon: 'flare',
    durationSeconds: 120,
    practiceSeat: 'vajrasana',
    breathPattern: 'rate',
    pattern: {
      rate: 60,
      roundSeconds: 30,
      rounds: 3,
      restBetweenRounds: 30,
      notes: 'Sharp forceful EXHALE through the nose with passive inhale (the inhale happens automatically as the belly relaxes). Belly snaps inward on the exhale. About 60 exhales per minute. STOP IMMEDIATELY if dizzy.',
    },
    breathCues: {
      notes: 'Sharp exhale through the nose by snapping the belly inward. Inhale is passive — happens by itself as the belly relaxes. Different from Bhastrika because only the exhale is forceful.',
    },
    instructions: [
      'WARNING: Kapalabhati is a vigorous practice. Read the contraindications carefully. Stop immediately if dizzy.',
      'Sit very tall — Vajrasana works well; Sukhasana on a folded blanket is also fine. Spine straight.',
      'Place one hand on the belly to feel the action.',
      'Take 3 settling breaths.',
      'Begin Kapalabhati: exhale sharply through the nose by snapping the belly inward toward the spine. The exhale is short and sharp.',
      'Let the belly relax — the inhale happens passively. DO NOT actively inhale.',
      'Continue at a rate of about 60 exhales per minute (one per second). Sound is rhythmic, audible, focused on the exhale.',
      'After 30 seconds, stop and breathe naturally for 30 seconds. Repeat for 3 rounds total. Sit quietly for 1-2 minutes after the final round.',
    ],
    voiceCues: {
      enter: 'Sit very tall. Place one hand on the belly. Take three settling breaths.',
      hold: 'Sharp exhale through the nose — belly snaps inward. Let the inhale happen by itself as the belly relaxes.',
      breathe: 'Stay rhythmic — about one exhale per second. Focus only on the sharp exhale; the inhale takes care of itself.',
      exit: 'Stop. Sit silently. Watch the breath return to natural. Notice the brightness behind the eyes — the "skull-shining" effect.',
    },
    bodyParts: ['lungs', 'diaphragm', 'belly', 'sinuses', 'mind'],
    doshaAffinity: { vata: -1, pitta: 0, kapha: 1 },
    tags: [
      'pranayama', 'breathwork', 'morning', 'energizing', 'warming',
      'kapha_pacifying', 'sluggishness', 'low_energy', 'wake_up',
      'mental_clarity', 'sinus_clearing', 'cardiovascular',
      'intermediate', 'cold_weather',
    ],
    contraindications: [
      "Pregnant women SHOULDN'T practice — the abdominal force is unsafe",
      "Skip with high blood pressure, heart disease, or recent cardiac event",
      "Don't practice with hernia, abdominal injury, or recent abdominal surgery",
      "Skip during menstruation — the abdominal action is contraindicated",
      "Avoid with severe asthma, COPD, or recent respiratory infection",
      "Don't practice with vertigo, severe migraine, or after a recent stroke",
      "Skip with epilepsy or any seizure history — the autonomic effect can trigger episodes",
      "Don't practice on a full stomach — wait 3-4 hours after eating",
      "STOP IMMEDIATELY if dizzy, lightheaded, or if vision goes spotty",
    ],
    modifications: [
      "Reduce the rate to 30-40 exhales per minute for the first month",
      "Reduce round duration to 15-20 seconds",
      "Practice 1-2 rounds total",
      "Practice with eyes open if dizziness occurs with eyes closed",
      "Skip and practice Nadi Shodhana if Kapalabhati feels overstimulating",
    ],
    benefits: [
      "Cleanses the sinuses and respiratory tract",
      "Activates the abdominal organs through rhythmic compression",
      "Produces the 'skull-shining' clarity — measurable cognitive alertness",
      "Strengthens the diaphragm and abdominal muscles",
    ],
    reasoning: "Kapalabhati is the most misnamed pranayama in modern yoga — the Hatha Yoga Pradipika lists it as a shatkarma (kriya/cleansing technique), not a pranayama. The mechanics are similar to Bhastrika but with passive inhales — easier to learn but with the same heavy contraindications because the autonomic effect is real. Use as a 2-minute morning wake-up on cold sluggish days when caffeine isn't on the menu.",
  },

}

// ─── Pranayama lookup helpers ────────────────────────────────────────────

export function getPranayama(id) {
  return PRANAYAMAS[id]
}

export function getAllPranayamaIds() {
  return Object.keys(PRANAYAMAS)
}
