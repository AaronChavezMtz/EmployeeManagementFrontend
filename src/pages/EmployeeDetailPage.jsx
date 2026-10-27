import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Mail, Phone, Briefcase, Calendar, Building2, DollarSign, UserX, KeyRound } from 'lucide-react';
import CredentialsDialog from '../components/CredentialsDialog';
import { useToast } from '../context/ToastContext';
import HistoryTimeline from '../components/HistoryTimeline';
import { terminationReasons, formatDate } from '../utils/labels';
import { employeesApi } from '../api/employees';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import { Loading, SkeletonProfile, SkeletonTimeline } from '../components/Skeleton';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });


function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-paper-100/40" strokeWidth={1.75} />
      <div>
        <p className="text-xs text-paper-100/40">{label}</p>
        <div className="text-sm text-paper-100">{value}</div>
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
  const [creatingAccess, setCreatingAccess] = useState(false);
  const [createdAccess, setCreatedAccess] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    Promise.all([employeesApi.getById(id), employeesApi.getHistory(id)])
      .then(([emp, hist]) => { setEmployee(emp); setHistory(hist); })
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar la información del empleado.')));
  }, [id]);

  async function createAccess() {
    setCreatingAccess(true);
    try {
      const access = await employeesApi.createPortalAccess(employee.id);
      setEmployee({ ...employee, portalUsername: access.username });
      setCreatedAccess(access);
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo crear el acceso al portal.'), 'error');
    } finally {
      setCreatingAccess(false);
    }
  }

  if (error) return <p className="text-sm text-clay-500">{error}</p>;
  const loaded = !!employee;

  return (
    <div className="max-w-3xl">
      <Link to="/empleados" className="mb-6 inline-flex items-center gap-1.5 text-sm text-paper-100/50 transition hover:text-paper-100">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Volver a empleados
      </Link>

{!loaded ? (
        <Loading>
          <SkeletonProfile fields={8} />
          <SkeletonTimeline />
        </Loading>
      ) : (
      <>
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
          <InfoRow icon={Calendar} label="Fecha de contratación" value={formatDate(employee.hireDate)} />
          <InfoRow icon={DollarSign} label="Salario mensual" value={currency.format(employee.salary)} />
          <InfoRow icon={KeyRound} label="Acceso al portal" value={
            employee.portalUsername ? (
              employee.portalUsername
            ) : employee.isActive && isAdmin ? (
              <button onClick={createAccess} disabled={creatingAccess}
                className="text-sm font-medium text-gold-500 transition hover:text-gold-400 disabled:opacity-60">
                {creatingAccess ? 'Creando...' : 'Crear acceso al portal'}
              </button>
            ) : 'Sin acceso'
          } />
          {!employee.isActive && employee.terminationDate && (
            <InfoRow
              icon={UserX}
              label="Baja"
              value={`${formatDate(employee.terminationDate)} · ${terminationReasons[employee.terminationReason] ?? 'Otro'}`}
            />
          )}
        </div>
      </div>

      <HistoryTimeline history={history} subtitle="Cambios registrados sobre este empleado" />

      <CredentialsDialog access={createdAccess} employeeName={employee.fullName} onClose={() => setCreatedAccess(null)} />
      </>
      )}
    </div>
  );
}
