import { UserPlus, PencilLine, ArrowRightLeft, DollarSign, UserCheck, UserX } from 'lucide-react';

const dateTimeFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });

// La API guarda los salarios como texto ("17000.00"); se muestran como en la ficha ($17,000).
function formatValue(changeType, value) {
  if (changeType !== 'SalaryChanged' || value == null || Number.isNaN(Number(value))) return value;
  return currency.format(Number(value));
}

const historyMeta = {
  Created: { icon: UserPlus, label: 'Contratación', color: 'text-sage-600 bg-sage-500/10' },
  Updated: { icon: PencilLine, label: 'Datos actualizados', color: 'text-paper-100/70 bg-ink-700' },
  DepartmentChanged: { icon: ArrowRightLeft, label: 'Cambio de departamento', color: 'text-gold-600 bg-gold-500/10' },
  SalaryChanged: { icon: DollarSign, label: 'Cambio de salario', color: 'text-gold-600 bg-gold-500/10' },
  Activated: { icon: UserCheck, label: 'Reactivado', color: 'text-sage-600 bg-sage-500/10' },
  Deactivated: { icon: UserX, label: 'Dado de baja', color: 'text-clay-600 bg-clay-500/10' },
};

// Bitácora de cambios de un empleado; la usan el detalle (RH) y el portal del empleado.
export default function HistoryTimeline({ history, subtitle }) {
  return (
    <div className="mt-6 rounded-lg border border-ink-700 bg-ink-900 p-6">
      <h2 className="font-display text-lg text-paper-100">Historial</h2>
      <p className="mt-0.5 text-xs text-paper-100/70">{subtitle}</p>

      <div className="mt-5 space-y-4">
        {!history || history.length === 0 ? (
          <p className="text-sm text-paper-100/70">Sin movimientos registrados.</p>
        ) : (
          history.map((h) => {
            const meta = historyMeta[h.changeType] ?? historyMeta.Updated;
            const Icon = meta.icon;
            return (
              <div key={h.id} className="flex gap-3">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="flex-1 border-b border-ink-700/60 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-paper-100">{meta.label}</p>
                    <p className="text-xs text-paper-100/70">{dateTimeFmt.format(new Date(h.changedAtUtc))}</p>
                  </div>
                  {(h.oldValue || h.newValue) && (
                    <p className="mt-0.5 text-xs text-paper-100/70">
                      {h.oldValue && <span className="line-through">{formatValue(h.changeType, h.oldValue)}</span>}
                      {h.oldValue && h.newValue && ' → '}
                      {formatValue(h.changeType, h.newValue)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-paper-100/70">por {h.changedBy}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
