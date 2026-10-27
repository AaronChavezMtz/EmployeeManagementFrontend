import { useEffect, useState } from 'react';
import { Mail, Phone, Briefcase, Calendar, Building2, DollarSign, Pencil, Check, X } from 'lucide-react';
import { meApi } from '../api/me';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { formatDate } from '../utils/labels';
import HistoryTimeline from '../components/HistoryTimeline';
import Spinner from '../components/Spinner';
import { Loading, SkeletonProfile, SkeletonTimeline } from '../components/Skeleton';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-paper-100/40" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-paper-100/40">{label}</p>
        <div className="text-sm text-paper-100">{children}</div>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  const { showToast } = useToast();
  const [employee, setEmployee] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([meApi.getProfile(), meApi.getHistory()])
      .then(([emp, hist]) => { setEmployee(emp); setHistory(hist); })
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar tu información.')));
  }, []);

  async function savePhone(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await meApi.updatePhone(phone);
      setEmployee(updated);
      setHistory(await meApi.getHistory());
      setEditingPhone(false);
      showToast('Teléfono actualizado.', 'success');
    } catch (err) {
      const validation = err.response?.data?.validationErrors;
      showToast(validation ? Object.values(validation)[0][0] : getErrorMessage(err, 'No se pudo actualizar el teléfono.'), 'error');
    } finally {
      setSaving(false);
    }
  }

  if (error) return <p className="text-sm text-clay-500">{error}</p>;
  const loaded = !!employee;

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl text-paper-100">Mi perfil</h1>
        <p className="mt-1 text-sm text-paper-100/50">Tu información registrada en RH</p>
      </header>

{!loaded ? (
        <Loading>
          <SkeletonProfile />
          <SkeletonTimeline />
        </Loading>
      ) : (
      <>
      <div className="rounded-lg border border-ink-700 bg-ink-900 p-6">
        <h2 className="font-display text-2xl text-paper-100">{employee.fullName}</h2>
        <p className="mt-1 text-sm text-paper-100/50">{employee.position} · {employee.departmentName}</p>

        <div className="ledger-divider my-5" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <InfoRow icon={Mail} label="Correo">{employee.email}</InfoRow>
          <InfoRow icon={Phone} label="Teléfono">
            {editingPhone ? (
              <form onSubmit={savePhone} className="mt-1 flex items-center gap-2">
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="7731234567" autoFocus />
                <button type="submit" disabled={saving} className="rounded-md p-2 text-sage-500 transition hover:bg-ink-800" aria-label="Guardar">
                  {saving ? <Spinner size={14} /> : <Check className="h-4 w-4" strokeWidth={2} />}
                </button>
                <button type="button" onClick={() => setEditingPhone(false)} className="rounded-md p-2 text-paper-100/50 transition hover:bg-ink-800" aria-label="Cancelar">
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </form>
            ) : (
              <span className="flex items-center gap-2">
                {employee.phone || '—'}
                <button
                  onClick={() => { setPhone(employee.phone || ''); setEditingPhone(true); }}
                  className="rounded p-1 text-paper-100/40 transition hover:bg-ink-800 hover:text-gold-500"
                  aria-label="Editar teléfono"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </span>
            )}
          </InfoRow>
          <InfoRow icon={Briefcase} label="Puesto">{employee.position}</InfoRow>
          <InfoRow icon={Building2} label="Departamento">{employee.departmentName}</InfoRow>
          <InfoRow icon={Calendar} label="Fecha de contratación">{formatDate(employee.hireDate)}</InfoRow>
          <InfoRow icon={DollarSign} label="Salario mensual">{currency.format(employee.salary)}</InfoRow>
        </div>
        <p className="mt-5 text-xs text-paper-100/40">Para corregir otro dato, contacta a Recursos Humanos.</p>
      </div>

      <HistoryTimeline history={history} subtitle="Cambios registrados en tu expediente" />
      </>
      )}
    </div>
  );
}
