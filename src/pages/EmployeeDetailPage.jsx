import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Mail, Phone, Briefcase, Calendar, Building2,
  UserPlus, PencilLine, ArrowRightLeft, DollarSign, UserCheck, UserX,
} from 'lucide-react';
import { employeesApi } from '../api/employees';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import Spinner from '../components/Spinner';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' });
const dateTimeFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

const historyMeta = {
  Created: { icon: UserPlus, label: 'Contratación', color: 'text-sage-500 bg-sage-500/10' },
  Updated: { icon: PencilLine, label: 'Datos actualizados', color: 'text-paper-100/60 bg-ink-700' },
  DepartmentChanged: { icon: ArrowRightLeft, label: 'Cambio de departamento', color: 'text-gold-600 bg-gold-500/10' },
  SalaryChanged: { icon: DollarSign, label: 'Cambio de salario', color: 'text-gold-600 bg-gold-500/10' },
  Activated: { icon: UserCheck, label: 'Reactivado', color: 'text-sage-500 bg-sage-500/10' },
  Deactivated: { icon: UserX, label: 'Dado de baja', color: 'text-clay-500 bg-clay-500/10' },
};

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-paper-100/40" strokeWidth={1.75} />
      <div>
        <p className="text-xs text-paper-100/40">{label}</p>
        <p className="text-sm text-paper-100">{value}</p>
      </div>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([employeesApi.getById(id), employeesApi.getHistory?.(id) ?? Promise.resolve([])])
      .then(([emp, hist]) => { setEmployee(emp); setHistory(hist); })
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar la información del empleado.')));
  }, [id]);

  if (error) return <p className="text-sm text-clay-500">{error}</p>;
  if (!employee) return <div className="flex justify-center pt-20"><Spinner size={28} /></div>;

  return (
    <div className="max-w-3xl">
      <Link to="/empleados" className="mb-6 inline-flex items-center gap-1.5 text-sm text-paper-100/50 transition hover:text-paper-100">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Volver a empleados
      </Link>

      <div className="rounded-lg border border-ink-700 bg-ink-900 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-paper-100">{employee.fullName}</h1>
            <p className="mt-1 text-sm text-paper-100/50">{employee.position} · {employee.departmentName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-1 text-xs ${employee.isActive ? 'bg-sage-500/15 text-sage-600' : 'bg-ink-700 text-paper-100/40'}`}>
              {employee.isActive ? 'Activo' : 'Inactivo'}
            </span>
            {isAdmin && (
              <Link to={`/empleados/${employee.id}/editar`} className="rounded-md p-2 text-paper-100/50 transition hover:bg-ink-700 hover:text-gold-500">
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </Link>
            )}
          </div>
        </div>

        <div className="ledger-divider my-5" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <InfoRow icon={Mail} label="Correo" value={employee.email} />
          <InfoRow icon={Phone} label="Teléfono" value={employee.phone || '—'} />
          <InfoRow icon={Briefcase} label="Puesto" value={employee.position} />
          <InfoRow icon={Building2} label="Departamento" value={employee.departmentName} />
          <InfoRow icon={Calendar} label="Fecha de contratación" value={dateFmt.format(new Date(employee.hireDate))} />
          <InfoRow icon={DollarSign} label="Salario mensual" value={currency.format(employee.salary)} />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-ink-700 bg-ink-900 p-6">
        <h2 className="font-display text-lg text-paper-100">Historial</h2>
        <p className="mt-0.5 text-xs text-paper-100/40">Cambios registrados sobre este empleado</p>

        <div className="mt-5 space-y-4">
          {!history || history.length === 0 ? (
            <p className="text-sm text-paper-100/40">Sin movimientos registrados.</p>
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
                      <p className="text-xs text-paper-100/40">{dateTimeFmt.format(new Date(h.changedAtUtc))}</p>
                    </div>
                    {(h.oldValue || h.newValue) && (
                      <p className="mt-0.5 text-xs text-paper-100/60">
                        {h.oldValue && <span className="line-through opacity-60">{h.oldValue}</span>}
                        {h.oldValue && h.newValue && ' → '}
                        {h.newValue}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-paper-100/40">por {h.changedBy}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
