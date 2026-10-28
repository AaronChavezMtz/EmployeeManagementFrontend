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
export function Seal({ className = '' }) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true" focusable="false">
      <defs>
        <path id="seal-ring" d="M120,120 m-103,0 a103,103 0 1,1 206,0 a103,103 0 1,1 -206,0" />
      </defs>
      <circle cx="120" cy="120" r="117" fill="#FCFDFF" />
      <circle cx="120" cy="120" r="114" fill="none" stroke="#2446A8" strokeWidth="1.2" />
      <circle cx="120" cy="120" r="93" fill="none" stroke="#2446A8" strokeWidth="0.8" />
      {/* textLength reparte la leyenda exactamente alrededor del círculo (2π·103 ≈ 647). */}
      <text fill="#2446A8" fontFamily="Work Sans, sans-serif" fontSize="10.5">
        <textPath href="#seal-ring" textLength="640" lengthAdjust="spacing">Gestor de Empleados ✦ Sistema de Recursos Humanos ✦</textPath>
      </text>
      {SEAL_RINGS.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#2446A8" strokeWidth={0.35} opacity={0.8} />
      ))}
      <circle cx="120" cy="120" r="36" fill="#FCFDFF" stroke="#2446A8" strokeWidth="1" />
      <text x="120" y="131" textAnchor="middle" fill="#16264F" fontFamily="Fraunces, serif" fontSize="30">RH</text>
    </svg>
  );
}

// Fondo de líneas onduladas, como el de un billete o un título.
export function EngravedBackground({ className = '' }) {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      {WAVES.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="#2C4480" strokeWidth="0.7" opacity="0.55" />
      ))}
    </svg>
  );
}
