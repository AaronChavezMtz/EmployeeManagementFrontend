import { useEffect, useState, useCallback } from 'react';
import { ShieldCheck, Eye, Plus, AlertCircle, X } from 'lucide-react';
import { usersApi } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import Spinner from '../components/Spinner';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    usersApi.getAll()
      .then(setUsers)
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar la lista de usuarios.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function toggleRole(u) {
    const newRole = u.role === 'Admin' ? 'Viewer' : 'Admin';
    try {
      await usersApi.update(u.id, { role: newRole, isActive: u.isActive });
      showToast(`${u.username} ahora tiene rol ${newRole === 'Admin' ? 'Administrador' : 'Solo lectura'}.`, 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo cambiar el rol.'), 'error');
    }
  }

  async function toggleActive(u) {
    try {
      await usersApi.update(u.id, { role: u.role, isActive: !u.isActive });
      showToast(`${u.username} ahora está ${!u.isActive ? 'activo' : 'inactivo'}.`, 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo cambiar el estado.'), 'error');
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-paper-100">Usuarios</h1>
          <p className="mt-1 text-sm text-paper-100/50">Quién puede entrar al sistema y con qué permisos</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gold-400"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Nuevo usuario
        </button>
      </header>

      {error && <p className="mb-4 text-sm text-clay-500">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-ink-700 bg-ink-900">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-paper-100/40">
              <th className="px-5 py-3 font-normal">Usuario</th>
              <th className="px-5 py-3 font-normal">Correo</th>
              <th className="px-5 py-3 font-normal">Rol</th>
              <th className="px-5 py-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-16 text-center"><Spinner size={24} /></td></tr>
            ) : (
              users.map((u) => {
                const isSelf = u.username === currentUser?.username;
                return (
                  <tr key={u.id} className="border-b border-ink-700/60 last:border-0">
                    <td className="px-5 py-3 text-paper-100">
                      {u.username} {isSelf && <span className="text-xs text-paper-100/40">(tú)</span>}
                    </td>
                    <td className="px-5 py-3 text-paper-100/70">{u.email}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleRole(u)}
                        disabled={isSelf}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          u.role === 'Admin' ? 'bg-gold-500/10 text-gold-600' : 'bg-ink-700 text-paper-100/60'
                        }`}
                        title={isSelf ? 'No puedes cambiar tu propio rol' : 'Clic para cambiar de rol'}
                      >
                        {u.role === 'Admin' ? <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} /> : <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />}
                        {u.role === 'Admin' ? 'Administrador' : 'Solo lectura'}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={isSelf}
                        className={`rounded-full px-2.5 py-1 text-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          u.isActive ? 'bg-sage-500/15 text-sage-600' : 'bg-ink-700 text-paper-100/40'
                        }`}
                      >
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showNew && <NewUserModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} showToast={showToast} />}
    </div>
  );
}

function NewUserModal({ onClose, onCreated, showToast }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'Viewer' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await usersApi.register(form);
      showToast(`Usuario "${form.username}" creado correctamente.`, 'success');
      onCreated();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo crear el usuario.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-sm rounded-lg border border-ink-700 bg-ink-900 p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-lg text-paper-100">Nuevo usuario</h3>
          <button onClick={onClose} className="text-paper-100/40 transition hover:text-paper-100">
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block text-sm">
            <span className="mb-1.5 block text-paper-100/70">Rol</span>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="Viewer">Solo lectura</option>
              <option value="Admin">Administrador</option>
            </select>
          </label>

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
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
