import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'

export default function WelcomePage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-on-surface font-body overflow-x-hidden">

      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">spa</span>
            <span className="text-primary font-headline text-lg italic">The Sanctuary</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-primary font-label tracking-wide"
          >
            Sign in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-end overflow-hidden px-6 pb-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div ref={heroRef} className="absolute w-full h-[120%] -top-[10%]">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80')` }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        </div>

        <div className="relative z-10 w-full max-w-sm text-center mb-8">
          <h1 className="font-headline text-5xl text-on-surface leading-tight mb-5">
            Your Path to{' '}
            <span className="italic font-normal text-primary">Balance.</span>
          </h1>
          <p className="font-body text-base text-on-surface-variant leading-relaxed mb-10">
            A holistic journey to find harmony in your body and mind through yoga and Ayurvedic principles.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/discover')}
              className="w-full py-4 bg-primary text-on-primary rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-secondary-container text-on-secondary-container rounded-full font-label font-semibold tracking-wide text-sm active:scale-95 transition-all"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 py-12 flex flex-col gap-5">

        {/* Personalised Ayurveda */}
        <div className="bg-surface-container rounded-lg p-8 relative overflow-hidden group">
          <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-widest mb-5 inline-block">
            Daily Rituals
          </span>
          <h3 className="font-headline text-2xl text-on-surface mb-3">Personalized Ayurveda</h3>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Discover your Dosha and receive daily nutrition and wellness guidance tailored to your unique constitution.
          </p>
          <button className="mt-6 text-primary font-label font-semibold text-sm flex items-center gap-1 border-b border-primary/20 pb-0.5">
            Explore Practices
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
          <div className="absolute -right-6 -bottom-6 opacity-[0.07] group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[9rem] text-primary">energy_savings_leaf</span>
          </div>
        </div>

        {/* Two small cards */}
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-tertiary-container rounded-lg p-6 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-tertiary-fixed-dim rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-on-tertiary-container">self_care</span>
            </div>
            <h3 className="font-headline text-base text-on-surface mb-2">Mindful Moments</h3>
            <p className="text-on-surface-variant text-xs leading-relaxed">
              Short, guided meditations for the busy modern soul.
            </p>
          </div>
          <div className="bg-secondary-container rounded-lg p-6 flex flex-col justify-center gap-3">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary">water_drop</span>
            </div>
            <div>
              <h4 className="font-headline text-base text-on-surface">Pure Hydration</h4>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-label">Ayurvedic Routine</p>
            </div>
          </div>
        </div>

        {/* Breath Lab */}
        <div className="bg-surface-container-highest rounded-lg p-8 flex items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="font-headline text-2xl text-on-surface mb-3">The Breath Lab</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Master the art of Pranayama to regulate your nervous system and find instant calm.
            </p>
          </div>
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary-fixed-dim rounded-full animate-pulse opacity-50" />
            <div className="relative w-12 h-12 bg-primary-dim rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-xl">air</span>
            </div>
          </div>
        </div>

      </section>

      {/* Quote */}
      <section className="py-20 px-6 bg-surface-container-low text-center">
        <div className="max-w-sm mx-auto">
          <span className="material-symbols-outlined text-outline-variant text-5xl mb-6 block">format_quote</span>
          <p className="font-headline italic text-2xl text-on-surface-variant leading-relaxed mb-6">
            "Health is a state of complete harmony of the body, mind, and spirit."
          </p>
          <p className="font-label text-xs uppercase tracking-widest text-primary font-bold">
            B.K.S. Iyengar
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 flex flex-col items-center text-center">
        <div
          className="w-20 h-20 mb-8 flex items-center justify-center text-on-primary shadow-lg"
          style={{ background: 'linear-gradient(135deg, #50644b, #d2e9c9)', borderRadius: '63% 37% 54% 46% / 45% 48% 52% 55%' }}
        >
          <span className="material-symbols-outlined text-2xl">self_care</span>
        </div>
        <h3 className="font-headline text-xl text-on-surface-variant mb-8">Your mat is waiting.</h3>
        <button
          onClick={() => navigate('/discover')}
          className="px-12 py-4 bg-primary text-on-primary rounded-full font-label text-xs tracking-[0.15em] uppercase font-semibold active:scale-95 transition-all"
        >
          Start Your Journey
        </button>
        <button
          onClick={() => navigate('/discover')}
          className="mt-6 font-label text-xs text-on-surface-variant/60 hover:text-primary transition-colors uppercase tracking-widest"
        >
          Already have an account? Sign in
        </button>
      </section>

      {/* Footer */}
      <footer className="w-full py-10 flex flex-col items-center opacity-40">
        <div className="w-px h-16 bg-gradient-to-b from-primary to-transparent mb-5" />
        <p className="font-headline italic text-primary text-sm">The Sanctuary</p>
      </footer>

    </div>
  )
}