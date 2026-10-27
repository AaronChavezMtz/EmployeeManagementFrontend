// Textos en español para los enums que devuelve la API (llegan como texto: "Resignation", ...).
export const terminationReasons = {
  Resignation: 'Renuncia',
  Dismissal: 'Despido',
  ContractEnd: 'Término de contrato',
  Other: 'Otro',
};

// Fecha de hoy en formato yyyy-MM-dd (lo que usa <input type="date">), en hora local.
export function todayInputValue() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// La API devuelve fechas sin zona ("2026-03-01T00:00:00"); se muestran tal cual, sin desfase de zona horaria.
export function formatDate(value) {
  if (!value) return '—';
  const [y, m, d] = value.slice(0, 10).split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(y, m - 1, d));
}

// Página de inicio según el rol: RH entra al resumen, el empleado a su portal.
export function homePathFor(role) {
  return role === 'Employee' ? '/mi-perfil' : '/';
}

export const leaveTypes = {
  Vacation: 'Vacaciones',
  Sick: 'Incapacidad',
  Personal: 'Permiso personal',
};

export const leaveStatuses = {
  Pending: { label: 'Pendiente', classes: 'bg-gold-500/10 text-gold-600' },
  Approved: { label: 'Aprobada', classes: 'bg-sage-500/15 text-sage-700' },
  Rejected: { label: 'Rechazada', classes: 'bg-clay-500/10 text-clay-600' },
  Cancelled: { label: 'Cancelada', classes: 'bg-ink-700 text-paper-100/70' },
};
