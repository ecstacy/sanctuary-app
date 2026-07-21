import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { POPULAR_SEARCHES } from '../data/recommendations'
import { ASANAS } from '../data/asanas'
import { localizeAsana, localizePranayama, sanskritLabel } from '../i18n/contentI18n'
import { PRANAYAMAS } from '../data/pranayamas'
import PoseFigure, { hasPoseImage } from '../components/PoseFigure'
import { track, EVENTS } from '../lib/track'
import useScrollDepth from '../hooks/useScrollDepth'
import useImpression from '../hooks/useImpression'
import { useIsPremium } from '../hooks/useIsPremium'
import { isAsanaFree, isPranayamaFree } from '../lib/premiumTiers'
import PaywallSheet from '../components/PaywallSheet'
import { searchIngredients, coverageStats, REVIEWED_INGREDIENTS } from '../lib/ingredients'
import { exclusionFor } from '../lib/dietSafety'
import { useDietPrefs } from '../hooks/useDietPrefs'


const ALL_ASANAS = Object.values(ASANAS)

// Icon per food category. Purely decorative — every card also carries the
// food's name as text, so nothing depends on recognising the glyph.
const FOOD_ICONS = {
  grain: 'grain', legume: 'nutrition', vegetable: 'eco', fruit: 'nutrition',
  dairy: 'water_full', spice: 'local_fire_department', oil: 'water_drop',
  nut_seed: 'spa', sweetener: 'icecream', beverage: 'local_cafe',
  animal: 'set_meal', other: 'restaurant',
}

// ─── FoodResultRow ────────────────────────────────────────────────────────
// One reviewed ingredient in the Discover search results. Shows the
// confidence badge inline: whether a claim is classically cited or derived
// from properties is part of the result, not a detail-page footnote.
function FoodResultRow({ ingredient, onTap, t, exclusion }) {
  const excluded = exclusion?.excluded
  return (
    <button
      onClick={onTap}
      className="flex items-center gap-3.5 bg-surface-container-low rounded-xl p-3 text-left active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
        <span aria-hidden="true" className="material-symbols-outlined text-primary text-xl">
          {FOOD_ICONS[ingredient.category] || FOOD_ICONS.other}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-semibold text-on-surface">{ingredient.name}</p>
        {ingredient.sanskrit && (
          <p className="font-body text-xs text-on-surface-variant/60">{ingredient.sanskrit}</p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label text-[8px] uppercase tracking-wide text-on-surface-variant">
            {t(`diet.confidence.${ingredient.confidence}`)}
          </span>
          {/* An excluded food still appears in SEARCH — hiding it would look
              like a coverage gap and leave the user wondering. It is labelled
              instead, and the allergen wording stays distinct from the
              preference wording, as everywhere else. */}
          {excluded && (
            <span className={`px-2 py-0.5 rounded-full font-label text-[8px] uppercase tracking-wide ${
              exclusion.reason === 'allergen'
                ? 'bg-error-container/70 text-on-error-container'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}>
              {exclusion.reason === 'allergen'
                ? t('diet.badge.allergen', { key: t(`diet.allergens.${exclusion.key}`, exclusion.key) })
                : t('diet.badge.pattern',  { key: t(`diet.patterns.${exclusion.key}`,  exclusion.key) })}
            </span>
          )}
        </div>
      </div>
      <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
    </button>
  )
}

// ─── ExploreAsanaCard ────────────────────────────────────────────────────
// One card per asana in the horizontal Explore strip. Extracted so each
// card can call `useImpression` legally (one hook per component). With the
// strip being horizontally-scrolled, off-screen cards never fire — exactly
// what we want for an honest CTR denominator.
function ExploreAsanaCard({ asana, position, locked, onTap }) {
  const { t } = useTranslation()
  const la = localizeAsana(asana)
  const ref = useImpression({
    surface:     'discover_explore_asanas',
    contentType: 'asana',
    contentId:   asana.id,
    position,
  })
  return (
    <button
      ref={ref}
      onClick={onTap}
      aria-label={locked
        ? t('discover.plusAria', { name: la.english })
        : t('discover.itemAria', { english: la.english, sanskrit: la.sanskrit })}
      className="flex-shrink-0 w-36 snap-start active:scale-[0.97] transition-all text-left"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 bg-gradient-to-br from-primary-container/30 to-primary/10">
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${locked ? 'opacity-40' : ''}`}>
          {asana.poseKey ? (
            <PoseFigure poseKey={asana.poseKey} size="sm" breathing={false} objectPosition="center" />
          ) : (
            <span aria-hidden="true" className="material-symbols-outlined text-primary/30 text-6xl">{asana.icon}</span>
          )}
        </div>
        {asana.level && asana.level !== 'Beginner' && !locked && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-surface/90 backdrop-blur-sm rounded-full font-label text-[9px] text-primary uppercase tracking-wide">
              {asana.level}
            </span>
          </div>
        )}
        {/* Locked-card treatment — a darker gradient fade at the bottom +
            a prominent "Unlock with Plus" band that reads as an action
            hint rather than a passive badge. The previous tiny top-left
            chip was easy to miss; this gives the eye a clear answer to
            "what is this card asking me to do". */}
        {locked && (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-on-surface/35 to-transparent pointer-events-none"
            />
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1 px-2.5 py-1 rounded-full bg-surface/95 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-1 min-w-0">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-[11px] flex-shrink-0">lock</span>
                <span className="font-label text-[9px] font-semibold text-primary uppercase tracking-wider truncate">
                  {t('discover.unlockWithPlus')}
                </span>
              </div>
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-[11px] flex-shrink-0">arrow_forward</span>
            </div>
          </>
        )}
      </div>
      <p className="font-body text-sm text-on-surface leading-tight line-clamp-1">{la.english}</p>
      <p className="font-label text-[10px] text-on-surface-variant/60 leading-tight line-clamp-1 mt-0.5">{sanskritLabel(la)}</p>
    </button>
  )
}

// ─── PranayamaCard ────────────────────────────────────────────────────────
// One card per breath technique on the Discover Breathwork row. Same
// impression-tracking pattern as ExploreAsanaCard.
function PranayamaCard({ pranayama, position, locked, onTap }) {
  const { t } = useTranslation()
  const lp = localizePranayama(pranayama)
  const ref = useImpression({
    surface:     'discover_breathwork',
    contentType: 'pranayama',
    contentId:   pranayama.id,
    position,
  })
  const minutes = Math.round((pranayama.durationSeconds || 0) / 60)
  return (
    <button
      ref={ref}
      onClick={onTap}
      aria-label={locked
        ? t('discover.plusAria', { name: lp.english })
        : t('discover.itemAria', { english: lp.english, sanskrit: lp.sanskrit })}
      className="flex-shrink-0 w-44 snap-start active:scale-[0.97] transition-all text-left"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 bg-gradient-to-br from-primary-container/40 to-primary/10 flex items-center justify-center">
        <div className={locked ? 'opacity-40' : ''}>
          {pranayama.poseKey && hasPoseImage(pranayama.poseKey) ? (
            <PoseFigure poseKey={pranayama.poseKey} size="sm" breathing={false} objectPosition="center" />
          ) : (
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-7xl">{pranayama.icon || 'air'}</span>
          )}
        </div>
        {pranayama.level && pranayama.level !== 'beginner' && !locked && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-surface/90 backdrop-blur-sm rounded-full font-label text-[9px] text-primary uppercase tracking-wide">
              {pranayama.level}
            </span>
          </div>
        )}
        {/* For unlocked cards: minutes badge in bottom-right.
            For locked cards: the bottom is taken over by the Unlock band,
            so the minutes-chip moves up to the top-right to stay visible
            without competing with the call to action. */}
        {!locked && (
          <div className="absolute bottom-2 right-2">
            <span className="px-2 py-0.5 bg-surface/90 backdrop-blur-sm rounded-full font-label text-[9px] text-on-surface-variant uppercase tracking-wide">
              {minutes} {t('discover.minSuffix')}
            </span>
          </div>
        )}
        {locked && (
          <>
            <div
              aria-hidden="true"
              className="absolute top-2 right-2 px-2 py-0.5 bg-surface/80 backdrop-blur-sm rounded-full font-label text-[9px] text-on-surface-variant uppercase tracking-wide"
            >
              {minutes} {t('discover.minSuffix')}
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-on-surface/35 to-transparent pointer-events-none"
            />
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1 px-2.5 py-1 rounded-full bg-surface/95 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-1 min-w-0">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-[11px] flex-shrink-0">lock</span>
                <span className="font-label text-[9px] font-semibold text-primary uppercase tracking-wider truncate">
                  {t('discover.unlockWithPlus')}
                </span>
              </div>
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-[11px] flex-shrink-0">arrow_forward</span>
            </div>
          </>
        )}
      </div>
      <p className="font-body text-sm text-on-surface leading-tight line-clamp-1">{lp.english}</p>
      <p className="font-label text-[10px] text-on-surface-variant/60 leading-tight line-clamp-1 mt-0.5">{sanskritLabel(lp)}</p>
    </button>
  )
}

// ─── QuickRoutineCard ────────────────────────────────────────────────────
// Extracted so each card can call `useImpression` legally (one hook call per
// component). Visible for ≥1s at 50%+ → fires `content_impression`. Pair
// with `routine_card_tapped` for CTR.
function QuickRoutineCard({ routine, position, onTap }) {
  const ref = useImpression({
    surface:     'discover_quick_routines',
    contentType: 'routine',
    contentId:   routine.key,
    position,
  })
  return (
    <button
      ref={ref}
      onClick={onTap}
      className="flex items-center gap-4 bg-surface-container-low rounded-xl p-4 text-left active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
        <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">{routine.icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-semibold text-on-surface">{routine.label}</p>
        <p className="font-body text-xs text-on-surface-variant/60 mt-0.5">{routine.desc}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="font-label text-[10px] text-on-surface-variant/40 uppercase">{routine.time}</span>
        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
      </div>
    </button>
  )
}

// Browse categories — map to recommendation engine topics
// `query` is the recommendation-engine key (stays English); `labelKey`
// is the localized display label.
const CATEGORIES = [
  { query: 'Lower back pain', labelKey: 'discover.categories.back', icon: 'accessibility_new', gradient: 'from-[#6b8f5e] to-[#b8d4a8]' },
  { query: 'Neck pain', labelKey: 'discover.categories.neck', icon: 'self_care', gradient: 'from-[#a87b5e] to-[#e8c8a8]' },
  { query: 'Anxiety', labelKey: 'discover.categories.anxiety', icon: 'cloud', gradient: 'from-[#8b7ba8] to-[#c8b8e8]' },
  { query: 'Can\'t sleep', labelKey: 'discover.categories.sleep', icon: 'bedtime', gradient: 'from-[#5e6b8f] to-[#a8b8d4]' },
  { query: 'Low energy', labelKey: 'discover.categories.energy', icon: 'bolt', gradient: 'from-[#c4873a] to-[#f0d087]' },
  { query: 'Tight hips', labelKey: 'discover.categories.hips', icon: 'self_care', gradient: 'from-[#8f5e6b] to-[#d4a8b8]' },
  { query: 'Bloating', labelKey: 'discover.categories.digestion', icon: 'gastroenterology', gradient: 'from-[#8f8b5e] to-[#d4d0a8]' },
  { query: 'Posture', labelKey: 'discover.categories.posture', icon: 'straighten', gradient: 'from-[#5e7b8f] to-[#a8c8d4]' },
]

export default function DiscoverPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  useScrollDepth('discover')

  // Localized quick-routine + program lists. `key` routes the request and
  // keys the i18n strings; `min` formats with the localized unit.
  const QUICK_ROUTINES = [
    { key: 'stress', icon: 'psychiatry', min: 15 },
    { key: 'sleep', icon: 'bedtime', min: 12 },
    { key: 'energy', icon: 'bolt', min: 18 },
    { key: 'flexibility', icon: 'self_care', min: 20 },
  ].map(r => ({
    ...r,
    label: t(`discover.routines.${r.key}.label`),
    desc:  t(`discover.routines.${r.key}.desc`),
    time:  `${r.min} ${t('discover.minSuffix')}`,
  }))

  const PROGRAMS = [
    { key: 'morning7Day', icon: 'wb_twilight', min: 12 },
    { key: 'backPainSeries', icon: 'healing', min: 12 },
    { key: 'preBedWindDown', icon: 'nights_stay', min: 20 },
  ].map(r => ({
    ...r,
    label: t(`discover.programsList.${r.key}.label`),
    desc:  t(`discover.programsList.${r.key}.desc`),
    time:  `${r.min} ${t('discover.minSuffix')}`,
  }))

  // ── Premium entitlement + paywall sheet state ────────────────────────
  // `isPremium` gates which cards render the "Plus" lock badge and routes
  // their taps to the paywall instead of the detail page. Anonymous users
  // are treated as free — they see locks too, which doubles as a soft
  // signup nudge (the paywall asks them to sign in first).
  const { isPremium } = useIsPremium()
  const [paywall, setPaywall] = useState({ open: false, surface: null })

  function openPaywall(surface) {
    setPaywall({ open: true, surface })
  }

  // Filter asanas matching the search query.
  //
  // Names (sanskrit/english) match on a plain substring — people type partial
  // transliterations ("vrks", "bhuj"). Prose fields (category, bodyParts,
  // benefits) match only at a WORD BOUNDARY: a raw substring made "mal" match
  // Tree Pose, because its benefits mention the "small" stabilizing muscles.
  //
  // Name hits outrank prose hits so "mal" surfaces Malasana first rather than
  // whichever pose happens to mention the word in its description.
  const matchedAsanas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 2) return []
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const atWordStart = new RegExp(`\\b${escaped}`, 'i')
    const scored = []
    for (const a of ALL_ASANAS) {
      const nameHit =
        a.sanskrit.toLowerCase().includes(q) ||
        a.english.toLowerCase().includes(q)
      const proseHit =
        atWordStart.test(a.category) ||
        a.bodyParts.some(p => atWordStart.test(p)) ||
        a.benefits.some(b => atWordStart.test(b))
      if (nameHit || proseHit) scored.push({ asana: a, score: nameHit ? 2 : 1 })
    }
    return scored.sort((x, y) => y.score - x.score).map(s => s.asana)
  }, [searchQuery])

  const showAsanaResults = searchQuery.trim().length >= 2 && matchedAsanas.length > 0

  // ── Food results ──────────────────────────────────────────────────────
  // Searching foods and searching poses share one box on purpose: people
  // don't think in terms of which dataset holds the answer. The lookup goes
  // through lib/ingredients so only reviewed rows can ever appear.
  const foodSearch = useMemo(() => searchIngredients(searchQuery), [searchQuery])
  const searching = searchQuery.trim().length >= 2

  // The miss rate is the single most useful signal for what to add to the
  // dataset next, and it's only knowable if misses are logged as deliberately
  // as hits. Debounced so a typed word logs once, not once per keystroke.
  useEffect(() => {
    if (!searching) return
    const id = setTimeout(() => {
      // `query_len`, never the query text — a food query can carry health
      // details ("food for my diabetes"). See analytics-events.md §5.14.
      track(EVENTS.DIET_SEARCH, {
        query_len:    foodSearch.query.length,
        result_count: foodSearch.results.length,
        coverage_hit: !foodSearch.coverageMiss,
        source:       'discover',
      })
    }, 900)
    return () => clearTimeout(id)
  }, [searching, foodSearch])

  const coverage = useMemo(() => coverageStats(), [])

  // The user's safety filter, applied to what search shows. Read through the
  // hook so this surface can never drift from the stored shape.
  const { prefs: dietPrefs } = useDietPrefs()

  function handleSearch(q) {
    const query = q || searchQuery
    if (query.trim().length < 2) return
    track(EVENTS.SEARCH_SUBMITTED, { query: query.trim(), source: 'discover' })
    navigate('/recommendations', { state: { query: query.trim() } })
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">explore</span>
          <span className="font-headline italic text-primary text-base">{t('discover.title')}</span>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
          aria-label={t('discover.profileAria')}
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
        </button>
      </div>

      <div className="px-6 flex flex-col gap-5">

        {/* ── Search — hero element ── */}
        <div className="stagger-1">
          <h1 className="font-headline text-2xl text-on-surface mb-1">
            {t('discover.heroTitle')}
          </h1>
          <p className="font-body text-sm text-on-surface-variant mb-4">
            {t('discover.heroSubtitle')}
          </p>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              placeholder={t('discover.searchPlaceholder')}
              className="w-full bg-surface-container-low rounded-2xl pl-11 pr-12 py-4 text-on-surface font-body text-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/35"
              aria-label={t('discover.searchAria')}
            />
            {searchQuery.length > 0 ? (
              <button
                onClick={() => handleSearch()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-all"
                aria-label={t('discover.searchSubmitAria')}
              >
                <span className="material-symbols-outlined text-on-primary text-sm">arrow_forward</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* ── Asana search results ── */}
        {showAsanaResults && (
          <div className="stagger-2">
            <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-2.5">
              {t('discover.asanasMatching', { query: searchQuery.trim() })}
            </p>
            <div className="flex flex-col gap-2">
              {matchedAsanas.map(asana => {
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
                  {/* Show the actual pose, not a generic symbol — the figure is
                      what lets you recognise the asana at a glance. Falls back
                      to the icon for entries with no image (e.g. breathwork). */}
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
                    <div className="flex gap-1.5 mt-1">
                      {asana.level && asana.level !== 'Beginner' && (
                        <span className="px-2 py-0.5 bg-primary-fixed rounded-full font-label text-[8px] text-primary uppercase">{asana.level}</span>
                      )}
                      <span className="px-2 py-0.5 bg-surface-container-high rounded-full font-label text-[8px] text-on-surface-variant uppercase">{asana.category}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
                </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Food search results ──────────────────────────────────────────
            A miss renders an explicit "not in our reference yet" rather than
            an empty space or a guess — coverage honesty is a feature here,
            not a failure state (diet-feature-plan.md §2). It only shows when
            no pose matched either, so a pose search isn't nagged at. */}
        {searching && foodSearch.results.length > 0 && (
          <div className="stagger-2">
            <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-2.5">
              {t('diet.resultsMatching', { query: searchQuery.trim() })}
            </p>
            <div className="flex flex-col gap-2">
              {foodSearch.results.map(ing => (
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

        {searching && foodSearch.coverageMiss && !showAsanaResults && (
          <div className="stagger-2 bg-surface-container-low rounded-2xl p-4" role="status">
            <p className="font-body text-sm font-semibold text-on-surface">{t('diet.miss.title')}</p>
            <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed">
              {t('diet.miss.body')}
            </p>
          </div>
        )}

        {/* ── Food & Ayurveda ──────────────────────────────────────────────
            The dedicated Diet section. Deliberately states how many foods are
            reviewed: a small, honest number beats an implied completeness the
            dataset doesn't have. */}
        {!searching && REVIEWED_INGREDIENTS.length > 0 && (
          <div className="stagger-3">
            <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-1">
              {t('diet.sectionTitle')}
            </p>
            <p className="font-body text-xs text-on-surface-variant/70 mb-3 leading-relaxed">
              {t('diet.sectionSubtitle')}
            </p>
            <div className="flex gap-2.5 overflow-x-auto snap-x pb-1 -mx-6 px-6">
              {REVIEWED_INGREDIENTS.map(ing => (
                <button
                  key={ing.id}
                  onClick={() => navigate(`/ingredient/${ing.id}`)}
                  className="flex-shrink-0 w-28 snap-start bg-surface-container-low rounded-2xl p-3 text-left active:scale-[0.97] transition-all"
                  aria-label={ing.name}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-primary text-2xl">
                    {FOOD_ICONS[ing.category] || FOOD_ICONS.other}
                  </span>
                  <p className="font-body text-xs text-on-surface mt-1.5 leading-tight line-clamp-2">{ing.name}</p>
                </button>
              ))}
            </div>
            <p className="font-label text-[9px] text-on-surface-variant/40 uppercase tracking-widest mt-2">
              {t('diet.coverageLine', { reviewed: coverage.reviewed })}
            </p>
          </div>
        )}

        {/* ── Popular search pills ── */}
        <div className="stagger-2">
          <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-2.5">{t('discover.popularSearches')}</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSearch(item.query)}
                className="flex items-center gap-1.5 bg-surface-container-low rounded-full px-3.5 py-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-primary text-xs">{item.icon}</span>
                <span className="font-body text-xs text-on-surface">{t(`discover.popularSearch.${item.labelKey}`, item.query)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Browse by Category ── */}
        <div className="stagger-3">
          <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-3">{t('discover.browseByCategory')}</p>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => handleSearch(cat.query)}
                className="relative overflow-hidden rounded-xl p-4 text-left active:scale-[0.97] transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-15`} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full bg-surface/80 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-primary text-lg">{cat.icon}</span>
                  </div>
                  <p className="font-body text-sm font-semibold text-on-surface">{t(cat.labelKey)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick routines ── */}
        <div className="stagger-4">
          <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-3">{t('discover.quickRoutines')}</p>
          <div className="flex flex-col gap-2.5">
            {QUICK_ROUTINES.map((r, i) => (
              <QuickRoutineCard
                key={r.key}
                routine={r}
                position={i}
                onTap={() => {
                  track(EVENTS.ROUTINE_CARD_TAPPED, { routine_key: r.key, source: 'discover_quick_routines' })
                  navigate('/routine', { state: { routineKey: r.key } })
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Programs — curated sequences for specific outcomes ── */}
        <div className="stagger-4">
          <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-3">{t('discover.programs')}</p>
          <div className="flex flex-col gap-2.5">
            {PROGRAMS.map((r, i) => (
              <QuickRoutineCard
                key={r.key}
                routine={r}
                position={i}
                onTap={() => {
                  track(EVENTS.ROUTINE_CARD_TAPPED, { routine_key: r.key, source: 'discover_programs' })
                  navigate('/routine', { state: { routineKey: r.key } })
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Explore all Asanas ── */}
        <div className="stagger-5">
          <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-3">{t('discover.exploreAsanas')}</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {ALL_ASANAS.map((asana, i) => {
              const locked = !isPremium && !isAsanaFree(asana.id)
              return (
                <ExploreAsanaCard
                  key={asana.id}
                  asana={asana}
                  position={i}
                  locked={locked}
                  onTap={() => {
                    if (locked) {
                      track(EVENTS.CTA_CLICKED, {
                        cta_id: 'locked_asana_card',
                        asana_id: asana.id,
                        source: 'discover_explore_grid',
                      })
                      openPaywall('library_asana_card')
                      return
                    }
                    track(EVENTS.ASANA_CARD_TAPPED, { asana_id: asana.id, source: 'discover_explore_grid' })
                    navigate(`/asana/${asana.id}`)
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* ── Breathwork ── */}
        <div className="stagger-5">
          <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-3">{t('discover.breathwork')}</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {Object.values(PRANAYAMAS).map((p, i) => {
              const locked = !isPremium && !isPranayamaFree(p.id)
              return (
                <PranayamaCard
                  key={p.id}
                  pranayama={p}
                  position={i}
                  locked={locked}
                  onTap={() => {
                    if (locked) {
                      track(EVENTS.CTA_CLICKED, {
                        cta_id: 'locked_pranayama_card',
                        pranayama_id: p.id,
                        source: 'discover_breathwork',
                      })
                      openPaywall('library_pranayama_card')
                      return
                    }
                    track(EVENTS.CONTENT_IMPRESSION, { surface: 'discover_breathwork', content_type: 'pranayama', content_id: p.id, action: 'tap' })
                    track(EVENTS.CTA_CLICKED, {
                      cta_id:        'pranayama_card',
                      route_name:    'discover',
                      pranayama_id:  p.id,
                      label:         p.english,
                    })
                    navigate(`/pranayama/${p.id}`)
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* ── Ayurvedic tip ── */}
        {/* Hairline border + slightly stronger tint so the card stays distinct
            from the page background on every dosha theme — the Pitta palette's
            primary-container is a pale orange that otherwise melts into it. */}
        <div className="bg-primary-container/25 border border-primary/10 rounded-xl p-5 stagger-5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-lg mt-0.5">local_florist</span>
            <div>
              <p className="font-label text-[9px] text-primary uppercase tracking-widest mb-1">{t('discover.ayurvedicWisdom')}</p>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {t('discover.ayurvedicTip')}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Paywall sheet — opens when any Plus-locked card is tapped. The
          `surface` prop carries the placement id so PostHog can compare
          conversion by surface in one funnel report. */}
      <PaywallSheet
        open={paywall.open}
        onClose={() => setPaywall({ open: false, surface: null })}
        surface={paywall.surface}
        headline={t('discover.paywallHeadline')}
        subhead={t('discover.paywallSubhead')}
      />

    </div>
  )
}
