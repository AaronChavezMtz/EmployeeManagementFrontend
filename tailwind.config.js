/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta "corporativa clara": fondo casi blanco, superficies blancas,
        // texto azul-grafito oscuro, acento azul institucional.
        // Se mantienen los mismos nombres de token (ink/paper/gold/clay/sage)
        // usados en todos los componentes, solo cambian los valores —
        // así todo el UI se re-temiza desde un solo lugar.
        ink: {
          950: '#2446A8', // fondo general de la app (mismo azul institucional del login)
          900: '#FFFFFF', // superficies (sidebar, tarjetas, inputs... base)
          800: '#F1F3F7', // hover / fondo de inputs
          700: '#E3E6EC', // bordes sutiles
          600: '#CBD1DB', // bordes de inputs
        },
        paper: {
          100: '#1C2433', // texto principal (azul-grafito oscuro)
          200: '#2E3A52',
        },
        gold: {
          400: '#3D6BE0', // acento azul institucional (hover)
          500: '#2F5BD1', // acento azul institucional (base)
          600: '#2446A8', // acento azul institucional (presionado)
        },
        clay: {
          500: '#D64545',
          600: '#B83838',
        },
        sage: {
          500: '#1F9D63',
          600: '#187E4F',
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
