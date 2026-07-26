// ─────────────────────────────────────────────────────────────────────────────
//  DiscoverPracticesPage — the pose library, behind the hub.
//
//  Holds what used to be two separate strips on the flat Discover page: the
//  outcome categories ("Lower back pain") and the full asana list. They belong
//  together — both answer "which pose", just from different starting points,
//  one by problem and one by name.
//
//  The list is a GRID rather than the old horizontal strip. A strip is right
//  for a teaser on a busy page and wrong for a library: it hides most of the
//  set behind a swipe and makes 76 poses feel like eight.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ASANAS } from '../data/asanas'
import { useIsPremium } from '../hooks/useIsPremium'
import { isAsanaFree } from '../lib/premiumTiers'
import PaywallSheet from '../components/PaywallSheet'
import SubPage from '../components/discover/SubPage'
import { ExploreAsanaCard } from '../components/discover/cards'
import { CATEGORIES } from '../components/discover/categories'
import { track, EVENTS } from '../lib/track'

const ALL_ASANAS = Object.values(ASANAS)

export default function DiscoverPracticesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isPremium } = useIsPremium()
  const [paywall, setPaywall] = useState(false)

  const asanas = useMemo(() => ALL_ASANAS, [])

  return (
    <SubPage
      title={t('discover.hub.practices.title')}
      subtitle={t('discover.hub.practices.pageSub', { poses: asanas.length })}
      routeName="discover_practices"
    >
      <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-3">
        {t('discover.browseByCategory')}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => {
              track(EVENTS.SEARCH_SUBMITTED, { query: cat.query, source: 'discover_practices_category' })
              navigate('/recommendations', { state: { query: cat.query } })
            }}
            className="relative overflow-hidden rounded-xl p-4 text-left active:scale-[0.97] transition-all min-h-[96px]"
          >
            <div aria-hidden="true" className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-15`} />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-surface/80 flex items-center justify-center mb-3">
                <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg">{cat.icon}</span>
              </div>
              <p className="font-body text-sm font-semibold text-on-surface">{t(cat.labelKey)}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mt-9 mb-3">
        {t('discover.exploreAsanas')}
      </p>
      {/* A grid, not a strip: a library should show its size. */}
      <div className="grid grid-cols-2 gap-3">
        {asanas.map((asana, i) => {
          const locked = !isPremium && !isAsanaFree(asana.id)
          return (
            <ExploreAsanaCard
              key={asana.id}
              asana={asana}
              position={i}
              locked={locked}
              surface="discover_practices"
              onTap={() => {
                if (locked) { setPaywall(true); return }
                track(EVENTS.ASANA_CARD_TAPPED, { asana_id: asana.id, source: 'discover_practices' })
                navigate(`/asana/${asana.id}`)
              }}
            />
          )
        })}
      </div>

      <PaywallSheet
        open={paywall}
        onClose={() => setPaywall(false)}
        surface="discover_practices"
        headline={t('discover.paywallHeadline')}
        subhead={t('discover.paywallSubhead')}
      />
    </SubPage>
  )
}
