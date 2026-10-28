import { colors } from './src/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Los colores viven en src/theme.js para que las gráficas usen los mismos valores.
      colors,
      // Esquinas de documento, no de tarjeta de producto. rounded-full (avatares, puntos) no cambia.
      borderRadius: { sm: '2px', DEFAULT: '3px', md: '3px', lg: '4px', xl: '6px', '2xl': '8px' },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Work Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
