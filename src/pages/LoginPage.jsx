import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookUser, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

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
      const message = err.response?.data?.message || 'Usuario o contraseña incorrectos';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <BookUser className="h-9 w-9 text-gold-500" strokeWidth={1.5} />
          <h1 className="mt-4 font-display text-2xl text-paper-100">Personal</h1>
          <p className="mt-1 text-sm text-paper-100/50">Sistema de gestión de empleados</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-ink-700 bg-ink-900 p-7">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm text-paper-100/70">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                required
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-paper-100 outline-none transition focus:border-gold-500"
                placeholder="admin"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-paper-100/70">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-ink-600 bg-ink-800 px-3 py-2.5 text-sm text-paper-100 outline-none transition focus:border-gold-500"
                placeholder="••••••••"
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
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
          >
            {loading && <Spinner size={16} />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
