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

  // ── Virabhadrasana I ───────────────────────────────────────────────────
  // Modern asana, named for the warrior incarnation Virabhadra born
  // from Shiva's wrath. Not in HYP Ch. 1 — codified in 20th-century
  // Krishnamacharya lineage. Distinct from Warrior II in that the hips
  // square forward over the front leg.
  virabhadrasanaI: {
    id: 'virabhadrasanaI',
    sanskrit: 'Virabhadrasana I',
    devanagari: 'वीरभद्रासन I',
    iast: 'vīrabhadrāsana I',
    english: 'Warrior I',
    aliases: ['Warrior 1', 'Hero Pose I'],
    source: { text: 'modern', note: 'Modern hatha asana, codified in 20th-century lineages. Not in HYP Ch. 1.' },
    category: 'standing',
    level: 'beginner',
    poseKey: 'warrior1',
    icon: 'shield',
    durationSeconds: 45,
    breathPattern: 'paced',
    breathCues: { enter: 'inhale', notes: 'Inhale to lift into the pose; exhale to settle the hips deeper. Keep the breath flowing.' },
    voiceCues: {
      enter: 'Step the right foot forward about a leg-length, knee bent. Turn the back foot out forty-five degrees, heel down. Square the hips toward the front. Inhale and reach the arms overhead.',
      hold: 'Bend the front knee over the ankle, thigh moving toward parallel with the floor. Press the back foot firmly down. Lift through the side ribs and reach the fingertips up.',
      breathe: 'Each inhale lengthens the spine; each exhale grounds the back foot. Soften the shoulders away from the ears.',
      exit: 'Lower the arms. Step the front foot back to meet the back foot. We will repeat on the other side.',
    },
    bodyParts: ['legs', 'hips', 'core', 'shoulders', 'spine'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: [
      'standing', 'strength', 'energizing', 'warming', 'morning',
      'kapha_pacifying', 'vata_pacifying', 'spine_extension', 'chest_opener',
      'low_energy', 'leg_strength', 'build_stamina', 'open_chest',
      'feel_strong', 'all_levels',
    ],
    contraindications: [
      "Pregnant women in late pregnancy should narrow the stance and skip the deep knee bend",
      "Don't practice with a recent knee injury or meniscus tear",
      "Avoid with severe high blood pressure",
      "Skip if you have shoulder injury — keep hands on hips instead of overhead",
    ],
    modifications: [
      "Shorten the stance if the front knee won't bend over the ankle",
      "Hands on hips for shoulder injury, fatigue, or neck issues",
      "Practice with the back heel against a wall for stability",
      "Reduce the back-foot turnout to thirty degrees if the hips are tight",
    ],
    benefits: [
      "Builds strength through the quadriceps, glutes, and calves of the front leg",
      "Opens the front of the back leg's hip and groin",
      "Lengthens the side body and ribs as the arms reach overhead",
      "Grounds and energizes simultaneously — useful for low-motivation mornings",
    ],
    reasoning: "Warrior I is the heating pose of the standing series — full-body strength while also lengthening through the front body. The combination of stability through the legs and lift through the arms is what builds postural endurance over time.",
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

  // ── Vrksasana ──────────────────────────────────────────────────────────
  // Modern hatha balance pose. Not in HYP Ch. 1. The Sanskrit "vṛkṣa"
  // means tree — the pose mimics a tree rooted to the earth with
  // branches reaching skyward.
  vrksasana: {
    id: 'vrksasana',
    sanskrit: 'Vrksasana',
    devanagari: 'वृक्षासन',
    iast: 'vṛkṣāsana',
    english: 'Tree Pose',
    aliases: ['Tree Stand'],
    source: { text: 'modern', note: 'Modern hatha balance pose. Not enumerated in HYP Ch. 1.' },
    category: 'standing',
    level: 'beginner',
    poseKey: 'tree',
    icon: 'park',
    durationSeconds: 45,
    breathPattern: 'natural',
    breathCues: { notes: 'Steady, even nasal breath. The breath is the anchor — when balance wavers, return to the rhythm.' },
    voiceCues: {
      enter: 'Shift the weight onto the left foot. Lift the right foot and place the sole against the inner left thigh or calf — never on the knee. Hands at the heart in prayer.',
      hold: 'Pick a single still point at eye level and let the gaze rest there. Press the standing foot firmly into the floor. If steady, extend the arms overhead like branches.',
      breathe: 'Breathe slowly. If you wobble, that\'s the pose working — trees sway too. Soften the standing knee if it hyperextends.',
      exit: 'Lower the arms and the foot. Pause for a breath, then switch sides.',
    },
    bodyParts: ['legs', 'ankles', 'core', 'hips', 'feet'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 0 },
    tags: [
      'standing', 'balance', 'focus', 'grounding', 'gentle',
      'vata_pacifying', 'morning', 'pre_meditation',
      'concentration', 'mental_focus', 'cant_concentrate', 'restless_mind',
      'ankle_strength', 'beginner_friendly',
    ],
    contraindications: [
      "Pregnant women in late pregnancy should practice with the back to a wall for stability",
      "Don't practice with severe vertigo or balance disorders without a wall behind you",
      "Avoid placing the lifted foot on the knee — always above or below it",
      "Skip if you have severe ankle injury in the standing leg",
    ],
    modifications: [
      "Place the lifted foot on the ankle (toes still touching the floor) for the easiest variant",
      "Keep the toes lightly grounded as a kickstand if balance is unstable",
      "Practice with one hand on a wall or chair back",
      "Hands at the heart instead of overhead reduces the balance demand",
    ],
    benefits: [
      "Trains single-leg stability — translates directly to walking, stairs, and fall prevention",
      "Strengthens the small stabilizing muscles of the ankle and arch",
      "Concentrative practice — the gaze and the breath become a single anchor",
      "A reliable mental-focus reset for racing-mind days",
    ],
    reasoning: "Balance work is medicine for the scattered mind. Tree pose forces a single-pointed gaze and a slow breath — the same combination meditation cultivates, but easier to access for users who can't sit still yet.",
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

  // ── Utkatasana ─────────────────────────────────────────────────────────
  utkatasana: {
    id: 'utkatasana',
    sanskrit: 'Utkatasana',
    devanagari: 'उत्कटासन',
    iast: 'utkaṭāsana',
    english: 'Chair Pose',
    aliases: ['Fierce Pose', 'Powerful Pose'],
    source: { text: 'modern', note: 'Modern hatha asana. "Utkata" = fierce, powerful. Not in HYP Ch. 1.' },
    category: 'standing',
    level: 'beginner',
    poseKey: 'utkatasana',
    icon: 'chair',
    durationSeconds: 30,
    breathPattern: 'paced',
    breathCues: { enter: 'inhale', notes: "Inhale to lift the arms; exhale to sink the hips deeper. Don't hold the breath under load." },
    voiceCues: {
      enter: 'Stand with the feet together or hip-width apart. Inhale and reach the arms overhead, biceps near the ears.',
      hold: 'Exhale and bend the knees as if sitting back into a chair. Press the weight into the heels — you should be able to wiggle the toes. Lift through the side ribs.',
      breathe: "Each inhale lengthens the spine; each exhale grounds the heels. The thighs work hard — that's the pose.",
      exit: 'Inhale to straighten the legs. Lower the arms and shake out the legs.',
    },
    bodyParts: ['quadriceps', 'glutes', 'core', 'shoulders', 'spine'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: ['standing', 'strength', 'energizing', 'warming', 'morning', 'kapha_pacifying', 'leg_strength', 'core_strength', 'low_energy', 'wake_up', 'build_stamina', 'feel_strong'],
    contraindications: [
      "Don't practice with severe knee injury or recent meniscus tear",
      "Pregnant women in late pregnancy should reduce the depth of the squat",
      "Avoid with chronic shoulder injury — keep hands on hips instead of overhead",
      "Skip with severe low blood pressure or recent ankle injury",
    ],
    modifications: [
      "Hands on hips or in prayer at the heart for shoulder issues",
      "Sit on the front edge of a chair if standing balance is unstable",
      "Reduce the squat depth — knees half-bent counts",
      "Place a block between the inner thighs to engage the legs evenly",
    ],
    benefits: [
      "Builds isometric strength through the quadriceps and glutes",
      "Engages the core deeply to keep the spine upright under load",
      "Counters the postural collapse of long sitting",
      "Heat-building — useful for cold mornings or sluggish kapha-heavy days",
    ],
    reasoning: "Chair Pose is deceptively hard — 30 seconds feels like a minute, and that's exactly the point. Used as the strength bookend in vinyasa flows. For users who feel under-built, this is the pose that returns their body to them.",
  },

  // ── Virabhadrasana III ─────────────────────────────────────────────────
  virabhadrasanaIII: {
    id: 'virabhadrasanaIII',
    sanskrit: 'Virabhadrasana III',
    devanagari: 'वीरभद्रासन III',
    iast: 'vīrabhadrāsana III',
    english: 'Warrior III',
    aliases: ['Warrior 3', 'Airplane Pose'],
    source: { text: 'modern', note: 'Modern hatha. The full balance variant of the Virabhadra trilogy. Not in HYP Ch. 1.' },
    category: 'standing',
    level: 'intermediate',
    poseKey: 'warrior3',
    icon: 'flight',
    durationSeconds: 30,
    breathPattern: 'natural',
    breathCues: { notes: 'Steady breath through the nose. The pose is enough work — the breath stays smooth.' },
    voiceCues: {
      enter: 'From standing, shift the weight onto the right foot. Hinge forward from the hip and extend the left leg behind you, parallel to the floor. Reach the arms forward like an airplane.',
      hold: "Form one long line from fingertips through the back heel. Hips stay level — don't let the lifted hip rotate up. Gaze a foot in front of the standing toe.",
      breathe: 'Each breath steadies the line. The smaller the breath, the easier the balance.',
      exit: 'Step the back foot forward to meet the standing foot. Pause for a breath. We will repeat on the other side.',
    },
    bodyParts: ['legs', 'core', 'glutes', 'shoulders', 'back'],
    doshaAffinity: { vata: 0, pitta: 0, kapha: 1 },
    tags: ['standing', 'balance', 'strength', 'focus', 'kapha_pacifying', 'concentration', 'core_strength', 'glute_strength', 'feel_strong', 'mental_focus', 'intermediate'],
    contraindications: [
      "Pregnant women shouldn't practice from the second trimester onward",
      "Don't practice with severe high blood pressure",
      "Avoid with recent knee, hip, or ankle injury in the standing leg",
      "Skip if you have severe lower-back pain",
    ],
    modifications: [
      "Practice with the fingertips on a wall in front of you for balance support",
      "Hands at the heart instead of overhead",
      "Lower the back leg toward the floor — height is not the goal",
      "Use a chair behind for the lifted leg to rest on",
    ],
    benefits: [
      "Strengthens the back of the standing leg, glutes, and core",
      "Trains hip-level proprioception (level pelvis under single-leg load)",
      "Single-pointed concentration — great for users with attention drift",
      "Builds the postural endurance for longer holds and inversions",
    ],
    reasoning: "Warrior III is the integration pose of the Virabhadra trilogy — balance, strength, and concentration in one shape. Don't worry if the back leg won't lift to parallel; the practice is the steady horizontal line, not the height.",
  },

  // ── Parsvakonasana ─────────────────────────────────────────────────────
  parsvakonasana: {
    id: 'parsvakonasana',
    sanskrit: 'Parsvakonasana',
    devanagari: 'पार्श्वकोणासन',
    iast: 'pārśvakoṇāsana',
    english: 'Side Angle Pose',
    aliases: ['Extended Side Angle', 'Utthita Parsvakonasana'],
    source: { text: 'modern', note: 'Modern hatha. "Parsva" = side, "kona" = angle. Not in HYP Ch. 1.' },
    category: 'standing',
    level: 'beginner',
    poseKey: 'parsvakonasana',
    icon: 'change_history',
    durationSeconds: 45,
    breathPattern: 'paced',
    breathCues: { enter: 'inhale', notes: 'Inhale to lengthen out through the top arm; exhale to settle deeper into the front leg.' },
    voiceCues: {
      enter: 'From a wide stance, turn the right foot out ninety degrees. Bend the right knee toward ninety degrees. Lower the right forearm onto the right thigh, or the right hand to a block outside the right foot.',
      hold: 'Reach the left arm overhead in line with the spine, palm facing the floor. Open the chest toward the ceiling. Gaze up under the top arm if the neck allows.',
      breathe: 'Each inhale broadens the underside ribs; each exhale roots the back foot.',
      exit: 'Press through both feet to return to standing. We will repeat on the other side.',
    },
    bodyParts: ['legs', 'hips', 'obliques', 'spine', 'shoulders'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: ['standing', 'lateral', 'strength', 'kapha_pacifying', 'leg_strength', 'side_body_stretch', 'open_chest', 'tight_hips', 'whole_body_stretch'],
    contraindications: [
      "Pregnant women in late pregnancy should narrow the stance and use a block",
      "Don't practice with severe knee injury in the front leg",
      "Avoid with neck injury — keep gaze straight ahead",
      "Skip with insomnia (this pose is energizing — not a pre-bed choice)",
    ],
    modifications: [
      "Forearm on the front thigh instead of the hand to the floor",
      "Block under the bottom hand at any height",
      "Top arm on the hip if the shoulder fatigues",
      "Shorten the stance if the front knee won't track over the ankle",
    ],
    benefits: [
      "Lengthens the entire side body from outer foot to fingertips",
      "Strengthens the front leg through the long hold",
      "Opens the chest in lateral flexion — distinct stretch from forward folds",
      "Combines stamina, strength, and lateral mobility in one shape",
    ],
    reasoning: "Side Angle is where users learn what a 'long side body' actually feels like. The geometry forces the underside ribs to elongate — almost no other pose achieves the same lateral stretch with a strong base.",
  },

  // ── Parsvottanasana ────────────────────────────────────────────────────
  parsvottanasana: {
    id: 'parsvottanasana',
    sanskrit: 'Parsvottanasana',
    devanagari: 'पार्श्वोत्तानासन',
    iast: 'pārśvottānāsana',
    english: 'Pyramid Pose',
    aliases: ['Intense Side Stretch'],
    source: { text: 'modern', note: 'Modern hatha. "Parsva" = side, "ut-tāna" = intense stretch. Not in HYP Ch. 1.' },
    category: 'standing',
    level: 'beginner',
    poseKey: 'parsvottanasana',
    icon: 'change_history',
    durationSeconds: 45,
    breathPattern: 'paced',
    breathCues: { enter: 'inhale', notes: 'Inhale to lengthen the spine; exhale to fold over the front leg with a long spine, not a rounded one.' },
    voiceCues: {
      enter: 'Step the right foot forward about three feet. Square the hips toward the front. Hands on the hips or in reverse prayer behind the back.',
      hold: 'Inhale to lengthen the spine. Exhale and hinge forward from the hips, keeping the front leg straight. Lead with the chest, not the head.',
      breathe: "Each inhale lengthens; each exhale folds a touch deeper. The front leg engages — don't hyperextend the knee.",
      exit: 'Inhale and rise back to standing. We will repeat on the other side.',
    },
    bodyParts: ['hamstrings', 'hips', 'spine', 'shoulders', 'calves'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: ['standing', 'forward_fold', 'gentle', 'spine_flexion', 'hamstring_stretch', 'tight_hamstrings', 'pitta_pacifying', 'evening', 'wind_down'],
    contraindications: [
      "Pregnant women shouldn't fold deeply — keep a long spine and shallow hinge",
      "Don't practice with herniated disc or severe lower-back injury",
      "Avoid with very tight hamstrings that pull the lower back into rounding",
      "Skip with severe high blood pressure",
    ],
    modifications: [
      "Place blocks under the hands beside the front foot",
      "Bend the front knee generously to keep the spine long",
      "Hands on the hips throughout — skip the reverse prayer",
      "Practice with the back heel against a wall for stability",
    ],
    benefits: [
      "Deep stretch of the front leg's hamstring",
      "Opens the back leg's hip flexor and inner thigh",
      "If using reverse prayer: opens the wrists, forearms, and shoulders",
      "Tighter focus than a standing forward fold — easier to track misalignment",
    ],
    reasoning: "Pyramid is the standing forward fold with asymmetry — it isolates one leg's posterior chain at a time, which is more effective for users with one tighter side. Use blocks unconditionally; floor-reaching is not the practice.",
  },

  // ── Prasarita Padottanasana ────────────────────────────────────────────
  prasaritaPadottanasana: {
    id: 'prasaritaPadottanasana',
    sanskrit: 'Prasarita Padottanasana',
    devanagari: 'प्रसारित पादोत्तानासन',
    iast: 'prasārita pādottānāsana',
    english: 'Wide-Legged Forward Fold',
    aliases: ['Wide-Legged Standing Forward Bend'],
    source: { text: 'modern', note: 'Modern hatha. "Prasarita" = spread out, "pāda" = foot. Not in HYP Ch. 1.' },
    category: 'standing',
    level: 'beginner',
    poseKey: 'prasaritaPadottanasana',
    icon: 'open_in_full',
    durationSeconds: 60,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow even breath. Each exhale releases the head a little closer to the floor.' },
    voiceCues: {
      enter: 'Step the feet wide apart, about a leg-length, both feet parallel and pointing forward. Hands on the hips. Inhale and lengthen the spine.',
      hold: 'Exhale and hinge forward from the hips. Bring the hands to the floor between the feet, fingers in line with the toes. Let the crown of the head reach toward the floor.',
      breathe: 'Each exhale releases the head a little lower. The legs stay strong — engage the thighs to protect the lower back.',
      exit: 'Hands to the hips. Inhale and rise back to standing with a flat back. Step the feet together.',
    },
    bodyParts: ['hamstrings', 'hips', 'inner_thighs', 'spine', 'lower_back'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: ['standing', 'forward_fold', 'inversion', 'gentle', 'evening', 'vata_pacifying', 'pitta_pacifying', 'spine_flexion', 'hamstring_stretch', 'inner_thigh_stretch', 'tight_hamstrings', 'tight_hips', 'stress_relief', 'wind_down'],
    contraindications: [
      "Pregnant women shouldn't fold deeply — practice with the hands on a chair seat instead",
      "Don't practice with herniated disc or severe lower-back injury",
      "Skip with severe high blood pressure or recent eye surgery",
      "Avoid if you experience dizziness when the head is below the heart",
    ],
    modifications: [
      "Hands on yoga blocks if the floor is far",
      "Bend the knees as needed to keep the spine long",
      "Use a chair seat under the chest as a fully supported version",
      "Walk the hands forward (not down) for an easier variation that emphasizes spinal length",
    ],
    benefits: [
      "Releases the inner thighs and adductors — different stretch from feet-together folds",
      "Mild inversion calms the nervous system",
      "Decompresses the spine through gravity",
      "Stable wide base — less balance demand than other folds, accessible to most",
    ],
    reasoning: "The wide-legged variation is more accessible than Uttanasana for tight hamstrings — the wider base reduces the demand on each leg. Useful in stress-relief sequences as a calming pose with strength still in the legs.",
  },

  // ── Anjaneyasana ───────────────────────────────────────────────────────
  anjaneyasana: {
    id: 'anjaneyasana',
    sanskrit: 'Anjaneyasana',
    devanagari: 'अञ्जनेयासन',
    iast: 'añjaneyāsana',
    english: 'Low Lunge',
    aliases: ['Crescent Lunge (similar)'],
    source: { text: 'modern', note: 'Modern hatha, named for Anjaneya (a name of Hanuman). Not in HYP Ch. 1.' },
    category: 'standing',
    level: 'beginner',
    poseKey: 'anjaneyasana',
    icon: 'directions_run',
    durationSeconds: 45,
    breathPattern: 'paced',
    breathCues: { enter: 'inhale', notes: 'Inhale to lift the chest and arms; exhale to settle the hips lower.' },
    voiceCues: {
      enter: 'From all fours, step the right foot forward between the hands. Lower the back knee to the floor and untuck the toes.',
      hold: 'Inhale and sweep the arms overhead, fingertips reaching for the ceiling. Square the hips forward and let them sink toward the floor.',
      breathe: 'Each inhale lifts through the chest and arms; each exhale grounds the back knee.',
      exit: 'Lower the hands to the floor and step back to all fours. We will repeat on the other side.',
    },
    bodyParts: ['hip_flexors', 'quadriceps', 'shoulders', 'spine', 'core'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: ['standing', 'hip_opener', 'spine_extension', 'energizing', 'kapha_pacifying', 'morning', 'desk_recovery', 'tight_hips', 'tight_hip_flexors', 'open_chest', 'after_sitting', 'low_energy', 'feel_open'],
    contraindications: [
      "Pregnant women in late pregnancy should keep hands on hips and reduce the lunge depth",
      "Don't practice with knee pain — pad the back knee with a folded blanket",
      "Skip with very high blood pressure",
      "Avoid with recent shoulder surgery — keep hands on hips",
    ],
    modifications: [
      "Place a folded blanket under the back knee for cushioning",
      "Hands on the front thigh instead of overhead for shoulder issues",
      "Reduce the depth of the lunge if the front knee strains",
      "Use blocks under the hands for a deeper hip stretch with arm support",
    ],
    benefits: [
      "Stretches the hip flexors — the chronic culprit behind desk-related lower-back pain",
      "Opens the front of the back leg's quadriceps",
      "Lengthens through the spine and chest",
      "Energizing without being aggressive — a great morning pose",
    ],
    reasoning: "If you sit at a desk, your hip flexors are short. Anjaneyasana is the most direct intervention. The 45-second hold per side is when the fascial release actually starts to land.",
  },

  // ── Utthita Hasta Padangusthasana ──────────────────────────────────────
  utthitaHastaPadangusthasana: {
    id: 'utthitaHastaPadangusthasana',
    sanskrit: 'Utthita Hasta Padangusthasana',
    devanagari: 'उत्थित हस्त पादाङ्गुष्ठासन',
    iast: 'utthita hasta pādāṅguṣṭhāsana',
    english: 'Hand-to-Big-Toe Pose',
    aliases: ['Standing Hand-to-Big-Toe'],
    source: { text: 'modern', note: 'Modern hatha. "Utthita" = extended, "hasta" = hand, "pāda-aṅguṣṭha" = big toe. Not in HYP Ch. 1.' },
    category: 'standing',
    level: 'intermediate',
    poseKey: 'utthitaHastaPadangusthasana',
    icon: 'accessibility',
    durationSeconds: 30,
    breathPattern: 'natural',
    breathCues: { notes: 'Smooth, even breath. Balance + flexibility means tiny disruptions matter — keep the breath flowing.' },
    voiceCues: {
      enter: 'From standing, shift the weight onto the left foot. Lift the right knee to hip height. Hook the right big toe with the right index and middle fingers (or use a strap around the foot).',
      hold: 'Slowly extend the right leg straight forward. Lengthen the spine. Keep the left standing leg active, kneecap lifted.',
      breathe: "Each breath stabilizes the standing foot. Don't worry if the lifted leg won't straighten — height isn't the goal.",
      exit: 'Bend the right knee back in. Lower the foot. Pause. Switch sides.',
    },
    bodyParts: ['hamstrings', 'hips', 'core', 'standing_leg', 'feet'],
    doshaAffinity: { vata: 0, pitta: 0, kapha: 1 },
    tags: ['standing', 'balance', 'hamstring_stretch', 'core_strength', 'kapha_pacifying', 'concentration', 'tight_hamstrings', 'mental_focus', 'intermediate'],
    contraindications: [
      "Don't practice with severe lower-back injury",
      "Skip with hamstring tear or severe sciatica",
      "Avoid with balance disorders without a wall behind you",
      "Pregnant women should use a wall and keep the lifted leg low",
    ],
    modifications: [
      "Use a yoga strap around the lifted foot if the hand can't reach the toe",
      "Keep the lifted knee bent — height isn't the goal, length is",
      "Practice with the back to a wall for balance support",
      "Easier variant: place the lifted foot on a chair seat in front of you",
    ],
    benefits: [
      "Combines balance + flexibility + core strength in a single demanding shape",
      "Deep hamstring stretch with active engagement (better than passive folds for tight users)",
      "Trains the standing leg's full proprioceptive system",
      "Develops the focused gaze needed for inversions and arm balances",
    ],
    reasoning: "This pose teaches that flexibility without strength is performance, and strength without flexibility is rigidity — you need both. Use the strap, don't fight for the toe; the strap doesn't make this an easier pose, it just makes the right one possible.",
  },

  // ── Garudasana ─────────────────────────────────────────────────────────
  garudasana: {
    id: 'garudasana',
    sanskrit: 'Garudasana',
    devanagari: 'गरुडासन',
    iast: 'garuḍāsana',
    english: 'Eagle Pose',
    aliases: ['Eagle'],
    source: { text: 'modern', note: 'Modern hatha, named for Garuda, the divine eagle of Vishnu. Not in HYP Ch. 1.' },
    category: 'standing',
    level: 'intermediate',
    poseKey: 'garudasana',
    icon: 'flutter_dash',
    durationSeconds: 30,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow, even breath. The wrap is intense — the breath keeps the shoulders soft.' },
    voiceCues: {
      enter: 'Stand on the left foot with a slight knee bend. Cross the right thigh over the left. If accessible, hook the right foot behind the left calf.',
      hold: 'Extend the arms forward. Cross the left elbow over the right at right angles. Wrap the forearms and bring the palms to touch (or backs of hands). Lift the elbows to shoulder height.',
      breathe: 'Each breath spreads through the upper back. The shape is a hug for the body — let it feel that way.',
      exit: 'Unwind the arms. Uncross the leg. Stand on both feet for a breath. Switch sides.',
    },
    bodyParts: ['shoulders', 'upper_back', 'hips', 'standing_leg', 'core'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: ['standing', 'balance', 'shoulder_opener', 'concentration', 'vata_pacifying', 'kapha_pacifying', 'focus', 'shoulder_tightness', 'upper_back_relief', 'desk_recovery', 'mental_focus', 'tight_shoulders', 'intermediate'],
    contraindications: [
      "Don't practice with knee, hip, or shoulder injury",
      "Pregnant women should skip the leg wrap entirely",
      "Avoid with frozen shoulder or rotator cuff injury",
      "Skip with severe balance disorders",
    ],
    modifications: [
      "Cross the legs without hooking the foot behind the calf (kickstand variant)",
      "Hands at the heart in prayer instead of the full arm wrap",
      "Hold the opposite shoulders if the arm wrap doesn't reach",
      "Practice next to a wall for balance support",
    ],
    benefits: [
      "Releases the rhomboids and upper trapezius — exactly the area desk work over-tightens",
      "Builds single-leg stability with an asymmetric load",
      "Concentration practice — the wrap demands a still gaze and slow breath",
      "Generates compression that, on release, brings a noticeable wash of warmth",
    ],
    reasoning: "Eagle is the most efficient upper-back release in the standing series. The arm wrap targets exactly where keyboard work tightens. Use the modifications without shame — hands-at-heart is a legitimate pose; you still get most of the benefit through the legs.",
  },

  // ── Natarajasana ───────────────────────────────────────────────────────
  natarajasana: {
    id: 'natarajasana',
    sanskrit: 'Natarajasana',
    devanagari: 'नटराजासन',
    iast: 'naṭarājāsana',
    english: "Dancer's Pose",
    aliases: ['Lord of the Dance', 'Standing Bow'],
    source: { text: 'modern', note: 'Modern hatha, named for Nataraja (Shiva as cosmic dancer). Not in HYP Ch. 1.' },
    category: 'standing',
    level: 'intermediate',
    poseKey: 'natarajasana',
    icon: 'theater_comedy',
    durationSeconds: 30,
    breathPattern: 'natural',
    breathCues: { notes: 'Soft, steady breath. Backbend + balance is intense — the breath is the throttle.' },
    voiceCues: {
      enter: 'Stand on the left foot. Bend the right knee and grasp the right ankle (or a strap looped around the foot) with the right hand from the inside. Reach the left arm forward as a counterbalance.',
      hold: 'Press the right foot back into the right hand, lifting the leg up and back. The chest opens forward. Keep the standing knee soft.',
      breathe: 'Each breath finds the suspended balance. The lift comes from the foot pressing back into the hand, not the hand pulling.',
      exit: 'Release the foot to the floor slowly. Stand on both feet. Switch sides.',
    },
    bodyParts: ['standing_leg', 'core', 'hip_flexors', 'spine', 'shoulders', 'chest'],
    doshaAffinity: { vata: 0, pitta: -1, kapha: 1 },
    tags: ['standing', 'balance', 'backbend', 'spine_extension', 'chest_opener', 'kapha_pacifying', 'energizing', 'feel_strong', 'tight_hip_flexors', 'concentration', 'intermediate'],
    contraindications: [
      "Don't practice with severe lower-back injury",
      "Skip with shoulder injury that limits external rotation",
      "Pregnant women shouldn't practice — the backbend depth and balance demand are not safe",
      "Avoid with severe high blood pressure",
      "Skip with vertigo or balance disorders",
    ],
    modifications: [
      "Use a yoga strap around the lifted foot if the hand can't reach",
      "Practice next to a wall, fingertips touching for balance",
      "Reduce the depth — keep the chest closer to upright if the lower back complains",
      "Beginner variant: hold the lifted foot but skip the press-back-and-up motion",
    ],
    benefits: [
      "Combines balance + backbend + hip-flexor stretch in one shape",
      "Opens the front of the standing-leg's hip in a dynamic way",
      "Concentration + endurance — the pose teaches sustained focus",
      "Generates cardiovascular response without aerobic work",
    ],
    reasoning: "Dancer's is one of the few poses that combines almost every standing-asana skill — balance, flexibility, strength, and backbend. Save it for users who already have steady Vrksasana and Trikonasana. Use a strap; the foot-grab is theatrical not therapeutic.",
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

  // ── Sukhasana ──────────────────────────────────────────────────────────
  // Modern term for the simple cross-legged seat. "Sukha" = ease,
  // comfort. Not in HYP Ch. 1 by this name (HYP names Padmasana,
  // Siddhasana, Swastikasana, Bhadrasana as meditation seats).
  sukhasana: {
    id: 'sukhasana',
    sanskrit: 'Sukhasana',
    devanagari: 'सुखासन',
    iast: 'sukhāsana',
    english: 'Easy Seated Pose',
    aliases: ['Easy Pose', 'Comfortable Seat'],
    source: { text: 'modern', note: 'Modern term for the basic cross-legged meditation seat. HYP Ch. 1 enumerates Padmasana, Siddhasana, Swastikasana, and Bhadrasana as meditation seats; Sukhasana is the accessible default.' },
    category: 'seated',
    level: 'beginner',
    poseKey: 'sukhasana',
    icon: 'self_care',
    durationSeconds: 120,
    breathPattern: 'natural',
    breathCues: { notes: 'Natural breath. The seat itself is the practice — the breath finds its own rhythm.' },
    voiceCues: {
      enter: 'Come to a comfortable cross-legged seat. Let the knees release toward the floor. Rest the hands on the knees, palms up or down.',
      hold: 'Lengthen the spine — crown of the head reaches up while the sit bones root down. Soften the shoulders, soften the jaw.',
      breathe: 'Breathe naturally. Each exhale releases another layer of tension from the shoulders, the face, the belly.',
      exit: 'Gently open the eyes. Stretch the legs forward and shake them out.',
    },
    bodyParts: ['hips', 'spine', 'knees', 'lower_back'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: [
      'seated', 'meditation', 'pre_meditation', 'gentle', 'evening',
      'vata_pacifying', 'pitta_pacifying', 'grounding',
      'breathwork_prep', 'meditation_prep', 'centering',
      'stress_relief', 'cant_focus', 'racing_mind',
      'beginner_friendly', 'all_levels',
    ],
    contraindications: [
      "Don't practice with severe knee injury — prop or sit on a chair instead",
      "Avoid with acute hip injury or recent hip surgery",
      "If you have severe lower-back pain that worsens unsupported sitting, sit against a wall",
    ],
    modifications: [
      "Sit on the front edge of a folded blanket or cushion — most users need 3-4 inches of lift",
      "Place blocks or cushions under each knee if they hover far above the floor",
      "Sit against a wall if the back fatigues",
      "Practice in a chair with both feet flat on the floor as the easiest variant",
    ],
    benefits: [
      "Establishes the basic meditation seat — the doorway to every breath practice",
      "Gently opens the hips and ankles over time without strain",
      "Trains upright postural endurance — especially valuable for desk-collapsed spines",
      "Functions as the canonical pose for transitioning into stillness",
    ],
    reasoning: "Sukhasana is the seat the rest of the seated practice rides on. Don't underestimate it — the hardest part of meditation, for most beginners, is finding a posture they can sustain for ten minutes without fidgeting. Get this right and pranayama, meditation, and the whole interior practice opens up.",
  },

  // ── Padmasana ──────────────────────────────────────────────────────────
  // HYP 1.44-49 names Padmasana explicitly and devotes six verses to
  // its description — the classical meditation seat for advanced
  // practitioners. We tag this as INTERMEDIATE (not beginner) because
  // forcing the lotus on tight hips is the most common knee-injury
  // pattern in modern yoga.
  padmasana: {
    id: 'padmasana',
    sanskrit: 'Padmasana',
    devanagari: 'पद्मासन',
    iast: 'padmāsana',
    english: 'Lotus Pose',
    aliases: ['Full Lotus'],
    source: { text: 'HYP', verse: '1.44-49', note: 'Named explicitly in HYP Ch. 1. Six verses describe its construction and value as a meditation seat.' },
    category: 'seated',
    level: 'intermediate',
    poseKey: 'padmasana',
    icon: 'self_care',
    durationSeconds: 180,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow, even breath. The seat is the practice — let the breath be the only motion.' },
    voiceCues: {
      enter: 'Sit with the legs extended. Bend the right knee and place the right foot on top of the left thigh, sole up. Then bend the left knee and place the left foot on top of the right thigh.',
      hold: 'Rest the hands on the knees, palms up or down. Lengthen the spine — the lotus seat is a vertical line from the sacrum through the crown.',
      breathe: 'Breathe naturally. The pose itself produces stillness; the breath only confirms it.',
      exit: 'Carefully unfold one leg at a time. Massage the knees if they feel tight.',
    },
    bodyParts: ['hips', 'knees', 'ankles', 'spine'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: ['seated', 'meditation', 'vata_pacifying', 'pitta_pacifying', 'pre_meditation', 'intermediate', 'concentration', 'pranayama_seat'],
    contraindications: [
      "Don't force this pose. Tight hips will translate the lotus into knee strain — and knees don't recover from that easily",
      "Skip with any history of knee surgery, meniscus injury, or ACL/MCL injury",
      "Pregnant women shouldn't practice the full lotus",
      "Avoid with sciatica or active hip injury",
      "Don't practice if Sukhasana already strains the knees",
    ],
    modifications: [
      "Practice Ardha Padmasana (half lotus) — one foot on the thigh, the other under",
      "Practice Sukhasana with the hips elevated on cushions — same benefits, no knee risk",
      "Place a folded blanket under the seat to tilt the pelvis forward",
      "If the lotus is available but uncomfortable, hold for shorter durations and switch leg positions",
    ],
    benefits: [
      "Establishes the most stable upright seat — sit bones, knees, and one ankle each anchor a corner of a triangle",
      "Lengthens the spine through structural alignment, not muscular effort",
      "The classical pranayama and meditation seat described in HYP and Patanjali's Yoga Sutras",
      "Long holds become possible because the lower body is locked — only the spine and breath remain to manage",
    ],
    reasoning: "Lotus is a destination pose — not a starting place. HYP describes it as the seat that 'destroys all diseases', but reaching it without injury requires patient hip-opening over months or years. If your hips don't allow lotus today, Sukhasana on a cushion is functionally identical for meditation purposes. Don't trade your knees for an Instagram pose.",
  },

  // ── Siddhasana ─────────────────────────────────────────────────────────
  // HYP 1.35-38 names Siddhasana and praises it above all other
  // asanas: "as among the yamas amaratva (immortality) is the chief,
  // so among the asanas Siddhasana is chief". The text claims 84
  // asanas exist but Siddhasana alone is sufficient for liberation.
  siddhasana: {
    id: 'siddhasana',
    sanskrit: 'Siddhasana',
    devanagari: 'सिद्धासन',
    iast: 'siddhāsana',
    english: 'Accomplished Pose',
    aliases: ["Adept's Pose", "Perfect Pose"],
    source: { text: 'HYP', verse: '1.35-38', note: 'Named in HYP Ch. 1 as the chief of all asanas. The text claims its consistent practice purifies the nadis (subtle channels) sufficient for liberation.' },
    category: 'seated',
    level: 'intermediate',
    poseKey: 'siddhasana',
    icon: 'self_care',
    durationSeconds: 180,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow even breath. Siddhasana traditionally accompanies long pranayama and meditation; the breath becomes the practice.' },
    voiceCues: {
      enter: 'Sit with the legs extended. Bend the left knee and place the left heel against the perineum (the soft point between the genitals and anus). Bend the right knee and place the right foot on top of the left ankle, with the right heel pressing into the pubic bone area.',
      hold: 'Rest the hands on the knees, palms up. Lengthen the spine. The seat creates a stable energetic lock at the pelvic floor.',
      breathe: 'Breathe through the nose in a slow, even rhythm. Siddhasana is the traditional seat for pranayama practice.',
      exit: 'Slowly unfold the legs. Massage the knees if needed.',
    },
    bodyParts: ['hips', 'knees', 'pelvic_floor', 'spine'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: ['seated', 'meditation', 'pre_meditation', 'pranayama_seat', 'pitta_pacifying', 'vata_pacifying', 'concentration', 'intermediate'],
    contraindications: [
      "Don't practice with knee, ankle, or hip injury",
      "Skip with sciatica",
      "Pregnant women should use Sukhasana on a cushion instead",
      "Avoid with pelvic-floor pain or recent pelvic surgery",
    ],
    modifications: [
      "Place the bottom foot under (rather than against) the body if the perineum-pressure variant is uncomfortable",
      "Sit on a folded blanket to elevate the hips",
      "Use Sukhasana as an entirely acceptable substitute for meditation",
      "Switch which foot is on the bottom periodically to balance the hips",
    ],
    benefits: [
      "Most stable cross-legged seat for long pranayama and meditation",
      "Heel pressure at the perineum is said to activate Mula Bandha (root lock) naturally",
      "Lengthens the spine through structural alignment",
      "Accessible to many users for whom Padmasana is not yet possible",
    ],
    reasoning: "Siddhasana is the practical alternative to Padmasana — most users with reasonable hip mobility can reach this seat. HYP's enthusiasm for it is partly because it stabilizes the pelvic floor without the knee demand of full lotus. Use it for pranayama practice once Sukhasana feels too unstable for long holds.",
  },

  // ── Vajrasana ──────────────────────────────────────────────────────────
  vajrasana: {
    id: 'vajrasana',
    sanskrit: 'Vajrasana',
    devanagari: 'वज्रासन',
    iast: 'vajrāsana',
    english: 'Thunderbolt Pose',
    aliases: ['Diamond Pose', 'Adamantine Pose'],
    source: { text: 'modern', verse: '1.51', note: 'Modern hatha lineages list this as a meditation seat. HYP 1.51 mentions a seat by similar name in the broader description of meditation postures.' },
    category: 'seated',
    level: 'beginner',
    poseKey: 'vajrasana',
    icon: 'self_care',
    durationSeconds: 120,
    breathPattern: 'natural',
    breathCues: { notes: 'Natural breath. Vajrasana is one of the few asanas safely practiced after eating — the kneeling shape gently supports digestion.' },
    voiceCues: {
      enter: 'Kneel on the floor with the knees together and the tops of the feet flat. Sit back on the heels. Big toes touching, heels apart enough to cradle the sit bones.',
      hold: 'Rest the hands on the thighs, palms down. Lengthen the spine. Soften the shoulders, soften the jaw.',
      breathe: 'Breathe naturally. Each exhale releases another layer of effort.',
      exit: 'Lean forward, walk the hands out, and unfold the legs back to seated. Massage the knees if needed.',
    },
    bodyParts: ['knees', 'ankles', 'thighs', 'spine'],
    doshaAffinity: { vata: 0, pitta: 1, kapha: 1 },
    tags: ['seated', 'meditation', 'pre_meditation', 'digestion', 'after_meals', 'pitta_pacifying', 'kapha_pacifying', 'gentle', 'beginner_friendly', 'pranayama_seat'],
    contraindications: [
      "Don't practice with knee or ankle injury — the kneeling shape compresses both joints",
      "Skip if you have meniscus issues or recent knee surgery",
      "Avoid with severe hemorrhoids or rectal prolapse",
      "Pregnant women in late pregnancy may find this uncomfortable — switch to Sukhasana",
    ],
    modifications: [
      "Place a folded blanket between the calves and thighs to reduce knee compression",
      "Sit on a yoga block or bolster placed between the heels (the most common variant for tight ankles)",
      "Roll a blanket under the front of the ankles if they don't reach the floor",
      "Practice for shorter durations and build up gradually",
    ],
    benefits: [
      "One of the only asanas safely practiced after meals — the kneeling shape supports digestion",
      "Gently stretches the ankles, knees, and quads",
      "Stable base for meditation and pranayama",
      "Easier alternative to cross-legged seats for users with tight hips",
    ],
    reasoning: "Vajrasana's superpower is that you can practice it after eating without feeling sick — useful as a 5-minute post-lunch reset. The kneeling shape gently compresses the abdomen in a way that supports gastric activity. Sit on a block between the heels if the ankles complain.",
  },

  // ── Ardha Padmasana ────────────────────────────────────────────────────
  ardhaPadmasana: {
    id: 'ardhaPadmasana',
    sanskrit: 'Ardha Padmasana',
    devanagari: 'अर्ध पद्मासन',
    iast: 'ardha padmāsana',
    english: 'Half Lotus Pose',
    aliases: ['Half Lotus'],
    source: { text: 'modern', verse: '1.44-49', note: 'Modern half-variant of HYP 1.44-49 Padmasana. The half version is the practical step on the path to full lotus.' },
    category: 'seated',
    level: 'beginner',
    poseKey: 'ardhaPadmasana',
    icon: 'self_care',
    durationSeconds: 120,
    breathPattern: 'natural',
    breathCues: { notes: 'Natural breath. The asymmetry teaches the breath to stay even when the body is not.' },
    voiceCues: {
      enter: 'Sit with the legs extended. Bend the right knee and place the right foot on top of the left thigh, sole up. Bend the left knee and tuck the left foot under the right thigh.',
      hold: 'Rest the hands on the knees, palms up or down. Lengthen the spine. Periodically alternate which foot is on top.',
      breathe: 'Breathe naturally. Notice if the asymmetry pulls the spine — adjust to find verticality.',
      exit: 'Carefully unfold the legs. Massage the knees if they feel compressed.',
    },
    bodyParts: ['hips', 'knees', 'ankles', 'spine'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: ['seated', 'meditation', 'pre_meditation', 'pranayama_seat', 'vata_pacifying', 'pitta_pacifying', 'beginner_friendly', 'concentration'],
    contraindications: [
      "Don't force the top foot onto the thigh — if the knee strains, drop back to Sukhasana",
      "Skip with knee or hip injury",
      "Pregnant women should use Sukhasana instead",
      "Avoid with sciatica that radiates down the top leg",
    ],
    modifications: [
      "Sit on a folded blanket to tilt the pelvis forward",
      "Place a cushion under the bottom knee if it doesn't reach the floor",
      "Switch top legs each time you practice",
      "Use Sukhasana as a substitute when the half lotus isn't accessible",
    ],
    benefits: [
      "Functional bridge between Sukhasana and Padmasana",
      "Trains the hip rotation needed for full lotus over time",
      "Stable enough for moderate-length pranayama and meditation",
      "Develops awareness of the spine's tendency to twist with asymmetric leg positions",
    ],
    reasoning: "Half Lotus is where most users land — full lotus requires hip mobility most modern bodies don't have, but Sukhasana lacks the structural anchoring that makes long meditation effortless. Half lotus is the realistic seat for the deepening practitioner.",
  },

  // ── Baddha Konasana ────────────────────────────────────────────────────
  baddhaKonasana: {
    id: 'baddhaKonasana',
    sanskrit: 'Baddha Konasana',
    devanagari: 'बद्धकोणासन',
    iast: 'baddha koṇāsana',
    english: 'Bound Angle Pose',
    aliases: ['Cobbler Pose', 'Butterfly Pose'],
    source: { text: 'modern', note: 'Modern hatha. Some lineages associate it with HYP\'s Bhadrasana (1.53-54), but classification varies.' },
    category: 'seated',
    level: 'beginner',
    poseKey: 'baddhaKonasana',
    icon: 'self_care',
    durationSeconds: 120,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow breath. Each exhale lets the knees descend a touch closer to the floor — never force them down.' },
    voiceCues: {
      enter: 'Sit with the spine tall. Bring the soles of the feet together and let the knees fall apart to the sides. Hold the feet or ankles. Heels close to the body or further away — whichever lets the knees release.',
      hold: 'Lengthen the spine. Don\'t round forward to bring the knees down — keep the back long and let the hips do the work.',
      breathe: 'Each exhale, soften the inner thighs. The knees release at their own pace — never pressed.',
      exit: 'Gently bring the knees back together. Extend the legs forward.',
    },
    bodyParts: ['hips', 'inner_thighs', 'groin', 'lower_back', 'knees'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: ['seated', 'hip_opener', 'gentle', 'evening', 'wind_down', 'vata_pacifying', 'pitta_pacifying', 'tight_hips', 'inner_thigh_stretch', 'pre_meditation', 'period_relief', 'fertility', 'restorative'],
    contraindications: [
      "Pregnant women — practice with the back against a wall and don't fold forward in the third trimester",
      "Don't practice with groin or hip injury",
      "Skip with severe knee injury — let the knees rest on cushions",
      "Avoid with sciatica that flares with hip external rotation",
    ],
    modifications: [
      "Sit on a folded blanket — most users need this to keep the spine long",
      "Place blocks or cushions under each knee for support (don't push the knees down)",
      "Move the feet further from the body for an easier hip stretch",
      "Practice with the back against a wall for postural support",
      "Restorative variant: lean back on a bolster behind the spine",
    ],
    benefits: [
      "Releases the inner thighs and adductors — different from forward folds",
      "Opens the hips through external rotation",
      "Traditional pose for menstrual discomfort relief and fertility support",
      "Can be held passively for many minutes — useful as a meditation seat for users with tight cross-legged seats",
    ],
    reasoning: "Bound Angle is the most accessible hip opener in the catalog — works for almost everyone. Don't push the knees down; that's the textbook injury. The release happens through gravity over time, not through force.",
  },

  // ── Upavishta Konasana ─────────────────────────────────────────────────
  upavishtaKonasana: {
    id: 'upavishtaKonasana',
    sanskrit: 'Upavishta Konasana',
    devanagari: 'उपविष्टकोणासन',
    iast: 'upaviṣṭa koṇāsana',
    english: 'Wide-Angle Seated Forward Bend',
    aliases: ['Seated Straddle Forward Fold'],
    source: { text: 'modern', note: 'Modern hatha. "Upaviṣṭa" = seated, "kona" = angle. Not in HYP Ch. 1.' },
    category: 'seated',
    level: 'beginner',
    poseKey: 'upavishtaKonasana',
    icon: 'open_in_full',
    durationSeconds: 90,
    breathPattern: 'paced',
    breathCues: { enter: 'inhale', notes: 'Inhale to lengthen; exhale to fold a touch deeper. Lead with the chest, not the head.' },
    voiceCues: {
      enter: 'Sit with the legs extended wide apart, as wide as the hamstrings allow. Flex the feet, kneecaps pointing up. Sit on a blanket if the lower back rounds.',
      hold: 'Inhale to lengthen the spine. Exhale and walk the hands forward, hinging from the hips. Keep the spine long — don\'t round to reach the floor.',
      breathe: 'Each exhale folds a touch deeper. The legs stay strong, kneecaps lifting.',
      exit: 'Walk the hands back to the hips. Inhale and rise. Bring the legs back together.',
    },
    bodyParts: ['hamstrings', 'inner_thighs', 'hips', 'lower_back', 'spine'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: ['seated', 'forward_fold', 'hip_opener', 'gentle', 'evening', 'vata_pacifying', 'pitta_pacifying', 'hamstring_stretch', 'inner_thigh_stretch', 'tight_hamstrings', 'tight_hips', 'wind_down'],
    contraindications: [
      "Pregnant women shouldn't fold deeply — keep a long spine and shallow hinge",
      "Don't practice with herniated disc or acute lower-back injury",
      "Avoid with hamstring or groin tear",
      "Skip with severe sciatica",
    ],
    modifications: [
      "Sit on a folded blanket to tilt the pelvis forward — most users need this",
      "Bend the knees if the hamstrings are tight",
      "Walk the hands forward only as far as the spine stays long",
      "Bolster across the legs to rest the chest down (restorative variant)",
    ],
    benefits: [
      "Stretches the inner thighs (adductors) — distinct from feet-together forward folds",
      "Releases the hamstrings of both legs simultaneously",
      "Calms the nervous system through forward-fold geometry",
      "Often used in yin-yoga sequences as a 3-5 minute hip release",
    ],
    reasoning: "Wide-Angle Seated Forward Fold is the seated counterpart to Prasarita Padottanasana — but with the support of the floor under the legs. Hold for 1-3 minutes for fascial release through the inner thighs. Use a folded blanket under the seat without exception.",
  },

  // ── Janu Sirsasana ─────────────────────────────────────────────────────
  januSirsasana: {
    id: 'januSirsasana',
    sanskrit: 'Janu Sirsasana',
    devanagari: 'जानुशीर्षासन',
    iast: 'jānuśīrṣāsana',
    english: 'Head-to-Knee Pose',
    aliases: ['Head-to-Knee Forward Bend'],
    source: { text: 'modern', note: 'Modern hatha. "Jānu" = knee, "śīrṣa" = head. Not in HYP Ch. 1.' },
    category: 'seated',
    level: 'beginner',
    poseKey: 'januSirsasana',
    icon: 'south',
    durationSeconds: 60,
    breathPattern: 'paced',
    breathCues: { enter: 'inhale', notes: 'Inhale to lengthen the spine; exhale to fold a touch deeper. Don\'t hold the breath.' },
    voiceCues: {
      enter: 'Sit with the legs extended. Bend the right knee and place the right sole against the inner left thigh. The right knee opens out to the side toward the floor.',
      hold: 'Inhale and lengthen the spine. Exhale and hinge forward over the extended left leg. Hold the shin, ankle, or foot — wherever you can without rounding the spine.',
      breathe: 'Each exhale releases the left hamstring a touch deeper. The right knee continues to release toward the floor.',
      exit: 'Inhale and rise. Switch sides.',
    },
    bodyParts: ['hamstrings', 'hips', 'lower_back', 'spine'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: ['seated', 'forward_fold', 'hip_opener', 'gentle', 'evening', 'vata_pacifying', 'pitta_pacifying', 'spine_flexion', 'hamstring_stretch', 'tight_hamstrings', 'wind_down', 'asymmetric'],
    contraindications: [
      "Pregnant women shouldn't fold deeply — practice with the open leg straight only and a long spine",
      "Don't practice with herniated disc or severe lower-back injury",
      "Skip with knee injury in the bent leg",
      "Avoid with severe sciatica",
    ],
    modifications: [
      "Sit on a folded blanket to elevate the hips",
      "Bend the extended knee generously to keep the spine long",
      "Use a strap around the extended foot if the hands don't reach",
      "Place a bolster on the extended leg to rest the chest down (restorative variant)",
    ],
    benefits: [
      "Asymmetric stretch isolates one hamstring at a time — easier to track tightness differences",
      "Combines hip opening (bent leg) with hamstring release (extended leg)",
      "Calms the nervous system through forward fold geometry",
      "Less demanding than Paschimottanasana for users with tight hamstrings",
    ],
    reasoning: "Janu Sirsasana is Paschimottanasana's gentler cousin — the asymmetry lets each leg work at its own pace. Useful for users who find both-legs-extended forward folds inaccessible. The bent-leg side often opens faster than the extended-leg side, surprising users who assumed the reverse.",
  },

  // ── Gomukhasana ────────────────────────────────────────────────────────
  // HYP 1.20 names "Gomukhasana" — one of the few asanas the text
  // enumerates by name. The Sanskrit means cow-faced; the legs in the
  // pose form a shape said to resemble a cow's face.
  gomukhasana: {
    id: 'gomukhasana',
    sanskrit: 'Gomukhasana',
    devanagari: 'गोमुखासन',
    iast: 'gomukhāsana',
    english: 'Cow Face Pose',
    aliases: ['Cow-Faced Pose'],
    source: { text: 'HYP', verse: '1.20', note: 'Named explicitly in HYP Ch. 1. The legs in the pose are said to resemble a cow\'s face — knees stacked like the muzzle, feet flaring like the ears.' },
    category: 'seated',
    level: 'intermediate',
    poseKey: 'gomukhasana',
    icon: 'pets',
    durationSeconds: 60,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow even breath. The shape is intense — the breath keeps the shoulders soft.' },
    voiceCues: {
      enter: 'From seated, cross the right thigh over the left so the knees stack. The feet flare out to the sides of the hips. Reach the right arm overhead, bend the elbow, and let the right hand fall down the back. Bring the left arm behind the back from below; if accessible, hook the fingers together. Otherwise hold a strap between the hands.',
      hold: 'Stack the spine vertically. Lift the bottom elbow up; lift the top elbow up. Soften the lifted shoulder away from the ear.',
      breathe: 'Each breath spreads through the upper back and the outer hips.',
      exit: 'Release the arms. Uncross the legs and shake them out. Switch sides — both leg AND arm positions reverse.',
    },
    bodyParts: ['shoulders', 'triceps', 'chest', 'outer_hips', 'IT_band'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: ['seated', 'shoulder_opener', 'hip_opener', 'kapha_pacifying', 'tight_shoulders', 'tight_hips', 'desk_recovery', 'upper_back_relief', 'IT_band_relief', 'intermediate'],
    contraindications: [
      "Don't practice with shoulder injury, frozen shoulder, or rotator cuff tear",
      "Skip with knee injury — the leg cross is intense",
      "Pregnant women should skip the leg cross and modify with a simple cross-legged seat",
      "Avoid with severe neck pain",
    ],
    modifications: [
      "Use a strap or towel between the hands if they don't meet behind the back",
      "Sit on a blanket if the knees don't stack comfortably",
      "Practice the arms-only version with the legs in Sukhasana",
      "Practice the legs-only version with the hands resting on the top knee",
    ],
    benefits: [
      "Releases the deep outer hip rotators and IT band — useful for runners and cyclists",
      "Opens the shoulders in opposing directions (rotator-cuff balance)",
      "Identifies asymmetry between the two sides — almost everyone has a 'tight' arm and a 'loose' arm",
      "HYP positions it as one of the foundational seats — brief practice integrates well into a sitting practice",
    ],
    reasoning: "Gomukhasana is two stretches in one — outer hips and shoulders. The asymmetry is informative: most users discover their dominant-side arm reaches behind the back further than the non-dominant. This pose makes the imbalance visible, which is the first step in correcting it.",
  },

  // ── Marichyasana C ─────────────────────────────────────────────────────
  marichyasanaC: {
    id: 'marichyasanaC',
    sanskrit: 'Marichyasana C',
    devanagari: 'मरीच्यासन C',
    iast: 'marīcyāsana',
    english: "Marichi's Pose C",
    aliases: ["Sage Marichi's Twist"],
    source: { text: 'modern', note: 'Modern Iyengar/Ashtanga lettering of seated twists named for the sage Marichi (a son of Brahma). HYP does not enumerate the lettered variants.' },
    category: 'twist',
    level: 'intermediate',
    poseKey: 'marichyasanaC',
    icon: 'autorenew',
    durationSeconds: 45,
    breathPattern: 'paced',
    breathCues: { enter: 'inhale', notes: 'Inhale to lengthen; exhale to deepen the twist. Never force on the breath out.' },
    voiceCues: {
      enter: 'Sit with the legs extended. Bend the right knee and place the right foot flat on the floor, heel close to the right sit bone. Keep the left leg long and active.',
      hold: 'Inhale to lengthen the spine. Exhale and rotate the torso to the right. Hook the left elbow on the outside of the right knee. Right hand behind you for support.',
      breathe: 'Each inhale lengthens; each exhale rotates a touch deeper. The left leg stays engaged.',
      exit: 'Release the twist slowly. Switch sides.',
    },
    bodyParts: ['spine', 'obliques', 'hips', 'shoulders', 'lower_back'],
    doshaAffinity: { vata: 0, pitta: 1, kapha: 1 },
    tags: ['seated', 'twist', 'rotation', 'pitta_pacifying', 'kapha_pacifying', 'digestion', 'bloating', 'tight_lower_back', 'after_sitting', 'desk_recovery', 'intermediate'],
    contraindications: [
      "Pregnant women should practice an open variation only — don't compress the belly",
      "Don't practice with herniated disc or SI joint instability",
      "Avoid with recent abdominal, back, or hip surgery",
      "Skip during an active IBS flare or after a heavy meal",
    ],
    modifications: [
      "Sit on a folded blanket to elevate the hips",
      "Keep the bottom hand on a block for support if the floor is far",
      "Hold the bent knee instead of the elbow-hook for an easier rotation",
      "Practice the open-twist variant during pregnancy",
    ],
    benefits: [
      "Deeper rotation than Ardha Matsyendrasana — works the lumbar spine more directly",
      "Compresses and stimulates the digestive organs",
      "Releases the lower back and SI region",
      "Develops the rotation needed for arm balances and binding poses later",
    ],
    reasoning: "Marichyasana C is a step deeper than Ardha Matsyendrasana — the rotation comes more from the lumbar spine because the bottom leg stays straight. Don't pull on the knee to deepen the twist; let the breath and the elbow-hook do the work.",
  },

  // ── Virasana ───────────────────────────────────────────────────────────
  // HYP 1.21 names "Virasana" — one of the seats described as a
  // meditation posture. Modern teaching often distinguishes Virasana
  // (seated between the heels) from Vajrasana (seated on the heels).
  virasana: {
    id: 'virasana',
    sanskrit: 'Virasana',
    devanagari: 'वीरासन',
    iast: 'vīrāsana',
    english: 'Hero Pose',
    aliases: ["Hero's Seat"],
    source: { text: 'HYP', verse: '1.21', note: 'Named in HYP Ch. 1 alongside other meditation seats. The Sanskrit "vīra" means hero, warrior.' },
    category: 'seated',
    level: 'beginner',
    poseKey: 'virasana',
    icon: 'self_care',
    durationSeconds: 120,
    breathPattern: 'natural',
    breathCues: { notes: 'Natural breath. Like Vajrasana, this seat is safe after meals; the breath finds its own slow rhythm.' },
    voiceCues: {
      enter: 'Kneel with the knees together and the feet wider than the hips. Sit between the feet, sit bones on the floor or on a block. The tops of the feet flat on the floor, toes pointing back.',
      hold: 'Rest the hands on the thighs. Lengthen the spine. Soften the shoulders, soften the jaw.',
      breathe: 'Breathe naturally. Each exhale releases another layer of effort.',
      exit: 'Lean to one side, swing the legs out, and unfold them forward. Massage the knees if needed.',
    },
    bodyParts: ['knees', 'ankles', 'thighs', 'spine'],
    doshaAffinity: { vata: 0, pitta: 1, kapha: 1 },
    tags: ['seated', 'meditation', 'pre_meditation', 'after_meals', 'digestion', 'pitta_pacifying', 'kapha_pacifying', 'gentle', 'pranayama_seat'],
    contraindications: [
      "Don't practice with knee injury, meniscus tear, or recent knee surgery",
      "Skip with ankle injury",
      "Pregnant women should sit on a high block or bolster between the heels",
      "Avoid if Vajrasana already strains the knees",
    ],
    modifications: [
      "Sit on a yoga block placed between the heels — start tall, lower the block over weeks",
      "Place a folded blanket between the calves and thighs to reduce knee compression",
      "Roll a blanket under the front of the ankles if they don't reach the floor",
      "Build duration gradually — 30 seconds, then a minute, then longer",
    ],
    benefits: [
      "Stretches the quadriceps and the front of the ankles in a way no other pose reaches",
      "Stable seat for meditation and pranayama, especially for users with tight cross-legged seats",
      "Like Vajrasana, safely practiced after meals",
      "HYP-named — connects modern users to one of the foundational seats of the original tradition",
    ],
    reasoning: "Virasana is the deeper-knee cousin of Vajrasana — the sit bones are between the heels rather than on them. Most users need a block under the seat for years before reaching the floor. The quad stretch is unique; few other poses target it from this angle.",
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
  // ── Uttanasana ─────────────────────────────────────────────────────────
  // Modern hatha forward fold. "Ut" = intense, "tāna" = stretch. Not
  // in HYP Ch. 1 (which names Paschimottanasana, the seated version).
  uttanasana: {
    id: 'uttanasana',
    sanskrit: 'Uttanasana',
    devanagari: 'उत्तानासन',
    iast: 'uttānāsana',
    english: 'Standing Forward Fold',
    aliases: ['Standing Forward Bend', 'Rag Doll'],
    source: { text: 'modern', note: 'Modern standing forward fold. HYP names Paschimottanasana (1.30-31), the seated version; Uttanasana is its standing-pose counterpart from modern hatha.' },
    category: 'standing',
    level: 'beginner',
    poseKey: 'uttanasana',
    icon: 'south',
    durationSeconds: 60,
    breathPattern: 'paced',
    breathCues: { enter: 'exhale', notes: 'Inhale to lengthen the spine on entry; exhale to fold deeper. Stay with the breath — don\'t hold it.' },
    voiceCues: {
      enter: 'From standing, inhale and lift the arms overhead to lengthen the spine. Exhale and hinge from the hips, folding forward with a long spine. Bend the knees as much as needed.',
      hold: 'Let the head hang heavy. Hold opposite elbows and gently sway side to side, or rest the hands on shins, ankles, or the floor. Soften the neck completely.',
      breathe: 'Each exhale lets the torso melt a little closer to the thighs. Each inhale broadens across the upper back.',
      exit: 'Bend the knees generously. Roll up to standing slowly, vertebra by vertebra. The head comes up last.',
    },
    bodyParts: ['hamstrings', 'spine', 'calves', 'hips', 'lower_back'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: [
      'standing', 'forward_fold', 'gentle', 'wind_down', 'evening',
      'vata_pacifying', 'pitta_pacifying', 'spine_flexion', 'hamstring_stretch',
      'stress_relief', 'anxiety', 'reset', 'hangover',
      'tight_hamstrings', 'lower_back_relief', 'desk_recovery',
      'long_day', 'cant_unwind',
    ],
    contraindications: [
      "Pregnant women shouldn't fold deeply — keep the legs apart and a long spine instead",
      "Don't practice with a herniated disc or acute lower-back injury",
      "Skip with severe sciatica or hamstring tear",
      "Avoid with very high blood pressure or detached retina",
      "If you have glaucoma, skip the head-below-heart position",
    ],
    modifications: [
      "Bend the knees as much as needed — straight legs are not the goal",
      "Rest the hands on yoga blocks if the floor is far",
      "Place a chair seat under the torso for a fully supported version",
      "Hold opposite elbows and let the upper body hang completely",
    ],
    benefits: [
      "Releases the entire posterior chain — hamstrings, calves, lower back",
      "Mild inversion calms the sympathetic nervous system",
      "Decompresses the spine through gravity-assisted lengthening",
      "Common entry into pranayama practice — a few minutes here before sitting helps the breath settle",
    ],
    reasoning: "Uttanasana is the simplest reset for an overwound nervous system. The combination of head-below-heart (a mild inversion) and full posterior-chain release flips the user out of fight-or-flight in 60-90 seconds. Bend the knees liberally — there's no extra credit for straight legs.",
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

  // ── Supta Matsyendrasana ───────────────────────────────────────────────
  // Modern reclined version of the HYP 1.27 Matsyendrasana. The
  // supine geometry removes the muscular effort of an upright twist,
  // making this the most universally accessible spinal rotation.
  suptaMatsyendrasana: {
    id: 'suptaMatsyendrasana',
    sanskrit: 'Supta Matsyendrasana',
    devanagari: 'सुप्त मत्स्येन्द्रासन',
    iast: 'supta matsyendrāsana',
    english: 'Supine Spinal Twist',
    aliases: ['Reclined Twist', 'Belly Twist (informal)'],
    source: { text: 'modern', verse: '1.27', note: 'Modern reclined variant of the HYP 1.27 Matsyendrasana, named for the sage Matsyendranath.' },
    category: 'supine',
    level: 'beginner',
    poseKey: 'supineTwist',
    icon: 'autorenew',
    durationSeconds: 60,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow, full breaths into the side body. Each exhale lets gravity sink the knee a little closer to the floor.' },
    voiceCues: {
      enter: 'Lie on the back. Hug the right knee into the chest. Extend the left leg long along the floor.',
      hold: 'Guide the right knee across the body toward the left, letting it drop toward the floor. Extend the right arm out at shoulder height. Turn the head to the right if the neck allows.',
      breathe: 'Each exhale lets the right knee sink deeper. Don\'t force the shoulder down — let the breath do the unwinding.',
      exit: 'Inhale and bring the knee back to center. Hug both knees in for a breath, then switch sides.',
    },
    bodyParts: ['spine', 'hips', 'lower_back', 'chest', 'shoulders', 'obliques'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 1 },
    tags: [
      'supine', 'twist', 'restorative', 'evening', 'pre_sleep', 'gentle',
      'vata_pacifying', 'pitta_pacifying', 'kapha_pacifying', 'rotation',
      'lower_back_relief', 'back_pain', 'tight_lower_back',
      'wind_down', 'after_sitting', 'desk_recovery', 'before_bed',
    ],
    contraindications: [
      "Pregnant women shouldn't practice deep closed twists — try an open variation with the bottom leg straight",
      "Don't practice with a herniated disc or SI joint instability",
      "Avoid after recent abdominal, back, or hip surgery",
      "Skip during an active IBS flare or acute lower-back spasm",
    ],
    modifications: [
      "Place a bolster or cushion under the moving knee so it doesn't reach for the floor",
      "Keep the bottom leg bent if straightening it strains the lower back",
      "Skip turning the head if the neck is sensitive — keep gaze straight up",
      "For a deeper variation: cross the top leg over the bottom one before twisting",
    ],
    benefits: [
      "Releases the muscles around the lumbar spine and SI joint",
      "Compresses and releases the abdominal organs — supports digestion",
      "Activates the parasympathetic response — reliable pre-sleep pose",
      "Accessible spinal rotation for users who can't sit on the floor for the upright version",
    ],
    reasoning: "Of all the twists in the catalog, the supine version is the one to reach for at the end of a long day. Gravity does the work; the body just consents. The 60-90 second hold per side is when the parasympathetic shift actually lands.",
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

  // ── Supta Baddha Konasana ──────────────────────────────────────────────
  suptaBaddhaKonasana: {
    id: 'suptaBaddhaKonasana',
    sanskrit: 'Supta Baddha Konasana',
    devanagari: 'सुप्त बद्धकोणासन',
    iast: 'supta baddha koṇāsana',
    english: 'Reclined Bound Angle Pose',
    aliases: ['Reclined Cobbler Pose', 'Reclining Goddess'],
    source: { text: 'modern', note: 'Modern restorative variant of Baddha Konasana. Not in HYP Ch. 1.' },
    category: 'restorative',
    level: 'beginner',
    poseKey: 'suptaBaddhaKonasana',
    icon: 'spa',
    durationSeconds: 240,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow even breath. Each exhale releases the inner thighs a touch closer to the floor.' },
    voiceCues: {
      enter: 'Lie on the back. Bring the soles of the feet together and let the knees fall apart to the sides. Place a cushion or block under each knee for support.',
      hold: 'Rest one hand on the belly, one on the heart. Or rest the arms by the sides, palms up. Soften the jaw, soften the eyes.',
      breathe: 'Breathe softly into the lower belly. Each exhale is a quiet release.',
      exit: 'Use the hands to bring the knees back together. Roll to the right side and rest there for a breath. Press up to seated slowly.',
    },
    bodyParts: ['hips', 'inner_thighs', 'groin', 'lower_back', 'chest'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: ['supine', 'restorative', 'hip_opener', 'gentle', 'evening', 'pre_sleep', 'vata_pacifying', 'pitta_pacifying', 'inner_thigh_stretch', 'tight_hips', 'period_relief', 'fertility', 'wind_down', 'stress_relief', 'cant_sleep'],
    contraindications: [
      "Pregnant women in the third trimester shouldn't lie flat — prop the upper body on a 30-45° bolster",
      "Don't practice with groin or hip injury",
      "Skip with knee injury — make sure cushions support the knees fully",
      "Avoid with severe lower-back pain — try with bent knees instead",
    ],
    modifications: [
      "Place blocks or pillows under each knee — non-negotiable for tight hips",
      "Bolster lengthwise under the spine for a chest-opening variant",
      "Eye pillow over the eyes for deeper relaxation",
      "Bolster under the head if the chin tilts back uncomfortably",
    ],
    benefits: [
      "One of the most accessible hip openers — gravity does the work",
      "Calms the nervous system reliably — competes with Savasana for parasympathetic effect",
      "Traditional pose for menstrual discomfort and pelvic-floor relaxation",
      "Holds well for 5-15 minutes — ideal for restorative practice or pre-sleep",
    ],
    reasoning: "Reclined Bound Angle is the lazy restorative cousin of Baddha Konasana — the floor supports the spine while gravity opens the hips. Use the cushions under the knees without exception. This is the pose to reach for when nothing else feels accessible.",
  },

  // ── Supta Padangusthasana ──────────────────────────────────────────────
  suptaPadangusthasana: {
    id: 'suptaPadangusthasana',
    sanskrit: 'Supta Padangusthasana',
    devanagari: 'सुप्त पादाङ्गुष्ठासन',
    iast: 'supta pādāṅguṣṭhāsana',
    english: 'Reclined Hand-to-Big-Toe Pose',
    aliases: ['Reclining Hand-to-Big-Toe'],
    source: { text: 'modern', note: 'Modern reclined variant of Utthita Hasta Padangusthasana. Not in HYP Ch. 1.' },
    category: 'supine',
    level: 'beginner',
    poseKey: 'suptaPadangusthasana',
    icon: 'accessibility',
    durationSeconds: 60,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow even breath. Each exhale lets the hamstring release a touch deeper.' },
    voiceCues: {
      enter: 'Lie on the back. Loop a yoga strap around the ball of the right foot. Extend the right leg up toward the ceiling, holding the strap with both hands. Keep the left leg long on the floor, foot flexed.',
      hold: 'Press the right foot up into the strap, drawing the leg slightly closer to the chest. Soften the right hip down. Both shoulders stay on the floor.',
      breathe: 'Each exhale brings the leg a touch closer to the chest. Don\'t pull — let the strap be the bridge.',
      exit: 'Lower the right leg to the floor. Pause. Switch sides.',
    },
    bodyParts: ['hamstrings', 'hips', 'lower_back', 'calves'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: ['supine', 'gentle', 'hamstring_stretch', 'tight_hamstrings', 'lower_back_relief', 'sciatica_relief', 'pre_sleep', 'evening', 'after_running', 'vata_pacifying', 'pitta_pacifying'],
    contraindications: [
      "Pregnant women in third trimester shouldn't lie flat — practice on the side instead",
      "Don't practice with hamstring tear or severe sciatica that worsens with the stretch",
      "Avoid with herniated disc — keep the bottom leg bent if needed",
      "Skip with high blood pressure if the leg lifts to vertical",
    ],
    modifications: [
      "Use a yoga strap, towel, or belt around the foot — never reach for the toe with tight hamstrings",
      "Bend the bottom knee with the foot on the floor for lower-back support",
      "Bend the lifted knee — the goal is hamstring length, not a straight line",
      "Open the lifted leg out to the side for an inner-thigh variation",
    ],
    benefits: [
      "Most accessible hamstring stretch in the catalog — the floor supports the spine",
      "Specific lengthening of the sciatic nerve pathway — useful for mild sciatica",
      "Releases tension in the lower back without spinal flexion",
      "Excellent post-running or post-cycling pose",
    ],
    reasoning: "When users say their hamstrings are tight but standing forward folds hurt their backs, this is the pose. The supine geometry removes the load on the spine while still delivering the full hamstring stretch. Use a strap unconditionally; reaching for the foot creates the exact spinal compression we're trying to avoid.",
  },

  // ── Apanasana ──────────────────────────────────────────────────────────
  apanasana: {
    id: 'apanasana',
    sanskrit: 'Apanasana',
    devanagari: 'अपानासन',
    iast: 'apānāsana',
    english: 'Knees-to-Chest Pose',
    aliases: ['Wind-Relieving Pose', 'Pavanamuktasana (similar)'],
    source: { text: 'modern', note: 'Modern hatha. Named for "apāna" — the downward-moving prana that governs elimination. Not in HYP Ch. 1.' },
    category: 'supine',
    level: 'beginner',
    poseKey: 'apanasana',
    icon: 'compress',
    durationSeconds: 45,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow even breath. Each exhale lets the knees press a touch closer to the chest.' },
    voiceCues: {
      enter: 'Lie on the back. Bend both knees and draw them in toward the chest. Wrap the arms around the shins, hands on opposite elbows or holding the shins.',
      hold: 'Hug the knees in. Soften the shoulders to the floor. Let the lower back release into the floor with each exhale.',
      breathe: 'Each inhale, the belly presses gently against the thighs. Each exhale, draw the knees a touch closer.',
      exit: 'Release the legs to the floor and rest for a breath.',
    },
    bodyParts: ['lower_back', 'hips', 'glutes', 'belly'],
    doshaAffinity: { vata: 1, pitta: 0, kapha: 1 },
    tags: ['supine', 'gentle', 'lower_back_relief', 'digestion', 'bloating', 'gas_relief', 'morning', 'evening', 'spine_flexion', 'vata_pacifying', 'kapha_pacifying', 'between_poses', 'reset', 'beginner_friendly'],
    contraindications: [
      "Pregnant women shouldn't compress the belly — skip or modify by drawing the knees apart and around the belly instead",
      "Don't practice immediately after eating — wait 1-2 hours",
      "Avoid with severe hip or knee injury",
      "Skip with herniated disc that worsens with spinal flexion",
    ],
    modifications: [
      "Hold one knee at a time (Eka Pada Apanasana) — easier on the lower back",
      "Hold the backs of the thighs instead of the shins for shoulder issues",
      "Roll gently side to side for a lower-back massage variation",
      "Skip if any compression worsens digestive distress",
    ],
    benefits: [
      "Releases the lower back through gentle spinal flexion",
      "Stimulates the colon — supports elimination ('apāna' literally means downward-moving energy)",
      "Useful between stronger asanas as a neutralizing reset",
      "Direct relief for trapped gas and abdominal tightness",
    ],
    reasoning: "Apanasana is the simplest reset pose — the spine returns to neutral, the lower back releases, the belly gets gentle compression. Use it freely between deeper poses. The Sanskrit name acknowledges that this pose moves things downward and out, which is exactly what most kapha-heavy mornings need.",
  },

  // ── Jathara Parivartanasana ────────────────────────────────────────────
  jatharaParivartanasana: {
    id: 'jatharaParivartanasana',
    sanskrit: 'Jathara Parivartanasana',
    devanagari: 'जठर परिवर्तनासन',
    iast: 'jaṭhara parivartanāsana',
    english: 'Belly Twist',
    aliases: ['Reclined Belly Twist', 'Revolved Abdomen Pose'],
    source: { text: 'modern', note: 'Modern hatha. "Jaṭhara" = belly, "parivartana" = revolving. Not in HYP Ch. 1.' },
    category: 'supine',
    level: 'beginner',
    poseKey: 'jatharaParivartanasana',
    icon: 'autorenew',
    durationSeconds: 60,
    breathPattern: 'natural',
    breathCues: { notes: 'Slow even breath into the side ribs. Don\'t hold the breath in the twist.' },
    voiceCues: {
      enter: 'Lie on the back. Draw both knees in toward the chest. Extend the arms out to the sides at shoulder height, palms up.',
      hold: 'Lower both knees to the right toward the floor. Turn the head to the left. Both shoulders stay on the floor.',
      breathe: 'Each exhale, let the knees sink a touch closer to the floor. Don\'t force the shoulder down.',
      exit: 'Inhale and bring the knees back to center. Hug them in for a breath. Switch sides.',
    },
    bodyParts: ['spine', 'obliques', 'lower_back', 'hips', 'chest', 'shoulders'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 1 },
    tags: ['supine', 'twist', 'rotation', 'gentle', 'evening', 'pre_sleep', 'vata_pacifying', 'pitta_pacifying', 'kapha_pacifying', 'lower_back_relief', 'back_pain', 'tight_lower_back', 'digestion', 'wind_down', 'before_bed'],
    contraindications: [
      "Pregnant women should practice an open variant — knees apart, don't compress the belly",
      "Don't practice with herniated disc or SI joint instability",
      "Avoid after recent abdominal, hip, or back surgery",
      "Skip during an active IBS flare",
    ],
    modifications: [
      "Place a bolster or cushion under the moving knees so they don't reach the floor",
      "Keep the knees stacked rather than letting them slide apart",
      "Skip turning the head if the neck is sensitive — gaze straight up",
      "Use a single-leg variant: extend the bottom leg long, only the top knee crosses over",
    ],
    benefits: [
      "Releases the muscles around the lumbar spine and SI joint",
      "Stimulates abdominal organs — supports digestion",
      "Activates the parasympathetic response — pre-sleep favorite",
      "Tri-doshic — works for everyone, which is rare",
    ],
    reasoning: "Belly Twist is one of the most universally-prescribed poses in the catalog — short of injury, almost everyone benefits from it almost every day. Especially useful as the last pose before Savasana to neutralize the spine after asymmetric work.",
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

  // ── Dhanurasana ────────────────────────────────────────────────────────
  // HYP 1.25 names "Dhanurasana" explicitly — one of the few asanas
  // the text enumerates by name. The Sanskrit "dhanus" = bow; the body
  // forms an archer's bow when the hands hold the ankles and the chest
  // and thighs lift simultaneously.
  dhanurasana: {
    id: 'dhanurasana',
    sanskrit: 'Dhanurasana',
    devanagari: 'धनुरासन',
    iast: 'dhanurāsana',
    english: 'Bow Pose',
    aliases: ['Bow'],
    source: { text: 'HYP', verse: '1.25', note: 'Named explicitly in HYP Ch. 1. The Sanskrit "dhanus" means archer\'s bow — the body forms a bow shape with the arms acting as the string.' },
    category: 'backbend',
    level: 'intermediate',
    poseKey: 'dhanurasana',
    icon: 'arc',
    durationSeconds: 30,
    breathPattern: 'paced',
    breathCues: { enter: 'inhale', notes: 'Inhale to lift; exhale to settle. Don\'t hold the breath under the lift — it\'s tempting but wrong.' },
    voiceCues: {
      enter: 'Lie face down. Bend both knees and reach the hands back to grasp the outsides of the ankles. Knees stay hip-width apart.',
      hold: 'Inhale and press the feet back into the hands as you lift the chest and thighs off the floor. The bow shape — the body curves, the arms are the bowstring.',
      breathe: 'Each breath rocks the bow gently. The lift comes from the legs pressing back into the hands, not from the arm strength.',
      exit: 'Exhale and release the feet. Lower the chest and thighs to the floor. Turn one cheek down and rest with the arms by your sides.',
    },
    bodyParts: ['spine', 'chest', 'shoulders', 'quadriceps', 'hip_flexors', 'core'],
    doshaAffinity: { vata: 0, pitta: -1, kapha: 1 },
    tags: ['backbend', 'spine_extension', 'chest_opener', 'energizing', 'morning', 'kapha_pacifying', 'open_chest', 'tight_quads', 'tight_hip_flexors', 'low_energy', 'feel_strong', 'intermediate'],
    contraindications: [
      "Pregnant women shouldn't practice — prone position is unsafe",
      "Don't practice with herniated disc, severe lower-back injury, or recent abdominal surgery",
      "Skip with high or low blood pressure",
      "Avoid with neck injury",
      "Don't practice with active migraine or severe headache",
      "Skip after eating — wait 3-4 hours",
    ],
    modifications: [
      "Half Bow (Ardha Dhanurasana) — hold one ankle at a time",
      "Use a yoga strap looped around both ankles if the hands don't reach",
      "Reduce the lift — micro-bow is a legitimate pose for newer backs",
      "Practice on a folded blanket under the hip points to reduce floor pressure",
    ],
    benefits: [
      "Strongest spine-extension in the prone series — opens the entire front body",
      "Stretches the quadriceps and hip flexors simultaneously — both rare",
      "Compresses and stimulates the abdominal organs",
      "HYP-named — connects modern users to one of the foundational shapes the original tradition prescribed",
    ],
    reasoning: "Dhanurasana is a real backbend — not the gentle Cobra of beginner sequences. The combination of leg-lift, chest-lift, and hand-grip works the entire posterior chain in extension. Use a strap if the hands don't reach the ankles; the strap doesn't make this an easy pose. Save it for users who already have steady Bhujangasana and Setu Bandha.",
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

  // ── Legs Up the Wall ───────────────────────────────────────────────────
  // Modern restorative simplification of the HYP 3.78-83 Viparita
  // Karani — which in HYP is a *mudra* involving inversion to reverse
  // bindu (subtle essence) flow. We ship the passive wall variant as
  // an asana; the original mudra is a stretch goal.
  legsUpTheWall: {
    id: 'legsUpTheWall',
    sanskrit: 'Viparita Karani',
    devanagari: 'विपरीत करणी',
    iast: 'viparīta karaṇī',
    english: 'Legs Up the Wall',
    aliases: ['Inverted Action', 'Wall Pose'],
    source: { text: 'modern', verse: '3.78-83', note: 'Modern restorative pose. The original HYP 3.78-83 Viparita Karani is a mudra (not an asana) involving inversion to reverse the flow of bindu. We ship the simplified wall variant; the mudra itself is a stretch goal.' },
    category: 'restorative',
    level: 'beginner',
    poseKey: 'legsUpWall',
    icon: 'straight',
    durationSeconds: 300,
    breathPattern: 'natural',
    breathCues: { notes: 'Natural breath. The pose itself is a long exhale for the nervous system — let the breath find its own slow rhythm.' },
    voiceCues: {
      enter: 'Sit with the right hip against the wall. Swing the legs up the wall as you lie down on the back. Scoot the hips as close to the wall as comfortable — they don\'t have to touch.',
      hold: 'Let the arms rest out to the sides, palms up, or one hand on the belly and one on the heart. Close the eyes. Let the wall hold the legs entirely.',
      breathe: 'Breathe softly. Feel the blood circulating back from the feet toward the heart. There is nothing to do here.',
      exit: 'Bend the knees and roll to the right side. Rest there for a breath. Press up to seated slowly — the head comes up last.',
    },
    bodyParts: ['legs', 'lower_back', 'feet', 'nervous_system'],
    doshaAffinity: { vata: 1, pitta: 1, kapha: 0 },
    tags: [
      'restorative', 'inversion', 'gentle', 'evening', 'pre_sleep',
      'vata_pacifying', 'pitta_pacifying',
      'insomnia', 'anxiety', 'stress_relief', 'cant_sleep',
      'tired_legs', 'leg_swelling', 'after_travel', 'after_standing_all_day',
      'wind_down', 'reset', 'overwhelm', 'period_relief',
    ],
    contraindications: [
      "Pregnant women in the third trimester shouldn't lie flat on the back — practice on the side instead",
      "Don't practice during menstruation if you find inversions uncomfortable (cultural / personal preference, not strict medical)",
      "Avoid with severe glaucoma, recent retinal detachment, or untreated high blood pressure",
      "Skip during a severe headache or sinus congestion",
      "Don't practice with a recent neck injury",
    ],
    modifications: [
      "Place a folded blanket under the hips for a slight pelvic tilt (the classic Iyengar version)",
      "Move the hips a few inches away from the wall if hamstrings are tight",
      "Cover the eyes with a soft cloth or eye pillow to deepen the parasympathetic shift",
      "Bend the knees if straightening the legs is uncomfortable — keep the soles of the feet on the wall",
    ],
    benefits: [
      "Reverses venous return — drains fluid from the legs and reduces swelling",
      "Activates the parasympathetic nervous system — measurable drop in heart rate within minutes",
      "Releases the lower back and hamstrings without active stretching",
      "One of the most reliable pre-sleep poses for users with insomnia or racing thoughts at night",
    ],
    reasoning: "Legs Up the Wall is the ultimate effortless restorative. For users who say they 'can't relax' or 'can't sleep', this is the prescription. Five to fifteen minutes here, eyes covered, no music — the nervous system does the rest of the work itself.",
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
      { id: 'suptaMatsyendrasana', time: '07:10', customDuration: 60 },
      { id: 'legsUpTheWall', time: '07:12', customDuration: 180 },
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
      { id: 'suptaMatsyendrasana', time: '21:05', customDuration: 60 },
      { id: 'legsUpTheWall', time: '21:07', customDuration: 180 },
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
      { id: 'virabhadrasanaI', time: '06:38', customDuration: 45 },
      { id: 'virabhadrasanaII', time: '06:40', customDuration: 45 },
      { id: 'bhujangasana', time: '06:42', customDuration: 45 },
      { id: 'adhoMukhaSvanasana', time: '06:44', customDuration: 60 },
      { id: 'vrksasana', time: '06:46', customDuration: 45 },
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
      { id: 'adhoMukhaSvanasana', time: '07:06', customDuration: 60 },
      { id: 'uttanasana', time: '07:08', customDuration: 60 },
      { id: 'pigeon', time: '07:10', customDuration: 90 },
      { id: 'ardhaMatsyendrasana', time: '07:12', customDuration: 45 },
      { id: 'paschimottanasana', time: '07:14', customDuration: 90 },
      { id: 'setuBandhaSarvangasana', time: '07:16', customDuration: 60 },
      { id: 'suptaMatsyendrasana', time: '07:18', customDuration: 60 },
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
  // Pilot 1 batch
  cobra:        'bhujangasana',
  seatedTwist:  'ardhaMatsyendrasana',
  // Batch 2
  tree:         'vrksasana',
  warrior1:     'virabhadrasanaI',
  legUpWall:    'legsUpTheWall',
  supinetwist:  'suptaMatsyendrasana',
  // Migrated in pilot 1 (kept here for any drifted older clients):
  bridge:       'setuBandhaSarvangasana',
  downwardDog:  'adhoMukhaSvanasana',
  warrior2:     'virabhadrasanaII',
  // Pending migration in batch 3:
  // pigeon:       'ekaPadaRajakapotasana',
}

export function resolveAsanaId(id) {
  return ASANA_ALIASES[id] || id
}

export function getAsana(id) {
  return ASANAS[resolveAsanaId(id)]
}
