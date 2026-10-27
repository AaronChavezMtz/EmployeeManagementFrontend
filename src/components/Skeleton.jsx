// Bloques de carga con la forma del contenido real: la tarjeta no cambia de tamaño al llegar los datos.
// motion-safe: sin animación de pulso para quien pidió reducir el movimiento.

export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`rounded-md bg-subtle motion-safe:animate-pulse ${className}`} />;
}

// Contenedor que anuncia la carga a lectores de pantalla (los bloques son decorativos).
export function Loading({ children, className = '' }) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">Cargando…</span>
      {children}
    </div>
  );
}

// Filas para el <tbody> de una tabla. La primera columna imita "nombre + correo".
export function SkeletonRows({ rows = 6, cols }) {
  return Array.from({ length: rows }, (_, r) => (
    <tr key={r} className="border-b border-subtle/60 last:border-0" aria-hidden="true">
      {Array.from({ length: cols }, (_, c) => (
        <td key={c} className="px-5 py-4">
          {c === 0 ? (
            <>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="mt-2 h-3 w-48" />
            </>
          ) : (
            <Skeleton className={`h-4 ${c === cols - 1 ? 'ml-auto w-12' : 'w-24'}`} />
          )}
        </td>
      ))}
    </tr>
  ));
}

// Tarjetas para las listas de móvil.
export function SkeletonCards({ count = 4, withActions = false }) {
  return Array.from({ length: count }, (_, i) => (
    <li key={i} className="rounded-lg border border-subtle bg-surface p-4" aria-hidden="true">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-2 h-3 w-52" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-24" />
      {withActions && (
        <div className="mt-3 flex gap-2 border-t border-subtle pt-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      )}
    </li>
  ));
}

// Tarjeta de KPI / métrica.
export function SkeletonStat() {
  return (
    <div className="rounded-lg border border-subtle bg-surface p-4 sm:p-5" aria-hidden="true">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-7 w-20" />
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  );
}

// Ficha de empleado (detalle y "Mi perfil"): nombre, puesto y la rejilla de datos.
export function SkeletonProfile({ fields = 6 }) {
  return (
    <div className="rounded-lg border border-subtle bg-surface p-6" aria-hidden="true">
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-2 h-4 w-44" />
      <div className="ledger-divider my-5" />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-4 w-4" />
            <div className="flex-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-2 h-4 w-36" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Bloque del historial.
export function SkeletonTimeline({ items = 3 }) {
  return (
    <div className="mt-6 rounded-lg border border-subtle bg-surface p-6" aria-hidden="true">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="mt-2 h-3 w-48" />
      <div className="mt-5 space-y-5">
        {Array.from({ length: items }, (_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-3 w-56" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
