# Viruddha āhāra review — incompatible food combinations (9 pairings + 2 notes)

_All rows are `reviewStatus: 'draft'` in `src/data/ayurveda/viruddhaAhara.js` — invisible to the app and the website until fact-checked and flipped to `reviewed`. Nothing surfaces until you sign off._

**What this is:** the classical "incompatible combinations" (viruddha āhāra) layer — foods that are wholesome alone but cautioned against *together* (milk+fish, honey+ghee in equal parts) or *processed/timed* a certain way (heated honey, curd at night). This is the highest unique-content / SEO item on the enrichment backlog (#27c): there is no mainstream equivalent, and it answers a real search intent ("can I eat X with Y").

**How the matching works:** each pairing matches by **tag**, not by a single food id — `viruddhaTags(ingredient)` derives tags (`milk`, `curd`, `fish`, `meat`, `sourFruit`, `banana`, `melon`, `salt`, `radish`, `honey`, `ghee`) from fields the data already carries (id / category / allergens / rasa / animalKind). So "milk × sour fruit" catches lemon, pineapple, tamarind, and any sour-tasting fruit without listing each.

**How to review:** tick ✅ or note a correction next to each row. I'll apply edits and flip the flags. Two decisions per row: (1) is the pairing/claim **correct**, and (2) is the **source citation** right (I've cited Caraka Sūtrasthāna 26 for the classical ones — please confirm the verse numbers against your copy; I marked traditional/modern ones with no verse rather than guess).

**Severity legend:** `classical` = named in the saṃhitās (cite verse) · `traditional` = later tradition, widely taught · `modern` = contemporary application of the same principle.

## Pairings (9)

| ✔ | Combination | id | severity | source | reason (short) | safer swap |
|---|-------------|----|----------|--------|----------------|------------|
| ☐ | Milk × Fish | `milk-fish` | classical | CS Sū. 26.84 | opposed potencies (heating fish / cooling milk) → skin disorders | separate meals, hours apart |
| ☐ | Milk × Meat | `milk-meat` | classical | CS Sū. 26.85 | two heavy foods overload digestion | milk on its own |
| ☐ | Milk × Sour fruit | `milk-sour-fruit` | classical | CS Sū. 26.84 | sour curdles milk → āma | fruit alone, clear gap |
| ☐ | Milk × Banana | `milk-banana` | traditional | — (no verse) | heavy/congesting, ↑Kapha+āma | banana + cardamom, not milk |
| ☐ | Milk × Salt | `milk-salt` | classical | CS Sū. 26.84 | named incompatible | no salt in milk dishes |
| ☐ | Honey × Ghee (equal parts) | `honey-ghee-equal` | classical | CS Sū. 26.84 | equal quantity by weight is toxic; unequal is fine | keep amounts clearly unequal |
| ☐ | Curd/yoghurt × Fruit | `curd-sour-fruit` | modern | — (no verse) | fruit-yoghurt smoothie = modern milk+sour | fruit alone / plant base |
| ☐ | Melon × Milk | `melon-milk` | traditional | — (no verse) | melons eaten alone | melon by itself |
| ☐ | Milk × Radish | `milk-radish` | classical | CS Sū. 26.84 | pungent radish + milk named incompatible | keep separate |

## Single-food notes — samskāra / kāla viruddha (2)

| ✔ | Food | id | severity | source | caution | safer swap |
|---|------|----|----------|--------|---------|------------|
| ☐ | Heated honey | `honey-heated` | classical | AH Sū. 8 | honey must not be heated / added to hot liquids | add to warm (not hot); never cook with it |
| ☐ | Curd at night / heated | `curd-night` | traditional | — (no verse) | curd at night, and curd heated, ↑Kapha | curd at midday, never heated; buttermilk in evening |

## Open questions for the founder

1. **Verse numbers.** I've attributed the classical pairings to **Caraka Sūtrasthāna 26** (the viruddha chapter), most to 26.84 and milk+meat to 26.85. Please confirm against your edition — if a specific pairing sits at a different verse, note it and I'll correct `source.verse`.
2. **Milk×banana severity.** I marked it `traditional` (not in the saṃhitās to my knowledge). If you have a classical citation, we can upgrade it.
3. **Scope.** I kept this to combinations whose foods actually exist in our reviewed DB and match cleanly by tag. Candidates I *left out* for now (say the word to add): milk × yeasted/sour bread, ghee stored in bronze, fish × jaggery, cold-drink-with-hot-meal (samyoga). 
4. **Tone.** Reasons are written as "held to / taught to" rather than asserted as fact, matching the app's derived-claim voice. OK, or do you want firmer/softer?

## Note: overlap with existing free-text `combosToAvoid`

A few foods (notably **milk** and **yoghurt**) already carry a free-text `combosToAvoid` list on the ingredient itself — "milk: fish, sour substances, salt, yoghurt". Once the structured pairings here are reviewed, those foods would show the same warnings **twice** (the free-text card *and* the structured "Avoid combining with" card). On sign-off I'll **retire the overlapping free-text entries** so the structured, sourced version is the single source. Flag any free-text line you want kept verbatim.

## After sign-off (what flips on)

Once you tick rows, I: (a) set their `reviewStatus: 'reviewed'` in `viruddhaAhara.js`; (b) they immediately appear on the app's food pages ("Don't combine with…") and in Meal Check's combination warnings; (c) the website `/food-combinations` guide page generates from the reviewed set (kept out of the sitemap until then). No page or warning ships with unreviewed content.
