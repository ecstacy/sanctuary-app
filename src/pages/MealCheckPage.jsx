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
import { exclusionFor } from '../lib/dietSafety'
import { formFor, curatedFor } from '../lib/consumableForms'
import { PRANAYAMAS } from '../data/pranayamas'
import { doshaDisplayName } from '../i18n/contentI18n'
import { GEM_HUE } from '../components/DoshaGem'
import PaywallSheet from '../components/PaywallSheet'
import { track } from '../lib/track'

const DOSHAS = ['vata', 'pitta', 'kapha']

// Dosha display metadata for the result graphic. Colours follow the Dosha page
// tokens (--color-vata/pitta/kapha), NOT the gem palette — the two differ and
// are being unified app-wide (task #48). Elements match DoshaProfileContent.
const DOSHA_META = {
  vata:  { hex: 'var(--color-vata)',  bar: 'bg-vata',  element: 'Air + Ether' },
  pitta: { hex: 'var(--color-pitta)', bar: 'bg-pitta', element: 'Fire + Water' },
  kapha: { hex: 'var(--color-kapha)', bar: 'bg-kapha', element: 'Earth + Water' },
}

// Direction of the meal's push on a dosha, from the net per-dosha shift. Derived
// here (not read from assessment.dir) so it works for both a live check and a
// re-opened history snapshot, which only stores perDosha.
function pushDir(v) {
  return v > 0.15 ? 'raises' : v < -0.15 ? 'eases' : 'steady'
}

// The constitution graphic — the Dosha page's stacked bar + legend, now with
// each dosha's push from THIS meal beside it. When the user has no stored
// percentages we drop the bar and show an effect-only list.
function ConstitutionEffect({ t, percentages, perDosha, headline }) {
  const hasPct = percentages && DOSHAS.some((d) => (percentages[d] || 0) > 0)
  // Row order: dominance when we have a constitution, else by push magnitude.
  const order = [...DOSHAS].sort((a, b) =>
    hasPct ? (percentages[b] || 0) - (percentages[a] || 0)
           : Math.abs(perDosha?.[b] || 0) - Math.abs(perDosha?.[a] || 0))

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 mb-4">
      <p className="font-label text-[11px] uppercase tracking-[0.15em] text-on-surface-variant mb-4">
        {hasPct ? t('mealCheck.constitutionLabel') : t('mealCheck.effectOnlyLabel')}
      </p>

      {hasPct && (
        <div className="h-3 rounded-full overflow-hidden flex gap-px mb-5 bg-surface-container-high">
          {order.filter((d) => (percentages[d] || 0) > 0).map((d) => (
            <div
              key={d}
              className={`h-full ${DOSHA_META[d].bar}`}
              style={{ width: `${percentages[d]}%` }}
              role="img"
              aria-label={`${doshaDisplayName(d)} ${percentages[d]}%`}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col">
        {order.map((d) => {
          const dir = pushDir(perDosha?.[d] || 0)
          const isHead = headline === d
          return (
            <div key={d} className="flex items-center gap-3 py-2.5 border-t border-outline-variant/25 first:border-t-0">
              <span className={`w-2.5 h-2.5 rounded-full ${DOSHA_META[d].bar} shrink-0`} aria-hidden="true" />
              <span className="min-w-0">
                <span className="font-body font-semibold text-sm" style={{ color: isHead ? DOSHA_META[d].hex : 'var(--color-on-surface)' }}>
                  {doshaDisplayName(d)}
                </span>
                <span className="block font-label text-[11px] text-on-surface-variant uppercase tracking-wide">
                  {DOSHA_META[d].element}
                </span>
              </span>
              {hasPct && (
                <span className="ml-auto font-headline text-lg text-on-surface tabular-nums leading-none">
                  {Math.round(percentages[d])}%
                </span>
              )}
              <PushBadge t={t} dosha={d} dir={dir} className={hasPct ? '' : 'ml-auto'} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PushBadge({ t, dosha, dir, className = '' }) {
  const hex = DOSHA_META[dosha].hex
  const base = 'shrink-0 text-[10px] font-label font-bold uppercase tracking-wide rounded-md px-2 py-1 min-w-[72px] text-center'
  if (dir === 'raises') {
    return <span className={`${base} ${className}`} style={{ background: hex, color: '#fff' }}>↑ {t('mealCheck.pushRaises')}</span>
  }
  if (dir === 'eases') {
    return <span className={`${base} ${className}`} style={{ background: `color-mix(in srgb, ${hex} 15%, transparent)`, color: hex }}>↓ {t('mealCheck.pushEases')}</span>
  }
  return <span className={`${base} ${className} bg-surface-container text-on-surface-variant`}>– {t('mealCheck.pushSteady')}</span>
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

  function computeResult(list, opts = {}) {
    const finalItems = list || items
    setItems(finalItems)   // keep the editable chip list in sync with the result
    const ids = finalItems.map((i) => i.id)
    const assessment = assessMeal(ids, profile)
    const hr = new Date().getHours()
    const slot = hr < 11 ? 'morning' : hr < 17 ? 'midday' : 'evening'
    const remedies = remediesFor(assessment, { dietPrefs, slot })
    setResult({ assessment, remedies })
    setPhase('result')
    track(opts.event || 'meal_check_completed', {
      item_count: ids.length,
      headline: assessment.headline,
      concern: assessment.concern,
    })
    // Persist + start the trial clock (fire-and-forget; never blocks the UI).
    persist(finalItems, assessment, remedies, opts.inputText)
  }

  // Editing the meal from the result screen recomputes + re-logs as an edited
  // check (its own event, so edits don't inflate the "completed" funnel).
  function editItems(nextItems) {
    const label = nextItems.map((i) => i.name).join(', ')
    computeResult(nextItems, { event: 'meal_check_edited', inputText: label })
  }
  function resultRemoveItem(id) { editItems(items.filter((i) => i.id !== id)) }
  function resultAddFood(query) {
    const parsed = parseMeal(query)
    const found = parsed.matched
      .filter((m) => !items.some((i) => i.id === m.id))
      .map((m) => ({ id: m.id, name: m.name }))
    if (!found.length) return false
    editItems([...items, ...found])
    return true
  }

  async function persist(finalItems, assessment, remedies, inputTextOverride) {
    if (!user?.id) return
    const started = await startMealTrialIfNeeded(user.id, profile?.meal_check_trial_started_at)
    await saveMealLog(user.id, {
      inputText: (inputTextOverride ?? text).trim() || null,
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
    const restoredItems = (log.item_ids || [])
      .map((id) => { const f = getIngredient(id); return f ? { id, name: f.name } : null })
      .filter(Boolean)
    setItems(restoredItems)
    setResult({
      assessment: {
        items: restoredItems.map((i) => i.id),
        perDosha: snap.perDosha || {}, headline: snap.headline || null,
        concern: snap.concern, lens: snap.lens, prakriti: snap.lens,
      },
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
          <ResultView
            t={t}
            result={result}
            items={items}
            profile={profile}
            dietPrefs={dietPrefs}
            onRemoveItem={resultRemoveItem}
            onAddFood={resultAddFood}
            onOpenDetail={openDetail}
            onReset={reset}
          />
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

// Personalized "what this means" — framed to the concern and the user's own
// constitution, not a generic blurb. Falls through to a balanced read.
function meansText(t, a) {
  const head = a.headline
  const lensLabel = a.lens ? doshaDisplayName(a.lens) : null
  const surfaceKey = { pitta: 'surfacePitta', vata: 'surfaceVata', kapha: 'surfaceKapha' }
  if (head && a.concern === 'mind') {
    return t('mealCheck.meansMind', {
      dosha: doshaDisplayName(head),
      element: DOSHA_META[head].element,
      surface: t(`mealCheck.${surfaceKey[head]}`),
    })
  }
  if (head && a.concern === 'watch') return t('mealCheck.meansWatch', { dosha: doshaDisplayName(head) })
  if (a.concern === 'good' && lensLabel) return t('mealCheck.meansGood', { dosha: lensLabel })
  return t('mealCheck.meansBalanced')
}

// Compose the actionable rebalance list: marquee curated combos first (each
// safety-gated), then a per-ingredient consumable form for whatever the engine
// surfaced. Deduped by id, capped so the section stays scannable.
function buildRebalance(target, foods, dietPrefs) {
  if (!target) return []
  const isSafe = (id) => { const ing = getIngredient(id); return ing ? !exclusionFor(ing, dietPrefs)?.excluded : false }
  // Confidence read straight from the dataset (robust for live + history):
  // 'high' = classically attested, anything else = property-derived.
  const confOf = (id) => (getIngredient(id)?.confidence === 'high' ? 'classical' : 'derived')
  // Curated combos are traditional preparations — classically grounded.
  const curated = curatedFor(target, isSafe).map((c) => ({ ...c, confidence: 'classical' }))
  const perFood = (foods || []).map((f) => ({ id: f.id, confidence: confOf(f.id), ...formFor(getIngredient(f.id), f.name) }))
  const seen = new Set()
  const out = []
  for (const item of [...curated, ...perFood]) {
    if (!item.id || seen.has(item.id)) continue
    seen.add(item.id)
    out.push(item)
    if (out.length >= 4) break
  }
  return out
}

function ResultView({ t, result, items, profile, dietPrefs, onRemoveItem, onAddFood, onOpenDetail, onReset }) {
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

  const percentages = profile?.dosha_details?.percentages || null
  const rebalance = buildRebalance(head, r.foods, dietPrefs)
  const eatDrinkTitle = head
    ? t(`mealCheck.eatDrink${head.charAt(0).toUpperCase() + head.slice(1)}`)
    : null

  return (
    <section>
      <p className="font-label text-xs uppercase tracking-widest text-primary mb-2">{t('mealCheck.yourMealLabel')}</p>

      {/* Editable meal — remove a chip or add a food you forgot; recomputes. */}
      <MealChips t={t} items={items} onRemoveItem={onRemoveItem} onAddFood={onAddFood} />

      <h2 className="font-headline text-2xl leading-snug mb-4">{verdict}</h2>

      {/* The constitution graphic + this meal's push per dosha. */}
      <ConstitutionEffect t={t} percentages={percentages} perDosha={a.perDosha} headline={head} />

      {/* What this means — crisp, personalized to the user's constitution. */}
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-5 mb-4">
        <p className="font-label text-[11px] uppercase tracking-[0.15em] text-on-surface-variant mb-2">{t('mealCheck.meansTitle')}</p>
        <p className="font-body text-sm text-on-surface leading-relaxed">{meansText(t, a)}</p>
      </div>

      {/* Where it comes from — the per-food breakdown, tucked in an accordion. */}
      {items.length > 0 && <Breakdown t={t} items={items} />}

      {r.combos?.length > 0 && (
        <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-4 mb-4">
          <p className="font-label text-xs uppercase tracking-wide text-secondary mb-1">{t('mealCheck.combosLabel')}</p>
          {r.combos.map((c, i) => (
            <p key={i} className="text-sm text-on-surface-variant">{c.note}</p>
          ))}
        </div>
      )}

      {/* Why these suggestions, in the user's own terms — the rebalance set is
          chosen for their constitution and what this meal did to it, so it
          doesn't read as a generic list. */}
      {rebalance.length > 0 && (a.lens || head) && (
        <div className="mt-6 mb-1">
          <p className="font-label text-[10px] uppercase tracking-[0.16em] text-primary mb-1.5">{t('mealCheck.rebalanceChosenFor')}</p>
          <p className="font-body text-[13px] text-on-surface-variant leading-relaxed">
            {a.concern === 'mind'
              ? t('mealCheck.rebalanceWhyMind', { dosha: doshaDisplayName(a.lens || head) })
              : a.concern === 'watch'
                ? t('mealCheck.rebalanceWhyWatch', { dosha: doshaDisplayName(head) })
                : t('mealCheck.rebalanceWhyGeneric', { dosha: doshaDisplayName(head) })}
          </p>
        </div>
      )}

      {/* Rebalance — actionable eat/drink (with how-to), then breath, separated. */}
      {rebalance.length > 0 && (
        <div className="mt-4">
          <p className="font-label text-xs uppercase tracking-[0.14em] text-on-surface-variant mb-3">{eatDrinkTitle}</p>
          {rebalance.map((item) => (
            <RemedyCard
              key={item.id}
              emoji={item.emoji}
              title={item.title}
              howTo={item.howTo}
              confidence={item.confidence}
              onClick={() => onOpenDetail(`/ingredient/${item.id}`)}
            />
          ))}
        </div>
      )}

      {head && r.practices.length > 0 && (
        <div className="mt-6">
          <p className="font-label text-xs uppercase tracking-[0.14em] text-on-surface-variant mb-3">{t('mealCheck.breatheTitle')}</p>
          {r.practices.map((p) => (
            <RemedyCard
              key={p.id}
              emoji="🫁"
              breath
              title={p.sanskrit}
              tag={t('mealCheck.breathTag')}
              howTo={p.english}
              onClick={() => onOpenDetail(`/pranayama/${p.id}`)}
            />
          ))}
        </div>
      )}

      <button onClick={onReset} className="w-full mt-8 bg-surface-container-high text-on-surface font-label py-3 rounded-full">
        {t('mealCheck.checkAnother')}
      </button>
      <p className="text-xs text-on-surface-variant text-center mt-4">{t('mealCheck.disclaimer')}</p>
    </section>
  )
}

// Editable meal chips — × removes, ＋ reveals an inline add field.
function MealChips({ t, items, onRemoveItem, onAddFood }) {
  const [adding, setAdding] = useState(false)
  const [val, setVal] = useState('')
  const [miss, setMiss] = useState(false)

  function submit() {
    const q = val.trim()
    if (!q) return
    const ok = onAddFood(q)
    if (ok) { setVal(''); setAdding(false); setMiss(false) }
    else setMiss(true)
  }

  return (
    <div className="mb-5">
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <span key={it.id} className="inline-flex items-center gap-1.5 bg-surface-container text-on-surface rounded-full pl-3.5 pr-2 py-1.5 text-sm">
            {it.name}
            <button onClick={() => onRemoveItem(it.id)} aria-label={t('mealCheck.deleteAria')} className="w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px] text-on-surface-variant">close</span>
            </button>
          </span>
        ))}
        {!adding && (
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1 rounded-full border border-dashed border-outline px-3.5 py-1.5 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">add</span>
            {t('mealCheck.addItem')}
          </button>
        )}
      </div>
      {adding && (
        <div className="mt-2.5">
          <div className="flex gap-2">
            <input
              autoFocus
              value={val}
              onChange={(e) => { setVal(e.target.value); setMiss(false) }}
              onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
              placeholder={t('mealCheck.addPlaceholder')}
              className="flex-1 rounded-full bg-surface-container-low border border-outline-variant px-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
            <button onClick={submit} className="shrink-0 bg-primary text-on-primary font-label px-4 rounded-full text-sm">{t('mealCheck.addBtn')}</button>
          </div>
          {miss && <p className="text-[11px] text-on-surface-variant mt-1.5 px-1">{t('mealCheck.addNotFound')}</p>}
        </div>
      )}
    </div>
  )
}

// Per-food dosha breakdown — a collapsed accordion (lower priority than the
// verdict). Each food shows the doshas it raises (↑) or eases (↓).
function Breakdown({ t, items }) {
  const [open, setOpen] = useState(false)
  const rows = items
    .map((it) => ({ it, ing: getIngredient(it.id) }))
    .filter(({ ing }) => ing)
  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-2xl mb-4 overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-4 py-3 text-left" aria-expanded={open}>
        <span className="font-body font-semibold text-sm text-on-surface">{t('mealCheck.breakdownTitle')}</span>
        <span className={`material-symbols-outlined text-on-surface-variant/50 text-lg ml-auto transition-transform ${open ? 'rotate-180' : ''}`}>expand_more</span>
      </button>
      {open && (
        <div className="px-4 pb-3">
          {rows.map(({ it, ing }) => (
            <div key={it.id} className="flex items-center gap-2 py-2 border-t border-outline-variant/25">
              <span className="flex-1 font-body font-semibold text-sm text-on-surface">{it.name}</span>
              {DOSHAS.filter((d) => (ing.doshaEffect?.[d] || 0) !== 0).map((d) => {
                const up = (ing.doshaEffect[d] || 0) > 0
                const hex = DOSHA_META[d].hex
                return (
                  <span key={d} className="text-[10px] font-label font-bold rounded px-1.5 py-0.5"
                    style={{ background: `color-mix(in srgb, ${hex} 15%, transparent)`, color: hex }}>
                    {up ? '↑' : '↓'} {doshaDisplayName(d)}
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// A rebalance card — icon, name (+ optional tag), a concrete how-to line, and
// an honest provenance label (classically cited vs property-derived). The
// honesty is the point: naming the confident ones "classically cited" makes
// them more believable, and flagging the derived ones keeps trust.
function RemedyCard({ emoji, title, tag, howTo, breath, confidence, onClick }) {
  const { t } = useTranslation()
  return (
    <button onClick={onClick} className="w-full flex items-start gap-3 bg-surface-container-low border border-outline-variant rounded-2xl p-3 mb-2.5 text-left active:scale-[0.99] transition-transform">
      <span
        className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg"
        style={{ background: `color-mix(in srgb, var(--color-${breath ? 'vata' : 'kapha'}) 12%, transparent)` }}
        aria-hidden="true"
      >
        {emoji}
      </span>
      <span className="min-w-0">
        <span className="font-body font-semibold text-sm text-on-surface flex items-center gap-2 flex-wrap">
          {title}
          {tag && <span className="text-[9px] font-label font-bold uppercase tracking-wide text-primary border border-primary/35 rounded px-1.5 py-0.5">{tag}</span>}
        </span>
        <span className="block font-body text-[13px] text-on-surface-variant leading-relaxed mt-0.5">{howTo}</span>
        {confidence && (
          <span className="flex items-center gap-1 mt-1.5">
            <span aria-hidden="true" className={`material-symbols-outlined text-[13px] ${confidence === 'classical' ? 'text-primary' : 'text-on-surface-variant/60'}`}>
              {confidence === 'classical' ? 'verified' : 'science'}
            </span>
            <span className={`font-label text-[10px] uppercase tracking-wide ${confidence === 'classical' ? 'text-primary' : 'text-on-surface-variant/70'}`}>
              {confidence === 'classical' ? t('mealCheck.confClassical') : t('mealCheck.confDerived')}
            </span>
          </span>
        )}
      </span>
    </button>
  )
}
