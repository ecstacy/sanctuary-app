import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { REFINE_QUESTIONS, saveRefine } from '../lib/refine'
import { doshaDisplayName } from '../i18n/contentI18n'
import { track } from '../lib/track'

// ─────────────────────────────────────────────────────────────────────────────
//  SharpenReadingCard — optional post-quiz refinement (#54).
//
//  Sits in the dosha-result footer. Collapsed by default (the result is the
//  headline; this is opt-in depth). Expanding reveals three dosha-coded
//  questions about how the user actually runs day to day; once all are answered
//  we tally a "lean" and acknowledge it honestly — agreement reads as a
//  confident read, divergence as something we'll factor in (never a silent
//  override). Answers are stored (localStorage) for later personalization.
// ─────────────────────────────────────────────────────────────────────────────
export default function SharpenReadingCard({ primary }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null) // { lean } once complete

  function choose(qid, dosha) {
    const next = { ...answers, [qid]: dosha }
    setAnswers(next)
    if (REFINE_QUESTIONS.every((q) => next[q.id])) {
      const rec = saveRefine(next)
      setResult(rec)
      track('dosha_reading_refined', { lean: rec.lean, primary: primary || null, aligned: rec.lean === primary })
    }
  }

  // ── Done — a short, honest acknowledgment ──
  if (result) {
    const aligned = result.lean === primary
    return (
      <div className="rounded-2xl bg-surface-container-low border border-outline-variant p-4 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-base">auto_awesome</span>
          <p className="font-label text-[11px] uppercase tracking-wider text-primary">{t('doshaQuiz.refine.ackTitle')}</p>
        </div>
        <p className="font-body text-[13px] text-on-surface leading-relaxed">
          {aligned
            ? t('doshaQuiz.refine.ackAligned', { dosha: doshaDisplayName(result.lean) })
            : t('doshaQuiz.refine.ackDiverge', { dosha: doshaDisplayName(result.lean) })}
        </p>
      </div>
    )
  }

  // ── Collapsed prompt ──
  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); track('dosha_reading_refine_opened', {}) }}
        className="w-full text-left rounded-2xl bg-surface-container-low border border-outline-variant p-4 mb-3 active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-2 mb-1">
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-base">tune</span>
          <p className="font-label text-[11px] uppercase tracking-wider text-primary">{t('doshaQuiz.refine.kicker')}</p>
          <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant/40 text-lg ml-auto">chevron_right</span>
        </div>
        <p className="font-body text-[13px] text-on-surface-variant leading-relaxed">{t('doshaQuiz.refine.prompt')}</p>
      </button>
    )
  }

  // ── Expanded questions ──
  return (
    <div className="rounded-2xl bg-surface-container-low border border-outline-variant p-4 mb-3">
      <p className="font-label text-[11px] uppercase tracking-wider text-primary mb-3">{t('doshaQuiz.refine.kicker')}</p>
      <div className="flex flex-col gap-4">
        {REFINE_QUESTIONS.map((q) => (
          <div key={q.id}>
            <p className="font-body text-sm text-on-surface mb-2">{t(`doshaQuiz.refine.q.${q.id}.title`)}</p>
            <div className="flex flex-col gap-1.5">
              {q.options.map((dosha, i) => {
                const picked = answers[q.id] === dosha
                return (
                  <button
                    key={dosha}
                    onClick={() => choose(q.id, dosha)}
                    className={`text-left rounded-xl border px-3.5 py-2.5 font-body text-[13px] transition-colors ${
                      picked
                        ? 'border-primary bg-primary-container/40 text-on-surface'
                        : 'border-outline-variant bg-surface text-on-surface-variant'
                    }`}
                  >
                    {t(`doshaQuiz.refine.q.${q.id}.options.${i}`)}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
