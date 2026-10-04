import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookUser, AlertCircle, KeyRound, ShieldAlert, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import { getErrorMessage } from '../utils/errors';

const demoAccounts = [
  { role: 'Administrador', username: 'admin', password: '123_RHSystem', icon: ShieldAlert, note: 'Acceso completo: crear, editar, eliminar' },
  { role: 'Solo lectura', username: 'usuariolector', password: 'lector_123', icon: Eye, note: 'Solo puede consultar información' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Usuario o contraseña incorrectos'));
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(account) {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gold-600 px-4 py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/10">
        {/* Encabezado de marca */}
        <div className="flex flex-col items-center px-8 pt-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500">
            <BookUser className="h-6 w-6 text-white" strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 font-display text-2xl text-paper-100">Gestor de Empleados</h1>
          <p className="mt-1 text-sm text-paper-100/50">Panel administrativo de RH</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="px-8 pb-7 pt-7">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm text-paper-100/70">Usuario</label>
              <input
                id="username" type="text" required autoFocus
                value={username} onChange={(e) => setUsername(e.target.value)}
                className="input" placeholder="Ingrese su usuario"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-paper-100/70">Contraseña</label>
              <input
                id="password" type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="input" placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-clay-500/30 bg-clay-500/10 px-3 py-2.5 text-sm text-clay-500">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gold-400 disabled:opacity-60"
          >
            {loading && <Spinner size={16} />}
            Entrar
          </button>
        </form>

        {/* Cuentas de demostración */}
        <div className="border-t border-ink-700 bg-ink-800/40 px-8 py-6">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-paper-100/40" strokeWidth={1.75} />
            <p className="text-xs font-medium uppercase tracking-wide text-paper-100/50">Acceso de prueba para revisión</p>
          </div>
          <div className="mt-3 space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.username}
                type="button"
                onClick={() => fillDemo(account)}
                className="flex w-full items-center justify-between rounded-md border border-ink-600 bg-white px-3 py-2.5 text-left transition hover:border-gold-500"
              >
                <span className="flex items-center gap-2.5">
                  <account.icon className="h-4 w-4 text-gold-500" strokeWidth={1.75} />
                  <span>
                    <span className="block text-sm text-paper-100">{account.role}</span>
                    <span className="block text-xs text-paper-100/40">{account.note}</span>
                  </span>
                </span>
                <span className="text-right text-xs text-paper-100/40">
                  <span className="block font-mono">{account.username}</span>
                  <span className="block font-mono">{account.password}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
