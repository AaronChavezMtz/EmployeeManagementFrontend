import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, LogOut, BookUser, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const APP_NAME = 'Gestor de Empleados';

const baseNavItems = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/empleados', label: 'Empleados', icon: Users },
  { to: '/departamentos', label: 'Departamentos', icon: Building2 },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = isAdmin
    ? [...baseNavItems, { to: '/usuarios', label: 'Usuarios', icon: ShieldCheck }]
    : baseNavItems;

  // Cierra el menú al navegar a otra pantalla (evita que quede abierto sobre la nueva página).
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-ink-950">
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
          className="rounded-md p-2 text-paper-100/60 transition hover:bg-ink-800"
          aria-label="Abrir menú"
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
              <p className="text-[11px] text-paper-100/40">Registro de empleados</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1.5 text-paper-100/40 transition hover:bg-ink-800 lg:hidden"
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
                    ? 'bg-gold-500/10 text-gold-400'
                    : 'text-paper-100/60 hover:bg-ink-800 hover:text-paper-100'
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
              <p className="text-[11px] text-paper-100/40">{isAdmin ? 'Administrador' : 'Solo lectura'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-ink-600 px-3 py-2 text-xs font-medium text-paper-100/60 transition hover:border-clay-500 hover:bg-clay-500/5 hover:text-clay-500"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-3 pt-16 sm:p-6 lg:pt-6">
        <div className="mx-auto max-w-6xl rounded-2xl bg-ink-900 p-4 shadow-sm shadow-black/5 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
