// Única fuente de los colores: la usan Tailwind (tailwind.config.js) y las gráficas (Recharts),
// que necesitan los valores en JS. Nombres por función, no por tono.
// Contrastes medidos contra WCAG AA (4.5:1 para texto).
export const colors = {
  background: '#F4F6FA',   // fondo de la app
  surface: '#FFFFFF',      // tarjetas, barra lateral, diálogos
  muted: '#F1F3F7',        // hover, fondo de inputs
  subtle: '#E3E6EC',       // bordes suaves, chips neutros, esqueletos
  outline: '#CBD1DB',      // bordes de inputs y botones secundarios

  foreground: {
    DEFAULT: '#1C2433',    // texto principal (14:1)
    muted: '#5B6475',      // texto secundario (6:1 sobre surface, 4.8:1 sobre subtle)
  },

  primary: {
    DEFAULT: '#2F5BD1',    // acciones principales (5.9:1 con texto blanco)
    hover: '#3D6BE0',
    strong: '#2446A8',     // texto azul sobre tintes, marca del login
  },
  danger: {
    DEFAULT: '#D64545',    // iconos y tintes
    strong: '#B83838',     // texto y botones destructivos (5.7:1)
  },
  success: {
    DEFAULT: '#1F9D63',    // iconos y tintes
    strong: '#187E4F',     // texto y botones (5.1:1)
    ink: '#146B43',        // texto sobre el tinte verde de los chips (5.5:1)
  },
};
