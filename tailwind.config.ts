import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#07140D',
          900: '#0B3B24',
          800: '#14532D',
          700: '#166534',
        },
        urgent: {
          50: '#FCEBEB',
          100: '#FAD7D7',
          500: '#D92B2B',
          600: '#B91F1F',
        },
        teal: {
          50: '#E8F5EC',
          100: '#D1EBD9',
          500: '#1FA34A',
          600: '#17853C',
          700: '#146C31',
        },
        violet: {
          500: '#14532D',
        },
        coral: {
          500: '#D97706',
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
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
