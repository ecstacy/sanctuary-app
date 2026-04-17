import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { POPULAR_SEARCHES } from '../data/recommendations'
import { ASANAS } from '../data/asanas'


const ALL_ASANAS = Object.values(ASANAS)

// Browse categories — map to recommendation engine topics
const CATEGORIES = [
  { query: 'Lower back pain', label: 'Back & Spine', icon: 'accessibility_new', gradient: 'from-[#6b8f5e] to-[#b8d4a8]' },
  { query: 'Neck pain', label: 'Neck & Shoulders', icon: 'self_care', gradient: 'from-[#a87b5e] to-[#e8c8a8]' },
  { query: 'Anxiety', label: 'Stress & Anxiety', icon: 'cloud', gradient: 'from-[#8b7ba8] to-[#c8b8e8]' },
  { query: 'Can\'t sleep', label: 'Sleep & Rest', icon: 'bedtime', gradient: 'from-[#5e6b8f] to-[#a8b8d4]' },
  { query: 'Low energy', label: 'Energy & Vitality', icon: 'bolt', gradient: 'from-[#c4873a] to-[#f0d087]' },
  { query: 'Tight hips', label: 'Hips & Mobility', icon: 'self_care', gradient: 'from-[#8f5e6b] to-[#d4a8b8]' },
  { query: 'Bloating', label: 'Digestion', icon: 'gastroenterology', gradient: 'from-[#8f8b5e] to-[#d4d0a8]' },
  { query: 'Posture', label: 'Posture', icon: 'straighten', gradient: 'from-[#5e7b8f] to-[#a8c8d4]' },
]

export default function DiscoverPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter asanas matching the search query
  const matchedAsanas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (q.length < 2) return []
    return ALL_ASANAS.filter(a =>
      a.sanskrit.toLowerCase().includes(q) ||
      a.english.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.bodyParts.some(p => p.toLowerCase().includes(q)) ||
      a.benefits.some(b => b.toLowerCase().includes(q))
    )
  }, [searchQuery])

  const showAsanaResults = searchQuery.trim().length >= 2 && matchedAsanas.length > 0

  function handleSearch(q) {
    const query = q || searchQuery
    if (query.trim().length < 2) return
    navigate('/recommendations', { state: { query: query.trim() } })
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-20">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">explore</span>
          <span className="font-headline italic text-primary text-base">Discover</span>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg">person</span>
        </button>
      </div>

      <div className="px-6 flex flex-col gap-5">

        {/* ── Search — hero element ── */}
        <div className="stagger-1">
          <h1 className="font-headline text-2xl text-on-surface mb-1">
            What do you need?
          </h1>
          <p className="font-body text-sm text-on-surface-variant mb-4">
            Describe how you feel and we'll find the right practice.
          </p>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">search</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              placeholder="Back pain, headache, can't sleep..."
              className="w-full bg-surface-container-low rounded-2xl pl-11 pr-12 py-4 text-on-surface font-body text-sm outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/35"
            />
            {searchQuery.length > 0 ? (
              <button
                onClick={() => handleSearch()}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-on-primary text-sm">arrow_forward</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* ── Asana search results ── */}
        {showAsanaResults && (
          <div className="stagger-2">
            <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-2.5">
              Asanas matching "{searchQuery.trim()}"
            </p>
            <div className="flex flex-col gap-2">
              {matchedAsanas.map(asana => (
                <button
                  key={asana.id}
                  onClick={() => navigate(`/asana/${asana.id}`)}
                  className="flex items-center gap-3.5 bg-surface-container-low rounded-xl p-3 text-left active:scale-[0.98] transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">{asana.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm font-semibold text-on-surface">{asana.sanskrit}</p>
                    <p className="font-body text-xs text-on-surface-variant/60">{asana.english}</p>
                    <div className="flex gap-1.5 mt-1">
                      <span className="px-2 py-0.5 bg-primary-fixed rounded-full font-label text-[8px] text-primary uppercase">{asana.level}</span>
                      <span className="px-2 py-0.5 bg-surface-container-high rounded-full font-label text-[8px] text-on-surface-variant uppercase">{asana.category}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Popular search pills ── */}
        <div className="stagger-2">
          <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-2.5">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSearch(item.query)}
                className="flex items-center gap-1.5 bg-surface-container-low rounded-full px-3.5 py-2 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-primary text-xs">{item.icon}</span>
                <span className="font-body text-xs text-on-surface">{item.query}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Browse by Category ── */}
        <div className="stagger-3">
          <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-3">Browse by category</p>
          <div className="grid grid-cols-2 gap-3">
            {CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => handleSearch(cat.query)}
                className="relative overflow-hidden rounded-xl p-4 text-left active:scale-[0.97] transition-all"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-15`} />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full bg-surface/80 flex items-center justify-center mb-3">
                    <span className="material-symbols-outlined text-primary text-lg">{cat.icon}</span>
                  </div>
                  <p className="font-body text-sm font-semibold text-on-surface">{cat.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick routines ── */}
        <div className="stagger-4">
          <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-3">Quick routines</p>
          <div className="flex flex-col gap-2.5">
            {[
              { key: 'stress', label: 'Stress Relief', desc: 'Calm your mind and release tension', icon: 'psychiatry', time: '15 min' },
              { key: 'sleep', label: 'Better Sleep', desc: 'Wind down and prepare for deep rest', icon: 'bedtime', time: '12 min' },
              { key: 'energy', label: 'Energy Boost', desc: 'Wake up your body and revitalize', icon: 'bolt', time: '18 min' },
              { key: 'flexibility', label: 'Flexibility Flow', desc: 'Release stiffness and improve mobility', icon: 'self_care', time: '20 min' },
            ].map(r => (
              <button
                key={r.key}
                onClick={() => navigate('/routine', { state: { routineKey: r.key } })}
                className="flex items-center gap-4 bg-surface-container-low rounded-xl p-4 text-left active:scale-[0.98] transition-all"
              >
                <div className="w-11 h-11 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-lg">{r.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-on-surface">{r.label}</p>
                  <p className="font-body text-xs text-on-surface-variant/60 mt-0.5">{r.desc}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="font-label text-[10px] text-on-surface-variant/40 uppercase">{r.time}</span>
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Explore all Asanas ── */}
        <div className="stagger-5">
          <p className="font-label text-[9px] text-on-surface-variant/50 uppercase tracking-widest mb-3">Explore Asanas</p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {ALL_ASANAS.map(asana => (
              <button
                key={asana.id}
                onClick={() => navigate(`/asana/${asana.id}`)}
                className="flex-shrink-0 w-32 snap-start active:scale-[0.97] transition-all"
              >
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-2 bg-gradient-to-br from-primary-container/30 to-primary/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary/30 text-6xl">{asana.icon}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-on-surface/50 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 bg-surface/70 rounded-full font-label text-[8px] text-primary uppercase">{asana.level}</span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="font-headline text-xs text-white leading-tight">{asana.sanskrit}</p>
                  </div>
                </div>
                <p className="font-body text-xs text-on-surface text-left">{asana.english}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Ayurvedic tip ── */}
        <div className="bg-primary-container/15 rounded-xl p-5 stagger-5">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-lg mt-0.5">local_florist</span>
            <div>
              <p className="font-label text-[9px] text-primary uppercase tracking-widest mb-1">Ayurvedic Wisdom</p>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                The body heals with play, the mind heals with laughter, and the spirit heals with silence. Take a moment today to embrace all three.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
