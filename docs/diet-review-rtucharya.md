# Ṛtucharyā review — seasonal eating (4 seasons)

_All four seasons are `reviewStatus: 'draft'` in `src/data/ayurveda/rtucharya.js` — nothing surfaces (app filter, website season hubs) until you sign off. The per-food ranking reuses the already-reviewed `foodSuitability`; what you're reviewing here is the **season → dosha choice** and the **prose**._

**What this is:** the seasonal layer (ṛtucharyā, backlog #27d). Each calendar season maps to the dosha it most aggravates and the tastes/qualities to favour or ease off. Once reviewed, it powers an "In season now" food filter in the app and `/foods/seasonal/<season>` guide pages on the website.

## ⚠ The one real decision: 4 seasons vs 6 ṛtus

The classical texts use **six** ṛtus (śiśira, vasanta, grīṣma, varṣā, śarad, hemanta); our app calendar uses **four**. The mapping below is a defensible Western adaptation, not a direct quote. The notable divergence is **autumn**:

- **Classical (śarad):** autumn aggravates **Pitta** (accumulated heat of summer releases).
- **Felt Western autumn** (dry, cool, windy, leaves falling): reads as **Vata**, which is what most modern Ayurveda teaches for fall.

**Draft picks Vata for autumn.** Tick to confirm, or change to Pitta.

## Seasons — confirm dosha + prose

| ✔ | Season | ṛtu | dosha to pacify | favour | ease off | source |
|---|--------|-----|-----------------|--------|----------|--------|
| ☐ | Spring | Vasanta | **Kapha** | light, warm, pungent, bitter, astringent | heavy, sweet, sour, salty, oily, cold | CS Sū. 6 |
| ☐ | Summer | Grīṣma | **Pitta** | cooling, sweet, bitter, astringent, liquid | hot, sour, salty, pungent, oily | CS Sū. 6 |
| ☐ | Autumn | Śarad / early Hemanta | **Vata** _(classical: Pitta — decide)_ | warm, moist, oily, sweet, sour, salty | dry, cold, light, raw, astringent, pungent | — |
| ☐ | Winter | Hemanta / Śiśira | **Vata** _(late winter → Kapha)_ | warm, heavy, oily, sweet, sour, salty, nourishing | cold, dry, raw, light | CS Sū. 6 |

## Open questions

1. **Autumn dosha** — Vata (draft) or Pitta (classical śarad)? See the box above.
2. **Winter dosha** — I picked Vata (Hemanta/Śiśira are Vata-season with strong agni → nourish heavily). Some teach winter as Kapha-accumulation. The intro already notes "late winter shifts lighter as Kapha builds." OK, or map winter → Kapha?
3. **Verse numbers** — I cited Caraka Sūtrasthāna 6 (the ṛtucharyā chapter) generally. Add specific verses if you want them on the pages.
4. **Prose tone** — matches the derived-claim voice ("favour… ease off…"). Firmer/softer?

## After sign-off (what flips on)

Per season you tick, I set `reviewStatus: 'reviewed'` in `rtucharya.js` and:
- the app's Discover → Foods gains an **"In season now"** chip (shows only when the *current* season is reviewed), filtering to that season's favoured foods;
- the website generates a **`/foods/seasonal/<season>`** guide (favour + ease-off lists, FAQ + CollectionPage JSON-LD), added to the sitemap;
- seasons can be flipped **independently** — reviewing only spring lights up spring, leaves the rest dark.
