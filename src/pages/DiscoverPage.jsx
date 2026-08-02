// ─────────────────────────────────────────────────────────────────────────────
//  DiscoverPage — the browse HUB
//
//  This page was one long scroll of parallel sections: search, a food strip,
//  meal guidance, popular searches, eight category tiles, quick routines,
//  programs, 76 asanas and breathwork. Everything sat at one level, so nothing
//  was prioritised and the page could only get longer as the app grew. It read
//  as a dump rather than a way in.
//
//  It is now search + five destinations. The depth moved to dedicated pages
//  (DiscoverPractices / Breathwork / Foods / Programs), each of which can grow
//  without making this screen worse — the property the flat version never had.
//
//  WHAT STAYS ON THE HUB, AND WHY
//  ──────────────────────────────
//  • SEARCH, because it is the fastest path for anyone who knows what they
//    want, and it spans everything — it answers with poses AND foods.
//  • POPULAR SEARCHES, because they are shortcuts INTO search rather than a
//    content section: one compact row that teaches what the box can answer.
//  Everything else is a door.
//
//  Search results still render inline rather than navigating, so typing never
//  costs you your place. Submitting opens /recommendations, which searches
//  practices and foods both.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { POPULAR_SEARCHES } from '../data/recommendations'
import { ASANAS } from '../data/asanas'
import { localizeAsana, sanskritLabel } from '../i18n/contentI18n'
import PoseFigure, { hasPoseImage } from '../components/PoseFigure'
import { track, EVENTS } from '../lib/track'
import useScrollDepth from '../hooks/useScrollDepth'
import { searchIngredients, coverageStats } from '../lib/ingredients'
import { exclusionFor } from '../lib/dietSafety'
import { useDietPrefs } from '../hooks/useDietPrefs'
import { FoodResultRow } from '../components/discover/cards'

const ALL_ASANAS = Object.values(ASANAS)

// The five doors. Ordered by how often someone opens them, not by how much
// content sits behind them — practice first, because that is what the app is.
const DESTINATIONS = [
  { key: 'practices',  to: '/discover/practices',  icon: 'accessibility_new', gradient: 'from-[#467539] to-[#7ba86b]' },
  { key: 'breathwork', to: '/discover/breathwork', icon: 'air',            gradient: 'from-[#5e7b8f] to-[#a8c8d4]' },
  { key: 'foods',      to: '/discover/foods',      icon: 'nutrition',      gradient: 'from-[#a87b5e] to-[#e8c8a8]' },
  { key: 'programs',   to: '/discover/programs',   icon: 'calendar_month', gradient: 'from-[#8b7ba8] to-[#c8b8e8]' },
  { key: 'dinacharya', to: '/dinacharya',          icon: 'wb_twilight',    gradient: 'from-[#c4873a] to-[#f0d087]' },
]

export default function DiscoverPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const { prefs: dietPrefs } = useDietPrefs()
  useScrollDepth('discover')

  const q = searchQuery.trim()
  const searching = q.length >= 2

  // Names match on substring — people type partial transliterations ("vrks").
  // Prose matches only at a WORD BOUNDARY: raw substring matching once made
  // "mal" match Tree Pose, whose benefits mention "small" stabilising muscles.
  const matchedAsanas = useMemo(() => {
    const needle = q.toLowerCase()
    if (needle.length < 2) return []
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const atWordStart = new RegExp(`\\b${escaped}`, 'i')
    const scored = []
    for (const a of ALL_ASANAS) {
      const nameHit = a.sanskrit.toLowerCase().includes(needle) || a.english.toLowerCase().includes(needle)
      const proseHit = atWordStart.test(a.category)
        || a.bodyParts.some((p) => atWordStart.test(p))
        || a.benefits.some((b) => atWordStart.test(b))
      if (nameHit || proseHit) scored.push({ asana: a, score: nameHit ? 2 : 1 })
    }
    return scored.sort((x, y) => y.score - x.score).map((s) => s.asana).slice(0, 6)
  }, [q])

  const foodSearch = useMemo(() => searchIngredients(searchQuery), [searchQuery])
  const coverage = useMemo(() => coverageStats(), [])

  // The miss rate is the most useful signal for what to add to the dataset
  // next, and only knowable if misses are logged as deliberately as hits.
  // Debounced so a typed word logs once, not once per keystroke.
  useEffect(() => {
    if (!searching) return
    const id = setTimeout(() => {
      track(EVENTS.DIET_SEARCH, {
        query_len:    foodSearch.query.length,
        result_count: foodSearch.results.length,
        coverage_hit: !foodSearch.coverageMiss,
        source:       'discover',
      })
    }, 900)
    return () => clearTimeout(id)
  }, [searching, foodSearch])

  function handleSearch(query) {
    const value = (query || searchQuery).trim()
    if (value.length < 2) return
    track(EVENTS.SEARCH_SUBMITTED, { query: value, source: 'discover' })
    navigate('/recommendations', { state: { query: value } })
  }

  const nothingMatched = searching && matchedAsanas.length === 0 && foodSearch.results.length === 0

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      <div className="flex items-center justify-between px-6 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="material-symbols-outlined text-primary">explore</span>
          <span className="font-headline italic text-primary text-base">{t('discover.title')}</span>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center"
          aria-label={t('discover.profileAria')}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
        </button>
      </div>

      <div className="px-6 flex flex-col gap-6">

        {/* ── Search ── */}
        <div className="stagger-1">
          <h1 className="font-headline text-2xl text-on-surface mb-1">{t('discover.heroTitle')}</h1>
          <p className="font-body text-sm text-on-surface-variant mb-4">{t('discover.heroSubtitle')}</p>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-lg">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
              placeholder={t('discover.searchPlaceholder')}
              className="w-full bg-surface-container-low rounded-2xl pl-11 pr-12 py-4 text-on-surface font-body text-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/35"
              aria-label={t('discover.searchAria')}
            />
            {searchQuery.length > 0 && (
              <button
                onClick={() => handleSearch()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-all"
                aria-label={t('discover.searchSubmitAria')}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-on-primary text-sm">arrow_forward</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Inline results ─────────────────────────────────────────────
            Shown while typing so the hub doesn't vanish underneath you.
            Capped at six per kind; submitting opens the full results page. */}
        {searching && matchedAsanas.length > 0 && (
          <div className="stagger-2">
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-2.5">
              {t('discover.asanasMatching', { query: q })}
            </p>
            <div className="flex flex-col gap-2">
              {matchedAsanas.map((asana) => {
                const la = localizeAsana(asana)
                return (
                  <button
                    key={asana.id}
                    onClick={() => {
                      track(EVENTS.ASANA_CARD_TAPPED, { asana_id: asana.id, source: 'discover_search_results' })
                      navigate(`/asana/${asana.id}`)
                    }}
                    className="flex items-center gap-3.5 bg-surface-container-low rounded-xl p-3 text-left active:scale-[0.98] transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {asana.poseKey && hasPoseImage(asana.poseKey) ? (
                        <PoseFigure poseKey={asana.poseKey} size="xs" breathing={false} objectPosition="center" />
                      ) : (
                        <span aria-hidden="true" className="material-symbols-outlined text-primary text-2xl">{asana.icon}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-semibold text-on-surface">{sanskritLabel(la)}</p>
                      <p className="font-body text-xs text-on-surface-variant/60">{la.english}</p>
                    </div>
                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {searching && foodSearch.results.length > 0 && (
          <div className="stagger-2">
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-2.5">
              {t('diet.resultsMatching', { query: q })}
            </p>
            <div className="flex flex-col gap-2">
              {foodSearch.results.map((ing) => (
                <FoodResultRow
                  key={ing.id}
                  ingredient={ing}
                  t={t}
                  exclusion={exclusionFor(ing, dietPrefs)}
                  onTap={() => navigate(`/ingredient/${ing.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {nothingMatched && (
          <div className="stagger-2 bg-surface-container-low rounded-2xl p-4" role="status">
            <p className="font-body text-sm font-semibold text-on-surface">{t('diet.miss.title')}</p>
            <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">{t('diet.miss.body')}</p>
          </div>
        )}

        {/* ── The five doors ─────────────────────────────────────────────
            Hidden while searching: results are the answer then, and a grid of
            destinations underneath them is just noise. */}
        {!searching && (
          <div className="stagger-2">
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-3">
              {t('discover.browse')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DESTINATIONS.map((d, i) => (
                <button
                  key={d.key}
                  onClick={() => {
                    track(EVENTS.CTA_CLICKED, { cta_id: `discover_hub_${d.key}`, route_name: 'discover' })
                    navigate(d.to)
                  }}
                  className={`relative overflow-hidden rounded-2xl p-4 text-left active:scale-[0.97] transition-all flex flex-col ${
                    // The last card is alone on its row when the count is odd;
                    // spanning it keeps the grid from ending on a ragged half.
                    i === DESTINATIONS.length - 1 && DESTINATIONS.length % 2 === 1
                      ? 'col-span-2 min-h-[96px]'
                      : 'min-h-[124px]'
                  }`}
                >
                  <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-br ${d.gradient} opacity-15`} />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="w-10 h-10 rounded-full bg-surface/80 flex items-center justify-center mb-2.5">
                      <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">{d.icon}</span>
                    </div>
                    <p className="font-body text-sm font-semibold text-on-surface">{t(`discover.hub.${d.key}.title`)}</p>
                    <p className="font-body text-xs text-on-surface-variant mt-0.5 leading-snug">
                      {t(`discover.hub.${d.key}.sub`, { poses: ALL_ASANAS.length, foods: coverage.reviewed })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Popular searches ───────────────────────────────────────────
            Kept on the hub because they are shortcuts INTO search, not a
            content section — they teach what the box above can answer. */}
        {!searching && (
          <div className="stagger-3">
            <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-2.5">
              {t('discover.popularSearches')}
            </p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((item, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(item.query)}
                  className="flex items-center gap-1.5 bg-surface-container-low rounded-full min-h-11 px-4 active:scale-95 transition-all"
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-primary text-sm">{item.icon}</span>
                  <span className="font-body text-sm text-on-surface">
                    {t(`discover.popularSearch.${item.labelKey}`, item.query)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
