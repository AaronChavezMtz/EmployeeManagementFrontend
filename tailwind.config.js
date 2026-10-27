import { colors } from './src/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Los colores viven en src/theme.js para que las gráficas usen los mismos valores.
      colors,
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Work Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
