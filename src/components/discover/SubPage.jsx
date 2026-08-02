// ─────────────────────────────────────────────────────────────────────────────
//  discover/SubPage — the shell every Discover depth page wears.
//
//  Exists so the four pages behind the hub cannot drift from each other in
//  back-button placement, title size or padding. Four hand-rolled headers is
//  how a hub stops feeling like one place.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useScrollDepth from '../../hooks/useScrollDepth'

export default function SubPage({ title, subtitle, routeName, children }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  useScrollDepth(routeName)

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-24">
      <div className="px-6 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center"
          aria-label={t('common.back')}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
        </button>

        <h1 className="font-headline text-3xl text-on-surface mt-5 leading-tight">{title}</h1>
        {subtitle && (
          <p className="font-body text-sm text-on-surface-variant mt-2 leading-relaxed">{subtitle}</p>
        )}

        <div className="mt-7">{children}</div>
      </div>
    </div>
  )
}
