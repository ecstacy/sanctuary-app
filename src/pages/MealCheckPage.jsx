// ─────────────────────────────────────────────────────────────────────────────
//  MealCheckPage — "I ate X. What does it do to my doshas?"
//
//  Plus-only (7-day full trial for free users; see useMealCheckAccess). The
//  verdict is computed entirely client-side by lib/mealCheck.js over the reviewed
//  ingredient dataset — no runtime-invented facts. Flow: type a meal → confirm /
//  clarify the matched foods → see the per-dosha verdict + rebalancing remedies.
//  Every completed check is logged to Supabase (cross-device history).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useMealCheckAccess } from '../hooks/useMealCheckAccess'
import { parseMeal, assessMeal, remediesFor } from '../lib/mealCheck'
import { saveMealLog, startMealTrialIfNeeded, listMealLogs, deleteMealLog, logMealSearchTerms } from '../lib/mealLog'
import { getIngredient } from '../lib/ingredients'
import { PRANAYAMAS } from '../data/pranayamas'
import { doshaDisplayName } from '../i18n/contentI18n'
import { GEM_HUE } from '../components/DoshaGem'
import PaywallSheet from '../components/PaywallSheet'
import { track } from '../lib/track'

const DOSHAS = ['vata', 'pitta', 'kapha']

function DoshaBars({ t, perDosha, headline }) {
  return (
    <div className="space-y-3.5">
      {DOSHAS.map((d) => {
        const v = perDosha?.[d] || 0
        const pct = Math.min(100, Math.round(Math.abs(v) * 100))
        const dir = v > 0.15 ? 'up' : v < -0.15 ? 'down' : 'steady'
        const label = dir === 'up' ? t('mealCheck.dirRaises') : dir === 'down' ? t('mealCheck.dirSettles') : t('mealCheck.dirSteady')
        const isHead = headline === d
        const muted = dir === 'steady'
        return (
          <div key={d} className="flex items-center gap-3">
            <span
              className="w-14 shrink-0 text-xs font-label uppercase tracking-wider"
              style={{ color: GEM_HUE[d].base, opacity: isHead ? 1 : 0.85 }}
            >
              {doshaDisplayName(d)}
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.max(pct, muted ? 4 : pct)}%`, background: muted ? 'var(--color-outline)' : GEM_HUE[d].base }}
              />
            </div>
            <span
              className="w-16 shrink-0 text-right text-[11px] font-label"
              style={{ color: muted ? 'var(--color-on-surface-variant)' : GEM_HUE[d].base }}
            >
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function MealCheckPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const access = useMealCheckAccess()

  const [phase, setPhase] = useState('input') // input | confirm | result
  const [text, setText] = useState('')
  const [items, setItems] = useState([])       // [{ id, name }]
  const [ambiguous, setAmbiguous] = useState([]) // [{ token, options:[{id,name}] }]
  const [unknown, setUnknown] = useState([])   // [{ token, suggestions:[{id,name}] }]
  const [result, setResult] = useState(null)   // { assessment, remedies }
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [history, setHistory] = useState([])

  const dietPrefs = profile?.diet_prefs || {}

  // Restore the result when returning from a remedy detail page. Tapping a
  // remedy leaves this route (so the page remounts on back); we stash the result
  // and bring the user straight back to it instead of a blank input screen.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mealCheck.resume')
      if (raw) {
        sessionStorage.removeItem('mealCheck.resume')
        const saved = JSON.parse(raw)
        if (saved?.result && Date.now() - (saved.ts || 0) < 60_000) {
          setResult(saved.result); setText(saved.text || ''); setPhase('result')
        }
      }
    } catch { /* sessionStorage unavailable — ignore */ }
  }, [])

  // Open a remedy detail, preserving the current result so back returns to it.
  function openDetail(path) {
    try { sessionStorage.setItem('mealCheck.resume', JSON.stringify({ result, text, ts: Date.now() })) } catch { /* ignore */ }
    navigate(path)
  }

  // Load recent checks whenever the user lands back on the input screen
  // (cross-device history; fails soft to [] until migration 018 is deployed).
  useEffect(() => {
    if (access.allowed && user?.id && phase === 'input') {
      listMealLogs(user.id, 10).then(setHistory)
    }
  }, [access.allowed, user?.id, phase])

  // ── Locked (trial expired, not Plus) ──────────────────────────────────────
  if (access.state === 'loading') {
    return <div className="min-h-screen bg-background" />
  }
  if (!access.allowed) {
    return (
      <div className="min-h-screen bg-background text-on-surface font-body px-6 pb-24">
        <TopBar t={t} onBack={() => navigate(-1)} />
        <div className="max-w-md mx-auto mt-10 text-center">
          <span className="material-symbols-outlined text-4xl text-primary">restaurant_menu</span>
          <h1 className="font-headline text-2xl mt-3 mb-2">{t('mealCheck.title')}</h1>
          <p className="text-on-surface-variant mb-6">{t('mealCheck.lockedBody')}</p>
          <button
            onClick={() => { setPaywallOpen(true); track('meal_check_paywall_shown', {}) }}
            className="btn-plus text-white font-label px-6 py-3 rounded-full"
          >
            {t('mealCheck.unlockCta')}
          </button>
        </div>
        <PaywallSheet
          open={paywallOpen}
          onClose={() => setPaywallOpen(false)}
          surface="meal_check_locked"
          headline={t('mealCheck.title')}
          subhead={t('mealCheck.lockedBody')}
        />
      </div>
    )
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  function onCheck() {
    const trimmed = text.trim()
    if (!trimmed) return
    track('meal_check_started', { chars: trimmed.length })
    const parsed = parseMeal(trimmed)
    setItems(parsed.matched.map((m) => ({ id: m.id, name: m.name })))
    setAmbiguous(parsed.ambiguous)
    setUnknown(parsed.unknown)
    // Counts only — food text is special-category diet data and must not reach
    // analytics (see migration 017 / analytics-events §5.14). The actual
    // unmatched terms are captured server-side for dataset review (task #44).
    if (parsed.unknown.length) track('meal_check_coverage_miss', { count: parsed.unknown.length })
    // Persist the actual terms server-side (our DB, not analytics) for keyword +
    // coverage-gap review to grow the dataset.
    if (user?.id) logMealSearchTerms(user.id, parsed)
    // Skip the confirm step only when the parse was completely clean.
    if (parsed.matched.length && !parsed.ambiguous.length && !parsed.unknown.length) {
      computeResult(parsed.matched.map((m) => ({ id: m.id, name: m.name })))
    } else {
      setPhase('confirm')
    }
  }

  function addItem(opt) {
    setItems((prev) => (prev.some((i) => i.id === opt.id) ? prev : [...prev, opt]))
  }
  function removeItem(id) { setItems((prev) => prev.filter((i) => i.id !== id)) }
  function resolveAmbiguous(token, opt) {
    addItem(opt)
    setAmbiguous((prev) => prev.filter((a) => a.token !== token))
  }
  function dismissUnknown(token) { setUnknown((prev) => prev.filter((u) => u.token !== token)) }

  function computeResult(list) {
    const finalItems = list || items
    const ids = finalItems.map((i) => i.id)
    const assessment = assessMeal(ids, profile)
    const remedies = remediesFor(assessment, { dietPrefs })
    setResult({ assessment, remedies })
    setPhase('result')
    track('meal_check_completed', {
      item_count: ids.length,
      headline: assessment.headline,
      concern: assessment.concern,
    })
    // Persist + start the trial clock (fire-and-forget; never blocks the UI).
    persist(finalItems, assessment, remedies)
  }

  async function persist(finalItems, assessment, remedies) {
    if (!user?.id) return
    const started = await startMealTrialIfNeeded(user.id, profile?.meal_check_trial_started_at)
    await saveMealLog(user.id, {
      inputText: text.trim(),
      itemIds: finalItems.map((i) => i.id),
      assessment: {
        perDosha: assessment.perDosha,
        headline: assessment.headline,
        concern: assessment.concern,
        lens: assessment.lens,
        remedies: { foods: remedies.foods.map((f) => f.id), practices: remedies.practices.map((p) => p.id) },
      },
      context: { entry: 'meal_check_page' },
    })
    if (started) refreshProfile?.()
  }

  function reset() {
    setPhase('input'); setText(''); setItems([]); setAmbiguous([]); setUnknown([]); setResult(null)
  }

  // In-flow back: step back through the phases before leaving the feature, so a
  // single back never skips from a result straight past the input.
  function onBack() {
    if (phase === 'result' || phase === 'confirm') { setPhase('input'); setResult(null) }
    else navigate(-1)
  }

  async function removeHistory(id) {
    setHistory((prev) => prev.filter((l) => l.id !== id))   // optimistic
    if (user?.id) { await deleteMealLog(user.id, id); track('meal_check_history_deleted', {}) }
  }

  // Re-open a past check from its stored snapshot (no re-computation, so history
  // reads back exactly as it did the day it was logged).
  function viewHistory(log) {
    const snap = log.assessment || {}
    const foods = (snap.remedies?.foods || [])
      .map((id) => { const f = getIngredient(id); return f ? { id, name: f.name } : null })
      .filter(Boolean)
    const practices = (snap.remedies?.practices || [])
      .map((id) => { const p = PRANAYAMAS[id]; return p ? { id, sanskrit: p.sanskrit, english: p.english } : null })
      .filter(Boolean)
    setResult({
      assessment: { perDosha: snap.perDosha || {}, headline: snap.headline || null, concern: snap.concern, lens: snap.lens },
      remedies: { target: snap.headline || null, foods, practices, combos: [] },
    })
    setText(log.input_text || '')
    setPhase('result')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-on-surface font-body px-6 pb-28">
      <TopBar t={t} onBack={onBack} />

      {access.state !== 'premium' && (
        <p className="max-w-md mx-auto -mt-2 mb-4 text-center text-xs text-on-surface-variant">
          {access.state === 'locked'
            ? null
            : t('mealCheck.trialNote', { count: access.trialDaysLeft })}
        </p>
      )}

      <div className="max-w-md mx-auto">
        {phase === 'input' && (
          <section>
            <h1 className="font-headline text-2xl mb-1">{t('mealCheck.title')}</h1>
            <p className="text-on-surface-variant text-sm mb-5">{t('mealCheck.inputHelp')}</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder={t('mealCheck.inputPlaceholder')}
              className="w-full rounded-2xl bg-surface-container-low border border-outline-variant p-4 text-on-surface resize-none focus:outline-none focus:border-primary"
            />
            <button
              onClick={onCheck}
              disabled={!text.trim()}
              className="w-full mt-4 bg-primary text-on-primary font-label py-3.5 rounded-full disabled:opacity-40"
            >
              {t('mealCheck.checkCta')}
            </button>

            {history.length > 0 && (
              <div className="mt-9">
                <p className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-3">
                  {t('mealCheck.recentTitle')}
                </p>
                <p className="text-[11px] text-on-surface-variant/70 mb-2">{t('mealCheck.swipeHint')}</p>
                <div className="space-y-2">
                  {history.map((log) => (
                    <HistoryRow key={log.id} t={t} log={log} onOpen={viewHistory} onDelete={removeHistory} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {phase === 'confirm' && (
          <section>
            <h2 className="font-headline text-xl mb-1">{t('mealCheck.confirmTitle')}</h2>
            <p className="text-on-surface-variant text-sm mb-4">{t('mealCheck.confirmHelp')}</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => removeItem(it.id)}
                  className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary-container rounded-full pl-3.5 pr-2 py-1.5 text-sm"
                >
                  {it.name}
                  <span className="material-symbols-outlined text-base opacity-70">close</span>
                </button>
              ))}
              {items.length === 0 && (
                <span className="text-sm text-on-surface-variant">{t('mealCheck.noItemsYet')}</span>
              )}
            </div>

            {ambiguous.map((a) => (
              <div key={a.token} className="mb-4">
                <p className="text-sm text-on-surface-variant mb-2">
                  {t('mealCheck.whichDidYouMean', { token: a.token })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {a.options.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => resolveAmbiguous(a.token, o)}
                      className="bg-surface-container border border-outline-variant rounded-full px-3.5 py-1.5 text-sm"
                    >
                      {o.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {unknown.map((u) => (
              <div key={u.token} className="mb-4">
                <p className="text-sm text-on-surface-variant mb-2">
                  {t('mealCheck.dontHave', { token: u.token })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {u.suggestions.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => { addItem(o); dismissUnknown(u.token) }}
                      className="bg-surface-container border border-outline-variant rounded-full px-3.5 py-1.5 text-sm"
                    >
                      {o.name}
                    </button>
                  ))}
                  <button
                    onClick={() => dismissUnknown(u.token)}
                    className="text-sm text-on-surface-variant underline px-2 py-1.5"
                  >
                    {t('mealCheck.skip')}
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => computeResult()}
              disabled={items.length === 0}
              className="w-full mt-3 bg-primary text-on-primary font-label py-3.5 rounded-full disabled:opacity-40"
            >
              {t('mealCheck.seeResultCta')}
            </button>
          </section>
        )}

        {phase === 'result' && result && (
          <ResultView t={t} result={result} onOpenDetail={openDetail} onReset={reset} />
        )}
      </div>
    </div>
  )
}

// A recent-check row that reveals a delete action on left-swipe.
function HistoryRow({ t, log, onOpen, onDelete }) {
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const base = useRef(0)
  const moved = useRef(false)
  const h = log.assessment?.headline

  const onStart = (x) => { startX.current = x; base.current = dx; moved.current = false; setDragging(true) }
  const onMove = (x) => {
    const d = base.current + (x - startX.current)
    if (Math.abs(x - startX.current) > 4) moved.current = true
    setDx(Math.max(-84, Math.min(0, d)))
  }
  const onEnd = () => { setDragging(false); setDx(dx < -42 ? -76 : 0) }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <button
        onClick={() => onDelete(log.id)}
        aria-label={t('mealCheck.deleteAria')}
        className="absolute inset-y-0 right-0 w-[76px] flex items-center justify-center"
        style={{ background: '#b3261e', color: 'white' }}
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
      <button
        onClick={() => { if (dx < -10) { setDx(0); return } if (!moved.current) onOpen(log) }}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        className="relative w-full flex items-center gap-3 bg-surface-container-low p-3.5 border border-outline-variant/40 text-left rounded-xl"
        style={{ transform: `translateX(${dx}px)`, transition: dragging ? 'none' : 'transform 0.18s ease' }}
      >
        <span className="flex-1 min-w-0">
          <span className="block text-sm text-on-surface truncate">{log.input_text || '—'}</span>
          <span className="block text-xs text-on-surface-variant">
            {new Date(log.eaten_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </span>
        {h ? (
          <span
            className="shrink-0 text-[11px] font-label uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{ background: `${GEM_HUE[h].base}22`, color: GEM_HUE[h].base }}
          >
            {doshaDisplayName(h)}
          </span>
        ) : (
          <span className="shrink-0 text-[11px] text-on-surface-variant">{t('mealCheck.balancedShort')}</span>
        )}
      </button>
    </div>
  )
}

function TopBar({ t, onBack }) {
  return (
    <header className="flex items-center py-4">
      <button
        onClick={onBack}
        className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center"
        aria-label={t('common.back', 'Back')}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-lg">arrow_back</span>
      </button>
    </header>
  )
}

function ResultView({ t, result, onOpenDetail, onReset }) {
  const { assessment: a, remedies: r } = result
  const head = a.headline
  const dLabel = head ? doshaDisplayName(head) : null

  const verdict = !head
    ? t('mealCheck.verdictBalanced')
    : a.concern === 'mind'
      ? t('mealCheck.verdictMind', { dosha: dLabel })
      : a.concern === 'watch'
        ? t('mealCheck.verdictWatch', { dosha: dLabel })
        : t('mealCheck.verdictRaises', { dosha: dLabel })

  return (
    <section>
      <p className="font-label text-xs uppercase tracking-widest text-primary mb-2">{t('mealCheck.resultKicker')}</p>
      <h2 className="font-headline text-2xl leading-snug mb-4">{verdict}</h2>

      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 mb-6">
        <DoshaBars t={t} perDosha={a.perDosha} headline={head} />
      </div>

      {r.combos?.length > 0 && (
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 mb-6">
          <p className="font-label text-xs uppercase tracking-wide text-secondary mb-1">{t('mealCheck.combosLabel')}</p>
          {r.combos.map((c, i) => (
            <p key={i} className="text-sm text-on-surface-variant">{c.note}</p>
          ))}
        </div>
      )}

      {head && (r.foods.length > 0 || r.practices.length > 0) && (
        <div className="mb-6">
          <h3 className="font-headline text-lg mb-1">{t('mealCheck.rebalanceTitle')}</h3>
          <p className="text-on-surface-variant text-sm mb-4">{t('mealCheck.rebalanceHelp', { dosha: dLabel })}</p>

          {r.foods.length > 0 && (
            <div className="mb-4">
              <p className="font-label text-xs uppercase tracking-wide text-on-surface-variant mb-2">{t('mealCheck.foodsLabel')}</p>
              <div className="flex flex-wrap gap-2">
                {r.foods.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onOpenDetail(`/ingredient/${f.id}`)}
                    className="inline-flex items-center gap-1.5 bg-surface-container border border-outline-variant rounded-full px-3.5 py-2 text-sm"
                  >
                    <span className="material-symbols-outlined text-base text-primary">nutrition</span>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {r.practices.length > 0 && (
            <div>
              <p className="font-label text-xs uppercase tracking-wide text-on-surface-variant mb-2">{t('mealCheck.breathLabel')}</p>
              <div className="flex flex-wrap gap-2">
                {r.practices.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onOpenDetail(`/pranayama/${p.id}`)}
                    className="inline-flex items-center gap-1.5 bg-surface-container border border-outline-variant rounded-full px-3.5 py-2 text-sm"
                  >
                    <span className="material-symbols-outlined text-base text-primary">air</span>
                    {p.sanskrit}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={onReset} className="w-full bg-surface-container-high text-on-surface font-label py-3 rounded-full">
        {t('mealCheck.checkAnother')}
      </button>
      <p className="text-xs text-on-surface-variant text-center mt-4">{t('mealCheck.disclaimer')}</p>
    </section>
  )
}
