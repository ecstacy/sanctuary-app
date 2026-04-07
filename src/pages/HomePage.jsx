import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const STRUGGLE_ROUTINES = {
  stress: [
    { time: '07:00', title: 'Nadi Shodhana', subtitle: '5 min · Morning Calm', icon: 'air' },
    { time: '12:30', title: 'Balasana', subtitle: '3 min · Midday Reset', icon: 'self_care' },
    { time: '21:00', title: 'Yoga Nidra', subtitle: '10 min · Evening Rest', icon: 'bedtime' },
  ],
  sleep: [
    { time: '08:00', title: 'Surya Namaskar', subtitle: '10 min · Morning Flow', icon: 'wb_sunny' },
    { time: '21:00', title: 'Bhramari', subtitle: '5 min · Wind Down', icon: 'air' },
    { time: '21:30', title: 'Yoga Nidra', subtitle: '15 min · Deep Rest', icon: 'bedtime' },
  ],
  energy: [
    { time: '06:30', title: 'Kapalabhati', subtitle: '3 min · Energise', icon: 'bolt' },
    { time: '07:00', title: 'Surya Namaskar', subtitle: '15 min · Morning Flow', icon: 'wb_sunny' },
    { time: '13:00', title: 'Ujjayi', subtitle: '3 min · Afternoon Lift', icon: 'air' },
  ],
  flexibility: [
    { time: '07:00', title: 'Sun Salutation A', subtitle: '15 min · Morning Flow', icon: 'wb_sunny' },
    { time: '19:00', title: 'Pigeon Pose', subtitle: '5 min · Hip Release', icon: 'self_care' },
    { time: '21:00', title: 'Supta Matsyendrasana', subtitle: '5 min · Spinal Twist', icon: 'bedtime' },
  ],
}

const DEFAULT_ROUTINE = STRUGGLE_ROUTINES.stress

const CHECKIN_OPTIONS = [
  { id: 'stress', label: 'Stressed', icon: 'psychiatry' },
  { id: 'sleep', label: 'Tired', icon: 'bedtime' },
  { id: 'energy', label: 'Low energy', icon: 'bolt' },
  { id: 'flexibility', label: 'Stiff', icon: 'self_care' },
]

const QUOTES = [
  { text: 'True peace is not the absence of movement, but the stillness at the heart of it.', author: 'Ancient Vedic Teaching' },
  { text: 'Health is a state of complete harmony of the body, mind, and spirit.', author: 'B.K.S. Iyengar' },
  { text: 'Yoga is not about touching your toes. It is about what you learn on the way down.', author: 'Jigar Gor' },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Namaste'
  if (hour < 17) return 'Namaste'
  return 'Namaste'
}

function getSubtitle() {
  const hour = new Date().getHours()
  if (hour < 12) return 'The morning is still. Your practice awaits.'
  if (hour < 17) return 'The afternoon calls for stillness.'
  return 'The evening is here. Time to restore.'
}

export default function HomePage() {
  const navigate = useNavigate()
  const { profile, user, signOut } = useAuth()
  const [checkedIn, setCheckedIn] = useState(null)
  const [completedPractices, setCompletedPractices] = useState([])

  const firstName = profile?.full_name?.split(' ')[0] || 'Friend'
  const quote = QUOTES[new Date().getDay() % QUOTES.length]

  // Pick routine based on first struggle, fallback to default
  const routine = DEFAULT_ROUTINE

  function toggleComplete(index) {
    setCompletedPractices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-24">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">spa</span>
          <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        </div>
        <button
          onClick={() => signOut()}
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
        </button>
      </div>

      <div className="px-6 flex flex-col gap-6">

        {/* Greeting */}
        <div>
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">
            {getGreeting()}
          </p>
          <h1 className="font-headline text-4xl text-on-surface leading-tight">
            {firstName}.
          </h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            {getSubtitle()}
          </p>
        </div>

        {/* Daily check-in */}
        <div className="bg-surface-container rounded-lg p-5">
          <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-4">
            How are you feeling today?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {CHECKIN_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => setCheckedIn(option.id)}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  checkedIn === option.id
                    ? 'bg-primary-container text-on-primary-container'
                    : 'bg-surface-container-low text-on-surface'
                }`}
              >
                <span className={`material-symbols-outlined text-lg ${
                  checkedIn === option.id ? 'text-primary' : 'text-on-surface-variant'
                }`}>
                  {option.icon}
                </span>
                <span className="font-body text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
          {checkedIn && (
            <button
              onClick={() => navigate('/discover')}
              className="w-full mt-4 py-3 bg-primary text-on-primary rounded-full font-label text-xs font-semibold tracking-wide active:scale-95 transition-all"
            >
              Get My Practice →
            </button>
          )}
        </div>

        {/* Today's routine */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest">
              Today's Routine
            </p>
            <button className="font-label text-xs text-primary">View all</button>
          </div>

          <div className="bg-surface-container rounded-lg overflow-hidden">
            {routine.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < routine.length - 1 ? 'border-b border-surface-container-high' : ''
                }`}
              >
                <p className="font-label text-xs text-on-surface-variant w-12 flex-shrink-0">
                  {item.time}
                </p>
                <div className="flex-1">
                  <p className="font-body font-semibold text-sm text-on-surface">{item.title}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
                <button
                  onClick={() => toggleComplete(i)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    completedPractices.includes(i)
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {completedPractices.includes(i) ? 'check' : 'play_arrow'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Progress streak */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-primary-container rounded-lg p-5">
            <span className="material-symbols-outlined text-primary text-2xl mb-3 block">local_fire_department</span>
            <p className="font-headline text-2xl text-on-surface">1</p>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">
              Day streak
            </p>
            <div className="w-full h-1 bg-primary/20 rounded-full mt-3">
              <div className="w-[15%] h-full bg-primary rounded-full" />
            </div>
          </div>
          <div className="bg-secondary-container rounded-lg p-5">
            <span className="material-symbols-outlined text-secondary text-2xl mb-3 block">timer</span>
            <p className="font-headline text-2xl text-on-surface">
              {completedPractices.length * 10}
            </p>
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">
              Mins this week
            </p>
            <div className="w-full h-1 bg-secondary/20 rounded-full mt-3">
              <div
                className="h-full bg-secondary rounded-full transition-all"
                style={{ width: `${(completedPractices.length / routine.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dosha card — placeholder until quiz taken */}
        <div className="bg-primary rounded-lg p-6 text-on-primary relative overflow-hidden">
          <p className="font-label text-[10px] uppercase tracking-widest text-on-primary/60 mb-2">
            Dosha Type
          </p>
          <h3 className="font-headline text-2xl mb-1">
            {profile?.dosha ? profile.dosha : 'Undiscovered'}
          </h3>
          {!profile?.dosha && (
            <p className="font-body text-xs text-on-primary/70 leading-relaxed mb-4">
              Take the Dosha quiz to unlock fully personalised recommendations.
            </p>
          )}
          <button className="px-4 py-2 bg-on-primary/10 rounded-full font-label text-xs text-on-primary tracking-wide">
            {profile?.dosha ? 'View profile' : 'Take the quiz →'}
          </button>
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <span className="material-symbols-outlined text-[8rem]">spa</span>
          </div>
        </div>

        {/* Weekly quote */}
        <div className="bg-surface-container-low rounded-lg p-6 text-center">
          <span className="material-symbols-outlined text-outline-variant text-3xl mb-3 block">format_quote</span>
          <p className="font-headline italic text-lg text-on-surface-variant leading-relaxed mb-3">
            "{quote.text}"
          </p>
          <p className="font-label text-[10px] uppercase tracking-widest text-primary">
            {quote.author}
          </p>
        </div>

      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-xl rounded-t-2xl px-6 pb-8 pt-4 flex justify-around items-center shadow-[0_-4px_40px_rgba(49,51,46,0.05)]">
        <button className="flex flex-col items-center gap-1 bg-surface-container px-5 py-2 rounded-full">
          <span className="material-symbols-outlined text-primary">home_max</span>
          <span className="font-label text-[10px] uppercase tracking-widest text-primary">Home</span>
        </button>
        <button
          onClick={() => navigate('/discover')}
          className="flex flex-col items-center gap-1 px-5 py-2"
        >
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Discover</span>
        </button>
        <button className="flex flex-col items-center gap-1 px-5 py-2">
          <span className="material-symbols-outlined text-on-surface-variant">person</span>
          <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Profile</span>
        </button>
      </nav>

    </div>
  )
}