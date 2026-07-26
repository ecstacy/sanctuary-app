// ─────────────────────────────────────────────────────────────────────────────
//  DiscoverFoodsPage — the food library, behind the hub.
//
//  The flat Discover page showed foods as a horizontal strip of nine cards.
//  That was the right shape for a teaser and the wrong one for a reference:
//  it hid most of the set behind a swipe, and it gave no way to see WHICH
//  foods we cover — which is the first question anyone has about a dataset
//  that openly admits it is incomplete.
//
//  So: grouped by category, in full, with the coverage line stated plainly
//  rather than buried. A reference that is honest about its size is more
//  useful than one that looks endless.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { REVIEWED_INGREDIENTS, coverageStats } from '../lib/ingredients'
import { exclusionFor } from '../lib/dietSafety'
import { useDietPrefs } from '../hooks/useDietPrefs'
import { useAuth } from '../context/AuthContext'
import SubPage from '../components/discover/SubPage'
import FoodIcon from '../components/FoodIcon'
import { track, EVENTS } from '../lib/track'

// Display order. Staples first, seasonings last — how someone thinks about a
// plate, not how the data happens to be filed.
const CATEGORY_ORDER = [
  'grain', 'legume', 'vegetable', 'fruit', 'dairy',
  'nut_seed', 'oil', 'sweetener', 'spice', 'beverage', 'animal', 'other',
]

export default function DiscoverFoodsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const { prefs: dietPrefs } = useDietPrefs()

  const coverage = useMemo(() => coverageStats(), [])
  const grouped = useMemo(() => {
    const byCat = new Map()
    for (const ing of REVIEWED_INGREDIENTS) {
      if (!byCat.has(ing.category)) byCat.set(ing.category, [])
      byCat.get(ing.category).push(ing)
    }
    return CATEGORY_ORDER
      .filter((c) => byCat.has(c))
      .map((c) => [c, byCat.get(c).sort((a, b) => a.name.localeCompare(b.name))])
  }, [])

  return (
    <SubPage
      title={t('discover.hub.foods.title')}
      subtitle={t('discover.hub.foods.pageSub')}
      routeName="discover_foods"
    >
      {/* Entry points before the list: someone arriving here usually wants a
          suggestion or their own settings, not to read 35 rows. */}
      <div className="flex flex-col gap-2.5">
        <button
          onClick={() => {
            track(EVENTS.CTA_CLICKED, { cta_id: 'foods_to_meals', route_name: 'discover_foods' })
            navigate('/meals')
          }}
          className="flex items-center gap-3 bg-surface-container-low rounded-2xl p-4 text-left active:scale-[0.99] transition-all"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-xl">restaurant_menu</span>
          <span className="flex-1 min-w-0">
            <span className="block font-body text-sm font-semibold text-on-surface">{t('meals.title')}</span>
            <span className="block font-body text-xs text-on-surface-variant">{t('meals.entryHelp')}</span>
          </span>
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
        </button>

        {/* Only for signed-in users: the picker writes to their profile, so
            offering it anonymously would lead to a dead end. */}
        {user && (
          <button
            onClick={() => {
              track(EVENTS.CTA_CLICKED, { cta_id: 'foods_to_prefs', route_name: 'discover_foods' })
              navigate('/diet-preferences')
            }}
            className="flex items-center gap-3 bg-surface-container-low rounded-2xl p-4 text-left active:scale-[0.99] transition-all"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-primary text-xl">tune</span>
            <span className="flex-1 min-w-0">
              <span className="block font-body text-sm font-semibold text-on-surface">{t('dietPrefs.entry')}</span>
              <span className="block font-body text-xs text-on-surface-variant">
                {dietPrefs.allergens.length + dietPrefs.patterns.length > 0
                  ? t('dietPrefs.savedSummary', { allergens: dietPrefs.allergens.length, patterns: dietPrefs.patterns.length })
                  : t('dietPrefs.entryHelp')}
              </span>
            </span>
            <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
          </button>
        )}
      </div>

      {/* ── The library ── */}
      {grouped.map(([category, items]) => (
        <section key={category} className="mt-8">
          <h2 className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-3">
            {t(`diet.categories.${category}`, category.replace(/_/g, ' '))}
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {items.map((ing) => {
              const ex = exclusionFor(ing, dietPrefs)
              return (
                <button
                  key={ing.id}
                  onClick={() => {
                    track(EVENTS.CTA_CLICKED, { cta_id: 'food_library_item', ingredient_id: ing.id })
                    navigate(`/ingredient/${ing.id}`)
                  }}
                  className="bg-surface-container-low rounded-2xl p-3.5 text-left active:scale-[0.97] transition-all"
                >
                  <span className="text-primary block"><FoodIcon ingredient={ing} size={26} /></span>
                  <p className="font-body text-sm text-on-surface mt-2 leading-tight">{ing.name}</p>
                  {ing.sanskrit && (
                    <p className="font-body text-[11px] text-on-surface-variant/70 leading-tight mt-0.5">{ing.sanskrit}</p>
                  )}
                  {/* A filtered food is labelled, not hidden — hiding it would
                      read as a coverage gap rather than as their own setting. */}
                  {ex.excluded && (
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full font-label text-[8px] uppercase tracking-wide ${
                      ex.reason === 'allergen'
                        ? 'bg-error-container/70 text-on-error-container'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}>
                      {ex.reason === 'allergen'
                        ? t('diet.badge.allergen', { key: t(`diet.allergens.${ex.key}`, ex.key) })
                        : t('diet.badge.pattern',  { key: t(`diet.patterns.${ex.key}`,  ex.key) })}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>
      ))}

      {/* Stated plainly rather than buried: the dataset is deliberately small
          and growing, and saying so is the honest version of a reference. */}
      <p className="font-body text-[13px] text-on-surface-variant leading-relaxed mt-9">
        {t('discover.hub.foods.coverage', { reviewed: coverage.reviewed })}
      </p>
    </SubPage>
  )
}
