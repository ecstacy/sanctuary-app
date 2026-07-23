/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary, #50644b)',
        'primary-dim': 'var(--color-primary-dim, #445840)',
        'primary-container': 'var(--color-primary-container, #d2e9c9)',
        'primary-fixed': 'var(--color-primary-fixed, #d0e9d6)',
        'primary-fixed-dim': 'var(--color-primary-fixed-dim, #b4ccbb)',
        'on-primary': 'var(--color-on-primary, #eaffe1)',
        'on-primary-container': 'var(--color-on-primary-container, #43573e)',
        // Earth accents — semantic, themeable via vars (see index.css).
        // `secondary`/`tertiary` are kept as aliases so existing usages don't
        // break, but they now point at the Daylight ochre/clay family.
        pine: 'var(--color-pine, #3a6b53)',
        'pine-container': 'var(--color-pine-container, #e2ebe2)',
        ochre: 'var(--color-ochre, #8a6520)',
        'ochre-mark': 'var(--color-ochre-mark, #b98a37)',
        'ochre-container': 'var(--color-ochre-container, #f1e6cd)',
        clay: 'var(--color-clay, #a24a2b)',
        'clay-mark': 'var(--color-clay-mark, #b25a37)',
        'clay-container': 'var(--color-clay-container, #f0ddd2)',
        secondary: 'var(--color-clay, #a24a2b)',
        'secondary-container': 'var(--color-clay-container, #f0ddd2)',
        'on-secondary-container': '#5c2a16',
        tertiary: 'var(--color-ochre, #b98a37)',
        'tertiary-container': 'var(--color-ochre-container, #f1e6cd)',
        'tertiary-fixed-dim': '#e5c393',
        'on-tertiary-container': '#5b430f',
        error: '#b23a2f',
        'on-error': '#ffffff',
        // Surfaces + ink — all themeable (Daylight now, Dusk later).
        surface: 'var(--color-surface, #f3f0e7)',
        'surface-container-low': 'var(--color-surface-container-low, #fbfaf3)',
        'surface-container': 'var(--color-surface-container, #ece9dd)',
        'surface-container-high': 'var(--color-surface-container-high, #e4e1d2)',
        'surface-container-highest': 'var(--color-surface-container-highest, #ddd8c7)',
        'on-surface': 'var(--color-on-surface, #2b2b26)',
        'on-surface-variant': 'var(--color-on-surface-variant, #57564c)',
        'outline-variant': 'var(--color-outline-variant, #ccc8b8)',
        background: 'var(--color-background, #f3f0e7)',
      },
      // The Devanagari companions sit after the Latin faces: the browser
      // resolves per-glyph, so Latin still renders in Manrope / Noto Serif
      // while Devanagari (Hindi) picks up its matching face instead of an
      // arbitrary system fallback.
      // Daylight type: Fraunces (display serif, real italics + optical sizing)
      // for headings and Sanskrit; Hanken Grotesk (warm grotesk) for the
      // interface. Devanagari companions follow so Hindi resolves per-glyph.
      fontFamily: {
        headline: ['Fraunces', 'Noto Serif Devanagari', 'Georgia', 'serif'],
        body: ['Hanken Grotesk', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        label: ['Hanken Grotesk', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        sans: ['Hanken Grotesk', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Noto Serif Devanagari', 'Georgia', 'serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      spacing: {
       'safe': 'env(safe-area-inset-top)',
      },
    },
  },
  plugins: [],
}