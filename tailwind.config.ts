import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FDF8F3',
        warm: {
          50: '#FDF8F3',
          100: '#F9EDE3',
          200: '#F0D9C7',
          300: '#E5C1A5',
          400: '#D4A07A',
          500: '#C17F54',
        },
        burgundy: {
          50: '#FCF5F5',
          100: '#F5E1E1',
          200: '#E8C4C4',
          300: '#D49A9A',
          400: '#B86B6B',
          500: '#8B4444',
          600: '#6B3333',
          700: '#4A2323',
        },
        sage: {
          50: '#F5F7F5',
          100: '#E8EDE8',
          200: '#D1DDD1',
          300: '#A8C1A8',
          400: '#7BA37B',
        }
      },
      fontFamily: {
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
