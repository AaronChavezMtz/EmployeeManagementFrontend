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
    <div className="flex min-h-screen bg-background">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:text-foreground focus:shadow-lg">
        Saltar al contenido
      </a>
      {/* Barra superior, solo en pantallas pequeñas */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-subtle bg-surface px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
            <BookUser className="h-3.5 w-3.5 text-white" strokeWidth={1.75} />
          </span>
          <p className="font-display text-sm text-foreground">{APP_NAME}</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2.5 text-foreground-muted transition hover:bg-muted"
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
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col border-r border-subtle bg-surface transition-transform duration-200 border-r border-subtle lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
              <BookUser className="h-4 w-4 text-white" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-display text-base leading-tight text-foreground">{APP_NAME}</p>
              <p className="text-[11px] text-foreground-muted">Registro de empleados</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-2.5 text-foreground-muted transition hover:bg-muted lg:hidden"
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
                    ? 'bg-primary/10 text-primary-strong'
                    : 'text-foreground-muted hover:bg-muted hover:text-foreground'
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
          <div className="flex items-center gap-2.5 rounded-md bg-muted px-3 py-2.5">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">{user?.username}</p>
              <p className="text-[11px] text-foreground-muted">{isAdmin ? 'Administrador' : 'Empleado'}</p>
            </div>
          </div>
          <NavLink
            to="/cambiar-contrasena"
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs text-foreground-muted transition hover:text-primary"
          >
            <KeyRound className="h-3.5 w-3.5" strokeWidth={1.75} />
            Cambiar contraseña
          </NavLink>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-md border border-outline px-3 py-2 text-xs font-medium text-foreground-muted transition hover:border-danger hover:bg-danger/5 hover:text-danger-strong"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main id="contenido" tabIndex={-1} className="flex-1 overflow-y-auto p-3 pt-16 outline-none sm:p-6 lg:pt-6">
        <div className="mx-auto max-w-6xl px-1 py-2 sm:px-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
