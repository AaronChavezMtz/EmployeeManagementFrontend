/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0E1015',
          900: '#14161C',
          800: '#1C1F27',
          700: '#262A34',
          600: '#343945',
        },
        paper: {
          100: '#F6F4EF',
          200: '#EDEAE1',
        },
        gold: {
          400: '#D9B873',
          500: '#C9A15A',
          600: '#AC8440',
        },
        clay: {
          500: '#C1554B',
          600: '#A8463D',
        },
        sage: {
          500: '#5C8A6E',
          600: '#4A7259',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Work Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
