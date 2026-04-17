// ─── Recommendation Engine ───────────────────────────────────────────────────
// Each entry maps keywords → a curated set of yoga/ayurvedic recommendations.
// The engine scores each entry by how many keywords match the user's query.

const RECOMMENDATIONS = [
  {
    id: 'lower-back',
    keywords: ['lower back', 'back pain', 'lumbar', 'backache', 'spine', 'spinal'],
    label: 'Lower Back Relief',
    icon: 'accessibility_new',
    color: 'from-[#6b8f5e] to-[#b8d4a8]',
    description: 'Gentle poses that decompress the spine, release tension in the lumbar region, and strengthen the core to prevent future discomfort.',
    practices: [
      { title: 'Cat-Cow Stretch', subtitle: 'Marjaryasana-Bitilasana', duration: '3 min', level: 'Beginner', icon: 'self_care', description: 'Gentle spinal flexion and extension to warm up the lower back and release stiffness.' },
      { title: 'Supine Twist', subtitle: 'Supta Matsyendrasana', duration: '4 min', level: 'Beginner', icon: 'rotate_right', description: 'A reclined twist that releases the lower back and decompresses the spine with gravity\'s help.' },
      { title: 'Child\'s Pose', subtitle: 'Balasana', duration: '3 min', level: 'Beginner', icon: 'spa', description: 'A resting pose that gently stretches the lower back and hips while calming the nervous system.' },
      { title: 'Bridge Pose', subtitle: 'Setu Bandhasana', duration: '3 min', level: 'Intermediate', icon: 'landscape', description: 'Strengthens the glutes and core to support the lower back, while gently opening the chest.' },
      { title: 'Pigeon Pose', subtitle: 'Eka Pada Rajakapotasana', duration: '5 min', level: 'Intermediate', icon: 'self_care', description: 'A deep hip opener that releases tension that often refers pain to the lower back.' },
    ],
    ayurvedicTip: 'Warm sesame oil self-massage (Abhyanga) on the lower back before practice calms Vata and eases stiffness.',
    breathwork: { title: 'Dirga Pranayama', subtitle: 'Three-Part Breath · 3 min', description: 'Deep belly breathing that relaxes the psoas and lower back muscles.' },
  },
  {
    id: 'headache',
    keywords: ['headache', 'head pain', 'migraine', 'head ache', 'temple', 'tension headache'],
    label: 'Headache Relief',
    icon: 'psychology',
    color: 'from-[#7b93a8] to-[#b8d4e8]',
    description: 'Calming practices that release tension from the neck, shoulders, and skull — the root cause of most headaches.',
    practices: [
      { title: 'Neck Rolls', subtitle: 'Greeva Sanchalana', duration: '2 min', level: 'Beginner', icon: 'rotate_right', description: 'Gentle circular neck movements to release tension in the cervical spine and jaw.' },
      { title: 'Forward Fold', subtitle: 'Uttanasana', duration: '3 min', level: 'Beginner', icon: 'south', description: 'Inverted blood flow to the head relieves pressure and calms the nervous system.' },
      { title: 'Legs Up the Wall', subtitle: 'Viparita Karani', duration: '7 min', level: 'Beginner', icon: 'vertical_align_top', description: 'A restorative inversion that reduces blood pressure and soothes the mind.' },
      { title: 'Seated Eagle Arms', subtitle: 'Garudasana Arms', duration: '3 min', level: 'Beginner', icon: 'self_care', description: 'Deep stretch between the shoulder blades that releases upper back and neck tension.' },
    ],
    ayurvedicTip: 'Apply a drop of peppermint or eucalyptus oil to the temples. Pitta-type headaches benefit from cooling cucumber on closed eyes.',
    breathwork: { title: 'Sheetali Pranayama', subtitle: 'Cooling Breath · 3 min', description: 'A cooling breathwork technique that reduces heat in the head and soothes Pitta aggravation.' },
  },
  {
    id: 'anxiety',
    keywords: ['anxiety', 'anxious', 'worry', 'panic', 'nervous', 'overwhelmed', 'overthinking', 'racing thoughts', 'restless'],
    label: 'Calm Anxiety',
    icon: 'cloud',
    color: 'from-[#8b7ba8] to-[#c8b8e8]',
    description: 'Grounding practices that anchor you to the present moment and calm the Vata-driven whirlwind of the anxious mind.',
    practices: [
      { title: 'Grounding Mountain', subtitle: 'Tadasana', duration: '2 min', level: 'Beginner', icon: 'landscape', description: 'Stand rooted and feel gravity. A simple but powerful practice of present-moment awareness.' },
      { title: 'Child\'s Pose', subtitle: 'Balasana', duration: '3 min', level: 'Beginner', icon: 'spa', description: 'Folding inward activates the parasympathetic nervous system and signals safety.' },
      { title: 'Warrior II', subtitle: 'Virabhadrasana II', duration: '4 min', level: 'Beginner', icon: 'fitness_center', description: 'A strong, grounded posture that builds confidence and channels anxious energy.' },
      { title: 'Yoga Nidra', subtitle: 'Yogic Sleep', duration: '15 min', level: 'Beginner', icon: 'bedtime', description: 'Guided deep relaxation that activates the body\'s natural calm response. Profoundly effective.' },
    ],
    ayurvedicTip: 'Ashwagandha in warm milk with a pinch of nutmeg calms Vata. Avoid caffeine and cold foods which aggravate anxiety.',
    breathwork: { title: 'Nadi Shodhana', subtitle: 'Alternate Nostril Breathing · 5 min', description: 'Balances the left and right hemispheres, instantly calming the nervous system.' },
  },
  {
    id: 'neck-shoulder',
    keywords: ['neck', 'shoulder', 'neck pain', 'shoulder pain', 'stiff neck', 'shoulder tension', 'upper back', 'trapezius', 'desk', 'computer'],
    label: 'Neck & Shoulder Release',
    icon: 'accessibility_new',
    color: 'from-[#a87b5e] to-[#e8c8a8]',
    description: 'Targeted stretches for the neck, shoulders, and upper back — where most of us carry the weight of our digital lives.',
    practices: [
      { title: 'Neck Stretches', subtitle: 'Ear-to-Shoulder', duration: '3 min', level: 'Beginner', icon: 'rotate_right', description: 'Simple lateral neck stretches that release the SCM and upper trapezius muscles.' },
      { title: 'Thread the Needle', subtitle: 'Parsva Balasana', duration: '4 min', level: 'Beginner', icon: 'self_care', description: 'A gentle twist that opens the shoulders and releases deep tension between the blades.' },
      { title: 'Eagle Arms', subtitle: 'Garudasana Arms', duration: '3 min', level: 'Beginner', icon: 'self_care', description: 'Wrapping the arms creates a deep stretch across the entire upper back and shoulders.' },
      { title: 'Supported Fish Pose', subtitle: 'Matsyasana', duration: '5 min', level: 'Beginner', icon: 'spa', description: 'A restorative heart-opener that reverses the forward hunch of desk life.' },
    ],
    ayurvedicTip: 'Apply warm castor oil to the neck and shoulders before bed. A warm towel compress for 5 minutes works wonders.',
    breathwork: { title: 'Ujjayi Breath', subtitle: 'Ocean Breath · 3 min', description: 'The gentle throat constriction releases jaw and neck tension while calming the mind.' },
  },
  {
    id: 'insomnia',
    keywords: ['sleep', 'insomnia', 'can\'t sleep', 'sleepless', 'restless', 'wake up', 'tired', 'fatigue', 'exhausted', 'wired'],
    label: 'Deep Sleep Preparation',
    icon: 'bedtime',
    color: 'from-[#5e6b8f] to-[#a8b8d4]',
    description: 'A wind-down sequence that tells your nervous system it\'s time to let go. Best practised 30 minutes before bed.',
    practices: [
      { title: 'Legs Up the Wall', subtitle: 'Viparita Karani', duration: '7 min', level: 'Beginner', icon: 'vertical_align_top', description: 'Drains lymph, calms the heart rate, and signals the body that it\'s safe to rest.' },
      { title: 'Reclined Butterfly', subtitle: 'Supta Baddha Konasana', duration: '5 min', level: 'Beginner', icon: 'spa', description: 'Opens the hips and chest, releasing the day\'s accumulated tension.' },
      { title: 'Forward Fold', subtitle: 'Paschimottanasana', duration: '3 min', level: 'Beginner', icon: 'south', description: 'A calming seated fold that compresses the belly and activates the vagus nerve.' },
      { title: 'Yoga Nidra', subtitle: 'Yogic Sleep', duration: '20 min', level: 'Beginner', icon: 'bedtime', description: 'Guided body-scan meditation that takes you to the edge of sleep. Many drift off during practice.' },
    ],
    ayurvedicTip: 'Golden milk (turmeric + warm milk + cardamom) 30 minutes before bed. Massage the soles of your feet with warm ghee.',
    breathwork: { title: 'Bhramari', subtitle: 'Humming Bee Breath · 5 min', description: 'The vibration of humming activates the parasympathetic nervous system and induces drowsiness.' },
  },
  {
    id: 'digestion',
    keywords: ['digestion', 'bloating', 'bloated', 'stomach', 'gut', 'constipation', 'ibs', 'gas', 'indigestion', 'acid', 'nausea', 'belly'],
    label: 'Digestive Wellness',
    icon: 'gastroenterology',
    color: 'from-[#8f8b5e] to-[#d4d0a8]',
    description: 'Twists, compressions, and breathing techniques that stimulate Agni (digestive fire) and move things along naturally.',
    practices: [
      { title: 'Seated Twist', subtitle: 'Ardha Matsyendrasana', duration: '4 min', level: 'Beginner', icon: 'rotate_right', description: 'Wringing out the abdominal organs to stimulate digestion and release trapped gas.' },
      { title: 'Wind-Relieving Pose', subtitle: 'Pawanmuktasana', duration: '3 min', level: 'Beginner', icon: 'self_care', description: 'Exactly what it sounds like. Compresses the ascending and descending colon.' },
      { title: 'Cat-Cow', subtitle: 'Marjaryasana-Bitilasana', duration: '3 min', level: 'Beginner', icon: 'self_care', description: 'Rhythmic abdominal movement that massages the internal organs and improves motility.' },
      { title: 'Supine Twist', subtitle: 'Jathara Parivartanasana', duration: '4 min', level: 'Beginner', icon: 'rotate_right', description: 'A gentle reclined twist that stimulates the liver, spleen, and intestines.' },
    ],
    ayurvedicTip: 'Sip warm water with fresh ginger and lemon 20 minutes before meals. Avoid cold drinks during and after eating.',
    breathwork: { title: 'Kapalabhati', subtitle: 'Skull-Shining Breath · 3 min', description: 'Rapid abdominal contractions that stoke the digestive fire and clear stagnation.' },
  },
  {
    id: 'hip-pain',
    keywords: ['hip', 'hip pain', 'tight hips', 'hip opener', 'sciatica', 'si joint', 'pelvis', 'glute'],
    label: 'Hip Opening',
    icon: 'self_care',
    color: 'from-[#8f5e6b] to-[#d4a8b8]',
    description: 'Deep hip openers that release stored tension and emotion. The hips are the body\'s emotional junk drawer — let\'s clean it out.',
    practices: [
      { title: 'Pigeon Pose', subtitle: 'Eka Pada Rajakapotasana', duration: '5 min', level: 'Intermediate', icon: 'self_care', description: 'The king of hip openers. Releases the piriformis and deep external rotators.' },
      { title: 'Lizard Pose', subtitle: 'Utthan Pristhasana', duration: '4 min', level: 'Intermediate', icon: 'self_care', description: 'A deep lunge that targets the hip flexors and inner groin.' },
      { title: 'Reclined Butterfly', subtitle: 'Supta Baddha Konasana', duration: '5 min', level: 'Beginner', icon: 'spa', description: 'A gentle, gravity-assisted inner hip opener. Let the knees fall open and breathe.' },
      { title: 'Happy Baby', subtitle: 'Ananda Balasana', duration: '3 min', level: 'Beginner', icon: 'child_care', description: 'Opens the hips and inner groin while gently decompressing the lower back.' },
      { title: 'Low Lunge', subtitle: 'Anjaneyasana', duration: '4 min', level: 'Beginner', icon: 'self_care', description: 'Stretches the hip flexors and psoas — the muscle most punished by sitting.' },
    ],
    ayurvedicTip: 'Warm sesame oil massage on the hips and lower back before practice increases circulation and eases stiffness.',
    breathwork: { title: 'Dirga Pranayama', subtitle: 'Three-Part Breath · 3 min', description: 'Deep abdominal breathing that relaxes the psoas and creates space in the pelvis.' },
  },
  {
    id: 'focus',
    keywords: ['focus', 'concentration', 'brain fog', 'distracted', 'attention', 'clarity', 'mental', 'foggy', 'scattered', 'productivity'],
    label: 'Mental Clarity',
    icon: 'lightbulb',
    color: 'from-[#c47a3a] to-[#f0c987]',
    description: 'Practices that sharpen the mind, clear brain fog, and create laser focus. Your Pitta-powered concentration toolkit.',
    practices: [
      { title: 'Sun Salutation', subtitle: 'Surya Namaskar', duration: '10 min', level: 'Beginner', icon: 'wb_sunny', description: 'A rhythmic flow that wakes up the entire body and floods the brain with oxygen.' },
      { title: 'Eagle Pose', subtitle: 'Garudasana', duration: '3 min', level: 'Intermediate', icon: 'self_care', description: 'Requires intense concentration to balance — trains single-pointed focus.' },
      { title: 'Tree Pose', subtitle: 'Vrksasana', duration: '3 min', level: 'Beginner', icon: 'park', description: 'A balancing pose that forces the mind to become still and present.' },
      { title: 'Trataka', subtitle: 'Candle Gazing', duration: '5 min', level: 'Beginner', icon: 'visibility', description: 'Fixed-gaze meditation on a candle flame. The classic Yogic technique for concentration.' },
    ],
    ayurvedicTip: 'Brahmi tea or ghee-roasted almonds enhance Medhya (intellect). Avoid heavy meals before work that requires focus.',
    breathwork: { title: 'Kapalabhati', subtitle: 'Skull-Shining Breath · 3 min', description: 'Rapid exhalations that oxygenate the brain and burn through mental fog.' },
  },
  {
    id: 'knee-pain',
    keywords: ['knee', 'knee pain', 'joint', 'joint pain', 'arthritis', 'stiff joints', 'creaky'],
    label: 'Knee & Joint Care',
    icon: 'medical_information',
    color: 'from-[#5e8f7b] to-[#a8d4c8]',
    description: 'Gentle movements that strengthen the muscles around the knee and improve synovial fluid circulation — without strain.',
    practices: [
      { title: 'Chair Pose', subtitle: 'Utkatasana (Modified)', duration: '3 min', level: 'Beginner', icon: 'event_seat', description: 'A gentle squat against the wall that strengthens the quadriceps to support the knee.' },
      { title: 'Warrior I', subtitle: 'Virabhadrasana I', duration: '4 min', level: 'Beginner', icon: 'fitness_center', description: 'Strengthens the muscles around the knee joint with controlled alignment.' },
      { title: 'Reclined Leg Stretch', subtitle: 'Supta Padangusthasana', duration: '4 min', level: 'Beginner', icon: 'self_care', description: 'Stretches the hamstrings without any load on the knee joint.' },
      { title: 'Seated Leg Extensions', subtitle: 'Dandasana Variation', duration: '3 min', level: 'Beginner', icon: 'self_care', description: 'Isometric quad strengthening that builds the VMO muscle for knee stability.' },
    ],
    ayurvedicTip: 'Warm castor oil pack on the knee for 20 minutes reduces Vata-type joint pain. Turmeric milk (Golden Latte) reduces inflammation.',
    breathwork: { title: 'Dirga Pranayama', subtitle: 'Three-Part Breath · 3 min', description: 'Deep relaxation breathing that reduces pain perception and promotes healing.' },
  },
  {
    id: 'energy-boost',
    keywords: ['energy', 'low energy', 'sluggish', 'lazy', 'lethargic', 'motivation', 'morning', 'wake up', 'boost'],
    label: 'Energy Activation',
    icon: 'bolt',
    color: 'from-[#c4873a] to-[#f0d087]',
    description: 'Fire up your Prana (life force) with invigorating practices that transform sluggishness into vibrant energy.',
    practices: [
      { title: 'Sun Salutation', subtitle: 'Surya Namaskar', duration: '12 min', level: 'Beginner', icon: 'wb_sunny', description: '5 rounds of the classic energizing flow. Each round builds heat and vitality.' },
      { title: 'Warrior III', subtitle: 'Virabhadrasana III', duration: '3 min', level: 'Intermediate', icon: 'fitness_center', description: 'A powerful balancing pose that demands full-body engagement and presence.' },
      { title: 'Camel Pose', subtitle: 'Ustrasana', duration: '3 min', level: 'Intermediate', icon: 'self_care', description: 'A deep backbend that opens the chest and stimulates the adrenal glands.' },
      { title: 'Chair Pose', subtitle: 'Utkatasana', duration: '2 min', level: 'Beginner', icon: 'event_seat', description: 'Burns through Kapha lethargy and activates the legs, core, and willpower.' },
    ],
    ayurvedicTip: 'Ginger-honey-lemon water first thing in the morning ignites Agni. Avoid napping during the day — it increases Kapha.',
    breathwork: { title: 'Bhastrika', subtitle: 'Bellows Breath · 3 min', description: 'Rapid, forceful breathing that floods the system with oxygen and prana. Instant energy.' },
  },
  {
    id: 'posture',
    keywords: ['posture', 'hunch', 'slouch', 'rounded shoulders', 'forward head', 'kyphosis', 'text neck'],
    label: 'Posture Correction',
    icon: 'straighten',
    color: 'from-[#5e7b8f] to-[#a8c8d4]',
    description: 'Strengthen the muscles of good posture and release the ones pulling you forward. Undo years of screen time.',
    practices: [
      { title: 'Cobra Pose', subtitle: 'Bhujangasana', duration: '3 min', level: 'Beginner', icon: 'self_care', description: 'Strengthens the spinal erectors and opens the chest to counteract forward rounding.' },
      { title: 'Locust Pose', subtitle: 'Salabhasana', duration: '3 min', level: 'Beginner', icon: 'self_care', description: 'Strengthens the entire posterior chain — the muscles that hold you upright.' },
      { title: 'Supported Fish Pose', subtitle: 'Matsyasana', duration: '5 min', level: 'Beginner', icon: 'spa', description: 'A passive chest opener using a rolled towel. Reverses desk posture effortlessly.' },
      { title: 'Wall Angels', subtitle: 'Standing Scapular Retraction', duration: '3 min', level: 'Beginner', icon: 'straighten', description: 'Retrains the shoulder blades to sit flat against the ribcage. Simple but transformative.' },
    ],
    ayurvedicTip: 'Spend 2 minutes in Tadasana (Mountain Pose) after every hour of sitting. Awareness is the first medicine.',
    breathwork: { title: 'Ujjayi Breath', subtitle: 'Ocean Breath · 3 min', description: 'Encourages an upright, proud posture through the natural lift of deep chest breathing.' },
  },
  {
    id: 'period-pain',
    keywords: ['period', 'menstrual', 'cramps', 'pms', 'cycle', 'menstruation', 'period pain'],
    excludeGender: ['male'],
    label: 'Menstrual Comfort',
    icon: 'spa',
    color: 'from-[#a85e7b] to-[#e8a8c8]',
    description: 'Gentle, restorative practices that honor your cycle and ease cramps, bloating, and mood shifts naturally.',
    practices: [
      { title: 'Reclined Butterfly', subtitle: 'Supta Baddha Konasana', duration: '5 min', level: 'Beginner', icon: 'spa', description: 'Opens the pelvis and encourages blood flow. Use a bolster under the back for extra comfort.' },
      { title: 'Child\'s Pose', subtitle: 'Balasana (Wide Knee)', duration: '4 min', level: 'Beginner', icon: 'spa', description: 'A wide-knee variation that creates space for the belly and gently stretches the lower back.' },
      { title: 'Supine Twist', subtitle: 'Supta Matsyendrasana', duration: '4 min', level: 'Beginner', icon: 'rotate_right', description: 'A gentle twist that eases lower back pain and reduces bloating.' },
      { title: 'Legs Up the Wall', subtitle: 'Viparita Karani', duration: '7 min', level: 'Beginner', icon: 'vertical_align_top', description: 'Reduces pelvic congestion and soothes the nervous system. Deeply restorative.' },
    ],
    ayurvedicTip: 'Warm cumin-coriander-fennel tea reduces Vata and eases cramps. A hot water bottle on the lower belly is Ayurveda\'s oldest friend.',
    breathwork: { title: 'Nadi Shodhana', subtitle: 'Alternate Nostril Breathing · 5 min', description: 'Balances hormonal fluctuations and brings a sense of equilibrium during your cycle.' },
  },
]

// ─── Popular Searches ────────────────────────────────────────────────────────

export const POPULAR_SEARCHES = [
  { query: 'Lower back pain', icon: 'accessibility_new' },
  { query: 'Headache', icon: 'psychology' },
  { query: 'Can\'t sleep', icon: 'bedtime' },
  { query: 'Anxiety', icon: 'cloud' },
  { query: 'Neck pain', icon: 'accessibility_new' },
  { query: 'Tight hips', icon: 'self_care' },
  { query: 'Low energy', icon: 'bolt' },
  { query: 'Bloating', icon: 'gastroenterology' },
]

// ─── Synonym Map ────────────────────────────────────────────────────────────
// Maps common natural-language terms to recommendation IDs they should match.
// This catches queries the keyword list alone would miss.

const SYNONYMS = {
  // Pain locations → closest recommendation
  'toe': 'knee-pain', 'foot': 'knee-pain', 'feet': 'knee-pain', 'ankle': 'knee-pain',
  'wrist': 'neck-shoulder', 'hand': 'neck-shoulder', 'arm': 'neck-shoulder', 'elbow': 'neck-shoulder',
  'chest': 'posture', 'rib': 'posture', 'thoracic': 'posture',
  'jaw': 'headache', 'tooth': 'headache', 'toothache': 'headache', 'teeth': 'headache', 'tmj': 'headache', 'face': 'headache',
  'eye': 'headache', 'eyes': 'headache', 'sinus': 'headache',
  'leg': 'knee-pain', 'calf': 'knee-pain', 'shin': 'knee-pain', 'thigh': 'hip-pain',
  'groin': 'hip-pain', 'hamstring': 'hip-pain', 'butt': 'hip-pain', 'glutes': 'hip-pain', 'buttock': 'hip-pain',
  'back': 'lower-back', 'lower back': 'lower-back', 'upper back': 'neck-shoulder',

  // Emotional / mental states
  'stress': 'anxiety', 'stressed': 'anxiety', 'tense': 'anxiety', 'tension': 'anxiety',
  'sad': 'anxiety', 'depressed': 'anxiety', 'depression': 'anxiety', 'low mood': 'anxiety', 'mood': 'anxiety',
  'angry': 'anxiety', 'irritable': 'anxiety', 'frustrated': 'anxiety', 'anger': 'anxiety',
  'burnout': 'energy-boost', 'burnt out': 'energy-boost', 'drained': 'energy-boost',
  'calm': 'anxiety', 'relax': 'anxiety', 'relaxation': 'anxiety', 'peace': 'anxiety',
  'meditate': 'focus', 'meditation': 'focus', 'mindful': 'focus', 'mindfulness': 'focus',

  // Physical conditions
  'pain': 'lower-back', 'ache': 'lower-back', 'sore': 'lower-back', 'stiff': 'lower-back', 'stiffness': 'lower-back',
  'cramp': 'digestion', 'spasm': 'lower-back',
  'tight': 'hip-pain', 'tightness': 'hip-pain', 'flexibility': 'hip-pain',
  'swelling': 'knee-pain', 'swollen': 'knee-pain', 'inflammation': 'knee-pain',
  'numb': 'neck-shoulder', 'tingling': 'neck-shoulder', 'pins and needles': 'neck-shoulder',
  'sciatica': 'hip-pain', 'nerve': 'hip-pain', 'pinched': 'neck-shoulder',

  // Lifestyle
  'sitting': 'posture', 'desk': 'posture', 'office': 'posture', 'work': 'posture', 'screen': 'posture', 'phone': 'posture',
  'morning': 'energy-boost', 'wake': 'energy-boost', 'waking': 'energy-boost',
  'night': 'insomnia', 'bedtime': 'insomnia', 'evening': 'insomnia',
  'weight': 'energy-boost', 'fat': 'energy-boost', 'lose weight': 'energy-boost',
  'pregnant': 'hip-pain', 'pregnancy': 'hip-pain',
  'period': 'period-pain', 'pms': 'period-pain', 'menstrual': 'period-pain',

  // Digestion
  'stomach': 'digestion', 'belly': 'digestion', 'tummy': 'digestion', 'gut': 'digestion',
  'bloat': 'digestion', 'gassy': 'digestion', 'acidity': 'digestion', 'heartburn': 'digestion',
  'nausea': 'digestion', 'nauseous': 'digestion', 'sick': 'digestion',
  'constipated': 'digestion', 'diarrhea': 'digestion',

  // General
  'beginner': 'lower-back', 'start': 'energy-boost', 'new': 'energy-boost',
  'breathe': 'anxiety', 'breathing': 'anxiety', 'breath': 'anxiety',
}

// ─── Search Engine ───────────────────────────────────────────────────────────

export function searchRecommendations(query, { gender } = {}) {
  if (!query || query.trim().length < 2) return []

  const normalized = query.toLowerCase().trim()
  // Strip filler words for cleaner matching
  const fillers = ['i', 'have', 'a', 'my', 'me', 'is', 'am', 'the', 'in', 'on', 'and', 'or', 'very', 'really', 'so', 'some', 'get', 'got', 'feel', 'feeling', 'lot', 'of', 'with', 'been', 'having', 'from', "can't", 'cant', 'cannot']
  const words = normalized.split(/\s+/).filter(w => w.length >= 2 && !fillers.includes(w))

  const eligible = RECOMMENDATIONS
    .filter(rec => !gender || !rec.excludeGender || !rec.excludeGender.includes(gender))

  const scored = eligible.map(rec => {
    let score = 0

    // 1. Exact full-query match against keywords (highest weight)
    if (rec.keywords.some(k => normalized.includes(k) || k.includes(normalized))) {
      score += 10
    }

    // 2. Individual word matches against keywords
    words.forEach(word => {
      rec.keywords.forEach(keyword => {
        if (keyword === word) score += 5          // exact word match
        else if (keyword.includes(word)) score += 3  // partial match
        else if (word.includes(keyword)) score += 2  // query word contains keyword
      })
      // Also check label and description
      if (rec.label.toLowerCase().includes(word)) score += 2
      if (rec.description.toLowerCase().includes(word)) score += 1
    })

    // 3. Synonym boosting — check each query word against synonym map
    words.forEach(word => {
      const synonymTarget = SYNONYMS[word]
      if (synonymTarget && synonymTarget === rec.id) {
        score += 6
      }
    })
    // Also check multi-word synonym phrases
    Object.entries(SYNONYMS).forEach(([phrase, targetId]) => {
      if (phrase.includes(' ') && normalized.includes(phrase) && targetId === rec.id) {
        score += 8
      }
    })

    // 4. Check practice titles and subtitles (catches specific pose searches)
    words.forEach(word => {
      rec.practices.forEach(p => {
        if (p.title.toLowerCase().includes(word)) score += 2
        if (p.subtitle.toLowerCase().includes(word)) score += 2
      })
    })

    return { ...rec, score }
  })

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
}

export default RECOMMENDATIONS
