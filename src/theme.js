// Única fuente de los colores: la usan Tailwind (tailwind.config.js), las gráficas (Recharts)
// y el grabado del login y del lomo (Guilloche.jsx). Nombres por función, no por tono.
// Paleta "verde de seguridad": el verde del papel de seguridad y del grabado guilloché.
// Contrastes medidos contra WCAG AA (4.5:1 para texto).
export const colors = {
  background: '#F3F5F2',   // fondo de la app: gris verdoso muy claro, frío
  surface: '#FFFFFF',      // hojas, diálogos
  muted: '#EDF1EE',        // hover, fondo de inputs
  subtle: '#DCE4DF',       // filetes suaves, chips neutros, esqueletos
  outline: '#C5D2CA',      // bordes de casillas e inputs

  // Tinta del expediente: lomo (barra lateral) y fondo del login.
  ink: {
    DEFAULT: '#14302A',    // blanco encima: 14:1
    line: '#2A4D41',       // líneas del grabado sobre la tinta
  },

  foreground: {
    DEFAULT: '#17241F',    // texto principal (16:1)
    muted: '#53625A',      // texto secundario (6.4:1 sobre surface, 5:1 sobre subtle)
  },

  primary: {
    DEFAULT: '#1F5C45',    // verde botella: acciones (7.9:1 con texto blanco)
    hover: '#256B51',
    strong: '#174836',     // texto verde sobre tintes, sello
  },
  danger: {
    DEFAULT: '#C24646',    // iconos y tintes
    strong: '#A83434',     // texto y botones destructivos (6.6:1)
  },
  success: {
    DEFAULT: '#2A8A5E',    // iconos y tintes
    strong: '#1E7049',     // texto y botones (6:1)
    ink: '#185C3C',        // texto sobre el tinte verde de los chips (6.6:1)
  },
  // Pendiente / en revisión: ámbar, para no confundirse con el verde de "aprobado" ni de las acciones.
  warning: {
    DEFAULT: '#C98A1B',
    ink: '#7A4F00',        // texto sobre el tinte ámbar (6.2:1)
  },
};
