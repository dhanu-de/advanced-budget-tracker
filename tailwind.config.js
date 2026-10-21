/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './client/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // ── BudgetFlow design tokens — mirrors the CSS custom properties in index.css
      colors: {
        bf: {
          bg:       '#070c18',
          surface:  '#0d1526',
          raised:   '#111e33',
          hover:    '#172238',
          border:   '#1a2d47',
          hi:       '#233d5e',
          accent:   '#5b6ff0',
          accent2:  '#4254db',
          green:    '#22d3a0',
          red:      '#f05b7c',
          amber:    '#f0a533',
          violet:   '#9b7bf0',
          sky:      '#38c4f5',
          txt:      '#dce8f5',
          txt2:     '#7a98b8',
          txt3:     '#3f5977',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        token:   '12px',
        'token-lg': '18px',
      },
      gridTemplateColumns: {
        // Dashboard: 2fr 1fr for the chart row
        'dash-charts': '2fr 1fr',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '.6' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        orbPulse: {
          '0%,100%': { transform: 'scale(1)',    opacity: '0.8' },
          '50%':     { transform: 'scale(1.05)', opacity: '1'   },
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.25s ease both',
        'pulse-soft':'pulseSoft 2s ease-in-out infinite',
        shimmer:     'shimmer 1.8s linear infinite',
        'orb-pulse': 'orbPulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};