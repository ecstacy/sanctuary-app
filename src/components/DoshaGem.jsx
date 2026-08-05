// ─────────────────────────────────────────────────────────────────────────────
//  DoshaGem — the current constitution as a real-time 3D glass vessel (WebGL).
//
//  A frosted glass egg holding the three dosha "liquids", stacked as translucent
//  colour zones sized to each dosha's percentage (dominant fills most, the
//  others band toward the edge) with soft, slowly-flowing boundaries — so an
//  80% Pitta / 20% Kapha reading shows a large honey zone and a clear teal one.
//  Gold = Pitta, indigo-violet = Vata, teal-green = Kapha. Frozen under
//  prefers-reduced-motion, paused off-screen, WebGL-failure fallback.
//
//  Props: percentages {vata,pitta,kapha}|null, dominant string|null, size px.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export const GEM_HUE = {
  vata:  { deep: '#3a3f8f', base: '#6b62c4', light: '#b3a6ee' }, // indigo-violet
  pitta: { deep: '#a86a24', base: '#dda85a', light: '#f8dc9f' }, // honey-gold
  kapha: { deep: '#2e6f57', base: '#3fa07a', light: '#8fd4b3' }, // teal-green
}
// Liquid hues for the gem itself — more saturated/luminous than the label
// swatches above, so the glass reads as vivid jewel-toned liquid (the label
// text keeps the softer GEM_HUE so it stays legible on the card).
const GEM_LIQUID = {
  vata:  '#8a3fd4', // amethyst violet
  pitta: '#edb412', // rich honey-gold
  kapha: '#0fa457', // deep emerald
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

// Stacked translucent zones: colours ordered by descending share are laid along
// a gently flowing left→right axis, partitioned at cumulative thresholds, with
// soft wavy boundaries so it reads as calm layered liquid, not marble.
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
  // two low-freq fields drive a domain-warped swirl → visibly flowing liquid
  float w1 = fbm(pw + vec3(0.0, -t*0.16, t*0.11));
  float w2 = fbm(pw*1.7 + vec3(t*0.14, t*0.09, 0.0));
  vec2 warp = vec2(w1, w2) - 0.5;

  // stack BOTTOM→TOP with a wavy, animated meniscus so the boundaries ripple
  // like a liquid surface rather than sitting as flat bands.
  // gentle sloshing — small amplitude so a thin band stays near its % position
  // and its fixed leader line keeps pointing at it.
  float surf = 0.04*sin(vPos.x*2.4 + t*0.55) + 0.055*(w1 - 0.5);
  float u = clamp(vPos.y * 0.42 + 0.5 + surf, 0.0, 1.0);
  float e = 0.05;
  vec3 col = uCol0;
  col = mix(col, uCol1, smoothstep(uT0 - e, uT0 + e, u));
  col = mix(col, uCol2, smoothstep(uT1 - e, uT1 + e, u));

  // liquid depth — rich and dark deep in the body, luminous toward the top.
  // wide range → strong volume: deep jewel shadows low, glowing highlights high.
  float depth = smoothstep(-1.2, 1.2, vPos.y + 0.5*(w1 - 0.5));
  col *= mix(0.76, 1.78, depth);          // more contrast → the liquid gains volume, rich low → bright high
  // animated internal swirl ribbons
  float swirl = fbm(pw*2.2 + vec3(warp*1.6, t*0.22));
  col = mix(col, col*1.42, smoothstep(0.42, 0.80, swirl));
  // tiny drifting glints, like light catching the liquid
  float spk = fbm(pw*9.0 + vec3(t*0.5, -t*0.45, t*0.35));
  col += smoothstep(0.82, 0.95, spk) * 0.4;

  // glassy highlights: fresnel rim + a tight specular hotspot for a wet, liquid sheen
  vec3 viewDir = normalize(cameraPosition - vWorld);
  vec3 N = normalize(vNormalW);
  float fres = pow(1.0 - max(dot(N, viewDir), 0.0), 2.5);
  col += fres * 0.20;
  vec3 L = normalize(vec3(-0.5, 0.95, 0.6));
  float spec = pow(max(dot(reflect(-L, N), viewDir), 0.0), 26.0);
  col += spec * 0.5;                        // bright wet hotspot (top-left)
  float hl = smoothstep(0.6, 1.0, dot(N, L));
  col += hl * 0.16;                         // soft broad sheen

  // light translucent lift — keep it glassy (subtle, so hues stay saturated)
  col = mix(col, vec3(1.0, 0.985, 0.95), 0.05);
  // encode linear→sRGB for output (a raw ShaderMaterial doesn't get three's
  // automatic colorspace pass, so without this the true colour renders muddy).
  col = pow(clamp(col, 0.0, 1.0), vec3(0.4545));
  gl_FragColor = vec4(col, 1.0);
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
      renderer.toneMapping = THREE.NoToneMapping
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

      glassMat = new THREE.MeshPhysicalMaterial({
        color: 0xfbfcff, metalness: 0, roughness: 0.045, transmission: 0.98, thickness: 0.18,
        ior: 1.5, clearcoat: 1.0, clearcoatRoughness: 0.04, envMapIntensity: 1.7, transparent: true,
      })
      const glass = new THREE.Mesh(glassGeo, glassMat)

      const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(-2.4, 3.2, 3.6)
      const rim = new THREE.DirectionalLight(0xfff2df, 0.9); rim.position.set(3, 0.5, 2)
      scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.55))

      liquidMat = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG,
        uniforms: {
          uTime: { value: 0 },
          // true saturated hues — now that output is sRGB-encoded these render
          // as luminous liquid (gold/violet/teal) rather than muddy earth tones.
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
      liquid.scale.setScalar(0.93)

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

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        width: size * 0.86, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(60% 55% at 50% 42%, rgba(248,220,159,0.22), transparent 70%)',
      }}
    />
  )
}
