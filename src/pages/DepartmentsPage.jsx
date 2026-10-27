import { useEffect, useState, useCallback } from 'react';
import Modal from '../components/Modal';
import { Plus, Pencil, Trash2, AlertCircle, X, LayoutGrid, Network } from 'lucide-react';
import { departmentsApi } from '../api/departments';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import Spinner from '../components/Spinner';
import { Loading, Skeleton } from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import OrgChart from '../components/OrgChart';

export default function DepartmentsPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = cerrado, {} = nuevo, {id,...} = editar
  const [toDelete, setToDelete] = useState(null);
  const [error, setError] = useState('');
  const [view, setView] = useState('cards'); // 'cards' | 'orgchart'

  const load = useCallback(() => {
    setLoading(true);
    departmentsApi.getAll()
      .then(setDepartments)
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar los departamentos.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function confirmDelete() {
    const departmentName = toDelete.name;
    try {
      await departmentsApi.remove(toDelete.id);
      setToDelete(null);
      showToast(`Departamento "${departmentName}" eliminado.`, 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo eliminar el departamento.'), 'error');
      setToDelete(null);
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-paper-100">Departamentos</h1>
          <p className="mt-1 text-sm text-paper-100/70">{departments.length} registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-ink-600 p-0.5">
            <button
              onClick={() => setView('cards')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs transition ${
                view === 'cards' ? 'bg-gold-500 text-white' : 'text-paper-100/70 hover:text-paper-100'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.75} />
              Tarjetas
            </button>
            <button
              onClick={() => setView('orgchart')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs transition ${
                view === 'orgchart' ? 'bg-gold-500 text-white' : 'text-paper-100/70 hover:text-paper-100'
              }`}
            >
              <Network className="h-3.5 w-3.5" strokeWidth={1.75} />
              Organigrama
            </button>
          </div>
          {isAdmin && (
            <button
              onClick={() => setEditing({ name: '', description: '' })}
              className="flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gold-400"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Nuevo departamento
            </button>
          )}
        </div>
      </header>

      {error && <p className="mb-4 text-sm text-clay-600">{error}</p>}

      {loading && departments.length === 0 ? (
        <Loading className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-lg border border-ink-700 bg-ink-900 p-5" aria-hidden="true">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-3 w-48" />
              <div className="ledger-divider my-4" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </Loading>
      ) : view === 'orgchart' ? (
        <OrgChart departments={departments} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <div key={d.id} className="rounded-lg border border-ink-700 bg-ink-900 p-5">
              <div className="flex items-start justify-between">
                <h3 className="font-display text-lg text-paper-100">{d.name}</h3>
                {isAdmin && (
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(d)} aria-label={`Editar ${d.name}`} className="rounded-md p-2.5 text-paper-100/70 transition hover:bg-ink-700 hover:text-gold-400">
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button onClick={() => setToDelete(d)} aria-label={`Eliminar ${d.name}`} className="rounded-md p-2.5 text-paper-100/70 transition hover:bg-ink-700 hover:text-clay-600">
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-sm text-paper-100/70">{d.description || 'Sin descripción'}</p>
              <div className="ledger-divider my-4" />
              <p className="text-xs uppercase tracking-wide text-paper-100/70">
                {d.employeeCount} empleado{d.employeeCount !== 1 ? 's' : ''} activo{d.employeeCount !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <DepartmentModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
          showToast={showToast}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar departamento"
        message={toDelete ? `¿Eliminar "${toDelete.name}"? Solo es posible si no tiene empleados asignados.` : ''}
        confirmLabel="Eliminar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

function DepartmentModal({ initial, onClose, onSaved, showToast }) {
  const [name, setName] = useState(initial.name || '');
  const [description, setDescription] = useState(initial.description || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isEditing = !!initial.id;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEditing) {
        await departmentsApi.update(initial.id, { name, description });
        showToast('Departamento actualizado correctamente.', 'success');
      } else {
        await departmentsApi.create({ name, description });
        showToast('Departamento creado correctamente.', 'success');
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar el departamento.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-sm rounded-lg border border-ink-700 bg-ink-900 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg text-paper-100">{isEditing ? 'Editar departamento' : 'Nuevo departamento'}</h3>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-md p-2 text-paper-100/70 transition hover:text-paper-100">
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-paper-100/70">Nombre</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-paper-100/70">Descripción</span>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-clay-500/30 bg-clay-500/10 px-3 py-2.5 text-sm text-clay-600">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-paper-100/70 transition hover:text-paper-100">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-gold-400 disabled:opacity-60">
              {saving && <Spinner size={16} />}
              Guardar
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
