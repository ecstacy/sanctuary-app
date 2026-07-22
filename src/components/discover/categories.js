// ─────────────────────────────────────────────────────────────────────────────
//  discover/categories.js — outcome-based browse topics
//
//  Its own module rather than a second export from cards.jsx: mixing a
//  constant in with components breaks React Fast Refresh for the whole file,
//  which is a real cost during UI work for no benefit.
// ─────────────────────────────────────────────────────────────────────────────

// Browse categories — map to recommendation engine topics
// `query` is the recommendation-engine key (stays English); `labelKey`
// is the localized display label.
export const CATEGORIES = [
  { query: 'Lower back pain', labelKey: 'discover.categories.back', icon: 'accessibility_new', gradient: 'from-[#6b8f5e] to-[#b8d4a8]' },
  { query: 'Neck pain', labelKey: 'discover.categories.neck', icon: 'self_care', gradient: 'from-[#a87b5e] to-[#e8c8a8]' },
  { query: 'Anxiety', labelKey: 'discover.categories.anxiety', icon: 'cloud', gradient: 'from-[#8b7ba8] to-[#c8b8e8]' },
  { query: 'Can\'t sleep', labelKey: 'discover.categories.sleep', icon: 'bedtime', gradient: 'from-[#5e6b8f] to-[#a8b8d4]' },
  { query: 'Low energy', labelKey: 'discover.categories.energy', icon: 'bolt', gradient: 'from-[#c4873a] to-[#f0d087]' },
  { query: 'Tight hips', labelKey: 'discover.categories.hips', icon: 'self_care', gradient: 'from-[#8f5e6b] to-[#d4a8b8]' },
  { query: 'Bloating', labelKey: 'discover.categories.digestion', icon: 'gastroenterology', gradient: 'from-[#8f8b5e] to-[#d4d0a8]' },
  { query: 'Posture', labelKey: 'discover.categories.posture', icon: 'straighten', gradient: 'from-[#5e7b8f] to-[#a8c8d4]' },
]

