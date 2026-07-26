// ─────────────────────────────────────────────────────────────────────────────
//  DiscoverBreathworkPage — the pranayama library, behind the hub.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PRANAYAMAS } from '../data/pranayamas'
import { useIsPremium } from '../hooks/useIsPremium'
import { isPranayamaFree } from '../lib/premiumTiers'
import PaywallSheet from '../components/PaywallSheet'
import SubPage from '../components/discover/SubPage'
import { PranayamaCard } from '../components/discover/cards'
import { track, EVENTS } from '../lib/track'

const ALL_PRANAYAMAS = Object.values(PRANAYAMAS)

export default function DiscoverBreathworkPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isPremium } = useIsPremium()
  const [paywall, setPaywall] = useState(false)

  return (
    <SubPage
      title={t('discover.hub.breathwork.title')}
      subtitle={t('discover.hub.breathwork.pageSub', { count: ALL_PRANAYAMAS.length })}
      routeName="discover_breathwork"
    >
      <div className="grid grid-cols-2 gap-3">
        {ALL_PRANAYAMAS.map((p, i) => {
          const locked = !isPremium && !isPranayamaFree(p.id)
          return (
            <PranayamaCard
              key={p.id}
              pranayama={p}
              position={i}
              locked={locked}
              surface="discover_breathwork_page"
              onTap={() => {
                if (locked) { setPaywall(true); return }
                track(EVENTS.CTA_CLICKED, { cta_id: 'pranayama_card', pranayama_id: p.id, source: 'discover_breathwork_page' })
                navigate(`/pranayama/${p.id}`)
              }}
            />
          )
        })}
      </div>

      <PaywallSheet
        open={paywall}
        onClose={() => setPaywall(false)}
        surface="discover_breathwork"
        headline={t('discover.paywallHeadline')}
        subhead={t('discover.paywallSubhead')}
      />
    </SubPage>
  )
}
