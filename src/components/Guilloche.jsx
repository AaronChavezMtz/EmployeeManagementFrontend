import { useId } from 'react';
import { colors } from '../theme';

// Grabado de seguridad (guilloché), el de contratos, títulos y recibos de nómina.
// Se genera con hipotrocoides: la misma matemática de los tornos de grabado. Todo es decorativo.

// rotation gira la curva entera alrededor del centro (desplazar t solo la recorre desde otro punto).
function hypotrochoid({ R, r, d, cx, cy, steps = 1400, turns, rotation = 0 }) {
  const points = [];
  const total = Math.PI * 2 * turns;
  const [cos, sin] = [Math.cos(rotation), Math.sin(rotation)];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * total;
    const px = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const py = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    const x = cx + px * cos - py * sin;
    const y = cy + px * sin + py * cos;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M${points.join('L')}`;
}

// Precalculados una vez al cargar el módulo: no cambian entre renders.
// Bandas de encaje: una onda sin bucles (d < r) repetida y girada a lo largo de una onda,
// hasta que las copias se cruzan en malla como el grabado de un título.
// R/r entero = la curva cierra en una vuelta con R/r ondas.
const band = (R, lobes, d, copies) =>
  Array.from({ length: copies }, (_, k) =>
    hypotrochoid({ R, r: R / lobes, d, cx: 120, cy: 120, turns: 1, steps: 720, rotation: (2 * Math.PI * k) / (lobes * copies) }));
const SEAL_RINGS = [...band(84, 12, 6.2, 10), ...band(60, 10, 5.2, 9)];

const WAVES = Array.from({ length: 26 }, (_, i) => {
  const y0 = 18 + i * 34;
  let d = `M-20,${y0}`;
  for (let x = -20; x <= 1460; x += 12) {
    const y = y0 + Math.sin(x / 70 + i * 0.45) * 9 + Math.sin(x / 23 + i) * 2.5;
    d += `L${x},${y.toFixed(1)}`;
  }
  return d;
});

// Sello circular con monograma y leyenda grabada en el anillo.
// compact: versión reducida para tamaños pequeños (lomo, barra móvil): sin leyenda, que ahí sería ilegible.
export function Seal({ className = '', compact = false }) {
  const ringId = useId();
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true" focusable="false">
      <defs>
        <path id={ringId} d="M120,120 m-103,0 a103,103 0 1,1 206,0 a103,103 0 1,1 -206,0" />
      </defs>
      <circle cx="120" cy="120" r="117" fill={colors.surface} />
      <circle cx="120" cy="120" r="114" fill="none" stroke={colors.primary.strong} strokeWidth="1.2" />
      <circle cx="120" cy="120" r="93" fill="none" stroke={colors.primary.strong} strokeWidth="0.8" />
      {/* textLength reparte la leyenda exactamente alrededor del círculo (2π·103 ≈ 647). */}
      {!compact && (
        <text fill={colors.primary.strong} fontFamily="Work Sans, sans-serif" fontSize="10.5">
          <textPath href={`#${ringId}`} textLength="640" lengthAdjust="spacing">Gestor de Empleados ✦ Sistema de Recursos Humanos ✦</textPath>
        </text>
      )}
      {SEAL_RINGS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={colors.primary.strong} strokeWidth={compact ? 1.1 : 0.35} opacity={0.8} />
      ))}
      <circle cx="120" cy="120" r={compact ? 50 : 36} fill={colors.surface} stroke={colors.primary.strong} strokeWidth={compact ? 3 : 1} />
      <text x="120" y={compact ? 141 : 131} textAnchor="middle" fill={colors.ink.DEFAULT} fontFamily="Fraunces, serif" fontSize={compact ? 58 : 30}>RH</text>
    </svg>
  );
}

// Banda de seguridad: el "cordón" de un cheque o un título. Ondas desfasadas que se entrelazan
// (dos familias con periodos distintos para que el cruce no se repita en bloques idénticos).
const BAND_WIDTH = 480;
const BAND_HEIGHT = 34;
const BAND_PATHS = [
  ...Array.from({ length: 7 }, (_, k) => ({ period: 40, amp: 12, phase: (k * Math.PI) / 7 })),
  ...Array.from({ length: 5 }, (_, k) => ({ period: 96, amp: 7, phase: (k * 2 * Math.PI) / 5 })),
].map(({ period, amp, phase }) => {
  let d = '';
  for (let x = 0; x <= BAND_WIDTH; x += 2) {
    const y = BAND_HEIGHT / 2 + amp * Math.sin((2 * Math.PI * x) / period + phase);
    d += `${x === 0 ? 'M' : 'L'}${x},${y.toFixed(2)}`;
  }
  return d;
});

export function SecurityBand({ className = '' }) {
  return (
    <svg viewBox={`0 0 ${BAND_WIDTH} ${BAND_HEIGHT}`} preserveAspectRatio="none" className={className} aria-hidden="true" focusable="false">
      {BAND_PATHS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={colors.primary.strong} strokeWidth="0.5" opacity="0.7" vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

// Fondo de líneas onduladas, como el de un billete o un título.
export function EngravedBackground({ className = '' }) {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      {WAVES.map((d, i) => (
        <path key={i} d={d} fill="none" stroke={colors.ink.line} strokeWidth="0.7" opacity="0.55" />
      ))}
    </svg>
  );
}
