import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#07121F',
          900: '#0A1A2F',
          800: '#10243D',
          700: '#17324F',
        },
        urgent: {
          50: '#FDECEC',
          100: '#FBD9D9',
          500: '#E24B4A',
          600: '#C93A39',
        },
        teal: {
          50: '#E6F8F6',
          500: '#12B3A6',
          600: '#0E9A8E',
        },
        violet: {
          500: '#6D4AFF',
        },
        coral: {
          500: '#FF7A59',
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
        soft: '0 8px 30px rgba(7, 18, 31, 0.07)',
      },
    },
  },
  plugins: [],
};

export default config;
