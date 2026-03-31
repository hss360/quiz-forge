/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'system-ui'],
        body: ['var(--font-body)', 'system-ui'],
      },
      colors: {
        forge: {
          bg: '#0a0a0f',
          surface: '#14141f',
          border: '#1e1e30',
          accent: '#f97316',
          correct: '#22c55e',
          wrong: '#ef4444',
          purple: '#a855f7',
          blue: '#3b82f6',
        },
      },
      keyframes: {
        'countdown-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'score-pop': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'countdown-pulse': 'countdown-pulse 1s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'score-pop': 'score-pop 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
