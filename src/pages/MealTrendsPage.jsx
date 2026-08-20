// ─────────────────────────────────────────────────────────────────────────────
//  MealTrendsPage — "how have my meals leaned, week by week?"
//
//  Reached by tapping the "Your patterns lately" card on Meal Check. Reads the
//  user's meal_logs and shows a per-week dosha lean (computeWeeklyTrends) plus
//  the recency-weighted "lately" headline (computeDietProfile) — the same pure
//  folds the card uses, so the two never disagree. No invented facts: every
//  number comes from logged assessments.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { listMealLogs } from '../lib/mealLog'
import { computeWeeklyTrends, computeDietProfile, hasDietPattern } from '../lib/dietProfile'
import { doshaDisplayName } from '../i18n/contentI18n'
import { GEM_HUE } from '../components/DoshaGem'
import { track } from '../lib/track'

const WEEKS = 8
const FETCH = 80 // enough logs to cover ~8 weeks for most users

// A week's peak lean magnitude → a 0..1 bar fill (clamped; the verdict is
// directional, so a strong week just fills the bar, it isn't a precise scale).
function fillFor(week) {
  if (!week.dominant) return 0
  return Math.min(1, Math.max(0.12, week.doshaAvg[week.dominant]))
}

function weekLabel(weekStart) {
  const start = new Date(`${weekStart}T00:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const opts = { month: 'short', day: 'numeric' }
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`
}

export default function MealTrendsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [logs, setLogs] = useState(null) // null = loading

  useEffect(() => {
    if (!user?.id) { setLogs([]); return }
    listMealLogs(user.id, FETCH).then((rows) => setLogs(rows || []))
    track('meal_trends_viewed', {})
  }, [user?.id])

  const weeks = useMemo(() => (logs ? computeWeeklyTrends(logs, { weeks: WEEKS }) : []), [logs])
  const profile = useMemo(() => (logs ? computeDietProfile(logs) : null), [logs])

  // Newest week first — the latest stretch is what the user cares about most.
  const rows = [...weeks].reverse()
  const lately = hasDietPattern(profile) ? profile.dominant : null

  return (
    <div className="min-h-screen bg-background text-on-surface font-body px-6 pb-24">
      <header className="flex items-center py-4">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center"
          aria-label={t('common.back', 'Back')}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>
      </header>

      <div className="max-w-md mx-auto">
        <h1 className="font-headline text-2xl mb-1">{t('mealTrends.title', 'Your eating trends')}</h1>
        <p className="text-on-surface-variant text-sm mb-6">{t('mealTrends.subtitle', 'How your meals have leaned, week by week.')}</p>

        {logs === null ? (
          <div className="h-40" aria-hidden="true" />
        ) : rows.length === 0 ? (
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6 text-center">
            <span aria-hidden="true" className="material-symbols-outlined text-3xl text-on-surface-variant/40">insights</span>
            <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">
              {t('mealTrends.empty', 'Check a few meals and your weekly trends will appear here.')}
            </p>
          </div>
        ) : (
          <>
            {/* Recency-weighted headline — matches the Meal Check card. */}
            <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 mb-5">
              <p className="font-label text-[11px] uppercase tracking-[0.15em] text-primary mb-1.5">
                {t('mealTrends.latelyLabel', 'Lately')}
              </p>
              <p className="font-body text-base text-on-surface leading-relaxed">
                {lately
                  ? t('mealTrends.latelyLean', { dosha: doshaDisplayName(lately), defaultValue: 'Your recent meals lean {{dosha}}-aggravating.' })
                  : t('mealTrends.latelyBalanced', 'Your recent meals have been fairly balanced.')}
              </p>
            </div>

            <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
              {t('mealTrends.byWeek', 'By week')}
            </p>
            <div className="space-y-2.5">
              {rows.map((w) => {
                const hue = w.dominant ? GEM_HUE[w.dominant].base : null
                const fill = fillFor(w)
                return (
                  <div key={w.weekStart} className="bg-surface-container-low border border-outline-variant rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <span className="font-body text-sm text-on-surface">{weekLabel(w.weekStart)}</span>
                      {w.dominant ? (
                        <span
                          className="shrink-0 text-[11px] font-label uppercase tracking-wide px-2.5 py-1 rounded-full"
                          style={{ background: `${hue}22`, color: hue }}
                        >
                          ↑ {doshaDisplayName(w.dominant)}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[11px] font-label uppercase tracking-wide px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                          {t('mealTrends.balanced', 'Balanced')}
                        </span>
                      )}
                    </div>
                    <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.round((w.dominant ? fill : 0.06) * 100)}%`, background: hue || 'var(--color-outline)' }}
                      />
                    </div>
                    <p className="mt-2 text-[11px] text-on-surface-variant/70">
                      {t('mealTrends.checkCount', { count: w.count, defaultValue: '{{count}} checks' })}
                    </p>
                  </div>
                )
              })}
            </div>

            <p className="text-[11px] text-on-surface-variant/60 leading-relaxed mt-5">
              {t('mealTrends.footnote', 'Based on the meals you’ve checked. The more you log, the clearer the picture.')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
