import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1330',
          900: '#101C45',
          800: '#16265A',
          700: '#1E3275',
        },
        urgent: {
          50: '#FFF1F1',
          100: '#FFE0E0',
          500: '#D92B2B',
          600: '#B91F1F',
        },
        teal: {
          50: '#EEF4FF',
          100: '#DCE8FF',
          500: '#1246D8',
          600: '#0F3BB8',
          700: '#0C2F93',
        },
        violet: {
          50: '#F3F0FF',
          500: '#7655E8',
        },
        coral: {
          500: '#FF9B45',
        },
        sky: {
          400: '#36D9F5',
          500: '#00C9C8',
        },
        bg: 'var(--lc-bg)',
        surface: 'var(--lc-surface)',
        surface2: 'var(--lc-surface-2)',
        ink: 'var(--lc-ink)',
        muted: 'var(--lc-muted)',
        line: 'var(--lc-line)',
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 12px 32px rgba(18, 70, 216, 0.08)',
        lift: '0 18px 45px rgba(16, 28, 69, 0.14)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        rise: 'rise 0.45s ease-out both',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
