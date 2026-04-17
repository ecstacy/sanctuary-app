import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { searchRecommendations, POPULAR_SEARCHES } from '../data/recommendations'
import * as analytics from '../lib/analytics'

export default function RecommendationsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef(null)
  const { profile, user } = useAuth()
  const gender = profile?.gender || null

  const initialQuery = location.state?.query || ''
  const initialSource = location.state?.source || analytics.SEARCH_SOURCES.HOME_SEARCH
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState([])
  const [expandedPractice, setExpandedPractice] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  // Tracks where the currently-displayed result set came from, so the
  // searches-table log picks the right `source` value. Updated on every
  // handleSearch call and on mount when we auto-run the initial query.
  const [lastSearchSource, setLastSearchSource] = useState(null)
  // Refs guard against double-logging (StrictMode, re-renders).
  const lastLoggedShownKeyRef = useRef(null)
  const lastLoggedSearchKeyRef = useRef(null)

  // ── Log `shown` events for each result whenever a new result set arrives ──
  useEffect(() => {
    if (!user?.id || !hasSearched || results.length === 0) return
    const key = `${query}|${results.map(r => r.id).join(',')}`
    if (lastLoggedShownKeyRef.current === key) return
    lastLoggedShownKeyRef.current = key

    results.forEach((rec, i) => {
      analytics.logContentEvent({
        userId: user.id,
        eventType: analytics.EVENT_TYPES.SHOWN,
        contentType: analytics.CONTENT_TYPES.RECOMMENDATION,
        contentId: rec.id,
        surface: analytics.SURFACES.SEARCH_RESULT,
        context: { query, rank: i + 1, total_results: results.length },
      })
    })
  }, [user?.id, hasSearched, results, query])

  // ── Log to `searches` table once per (query, source) pair ──
  // Separate from the computation path so auth-hydration races don't drop rows.
  useEffect(() => {
    if (!user?.id || !hasSearched || !query || !lastSearchSource) return
    const key = `${query}|${lastSearchSource}`
    if (lastLoggedSearchKeyRef.current === key) return
    lastLoggedSearchKeyRef.current = key

    const top = results[0]
    analytics.logSearch({
      userId: user.id,
      query,
      resultCount: results.length,
      topResultId: top?.id ?? null,
      topResultType: top ? analytics.CONTENT_TYPES.RECOMMENDATION : null,
      source: lastSearchSource,
    })
  }, [user?.id, hasSearched, query, results, lastSearchSource])

  // Run search on mount if query was passed
  useEffect(() => {
    if (initialQuery) {
      const found = searchRecommendations(initialQuery, { gender })
      setResults(found)
      setHasSearched(true)
      setLastSearchSource(initialSource)
    } else {
      // Focus input if no query
      setTimeout(() => inputRef.current?.focus(), 400)
    }
  }, [initialQuery, gender, initialSource])

  function handleSearch(searchQuery, source = analytics.SEARCH_SOURCES.RECOMMENDATIONS_PAGE) {
    const q = (searchQuery || query).trim()
    if (q.length < 2) return
    setQuery(q)
    const found = searchRecommendations(q, { gender })
    setResults(found)
    setHasSearched(true)
    setLastSearchSource(source)
    inputRef.current?.blur()
  }

  // ── Practice card expand/collapse — log `clicked` when expanding ──
  function handlePracticeToggle(recId, practiceIndex, practiceTitle) {
    const key = `${recId}-${practiceIndex}`
    const willExpand = expandedPractice !== key
    setExpandedPractice(willExpand ? key : null)
    if (willExpand && user?.id) {
      analytics.logContentEvent({
        userId: user.id,
        eventType: analytics.EVENT_TYPES.CLICKED,
        contentType: analytics.CONTENT_TYPES.RECOMMENDATION,
        contentId: `${recId}:practice:${practiceIndex}`,
        surface: analytics.SURFACES.SEARCH_RESULT,
        context: { query, practice_title: practiceTitle },
      })
    }
  }

  // ── "Also Related" card click — log `clicked`, then pivot the search ──
  function handleRelatedClick(rec) {
    if (user?.id) {
      analytics.logContentEvent({
        userId: user.id,
        eventType: analytics.EVENT_TYPES.CLICKED,
        contentType: analytics.CONTENT_TYPES.RECOMMENDATION,
        contentId: rec.id,
        surface: analytics.SURFACES.SEARCH_RESULT,
        context: { query, source: 'also_related' },
      })
    }
    setQuery(rec.label)
    handleSearch(rec.label, analytics.SEARCH_SOURCES.ALSO_RELATED)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  const topResult = results[0]
  const otherResults = results.slice(1)

  return (
    <div className="min-h-screen bg-background text-on-surface font-body pb-16">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <button onClick={() => navigate('/home')} className="text-on-surface-variant">
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <span className="font-headline italic text-primary text-base">The Sanctuary</span>
        <div className="w-6" />
      </div>

      <div className="px-6">

        {/* Search bar */}
        <div className="relative mb-6 stagger-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <span className="material-symbols-outlined text-on-surface-variant/50 text-lg">search</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you're feeling..."
            className="w-full bg-surface-container rounded-full pl-11 pr-4 py-4 text-on-surface font-body text-sm outline-none focus:bg-surface-container-high transition-colors placeholder:text-on-surface-variant/40"
          />
          {query.length > 0 && (
            <button
              onClick={() => { setQuery(''); setResults([]); setHasSearched(false); inputRef.current?.focus() }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <span className="material-symbols-outlined text-on-surface-variant/40 text-lg">close</span>
            </button>
          )}
        </div>

        {/* ── No search yet: show popular searches ── */}
        {!hasSearched && (
          <div className="stagger-2">
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              {POPULAR_SEARCHES.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(item.query); handleSearch(item.query, analytics.SEARCH_SOURCES.POPULAR_CHIP) }}
                  className="flex items-center gap-2 bg-surface-container rounded-full px-4 py-2.5 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-primary text-sm">{item.icon}</span>
                  <span className="font-body text-xs text-on-surface">{item.query}</span>
                </button>
              ))}
            </div>

            <div className="bg-surface-container-low rounded-lg p-6 text-center">
              <span className="material-symbols-outlined text-primary/30 text-4xl mb-3 block">self_care</span>
              <p className="font-headline italic text-lg text-on-surface-variant/60 mb-2">
                Tell us what hurts.
              </p>
              <p className="font-body text-xs text-on-surface-variant/40 leading-relaxed">
                Type your symptom or concern and we'll recommend<br />
                the right yoga and Ayurvedic practices for you.
              </p>
            </div>
          </div>
        )}

        {/* ── No results ── */}
        {hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center text-center py-12 stagger-2">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-2xl">search_off</span>
            </div>
            <h3 className="font-headline text-xl text-on-surface mb-2">
              No matches for "{query}"
            </h3>
            <p className="font-body text-xs text-on-surface-variant leading-relaxed max-w-xs mb-6">
              Try different words — for example "back pain", "headache", "anxiety", or "can't sleep".
            </p>
            <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-3">
              Try these instead
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.slice(0, 4).map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setQuery(item.query); handleSearch(item.query, analytics.SEARCH_SOURCES.NO_RESULTS_SUGGESTION) }}
                  className="flex items-center gap-2 bg-surface-container rounded-full px-3 py-2 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-primary text-sm">{item.icon}</span>
                  <span className="font-body text-xs text-on-surface">{item.query}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {hasSearched && topResult && (
          <div>

            {/* Primary result hero */}
            <div className={`bg-gradient-to-br ${topResult.color} rounded-lg p-6 mb-5 relative overflow-hidden stagger-2`}>
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <span className="material-symbols-outlined text-[7rem]">{topResult.icon}</span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-white/80 text-lg">{topResult.icon}</span>
                  <p className="font-label text-[10px] text-white/70 uppercase tracking-widest">
                    Recommended for you
                  </p>
                </div>
                <h2 className="font-headline text-2xl text-white mb-2">
                  {topResult.label}
                </h2>
                <p className="font-body text-xs text-white/80 leading-relaxed">
                  {topResult.description}
                </p>
              </div>
            </div>

            {/* Practice cards */}
            <div className="mb-5 stagger-3">
              <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
                Recommended Practices · {topResult.practices.length} poses
              </p>
              <div className="flex flex-col gap-3">
                {topResult.practices.map((practice, i) => {
                  const isExpanded = expandedPractice === `${topResult.id}-${i}`
                  return (
                    <button
                      key={i}
                      onClick={() => handlePracticeToggle(topResult.id, i, practice.title)}
                      className="bg-surface-container rounded-lg p-4 text-left transition-all active:scale-[0.98] w-full"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-primary text-lg">{practice.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-semibold text-sm text-on-surface">{practice.title}</p>
                          <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
                            {practice.subtitle}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="font-label text-[10px] text-primary font-semibold">{practice.duration}</span>
                          <span className="font-label text-[9px] text-on-surface-variant/50 uppercase">{practice.level}</span>
                        </div>
                        <span className={`material-symbols-outlined text-on-surface-variant/30 text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                          expand_more
                        </span>
                      </div>
                      {/* Expanded description */}
                      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-24 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="font-body text-xs text-on-surface-variant leading-relaxed pl-14">
                          {practice.description}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Breathwork */}
            <div className="bg-primary-container rounded-lg p-5 mb-5 stagger-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-lg">air</span>
                </div>
                <div>
                  <p className="font-body font-semibold text-sm text-on-surface">{topResult.breathwork.title}</p>
                  <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">{topResult.breathwork.subtitle}</p>
                </div>
              </div>
              <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                {topResult.breathwork.description}
              </p>
            </div>

            {/* Ayurvedic tip */}
            <div className="bg-surface-container-low rounded-lg p-5 mb-5 stagger-5">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">spa</span>
                <div>
                  <p className="font-label text-[10px] text-primary uppercase tracking-widest mb-2">
                    Ayurvedic Insight
                  </p>
                  <p className="font-body text-xs text-on-surface leading-relaxed italic">
                    {topResult.ayurvedicTip}
                  </p>
                </div>
              </div>
            </div>

            {/* Other matches */}
            {otherResults.length > 0 && (
              <div className="mb-6 stagger-6">
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-4">
                  Also Related
                </p>
                <div className="flex flex-col gap-3">
                  {otherResults.map((rec, i) => (
                    <button
                      key={i}
                      onClick={() => handleRelatedClick(rec)}
                      className="flex items-center gap-4 bg-surface-container rounded-lg p-4 text-left active:scale-[0.98] transition-all"
                    >
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${rec.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="material-symbols-outlined text-white text-lg">{rec.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-body font-semibold text-sm text-on-surface">{rec.label}</p>
                        <p className="font-label text-[10px] text-on-surface-variant mt-0.5">
                          {rec.practices.length} practices · Breathwork
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-sm">chevron_right</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 py-4 border-t border-surface-container-high">
              <span className="material-symbols-outlined text-on-surface-variant/30 text-sm mt-0.5">info</span>
              <p className="font-label text-[9px] text-on-surface-variant/40 leading-relaxed">
                These recommendations are for general wellness only. If you have a medical condition, please consult a healthcare professional before starting any exercise program.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
