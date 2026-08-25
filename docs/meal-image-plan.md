# Meal-idea imagery — art direction & rollout plan

*Goal: give every meal-idea card a real image so the page reads like a menu, not a list. The card already prefers `idea.image` over the generated `mealVisual` tile (see [MealIdeaCard.jsx](../src/components/MealIdeaCard.jsx)), so this is a **data + asset** task, not a UI rewrite. The generated tile stays as the permanent fallback (offline, load-failure, un-illustrated dishes).*

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


| Axis           | Fixed choice                                                                                                                                         |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Camera**     | Straight top-down (bird's-eye), dish centred                                                                                                         |
| **Vessel**     | One simple stoneware/ceramic bowl or plate, matte, warm-neutral glaze — the *same* vessel family across all dishes                                   |
| **Rendering**  | Soft gouache / flat wash with gentle grain; visible but restrained brush texture; no hard outlines, no cartoon black keylines, no photoreal specular |
| **Lighting**   | Soft diffuse top-light, faint shadow pooled under the bowl — mirrors the tile's radial highlight                                                     |
| **Background** | A plain wash in the dish's **category colour** (see §3), subtle paper texture, nothing else — no props, cutlery, hands, text, or logos               |
| **Palette**    | Muted Daylight earth tones only; ingredients rendered in their natural but slightly desaturated colours; nothing neon or candy-bright                |
| **Mood**       | Nourishing, quiet, "home-cooked" — not glossy restaurant, not flat-icon                                                                              |


The image must sit in the same family as its fallback tile, so **the background wash uses the category gradient already defined** in [mealVisual.js](../src/lib/mealVisual.js) (`CATEGORY_THEME`). If an image ever fails to load, the swap to the tile should feel like the same picture dimmed, not a different design.

## 3. Category background anchors (from `mealVisual.js`)

Use the lighter `from` value as the wash base, deepening slightly toward `to` at the edges:


| Category  | Wash base → edge    | Feel        |
| --------- | ------------------- | ----------- |
| grain     | `#f4ead2 → #e7cfa0` | warm amber  |
| legume    | `#f1ddcf → #e3bfa4` | earthy clay |
| vegetable | `#e4ede2 → #c3dcc4` | soft pine   |
| fruit     | `#f6e4d1 → #eec6a6` | ripe peach  |
| dairy     | `#f3f0e7 → #e2ddcb` | cream       |
| nut_seed  | `#efe3d0 → #dcc4a0` | toasted     |
| beverage  | `#e4ece4 → #cfe0d4` | tea green   |
| sweetener | `#f6e4d1 → #eec6a6` | warm        |


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


| Spec           | Value                                                                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Master         | 1024×1024 (square), subject centred with safe headroom                                                                                               |
| Delivered      | `**{mealKey}.webp**`, ~800×800, quality ~80, target ≤ 180 KB each                                                                                    |
| Crop behaviour | The card band is wide/short and uses `object-cover`; a centred square crops cleanly. Don't put anything critical near the square's top/bottom edges. |
| Colour         | sRGB                                                                                                                                                 |


`{mealKey}` = the template `id` (e.g. `kitchari.webp`, `dalRiceGreens.webp`).

## 6. Wiring (mirror the poses system — the cleanest path)

Poses already do exactly this: drop a file in `public/poses/`, a build script scans it into an auto-generated manifest ([poseManifest.js](../src/data/poseManifest.js)). Copy the pattern:

1. `**public/meals/{mealKey}.webp**` — bundled with the app → **offline-safe** and **same-origin** (no CSP change, no Supabase bucket, no network on the meal page).
2. `**scripts/build-meal-manifest.mjs**` — scans `public/meals/`, emits `src/data/mealManifest.js` (`{ mealKey: 'file.webp' }`), wired into `npm run dev`/`build` like the pose manifest.
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

## 9. Batch-A prompt kit (ChatGPT / GPT-image)

Workflow for consistency in ChatGPT:

1. **Lock the key-frame first.** Send the style preamble + the `kitchari` prompt. Iterate until the vessel, wash, brushwork, and lighting are right. That image is the reference for the whole set.
2. **Stay in one conversation** and, for each following dish, attach the approved `kitchari` image and say *"same exact style, vessel, lighting and background treatment — now paint this dish."* GPT-image carries style far better from a reference image than from words alone.
3. **Save each as the template id** — `kitchari.png`, `dalRiceGreens.png`, … (PNG is fine; the manifest accepts it). Drop into `public/meals/`, run `npm run meals:manifest` (or just start the dev server), and the cards light up.

**Style preamble (paste once, pin it):**

> A warm, hand-painted gouache illustration of a single dish, seen from directly above. The food sits in one matte warm-grey stoneware bowl, centred, on a plain painted background wash in the colour I give, with subtle paper texture. Soft diffuse top light, a faint soft shadow under the bowl. Muted earthy palette, natural but slightly desaturated food colours, gentle visible brushwork, no hard outlines. Nourishing, calm, home-cooked mood. No cutlery, no hands, no text, no logo, no props. Square composition, subject centred with headroom. Show only the ingredients I name.

**The 12 dishes** (background hex matches each card's fallback tile so image and tile stay one family):


| #   | Save as                 | Dish + ingredients to show                                                                | Background wash               |
| --- | ----------------------- | ----------------------------------------------------------------------------------------- | ----------------------------- |
| 1 ⭐ | `kitchari.png`          | Mung dal and basmati rice cooked soft together into a loose porridge, faint sheen of ghee | clay `#f1ddcf → #e3bfa4`      |
| 2   | `dalRiceGreens.png`     | Soft yellow mung dal, white basmati rice, and a small side of sautéed green spinach       | clay `#f1ddcf → #e3bfa4`      |
| 3   | `chickpeaCurry.png`     | Spiced whole chickpeas in a light golden sauce beside white basmati rice                  | amber `#f4ead2 → #e7cfa0`     |
| 4   | `dalTadkaRice.png`      | Yellow toor dal with a ghee-tempered top (cumin, tomato, onion) beside basmati rice       | clay `#f1ddcf → #e3bfa4`      |
| 5   | `rajmaChawal.png`       | Red kidney beans in a tomato-onion gravy beside white basmati rice                        | amber `#f4ead2 → #e7cfa0`     |
| 6   | `vegetablePulao.png`    | Loose basmati rice with carrot, peas and green beans, a few whole spices and cashews      | amber `#f4ead2 → #e7cfa0`     |
| 7   | `mixedVegSoup.png`      | A warming soup of carrot, green beans and spinach with a little barley                    | clay `#f1ddcf → #e3bfa4`      |
| 8   | `lentilSoup.png`        | A hearty red-lentil soup with soft carrot                                                 | clay `#f1ddcf → #e3bfa4`      |
| 9   | chickpeaSaladBowl`.png` | Cooked chickpeas with chopped cucumber and raw tomato, mint, a lemon-oil sheen            | vegetable `#e4ede2 → #c3dcc4` |
| 10  | `quinoaSalad.png`       | Cooled quinoa tossed with cucumber, tomato, mint and a few chickpeas                      | vegetable `#e4ede2 → #c3dcc4` |
| 11  | `capreseSalad.png`      | Sliced tomato and fresh white mozzarella with basil leaves and a drizzle of olive oil     | vegetable `#e4ede2 → #c3dcc4` |
| 12  | `grainBowlHummus.png`   | Quinoa topped with roasted sweet potato and vegetables, a generous spoon of hummus        | amber `#f4ead2 → #e7cfa0`     |


Per-dish message format:

> [attach approved kitchari] Same exact style, vessel, lighting and background treatment. Paint this dish: **{dish + ingredients from the table}**. Background wash in these tones: **{hex}**.

## 9b. Batch-B prompt kit — breakfast (10)

Same workflow as Batch A: **attach the approved `kitchari` key-frame to every prompt** so the vessel, wash, brushwork and lighting stay identical. Save each as `{templateId}.png` in `public/meals/`, then `npm run meals:webp`.

**Vessel note:** the key-frame vessel is a bowl, but several breakfasts are *plated*, not bowled. Keep the **same matte warm-grey stoneware** — use it as a **shallow plate** for toast and omelette, and as the **bowl** for porridge, poha, upma, stewed fruit and the smoothie bowl. Same material and colour throughout; only bowl-vs-plate changes.

| # | Save as | Dish + ingredients to show | Vessel | Background wash |
|---|---|---|---|---|
| 1 | `spicedOatPorridge.png` | Warm oat porridge cooked soft, a little ghee sheen, slivered almonds, a touch of jaggery | bowl | amber `#f4ead2 → #e7cfa0` |
| 2 | `ricePorridge.png` | Soft loose rice porridge with a faint ghee sheen and a few cumin seeds | bowl | amber `#f4ead2 → #e7cfa0` |
| 3 | `muesliYoghurtFruit.png` | Muesli soaked with yoghurt, fresh banana slices, a drizzle of honey and a few almonds | bowl | cream `#f3f0e7 → #e2ddcb` |
| 4 | `bananaBerrySmoothie.png` | A thick banana-and-strawberry smoothie bowl topped with sliced banana and a few berries | bowl | peach `#f6e4d1 → #eec6a6` |
| 5 | `avocadoToast.png` | Mashed ripe avocado on a slice of whole-wheat toast, a squeeze of lemon, cracked black pepper | plate | amber `#f4ead2 → #e7cfa0` |
| 6 | `eggsOnToast.png` | Soft-scrambled eggs on a slice of warm whole-wheat toast | plate | amber `#f4ead2 → #e7cfa0` |
| 7 | `pohaPeas.png` | Turmeric-yellow flattened-rice poha with green peas, peanuts and curry leaves | bowl | amber `#f4ead2 → #e7cfa0` |
| 8 | `semolinaUpma.png` | Soft semolina upma with green peas and a mustard-seed and curry-leaf tempering | bowl | amber `#f4ead2 → #e7cfa0` |
| 9 | `stewedAppleBreakfast.png` | Warm stewed apple slices dusted with cardamom | bowl | peach `#f6e4d1 → #eec6a6` |
| 10 | `vegetableOmelette.png` | A folded omelette with tomato, onion, bell pepper and spinach | plate | clay `#f1ddcf → #e3bfa4` |

## 9c. Batch-C prompt kit — new recipes (5 templates)

The five recipes added to the suggestion rotation (batch 7). Same workflow — attach the `kitchari` key-frame, save as `{templateId}.png`, `npm run meals:webp`.

| # | Save as | Dish + ingredients to show | Vessel | Background wash |
|---|---|---|---|---|
| 1 | `sobaGreensBowl.png` | Buckwheat soba noodles tossed with sautéed spinach and carrot, a sheen of sesame oil | bowl | vegetable `#e4ede2 → #c3dcc4` |
| 2 | `udonNoodleSoup.png` | Thick udon noodles in a clear vegetable broth with carrot and spinach | bowl | clay `#f1ddcf → #e3bfa4` |
| 3 | `farroVegBowl.png` | Nutty farro with roasted sweet potato and spinach, a few walnuts | bowl | amber `#f4ead2 → #e7cfa0` |
| 4 | `vermicelliUpma.png` | Soft vermicelli with green peas and carrot, a mustard-seed and curry-leaf tempering | bowl | amber `#f4ead2 → #e7cfa0` |
| 5 | `sabudanaKhichdi.png` | Translucent soaked tapioca pearls tossed with crushed peanuts and soft potato cubes | bowl | cream `#f3f0e7 → #e2ddcb` |

> **Recipes can now be illustrated too.** The meal detail page (`/meal/:id`, 2026-08-24) gives every dish — templates *and* recipe foods — a hero image slot. Drop `public/meals/{recipeId}.png` (e.g. `dalFry.png`, `tomatoPasta.png`) and it shows on that recipe's detail hero, same pipeline. Recipe ids: dalFry, rajmaMasala, jeeraRice, lemonRice, curdRice, coconutRice, tomatoRice, bhindiMasala, bainganBharta, alooJeera, vegKorma, aglioOlioPasta, tomatoPasta, mushroomPasta, plus the migrated meat dishes (butterChicken, friedChicken, …). Prompts: same template as Batch A/B, ingredients from `recipes-data.js`.

## 9d. Batch-D prompt kit — remaining meals (52 dishes)

Everything still on the generated-tile fallback. Same workflow — attach the `kitchari` key-frame, save as `{{id}}.png` in `public/meals/`, `npm run meals:webp`. Vessel: bowl for curries/dals/soups/rice, **plate** for toast/sandwiches/burgers/cutlets. Wash matches each card's fallback tile.

| Save as | Dish + ingredients | Wash |
|---|---|---|
| `aglioOlioPasta.png` | Aglio e olio pasta — Pasta, Garlic, Olive oil, Green chilli | amber `#f4ead2` |
| `alooJeera.png` | Aloo jeera — Potato, Cumin, Turmeric | vegetable `#e4ede2` |
| `bainganBharta.png` | Baingan bharta — Aubergine, Tomato (cooked), Onion (cooked), Garlic | vegetable `#e4ede2` |
| `barleySoup.png` | Barley soup — Barley | clay `#f1ddcf` |
| `bhindiMasala.png` | Bhindi masala — Okra, Onion (cooked), Tomato (cooked), Cumin | vegetable `#e4ede2` |
| `bulgurSalad.png` | Bulgur salad — Bulgur wheat, Cucumber, Tomato (raw) | vegetable `#e4ede2` |
| `butterChicken.png` | Butter chicken — Chicken, Tomato (cooked), Butter, Onion (cooked), Garlic | clay `#f1ddcf` |
| `buttermilkRice.png` | Rice with buttermilk — Basmati rice, Buttermilk | amber `#f4ead2` |
| `chapatiSabzi.png` | Chapati with cooked vegetables — Wheat | amber `#f4ead2` |
| `cheeseburger.png` | Cheeseburger — Beef, Hard cheese, Bread roll, Onion (cooked) | clay `#f1ddcf` |
| `chickenNuggets.png` | Chicken nuggets — Chicken, Breadcrumbs | clay `#f1ddcf` |
| `chickenRiceVeg.png` | Chicken with rice and vegetables — Chicken, Basmati rice, Green peas | amber `#f4ead2` |
| `chickenWings.png` | Chicken wings — Chicken | clay `#f1ddcf` |
| `clubSandwich.png` | Club sandwich — Bread roll, Chicken, Bacon, Tomato (raw) | amber `#f4ead2` |
| `coconutRice.png` | Coconut rice — Basmati rice, Coconut, Mustard seed, Curry leaf | amber `#f4ead2` |
| `codRiceVeg.png` | Baked cod with rice and vegetables — Cod, Basmati rice, Broccoli | amber `#f4ead2` |
| `curdRice.png` | Curd rice — Basmati rice, Yoghurt, Mustard seed, Curry leaf | amber `#f4ead2` |
| `dalFry.png` | Dal fry — Toor dal, Tomato (cooked), Onion (cooked), Garlic, Cumin | clay `#f1ddcf` |
| `fishCurryRice.png` | Fish curry with rice — Fish (freshwater), Basmati rice | amber `#f4ead2` |
| `friedChicken.png` | Fried chicken — Chicken, Breadcrumbs | clay `#f1ddcf` |
| `greekSalad.png` | Greek-style salad — Cucumber, Tomato (raw), Feta, Olives | vegetable `#e4ede2` |
| `grilledCheeseSandwich.png` | Grilled cheese sandwich — Whole-wheat bread, Cheddar | amber `#f4ead2` |
| `hotDog.png` | Hot dog — Sausage, Bread roll | clay `#f1ddcf` |
| `hummusPitaPlate.png` | Hummus and pita plate — Pita bread, Hummus | amber `#f4ead2` |
| `jeeraRice.png` | Jeera rice — Basmati rice, Cumin, Ghee | amber `#f4ead2` |
| `katsuCurry.png` | Katsu curry — Pork, Breadcrumbs, Basmati rice, Carrot, Onion (cooked) | vegetable `#e4ede2` |
| `lambCurryRice.png` | Lamb curry with rice — Lamb, Basmati rice | amber `#f4ead2` |
| `lemonRice.png` | Lemon rice — Basmati rice, Lemon, Mustard seed, Curry leaf, Peanut | amber `#f4ead2` |
| `lentilPastaVeg.png` | Lentil pasta with vegetables — Lentil pasta, Tomato (cooked) | clay `#f1ddcf` |
| `meatballs.png` | Meatballs — Minced meat, Breadcrumbs, Onion (cooked) | clay `#f1ddcf` |
| `mushroomPasta.png` | Mushroom pasta — Pasta, Mushroom, Garlic, Olive oil | amber `#f4ead2` |
| `paneerPeasChapati.png` | Paneer and peas with chapati — Paneer, Green peas, Wheat | amber `#f4ead2` |
| `pastaPesto.png` | Pasta with pesto — Pasta, Pesto | amber `#f4ead2` |
| `peanutButterBananaToast.png` | Peanut butter and banana toast — Whole-wheat bread, Peanut butter, Banana | amber `#f4ead2` |
| `potatoWithGhee.png` | Mashed potato — Potato | vegetable `#e4ede2` |
| `rajmaMasala.png` | Rajma masala — Kidney beans, Tomato (cooked), Onion (cooked), Garlic, Cumin | vegetable `#e4ede2` |
| `ricottaToast.png` | Ricotta toast with fruit — Whole-wheat bread, Ricotta | amber `#f4ead2` |
| `salmonRiceGreens.png` | Salmon with rice and greens — Salmon, Basmati rice, Broccoli | amber `#f4ead2` |
| `sardineToast.png` | Sardines on toast — Sardines, Whole-wheat bread | amber `#f4ead2` |
| `shawarma.png` | Shawarma / doner kebab — Chicken, Pita bread, Onion (cooked), Garlic | clay `#f1ddcf` |
| `spicedMilk.png` | Warm spiced milk — Cow’s milk | cream `#f3f0e7` |
| `splitPeaSoup.png` | Split pea soup — Split peas | clay `#f1ddcf` |
| `teriyakiChicken.png` | Teriyaki chicken — Chicken, Onion (cooked) | clay `#f1ddcf` |
| `tofuStirFryRice.png` | Tofu stir-fry with rice — Tofu, Basmati rice, Bell pepper | amber `#f4ead2` |
| `tomatoPasta.png` | Tomato pasta — Pasta, Tomato (cooked), Garlic, Olive oil | amber `#f4ead2` |
| `tomatoRice.png` | Tomato rice — Basmati rice, Tomato (cooked), Onion (cooked), Mustard seed, Curry leaf | amber `#f4ead2` |
| `tomatoSoup.png` | Tomato soup — Tomato (cooked) | clay `#f1ddcf` |
| `tonkatsu.png` | Tonkatsu — Pork, Breadcrumbs | clay `#f1ddcf` |
| `tunaSandwich.png` | Tuna sandwich — Tuna, Whole-wheat bread | amber `#f4ead2` |
| `uradDalStew.png` | Slow-cooked urad dal — Urad dal | clay `#f1ddcf` |
| `vegKorma.png` | Vegetable korma — Carrot, Green peas, Potato, Coconut, Cashew | vegetable `#e4ede2` |
| `whiteBeanStew.png` | White bean stew — White beans, Tomato (cooked), Carrot | vegetable `#e4ede2` |

## 10. Decisions (was: open questions)

- **Style key-frame** — ✅ `kitchari`. Approved 2026-08-24: overhead single matte stoneware bowl, painterly gouache, warm terracotta wash. It is now the reference — attach it to every following dish prompt. Note its wash runs a touch warmer/more saturated than the §3 hex; **match the key-frame, not the hex** — set consistency wins.
- **Tool** — ✅ ChatGPT / GPT-image (§9 workflow).
- **Detail view / masters** — ✅ Ship a single 900px WebP per dish (`npm run meals:webp`, ~110 KB each). 900px covers both the card band and a future full-bleed phone detail view at 2×, so we don't keep multi-MB masters. If a large/print master is ever needed, re-export with `KEEP_PNG=1`.

