import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STRUGGLES = [
  {
    id: 'stress',
    label: 'Stress',
    description: 'Ease mental fatigue and quiet the internal noise.',
    icon: 'psychiatry',
    color: 'bg-[#efeee7]',
    activeColor: 'bg-primary-container',
  },
  {
    id: 'sleep',
    label: 'Sleep',
    description: 'Deepen your rest and stabilise your circadian rhythm.',
    icon: 'bedtime',
    color: 'bg-[#efeee7]',
    activeColor: 'bg-primary-container',
  },
  {
    id: 'energy',
    label: 'Energy',
    description: 'Revitalise your spirit and overcome afternoon slumps.',
    icon: 'bolt',
    color: 'bg-[#efeee7]',
    activeColor: 'bg-primary-container',
  },
  {
    id: 'flexibility',
    label: 'Flexibility',
    description: 'Release physical tension and improve mobility.',
    icon: 'self_care',
    color: 'bg-[#efeee7]',
    activeColor: 'bg-primary-container',
  },
]

export default function DiscoverPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const [notes, setNotes] = useState('')

  function toggle(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  function handleContinue() {
    // Pass selections via navigation state — no account needed yet
    navigate('/preview', {
      state: { struggles: selected, notes }
    })
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => navigate('/')}
          className="text-on-surface-variant"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 flex flex-col px-6 pb-12">

        {/* Heading */}
        <div className="mb-8">
          <p className="font-label text-xs text-primary uppercase tracking-widest mb-2">
            Problem Discovery
          </p>
          <h1 className="font-headline text-4xl text-on-surface leading-tight">
            What brings you to{' '}
            <span className="italic font-normal text-primary">The Sanctuary</span>{' '}
            today?
          </h1>
          <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">
            Select the areas where you feel a need for restoration. We will craft your journey based on these.
          </p>
        </div>

        {/* Struggle cards */}
        <div className="flex flex-col gap-4 mb-8">
          {STRUGGLES.map(s => (
            <button
              key={s.id}
              onClick={() => toggle(s.id)}
              className={`flex items-center gap-4 p-5 rounded-lg text-left transition-all duration-200 ${
                selected.includes(s.id) ? s.activeColor : s.color
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                selected.includes(s.id)
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}>
                <span className="material-symbols-outlined text-xl">{s.icon}</span>
              </div>
              <div className="flex-1">
                <p className={`font-body font-semibold text-base ${
                  selected.includes(s.id) ? 'text-on-primary-container' : 'text-on-surface'
                }`}>
                  {s.label}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                  {s.description}
                </p>
              </div>
              {selected.includes(s.id) && (
                <span className="material-symbols-outlined text-primary flex-shrink-0">check_circle</span>
              )}
            </button>
          ))}
        </div>

        {/* Optional notes */}
        {selected.length > 0 && (
          <div className="bg-surface-container-low rounded-lg p-5 mb-8">
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-3">
              Describe your current state
              <span className="normal-case tracking-normal text-on-surface-variant/50 ml-1">(optional)</span>
            </p>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="In my own words, I am feeling..."
              rows={3}
              className="w-full bg-transparent text-on-surface font-body text-sm outline-none resize-none placeholder:text-on-surface-variant/40"
            />
            <p className="font-label text-[10px] text-primary/60 italic mt-2">
              Your words help us refine your wellness path.
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all disabled:opacity-30 mt-auto"
        >
          Show My Sanctuary
        </button>

        <button
          onClick={() => navigate('/preview', { state: { struggles: [], notes: '' } })}
          className="mt-4 text-center text-xs text-on-surface-variant/50 font-label uppercase tracking-widest"
        >
          I'll decide later
        </button>

      </div>
    </div>
  )
}