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
const COLOR = {
  vata:     '#7b93a8',
  pitta:    '#c47a3a',
  kapha:    '#6b8f5e',
  balanced: '#cbd2cc',
}
const LABEL = { vata: 'Vata', pitta: 'Pitta', kapha: 'Kapha', balanced: 'Balanced' }

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }

export default function VikritiHistoryChart({ history }) {
  const { days, counts, dominant, daysTracked, windowDays } = history

  if (daysTracked === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-center">
        <div>
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/20 text-4xl mb-2 block">insights</span>
          <p className="font-body text-sm text-on-surface-variant/40">No check-ins yet</p>
          <p className="font-body text-xs text-on-surface-variant/25 mt-1">A pre-practice check-in starts your timeline</p>
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
    ? `Mostly ${LABEL[dominant]} over your last ${daysTracked} check-in ${daysTracked === 1 ? 'day' : 'days'}`
    : `Balanced over your last ${daysTracked} check-in ${daysTracked === 1 ? 'day' : 'days'}`

  // Which quadrants to show in the legend — only those that occurred.
  const legendKeys = ['vata', 'pitta', 'kapha', 'balanced'].filter(k => counts[k] > 0)

  return (
    <div>
      <p className="font-body text-sm text-on-surface mb-1">{summary}</p>
      <p className="font-label text-[11px] text-on-surface-variant/60 mb-4">
        Each cell is one day, colored by the dosha your energy &amp; stress pointed to.
      </p>

      <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        <svg
          width={Math.max(totalW, 280)}
          height={cellH + 22}
          className="block"
          role="img"
          aria-label={`${summary}. ${legendKeys.map(k => `${LABEL[k]} ${counts[k]} days`).join(', ')}.`}
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
                  <title>{`${fmt(d.date)} — ${LABEL[key]} (energy ${d.energy}, stress ${d.stress})`}</title>
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
