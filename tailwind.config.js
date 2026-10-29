/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter Display"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Fragment Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        brand: {
          primary: '#5f61ed',
          blue: '#006fff',
          lavender: '#9191ff',
        },
        ink: '#0d0d0d',
        paper: '#f7f7f7',
        sky: {
          top: '#1b7bd6',
          mid: '#79bfff',
          low: '#cfeaff',
          glow: '#ffd8a8',
        },
        grass: {
          dark: '#2f6a2a',
          mid: '#6cab3b',
          light: '#aed98c',
        },
      },
      borderRadius: {
        xl2: '20px',
        '2xl2': '28px',
      },
      boxShadow: {
        glass: '0 1px 0 rgba(255,255,255,0.08) inset, 0 20px 60px -20px rgba(0,0,0,0.45)',
        soft: '0 10px 40px -20px rgba(13,13,13,0.35)',
      },
      backdropBlur: { xl: '24px', '2xl': '40px' },
      keyframes: {
        'agent-ring': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'bloom': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '40%': { transform: 'scale(1.4)', opacity: '0.8' },
          '100%': { transform: 'scale(0.8)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'agent-ring': 'agent-ring 4s linear infinite',
        'bloom': 'bloom 600ms ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
