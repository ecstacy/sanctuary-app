// ─────────────────────────────────────────────────────────────────────────────
//  DoshaGem — the current constitution as a real-time 3D glass vessel (WebGL).
//
//  A frosted glass egg holding the three dosha "liquids", stacked as translucent
//  colour zones sized to each dosha's percentage (dominant fills most, the
//  others band toward the edge) with soft, slowly-flowing boundaries — so an
//  80% Pitta / 20% Kapha reading shows a large terracotta zone and a clear green one.
//  Terracotta = Pitta, ocean-blue = Vata, sage-green = Kapha (the brand tokens,
//  luminous). Frozen under
//  prefers-reduced-motion, paused off-screen, WebGL-failure fallback.
//
//  Props: percentages {vata,pitta,kapha}|null, dominant string|null, size px.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// Dosha colours are ONE palette app-wide: the brand tokens
// (--color-vata/pitta/kapha, mirrored in DoshaProfileContent's DOSHA_DATA).
// The gem used to run its own violet/gold/teal set, which made the same dosha
// a different colour on Home than on the Dosha page — now unified (task #48).
// `base` matches the token exactly; deep/light are the dosha-page shades.
export const GEM_HUE = {
  vata:  { deep: '#2c5f79', base: '#35708f', light: '#6fa0b8' }, // ocean blue
  pitta: { deep: '#83471a', base: '#9e5720', light: '#c98a4e' }, // terracotta
  kapha: { deep: '#3a6130', base: '#467539', light: '#7ba86b' }, // sage green
}
// Liquid hues for the WebGL gem — the SAME blue/terracotta/green identity as the
// tokens, but used as ABSORPTION colours, not as flat fills. The shader runs
// Beer-Lambert absorption over the view-ray thickness, so these read deep and
// jewel-like through the body and glow bright where the glass thins at the rim.
// (Bright, pre-lit hues here were what made the old gem look like poster paint:
// with nothing to deepen them, every zone rendered as one flat colour.)
const GEM_LIQUID = {
  vata:  '#2b86c5', // ocean sapphire
  pitta: '#d9702a', // amber terracotta
  kapha: '#31a05c', // emerald sage
}
const DOSHAS = ['vata', 'pitta', 'kapha']

// Teardrop profile (radius, height) revolved into the gem — a sharp tip up top
// widening to a full, round bottom, matching the liquid-glass gem art. Height
// kept ~±1.35 so it fills the card the same as the old egg.
const PROFILE = [
  [0.001, 1.38], [0.17, 1.06], [0.34, 0.76], [0.52, 0.44], [0.68, 0.10],
  [0.82, -0.28], [0.92, -0.64], [0.965, -0.96], [0.86, -1.18], [0.52, -1.34], [0.001, -1.4],
]
const GEM_MAX_R = Math.max(...PROFILE.map(p => p[0]))
// Silhouette half-width (as a fraction of the widest point, 0..1) at a stacked
// band position u — u = 0 at the gem's bottom, 1 at the top, matching the
// shader's `u = y*0.42 + 0.5` fill axis. The legend uses this so each leader
// line ends exactly on the gem's edge at that band's height (the teardrop is
// narrow up top, wide low), instead of stopping at a fixed margin.
export function gemRadiusAtU(u) {
  const y = (Math.min(1, Math.max(0, u)) - 0.5) / 0.42
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [r0, y0] = PROFILE[i], [r1, y1] = PROFILE[i + 1]
    if (y <= y0 && y >= y1) {
      const t = (y0 - y) / ((y0 - y1) || 1)
      return (r0 + (r1 - r0) * t) / GEM_MAX_R
    }
  }
  return (y > PROFILE[0][1] ? PROFILE[0][0] : PROFILE[PROFILE.length - 1][0]) / GEM_MAX_R
}

const NOISE_GLSL = /* glsl */`
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + 2.0*C.xxx; vec3 x3 = x0 - 1.0 + 3.0*C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
         + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m*m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p){ float v=0.0, a=0.5; for(int i=0;i<3;i++){ v+=a*snoise(p); p*=2.0; a*=0.5; } return v; }
`

const VERT = /* glsl */`
varying vec3 vPos; varying vec3 vWorld; varying vec3 vNormalW;
void main(){
  vPos = position;
  vec4 wp = modelMatrix * vec4(position, 1.0); vWorld = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`

// Stacked liquid zones rendered as ABSORBING GLASS rather than painted bands.
//
//  The old version picked a flat zone colour, multiplied it by a depth ramp, then
//  ADDED specular/fresnel/sparkle on top and clamped — so every highlight clipped
//  to pure white and the body posterized into flat poster-paint regions.
//
//  This version is physically motivated, which is what actually reads as
//  "expensive glass":
//    • view-ray thickness through the body drives Beer-Lambert absorption, so the
//      colour DEEPENS with depth and thins to a luminous glow at the rim;
//    • light entering the far side is attenuated by that same absorption
//      (back-lit jewel core);
//    • highlights are energy-weighted by Fresnel and left in HDR — the renderer's
//      ACES filmic pass rolls them off instead of clipping to a white smudge;
//    • an ordered dither breaks up gradient banding on smooth glass.
const FRAG = /* glsl */`
precision highp float;
varying vec3 vPos; varying vec3 vWorld; varying vec3 vNormalW;
uniform float uTime;
uniform vec3 uCol0; uniform vec3 uCol1; uniform vec3 uCol2; // descending-% order (linear)
uniform float uT0; uniform float uT1;                        // cumulative thresholds
${NOISE_GLSL}
void main(){
  float t = uTime;
  vec3 pw = vPos * 1.1;
  // two low-freq fields drive a domain-warped swirl → slow, liquid motion
  float w1 = fbm(pw + vec3(0.0, -t*0.16, t*0.11));
  float w2 = fbm(pw*1.7 + vec3(t*0.14, t*0.09, 0.0));
  vec2 warp = vec2(w1, w2) - 0.5;

  // stack BOTTOM→TOP with a gently rippling meniscus. Small amplitude so a thin
  // band stays near its % position and its fixed leader line keeps pointing at it.
  float surf = 0.035*sin(vPos.x*2.4 + t*0.55) + 0.05*(w1 - 0.5);
  float u = clamp(vPos.y * 0.42 + 0.5 + surf, 0.0, 1.0);
  float e = 0.055;
  vec3 tint = uCol0;
  tint = mix(tint, uCol1, smoothstep(uT0 - e, uT0 + e, u));
  tint = mix(tint, uCol2, smoothstep(uT1 - e, uT1 + e, u));

  vec3 V = normalize(cameraPosition - vWorld);
  vec3 N = normalize(vNormalW);
  float ndv = clamp(dot(N, V), 0.0, 1.0);

  // ── Volume: how much liquid the eye looks through ─────────────────────────
  // Facing the body → a long path (deep, saturated); grazing the silhouette →
  // a short path (thin, luminous). Slight swirl variation keeps it organic.
  float thickness = pow(ndv, 0.72) * (0.92 + 0.16*(w2 - 0.5));

  // Art-directed depth ramp instead of raw Beer-Lambert (which drove the core
  // either to black, or — over-scattered — to milky pastel). We build two hues
  // from the zone tint: a RICH jewel version for the thick body, and a bright
  // GLOW version for the thin rim, then blend by thickness. This keeps the hue
  // saturated at every depth, which is what reads as "quality glass".
  float lum = dot(tint, vec3(0.299, 0.587, 0.114));
  // deep: darker AND pushed toward its own hue axis (tint/lum) → a rich, jewel
  // saturation for the body. glow: lifted but NOT toward white (that was the
  // pastel wash) — toward a bright version of the same hue, so the rim stays
  // coloured. Body leans mostly deep; only the thin edge picks up glow.
  vec3 hue = tint / max(lum, 0.001);
  vec3 deep = tint * mix(vec3(0.54), hue, 0.48);          // rich jewel, not neon
  vec3 glow = mix(tint, hue, 0.28) * 1.16;                // luminous, still coloured
  vec3 col = mix(glow, deep, smoothstep(0.15, 0.85, thickness));

  // Top-lit gradient: liquid catches light from above, so each zone is a touch
  // brighter at its crown and settles richer at its base — dimensional depth
  // rather than one flat fill.
  col *= mix(0.86, 1.12, smoothstep(-1.25, 1.15, vPos.y + 0.35*(w1 - 0.5)));

  // Internal swirl: subtle density variation so the body has slow-moving depth
  // without turning into marble.
  float swirl = fbm(pw*2.2 + vec3(warp*1.6, t*0.22));
  col *= mix(0.90, 1.12, smoothstep(0.35, 0.85, swirl));

  // A soft caustic pool low in the gem, where light focuses through the belly.
  float caustic = smoothstep(0.55, 0.0, u) * smoothstep(0.35, 0.95, ndv);
  col += glow * caustic * 0.22;

  // ── Surface: Fresnel-weighted reflection + specular, energy-weighted ───────
  float F = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);   // Schlick, glass F0 ≈ 0.04
  // Interior light is what survives; reflection takes the rest.
  col *= (1.0 - F * 0.55);

  vec3 L  = normalize(vec3(-0.55, 0.92, 0.62));  // key, upper-left
  vec3 L2 = normalize(vec3(0.75, 0.25, 0.45));   // warm fill, right
  vec3 H  = normalize(L + V);
  vec3 H2 = normalize(L2 + V);
  // Tight primary hotspot + a broader softer one → wet, polished sheen.
  float spec  = pow(max(dot(N, H), 0.0), 220.0) * 2.6;
  float spec2 = pow(max(dot(N, H2), 0.0), 42.0) * 0.32;
  col += (spec + spec2) * F * 3.4;

  // Rim light: a cool sheen along the silhouette, tinted by the liquid behind it
  // rather than flat white (flat white is what made the old edge look chalky).
  float rim = pow(1.0 - ndv, 3.2);
  col += mix(vec3(0.62, 0.74, 0.86), tint, 0.45) * rim * 0.55;

  // Faint interior bounce so the shadowed underside never reads as dead grey.
  col += tint * (1.0 - ndv) * 0.10;

  // Ordered dither — smooth glass gradients band badly in 8-bit without it.
  float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (dither - 0.5) * 0.0035;

  gl_FragColor = vec4(max(col, 0.0), 1.0);
  // Filmic tone map + linear→sRGB via three's own chunks: highlights roll off
  // instead of clipping, which is the difference between "glass" and "plastic".
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

function linearRGB(hex) {
  const c = new THREE.Color(hex)
  if (c.convertSRGBToLinear) c.convertSRGBToLinear()
  return new THREE.Vector3(c.r, c.g, c.b)
}

export default function DoshaGem({ percentages = null, dominant = null, size = 156 }) {
  const mountRef = useRef(null)

  const pct = percentages && DOSHAS.some(d => percentages[d] != null)
    ? { vata: percentages.vata || 0, pitta: percentages.pitta || 0, kapha: percentages.kapha || 0 }
    : (() => { const d = DOSHAS.includes(dominant) ? dominant : 'pitta'; return { vata: 16, pitta: 16, kapha: 16, [d]: 68 } })()
  const total = DOSHAS.reduce((s, d) => s + Math.max(0, pct[d] || 0), 0) || 1
  const wPitta = (pct.pitta || 0) / total, wVata = (pct.vata || 0) / total, wKapha = (pct.kapha || 0) / total

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const w = Math.round(size * 0.86), h = size

    // Descending-% order → colours + cumulative thresholds for the stacked zones.
    const ord = [...DOSHAS].sort((a, b) => (pct[b] || 0) - (pct[a] || 0))
    const frac = ord.map(d => Math.max(0, pct[d] || 0) / total)

    let renderer, scene, camera, pmrem, envTex, glassGeo, liquidGeo, glassMat, liquidMat, raf, io
    let disposed = false
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setSize(w, h, false)
      // Filmic response curve. With NoToneMapping every bright value clipped at
      // 1.0, which flattened the specular into a white smudge and posterized the
      // body; ACES rolls the highlights off so the glass keeps its gradient.
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 0.94
      renderer.domElement.style.width = `${w}px`
      renderer.domElement.style.height = `${h}px`
      mount.appendChild(renderer.domElement)

      scene = new THREE.Scene()
      pmrem = new THREE.PMREMGenerator(renderer)
      envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
      scene.environment = envTex

      camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 100)
      camera.position.set(0, 0, 5.6)

      // Smooth the silhouette: fit a Catmull-Rom spline through the control
      // points and sample it densely, so the teardrop reads as one flowing
      // curve rather than faceted straight segments.
      const spline = new THREE.SplineCurve(PROFILE.map(([x, y]) => new THREE.Vector2(x, y)))
      const profilePts = spline.getPoints(90).map(p => new THREE.Vector2(Math.max(0.001, p.x), p.y))
      glassGeo = new THREE.LatheGeometry(profilePts, 128)
      glassGeo.center()

      // The outer shell is a thin polished coat, not a frosted white sheath. The
      // old settings (near-white tint at envMapIntensity 1.7) built up a chalky
      // grey ring around the silhouette that read like a sticker outline; a
      // neutral tint, lower env gain and a slightly softer coat let the liquid's
      // own rim colour come through instead.
      glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0, roughness: 0.06, transmission: 1.0, thickness: 0.32,
        ior: 1.46, clearcoat: 1.0, clearcoatRoughness: 0.06, envMapIntensity: 0.85,
        transparent: true, depthWrite: false,
      })
      const glass = new THREE.Mesh(glassGeo, glassMat)

      const key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(-2.4, 3.2, 3.6)
      const rim = new THREE.DirectionalLight(0xfff2df, 0.7); rim.position.set(3, 0.5, 2)
      scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.4))

      liquidMat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG,
        uniforms: {
          uTime: { value: 0 },
          // Brightened token hues (blue/terracotta/green) — sRGB-encoded output
          // renders them as luminous liquid rather than a muddy flat fill.
          uCol0: { value: linearRGB(GEM_LIQUID[ord[0]]) },
          uCol1: { value: linearRGB(GEM_LIQUID[ord[1]]) },
          uCol2: { value: linearRGB(GEM_LIQUID[ord[2]]) },
          // Push a threshold out of range when its zone is empty, so a 0% dosha
          // never bleeds a sliver at the edge.
          uT0: { value: frac[1] > 0.004 ? frac[0] : 2.0 },
          uT1: { value: frac[2] > 0.004 ? frac[0] + frac[1] : 2.0 },
        },
      })
      liquidGeo = glassGeo.clone()
      const liquid = new THREE.Mesh(liquidGeo, liquidMat)
      // Close to the shell: a wide gap renders as a pale ring of empty glass
      // around the liquid, which read as a grey sticker outline.
      liquid.scale.setScalar(0.972)

      const group = new THREE.Group()
      group.add(liquid, glass)
      scene.add(group)

      const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const clock = new THREE.Clock()
      const renderFrame = () => {
        if (!reduce) liquidMat.uniforms.uTime.value += clock.getDelta()
        group.rotation.y = Math.sin(liquidMat.uniforms.uTime.value * 0.1) * 0.12
        renderer.render(scene, camera)
      }
      const loop = () => { if (disposed) return; renderFrame(); raf = requestAnimationFrame(loop) }
      const start = () => { if (!raf && !disposed) { clock.getDelta(); loop() } }
      const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null } }

      if (reduce) { renderFrame() }
      else {
        io = new IntersectionObserver(([en]) => { en.isIntersecting ? start() : stop() }, { threshold: 0.05 })
        io.observe(mount)
        start()
      }
    } catch {
      if (mount) mount.dataset.gemFallback = '1'
    }

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      if (io) io.disconnect()
      try { glassGeo?.dispose(); liquidGeo?.dispose(); glassMat?.dispose(); liquidMat?.dispose(); envTex?.dispose(); pmrem?.dispose() } catch { /* ignore */ }
      try { renderer?.dispose(); if (renderer?.domElement?.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement) } catch { /* ignore */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, wPitta, wVata, wKapha])

  // Halo tinted to the leading dosha and kept faint — the old fixed amber glow
  // sat under every gem, warming the blue and green ones toward mud.
  const lead = [...DOSHAS].sort((a, b) => (pct[b] || 0) - (pct[a] || 0))[0]
  const halo = { vata: '53,112,143', pitta: '158,87,32', kapha: '70,117,57' }[lead] || '158,87,32'

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        width: size * 0.86, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(58% 52% at 50% 46%, rgba(${halo},0.13), transparent 72%)`,
      }}
    />
  )
}
