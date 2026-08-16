// ─────────────────────────────────────────────────────────────────────────────
//  DoshaEffectRows — the three-row "effect on the doshas" graphic.
//
//  One shared presentation for "how does X act on Vata / Pitta / Kapha", used by
//  the food (ingredient) page and the Meal Check result. Each caller maps its
//  own data to a per-dosha SUITABILITY (balancing → Settles, caution → Increases,
//  neutral → Neutral) via `effectFor`; the optional `highlight` dosha gets the
//  emphasised pill (e.g. the food's target, or the user's current-state dosha).
//
//  Single owner for the visual so the food page and Meal Check can never drift.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'
import { SUITABILITY } from '../lib/doshaSemantics'

const DOSHAS = ['vata', 'pitta', 'kapha']
const DOSHA_ICON = { vata: 'air', pitta: 'local_fire_department', kapha: 'water_drop' }

const VERDICT = {
  [SUITABILITY.BALANCING]: { icon: 'check_circle', text: 'text-pine' },
  [SUITABILITY.NEUTRAL]:   { icon: 'remove_circle_outline', text: 'text-on-surface-variant' },
  [SUITABILITY.CAUTION]:   { icon: 'error_outline', text: 'text-clay' },
}

/**
 * @param {(dosha: string) => string} effectFor  dosha → SUITABILITY value
 * @param {string|null} [highlight]              dosha to emphasise, or null
 */
export default function DoshaEffectRows({ effectFor, highlight = null }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-2">
      {DOSHAS.map((d) => {
        const s = effectFor(d) || SUITABILITY.NEUTRAL
        const v = VERDICT[s] || VERDICT[SUITABILITY.NEUTRAL]
        const isTarget = highlight === d
        return (
          <div
            key={d}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${isTarget ? 'bg-surface-container-high' : ''}`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base text-on-surface-variant">{DOSHA_ICON[d]}</span>
            <span className={`font-body text-[15px] flex-1 ${isTarget ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
              {t(`diet.dosha.${d}`)}
            </span>
            <span className={`inline-flex items-center gap-1.5 ${v.text}`}>
              <span aria-hidden="true" className="material-symbols-outlined text-base">{v.icon}</span>
              <span className="font-body text-sm">{t(`diet.suitability.${s}`)}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
