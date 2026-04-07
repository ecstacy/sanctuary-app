import { useNavigate, useLocation } from 'react-router-dom'

const STRUGGLE_PREVIEWS = {
  stress: {
    label: 'Stress Relief',
    sequence: ['Nadi Shodhana · 5 min', 'Balasana · 2 min', 'Viparita Karani · 5 min'],
    tip: 'Warm sesame oil massage before bed calms Vata.',
    icon: 'psychiatry',
  },
  sleep: {
    label: 'Deep Sleep',
    sequence: ['Bhramari · 5 min', 'Supta Baddha Konasana · 3 min', 'Yoga Nidra · 10 min'],
    tip: 'Ashwagandha in warm milk 30 min before bed.',
    icon: 'bedtime',
  },
  energy: {
    label: 'Energy Boost',
    sequence: ['Kapalabhati · 3 min', 'Surya Namaskar · 10 min', 'Ujjayi · 3 min'],
    tip: 'Ginger tea with honey activates Agni at dawn.',
    icon: 'bolt',
  },
  flexibility: {
    label: 'Flexibility Flow',
    sequence: ['Uttanasana · 2 min', 'Pigeon Pose · 3 min', 'Supta Matsyendrasana · 2 min'],
    tip: 'Warm sesame oil on joints before practice.',
    icon: 'self_care',
  },
}

const WHY_ACCOUNT = [
  {
    icon: 'bookmark',
    title: 'Your practice, remembered',
    description: 'We save your sequences, streaks, and progress so you never lose your journey.',
  },
  {
    icon: 'energy_savings_leaf',
    title: 'Personalised to your constitution',
    description: 'Your Dosha profile and daily recommendations evolve as we learn what works for you.',
  },
  {
    icon: 'lock',
    title: 'Private by design',
    description: 'Your health data is encrypted, never sold, and deletable at any time. You own it.',
  },
]

export default function PreviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { struggles = [], notes = '' } = location.state || {}

  // Pick first selected struggle for preview, fallback to stress
  const primaryStruggle = struggles[0] || 'stress'
  const preview = STRUGGLE_PREVIEWS[primaryStruggle]

  return (
    <div className="min-h-screen bg-background text-on-surface font-body flex flex-col">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <button
          onClick={() => navigate('/discover')}
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
            Your Personalised Preview
          </p>
          <h1 className="font-headline text-4xl text-on-surface leading-tight">
            Your path to{' '}
            <span className="italic font-normal text-primary">
              {preview.label}.
            </span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-3 leading-relaxed">
            Based on what you shared, here is a glimpse of your Sanctuary practice.
          </p>
        </div>

        {/* Prescription preview card */}
        <div className="bg-surface-container rounded-lg p-6 mb-5 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-lg">{preview.icon}</span>
            </div>
            <div>
              <p className="font-body font-semibold text-on-surface text-sm">{preview.label} Sequence</p>
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                Personalised practice{struggles.length > 1 ? ` · +${struggles.length - 1} more` : ''}
              </p>
            </div>
          </div>

          {/* Sequence steps */}
          <div className="flex flex-col gap-3 mb-5">
            {preview.sequence.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary-fixed-dim flex items-center justify-center flex-shrink-0">
                  <span className="font-label text-[10px] text-primary font-semibold">{i + 1}</span>
                </div>
                <p className="font-body text-sm text-on-surface">{step}</p>
              </div>
            ))}
          </div>

          {/* Ayurvedic tip */}
          <div className="bg-surface-container-low rounded-lg p-4 flex gap-3">
            <span className="material-symbols-outlined text-primary text-base flex-shrink-0 mt-0.5">spa</span>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed italic">
              {preview.tip}
            </p>
          </div>

          {/* Blurred overlay — locked content teaser */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-container to-transparent" />
        </div>

        {/* Locked content teaser */}
        <div className="bg-surface-container-low rounded-lg p-5 mb-8 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-[2px] bg-background/40" />
          <div className="relative z-10 w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-on-surface-variant">lock</span>
          </div>
          <div className="relative z-10">
            <p className="font-body font-semibold text-sm text-on-surface">
              Your Dosha profile + 12 more sequences
            </p>
            <p className="font-label text-xs text-on-surface-variant mt-0.5">
              Create a free account to unlock everything
            </p>
          </div>
        </div>

        {/* Why create an account */}
        <div className="mb-8">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-5">
            Why create an account
          </p>
          <div className="flex flex-col gap-4">
            {WHY_ACCOUNT.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">{item.icon}</span>
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-on-surface">{item.title}</p>
                  <p className="font-label text-xs text-on-surface-variant mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/signup', { state: { struggles, notes } })}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all"
        >
          Create My Free Account
        </button>

        <button
          onClick={() => navigate('/login')}
          className="mt-4 text-center text-xs text-on-surface-variant/50 font-label uppercase tracking-widest"
        >
          Already have an account? Sign in
        </button>

      </div>
    </div>
  )
}