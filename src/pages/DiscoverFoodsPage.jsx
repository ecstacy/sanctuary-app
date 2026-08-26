// ─────────────────────────────────────────────────────────────────────────────
//  DiscoverFoodsPage — the food library, behind the hub.
//
//  190 foods is too many to scroll. Like a food-delivery app, the page leads
//  with a search box and a sticky row of category pills so a user narrows to a
//  bucket (Vegetables, Spices, Fruit …) in one tap. "All" restores the full
//  grouped-by-category reference; a search or a pill collapses it to a flat
//  result grid with a count. A filtered-out food is labelled, never hidden —
//  hiding it would read as a coverage gap rather than the user's own setting.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { REVIEWED_INGREDIENTS, coverageStats } from '../lib/ingredients'
import { foodSuitability, SUITABILITY } from '../lib/doshaSemantics'
import { exclusionFor } from '../lib/dietSafety'
import { useDietPrefs } from '../hooks/useDietPrefs'
import { useAuth } from '../context/AuthContext'
import SubPage from '../components/discover/SubPage'
import NavRow from '../components/NavRow'
import FoodIcon from '../components/FoodIcon'
import { track, EVENTS } from '../lib/track'

// Display order. Staples first, seasonings last — how someone thinks about a
// plate, not how the data happens to be filed.
const CATEGORY_ORDER = [
  'grain', 'legume', 'vegetable', 'fruit', 'dairy',
  'nut_seed', 'oil', 'sweetener', 'spice', 'beverage', 'animal', 'other',
]

const ALL = '__all__'

// Second-row attribute filters (multi-select). Tokens are `v:<virya>` or
// `r:<rasa>`; a food must satisfy every active token (AND). Potency first
// (the most-asked axis — "something cooling"), then the six tastes.
const ATTR_FILTERS = [
  { token: 'v:cooling', kind: 'virya', value: 'cooling', i18n: 'diet.viryas.cooling' },
  { token: 'v:heating', kind: 'virya', value: 'heating', i18n: 'diet.viryas.heating' },
  { token: 'r:sweet', kind: 'rasa', value: 'sweet', i18n: 'diet.tastes.sweet' },
  { token: 'r:sour', kind: 'rasa', value: 'sour', i18n: 'diet.tastes.sour' },
  { token: 'r:salty', kind: 'rasa', value: 'salty', i18n: 'diet.tastes.salty' },
  { token: 'r:pungent', kind: 'rasa', value: 'pungent', i18n: 'diet.tastes.pungent' },
  { token: 'r:bitter', kind: 'rasa', value: 'bitter', i18n: 'diet.tastes.bitter' },
  { token: 'r:astringent', kind: 'rasa', value: 'astringent', i18n: 'diet.tastes.astringent' },
]

// App destinations the food search can also jump to — so typing "meal check"
// lands the user in the feature instead of an empty food result. Matched on the
// (translated) title or a keyword; shown above the food results when searching.
const DESTINATIONS = [
  { id: 'meal_check', route: '/meal-check', icon: 'fact_check', titleKey: 'mealCheck.title',
    keywords: ['meal check', 'check meal', 'checkmeal', 'what did i eat', 'log meal', 'log food', 'assess meal'] },
  { id: 'meals', route: '/meals', icon: 'restaurant_menu', titleKey: 'meals.title',
    keywords: ['meal guidance', 'meal idea', 'meal ideas', 'recipe', 'recipes', 'what to eat'] },
  { id: 'diet_prefs', route: '/diet-preferences', icon: 'tune', titleKey: 'dietPrefs.entry',
    keywords: ['diet preference', 'diet preferences', 'allergy', 'allergies', 'allergen', 'intolerance', 'vegetarian', 'vegan', 'restriction', 'no beef', 'halal', 'kosher', 'keep off'] },
]

function matchesDestination(dest, q, title) {
  if (!q || q.length < 2) return false
  if ((title || '').toLowerCase().includes(q)) return true
  return dest.keywords.some((k) => k.includes(q) || q.includes(k))
}

function matchesQuery(ing, q) {
  if (!q) return true
  const hay = [ing.name, ing.sanskrit, ...(ing.aliases || [])].join(' ').toLowerCase()
  return hay.includes(q)
}

function matchesAttrs(ing, attrs) {
  for (const token of attrs) {
    // `d:<dosha>` — foods that CALM that dosha (the personalized "for you"
    // filter). Sign-safe via foodSuitability.
    if (token.startsWith('d:')) {
      const dosha = token.slice(2)
      if (foodSuitability(ing.doshaEffect?.[dosha]) !== SUITABILITY.BALANCING) return false
      continue
    }
    const f = ATTR_FILTERS.find((a) => a.token === token)
    if (!f) continue
    if (f.kind === 'virya' && ing.virya !== f.value) return false
    if (f.kind === 'rasa' && !(ing.rasa || []).includes(f.value)) return false
  }
  return true
}

function FoodCard({ ing, dietPrefs, t, navigate }) {
  const ex = exclusionFor(ing, dietPrefs)
  return (
    <button
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
      {ex.excluded && (
        <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full font-label text-[8px] uppercase tracking-wide ${
          ex.reason === 'allergen'
            ? 'bg-error-container/70 text-on-error-container'
            : 'bg-surface-container-high text-on-surface-variant'
        }`}>
          {ex.reason === 'allergen'
            ? t('diet.badge.allergen', { key: t(`diet.allergens.${ex.key}`, ex.key) })
            : t(`diet.excludedBy.${ex.key}`, t(`diet.patterns.${ex.key}`, ex.key))}
        </span>
      )}
    </button>
  )
}

export default function DiscoverFoodsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const { prefs: dietPrefs } = useDietPrefs()

  const [query, setQuery] = useState('')
  const [activeCat, setActiveCat] = useState(ALL)
  const [activeAttrs, setActiveAttrs] = useState(() => new Set())
  const q = query.trim().toLowerCase()

  // The user's constitution — powers the personalized "calms your dosha" filter.
  // Only a single-dosha primary gets a chip; tridoshic/dual have no one axis to
  // calm, so they fall back to the plain potency/taste refiners.
  const primary = String(profile?.dosha_details?.primary || profile?.dosha || '').toLowerCase()
  const userDosha = ['vata', 'pitta', 'kapha'].includes(primary) ? primary : null
  const doshaToken = userDosha ? `d:${userDosha}` : null

  const coverage = useMemo(() => coverageStats(), [])

  // Categories that actually have foods, in display order, with counts — built
  // from the data, so an empty bucket never shows a pill.
  const categories = useMemo(() => {
    const count = new Map()
    for (const ing of REVIEWED_INGREDIENTS) count.set(ing.category, (count.get(ing.category) || 0) + 1)
    return CATEGORY_ORDER.filter((c) => count.has(c)).map((c) => ({ id: c, count: count.get(c) }))
  }, [])

  // Grouped view (the "All", no-search reference).
  const grouped = useMemo(() => {
    const byCat = new Map()
    for (const ing of REVIEWED_INGREDIENTS) {
      if (!byCat.has(ing.category)) byCat.set(ing.category, [])
      byCat.get(ing.category).push(ing)
    }
    return categories.map(({ id }) => [id, byCat.get(id).sort((a, b) => a.name.localeCompare(b.name))])
  }, [categories])

  // Flat filtered results (a pill, an attribute, and/or a search is active).
  const flat = useMemo(() => {
    return REVIEWED_INGREDIENTS
      .filter((i) => (activeCat === ALL || i.category === activeCat) && matchesQuery(i, q) && matchesAttrs(i, activeAttrs))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [activeCat, q, activeAttrs])

  // App destinations matching the search (so "meal check" jumps to the feature).
  const destinations = useMemo(
    () => (q ? DESTINATIONS.filter((d) => matchesDestination(d, q, t(d.titleKey))) : []),
    [q, t],
  )

  const isFiltered = activeCat !== ALL || q.length > 0 || activeAttrs.size > 0

  const selectCat = (id) => {
    setActiveCat(id)
    track(EVENTS.CTA_CLICKED, {
      cta_id: 'food_category_pill', route_name: 'discover_foods', category: id === ALL ? 'all' : id,
    })
  }

  const toggleAttr = (token) => {
    setActiveAttrs((prev) => {
      const next = new Set(prev)
      next.has(token) ? next.delete(token) : next.add(token)
      return next
    })
    track(EVENTS.CTA_CLICKED, { cta_id: 'food_attribute_pill', route_name: 'discover_foods', attribute: token })
  }

  const clearAll = () => { setQuery(''); setActiveCat(ALL); setActiveAttrs(new Set()) }

  return (
    <SubPage
      title={t('discover.hub.foods.title')}
      subtitle={t('discover.hub.foods.pageSub')}
      routeName="discover_foods"
    >
      {/* Entry points before the list: someone arriving here usually wants a
          suggestion or their own settings, not to read every row. */}
      <div className="flex flex-col gap-2.5">
        <NavRow
          icon="fact_check"
          title={t('mealCheck.title')}
          summary={t('discover.foods.mealCheckEntry', 'See what a meal does to your doshas')}
          ariaLabel={t('mealCheck.title')}
          onClick={() => {
            track(EVENTS.CTA_CLICKED, { cta_id: 'foods_to_meal_check', route_name: 'discover_foods' })
            navigate('/meal-check')
          }}
        />

        <NavRow
          icon="restaurant_menu"
          title={t('meals.title')}
          summary={t('meals.entryHelp')}
          ariaLabel={t('meals.title')}
          onClick={() => {
            track(EVENTS.CTA_CLICKED, { cta_id: 'foods_to_meals', route_name: 'discover_foods' })
            navigate('/meals')
          }}
        />

        {user && (
          <NavRow
            icon="tune"
            title={t('dietPrefs.entry')}
            summary={dietPrefs.allergens.length + dietPrefs.patterns.length > 0
              ? t('dietPrefs.savedSummary', { allergens: dietPrefs.allergens.length, patterns: dietPrefs.patterns.length })
              : t('dietPrefs.entryHelp')}
            ariaLabel={t('dietPrefs.entry')}
            onClick={() => {
              track(EVENTS.CTA_CLICKED, { cta_id: 'foods_to_prefs', route_name: 'discover_foods' })
              navigate('/diet-preferences')
            }}
          />
        )}
      </div>

      {/* Search */}
      <div className="mt-6 relative">
        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/60 text-xl absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (e.target.value) setActiveCat(ALL) }}
          placeholder={t('discover.foods.searchPlaceholder', 'Search foods…')}
          aria-label={t('discover.foods.searchPlaceholder', 'Search foods')}
          className="w-full bg-surface-container-low rounded-2xl pl-11 pr-11 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label={t('common.clear', 'Clear')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant active:scale-90 transition-transform"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Sticky category pills */}
      <div className="sticky top-0 z-20 -mx-6 px-6 pt-3 pb-2.5 mt-3 bg-background/95 backdrop-blur-sm">
        <div
          role="tablist"
          aria-label={t('discover.foods.filterLabel', 'Filter by category')}
          className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-0.5"
        >
          <Pill active={activeCat === ALL} onClick={() => selectCat(ALL)}>
            {t('discover.foods.filterAll', 'All')}
          </Pill>
          {categories.map(({ id, count }) => (
            <Pill key={id} active={activeCat === id} onClick={() => selectCat(id)}>
              {t(`diet.categories.${id}`, id.replace(/_/g, ' '))}
              <span className={`ml-1.5 tabular-nums ${activeCat === id ? 'text-on-primary/70' : 'text-on-surface-variant/50'}`}>{count}</span>
            </Pill>
          ))}
        </div>

        {/* Row 2 — attribute refiners (potency + taste), multi-select. The
            personalized "calms your dosha" chip leads when we know the user's
            constitution — the in-app twin of the website's /foods/for-<dosha>. */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 mt-2 pb-0.5">
          {doshaToken && (() => {
            const on = activeAttrs.has(doshaToken)
            const doshaLabel = t(`diet.dosha.${userDosha}`)
            return (
              <button
                key={doshaToken}
                aria-pressed={on}
                onClick={() => toggleAttr(doshaToken)}
                className={`shrink-0 whitespace-nowrap rounded-full pl-2.5 pr-3.5 py-1.5 font-body text-xs font-semibold border transition-colors inline-flex items-center gap-1 ${
                  on
                    ? 'bg-primary border-primary text-on-primary'
                    : 'bg-transparent border-primary/50 text-primary active:bg-primary-container/40'
                }`}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: on ? "'FILL' 1" : "'FILL' 0" }}>self_improvement</span>
                {t('discover.foods.calmsYourDosha', { dosha: doshaLabel, defaultValue: `Calms your ${doshaLabel}` })}
              </button>
            )
          })()}
          {ATTR_FILTERS.map((f) => {
            const on = activeAttrs.has(f.token)
            return (
              <button
                key={f.token}
                aria-pressed={on}
                onClick={() => toggleAttr(f.token)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 font-body text-xs font-medium border transition-colors ${
                  on
                    ? 'bg-primary-container border-primary-container text-on-primary-container'
                    : 'bg-transparent border-outline-variant text-on-surface-variant active:bg-surface-container-low'
                }`}
              >
                {t(f.i18n, f.value)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Results */}
      {isFiltered ? (
        <div className="mt-4">
          {/* Jump-to: a search that names a feature ("meal check") lands there. */}
          {destinations.length > 0 && (
            <div className="mb-5">
              <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-2">
                {t('discover.foods.jumpTo', 'Open in the app')}
              </p>
              <div className="flex flex-col gap-2">
                {destinations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      track(EVENTS.CTA_CLICKED, { cta_id: 'food_search_destination', route_name: 'discover_foods', destination: d.id })
                      navigate(d.route)
                    }}
                    className="flex items-center gap-3 bg-primary-container/40 rounded-2xl p-3.5 text-left active:scale-[0.99] transition-all"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-primary text-xl">{d.icon}</span>
                    <span className="flex-1 min-w-0 font-body text-sm font-semibold text-on-surface">{t(d.titleKey)}</span>
                    <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-sm">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-3">
            {t('discover.foods.resultCount', { count: flat.length, defaultValue: '{{count}} foods' })}
          </p>
          {flat.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {flat.map((ing) => <FoodCard key={ing.id} ing={ing} dietPrefs={dietPrefs} t={t} navigate={navigate} />)}
            </div>
          ) : destinations.length > 0 ? null : (
            <div className="text-center py-12">
              <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-4xl">search_off</span>
              <p className="font-body text-sm text-on-surface-variant mt-3">
                {t('discover.foods.noResults', { query, defaultValue: 'No foods match “{{query}}”.' })}
              </p>
              <button
                onClick={clearAll}
                className="mt-4 font-body text-sm text-primary font-semibold active:scale-95 transition-transform"
              >
                {t('discover.foods.clearFilters', 'Clear filters')}
              </button>
            </div>
          )}
        </div>
      ) : (
        grouped.map(([category, items]) => (
          <section key={category} className="mt-8">
            <h2 className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-3">
              {t(`diet.categories.${category}`, category.replace(/_/g, ' '))}
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {items.map((ing) => <FoodCard key={ing.id} ing={ing} dietPrefs={dietPrefs} t={t} navigate={navigate} />)}
            </div>
          </section>
        ))
      )}

      {/* Coverage, stated plainly. */}
      <p className="font-body text-[13px] text-on-surface-variant leading-relaxed mt-9">
        {t('discover.hub.foods.coverage', { reviewed: coverage.reviewed })}
      </p>
    </SubPage>
  )
}

function Pill({ active, onClick, children }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-body text-[13px] font-medium transition-colors ${
        active
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container-low text-on-surface-variant active:bg-surface-container'
      }`}
    >
      {children}
    </button>
  )
}
