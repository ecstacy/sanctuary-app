# Daylight — design direction & UX review

Chosen direction (2026-07-23) of three pitched. Warm modern minimalism: an oat
ground, warm-charcoal ink, Fraunces + Hanken Grotesk, three earth accents.
Foundation shipped in `feat/design-daylight` (`b79e1f4`); this doc is the plan
for the rest, and a UX audit read through the design lens.

## The identity, in tokens

| Token | Value | Role |
|---|---|---|
| `--color-background` / `surface` | `#f3f0e7` | oat ground |
| `--color-surface-container-low` | `#fbfaf3` | warm-white card |
| `--color-on-surface` | `#2b2b26` | warm charcoal ink (12.5:1) |
| `--color-on-surface-variant` | `#57564c` | body-variant (6.5:1) |
| `--color-pine` | `#3a6b53` | balancing · settles (5.4:1) |
| `--color-ochre` / `-mark` | `#8a6520` / `#b98a37` | source mark — text vs fill |
| `--color-clay` / `-mark` | `#a24a2b` / `#b25a37` | caution · aggravates |

Fonts: **Fraunces** (display serif, headings + Sanskrit) · **Hanken Grotesk**
(interface). The dosha-adaptive primary stays and drives `--color-primary`.

**Dusk (dark theme) is a drop-in.** Everything themes through these tokens, so
the second pitched direction becomes a `:root[data-theme="dark"]` block plus a
toggle — no component changes. Not built yet; it's the natural follow-on.

---

## UX review — what still reads as "structurally poor"

The foundation fixes *palette and type everywhere*. It does **not** fix layout
or the two structural habits below, which are the rest of the "no justice"
feeling. Ordered by impact.

### P1 — The faint sub-11px label (22 files)

Uppercase section labels set at 9–10px and 40–50% opacity. Technically present,
practically unreadable — the single biggest "ineligible" culprit. Already fixed
on the diet/discover surfaces (11px, full variant colour, proper tracking); the
same sweep is needed on **Home, Dietary, Profile, Practice, Dosha profile**.
Rule going forward: **section labels are 11px minimum, `text-on-surface-variant`
at full opacity, `tracking-widest`.** Never `opacity-50` on text — it drifts
per surface; use a token.

### P1 — Answer before apparatus

The diet detail page was reordered to lead with the verdict, then reference.
The same "encyclopaedia that happens to know you" problem lives on **Dosha
profile** and **Dietary guidance**: they open with taxonomy, not with "here's
what this means for you today." Reorder each to *verdict → detail → reference*.

### P2 — Cards-on-cards flatness

Rounded card inside rounded card inside oat, everything one elevation. Reads
flat and busy at once. The Daylight move (seen on the diet detail rewrite):
lead with **type and whitespace**, use a card only for a genuinely bounded
object, and separate sections with air or a hairline — not a nested box.
Highest value on **Home** (the most-seen screen) and **Practice**.

### P2 — Legacy dosha hexes don't follow the theme (~27 usages)

`#6b8f5e` (old sage), `#c47a3a` (old terracotta), `#7b93a8` (old vata blue) are
hardcoded across asana pages, the vikriti chart, and dosha tags. They now sit
slightly off the new pine/clay/ochre. Point the semantic ones at the new tokens
(`pine`/`clay`) and the dosha-identity ones at per-dosha values, so colour stays
coherent. Mechanical, low-risk, do in one pass.

### P3 — Radius rhythm

`rounded-lg` = 32px, `xl` = 48px reads bubbly/casual against the new
type. Daylight wants a slightly more architectural rhythm — consider 20–24px
for cards. Cosmetic; do only if it still feels casual after P1–P2.

### P3 — Motion restraint

Eight stagger levels fire on most screens. Pleasant once, busy on every
navigation and a faint "AI-generated" tell. Keep the page-enter; consider
dropping per-element stagger past level 2–3.

---

## Status (2026-07-23)

Everything mechanical or global is done and verified in-browser:

1. ✅ **Foundation** — tokens + type (`b79e1f4`).
2. ✅ **Label legibility sweep** (P1) — 202 ghost labels → 11px full colour,
   27 files (`9267d66`). Zero sub-11px uppercase labels remain.
3. ✅ **Diet semantic colours** → pine/clay tokens (`7b493eb`).
4. ✅ **Legacy dosha-identity hexes** → AA tokens, 34 uses (`d17af04`).
5. ✅ **Radius** tightened (`a2f0151`) and **motion** compressed (`bfba9a2`).

### Still open — needs on-device (or logged-in) eyes, not blind edits

Two items are deliberately NOT done yet, because they are structural
restructures of **auth-gated, data-dependent screens** (real dosha results,
streaks, composed sessions). Reshaping Home or Dosha-profile without seeing
them render with real content is the kind of blind change that breaks delicate
conditional layout — it should wait for on-device verification.

- **Answer-before-apparatus** on Dosha profile + Dietary guidance. Reorder each
  to verdict → detail → reference, as the ingredient page already is.
- **Cards-on-cards flatness** on Home + Practice — lead with type and
  whitespace; a card only for a genuinely bounded object.

Do these paired with a device build, screen by screen.

### Also still ahead

- **Dusk dark theme** — now a pure token drop-in: a `:root[data-theme="dark"]`
  block (Temple-at-Dusk palette) + a toggle in Profile. No component changes.

The foundation and all five completed passes are mergeable together — they lift
every screen and break nothing.
