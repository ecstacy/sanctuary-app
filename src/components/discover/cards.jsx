// ─────────────────────────────────────────────────────────────────────────────
//  discover/cards.jsx — the browse cards shared by the Discover hub and its
//  depth pages.
//
//  Extracted when Discover was split from one long scroll into a hub plus
//  dedicated pages. These were already separate components for a specific
//  reason worth preserving: each calls `useImpression`, and a hook must be
//  called once per component, so one card = one component. Copying them into
//  four pages would have quietly given us four impression implementations to
//  keep in sync.
//
//  Every card takes its `surface` from the page rendering it, so the same
//  card reports honestly from wherever it appears.
// ─────────────────────────────────────────────────────────────────────────────

import { useTranslation } from 'react-i18next'
import { localizeAsana, localizePranayama, sanskritLabel } from '../../i18n/contentI18n'
import PoseFigure, { hasPoseImage } from '../PoseFigure'
import FoodIcon from '../FoodIcon'
import useImpression from '../../hooks/useImpression'
import { isDoneToday } from '../../lib/asanaDone'

// ─── FoodResultRow ────────────────────────────────────────────────────────
// One reviewed ingredient in the Discover search results. Shows the
// confidence badge inline: whether a claim is classically cited or derived
// from properties is part of the result, not a detail-page footnote.
export function FoodResultRow({ ingredient, onTap, t, exclusion }) {
  const excluded = exclusion?.excluded
  return (
    <button
      onClick={onTap}
      className="flex items-center gap-3.5 bg-surface-container-low rounded-xl p-3 text-left active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0 text-primary">
        <FoodIcon ingredient={ingredient} size={24} />
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
                : t(`diet.excludedBy.${exclusion.key}`, t(`diet.patterns.${exclusion.key}`, exclusion.key))}
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
export function ExploreAsanaCard({ asana, position, locked, onTap, full = false, surface = 'discover_explore_asanas' }) {
  const { t } = useTranslation()
  const la = localizeAsana(asana)
  const done = isDoneToday(asana.id)
  // Case-insensitive: the data stores 'beginner' lowercase, so `!== 'Beginner'`
  // never matched and beginner pills showed on every card. Only non-beginner
  // levels earn a badge — the level of most poses is noise otherwise.
  const showLevel = asana.level && asana.level.toLowerCase() !== 'beginner' && !locked
  const ref = useImpression({
    surface,
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
      // `full` fills a grid column (the library grid); the default fixed width
      // is for the horizontally-scrolled strip.
      className={`${full ? 'w-full' : 'flex-shrink-0 w-36 snap-start'} active:scale-[0.97] transition-all text-left`}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-2 bg-gradient-to-br from-primary-container/30 to-primary/10">
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${locked ? 'opacity-40' : ''}`}>
          {asana.poseKey ? (
            <PoseFigure poseKey={asana.poseKey} size="sm" breathing={false} objectPosition="center" />
          ) : (
            <span aria-hidden="true" className="material-symbols-outlined text-primary/30 text-6xl">{asana.icon}</span>
          )}
        </div>
        {showLevel && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 bg-surface rounded-full font-label text-[10px] text-primary uppercase tracking-wide shadow-sm">
              {asana.level}
            </span>
          </div>
        )}
        {/* Done-for-the-day check (#61) */}
        {done && !locked && (
          <div className="absolute top-2 right-2" title={t('asanaDetail.doneToday')}>
            <span aria-hidden="true" className="material-symbols-outlined text-primary bg-surface/90 backdrop-blur-sm rounded-full text-[18px] leading-none p-0.5">check_circle</span>
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
                <span aria-hidden="true" className="material-symbols-outlined text-plus text-[11px] flex-shrink-0">lock</span>
                <span className="font-label text-[11px] font-semibold text-plus uppercase tracking-wider truncate">
                  {t('discover.unlockWithPlus')}
                </span>
              </div>
              <span aria-hidden="true" className="material-symbols-outlined text-plus text-[11px] flex-shrink-0">arrow_forward</span>
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
export function PranayamaCard({ pranayama, position, locked, onTap, full = false, surface = 'discover_breathwork' }) {
  const { t } = useTranslation()
  const lp = localizePranayama(pranayama)
  const ref = useImpression({
    surface,
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
      className={`${full ? 'w-full' : 'flex-shrink-0 w-44 snap-start'} active:scale-[0.97] transition-all text-left`}
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
            <span className="px-2 py-0.5 bg-surface/90 backdrop-blur-sm rounded-full font-label text-[11px] text-primary uppercase tracking-wide">
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
            <span className="px-2 py-0.5 bg-surface/90 backdrop-blur-sm rounded-full font-label text-[11px] text-on-surface-variant uppercase tracking-wide">
              {minutes} {t('discover.minSuffix')}
            </span>
          </div>
        )}
        {locked && (
          <>
            <div
              aria-hidden="true"
              className="absolute top-2 right-2 px-2 py-0.5 bg-surface/80 backdrop-blur-sm rounded-full font-label text-[11px] text-on-surface-variant uppercase tracking-wide"
            >
              {minutes} {t('discover.minSuffix')}
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-on-surface/35 to-transparent pointer-events-none"
            />
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1 px-2.5 py-1 rounded-full bg-surface/95 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-1 min-w-0">
                <span aria-hidden="true" className="material-symbols-outlined text-plus text-[11px] flex-shrink-0">lock</span>
                <span className="font-label text-[11px] font-semibold text-plus uppercase tracking-wider truncate">
                  {t('discover.unlockWithPlus')}
                </span>
              </div>
              <span aria-hidden="true" className="material-symbols-outlined text-plus text-[11px] flex-shrink-0">arrow_forward</span>
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
export function QuickRoutineCard({ routine, position, onTap, surface = 'discover_quick_routines' }) {
  const ref = useImpression({
    surface,
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
        <span className="font-label text-[11px] text-on-surface-variant uppercase">{routine.time}</span>
        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
      </div>
    </button>
  )
}
