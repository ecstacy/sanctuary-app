import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import usePracticeStats from '../hooks/usePracticeStats'
import { useIsPremium } from '../hooks/useIsPremium'
import { useVikritiHistory } from '../hooks/useVikritiHistory'
import VikritiHistoryChart from '../components/VikritiHistoryChart'
import PaywallSheet from '../components/PaywallSheet'
import { track, EVENTS } from '../lib/track'


const PERIOD_KEYS = ['1d', '1w', '1m', 'all']

// ── Yogi level system. title/subtitle are localized at render via
// journey.levels.<level>; this table holds thresholds + icons only. ──
const YOGI_LEVELS = [
  { level: 1, minMinutes: 0, icon: 'spa' },
  { level: 2, minMinutes: 60, icon: 'self_improvement' },
  { level: 3, minMinutes: 300, icon: 'local_fire_department' },
  { level: 4, minMinutes: 900, icon: 'park' },
  { level: 5, minMinutes: 1800, icon: 'water' },
  { level: 6, minMinutes: 3600, icon: 'light_mode' },
  { level: 7, minMinutes: 7200, icon: 'auto_awesome' },
]

function getCurrentLevel(totalMinutes) {
  let current = YOGI_LEVELS[0]
  for (const lvl of YOGI_LEVELS) {
    if (totalMinutes >= lvl.minMinutes) current = lvl
    else break
  }
  return current
}

function getNextLevel(totalMinutes) {
  for (const lvl of YOGI_LEVELS) {
    if (totalMinutes < lvl.minMinutes) return lvl
  }
  return null
}

// ── Mini chart component (pure SVG) ──
function ActivityChart({ data, period }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language || 'en'
  if (data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-on-surface-variant/20 text-4xl mb-2 block">bar_chart</span>
          <p className="font-body text-sm text-on-surface-variant/40">{t('journey.chartEmpty')}</p>
          <p className="font-body text-xs text-on-surface-variant/25 mt-1">{t('journey.chartEmptyHint')}</p>
        </div>
      </div>
    )
  }

  const maxMinutes = Math.max(...data.map(d => d.minutes), 1)
  const barWidth = data.length <= 7 ? 28 : data.length <= 14 ? 18 : 10
  const gap = data.length <= 7 ? 12 : data.length <= 14 ? 6 : 3
  const chartH = 140
  const totalW = data.length * (barWidth + gap)

  // Format date label
  const formatLabel = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00')
    if (period === '1d') {
      return d.toLocaleDateString(locale, { weekday: 'short' })
    }
    if (data.length <= 7) {
      return d.toLocaleDateString(locale, { weekday: 'short' })
    }
    return `${d.getDate()}/${d.getMonth() + 1}`
  }

  // Show labels for subset of bars
  const labelEvery = data.length <= 7 ? 1 : data.length <= 14 ? 2 : 5

  return (
    <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
      <svg width={Math.max(totalW, 280)} height={chartH + 30} className="mx-auto block">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(frac => (
          <line
            key={frac}
            x1={0}
            y1={chartH - chartH * frac}
            x2={totalW}
            y2={chartH - chartH * frac}
            stroke="currentColor"
            className="text-outline-variant/10"
            strokeDasharray="4,4"
          />
        ))}

        {data.map((d, i) => {
          const x = i * (barWidth + gap) + gap / 2
          const h = Math.max((d.minutes / maxMinutes) * chartH, d.minutes > 0 ? 4 : 0)
          const y = chartH - h
          const isToday = d.date === new Date().toISOString().slice(0, 10)

          return (
            <g key={d.date}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                rx={barWidth / 4}
                className={d.minutes > 0
                  ? isToday ? 'fill-primary' : 'fill-primary/50'
                  : 'fill-surface-container-high/50'
                }
              />
              {/* Zero state dot */}
              {d.minutes === 0 && (
                <circle cx={x + barWidth / 2} cy={chartH - 2} r={2} className="fill-surface-container-high" />
              )}
              {/* Minutes label on bar */}
              {d.minutes > 0 && h > 16 && (
                <text
                  x={x + barWidth / 2}
                  y={y + 14}
                  textAnchor="middle"
                  className="fill-on-primary font-label"
                  fontSize="8"
                  fontWeight="600"
                >
                  {Math.round(d.minutes)}
                </text>
              )}
              {/* X-axis label */}
              {i % labelEvery === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={chartH + 16}
                  textAnchor="middle"
                  className="fill-on-surface-variant/40 font-label"
                  fontSize="9"
                >
                  {formatLabel(d.date)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function JourneyPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [period, setPeriod] = useState('1w')
  const stats = usePracticeStats()

  // ── Vikriti history (Plus insight) ──────────────────────────────────────
  // Free users get today's reading on home; Plus users also get the
  // longitudinal pattern here. Teaser → paywall for non-Plus.
  const { isPremium } = useIsPremium()
  const vikritiHistory = useVikritiHistory(30)
  const [historyPaywallOpen, setHistoryPaywallOpen] = useState(false)

  // Impression denominator for the Plus chart (fires once it has data), so
  // the unlock CTA (free) and the rendered chart (Plus) are both measurable.
  const histImpressionRef = useRef(false)
  useEffect(() => {
    if (histImpressionRef.current) return
    if (isPremium && !vikritiHistory.isLoading && vikritiHistory.daysTracked > 0) {
      histImpressionRef.current = true
      track(EVENTS.CONTENT_IMPRESSION, {
        surface:       'vikriti_history',
        content_type:  'insight',
        is_premium:    true,
        days_tracked:  vikritiHistory.daysTracked,
        dominant:      vikritiHistory.dominant,
      })
    }
  }, [isPremium, vikritiHistory.isLoading, vikritiHistory.daysTracked, vikritiHistory.dominant])

  const dailyData = stats.getDailyData(period)
  const filteredSessions = stats.getFilteredSessions(period)

  const periodMinutes = Math.round(filteredSessions.reduce((s, x) => s + (x.durationSeconds || 0), 0) / 60)
  const periodSessions = filteredSessions.length
  const periodPoses = filteredSessions.reduce((s, x) => s + (x.completedCount || 0), 0)

  const currentLevel = getCurrentLevel(stats.totalMinutes)
  const nextLevel = getNextLevel(stats.totalMinutes)
  // Localized title/subtitle for any level row.
  const levelTitle = (lvl) => t(`journey.levels.${lvl.level}.title`)
  const levelSubtitle = (lvl) => t(`journey.levels.${lvl.level}.subtitle`)
  const progressToNext = nextLevel
    ? Math.min(((stats.totalMinutes - currentLevel.minMinutes) / (nextLevel.minMinutes - currentLevel.minMinutes)) * 100, 100)
    : 100

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      {/* Header */}
      <div className="px-6 pt-3 pb-2 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center" aria-label={t('journey.goBack')}>
          <span className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>
        <h1 className="font-headline text-xl text-on-surface">{t('journey.title')}</h1>
      </div>

      <div className="px-6 flex flex-col gap-5">

        {/* ── Streak & Stats Hero ── */}
        <div className="grid grid-cols-2 gap-3 stagger-1">
          <div className="bg-primary rounded-xl p-5 text-on-primary relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">local_fire_department</span>
            </div>
            <p className="font-label text-[9px] uppercase tracking-widest text-on-primary/60 mb-1">{t('journey.dayStreak')}</p>
            <p className="font-headline text-4xl leading-none">{stats.streak}</p>
            <p className="font-body text-xs text-on-primary/60 mt-1">
              {stats.streak === 0 ? t('journey.streakStart') : stats.streak === 1 ? t('journey.streakDay') : t('journey.streakDays')}
            </p>
          </div>
          <div className="bg-secondary-container/30 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">schedule</span>
            </div>
            <p className="font-label text-[9px] uppercase tracking-widest text-on-surface-variant/60 mb-1">{t('journey.thisWeek')}</p>
            <p className="font-headline text-4xl text-on-surface leading-none">{stats.weekMinutes}</p>
            <p className="font-body text-xs text-on-surface-variant/60 mt-1">{t('journey.minutes')}</p>
          </div>
        </div>

        {/* ── Yogi Level ── */}
        <div className="bg-surface-container-low rounded-xl p-5 stagger-2">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">{currentLevel.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-label text-[9px] text-primary uppercase tracking-widest">{t('journey.level', { n: currentLevel.level })}</p>
              <h3 className="font-headline text-xl text-on-surface">{levelTitle(currentLevel)}</h3>
              <p className="font-body text-xs text-on-surface-variant">{levelSubtitle(currentLevel)}</p>
            </div>
          </div>

          {nextLevel ? (
            <>
              <div className="flex justify-between mb-1.5">
                <p className="font-label text-[9px] text-on-surface-variant/60 uppercase tracking-widest">
                  {t('journey.progressTo', { title: levelTitle(nextLevel) })}
                </p>
                <p className="font-label text-[9px] text-primary uppercase tracking-widest">
                  {t('journey.minProgress', { current: stats.totalMinutes, total: nextLevel.minMinutes })}
                </p>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </>
          ) : (
            <p className="font-body text-xs text-primary text-center italic">
              {t('journey.highestLevel')}
            </p>
          )}

          {/* Future levels preview */}
          {nextLevel && (
            <div className="mt-4 pt-3 border-t border-surface-container-high/50">
              <p className="font-label text-[9px] text-on-surface-variant/40 uppercase tracking-widest mb-2.5">{t('journey.comingUp')}</p>
              <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {YOGI_LEVELS.filter(l => l.level > currentLevel.level).slice(0, 3).map(lvl => (
                  <div
                    key={lvl.level}
                    className={`flex items-center gap-2.5 flex-shrink-0 px-3 py-2 rounded-lg ${
                      lvl.level === currentLevel.level + 1
                        ? 'bg-primary-fixed/50'
                        : 'bg-surface-container-high/30'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-sm ${
                      lvl.level === currentLevel.level + 1 ? 'text-primary' : 'text-on-surface-variant/30'
                    }`}>{lvl.icon}</span>
                    <div>
                      <p className={`font-label text-[10px] font-medium ${
                        lvl.level === currentLevel.level + 1 ? 'text-on-surface' : 'text-on-surface-variant/40'
                      }`}>{levelTitle(lvl)}</p>
                      <p className="font-label text-[8px] text-on-surface-variant/30">{t('journey.minShort', { n: lvl.minMinutes })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Activity Chart ── */}
        <div className="bg-surface-container-low rounded-xl p-5 stagger-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-lg text-on-surface">{t('journey.activity')}</h3>
          </div>

          {/* Period filter tabs */}
          <div className="flex gap-2 mb-5">
            {PERIOD_KEYS.map(key => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-3.5 py-1.5 rounded-full font-label text-[10px] uppercase tracking-widest transition-all ${
                  period === key
                    ? 'bg-primary text-on-primary font-semibold'
                    : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {t(`journey.periods.${key}`)}
              </button>
            ))}
          </div>

          {/* Chart */}
          <ActivityChart data={dailyData} period={period} />

          {/* Period summary */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-surface-container-high/30">
            <div className="text-center">
              <p className="font-headline text-xl text-on-surface">{periodMinutes}</p>
              <p className="font-label text-[8px] text-on-surface-variant/50 uppercase tracking-widest">{t('journey.summaryMinutes')}</p>
            </div>
            <div className="text-center">
              <p className="font-headline text-xl text-on-surface">{periodSessions}</p>
              <p className="font-label text-[8px] text-on-surface-variant/50 uppercase tracking-widest">{t('journey.summarySessions')}</p>
            </div>
            <div className="text-center">
              <p className="font-headline text-xl text-on-surface">{periodPoses}</p>
              <p className="font-label text-[8px] text-on-surface-variant/50 uppercase tracking-widest">{t('journey.summaryPoses')}</p>
            </div>
          </div>
        </div>

        {/* ── Vikriti pattern over time (Plus insight) ── */}
        <div className="bg-surface-container rounded-xl p-5 stagger-4">
          <div className="flex items-center gap-2 mb-4">
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">insights</span>
            <h3 className="font-headline text-base text-on-surface leading-tight">{t('journey.doshaOverTime')}</h3>
          </div>

          {isPremium ? (
            <VikritiHistoryChart history={vikritiHistory} />
          ) : (
            <button
              onClick={() => {
                track(EVENTS.CTA_CLICKED, { cta_id: 'vikriti_history_unlock', route_name: 'journey' })
                setHistoryPaywallOpen(true)
              }}
              className="w-full text-left"
              aria-label={t('journey.unlockAria')}
            >
              <p className="font-body text-sm text-on-surface-variant/85 leading-relaxed mb-3">
                {t('journey.doshaTeaser')}
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-container/60">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-[13px]">lock</span>
                <span className="font-label text-[11px] font-semibold text-primary uppercase tracking-wide">{t('journey.unlockWithPlus')}</span>
              </span>
            </button>
          )}
        </div>

        {/* ── Lifetime Stats ── */}
        <div className="bg-surface-container-low rounded-xl p-5 stagger-4">
          <h3 className="font-headline text-lg text-on-surface mb-4">{t('journey.lifetime')}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-container rounded-lg p-4">
              <span className="material-symbols-outlined text-primary text-lg mb-2 block">schedule</span>
              <p className="font-headline text-2xl text-on-surface">{stats.totalMinutes}</p>
              <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest">{t('journey.totalMinutes')}</p>
            </div>
            <div className="bg-surface-container rounded-lg p-4">
              <span className="material-symbols-outlined text-primary text-lg mb-2 block">self_improvement</span>
              <p className="font-headline text-2xl text-on-surface">{stats.totalSessions}</p>
              <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest">{t('journey.totalSessions')}</p>
            </div>
            <div className="bg-surface-container rounded-lg p-4">
              <span className="material-symbols-outlined text-primary text-lg mb-2 block">local_fire_department</span>
              <p className="font-headline text-2xl text-on-surface">{stats.longestStreak}</p>
              <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest">{t('journey.bestStreak')}</p>
            </div>
            <div className="bg-surface-container rounded-lg p-4">
              <span className="material-symbols-outlined text-primary text-lg mb-2 block">today</span>
              <p className="font-headline text-2xl text-on-surface">{stats.todayMinutes}</p>
              <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest">{t('journey.today')}</p>
            </div>
          </div>
        </div>

        {/* ── Recent Sessions ── */}
        {stats.sessions.length > 0 && (
          <div className="bg-surface-container-low rounded-xl p-5 stagger-5">
            <h3 className="font-headline text-lg text-on-surface mb-4">{t('journey.recentSessions')}</h3>
            <div className="flex flex-col gap-2">
              {[...stats.sessions].reverse().slice(0, 10).map(session => {
                const d = new Date(session.timestamp)
                return (
                  <div key={session.id} className="flex items-center gap-3 bg-surface-container rounded-lg px-4 py-3">
                    <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-sm">self_care</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-on-surface font-medium truncate">
                        {session.routineLabel || session.routineKey}
                      </p>
                      <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest">
                        {d.toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })} · {d.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-headline text-sm text-on-surface">
                        {Math.round(session.durationSeconds / 60)}{t('journey.minAbbrev')}
                      </p>
                      <p className="font-label text-[8px] text-on-surface-variant/40 uppercase">
                        {t('journey.posesCount', { done: session.completedCount, total: session.totalPoses })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Start practicing CTA ── */}
        {stats.totalSessions === 0 && (
          <div className="bg-primary-container/20 rounded-xl p-6 text-center stagger-3">
            <span className="material-symbols-outlined text-primary text-4xl mb-3 block">self_improvement</span>
            <h3 className="font-headline text-xl text-on-surface mb-2">{t('journey.beginTitle')}</h3>
            <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4">
              {t('journey.beginBody')}
            </p>
            <button
              onClick={() => navigate('/routine', { state: { routineKey: 'stress' } })}
              className="px-6 py-3 bg-primary text-on-primary rounded-full font-label text-xs font-semibold tracking-wide active:scale-95 transition-all"
            >
              {t('journey.beginCta')}
            </button>
          </div>
        )}

      </div>

      <PaywallSheet
        open={historyPaywallOpen}
        onClose={() => setHistoryPaywallOpen(false)}
        surface="vikriti_history"
        headline={t('journey.paywallHeadline')}
        subhead={t('journey.paywallSubhead')}
      />

    </div>
  )
}
