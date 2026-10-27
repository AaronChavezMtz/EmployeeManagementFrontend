import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { homePathFor } from '../utils/labels';
import Spinner from '../components/Spinner';

// Página suelta (sin menú): con contraseña temporal la API rechaza todo lo demás hasta cambiarla.
export default function ChangePasswordPage() {
  const { user, markPasswordChanged, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const forced = user?.mustChangePassword;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirm) {
      setError('Las contraseñas nuevas no coinciden.');
      return;
    }
    setSaving(true);
    try {
      await client.post('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      markPasswordChanged();
      showToast('Contraseña actualizada.', 'success');
      navigate(homePathFor(user.role), { replace: true });
    } catch (err) {
      const validation = err.response?.data?.validationErrors;
      setError(validation ? Object.values(validation)[0][0] : getErrorMessage(err, 'No se pudo cambiar la contraseña.'));
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-14">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl shadow-black/10">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
          <KeyRound className="h-5 w-5 text-white" strokeWidth={1.75} />
        </span>
        <h1 className="mt-4 font-display text-2xl text-foreground">Cambiar contraseña</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          {forced
            ? 'Tu cuenta tiene una contraseña temporal. Elige una nueva para continuar.'
            : 'Necesitas tu contraseña actual para elegir una nueva.'}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block text-foreground-muted">{forced ? 'Contraseña temporal' : 'Contraseña actual'}</span>
            <input type="password" className="input" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required autoFocus />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-foreground-muted">Nueva contraseña</span>
            <input type="password" className="input" minLength={8} value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-foreground-muted">Repite la nueva contraseña</span>
            <input type="password" className="input" minLength={8} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </label>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger-strong">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={saving} className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60">
          {saving && <Spinner size={16} />}
          Guardar contraseña
        </button>
        <div className="mt-4 text-center text-sm">
          {forced ? (
            <button type="button" onClick={logout} className="text-foreground-muted transition hover:text-foreground">Cerrar sesión</button>
          ) : (
            <Link to={homePathFor(user?.role)} className="text-foreground-muted transition hover:text-foreground">Volver</Link>
          )}
        </div>
      </form>
    </div>
  );
}
