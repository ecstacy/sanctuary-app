// ─── Canonical Asana Dataset ────────────────────────────────────────────────
// Single source of truth for all yoga poses used across the app.

export const ASANAS = {
  // ── Standing Poses ──────────────────────────────────────────────────────
  tadasana: {
    id: 'tadasana',
    sanskrit: 'Tadasana',
    english: 'Mountain Pose',
    icon: 'landscape',
    durationSeconds: 60,
    category: 'standing',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'neutral', kapha: 'neutral' },
    bodyParts: ['Spine', 'Legs', 'Core'],
    benefits: ['Improves posture', 'Strengthens thighs & ankles', 'Builds body awareness', 'Centers the mind'],
    reasoning: 'The foundation of all standing poses. Tadasana teaches alignment and stillness, grounding Vata energy and building the awareness needed for every other asana.',
    voiceCues: {
      enter: 'Stand tall with your feet together, arms by your sides. Spread your toes and feel the ground beneath you.',
      hold: 'Engage your thighs, lift your kneecaps gently. Roll your shoulders back and down. Crown of your head reaches toward the sky.',
      breathe: 'Breathe slowly and deeply. Feel your body rooted like a mountain. Strong. Still. Present.',
      exit: 'Gently release. Shake out your hands if you need to.',
    },
    poseKey: 'tadasana',
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

  warrior2: {
    id: 'warrior2',
    sanskrit: 'Virabhadrasana II',
    english: 'Warrior II',
    icon: 'fitness_center',
    durationSeconds: 45,
    category: 'standing',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'balancing' },
    bodyParts: ['Hips', 'Legs', 'Arms', 'Core'],
    benefits: ['Builds lower body strength', 'Opens hips deeply', 'Strengthens arms', 'Cultivates focus'],
    reasoning: 'Opens the body wide like a warrior surveying the battlefield. This pose builds endurance and heat, perfect for overcoming Kapha sluggishness while grounding restless Vata energy.',
    voiceCues: {
      enter: 'From standing, step your feet wide apart. Turn your right foot out ninety degrees. Extend your arms out to the sides at shoulder height.',
      hold: 'Bend your right knee over your ankle. Gaze over your right fingertips. Shoulders stay relaxed, away from your ears.',
      breathe: 'Breathe steadily. Hold your ground. Feel the power radiating from your center.',
      exit: 'Straighten your front leg and bring your feet together. Now the other side.',
    },
    poseKey: 'warrior2',
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

  seatedTwist: {
    id: 'seatedTwist',
    sanskrit: 'Ardha Matsyendrasana',
    english: 'Seated Spinal Twist',
    icon: 'autorenew',
    durationSeconds: 45,
    category: 'seated',
    level: 'Beginner',
    doshaAffinity: { vata: 'neutral', pitta: 'balancing', kapha: 'balancing' },
    bodyParts: ['Spine', 'Obliques', 'Hips', 'Shoulders'],
    benefits: ['Improves spinal mobility', 'Aids digestion', 'Detoxifies organs', 'Relieves back tension'],
    reasoning: 'Twists wring out tension and stagnation from the spine and internal organs. For Pitta, they cool the digestive fire to its optimal level. For Kapha, they stimulate sluggish energy.',
    voiceCues: {
      enter: 'Sit with both legs extended. Bend your right knee and cross it over your left leg. Place your right hand behind you.',
      hold: 'Inhale to lengthen your spine. Exhale and twist to the right, bringing your left elbow to the outside of your right knee.',
      breathe: 'Each inhale, grow taller. Each exhale, twist a little deeper. Never force it.',
      exit: 'Release the twist slowly. Come back to center. We will do the other side.',
    },
    poseKey: 'seatedTwist',
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

  paschimottanasana: {
    id: 'paschimottanasana',
    sanskrit: 'Paschimottanasana',
    english: 'Seated Forward Bend',
    icon: 'south',
    durationSeconds: 90,
    category: 'seated',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'neutral' },
    bodyParts: ['Hamstrings', 'Spine', 'Shoulders'],
    benefits: ['Deep hamstring stretch', 'Calms anxiety', 'Stimulates digestion', 'Soothes the adrenals'],
    reasoning: 'This classic Ayurvedic pose directly soothes Vata by compressing the abdomen and calming the nervous system. It is prescribed in ancient texts as a remedy for restlessness.',
    voiceCues: {
      enter: 'Sit with your legs extended in front of you. Flex your feet. Inhale and raise your arms overhead.',
      hold: 'Exhale and fold forward from your hips, reaching for your shins, ankles, or feet. Keep your spine long rather than rounding.',
      breathe: 'With every exhale, release a little deeper. Do not pull yourself forward — let gravity do the work.',
      exit: 'Inhale and slowly walk your hands back, returning to a seated position.',
    },
    poseKey: 'forwardBend',
  },

  // ── Restorative & Floor Poses ───────────────────────────────────────────
  balasana: {
    id: 'balasana',
    sanskrit: 'Balasana',
    english: "Child's Pose",
    icon: 'spa',
    durationSeconds: 120,
    category: 'restorative',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'neutral' },
    bodyParts: ['Lower Back', 'Hips', 'Ankles', 'Shoulders'],
    benefits: ['Calms the mind deeply', 'Stretches lower back', 'Relieves fatigue', 'Activates rest-and-digest'],
    reasoning: 'The ultimate surrender pose. Balasana activates the parasympathetic nervous system, telling your body it is safe. Particularly healing for Vata anxiety and Pitta overwork.',
    voiceCues: {
      enter: 'Come to your hands and knees. Bring your big toes together and spread your knees wide.',
      hold: 'Sit your hips back toward your heels. Rest your forehead on the mat. Arms can extend forward or rest alongside your body.',
      breathe: 'Breathe deeply into your lower back. Feel it expand like a balloon with each inhale. Let everything soften.',
      exit: 'Slowly walk your hands back and rise to a kneeling position.',
    },
    poseKey: 'balasana',
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

  savasana: {
    id: 'savasana',
    sanskrit: 'Savasana',
    english: 'Corpse Pose',
    icon: 'bedtime',
    durationSeconds: 180,
    category: 'supine',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'neutral' },
    bodyParts: ['Full Body', 'Nervous System'],
    benefits: ['Total body relaxation', 'Integrates practice benefits', 'Reduces blood pressure', 'Restores the nervous system'],
    reasoning: 'Often called the hardest pose in yoga — doing nothing. Savasana allows the body to absorb the benefits of every pose that came before. It is the most important pose in your practice.',
    voiceCues: {
      enter: 'Lie flat on your back. Let your feet fall open. Place your arms by your sides, palms facing up. Close your eyes.',
      hold: 'Release all effort. Let the ground hold you completely. There is nothing to do, nowhere to be.',
      breathe: 'Let your breath become natural. No controlling, no counting. Just being.',
      exit: 'Begin to deepen your breath. Wiggle your fingers and toes. Roll to your right side. Gently press yourself up to seated.',
    },
    poseKey: 'savasana',
  },

  // ── Backbends ───────────────────────────────────────────────────────────
  cobra: {
    id: 'cobra',
    sanskrit: 'Bhujangasana',
    english: 'Cobra Pose',
    icon: 'trending_up',
    durationSeconds: 45,
    category: 'prone',
    level: 'Beginner',
    doshaAffinity: { vata: 'neutral', pitta: 'neutral', kapha: 'balancing' },
    bodyParts: ['Spine', 'Chest', 'Shoulders', 'Core'],
    benefits: ['Opens the chest', 'Strengthens the spine', 'Elevates mood', 'Stimulates energy'],
    reasoning: 'Backbends are heart-openers that combat Kapha heaviness and lethargy. Cobra gently energizes the spine and awakens the body, making it ideal for morning routines or low-energy days.',
    voiceCues: {
      enter: 'Lie face down. Place your palms under your shoulders. Elbows close to your body.',
      hold: 'Inhale and lift your chest off the mat using your back muscles — not your hands. Keep your elbows slightly bent. Shoulders away from ears.',
      breathe: 'Breathe into your open chest. Feel your heart lifting forward and up.',
      exit: 'Exhale and slowly lower your chest to the mat. Turn your head to one side and rest.',
    },
    poseKey: 'cobra',
  },

  bridge: {
    id: 'bridge',
    sanskrit: 'Setu Bandhasana',
    english: 'Bridge Pose',
    icon: 'trending_up',
    durationSeconds: 60,
    category: 'supine',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'neutral', kapha: 'balancing' },
    bodyParts: ['Glutes', 'Spine', 'Chest', 'Thighs'],
    benefits: ['Strengthens glutes and legs', 'Opens chest and shoulders', 'Energizes the body', 'Improves digestion'],
    reasoning: 'Bridge lifts the heart above the head, creating a gentle inversion that calms Vata while the muscular engagement stimulates Kapha. A versatile pose that serves all constitutions.',
    voiceCues: {
      enter: 'Lie on your back, bend your knees, and place your feet hip-width apart, close to your hips. Arms alongside your body.',
      hold: 'Press into your feet and lift your hips toward the ceiling. Interlace your hands beneath you if comfortable. Roll your shoulders under.',
      breathe: 'Breathe deeply into your chest. Feel the front of your body opening with each inhale.',
      exit: 'Release your hands. Slowly lower your spine to the mat, one vertebra at a time.',
    },
    poseKey: 'bridge',
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
  downwardDog: {
    id: 'downwardDog',
    sanskrit: 'Adho Mukha Svanasana',
    english: 'Downward-Facing Dog',
    icon: 'pets',
    durationSeconds: 60,
    category: 'inversion',
    level: 'Beginner',
    doshaAffinity: { vata: 'balancing', pitta: 'balancing', kapha: 'balancing' },
    bodyParts: ['Shoulders', 'Hamstrings', 'Calves', 'Arms', 'Spine'],
    benefits: ['Strengthens arms and legs', 'Stretches the whole back body', 'Calms the brain', 'Energizes the body'],
    reasoning: 'A cornerstone of yoga that works as both an energizer and a resting pose. The inversion brings fresh blood to the brain while the long stretch releases tension stored in the back body.',
    voiceCues: {
      enter: 'Come to all fours. Tuck your toes and lift your hips up and back. Your body forms an inverted V shape.',
      hold: 'Press your palms into the mat. Let your head hang between your arms. Pedal your feet to loosen your hamstrings.',
      breathe: 'Breathe evenly. With each exhale, press your chest gently toward your thighs.',
      exit: 'Bend your knees and lower down gently.',
    },
    poseKey: 'downwardDog',
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
      { id: 'cobra', time: '06:42', customDuration: 45 },
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
      { id: 'seatedTwist', time: '07:12', customDuration: 45 },
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
  if (affinity === 'balancing') return { label: 'Balancing', color: 'bg-green-100 text-green-700' }
  if (affinity === 'aggravating') return { label: 'Caution', color: 'bg-red-100 text-red-700' }
  return { label: 'Neutral', color: 'bg-gray-100 text-gray-500' }
}
