import { UserPlus, PencilLine, ArrowRightLeft, DollarSign, UserCheck, UserX } from 'lucide-react';

const dateTimeFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });

// La API guarda los salarios como texto ("17000.00"); se muestran como en la ficha ($17,000).
function formatValue(changeType, value) {
  if (changeType !== 'SalaryChanged' || value == null || Number.isNaN(Number(value))) return value;
  return currency.format(Number(value));
}

const historyMeta = {
  Created: { icon: UserPlus, label: 'Contratación', color: 'text-success-strong bg-success/10' },
  Updated: { icon: PencilLine, label: 'Datos actualizados', color: 'text-foreground-muted bg-subtle' },
  DepartmentChanged: { icon: ArrowRightLeft, label: 'Cambio de departamento', color: 'text-primary-strong bg-primary/10' },
  SalaryChanged: { icon: DollarSign, label: 'Cambio de salario', color: 'text-primary-strong bg-primary/10' },
  Activated: { icon: UserCheck, label: 'Reactivado', color: 'text-success-strong bg-success/10' },
  Deactivated: { icon: UserX, label: 'Dado de baja', color: 'text-danger-strong bg-danger/10' },
};

// Bitácora de cambios de un empleado; la usan el detalle (RH) y el portal del empleado.
export default function HistoryTimeline({ history, subtitle }) {
  return (
    <div className="mt-6 rounded-lg border border-subtle bg-surface p-6">
      <h2 className="font-display text-lg text-foreground">Historial</h2>
      <p className="mt-0.5 text-xs text-foreground-muted">{subtitle}</p>

      <div className="mt-5 space-y-4">
        {!history || history.length === 0 ? (
          <p className="text-sm text-foreground-muted">Sin movimientos registrados.</p>
        ) : (
          history.map((h) => {
            const meta = historyMeta[h.changeType] ?? historyMeta.Updated;
            const Icon = meta.icon;
            return (
              <div key={h.id} className="flex gap-3">
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${meta.color}`}>
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div className="flex-1 border-b border-subtle/60 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-foreground">{meta.label}</p>
                    <p className="text-xs text-foreground-muted">{dateTimeFmt.format(new Date(h.changedAtUtc))}</p>
                  </div>
                  {(h.oldValue || h.newValue) && (
                    <p className="mt-0.5 text-xs text-foreground-muted">
                      {h.oldValue && <span className="line-through">{formatValue(h.changeType, h.oldValue)}</span>}
                      {h.oldValue && h.newValue && ' → '}
                      {formatValue(h.changeType, h.newValue)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-foreground-muted">por {h.changedBy}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
