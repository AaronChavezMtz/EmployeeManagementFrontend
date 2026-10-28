import { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookUser, AlertCircle, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { homePathFor } from '../utils/labels';
import { useAuth } from '../context/AuthContext';
import useServerStatus from '../hooks/useServerStatus';
import Spinner from '../components/Spinner';
import { Seal, EngravedBackground } from '../components/Guilloche';
import { getErrorMessage } from '../utils/errors';
import { isTransient } from '../api/retry';

const demoAccounts = [
  { role: 'Recursos Humanos', scope: 'Administra personal, solicitudes y usuarios', username: 'adminprueba', password: '123_Prueba' },
  { role: 'Empleado', scope: 'Consulta su expediente y pide vacaciones', username: 'usuariolector', password: 'lector_123' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const server = useServerStatus();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(null); // { attempt, attempts } mientras se reintenta
  const abortRef = useRef(null);
  const submitRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setRetry(null);
    setLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const sessionUser = await login(username, password, {
        signal: controller.signal,
        onRetry: ({ attempt, attempts }) => setRetry({ attempt, attempts }),
      });
      const target = sessionUser.mustChangePassword ? '/cambiar-contrasena' : location.state?.from?.pathname || homePathFor(sessionUser.role);
      navigate(target, { replace: true });
    } catch (err) {
      if (err?.code === 'ERR_CANCELED') return; // la persona canceló: sin mensaje de error
      setError(isTransient(err)
        ? 'El servidor no respondió después de varios intentos. Puede seguir arrancando: espera unos segundos y vuelve a intentarlo.'
        : getErrorMessage(err, 'Usuario o contraseña incorrectos'));
      if (isTransient(err)) server.recheck();
    } finally {
      setLoading(false);
      setRetry(null);
    }
  }

  function fillDemo(account) {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
    submitRef.current?.focus();
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink px-4 py-10 sm:px-8 sm:py-16">
      <EngravedBackground className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* La hoja: un documento con doble filete, no una tarjeta. En escritorio se corre a la izquierda
          para dejar el sello sobre el espacio libre. */}
      <div className="relative mx-auto w-full max-w-[30rem]">
        <Seal className="absolute -right-2 -top-8 z-10 h-20 w-20 rotate-[-12deg] drop-shadow-[0_6px_14px_rgba(6,22,16,0.45)] sm:-right-14 sm:-top-14 sm:h-40 sm:w-40 lg:-right-20 lg:-top-16 lg:h-48 lg:w-48" />

        <main className="relative rounded-[3px] bg-surface p-2 shadow-[0_30px_60px_-20px_rgba(6,22,16,0.7)]">
          <div className="rounded-[2px] border border-outline p-1">
            <div className="rounded-[1px] border-2 border-ink/80 px-6 pb-6 pt-7 sm:px-9 sm:pt-9">
              {/* Membrete */}
              <header className="flex items-center gap-3 pr-12 sm:pr-20">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[3px] bg-ink text-white">
                  <BookUser className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-base leading-tight text-ink sm:text-xl">Gestor de Empleados</p>
                  <p className="text-xs text-foreground-muted">Sistema de Recursos Humanos</p>
                </div>
              </header>
              <div className="mt-6 border-t border-ink/80" />
              <div className="mt-[3px] border-t border-outline" />

              <h1 className="mt-7 font-display text-[2rem] leading-tight text-ink">Acceso al sistema</h1>
              <p className="mt-2 max-w-[34ch] text-sm leading-6 text-foreground-muted">
                Para el personal de Recursos Humanos y para cada empleado con su propio portal.
              </p>

              <form onSubmit={handleSubmit} className="mt-7">
                {/* Casillas de formulario oficial: la etiqueta vive dentro del recuadro. */}
                <div className="divide-y divide-outline border border-outline focus-within:border-primary">
                  <label className="block px-3.5 pb-2 pt-2.5 focus-within:bg-primary/[0.04] focus-within:shadow-[inset_3px_0_0_theme(colors.primary.DEFAULT)]">
                    <span className="block text-xs text-foreground-muted">Usuario</span>
                    <input
                      id="username" type="text" required autoFocus autoComplete="username"
                      value={username} onChange={(e) => setUsername(e.target.value)}
                      className="mt-0.5 w-full bg-transparent text-[15px] text-ink outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </label>
                  <label className="relative block px-3.5 pb-2 pt-2.5 focus-within:bg-primary/[0.04] focus-within:shadow-[inset_3px_0_0_theme(colors.primary.DEFAULT)]">
                    <span className="block text-xs text-foreground-muted">Contraseña</span>
                    <input
                      id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="mt-0.5 w-full bg-transparent pr-10 text-[15px] text-ink outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      aria-pressed={showPassword}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-[3px] p-2 text-foreground-muted transition hover:text-ink"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.6} /> : <Eye className="h-4 w-4" strokeWidth={1.6} />}
                    </button>
                  </label>
                </div>

                {error && (
                  <div role="alert" className="mt-4 flex items-start gap-2 border-l-2 border-danger-strong bg-danger/[0.07] px-3 py-2.5 text-sm text-danger-strong">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    ref={submitRef}
                    type="submit" disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-[3px] bg-primary px-7 py-3 text-sm font-medium text-white transition hover:bg-primary-strong disabled:cursor-wait disabled:hover:bg-primary"
                  >
                    {loading && <Spinner size={15} />}
                    {!loading ? 'Entrar' : retry ? `Conectando (intento ${retry.attempt} de ${retry.attempts})` : 'Entrando…'}
                  </button>
                  {retry && (
                    <button type="button" onClick={() => abortRef.current?.abort()} className="text-sm text-foreground-muted underline underline-offset-4 hover:text-ink">
                      Cancelar
                    </button>
                  )}
                  {!retry && <ServerStatus status={server.status} onRecheck={server.recheck} />}
                </div>
                {server.status === 'waking' && !retry && (
                  <p className="mt-3 text-xs leading-5 text-foreground-muted">
                    La demo usa un plan gratuito que se suspende sin uso; la primera conexión puede tardar hasta un minuto.
                    Puedes escribir tus datos mientras tanto.
                  </p>
                )}
              </form>

              {/* Talón desprendible con las credenciales de prueba. */}
              <section aria-labelledby="demo-title" className="mt-8">
                <div className="relative -mx-6 sm:-mx-9" aria-hidden="true">
                  <div className="border-t-2 border-dashed border-outline" />
                  <span className="absolute -left-[7px] -top-[7px] h-3.5 w-3.5 rounded-full bg-ink" />
                  <span className="absolute -right-[7px] -top-[7px] h-3.5 w-3.5 rounded-full bg-ink" />
                </div>
                <h2 id="demo-title" className="mt-6 font-display text-lg text-ink">Credenciales de demostración</h2>
                <p className="mt-1 text-xs text-foreground-muted">Datos ficticios. Elige una cuenta para rellenar el acceso.</p>
                <ul className="mt-4 divide-y divide-outline border-y border-outline text-sm">
                  {demoAccounts.map((account) => (
                    <li key={account.username} className="flex items-start justify-between gap-4 py-3.5">
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{account.role}</p>
                        <p className="text-xs leading-5 text-foreground-muted">{account.scope}</p>
                        <dl className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs">
                          <div className="flex gap-1.5"><dt className="text-foreground-muted">Usuario</dt><dd className="text-ink">{account.username}</dd></div>
                          <div className="flex gap-1.5"><dt className="text-foreground-muted">Contraseña</dt><dd className="text-ink">{account.password}</dd></div>
                        </dl>
                      </div>
                          <button
                            type="button"
                            onClick={() => fillDemo(account)}
                            aria-label={`Usar la cuenta de ${account.role}`}
                            className="rounded-[3px] border border-ink/70 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-ink hover:text-white"
                          >
                            Usar
                          </button>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </main>

        <p className="mt-5 text-center text-xs text-white/75">Acceso para personal autorizado. Proyecto de portafolio con datos ficticios.</p>
      </div>
    </div>
  );
}

// Estado de la API de la demo, que se suspende sin uso.
function ServerStatus({ status, onRecheck }) {
  const content = {
    checking: null,
    ready: (
      <span className="flex items-center gap-2 text-foreground-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" /> Servidor listo
      </span>
    ),
    waking: (
      <span className="flex items-center gap-2 text-foreground-muted">
        <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        Despertando el servidor…
      </span>
    ),
    down: (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-danger-strong">
        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-danger" aria-hidden="true" /> El servidor no responde</span>
        <button type="button" onClick={onRecheck} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> Volver a comprobar
        </button>
      </span>
    ),
  }[status];

  return <p role="status" className="text-xs">{content}</p>;
}
