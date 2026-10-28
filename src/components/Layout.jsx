import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, LogOut, ShieldCheck, Menu, X, UserRound, CalendarDays, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Seal, EngravedBackground } from './Guilloche';

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
      {/* Barra superior, solo en pantallas pequeñas: la tinta del lomo. */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-ink px-4 py-2.5 text-white lg:hidden">
        <div className="flex items-center gap-2.5">
          <Seal compact className="h-8 w-8 flex-shrink-0" />
          <p className="font-display text-sm">{APP_NAME}</p>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2.5 text-white/80 transition hover:bg-white/10 hover:text-white"
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
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* El lomo del expediente: tinta verde con el mismo grabado del login. */}
      <aside
        id="menu-principal"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-shrink-0 flex-col overflow-hidden bg-ink text-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <EngravedBackground className="pointer-events-none absolute inset-0 h-full w-full opacity-60" />

        <div className="relative flex items-center justify-between px-5 py-6">
          <div className="flex items-center gap-3">
            <Seal compact className="h-11 w-11 flex-shrink-0" />
            <div>
              <p className="font-display text-base leading-tight">{APP_NAME}</p>
              <p className="text-[11px] text-white/75">Recursos Humanos</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-2.5 text-white/75 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Doble filete, como el membrete del login. */}
        <div className="relative mx-5 border-t border-white/40" />
        <div className="relative mx-5 mt-[3px] border-t border-white/15" />

        <nav className="relative flex flex-1 flex-col gap-0.5 px-3 py-5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[3px] px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-white/10 text-white shadow-[inset_3px_0_0_#FFFFFF]'
                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="relative mx-5 border-t border-white/15" />

        <div className="relative px-4 py-4">
          <div className="flex items-center gap-2.5 px-1 py-1.5">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/40 font-display text-sm text-white">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{user?.username}</p>
              <p className="text-[11px] text-white/75">{isAdmin ? 'Recursos Humanos' : 'Empleado'}</p>
            </div>
          </div>
          <NavLink
            to="/cambiar-contrasena"
            className="mt-2 flex w-full items-center gap-2 rounded-[3px] px-2 py-1.5 text-xs text-white/75 transition hover:text-white"
          >
            <KeyRound className="h-3.5 w-3.5" strokeWidth={1.75} />
            Cambiar contraseña
          </NavLink>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2 rounded-[3px] border border-white/25 px-3 py-2 text-xs font-medium text-white/85 transition hover:border-white/60 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main id="contenido" tabIndex={-1} className="min-w-0 flex-1 p-3 pt-[4.5rem] outline-none sm:p-6 sm:pt-[4.5rem] lg:p-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
