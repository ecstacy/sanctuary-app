# Dosha gem images

Pre-rendered liquid-glass gems, one per outcome. `DoshaGemImage` loads
`/dosha-gems/<key>.png` for the user's dosha split via `gemImageKey()` in
`src/lib/doshaOutcome.js`. Until a file exists the component falls back to the
real-time WebGL gem, so a missing file degrades gracefully.

Colour legend: **Vata = purple, Pitta = gold, Kapha = teal.** Dominant dosha =
the largest liquid body.

Keys (10):
- Single-dominant `<dominant>-<secondary>`:
  `vata-pitta` · `vata-kapha` · `pitta-kapha` · `pitta-vata` · `kapha-pitta` · `kapha-vata`
- Co-dominant pairs `<a>-<b>-dual` (a,b in vata→pitta→kapha order):
  `vata-pitta-dual` · `vata-kapha-dual` · `pitta-kapha-dual`
- `tridoshic`
