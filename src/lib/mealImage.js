// ─────────────────────────────────────────────────────────────────────────────
//  mealImage — resolve a meal-template id to its bundled illustration URL.
//
//  Mirrors the pose image resolver: reads the auto-generated manifest
//  (scripts/build-meal-manifest.mjs scans public/meals/) and returns a
//  same-origin `/meals/{file}` URL, or null when no image exists yet. Null is
//  the normal case for most dishes today — MealIdeaCard falls back to the
//  generated mealVisual tile, so a dish without art still looks intentional.
//
//  Bundled + same-origin means: offline-safe and no CSP change (unlike a
//  Supabase-hosted asset). See docs/meal-image-plan.md.
// ─────────────────────────────────────────────────────────────────────────────

import { MEAL_IMAGE_FILES } from '../data/mealManifest'

/**
 * @param {string} id  meal template id (e.g. 'kitchari')
 * @returns {string|null}  '/meals/kitchari.webp' or null if none bundled
 */
export function mealImage(id) {
  if (!id) return null
  const file = MEAL_IMAGE_FILES[String(id).toLowerCase()]
  return file ? `/meals/${file}` : null
}
