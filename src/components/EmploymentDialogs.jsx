import { useEffect, useState } from 'react';
import Modal from './Modal';
import { AlertCircle } from 'lucide-react';
import { terminationReasons, todayInputValue } from '../utils/labels';
import Spinner from './Spinner';

// Diálogo base con un formulario; se usa para dar de baja y para recontratar.
function FormDialog({ open, title, message, confirmLabel, danger, onConfirm, onCancel, children }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (open) { setError(''); setSaving(false); } }, [open]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onCancel}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-ink-700 bg-ink-900 p-6 shadow-xl">
        <h3 className="font-display text-lg text-paper-100">{title}</h3>
        <p className="mt-2 text-sm text-paper-100/70">{message}</p>
        <div className="mt-4 space-y-4">{children}</div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-clay-500/30 bg-clay-500/10 px-3 py-2.5 text-sm text-clay-600">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-sm text-paper-100/70 transition hover:text-paper-100">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
              danger ? 'bg-clay-600 text-white hover:opacity-90' : 'bg-gold-500 text-white hover:bg-gold-400'
            }`}
          >
            {saving && <Spinner size={14} />}
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// onConfirm recibe { terminationDate, reason } y debe lanzar un Error con el mensaje a mostrar si falla.
export function TerminateDialog({ employee, onConfirm, onCancel }) {
  const [date, setDate] = useState(todayInputValue());
  const [reason, setReason] = useState('Resignation');

  useEffect(() => { if (employee) { setDate(todayInputValue()); setReason('Resignation'); } }, [employee]);

  return (
    <FormDialog
      open={!!employee}
      title="Dar de baja al empleado"
      message={employee ? `${employee.fullName} quedará inactivo. Su historial se conserva y se puede recontratar después.` : ''}
      confirmLabel="Dar de baja"
      danger
      onConfirm={() => onConfirm({ terminationDate: date, reason })}
      onCancel={onCancel}
    >
      <label className="block text-sm">
        <span className="mb-1.5 block text-paper-100/70">Fecha de baja</span>
        <input type="date" className="input" value={date} max={todayInputValue()} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block text-paper-100/70">Motivo</span>
        <select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>
          {Object.entries(terminationReasons).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </FormDialog>
  );
}

// onConfirm recibe { hireDate }.
export function RehireDialog({ employee, onConfirm, onCancel }) {
  const [date, setDate] = useState(todayInputValue());

  useEffect(() => { if (employee) setDate(todayInputValue()); }, [employee]);

  return (
    <FormDialog
      open={!!employee}
      title="Recontratar empleado"
      message={employee ? `${employee.fullName} volverá a estar activo. Su antigüedad empieza en la nueva fecha.` : ''}
      confirmLabel="Recontratar"
      onConfirm={() => onConfirm({ hireDate: date })}
      onCancel={onCancel}
    >
      <label className="block text-sm">
        <span className="mb-1.5 block text-paper-100/70">Fecha de recontratación</span>
        <input type="date" className="input" value={date} max={todayInputValue()} onChange={(e) => setDate(e.target.value)} required />
      </label>
    </FormDialog>
  );
}
