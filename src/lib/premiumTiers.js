// ─────────────────────────────────────────────────────────────────────────────
//  premiumTiers — what's free, what's gated
//
//  Single source of truth for content gating. Every paywall surface in the
//  app reads from this file so the free-tier shape is centrally tunable.
//  Move an asana to Plus? Edit one set here, every surface updates.
//
//  DESIGN
//  ──────
//  Free tier is *generous enough* to give a casual practitioner a complete
//  daily experience: one foundational pose from each lane (standing, seated,
//  supine, gentle inversion, restorative, twist) + the three universally
//  beginner-friendly pranayamas.
//
//  Plus unlocks: the deeper variants (advanced twists, kumbhaka, etc.) and
//  the breadth (more poses for variety). The intent is "free is complete,
//  Plus is rich" — not "free is broken."
// ─────────────────────────────────────────────────────────────────────────────

// Asanas available without Plus. Currently a stable Set keyed by asana.id.
// Picks cover the bases of a balanced daily practice.
export const FREE_ASANA_IDS = new Set([
  'tadasana',           // Mountain — standing foundation
  'virabhadrasanaII',   // Warrior II — standing strength
  'sukhasana',          // Easy seat — seated foundation
  'balasana',           // Child's — restorative
  'savasana',           // Corpse — final relaxation
  'supineSpinalTwist',  // Supine twist — gentle spine
])

// Pranayama available without Plus. The three most universally
// beginner-safe + most cited classical techniques.
export const FREE_PRANAYAMA_IDS = new Set([
  'nadiShodhana',
  'ujjayi',
  'bhramari',
])

// Predicates kept as exported functions (not raw Set access) so we can
// later layer in "first N free per visit" or "first-day-free" without
// changing every call site.
export function isAsanaFree(asanaId) {
  return FREE_ASANA_IDS.has(asanaId)
}
export function isPranayamaFree(pranayamaId) {
  return FREE_PRANAYAMA_IDS.has(pranayamaId)
}
