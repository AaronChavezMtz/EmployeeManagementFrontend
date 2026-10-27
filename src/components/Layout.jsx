import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, LogOut, BookUser, ShieldCheck, Menu, X, UserRound, CalendarDays, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const APP_NAME = 'Gestor de Empleados';

const adminNavItems = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/empleados', label: 'Empleados', icon: Users },
  { to: '/departamentos', label: 'Departamentos', icon: Building2 },
  { to: '/solicitudes', label: 'Solicitudes', icon: CalendarDays },
  { to: '/usuarios', label: 'Usuarios', icon: ShieldCheck },
];

const employeeNavItems = [
  { to: '/mi-perfil', label: 'Mi perfil', icon: UserRound },
  { to: '/mis-ausencias', label: 'Mis ausencias', icon: CalendarDays },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  // Cierra el menú al navegar a otra pantalla (evita que quede abierto sobre la nueva página).
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Esc cierra el menú móvil, como cualquier panel superpuesto.
  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Título de la pestaña por sección: lo leen los lectores de pantalla al cambiar de página.
  useEffect(() => {
    const current = [...navItems].sort((a, b) => b.to.length - a.to.length)
      .find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)));
    document.title = current ? `${current.label} · ${APP_NAME}` : APP_NAME;
  }, [location.pathname, navItems]);

  return (
    <div className="flex min-h-screen bg-ink-950">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-sm focus:text-paper-100 focus:shadow-lg">
        Saltar al contenido
      </a>
      {/* Barra superior, solo en pantallas pequeñas */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-ink-700 bg-ink-900 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500">
            <BookUser className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
          </span>
          <p className="font-display text-sm text-paper-100">{APP_NAME}</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2.5 text-paper-100/70 transition hover:bg-ink-800"
          aria-label="Abrir menú"
          aria-expanded={mobileOpen}
          aria-controls="menu-principal"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>

      {/* Fondo oscuro detrás del menú móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="menu-principal"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col border-r border-ink-700 bg-ink-900 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gold-500">
              <BookUser className="h-4 w-4 text-white" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-display text-base leading-tight text-paper-100">{APP_NAME}</p>
              <p className="text-[11px] text-paper-100/70">Registro de empleados</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-2.5 text-paper-100/70 transition hover:bg-ink-800 lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="ledger-divider mx-6" />

        <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-gold-500/10 text-gold-600'
                    : 'text-paper-100/70 hover:bg-ink-800 hover:text-paper-100'
                }`
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ledger-divider mx-6" />

        <div className="px-4 py-4">
          <div className="flex items-center gap-2.5 rounded-md bg-ink-800 px-3 py-2.5">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-medium text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-paper-100">{user?.username}</p>
              <p className="text-[11px] text-paper-100/70">{isAdmin ? 'Administrador' : 'Empleado'}</p>
            </div>
          </div>
          <NavLink
            to="/cambiar-contrasena"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs text-paper-100/70 transition hover:text-gold-500"
          >
            <KeyRound className="h-3.5 w-3.5" strokeWidth={1.75} />
            Cambiar contraseña
          </NavLink>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-md border border-ink-600 px-3 py-2 text-xs font-medium text-paper-100/70 transition hover:border-clay-500 hover:bg-clay-500/5 hover:text-clay-600"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main id="contenido" tabIndex={-1} className="flex-1 overflow-y-auto p-3 pt-16 outline-none sm:p-6 lg:pt-6">
        <div className="mx-auto max-w-6xl rounded-2xl bg-ink-900 p-4 shadow-sm shadow-black/5 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
