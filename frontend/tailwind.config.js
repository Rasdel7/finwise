/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        dark: {
          900: '#050810',
          800: '#0a0f1e',
          700: '#0f1629',
          600: '#161d35',
          500: '#1e2744'
        },
        accent: {
          primary: '#6c63ff',
          secondary: '#00d4aa',
          warning: '#f59e0b',
          danger: '#ef4444',
          glow: 'rgba(108, 99, 255, 0.3)'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-glow': 'pulseGlow 2s infinite',
        'count-up': 'countUp 0.6s ease forwards'
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseGlow: { '0%,100%': { boxShadow: '0 0 20px rgba(108,99,255,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(108,99,255,0.6)' } }
      }
    }
  },
  plugins: []
}
