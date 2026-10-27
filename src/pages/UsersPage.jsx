import { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, UserRound, Plus, AlertCircle, X, RotateCcw, Lock, Pencil } from 'lucide-react';
import { usersApi } from '../api/users';
import { employeesApi } from '../api/employees';
import { demoApi } from '../api/demo';
import ConfirmDialog from '../components/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import Spinner from '../components/Spinner';
import { SkeletonRows } from '../components/Skeleton';

const roleLabels = { Admin: 'Administrador', Employee: 'Empleado' };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalUser, setModalUser] = useState(null); // {} = nuevo, usuario = editar
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [canResetDemo, setCanResetDemo] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    usersApi.getAll()
      .then(setUsers)
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar la lista de usuarios.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Solo las cuentas privadas del dueño pueden reiniciar la demo; para el resto el botón no aparece.
  useEffect(() => {
    demoApi.status().then((s) => setCanResetDemo(s.canReset)).catch(() => setCanResetDemo(false));
  }, []);

  async function toggleActive(u) {
    try {
      await usersApi.update(u.id, { role: u.role, isActive: !u.isActive, employeeId: u.employeeId });
      showToast(`${u.username} ahora está ${!u.isActive ? 'activo' : 'inactivo'}.`, 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo cambiar el estado.'), 'error');
    }
  }

  async function resetDemo() {
    setConfirmReset(false);
    setResetting(true);
    try {
      await demoApi.reset();
      // Recarga completa: empleados, departamentos y KPIs cambiaron. Si tu cuenta no
      // estaba protegida, se borró y la API responderá 401, que te manda al login.
      window.location.reload();
    } catch (err) {
      const message = err.response?.status === 404
        ? 'El reinicio de la demo no está habilitado en este servidor.'
        : getErrorMessage(err, 'No se pudo reiniciar la demo.');
      showToast(message, 'error');
      setResetting(false);
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-paper-100">Usuarios</h1>
          <p className="mt-1 text-sm text-paper-100/50">Quién puede entrar al sistema y con qué permisos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canResetDemo && (
            <button
              onClick={() => setConfirmReset(true)}
              disabled={resetting}
              className="flex items-center gap-2 rounded-md border border-ink-600 px-4 py-2.5 text-sm font-medium text-paper-100/70 transition hover:border-clay-500 hover:text-clay-500 disabled:opacity-60"
            >
              {resetting ? <Spinner size={16} /> : <RotateCcw className="h-4 w-4" strokeWidth={2} />}
              Reiniciar demo
            </button>
          )}
          <button
            onClick={() => setModalUser({})}
            className="flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Nuevo usuario
          </button>
        </div>
      </header>

      {error && <p className="mb-4 text-sm text-clay-500">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-ink-700 bg-ink-900">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-paper-100/40">
              <th className="px-5 py-3 font-normal">Usuario</th>
              <th className="px-5 py-3 font-normal">Correo</th>
              <th className="px-5 py-3 font-normal">Rol</th>
              <th className="px-5 py-3 font-normal">Empleado vinculado</th>
              <th className="px-5 py-3 font-normal">Estado</th>
              <th className="px-5 py-3 font-normal" />
            </tr>
          </thead>
          <tbody className={`transition-opacity ${loading && users.length > 0 ? 'opacity-50' : ''}`} aria-busy={loading}>
            {loading && users.length === 0 ? (
              <SkeletonRows rows={5} cols={6} />
            ) : (
              users.map((u) => {
                const isSelf = u.username === currentUser?.username;
                // La API decide quién puede editar a quién (el dueño puede tocar cuentas protegidas).
                const locked = !u.canEdit;
                const lockedTitle = isSelf ? 'No puedes cambiar tu propia cuenta' : 'Cuenta de demostración protegida';
                return (
                  <tr key={u.id} className="border-b border-ink-700/60 last:border-0">
                    <td className="px-5 py-3 text-paper-100">
                      <span className="flex items-center gap-1.5">
                        {u.username}
                        {isSelf && <span className="text-xs text-paper-100/40">(tú)</span>}
                        {u.isProtected && <Lock className="h-3.5 w-3.5 text-paper-100/40" strokeWidth={1.75} aria-label="Cuenta protegida" />}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-paper-100/70">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                        u.role === 'Admin' ? 'bg-gold-500/10 text-gold-600' : 'bg-ink-700 text-paper-100/60'
                      }`}>
                        {u.role === 'Admin' ? <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} /> : <UserRound className="h-3.5 w-3.5" strokeWidth={1.75} />}
                        {roleLabels[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-paper-100/70">{u.employeeName ?? (u.role === 'Employee' ? <span className="text-clay-500">Sin vincular</span> : '—')}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={locked}
                        title={locked ? lockedTitle : 'Clic para activar o desactivar'}
                        className={`rounded-full px-2.5 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          u.isActive ? 'bg-sage-500/15 text-sage-600' : 'bg-ink-700 text-paper-100/40'
                        }`}
                      >
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setModalUser(u)}
                        disabled={locked}
                        title={locked ? lockedTitle : 'Editar rol y vínculo'}
                        className="rounded-md p-1.5 text-paper-100/50 transition hover:bg-ink-700 hover:text-gold-500 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Pencil className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Reiniciar demo"
        message="Se borrarán todos los empleados, departamentos, historial y solicitudes, y los usuarios que no sean cuentas de demostración. Luego se cargarán los datos de ejemplo. ¿Continuar?"
        confirmLabel="Reiniciar"
        danger
        onConfirm={resetDemo}
        onCancel={() => setConfirmReset(false)}
      />

      {modalUser && (
        <UserModal
          user={modalUser.id ? modalUser : null}
          users={users}
          onClose={() => setModalUser(null)}
          onSaved={() => { setModalUser(null); load(); }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

// Alta (user = null) o edición de rol y vínculo con empleado.
function UserModal({ user, users, onClose, onSaved, showToast }) {
  const isEditing = !!user;
  const [form, setForm] = useState({
    username: '', email: '', password: '',
    role: user?.role ?? 'Employee',
    employeeId: user?.employeeId ?? '',
  });
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Empleados activos que aún no tienen usuario (más el que ya tiene este usuario).
  useEffect(() => {
    const linked = new Set(users.filter((u) => u.employeeId && u.id !== user?.id).map((u) => u.employeeId));
    employeesApi.getAll({ isActive: true, pageSize: 100 })
      .then((page) => setEmployees(page.items.filter((e) => !linked.has(e.id))))
      .catch(() => setEmployees([]));
  }, [users, user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const employeeId = form.role === 'Employee' ? Number(form.employeeId) || null : null;
    try {
      if (isEditing) {
        await usersApi.update(user.id, { role: form.role, isActive: user.isActive, employeeId });
        showToast(`Usuario "${user.username}" actualizado.`, 'success');
      } else {
        await usersApi.register({ username: form.username, email: form.email, password: form.password, role: form.role, employeeId });
        showToast(`Usuario "${form.username}" creado correctamente.`, 'success');
      }
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar el usuario.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-lg border border-ink-700 bg-ink-900 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg text-paper-100">{isEditing ? `Editar ${user.username}` : 'Nuevo usuario'}</h3>
          <button onClick={onClose} className="text-paper-100/40 transition hover:text-paper-100">
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <>
              <label className="block text-sm">
                <span className="mb-1.5 block text-paper-100/70">Usuario</span>
                <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-paper-100/70">Correo</span>
                <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-paper-100/70">Contraseña</span>
                <input type="password" className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
              </label>
            </>
          )}
          <label className="block text-sm">
            <span className="mb-1.5 block text-paper-100/70">Rol</span>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="Employee">Empleado (portal)</option>
              <option value="Admin">Administrador (RH)</option>
            </select>
          </label>
          {form.role === 'Employee' && (
            <label className="block text-sm">
              <span className="mb-1.5 block text-paper-100/70">Empleado vinculado</span>
              <select className="input" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
                <option value="">Selecciona...</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName} · {e.position}</option>)}
              </select>
              <span className="mt-1 block text-xs text-paper-100/40">Solo verá su propia ficha y sus ausencias.</span>
            </label>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-clay-500/30 bg-clay-500/10 px-3 py-2.5 text-sm text-clay-500">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-paper-100/70 transition hover:text-paper-100">Cancelar</button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-gold-400 disabled:opacity-60">
              {saving && <Spinner size={16} />}
              {isEditing ? 'Guardar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
