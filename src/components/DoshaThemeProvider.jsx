import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useVikritiSignal } from '../hooks/useVikritiSignal'
import { resolveDietTarget } from '../lib/dietTarget'

/**
 * Sets `data-dosha` on <html> to activate the dosha-specific CSS custom-property
 * palette defined in index.css. Renders nothing — purely a side-effect component.
 *
 * The ambient colour must track the SAME resolved current state as Home, the
 * gem and the meal surfaces — not the raw constitution. Reading the constitution
 * directly caused two bugs:
 *   • a balanced/tridoshic user got themed to their numeric-top dosha (usually
 *     Vata → blue), even though they have no dominant — the #65/#66 class again;
 *   • a live Kapha imbalance never recoloured the app, because a vikriti flare
 *     doesn't touch dosha_details.primary.
 * resolveDietTarget already encodes the right answer: vikriti flare → that dosha,
 * balanced → null (neutral), else prakriti. A null target means "no single dosha
 * to lens to", so we drop the attribute and fall back to the neutral pine palette.
 */
export default function DoshaThemeProvider() {
  const { profile } = useAuth()
  const vikriti = useVikritiSignal()
  const dosha = resolveDietTarget({ vikriti, profile }).dosha // null when balanced / none

  useEffect(() => {
    const root = document.documentElement
    if (dosha && ['vata', 'pitta', 'kapha'].includes(dosha)) {
      root.setAttribute('data-dosha', dosha)
    } else {
      root.removeAttribute('data-dosha')
    }
    return () => root.removeAttribute('data-dosha')
  }, [dosha])

  return null
}
