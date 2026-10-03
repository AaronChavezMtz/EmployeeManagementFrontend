import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, LogOut, BookUser } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/empleados', label: 'Empleados', icon: Users },
  { to: '/departamentos', label: 'Departamentos', icon: Building2 },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <div className="flex min-h-screen bg-ink-950">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-ink-700 bg-ink-900">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <BookUser className="h-6 w-6 text-gold-500" strokeWidth={1.75} />
          <div>
            <p className="font-display text-base leading-tight text-paper-100">Personal</p>
            <p className="text-[11px] text-paper-100/40">Registro de empleados</p>
          </div>
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

        <div className="px-6 py-5">
          <p className="text-sm text-paper-100">{user?.username}</p>
          <p className="text-[11px] uppercase tracking-wide text-paper-100/40">
            {isAdmin ? 'Administrador' : 'Solo lectura'}
          </p>
          <button
            onClick={logout}
            className="mt-3 flex items-center gap-2 text-xs text-paper-100/50 transition hover:text-clay-500"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
