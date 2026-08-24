# Meal-idea imagery — art direction & rollout plan

_Goal: give every meal-idea card a real image so the page reads like a menu, not a list. The card already prefers `idea.image` over the generated `mealVisual` tile (see [MealIdeaCard.jsx](../src/components/MealIdeaCard.jsx)), so this is a **data + asset** task, not a UI rewrite. The generated tile stays as the permanent fallback (offline, load-failure, un-illustrated dishes)._

> **Claude can't generate these images in-session** (no image tool here, and tooling/cost is your call). This is the spec + prompt kit so you — or a later session with an image model — can produce a consistent set, plus the wiring and review gate.

---

## 1. Why illustration, not photography

- **Consistency across a set.** 47 dishes shot or generated as photos never match — lighting, plating, camera all drift. One illustration style holds the set together.
- **Brand fit.** The app's world is warm, calm, hand-made (serif headline, earth palette, line-glyph icons). Photoreal food fights that; a painterly/illustrative style extends it.
- **Avoids the uncanny.** AI food photos get fingers-in-the-bowl, impossible textures, wrong ingredients. Illustration forgives abstraction and keeps us honest about "idea, not recipe."
- **Cultural safety.** Many dishes are Indian staples; a controlled illustration avoids the mis-plated, mis-garnished look that photoreal generation produces.

**Decision: one illustration style, applied to the whole set.**

## 2. The style (single, fixed)

**Warm painterly overhead bowls — a calm, appetising gouache/flat-wash look.**

| Axis | Fixed choice |
|---|---|
| **Camera** | Straight top-down (bird's-eye), dish centred |
| **Vessel** | One simple stoneware/ceramic bowl or plate, matte, warm-neutral glaze — the *same* vessel family across all dishes |
| **Rendering** | Soft gouache / flat wash with gentle grain; visible but restrained brush texture; no hard outlines, no cartoon black keylines, no photoreal specular |
| **Lighting** | Soft diffuse top-light, faint shadow pooled under the bowl — mirrors the tile's radial highlight |
| **Background** | A plain wash in the dish's **category colour** (see §3), subtle paper texture, nothing else — no props, cutlery, hands, text, or logos |
| **Palette** | Muted Daylight earth tones only; ingredients rendered in their natural but slightly desaturated colours; nothing neon or candy-bright |
| **Mood** | Nourishing, quiet, "home-cooked" — not glossy restaurant, not flat-icon |

The image must sit in the same family as its fallback tile, so **the background wash uses the category gradient already defined** in [mealVisual.js](../src/lib/mealVisual.js) (`CATEGORY_THEME`). If an image ever fails to load, the swap to the tile should feel like the same picture dimmed, not a different design.

## 3. Category background anchors (from `mealVisual.js`)

Use the lighter `from` value as the wash base, deepening slightly toward `to` at the edges:

| Category | Wash base → edge | Feel |
|---|---|---|
| grain | `#f4ead2 → #e7cfa0` | warm amber |
| legume | `#f1ddcf → #e3bfa4` | earthy clay |
| vegetable | `#e4ede2 → #c3dcc4` | soft pine |
| fruit | `#f6e4d1 → #eec6a6` | ripe peach |
| dairy | `#f3f0e7 → #e2ddcb` | cream |
| nut_seed | `#efe3d0 → #dcc4a0` | toasted |
| beverage | `#e4ece4 → #cfe0d4` | tea green |
| sweetener | `#f6e4d1 → #eec6a6` | warm |

The card keys the tile off dish-name keywords first, then category — so a dish's wash should match whatever `mealVisual` would pick for it (illustrate a "salad" on the vegetable wash even if its lead ingredient is a grain).

## 4. Prompt template

```
A warm, hand-painted gouache illustration of {DISH NAME}, seen from directly
above. The food sits in a single matte warm-grey stoneware bowl, centred, on a
plain {CATEGORY WASH} painted background with subtle paper texture. Soft diffuse
top light, a faint soft shadow under the bowl. Muted earthy palette, natural but
slightly desaturated food colours, gentle visible brushwork, no hard outlines.
Nourishing and calm, home-cooked mood. The dish shows: {2–4 MAIN INGREDIENTS}.
No cutlery, no hands, no text, no logo, no extra props. Square composition,
subject centred with headroom.
```

Fill `{2–4 MAIN INGREDIENTS}` from each template's `coreIds` (their `name`s) so the picture matches what the card lists — accuracy is part of the trust story. **Do not** invent garnishes the card doesn't mention.

**Consistency kit (do this or the set drifts):**
- Generate the **whole set in one session / one model + style**; don't return weeks later for stragglers with a different model.
- Lock a **style key-frame** first (pick one hero dish, iterate until the vessel + wash + brushwork are right), then reuse its exact style phrasing + reference for every other prompt.
- Keep the vessel identical; only the food and the wash colour change.
- Review the first 3 side by side before committing to all 47.

## 5. Format & output specs

| Spec | Value |
|---|---|
| Master | 1024×1024 (square), subject centred with safe headroom |
| Delivered | **`{mealKey}.webp`**, ~800×800, quality ~80, target ≤ 180 KB each |
| Crop behaviour | The card band is wide/short and uses `object-cover`; a centred square crops cleanly. Don't put anything critical near the square's top/bottom edges. |
| Colour | sRGB |

`{mealKey}` = the template `id` (e.g. `kitchari.webp`, `dalRiceGreens.webp`).

## 6. Wiring (mirror the poses system — the cleanest path)

Poses already do exactly this: drop a file in `public/poses/`, a build script scans it into an auto-generated manifest ([poseManifest.js](../src/data/poseManifest.js)). Copy the pattern:

1. **`public/meals/{mealKey}.webp`** — bundled with the app → **offline-safe** and **same-origin** (no CSP change, no Supabase bucket, no network on the meal page).
2. **`scripts/build-meal-manifest.mjs`** — scans `public/meals/`, emits `src/data/mealManifest.js` (`{ mealKey: 'file.webp' }`), wired into `npm run dev`/`build` like the pose manifest.
3. **Resolver** — a `mealImage(id)` helper returns `/meals/{file}` when the manifest has the key, else `null`. Set the template's consumed `image` from it (either in `meals.js` or mapped in `mealComposer` where `image: c.tpl.image` is read today).
4. **Load-failure fallback** — add `onError` to the `<img>` in `MealIdeaCard` so a broken/absent image drops back to the generated tile. (Small follow-up; do it when the first images land.)

This keeps the whole feature bundled and degrades perfectly to the tile everywhere it's missing — so we can **ship images dish-by-dish**, no big-bang.

## 7. Rollout batches (47 dishes, ~12 per batch)

Prioritised by how often a dish surfaces (midday=35 templates is the default lunch slot the user sees) and cross-dosha frequency. Ship a batch, review, go live; the rest keep showing tiles meanwhile.

### Batch A — hero midday/evening staples (12) ⭐ do first
Covers the screenshot dishes + the highest-frequency mains.
`kitchari` · `dalRiceGreens` · `chickpeaCurry` · `dalTadkaRice` · `rajmaChawal` · `vegetablePulao` · `mixedVegSoup` · `lentilSoup` · `chickpeaSaladBowl` · `quinoaSalad` · `capreseSalad` · `grainBowlHummus`

### Batch B — breakfast (10)
`spicedOatPorridge` · `ricePorridge` · `muesliYoghurtFruit` · `bananaBerrySmoothie` · `avocadoToast` · `eggsOnToast` · `pohaPeas` · `semolinaUpma` · `stewedAppleBreakfast` · `vegetableOmelette`

### Batch C — remaining mains & soups (13)
`uradDalStew` · `whiteBeanStew` · `splitPeaSoup` · `tomatoSoup` · `barleySoup` · `codRiceVeg` · `fishCurryRice` · `salmonRiceGreens` · `chickenRiceVeg` · `tofuStirFryRice` · `paneerPeasChapati` · `lambCurryRice` · `chapatiSabzi`

### Batch D — western / sandwiches / misc (12)
`tunaSandwich` · `grilledCheeseSandwich` · `sardineToast` · `ricottaToast` · `peanutButterBananaToast` · `pastaPesto` · `lentilPastaVeg` · `bulgurSalad` · `greekSalad` · `hummusPitaPlate` · `buttermilkRice` · `spicedMilk`

### Not illustrated (keep tile-only)
- `honeyWarmWater` (kind: `practice` — a ritual, not a dish)
- `potatoWithGhee` (kind: `preparation` — a component, already tagged as such)

## 8. Review gate (mirror the diet batches)

Each image gets ticked before it goes live, on three axes:
1. **Accuracy** — reads as the named dish; shows the core ingredients the card lists; no meat in a veg dish, no wrong staple.
2. **Style consistency** — same vessel, wash, brushwork, lighting as the approved key-frame.
3. **Cultural fidelity** — Indian dishes plated/garnished plausibly; nothing that reads as a parody.

Keep an approved-set list (as the diet batches pin reviewed ids) so a half-reviewed batch can't leak to production.

## 9. Open questions

- **Style key-frame dish** — which hero to lock the style on? Suggest `kitchari` (the app's archetypal dish, simple to render well).
- **Tool** — which image model/service, and budget for ~47 images + iterations?
- **Detail view** — when the ingredient→recipe flow lands, do we want a larger/full-bleed crop of the same master (the 1024² master supports it)?
