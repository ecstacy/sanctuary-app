// ─────────────────────────────────────────────────────────────────────────────
//  DiscoverProgramsPage — routines and multi-day programs, behind the hub.
//
//  Quick routines and programs sat as two adjacent strips on the flat page,
//  which read as one long list of near-identical rows. Same shape, different
//  commitment: a routine is one session now, a program is a sequence over
//  days. Labelling that distinction is most of what this page adds.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SubPage from '../components/discover/SubPage'
import { QuickRoutineCard } from '../components/discover/cards'
import { track, EVENTS } from '../lib/track'

const QUICK_ROUTINES = [
  { key: 'stress',      icon: 'psychiatry', min: 15 },
  { key: 'sleep',       icon: 'bedtime',    min: 12 },
  { key: 'energy',      icon: 'bolt',       min: 18 },
  { key: 'flexibility', icon: 'self_care',  min: 20 },
]

const PROGRAMS = [
  { key: 'morning7Day',    icon: 'wb_twilight', min: 12 },
  { key: 'backPainSeries', icon: 'healing',     min: 12 },
  { key: 'preBedWindDown', icon: 'nights_stay', min: 20 },
]

export default function DiscoverProgramsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const localise = (list, ns) => list.map((r) => ({
    ...r,
    label: t(`discover.${ns}.${r.key}.label`),
    desc:  t(`discover.${ns}.${r.key}.desc`),
    time:  `${r.min} ${t('discover.minSuffix')}`,
  }))

  const routines = localise(QUICK_ROUTINES, 'routines')
  const programs = localise(PROGRAMS, 'programsList')

  const open = (r, source) => {
    track(EVENTS.ROUTINE_CARD_TAPPED, { routine_key: r.key, source })
    navigate('/routine', { state: { routineKey: r.key } })
  }

  return (
    <SubPage
      title={t('discover.hub.programs.title')}
      subtitle={t('discover.hub.programs.pageSub')}
      routeName="discover_programs"
    >
      <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mb-1">
        {t('discover.quickRoutines')}
      </p>
      <p className="font-body text-xs text-on-surface-variant mb-3">{t('discover.quickRoutinesSub')}</p>
      <div className="flex flex-col gap-2.5">
        {routines.map((r, i) => (
          <QuickRoutineCard key={r.key} routine={r} position={i} surface="discover_programs_routines" onTap={() => open(r, 'discover_programs_routines')} />
        ))}
      </div>

      <p className="font-label text-[11px] text-on-surface-variant uppercase tracking-widest mt-9 mb-1">
        {t('discover.programs')}
      </p>
      <p className="font-body text-xs text-on-surface-variant mb-3">{t('discover.programsSub')}</p>
      <div className="flex flex-col gap-2.5">
        {programs.map((r, i) => (
          <QuickRoutineCard key={r.key} routine={r} position={i} surface="discover_programs_series" onTap={() => open(r, 'discover_programs_series')} />
        ))}
      </div>
    </SubPage>
  )
}
