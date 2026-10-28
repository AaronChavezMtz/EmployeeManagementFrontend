import { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookUser, AlertCircle, ShieldCheck, UserRound, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { homePathFor } from '../utils/labels';
import { useAuth } from '../context/AuthContext';
import useServerStatus from '../hooks/useServerStatus';
import Spinner from '../components/Spinner';
import { getErrorMessage } from '../utils/errors';
import { isTransient } from '../api/retry';

const demoAccounts = [
  { role: 'Recursos Humanos', username: 'adminprueba', password: '123_Prueba', icon: ShieldCheck, note: 'Empleados, departamentos, solicitudes y usuarios' },
  { role: 'Empleado', username: 'usuariolector', password: 'lector_123', icon: UserRound, note: 'Su ficha, su historial y sus vacaciones' },
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

  function cancel() {
    abortRef.current?.abort();
  }

  function fillDemo(account) {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
    submitRef.current?.focus();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <BrandPanel />

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-3xl text-foreground">Inicia sesión</h1>
          <p className="mt-2 text-sm text-foreground-muted">Entra con tu usuario de Recursos Humanos o del portal del empleado.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate={false}>
            <label className="block text-sm">
              <span className="mb-1.5 block text-foreground">Usuario</span>
              <input
                id="username" type="text" required autoFocus autoComplete="username"
                value={username} onChange={(e) => setUsername(e.target.value)}
                className="input bg-surface"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-foreground">Contraseña</span>
              <span className="relative block">
                <input
                  id="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input bg-surface pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={showPassword}
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-foreground-muted transition hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.75} /> : <Eye className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </span>
            </label>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger-strong">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <button
              ref={submitRef}
              type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-primary-hover disabled:cursor-wait disabled:hover:bg-primary"
            >
              {loading && <Spinner size={16} />}
              {!loading ? 'Entrar' : retry ? `Conectando con el servidor (intento ${retry.attempt} de ${retry.attempts})` : 'Entrando…'}
            </button>
            {retry && (
              <button type="button" onClick={cancel} className="w-full text-center text-sm text-foreground-muted underline-offset-2 hover:text-foreground hover:underline">
                Cancelar
              </button>
            )}
          </form>

          <ServerStatus status={server.status} onRecheck={server.recheck} />

          <section aria-labelledby="demo-title" className="mt-10 border-t border-subtle pt-6">
            <h2 id="demo-title" className="text-sm font-medium text-foreground">Cuentas de demostración</h2>
            <p className="mt-1 text-xs text-foreground-muted">Elige una para rellenar el acceso. Los datos son ficticios.</p>
            <ul className="mt-4 space-y-2">
              {demoAccounts.map((account) => (
                <li key={account.username}>
                  <button
                    type="button"
                    onClick={() => fillDemo(account)}
                    aria-label={`Usar la cuenta de ${account.role}: usuario ${account.username}`}
                    className="group flex w-full items-center gap-3 rounded-lg border border-subtle bg-surface px-4 py-3 text-left transition hover:border-primary"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-strong">
                      <account.icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground">{account.role}</span>
                      <span className="block text-xs leading-5 text-foreground-muted">{account.note}</span>
                    </span>
                    <span className="text-right text-xs leading-5 text-foreground-muted">
                      <span className="block font-mono text-foreground">{account.username}</span>
                      <span className="block font-mono">{account.password}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

// Una línea de estado en vez de un spinner mudo: la API de la demo se suspende sin uso.
function ServerStatus({ status, onRecheck }) {
  const content = {
    checking: null,
    ready: (
      <span className="flex items-center gap-2 text-foreground-muted">
        <span className="h-2 w-2 rounded-full bg-success" aria-hidden="true" /> Servidor listo
      </span>
    ),
    waking: (
      <span className="flex items-start gap-2 text-foreground-muted">
        <span className="relative mt-1.5 flex h-2 w-2 flex-shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span>
          Despertando el servidor. La demo usa un plan gratuito que se suspende sin uso, así que la primera
          conexión puede tardar hasta un minuto. Puedes escribir tus datos mientras tanto.
        </span>
      </span>
    ),
    down: (
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-danger-strong">
        <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-danger" aria-hidden="true" /> El servidor no responde.</span>
        <button type="button" onClick={onRecheck} className="inline-flex items-center gap-1 font-medium text-primary-strong hover:underline">
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" /> Volver a comprobar
        </button>
      </span>
    ),
  }[status];

  return <p role="status" className="mt-5 min-h-[1.25rem] text-xs leading-5">{content}</p>;
}

// Panel de marca: un fichero de expedientes de personal, el objeto propio del trabajo de RH.
function BrandPanel() {
  return (
    <aside className="relative overflow-hidden bg-primary-strong px-6 py-8 text-white sm:px-10 lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:py-12">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
          <BookUser className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="font-display text-lg">Gestor de Empleados</span>
      </div>

      <IndexCards />

      <div className="mt-6 max-w-md lg:mt-0">
        <p className="font-display text-2xl leading-tight sm:text-3xl lg:text-4xl">La plantilla completa, en un solo expediente.</p>
        <p className="mt-3 text-sm leading-6 text-white/80">
          Altas, bajas, vacaciones e historial de cada persona, con un portal para que el equipo consulte lo suyo.
        </p>
        <p className="mt-6 hidden text-xs text-white/70 lg:block">Proyecto de portafolio con datos ficticios.</p>
      </div>
    </aside>
  );
}

// Tres fichas apiladas con su pestaña, como en un fichero de RH. Decorativas.
// Los tintes azulados de las fichas del fondo solo existen en esta ilustración.
function IndexCards() {
  const shadow = '0 18px 40px -12px rgba(10, 24, 70, 0.55)';
  return (
    <div aria-hidden="true" className="relative mx-auto my-10 hidden h-80 w-full max-w-md lg:block">
      <Card className="left-12 top-0 -rotate-[6deg] bg-[#DCE4F7]" tab="Nómina" tabPosition="left-[11.5rem]" shadow={shadow}>
        <div className="space-y-2 opacity-60">
          <div className="h-2 w-32 rounded bg-[#9DB0DF]" /><div className="h-2 w-24 rounded bg-[#9DB0DF]" />
        </div>
      </Card>
      <Card className="left-16 top-10 rotate-[3deg] bg-[#EEF2FC]" tab="Vacaciones" tabPosition="left-[6.5rem]" shadow={shadow}>
        <span className="inline-block rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-medium text-success-ink">5 días aprobados</span>
      </Card>
      <Card className="left-4 top-[5.5rem] -rotate-1 bg-white" tab="Expediente" tabPosition="left-5" shadow={shadow}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">AG</span>
          <div>
            <p className="text-sm font-medium text-foreground">Ana García</p>
            <p className="text-xs text-foreground-muted">Desarrolladora Backend</p>
          </div>
          <span className="ml-auto rounded-full bg-success/15 px-2 py-0.5 text-[11px] text-success-ink">Activa</span>
        </div>
        <div className="ledger-divider my-3" />
        <dl className="grid grid-cols-2 gap-y-1.5 text-xs">
          <dt className="text-foreground-muted">Departamento</dt><dd className="text-foreground">Tecnología</dd>
          <dt className="text-foreground-muted">Antigüedad</dt><dd className="text-foreground">2 años, 6 meses</dd>
          <dt className="text-foreground-muted">Vacaciones</dt><dd className="text-foreground">9 de 14 días</dd>
        </dl>
      </Card>
    </div>
  );
}

function Card({ className, tab, tabPosition, shadow, children }) {
  return (
    <div className={`absolute w-80 rounded-xl p-5 pt-6 ${className}`} style={{ boxShadow: shadow }}>
      {/* Pestaña de la ficha, sobresaliendo del borde superior. */}
      <span className={`absolute -top-3 ${tabPosition} rounded-t-md px-3 pt-1 text-[11px] font-medium text-primary-strong`} style={{ backgroundColor: 'inherit' }}>
        {tab}
      </span>
      {children}
    </div>
  );
}
