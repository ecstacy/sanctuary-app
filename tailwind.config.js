/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#50644b',
        'primary-dim': '#445840',
        'primary-container': '#d2e9c9',
        'primary-fixed': '#d0e9d6',
        'primary-fixed-dim': '#b4ccbb',
        'on-primary': '#eaffe1',
        'on-primary-container': '#43573e',
        secondary: '#7a583b',
        'secondary-container': '#ffdcc1',
        'on-secondary-container': '#6b4b2f',
        tertiary: '#6a5e46',
        'tertiary-container': '#feecce',
        'tertiary-fixed-dim': '#efdec0',
        'on-tertiary-container': '#3f341f',
        surface: '#fbf9f4',
        'surface-container-low': '#f5f4ed',
        'surface-container': '#efeee7',
        'surface-container-high': '#e9e8e1',
        'surface-container-highest': '#e3e3db',
        'on-surface': '#31332e',
        'on-surface-variant': '#5e6059',
        'outline-variant': '#b2b2ab',
        background: '#fbf9f4',
      },
      fontFamily: {
        headline: ['Noto Serif', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        label: ['Manrope', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif', 'Georgia', 'serif'],
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