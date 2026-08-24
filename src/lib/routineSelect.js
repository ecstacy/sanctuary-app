// ─────────────────────────────────────────────────────────────────────────────
//  routineSelect — pick the routine that fits the user right now.
//
//  The Routine tab used to always open the same 'stress' template. This chooses
//  among the ready routines by two cheap, honest signals: the TIME OF DAY (the
//  body wants different things morning vs night) and the user's current DOSHA
//  IMBALANCE (from useVikritiSignal). It never composes — it just points at the
//  right existing routine, and returns a `reason` so the page can say why.
//
//  An explicit choice (picking a routine from Discover) always wins over this;
//  this is only the default when the user opens the tab without a pick.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {{ vikriti?: 'vata'|'pitta'|'kapha'|null, hour?: number }} ctx
 * @returns {{ key: string, reason: 'evening'|'morning'|'vata'|'pitta'|'kapha'|'general' }}
 */
export function pickRoutine({ vikriti = null, hour = new Date().getHours() } = {}) {
  // Night → the body wants calming, whatever the dosha.
  if (hour >= 21 || hour < 5) return { key: 'sleep', reason: 'evening' }
  if (hour >= 19)             return { key: 'preBedWindDown', reason: 'evening' }

  // Morning → wake the body, unless a clear dosha steer says otherwise.
  if (hour < 11) {
    if (vikriti === 'vata')  return { key: 'stress', reason: 'vata' }        // ground a scattered start
    if (vikriti === 'pitta') return { key: 'flexibility', reason: 'pitta' }  // gentle, cooling
    return { key: 'energy', reason: vikriti === 'kapha' ? 'kapha' : 'morning' }
  }

  // Midday / afternoon → steer by the elevated dosha.
  if (vikriti === 'vata')  return { key: 'stress', reason: 'vata' }
  if (vikriti === 'kapha') return { key: 'energy', reason: 'kapha' }
  if (vikriti === 'pitta') return { key: 'flexibility', reason: 'pitta' }
  return { key: 'flexibility', reason: 'general' }
}
