// ─── Canonical Asana Dataset ────────────────────────────────────────────────
// Single source of truth for all yoga poses used across the app.
//
// SCHEMA — see docs/content-buildout.md §3 for the full contract.
// Every entry MUST have:
//   id, sanskrit, iast, english, source.{text,verse?,note?}, category, level,
//   poseKey, icon, durationSeconds, breathPattern, breathCues, voiceCues,
//   bodyParts, doshaAffinity {vata,pitta,kapha}, tags,
//   contraindications (NEVER empty), modifications, benefits, reasoning.
//
// Optional: aliases, prerequisites, counterPoses, variations.
//
// Entries without the new schema are LEGACY and scheduled for migration
// (see docs/content-buildout.md §8.5). They are marked `// LEGACY ⚠`.
//
// IDs are Sanskrit camelCase (e.g. `bhujangasana`, `adhoMukhaSvanasana`).
// During migration, ASANA_ALIASES at the bottom of this file resolves old
// English IDs (`cobra`, `bridge`, …) to new ones for backward compatibility.

export const ASANAS = {
  // ── Standing Poses ──────────────────────────────────────────────────────
  // ── Pilot 1: Tadasana ─────────────────────────────────────────────────
  // Modern foundational standing pose. Not named in HYP Ch. 1 — first
  // codified in 20th-century hatha (Krishnamacharya lineage). The "even
  // simple poses have contraindications" rule applies: vertigo, recent
  // ankle injury, fainting tendency are real concerns.
  tadasana: {
    id: 'tadasana',
    sanskrit: 'Tadasana',
    devanagari: 'ताडासन',
    iast: 'tāḍāsana',
    english: 'Mountain Pose',
    aliases: ['Palm Tree Pose', 'Samasthiti'],
    source: {
      text: 'modern',
      note: 'Modern foundational pose, codified in 20th-century hatha. Not named in HYP Ch. 1.',
    },
    category: 'standing',
    level: 'beginner',
    poseKey: 'tadasana',
    icon: 'landscape',
    durationSeconds: 60,
    breathPattern: 'natural',
    breathCues: {
      notes: 'Steady natural breath. The pose itself is the breath cue — observe the rise and fall of the chest.',
    },
    voiceCues: {
      enter: 'Stand with the feet together, the inner edges touching. Arms rest by your sides. Distribute weight evenly across both feet.',
      hold: 'Lift the kneecaps without locking the knees. Lengthen the spine. Crown of the head reaches toward the ceiling. Shoulders relaxed away from the ears.',
      breathe: 'Breathe naturally. Feel rooted through the soles of the feet, light through the crown.',
      exit: 'Soften the legs. Take a breath and notice how you feel.',
    },
    bodyParts: ['feet', 'ankles', 'legs', 'spine', 'core'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 0 },
    tags: [
      // Conceptual / system
      'posture', 'grounding', 'morning', 'pre_meditation', 'vata_pacifying', 'gentle',
      // Search-intent — what users actually type
      'stand_taller', 'foundation', 'beginner_friendly', 'centering', 'all_levels',
    ],
    contraindications: [
      "Don't practice with severe vertigo or balance disorders — use a wall for support",
      "Avoid if you have a recent ankle or foot injury",
      "If you have low blood pressure or feel lightheaded, rise slowly afterward",
    ],
    modifications: [
      'Stand with feet hip-width apart for greater stability',
      'Practice with the back against a wall for proprioceptive feedback',
      'If standing is difficult, practice lying on the back as Supta Tadasana',
    ],
    benefits: [
      'Establishes neutral spinal alignment used in all standing asanas',
      'Strengthens the thighs, knees, and ankles',
      'Improves balance and proprioception',
      'Reduces postural slumping and forward-head posture',
    ],
    reasoning: 'Tadasana is the reference pose for everything else — the alignment template the body returns to between asanas. For users with restless minds (vata-heavy), the demand to stand still and observe is itself the practice.',
  },

  warrior1: {
    id: 'warrior1',
    sanskrit: 'Virabhadrasana I',
    english: 'Warrior I',
    icon: 'shield',
    durationSeconds: 45,
    category: 'standing',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'balancing' },
    bodyParts: ['Hips', 'Legs', 'Shoulders', 'Core'],
    benefits: ['Strengthens legs and core', 'Opens hips and chest', 'Builds stamina', 'Improves focus'],
    reasoning: 'A powerful standing pose that channels fierce determination. Warrior I opens the heart center while grounding through the legs — excellent for building both physical and mental strength.',
    voiceCues: {
      enter: 'Step your right foot forward into a lunge. Turn your back foot out forty-five degrees. Raise your arms overhead.',
      hold: 'Sink your hips down, bending your front knee over your ankle. Press through the outer edge of your back foot. Arms reach high.',
      breathe: 'Inhale strength. Exhale anything you no longer need. You are a warrior.',
      exit: 'Lower your arms and step your feet together. We will repeat on the other side.',
    },
    poseKey: 'warrior1',
  },

  // ── Pilot 3: Virabhadrasana II ─────────────────────────────────────────
  // Modern hatha asana, named for the warrior incarnation Virabhadra
  // born from Shiva's anger. Not in HYP Ch. 1 — codified in 20th-
  // century Krishnamacharya lineage. Distinct from Warrior I in that
  // the hips open laterally rather than facing forward.
  virabhadrasanaII: {
    id: 'virabhadrasanaII',
    sanskrit: 'Virabhadrasana II',
    devanagari: 'वीरभद्रासन II',
    iast: 'vīrabhadrāsana II',
    english: 'Warrior II',
    aliases: ['Warrior 2', 'Hero Pose II'],
    source: {
      text: 'modern',
      note: 'Named for the warrior incarnation Virabhadra. Modern asana, codified in 20th-century hatha (Krishnamacharya lineage).',
    },
    category: 'standing',
    level: 'beginner',
    poseKey: 'warrior2',
    icon: 'fitness_center',
    durationSeconds: 45,
    breathPattern: 'natural',
    breathCues: {
      notes: 'Steady, even breath. The asana itself is the work; the breath holds the steadiness.',
    },
    voiceCues: {
      enter: 'From standing, step the feet wide apart, about a leg-length. Turn the right foot out ninety degrees, the left foot in slightly. Extend the arms out to the sides at shoulder height.',
      hold: 'Bend the right knee toward ninety degrees, tracking it over the second toe. Press the outer edge of the back foot down. Gaze over the right fingertips. Shoulders relaxed away from the ears.',
      breathe: 'Breathe steadily. Each inhale broadens the collarbones; each exhale roots the back foot.',
      exit: 'Straighten the front leg and step the feet together. We will repeat on the other side.',
    },
    bodyParts: ['legs', 'hips', 'core', 'shoulders', 'arms'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: [
      'standing', 'strength', 'focus', 'warming', 'kapha_pacifying', 'vata_pacifying',
      'low_energy', 'build_stamina', 'leg_strength', 'morning', 'post_workout',
    ],
    contraindications: [
      "Pregnant women in the third trimester should narrow the stance and skip the deep knee bend",
      "Avoid with a recent knee or hip injury",
      "Don't practice with severe high blood pressure",
      "Skip if you have chronic shoulder injury — keep the arms by the sides instead",
    ],
    modifications: [
      "Shorten the stance if the knee won't bend over the ankle without strain",
      "Hands on hips for shoulder injury or fatigue",
      "Practice against a wall — back heel on the wall for stability feedback",
    ],
    benefits: [
      "Builds strength and stamina in the quadriceps, glutes, and calves",
      "Opens the inner thighs and groin, releasing hip tightness from sitting",
      "Improves shoulder endurance and postural awareness",
      "Cultivates focused attention — the gaze over the fingertips trains drishti",
    ],
    reasoning: "Warrior II is endurance work disguised as alignment work. For sluggish kapha mornings or unfocused vata, the demand to hold a strong shape with steady breath is the practice. We hold longer than feels comfortable on purpose.",
  },

  tree: {
    id: 'tree',
    sanskrit: 'Vrksasana',
    english: 'Tree Pose',
    icon: 'park',
    durationSeconds: 45,
    category: 'standing',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'neutral', kapha: 'neutral' },
    bodyParts: ['Legs', 'Core', 'Hips', 'Ankles'],
    benefits: ['Improves balance', 'Strengthens ankles and calves', 'Opens hips', 'Builds mental focus'],
    reasoning: 'Balance poses are medicine for Vata — they demand the focused stillness that an airy mind craves. Tree pose teaches us to find stability within movement.',
    voiceCues: {
      enter: 'Shift your weight onto your left foot. Place your right foot on your inner left thigh or calf — never on the knee. Bring your hands to heart center.',
      hold: 'Find a steady point to gaze at. Root down through your standing foot. If you feel stable, raise your arms overhead like branches.',
      breathe: 'Breathe gently. If you wobble, that is perfectly normal. Trees sway in the wind too.',
      exit: 'Lower your foot and arms. Take a breath. Now the other side.',
    },
    poseKey: 'tree',
  },

  // ── Pilot 4: Trikonasana ───────────────────────────────────────────────
  // Modern hatha — "tri" = three, "kona" = angle. Not in HYP Ch. 1.
  // Codified in 20th-century Iyengar/Krishnamacharya tradition. The
  // only truly NEW asana in the pilot 10 — exercises the schema for
  // entries with no existing legacy data to migrate from.
  trikonasana: {
    id: 'trikonasana',
    sanskrit: 'Trikonasana',
    devanagari: 'त्रिकोणासन',
    iast: 'trikoṇāsana',
    english: 'Triangle Pose',
    aliases: ['Utthita Trikonasana (Extended Triangle)'],
    source: {
      text: 'modern',
      note: 'Modern hatha asana. Codified in 20th-century Iyengar and Krishnamacharya lineages. Not enumerated in HYP Ch. 1.',
    },
    category: 'standing',
    level: 'beginner',
    poseKey: 'trikonasana',
    icon: 'change_history',
    durationSeconds: 45,
    breathPattern: 'paced',
    breathCues: {
      enter: 'inhale',
      notes: 'Inhale to lengthen the spine on entry; exhale to extend out and over the front leg. Keep the breath flowing — don\'t hold it.',
    },
    voiceCues: {
      enter: 'From standing, step the feet wide apart, about a leg-length. Turn the right foot out ninety degrees, the left foot in slightly. Extend the arms out to the sides at shoulder height.',
      hold: 'Inhale and reach the right hand long over the front leg. Exhale and tilt from the hip, lowering the right hand to the shin, ankle, or a block. The left arm extends straight up. Gaze up toward the top hand.',
      breathe: 'Each inhale broadens the chest open to the side wall; each exhale lengthens out through the crown of the head.',
      exit: 'Inhale and rise back to standing, leading with the top arm. Step the feet together. We will repeat on the other side.',
    },
    bodyParts: ['hamstrings', 'hips', 'spine', 'obliques', 'shoulders', 'core'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: [
      'standing', 'lateral', 'spine_extension', 'rotation', 'energizing',
      'kapha_pacifying', 'vata_pacifying', 'morning',
      'tight_hips', 'side_body_stretch', 'open_chest', 'posture',
      'low_energy', 'whole_body_stretch',
    ],
    contraindications: [
      "Pregnant women in late pregnancy should narrow the stance and avoid the deep side-bend",
      "Don't practice with a recent neck injury — keep the gaze straight ahead instead of up",
      "Avoid with severe high or low blood pressure",
      "Skip with diarrhea or active migraine",
      "If you have heart conditions, keep the top arm on the hip rather than overhead",
    ],
    modifications: [
      "Place the bottom hand on a block at any height — don't reach for the ankle if it forces the chest down",
      "Practice with the back heel against a wall for stability feedback",
      "Look straight ahead instead of up if the neck strains",
      "Shorten the stance if the front leg feels overworked",
    ],
    benefits: [
      "Lengthens the side body — obliques, intercostals, and quadratus lumborum",
      "Opens the hips and groin in lateral flexion (different from forward fold)",
      "Strengthens the legs while improving lateral spine mobility",
      "Combines almost every alignment principle in one pose — a teaching pose for proprioception",
    ],
    reasoning: "Trikonasana works the side body — a region modern life almost never reaches. For users with chronic shoulder and neck tension from desk work, the lateral opening here is what hours of foam-rolling can't replicate. Use a block under the bottom hand without shame; almost everyone needs one.",
  },

  // ── Seated Poses ────────────────────────────────────────────────────────
  mindfulRespiration: {
    id: 'mindfulRespiration',
    sanskrit: 'Pranayama',
    english: 'Mindful Respiration',
    icon: 'air',
    durationSeconds: 120,
    category: 'seated',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'balancing' },
    bodyParts: ['Nervous System', 'Lungs', 'Mind'],
    benefits: ['Calms anxiety quickly', 'Lowers stress response', 'Sharpens focus', 'Anchors the wandering mind'],
    reasoning: 'A two-minute reset for the nervous system. Slow, even breathing engages the vagus nerve, drops the heart rate, and pulls you out of fight-or-flight — the fastest evidence-based intervention for acute stress and anxiety.',
    voiceCues: {
      enter: 'Sit comfortably with your spine tall. Rest your hands on your knees. Soften your shoulders away from your ears.',
      hold: 'Inhale slowly through the nose for four counts. Pause. Exhale gently for six counts.',
      breathe: 'Let the exhale be longer than the inhale — that is what tells your body it is safe.',
      exit: 'Allow your breath to return to its natural rhythm. Notice how you feel now.',
    },
    poseKey: 'sukhasana',
  },

  sukhasana: {
    id: 'sukhasana',
    sanskrit: 'Sukhasana',
    english: 'Easy Seated Pose',
    icon: 'self_care',
    durationSeconds: 120,
    category: 'seated',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'neutral' },
    bodyParts: ['Hips', 'Spine', 'Knees'],
    benefits: ['Calms the mind', 'Opens hips gently', 'Improves posture', 'Prepares for meditation'],
    reasoning: 'The simplest seated position, yet profoundly effective. Sukhasana grounds the body and quiets the nervous system — the doorway to every meditation and breathwork practice.',
    voiceCues: {
      enter: 'Come to a comfortable seated position. Cross your shins. Place your hands on your knees, palms up or down.',
      hold: 'Sit tall through your spine. Relax your shoulders. Close your eyes if it feels comfortable.',
      breathe: 'Breathe naturally. Let each exhale release a little more tension from your body.',
      exit: 'Gently open your eyes. Uncross your legs.',
    },
    poseKey: 'sukhasana',
  },

  // ── Pilot 8: Ardha Matsyendrasana ──────────────────────────────────────
  // HYP 1.27 names "Matsyendrasana" — the full bind, named for the
  // sage Matsyendranath, founder of the Nath tradition and reputedly
  // hatha's first teacher. Modern teaching almost always offers the
  // half (`ardha`) variant, which is what we're shipping. Source is
  // marked `modern` because the half variant is a 20th-century
  // simplification, but the `note` records the HYP origin.
  ardhaMatsyendrasana: {
    id: 'ardhaMatsyendrasana',
    sanskrit: 'Ardha Matsyendrasana',
    devanagari: 'अर्ध मत्स्येन्द्रासन',
    iast: 'ardha matsyendrāsana',
    english: 'Half Lord of the Fishes Pose',
    aliases: ['Half Spinal Twist', 'Vakrasana (a related simpler twist)'],
    source: {
      text: 'modern',
      verse: '1.27',
      note: 'Modern half-variant of HYP 1.27 Matsyendrasana, named for the sage Matsyendranath. The full bind is intermediate-to-advanced; we ship the accessible half version.',
    },
    category: 'twist',
    level: 'beginner',
    poseKey: 'seatedTwist',
    icon: 'autorenew',
    durationSeconds: 45,
    breathPattern: 'paced',
    breathCues: {
      enter: 'inhale',
      notes: 'Inhale to lengthen the spine; exhale to deepen the rotation. Never force the twist on the breath out.',
    },
    voiceCues: {
      enter: 'Sit with both legs extended. Bend the right knee and cross the right foot over the left thigh, foot on the floor outside the left knee. The left leg can stay extended or fold the heel toward the right hip.',
      hold: 'Inhale to lengthen the spine. Exhale and rotate to the right. The right hand rests behind you for support; the left elbow hooks outside the right knee.',
      breathe: 'Each inhale grows the spine taller. Each exhale deepens the rotation a little — never force.',
      exit: 'Release the twist slowly to center, breath by breath. Switch legs and repeat on the other side.',
    },
    bodyParts: ['spine', 'obliques', 'lower_back', 'hips', 'shoulders'],
    doshaAffinity: { vata: 0, pitta: 1, kapha: 1 },
    tags: [
      // Conceptual / system
      'rotation', 'digestion', 'bloating', 'pitta_pacifying', 'kapha_pacifying', 'back_pain', 'posture',
      // Search-intent
      'stiff_back', 'desk_recovery', 'after_sitting', 'tight_lower_back', 'wring_out_spine',
    ],
    contraindications: [
      "Pregnant women shouldn't practice deep twists — try an open variation instead",
      "Avoid after recent abdominal, hip, or back surgery",
      "Don't practice with a herniated disc or SI joint instability",
      "Skip if you're in an acute IBS flare or have just eaten",
    ],
    modifications: [
      'Keep the bottom leg extended if the bind in the hip is uncomfortable',
      'Sit on a folded blanket to elevate the hips and reduce strain',
      'Place the back hand on a block instead of the floor for taller torsos',
      'For tight hips: sit on a chair and twist toward the chair back',
    ],
    benefits: [
      'Increases rotational mobility of the thoracic and lumbar spine',
      'Compresses and releases the abdominal organs — supports digestion',
      'Relieves the dull ache that builds up in the lower back from long sitting',
      'Stimulates the parasympathetic response when held for several breaths per side',
    ],
    reasoning: 'Twists are spinal hygiene — they wring stagnation out of the back and abdomen. Especially useful when digestion is sluggish or the lower back feels stuck after a long day at the desk. We ship the half variant because the full bind requires hip mobility most users simply do not have on day one.',
  },

  // ── Forward Folds ───────────────────────────────────────────────────────
  uttanasana: {
    id: 'uttanasana',
    sanskrit: 'Uttanasana',
    english: 'Standing Forward Fold',
    icon: 'south',
    durationSeconds: 60,
    category: 'standing',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'neutral' },
    bodyParts: ['Hamstrings', 'Spine', 'Calves', 'Hips'],
    benefits: ['Stretches hamstrings deeply', 'Calms the nervous system', 'Relieves stress', 'Improves digestion'],
    reasoning: 'Inversions, even gentle ones like this, reverse blood flow and calm the sympathetic nervous system. Forward folds are cooling for Pitta and grounding for Vata.',
    voiceCues: {
      enter: 'From standing, hinge at your hips and fold forward. Bend your knees as much as you need to.',
      hold: 'Let your head hang heavy. Grab opposite elbows and sway gently if it feels good. Relax your neck completely.',
      breathe: 'Breathe into the backs of your legs. Feel the stretch deepen with each exhale.',
      exit: 'Bend your knees deeply and slowly roll up to standing, one vertebra at a time. Head comes up last.',
    },
    poseKey: 'uttanasana',
  },

  // ── Pilot 7: Paschimottanasana ─────────────────────────────────────────
  // One of the few asanas explicitly named in HYP Ch. 1 (verses 1.30-31).
  // Translation: "paschima" = west = back of the body; "uttana" =
  // intense stretch. The text praises it as a means of awakening
  // pranic energy along the spine.
  paschimottanasana: {
    id: 'paschimottanasana',
    sanskrit: 'Paschimottanasana',
    devanagari: 'पश्चिमोत्तानासन',
    iast: 'paścimottānāsana',
    english: 'Seated Forward Bend',
    aliases: ['West-Stretching Pose', 'Intense Back Stretch'],
    source: {
      text: 'HYP',
      verse: '1.30-31',
      note: 'Named explicitly in HYP Ch. 1. The text describes it as awakening pranic flow along the spine.',
    },
    category: 'forward_fold',
    level: 'beginner',
    poseKey: 'forwardBend',
    icon: 'south',
    durationSeconds: 90,
    breathPattern: 'paced',
    breathCues: {
      enter: 'inhale',
      notes: 'Inhale to lengthen the spine; exhale to fold deeper. Never compress on the inhale.',
    },
    voiceCues: {
      enter: 'Sit with the legs extended in front of you. Flex the feet so the toes point up. Inhale and lift the arms overhead, lengthening the spine.',
      hold: 'Exhale and hinge forward from the hips — not the waist. Reach for the shins, ankles, or feet, wherever you can hold without rounding the lower back.',
      breathe: 'Each inhale lengthens; each exhale releases a little deeper. Let gravity do the work — never pull yourself forward.',
      exit: 'Inhale and roll up slowly, vertebra by vertebra. The head comes up last.',
    },
    bodyParts: ['hamstrings', 'lower_back', 'spine', 'shoulders'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: [
      'forward_fold', 'evening', 'pre_meditation', 'gentle', 'restorative',
      'vata_pacifying', 'pitta_pacifying', 'spine_flexion', 'hamstring_stretch',
      'anxiety', 'insomnia', 'stress_relief',
      'tight_hamstrings', 'wind_down', 'desk_recovery', 'long_day',
    ],
    contraindications: [
      "Pregnant women shouldn't fold deeply — practice with the legs apart instead",
      "Don't practice with a herniated disc or acute lower-back injury",
      "Avoid in the case of recent abdominal surgery",
      "If you have severe sciatica, skip or use a strap around the feet rather than reaching",
    ],
    modifications: [
      "Sit on a folded blanket to tilt the pelvis forward — most users need this",
      "Bend the knees as much as needed to keep the spine long",
      "Use a strap around the feet if the hands don't reach",
      "Place a bolster on the thighs to rest the chest down (restorative variant)",
    ],
    benefits: [
      "Deeply stretches the hamstrings, calves, and entire posterior chain",
      "Compresses the abdomen — supports digestion and stimulates the kidneys",
      "Activates the parasympathetic response — direct anxiety relief",
      "HYP describes it as moving prana up the central channel; modern reading: nervous-system regulation",
    ],
    reasoning: "Paschimottanasana is the canonical pose for an overstimulated nervous system — wired-but-tired vata, late-evening anxiety, the wind-down before sleep. Hold it longer than feels comfortable to let the parasympathetic shift take hold.",
  },

  // ── Restorative & Floor Poses ───────────────────────────────────────────
  balasana: {
    // ── Pilot 9: Balasana ──────────────────────────────────────────────
    // Modern restorative pose — not in HYP Ch. 1. The Sanskrit "bala"
    // means child or young one. A staple of every yoga lineage as a
    // resting pose between asanas.
    id: 'balasana',
    sanskrit: 'Balasana',
    devanagari: 'बालासन',
    iast: 'bālāsana',
    english: "Child's Pose",
    aliases: ['Resting Pose'],
    source: {
      text: 'modern',
      note: 'Modern restorative pose, not enumerated in HYP Ch. 1. Universal across hatha lineages as a resting position.',
    },
    category: 'restorative',
    level: 'beginner',
    poseKey: 'balasana',
    icon: 'spa',
    durationSeconds: 120,
    breathPattern: 'natural',
    breathCues: {
      notes: 'Slow, full breaths into the back of the body. Let the inhale expand the lower back outward.',
    },
    voiceCues: {
      enter: 'Come to your hands and knees. Bring the big toes together and let the knees spread as wide as comfortable. Sit the hips back toward the heels.',
      hold: 'Rest the forehead on the mat. Arms can extend forward or rest alongside the body, palms up. Soften the jaw, soften the eyes.',
      breathe: 'Breathe into the back of the rib cage. Each inhale expands the lower back outward; each exhale lets you sink a little deeper.',
      exit: 'Walk the hands back slowly. Roll up to seated, head coming up last.',
    },
    bodyParts: ['lower_back', 'hips', 'ankles', 'shoulders'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: [
      'restorative', 'gentle', 'evening', 'pre_meditation', 'wind_down',
      'vata_pacifying', 'pitta_pacifying', 'spine_flexion',
      'anxiety', 'stress_relief', 'lower_back_relief', 'fatigue',
      'reset', 'between_poses', 'feel_grounded', 'emotional_overwhelm',
    ],
    contraindications: [
      "Pregnant women shouldn't compress the belly — separate the knees wide and place a bolster between the thighs",
      "Don't practice with a recent knee injury or meniscus tear",
      "Avoid with severe ankle injury — the tops of the feet press into the floor",
      "If you have high blood pressure, rest the forehead on stacked fists rather than the mat",
    ],
    modifications: [
      "Place a bolster lengthwise under the torso for full-restorative version",
      "Stack a folded blanket between the calves and thighs if the heels won't reach the hips",
      "Stack the fists under the forehead if the head doesn't reach the floor",
    ],
    benefits: [
      "Activates the parasympathetic nervous system — direct stress relief",
      "Releases the lower back, opening the lumbar spine in flexion",
      "Encourages diaphragmatic breathing into the back body",
      "Functions as a transition / reset between more demanding asanas",
    ],
    reasoning: "Balasana is the surrender pose. When the body has had enough — too much intensity, too much standing, too much thinking — return here and let the floor do the work. Especially useful as a recovery between strong asanas, or as a complete practice on a low-energy day.",
  },

  supinetwist: {
    id: 'supinetwist',
    sanskrit: 'Supta Matsyendrasana',
    english: 'Supine Spinal Twist',
    icon: 'autorenew',
    durationSeconds: 60,
    category: 'supine',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'balancing' },
    bodyParts: ['Spine', 'Hips', 'Chest', 'Shoulders'],
    benefits: ['Releases spinal tension', 'Aids digestion', 'Opens the chest', 'Deeply relaxing'],
    reasoning: 'A passive twist that rinses the spine with fresh blood. Lying down removes the effort of gravity, making this accessible to everyone and deeply restorative before sleep.',
    voiceCues: {
      enter: 'Lie on your back. Hug your right knee into your chest. Extend your left leg long.',
      hold: 'Guide your right knee across your body to the left. Extend your right arm out to the side. Turn your head to the right if comfortable.',
      breathe: 'Breathe into the space between your shoulder blades. Let the weight of your leg deepen the twist naturally.',
      exit: 'Bring your knee back to center. Hug both knees in briefly. Now the other side.',
    },
    poseKey: 'supineTwist',
  },

  // ── Pilot 10: Savasana ─────────────────────────────────────────────
  // HYP Ch. 1 verse 1.32 names "Shavasana" explicitly — one of the
  // few asanas the text enumerates by name. The verse describes it
  // as a position resembling a corpse, removing fatigue and
  // pacifying the mind. We keep the HYP source citation.
  savasana: {
    id: 'savasana',
    sanskrit: 'Savasana',
    devanagari: 'शवासन',
    iast: 'śavāsana',
    english: 'Corpse Pose',
    aliases: ['Mrtasana (alternate name in some texts)'],
    source: {
      text: 'HYP',
      verse: '1.32',
      note: 'Named explicitly in HYP Ch. 1. The text describes a supine pose like a corpse, removing fatigue and quieting the mind.',
    },
    category: 'restorative',
    level: 'beginner',
    poseKey: 'savasana',
    icon: 'bedtime',
    durationSeconds: 180,
    breathPattern: 'natural',
    breathCues: {
      notes: 'No controlled breath. Observe the natural rhythm and let it slow on its own. Counting interrupts the parasympathetic shift.',
    },
    voiceCues: {
      enter: 'Lie flat on the back. Let the feet fall open naturally. Arms rest by the sides, palms facing up. Allow the eyes to close.',
      hold: 'Release all effort. The floor is holding you completely. There is nothing to fix, nothing to perform. Soften the face, soften the throat, soften the belly.',
      breathe: "Let the breath become whatever it wants to be. Don't count it, don't shape it. Just notice it.",
      exit: 'Begin to deepen the breath. Gently wiggle the fingers and toes. Roll to the right side and rest there for a breath. Press yourself up to seated, head coming up last.',
    },
    bodyParts: ['nervous_system', 'whole_body'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: [
      'restorative', 'evening', 'pre_sleep', 'wind_down', 'gentle',
      'vata_pacifying', 'pitta_pacifying',
      'anxiety', 'insomnia', 'stress_relief', 'overwhelm',
      'integration', 'final_pose', 'deep_rest', 'cant_relax', 'racing_mind',
    ],
    contraindications: [
      "Pregnant women in the third trimester should lie on the left side instead of flat on the back",
      "Don't lie flat with severe acid reflux — prop the head and chest up",
      "If you have low back pain that worsens lying flat, place a bolster under the knees",
      "Skip the long hold after eating a heavy meal",
    ],
    modifications: [
      "Place a rolled blanket under the knees to release the lower back",
      "Cover the eyes with a soft cloth or eye pillow to deepen the parasympathetic shift",
      "Use a folded blanket under the head to support the cervical curve",
      "Practice on the side with a pillow between the knees if lying flat is uncomfortable",
    ],
    benefits: [
      "Activates a deep parasympathetic state — measurable drop in heart rate and blood pressure",
      "Allows the nervous system to integrate the effects of the preceding practice",
      "Reduces cortisol and supports recovery between physically demanding asanas",
      "Provides direct insomnia relief when held for 10+ minutes before bed",
    ],
    reasoning: "Savasana is the most important pose in any practice. The work the body did during the asanas only fully lands if you stop and let the system metabolize it. For users with insomnia, anxiety, or chronic overwhelm, a long Savasana before bed is the practice — everything else is preparation.",
  },

  // ── Backbends ───────────────────────────────────────────────────────────
  // ── Pilot 5: Bhujangasana ─────────────────────────────────────────────
  // HYP doesn't list Bhujangasana under the explicit asanas of Ch. 1
  // but the pose belongs to the broader hatha tradition referenced in
  // HYP. Verse references in commentaries point to the cobra-like
  // shape as a precursor to deeper backbends. We mark `source.text:
  // 'modern'` with a note to be honest about classification.
  bhujangasana: {
    id: 'bhujangasana',
    sanskrit: 'Bhujangasana',
    devanagari: 'भुजङ्गासन',
    iast: 'bhujaṅgāsana',
    english: 'Cobra Pose',
    aliases: ['Sarpasana (Snake Pose, simpler variant)'],
    source: {
      text: 'modern',
      note: 'Belongs to the broader hatha tradition; HYP Ch. 1 does not enumerate it directly. Modern asana lineages (Krishnamacharya, Sivananda) treat it as a foundational backbend.',
    },
    category: 'backbend',
    level: 'beginner',
    poseKey: 'cobra',
    icon: 'trending_up',
    durationSeconds: 45,
    breathPattern: 'paced',
    breathCues: {
      enter: 'inhale',
      exit:  'exhale',
      notes: 'Inhale to lengthen and lift; exhale to soften the lift slightly without collapsing.',
    },
    voiceCues: {
      enter: 'Lie face down. Bring the palms under the shoulders, elbows tucked close to the ribs. Tops of the feet pressing into the floor.',
      hold: 'Inhale and peel the chest off the floor using the back muscles, not the hands. Elbows stay slightly bent. Shoulders draw away from the ears.',
      breathe: 'Breathe into the open chest. Each inhale lengthens the spine; each exhale softens the lower back.',
      exit: 'Exhale and lower the chest. Turn one cheek to the floor and rest with the arms by your sides.',
    },
    bodyParts: ['spine', 'lower_back', 'chest', 'shoulders', 'core'],
    doshaAffinity: { vata: 0, pitta: -1, kapha: 1 },
    tags: [
      // Conceptual / system
      'kapha_pacifying', 'energizing', 'morning', 'spine_extension', 'chest_opener', 'posture',
      // Search-intent
      'back_pain', 'lower_back_relief', 'wake_up', 'open_chest', 'rounded_shoulders', 'desk_worker',
    ],
    contraindications: [
      "Pregnant women shouldn't practice past the first trimester",
      "Avoid after recent abdominal, rib, or chest surgery",
      "Don't practice with a herniated disc or acute lower-back injury",
      "If you have carpal tunnel or wrist pain, do Sphinx (on the forearms) instead",
      "Skip during an active headache or migraine",
    ],
    modifications: [
      'Sphinx Pose (forearms on the mat) for wrist sensitivity',
      'Lift only as high as is comfortable — micro-cobra is a legitimate version',
      'Place a folded blanket under the pelvis to reduce lower-back compression',
    ],
    benefits: [
      'Strengthens the erector spinae and decompresses the thoracic spine',
      'Counters forward-head posture from prolonged sitting',
      'Stimulates abdominal organs, supporting digestion',
      'Energizing without being aerobic — useful when low energy is the complaint',
    ],
    reasoning: 'Backbends are heart-openers that counter the postural collapse of long sitting and the heaviness of kapha imbalance. Bhujangasana is the gentlest entry point into spinal extension, accessible to most practitioners on day one.',
  },

  // ── Pilot 6: Setu Bandha Sarvangasana ─────────────────────────────────
  // Modern hatha asana — "setu bandha" = bridge construction;
  // "sarvanga" = whole body. Not in HYP Ch. 1. Often used as the
  // accessible counter / preparation for full Sarvangasana.
  setuBandhaSarvangasana: {
    id: 'setuBandhaSarvangasana',
    sanskrit: 'Setu Bandha Sarvangasana',
    devanagari: 'सेतु बन्ध सर्वाङ्गासन',
    iast: 'setu bandha sarvāṅgāsana',
    english: 'Bridge Pose',
    aliases: ['Setu Bandhasana', 'Supported Bridge'],
    source: {
      text: 'modern',
      note: 'Modern hatha asana. Often taught as the accessible alternative or preparation for Sarvangasana (which itself is a modern derivation of the HYP Viparita Karani mudra family).',
    },
    category: 'backbend',
    level: 'beginner',
    poseKey: 'bridge',
    icon: 'trending_up',
    durationSeconds: 60,
    breathPattern: 'paced',
    breathCues: {
      enter: 'inhale',
      exit:  'exhale',
      notes: 'Inhale to lift higher; exhale to soften the throat and jaw. Keep the breath flowing — a held breath in a backbend strains the lower back.',
    },
    voiceCues: {
      enter: 'Lie on the back. Bend the knees and place the feet flat, hip-width apart, heels close to the sitting bones. Arms rest by the sides, palms down.',
      hold: 'Press through the feet and lift the hips toward the ceiling. Roll the shoulders under and interlace the fingers beneath you if it feels available. Keep the chin slightly away from the chest.',
      breathe: 'Each inhale broadens the collarbones; each exhale presses the feet a little firmer into the floor.',
      exit: 'Release the hands. Lower the spine vertebra by vertebra, from upper back to tailbone. Hug the knees in briefly.',
    },
    bodyParts: ['glutes', 'lower_back', 'spine', 'chest', 'thighs', 'hips'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: [
      'backbend', 'spine_extension', 'chest_opener', 'energizing', 'gentle',
      'kapha_pacifying', 'vata_pacifying', 'morning', 'evening',
      'back_pain', 'lower_back_relief', 'tight_hips', 'low_energy',
      'open_chest', 'after_sitting', 'desk_recovery',
    ],
    contraindications: [
      "Pregnant women shouldn't lie flat on the back past the first trimester",
      "Don't practice with a recent neck injury — never turn the head while in the pose",
      "Avoid with active herniated disc or severe lower-back pain",
      "Skip if you have severe acid reflux that worsens lying flat",
    ],
    modifications: [
      "Place a yoga block under the sacrum (supported bridge) for a fully passive restorative version",
      "Keep the arms by the sides if rolling onto the shoulders is uncomfortable",
      "Squeeze a block between the inner thighs to engage without straining",
      "Reduce the lift if the lower back feels pinched — height is not the goal",
    ],
    benefits: [
      "Strengthens the glutes, hamstrings, and posterior chain",
      "Opens the chest and front-line, counter-balancing forward-head posture",
      "Mild inversion — the heart sits above the head, supporting calm focus",
      "The supported variation (block under sacrum) is one of the most reliable evening stress-relief poses",
    ],
    reasoning: "Bridge is the most flexible pose in our catalog — it works as energizing morning practice (active, lifted) or as deeply restorative evening practice (supported on a block). Useful when you want spine-extension benefits without committing to a deeper backbend. The supported variant before bed is reliably better than a sleeping pill.",
  },

  // ── Hip Openers ─────────────────────────────────────────────────────────
  pigeon: {
    id: 'pigeon',
    sanskrit: 'Eka Pada Rajakapotasana',
    english: 'Pigeon Pose',
    icon: 'self_care',
    durationSeconds: 90,
    category: 'seated',
    level: 'Intermediate',
    doshaAffinity: { vata: 'balancing', pitta: 'neutral', kapha: 'balancing' },
    bodyParts: ['Hips', 'Glutes', 'Lower Back', 'Psoas'],
    benefits: ['Deep hip release', 'Releases stored emotions', 'Stretches the psoas', 'Relieves sciatica'],
    reasoning: 'In Ayurveda, the hips store unprocessed emotions and tension. Pigeon pose is one of the most potent hip openers, releasing deep-seated stress that Vata types accumulate.',
    voiceCues: {
      enter: 'From all fours, slide your right knee forward toward your right wrist. Extend your left leg straight back.',
      hold: 'Square your hips as much as possible. Walk your hands forward and fold over your front leg if comfortable.',
      breathe: 'Breathe into any sensation you feel. This pose can bring up emotions — let them move through you.',
      exit: 'Walk your hands back. Tuck your back toes and press back to all fours. Switch sides.',
    },
    poseKey: 'pigeon',
  },

  // ── Sun Salutation ──────────────────────────────────────────────────────
  suryaNamaskar: {
    id: 'suryaNamaskar',
    sanskrit: 'Surya Namaskar',
    english: 'Sun Salutation',
    icon: 'wb_sunny',
    durationSeconds: 300,
    category: 'standing',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'neutral', kapha: 'balancing' },
    bodyParts: ['Full Body', 'Spine', 'Core', 'Legs'],
    benefits: ['Full body warm-up', 'Builds cardiovascular stamina', 'Energizes every system', 'Links breath and movement'],
    reasoning: 'The most complete single sequence in yoga. Sun Salutations honor the sun\'s energy, building heat that awakens Kapha and channeling movement that satisfies Vata\'s need for flow.',
    voiceCues: {
      enter: 'Stand at the front of your mat with hands at heart center. Take a deep breath to begin.',
      hold: 'Flow through the sequence: inhale arms up, exhale fold forward, inhale halfway lift, exhale step or jump back to plank, lower down, inhale cobra, exhale downward dog. Hold for five breaths. Step forward, inhale halfway lift, exhale fold, inhale rise to standing.',
      breathe: 'One breath, one movement. Let the rhythm carry you. Find your own flow.',
      exit: 'Return to standing, hands at heart. Take a moment to feel the warmth you have created.',
    },
    poseKey: 'suryaNamaskar',
  },

  // ── Inversions ──────────────────────────────────────────────────────────
  // ── Pilot 2: Adho Mukha Svanasana ──────────────────────────────────────
  // Modern hatha. "Adho mukha" = facing downward; "svana" = dog. Not
  // in HYP Ch. 1 — codified in 20th-century vinyasa. Functions as
  // both an active strengthener and a resting transition.
  adhoMukhaSvanasana: {
    id: 'adhoMukhaSvanasana',
    sanskrit: 'Adho Mukha Svanasana',
    devanagari: 'अधो मुख श्वानासन',
    iast: 'adho mukha śvānāsana',
    english: 'Downward-Facing Dog',
    aliases: ['Down Dog', 'Inverted-V Pose'],
    source: {
      text: 'modern',
      note: 'Modern asana, codified in 20th-century vinyasa lineages (Krishnamacharya, Ashtanga). Not enumerated in HYP Ch. 1.',
    },
    category: 'inversion',
    level: 'beginner',
    poseKey: 'downwardDog',
    icon: 'pets',
    durationSeconds: 60,
    breathPattern: 'natural',
    breathCues: {
      notes: 'Steady ujjayi-style breath if you know it; otherwise even nasal breathing. Each exhale presses the chest gently toward the thighs.',
    },
    voiceCues: {
      enter: 'Start on hands and knees, wrists under shoulders, knees under hips. Tuck the toes. Inhale. On the exhale, lift the hips up and back, straightening the legs as much as feels okay.',
      hold: 'Press the palms firmly into the mat, fingers spread wide. Let the head hang heavy between the arms. Bend the knees if the hamstrings are tight — a long spine matters more than straight legs.',
      breathe: 'Each exhale presses the chest a little closer to the thighs. Each inhale lifts the hips a little higher.',
      exit: "Bend the knees and lower to all fours. Sit back into Child's Pose for a breath.",
    },
    bodyParts: ['shoulders', 'hamstrings', 'calves', 'arms', 'core', 'spine'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: [
      'inversion', 'energizing', 'strength', 'morning', 'transition',
      'kapha_pacifying', 'spine_extension', 'shoulder_opener', 'hamstring_stretch',
      'low_energy', 'wake_up', 'tight_hamstrings', 'shoulder_strength',
      'whole_body_stretch', 'reset', 'between_poses',
    ],
    contraindications: [
      "Pregnant women in late pregnancy should avoid the long hold — the inversion is uncomfortable",
      "Don't practice with a recent wrist, shoulder, or arm injury",
      "Avoid with severe high blood pressure or detached retina",
      "Skip during an active migraine — head below heart aggravates it",
      "Wait at least three months after carpal tunnel surgery",
    ],
    modifications: [
      "Bend the knees generously — straight legs are not the goal",
      "Practice with the hands on a chair seat for wrist sensitivity (Half Down Dog)",
      "Use a folded mat or wedge under the heels of the hands to relieve wrist pressure",
      "Alternate with Child's Pose if 60 seconds feels too long initially",
    ],
    benefits: [
      "Strengthens the shoulders, arms, and wrists while elongating the entire posterior chain",
      "Mild inversion — refreshes the brain and counters the heaviness of long sitting",
      "Functions as a transition pose, letting the breath catch up between stronger asanas",
      "Common entry-point inversion for users not yet ready for headstand or shoulderstand",
    ],
    reasoning: "Down Dog is the swiss-army-knife asana — strengthening, stretching, and a mild inversion all at once. It's why nearly every modern flow returns to it repeatedly. For the typical desk-bound user, holding it for 60 seconds restores more posture than ten one-breath visits ever will.",
  },

  legUpWall: {
    id: 'legUpWall',
    sanskrit: 'Viparita Karani',
    english: 'Legs Up the Wall',
    icon: 'straight',
    durationSeconds: 180,
    category: 'inversion',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'neutral' },
    bodyParts: ['Legs', 'Lower Back', 'Nervous System'],
    benefits: ['Reduces leg swelling', 'Deeply calming', 'Relieves lower back pain', 'Aids sleep'],
    reasoning: 'An effortless inversion that reverses the effects of gravity on the body. In Ayurveda, this is one of the most prescribed poses for Vata imbalance and insomnia.',
    voiceCues: {
      enter: 'Sit with your right hip against a wall. Swing your legs up the wall as you lie back. Scoot your hips as close to the wall as comfortable.',
      hold: 'Rest your arms out to the sides or on your belly. Close your eyes. Let the wall do all the work.',
      breathe: 'Breathe softly. Feel the blood flowing from your feet back toward your heart. Complete surrender.',
      exit: 'Bend your knees, roll to one side, and slowly sit up.',
    },
    poseKey: 'legsUpWall',
  },
}

// ─── Routine Templates ──────────────────────────────────────────────────────

const ROUTINE_TEMPLATES = {
  stress: {
    label: 'Stress Relief',
    description: 'A calming sequence to soothe your nervous system and release tension.',
    icon: 'psychiatry',
    gradient: 'from-[#7b93a8] to-[#b8d4e8]',
    asanas: [
      { id: 'sukhasana', time: '07:00', customDuration: 120 },
      { id: 'balasana', time: '07:03', customDuration: 120 },
      { id: 'uttanasana', time: '07:06', customDuration: 60 },
      { id: 'pigeon', time: '07:08', customDuration: 90 },
      { id: 'supinetwist', time: '07:10', customDuration: 60 },
      { id: 'legUpWall', time: '07:12', customDuration: 180 },
      { id: 'savasana', time: '07:16', customDuration: 180 },
    ],
  },
  sleep: {
    label: 'Sleep Preparation',
    description: 'A gentle evening practice to calm the mind and prepare for deep rest.',
    icon: 'bedtime',
    gradient: 'from-[#5c6b8a] to-[#9bafd4]',
    asanas: [
      { id: 'sukhasana', time: '21:00', customDuration: 120 },
      { id: 'paschimottanasana', time: '21:03', customDuration: 90 },
      { id: 'supinetwist', time: '21:05', customDuration: 60 },
      { id: 'legUpWall', time: '21:07', customDuration: 180 },
      { id: 'balasana', time: '21:11', customDuration: 120 },
      { id: 'savasana', time: '21:14', customDuration: 300 },
    ],
  },
  energy: {
    label: 'Energy Boost',
    description: 'An invigorating flow to awaken your body and sharpen your focus.',
    icon: 'bolt',
    gradient: 'from-[#c47a3a] to-[#f0c987]',
    asanas: [
      { id: 'tadasana', time: '06:30', customDuration: 60 },
      { id: 'suryaNamaskar', time: '06:32', customDuration: 300 },
      { id: 'warrior1', time: '06:38', customDuration: 45 },
      { id: 'warrior2', time: '06:40', customDuration: 45 },
      { id: 'bhujangasana', time: '06:42', customDuration: 45 },
      { id: 'downwardDog', time: '06:44', customDuration: 60 },
      { id: 'tree', time: '06:46', customDuration: 45 },
      { id: 'savasana', time: '06:48', customDuration: 120 },
    ],
  },
  flexibility: {
    label: 'Flexibility & Mobility',
    description: 'Targeted stretches to release tightness and restore your range of motion.',
    icon: 'self_care',
    gradient: 'from-[#6b8f5e] to-[#b8d4a8]',
    asanas: [
      { id: 'suryaNamaskar', time: '07:00', customDuration: 300 },
      { id: 'downwardDog', time: '07:06', customDuration: 60 },
      { id: 'uttanasana', time: '07:08', customDuration: 60 },
      { id: 'pigeon', time: '07:10', customDuration: 90 },
      { id: 'ardhaMatsyendrasana', time: '07:12', customDuration: 45 },
      { id: 'paschimottanasana', time: '07:14', customDuration: 90 },
      { id: 'bridge', time: '07:16', customDuration: 60 },
      { id: 'supinetwist', time: '07:18', customDuration: 60 },
      { id: 'savasana', time: '07:20', customDuration: 180 },
    ],
  },
}

// ─── Routine Builder ────────────────────────────────────────────────────────

export function getRoutine(routineKey) {
  const template = ROUTINE_TEMPLATES[routineKey] || ROUTINE_TEMPLATES.stress
  return {
    ...template,
    key: routineKey,
    asanas: template.asanas.map(a => ({
      ...ASANAS[a.id],
      scheduledTime: a.time,
      durationSeconds: a.customDuration || ASANAS[a.id].durationSeconds,
    })),
    totalDuration: template.asanas.reduce(
      (sum, a) => sum + (a.customDuration || ASANAS[a.id].durationSeconds), 0
    ),
  }
}

export function getRoutineKeys() {
  return Object.keys(ROUTINE_TEMPLATES)
}

export function getDoshaTag(affinity) {
  // Bridge between the new schema (numeric +1/0/-1 in `doshaAffinity`)
  // and the legacy schema ('balancing' | 'neutral' | 'aggravating'
  // strings). New entries pass numbers; UI helpers normalize here.
  if (typeof affinity === 'number') {
    if (affinity > 0)  return { label: 'Balancing', color: 'bg-green-100 text-green-700' }
    if (affinity < 0)  return { label: 'Caution',   color: 'bg-red-100 text-red-700' }
    return { label: 'Neutral', color: 'bg-gray-100 text-gray-500' }
  }
  if (affinity === 'balancing')   return { label: 'Balancing', color: 'bg-green-100 text-green-700' }
  if (affinity === 'aggravating') return { label: 'Caution',   color: 'bg-red-100 text-red-700' }
  return { label: 'Neutral', color: 'bg-gray-100 text-gray-500' }
}

// ─── Backward-compat alias map ──────────────────────────────────────────
// Old English IDs in the database (recommendations_log, content_events,
// practice_sessions) resolve to the new Sanskrit camelCase IDs through
// this table. Use `resolveAsanaId(legacyId)` from consumer code.
// Entries are removed once all references are updated.
export const ASANA_ALIASES = {
  cobra:        'bhujangasana',
  seatedTwist:  'ardhaMatsyendrasana',
  // Pending migration in batch 2 (see docs/content-buildout.md §8.5):
  // bridge:       'setuBandhaSarvangasana',
  // downwardDog:  'adhoMukhaSvanasana',
  // tree:         'vrksasana',
  // pigeon:       'ekaPadaRajakapotasana',
  // legUpWall:    'legsUpTheWall',
  // supinetwist:  'suptaMatsyendrasana',
  // warrior1:     'virabhadrasanaI',
  // warrior2:     'virabhadrasanaII',
}

export function resolveAsanaId(id) {
  return ASANA_ALIASES[id] || id
}

export function getAsana(id) {
  return ASANAS[resolveAsanaId(id)]
}
