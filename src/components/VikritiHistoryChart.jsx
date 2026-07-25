// ─────────────────────────────────────────────────────────────────────────────
//  VikritiHistoryChart — your dosha pattern over time (pure SVG)
//
//  A heatmap strip: one cell per check-in day, colored by that day's vikriti
//  quadrant (Vata / Pitta / Kapha) or neutral when balanced. Reads the user's
//  own self-reports back to them as a longitudinal pattern — the longitudinal
//  counterpart to the single "today's reading" card on home.
//
//  Presentational only: takes the result of useVikritiHistory. Gating +
//  data-fetching live in the parent (JourneyPage).
// ─────────────────────────────────────────────────────────────────────────────

// Dosha palette — matches DOSHA_DATA / DoshaProfileContent so colors mean the
// same thing everywhere in the app.
import { useTranslation } from 'react-i18next'

const COLOR = {
  vata:     '#35708f',
  pitta:    '#9e5720',
  kapha:    '#467539',
  balanced: '#cbd2cc',
}

export default function VikritiHistoryChart({ history }) {
  const { t } = useTranslation()
  const { days, counts, dominant, daysTracked, windowDays } = history

  // Dosha names (vata/pitta/kapha) are proper nouns kept as-is; only
  // "balanced" is localized.
  const LABEL = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha', balanced: t('vikritiChart.balanced') }

  if (daysTracked === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-center">
        <div>
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/20 text-4xl mb-2 block">insights</span>
          <p className="font-body text-sm text-on-surface-variant/40">{t('vikritiChart.empty')}</p>
          <p className="font-body text-xs text-on-surface-variant/25 mt-1">{t('vikritiChart.emptyHint')}</p>
        </div>
      </div>
    )
  }

  // Cell sizing — scrollable strip, like the activity chart.
  const cellW = daysTracked <= 14 ? 18 : daysTracked <= 24 ? 12 : 9
  const gap   = daysTracked <= 14 ? 5 : 3
  const cellH = 44
  const totalW = days.length * (cellW + gap)
  const labelEvery = days.length <= 10 ? 2 : days.length <= 20 ? 4 : 6

  const fmt = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  // Summary sentence.
  const summary = dominant
    ? t('vikritiChart.summaryDominant', { count: daysTracked, label: LABEL[dominant] })
    : t('vikritiChart.summaryBalanced', { count: daysTracked })

  // Which quadrants to show in the legend — only those that occurred.
  const legendKeys = ['vata', 'pitta', 'kapha', 'balanced'].filter(k => counts[k] > 0)

  return (
    <div>
      <p className="font-body text-sm text-on-surface mb-1">{summary}</p>
      <p className="font-label text-[11px] text-on-surface-variant/60 mb-4">
        {t('vikritiChart.cellHint')}
      </p>

      <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        <svg
          width={Math.max(totalW, 280)}
          height={cellH + 22}
          className="block"
          role="img"
          aria-label={`${summary}. ${legendKeys.map(k => t('vikritiChart.ariaDays', { label: LABEL[k], count: counts[k] })).join(', ')}.`}
        >
          {days.map((d, i) => {
            const x = i * (cellW + gap)
            const key = d.vikriti || 'balanced'
            return (
              <g key={d.date}>
                <rect
                  x={x}
                  y={0}
                  width={cellW}
                  height={cellH}
                  rx={3}
                  fill={COLOR[key]}
                  opacity={d.vikriti ? 0.9 : 0.45}
                >
                  <title>{t('vikritiChart.tooltip', { date: fmt(d.date), label: LABEL[key], energy: d.energy, stress: d.stress })}</title>
                </rect>
                {i % labelEvery === 0 && (
                  <text
                    x={x + cellW / 2}
                    y={cellH + 15}
                    textAnchor="middle"
                    className="fill-on-surface-variant/40 font-label"
                    fontSize="9"
                  >
                    {fmt(d.date)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {legendKeys.map(k => (
          <div key={k} className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ backgroundColor: COLOR[k], opacity: k === 'balanced' ? 0.45 : 0.9 }}
            />
            <span className="font-label text-[11px] text-on-surface-variant/70">
              {LABEL[k]} · {counts[k]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
