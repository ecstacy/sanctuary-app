// ─── SVG Yoga Pose Illustrations ────────────────────────────────────────────
// Detailed inline SVG illustrations for each yoga pose.
// Smooth morphing between poses using CSS transitions on the wrapper.

function PoseIllustration({ poseKey }) {
  // Each pose returns a detailed SVG figure
  const poses = {
    tadasana: (
      /* Mountain Pose — standing upright, arms at sides, grounded */
      <g>
        <circle cx="100" cy="28" r="14" fill="currentColor" opacity="0.85" />
        <path d="M100 42 L100 110" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        <path d="M100 55 L78 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M100 55 L122 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M100 110 L88 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <path d="M100 110 L112 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <ellipse cx="88" cy="168" rx="8" ry="3" fill="currentColor" opacity="0.5" />
        <ellipse cx="112" cy="168" rx="8" ry="3" fill="currentColor" opacity="0.5" />
        {/* Alignment lines */}
        <line x1="100" y1="175" x2="100" y2="185" stroke="currentColor" strokeWidth="1" opacity="0.15" strokeDasharray="2,2" />
      </g>
    ),

    warrior1: (
      /* Warrior I — deep lunge, arms raised overhead */
      <g>
        <circle cx="100" cy="25" r="14" fill="currentColor" opacity="0.85" />
        {/* Arms reaching up */}
        <path d="M90 40 L88 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M110 40 L112 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        {/* Palms together */}
        <ellipse cx="100" cy="5" rx="6" ry="4" fill="currentColor" opacity="0.3" />
        {/* Torso — slight back arch */}
        <path d="M100 38 Q102 70 100 100" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        {/* Front leg — deep bend */}
        <path d="M100 100 L75 120 L72 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" fill="none" />
        {/* Back leg — straight and extended */}
        <path d="M100 100 L135 135 L148 170" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" fill="none" />
        <ellipse cx="72" cy="168" rx="8" ry="3" fill="currentColor" opacity="0.5" />
        <ellipse cx="148" cy="173" rx="8" ry="3" fill="currentColor" opacity="0.5" />
      </g>
    ),

    warrior2: (
      /* Warrior II — wide stance, arms extended to sides */
      <g>
        <circle cx="100" cy="40" r="14" fill="currentColor" opacity="0.85" />
        {/* Arms extended wide */}
        <path d="M100 58 L38 58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M100 58 L162 58" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        {/* Fingertips */}
        <circle cx="35" cy="58" r="3" fill="currentColor" opacity="0.4" />
        <circle cx="165" cy="58" r="3" fill="currentColor" opacity="0.4" />
        {/* Torso upright */}
        <path d="M100 53 L100 105" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        {/* Front leg bent */}
        <path d="M100 105 L68 118 L60 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" fill="none" />
        {/* Back leg straight */}
        <path d="M100 105 L140 120 L155 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" fill="none" />
        <ellipse cx="60" cy="168" rx="8" ry="3" fill="currentColor" opacity="0.5" />
        <ellipse cx="155" cy="168" rx="8" ry="3" fill="currentColor" opacity="0.5" />
      </g>
    ),

    tree: (
      /* Tree Pose — standing on one leg, foot on thigh, arms overhead */
      <g>
        <circle cx="100" cy="22" r="14" fill="currentColor" opacity="0.85" />
        {/* Arms overhead in namaste */}
        <path d="M92 38 L88 5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M108 38 L112 5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <ellipse cx="100" cy="3" rx="5" ry="3" fill="currentColor" opacity="0.25" />
        {/* Torso */}
        <path d="M100 36 L100 105" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        {/* Standing leg */}
        <path d="M100 105 L100 168" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <ellipse cx="100" cy="171" rx="8" ry="3" fill="currentColor" opacity="0.5" />
        {/* Bent leg — foot on thigh */}
        <path d="M100 105 L120 115 L108 95" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" fill="none" />
      </g>
    ),

    uttanasana: (
      /* Standing Forward Fold — body folded at hips */
      <g>
        {/* Head hanging down */}
        <circle cx="95" cy="110" r="13" fill="currentColor" opacity="0.8" />
        {/* Torso folded */}
        <path d="M100 68 Q98 85 95 98" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        {/* Arms dangling */}
        <path d="M97 78 L85 115" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M99 78 L108 118" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        {/* Legs straight */}
        <path d="M100 68 L92 10" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <path d="M100 68 L108 10" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <ellipse cx="92" cy="7" rx="7" ry="3" fill="currentColor" opacity="0.5" />
        <ellipse cx="108" cy="7" rx="7" ry="3" fill="currentColor" opacity="0.5" />
        {/* Floor hint */}
        <line x1="70" y1="120" x2="130" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      </g>
    ),

    forwardBend: (
      /* Seated Forward Bend — legs extended, torso folded */
      <g>
        {/* Legs extended on floor */}
        <path d="M45 145 L150 145" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        {/* Torso folded over legs */}
        <path d="M80 145 Q90 130 100 120 Q110 110 115 105" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" fill="none" />
        {/* Head near knees */}
        <circle cx="118" cy="100" r="13" fill="currentColor" opacity="0.8" />
        {/* Arms reaching to feet */}
        <path d="M110 110 L145 140" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M108 115 L140 148" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        {/* Feet */}
        <ellipse cx="150" cy="142" rx="3" ry="7" fill="currentColor" opacity="0.5" />
        {/* Floor */}
        <line x1="30" y1="155" x2="170" y2="155" stroke="currentColor" strokeWidth="1" opacity="0.1" />
      </g>
    ),

    balasana: (
      /* Child's Pose — kneeling, torso folded, arms extended */
      <g>
        {/* Floor */}
        <line x1="25" y1="145" x2="175" y2="145" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {/* Knees and shins on floor */}
        <path d="M120 145 Q125 130 128 120" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" fill="none" />
        <path d="M135 145 Q138 130 140 120" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" fill="none" />
        {/* Hips sitting back */}
        <ellipse cx="134" cy="116" rx="12" ry="8" fill="currentColor" opacity="0.25" />
        {/* Torso curved forward along floor */}
        <path d="M128 118 Q105 112 85 118 Q72 125 65 132" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" opacity="0.8" fill="none" />
        {/* Head resting on floor */}
        <circle cx="60" cy="136" r="12" fill="currentColor" opacity="0.8" />
        {/* Arms extended forward */}
        <path d="M75 125 L38 138" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
        <path d="M78 130 L42 145" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.6" />
      </g>
    ),

    cobra: (
      /* Cobra Pose — prone with chest lifted */
      <g>
        {/* Floor */}
        <line x1="25" y1="155" x2="175" y2="155" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {/* Lower body on floor */}
        <path d="M140 150 L170 152" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        <path d="M140 152 L168 156" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        {/* Hips on floor */}
        <path d="M100 148 L145 150" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" opacity="0.75" />
        {/* Spine arching up */}
        <path d="M100 148 Q90 138 82 118 Q78 105 78 95" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" fill="none" />
        {/* Head lifted and looking forward */}
        <circle cx="78" cy="82" r="13" fill="currentColor" opacity="0.85" />
        {/* Arms supporting */}
        <path d="M88 120 L82 148" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M92 125 L98 148" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      </g>
    ),

    bridge: (
      /* Bridge Pose — supine with hips lifted */
      <g>
        {/* Floor */}
        <line x1="25" y1="155" x2="175" y2="155" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {/* Head and shoulders on floor */}
        <circle cx="45" cy="148" r="12" fill="currentColor" opacity="0.8" />
        <path d="M55 148 L65 142" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        {/* Spine arching up */}
        <path d="M65 142 Q90 100 120 105" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" fill="none" />
        {/* Hips lifted high */}
        <ellipse cx="105" cy="102" rx="10" ry="6" fill="currentColor" opacity="0.2" />
        {/* Legs bent, feet on floor */}
        <path d="M120 105 L140 130 L142 152" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" fill="none" />
        <path d="M115 108 L130 135 L128 152" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" fill="none" />
        {/* Arms by sides */}
        <path d="M62 140 L55 152" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
        <path d="M68 138 L70 152" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      </g>
    ),

    pigeon: (
      /* Pigeon Pose — front leg bent, back leg extended */
      <g>
        {/* Floor */}
        <line x1="15" y1="155" x2="185" y2="155" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {/* Back leg extended behind */}
        <path d="M110 140 L170 150" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        {/* Front shin on floor, bent */}
        <path d="M50 148 L90 148" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        {/* Hip area */}
        <path d="M90 148 Q100 135 110 140" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" fill="none" />
        {/* Torso upright */}
        <path d="M100 138 Q98 115 96 95" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" fill="none" />
        {/* Head */}
        <circle cx="96" cy="80" r="13" fill="currentColor" opacity="0.85" />
        {/* Arms relaxed */}
        <path d="M98 100 L78 130" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M100 100 L118 128" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      </g>
    ),

    sukhasana: (
      /* Easy Seated — cross-legged, hands on knees */
      <g>
        {/* Floor */}
        <line x1="40" y1="160" x2="160" y2="160" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {/* Crossed legs */}
        <path d="M75 155 Q100 140 125 155" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" fill="none" />
        <path d="M60 152 L80 145" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.65" />
        <path d="M140 152 L120 145" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.65" />
        {/* Torso upright */}
        <path d="M100 142 L100 82" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        {/* Head */}
        <circle cx="100" cy="68" r="14" fill="currentColor" opacity="0.85" />
        {/* Arms resting on knees */}
        <path d="M100 95 L72 135" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M100 95 L128 135" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        {/* Hands */}
        <circle cx="70" cy="137" r="4" fill="currentColor" opacity="0.35" />
        <circle cx="130" cy="137" r="4" fill="currentColor" opacity="0.35" />
      </g>
    ),

    seatedTwist: (
      /* Seated Twist — one knee bent, torso rotated */
      <g>
        <line x1="40" y1="160" x2="160" y2="160" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {/* Extended leg */}
        <path d="M65 155 L150 155" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        {/* Bent knee up */}
        <path d="M90 155 L85 120 L80 155" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" fill="none" />
        {/* Torso twisted */}
        <path d="M88 150 Q92 120 95 90" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" fill="none" />
        {/* Head turned */}
        <circle cx="100" cy="76" r="13" fill="currentColor" opacity="0.85" />
        {/* Back arm */}
        <path d="M95 100 L115 135" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        {/* Front arm across knee */}
        <path d="M93 105 L78 120" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      </g>
    ),

    supineTwist: (
      /* Supine Twist — lying down, knees to one side */
      <g>
        <line x1="20" y1="155" x2="180" y2="155" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {/* Body lying down */}
        <path d="M40 145 L120 145" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
        {/* Head */}
        <circle cx="35" cy="140" r="12" fill="currentColor" opacity="0.8" />
        {/* Arm extended to side */}
        <path d="M55 145 L30 120" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <path d="M55 145 L30 155" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        {/* Knees twisted to one side */}
        <path d="M120 145 L140 120 L145 105" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" fill="none" />
        <path d="M118 148 L135 125 L138 110" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" fill="none" />
      </g>
    ),

    savasana: (
      /* Corpse Pose — lying flat, arms and legs relaxed */
      <g>
        <line x1="10" y1="145" x2="190" y2="145" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {/* Body flat */}
        <path d="M55 132 L140 132" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" opacity="0.8" />
        {/* Head */}
        <circle cx="48" cy="130" r="13" fill="currentColor" opacity="0.8" />
        {/* Arms relaxed to sides, palms up */}
        <path d="M70 132 L62 150" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
        <path d="M125 132 L118 150" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
        <circle cx="60" cy="152" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="116" cy="152" r="3" fill="currentColor" opacity="0.3" />
        {/* Legs relaxed, feet falling open */}
        <path d="M140 132 L168 140" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        <path d="M140 134 L172 148" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
        {/* Peaceful aura */}
        <ellipse cx="100" cy="132" rx="65" ry="25" fill="currentColor" opacity="0.03" />
      </g>
    ),

    downwardDog: (
      /* Downward Dog — inverted V shape */
      <g>
        {/* Floor */}
        <line x1="25" y1="170" x2="175" y2="170" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {/* Arms — hands on floor, angled */}
        <path d="M55 165 L80 100" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
        <path d="M65 165 L85 100" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" opacity="0.7" />
        {/* Torso angling up */}
        <path d="M82 100 Q95 80 110 75" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" fill="none" />
        {/* Head hanging */}
        <circle cx="75" cy="108" r="11" fill="currentColor" opacity="0.75" />
        {/* Hips high — apex */}
        <ellipse cx="112" cy="72" rx="8" ry="5" fill="currentColor" opacity="0.15" />
        {/* Legs straight down to floor */}
        <path d="M110 75 L135 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <path d="M115 78 L145 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <ellipse cx="55" cy="168" rx="6" ry="3" fill="currentColor" opacity="0.4" />
        <ellipse cx="140" cy="168" rx="6" ry="3" fill="currentColor" opacity="0.4" />
      </g>
    ),

    legsUpWall: (
      /* Legs Up the Wall — lying down, legs vertical */
      <g>
        {/* Wall */}
        <line x1="155" y1="10" x2="155" y2="170" stroke="currentColor" strokeWidth="2" opacity="0.08" />
        {/* Floor */}
        <line x1="20" y1="155" x2="155" y2="155" stroke="currentColor" strokeWidth="1" opacity="0.1" />
        {/* Body flat on floor */}
        <path d="M50 145 L140 145" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" opacity="0.8" />
        {/* Head */}
        <circle cx="45" cy="142" r="12" fill="currentColor" opacity="0.8" />
        {/* Arms relaxed */}
        <path d="M70 145 L60 158" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        <path d="M120 145 L110 158" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        {/* Legs up the wall */}
        <path d="M140 145 L148 30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <path d="M138 148 L144 35" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
      </g>
    ),

    suryaNamaskar: (
      /* Sun Salutation — arms raised, slight backbend */
      <g>
        <circle cx="100" cy="28" r="14" fill="currentColor" opacity="0.85" />
        {/* Arms raised overhead in prayer */}
        <path d="M92 42 L86 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M108 42 L114 8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        {/* Fingertips */}
        <ellipse cx="100" cy="4" rx="6" ry="3" fill="currentColor" opacity="0.3" />
        {/* Torso — slight backbend */}
        <path d="M100 42 Q103 75 100 110" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.8" fill="none" />
        {/* Legs */}
        <path d="M100 110 L90 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <path d="M100 110 L110 165" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity="0.75" />
        <ellipse cx="90" cy="168" rx="7" ry="3" fill="currentColor" opacity="0.5" />
        <ellipse cx="110" cy="168" rx="7" ry="3" fill="currentColor" opacity="0.5" />
        {/* Sun rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <line
            key={angle}
            x1={100 + Math.cos(angle * Math.PI / 180) * 55}
            y1={90 + Math.sin(angle * Math.PI / 180) * 55}
            x2={100 + Math.cos(angle * Math.PI / 180) * 65}
            y2={90 + Math.sin(angle * Math.PI / 180) * 65}
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.08"
            strokeLinecap="round"
          />
        ))}
      </g>
    ),
  }

  return poses[poseKey] || poses.tadasana
}

// ─── Video Pose Map ─────────────────────────────────────────────────────────
// As videos are added, map poseKey → video file path.
// Poses without a video will fall back to the SVG illustration.
const POSE_VIDEOS = {
  tadasana: '/poses/tadasana.mp4',
}

export default function PoseFigure({ poseKey, size = 'lg', breathing = true }) {
  const videoSrc = POSE_VIDEOS[poseKey]
  const dimension = size === 'lg' ? 220 : 140

  // If a video exists for this pose, render the video player
  if (videoSrc) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="rounded-2xl overflow-hidden bg-surface-container shadow-lg"
          style={{ width: dimension, height: dimension }}
        >
          <video
            key={videoSrc}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>
    )
  }

  // Fallback: SVG illustration
  const svgDim = size === 'lg' ? 200 : 130
  return (
    <div className={`flex items-center justify-center ${breathing ? 'animate-pose-breathe' : ''}`}>
      <svg
        width={svgDim}
        height={svgDim}
        viewBox="0 0 200 185"
        fill="none"
        className="text-primary"
        style={{ transition: 'all 0.6s ease' }}
      >
        <PoseIllustration poseKey={poseKey} />
      </svg>
    </div>
  )
}
