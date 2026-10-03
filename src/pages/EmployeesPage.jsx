import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { employeesApi } from '../api/employees';
import { departmentsApi } from '../api/departments';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import ConfirmDialog from '../components/ConfirmDialog';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export default function EmployeesPage() {
  const { isAdmin } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    departmentId: '',
    isActive: '',
    sortBy: 'lastname',
    descending: false,
    pageNumber: 1,
    pageSize: 10,
  });

  useEffect(() => {
    departmentsApi.getAll().then(setDepartments).catch(() => {});
  }, []);

  const loadEmployees = useCallback(() => {
    setLoading(true);
    const params = {
      search: filters.search || undefined,
      departmentId: filters.departmentId || undefined,
      isActive: filters.isActive === '' ? undefined : filters.isActive === 'true',
      sortBy: filters.sortBy,
      descending: filters.descending,
      pageNumber: filters.pageNumber,
      pageSize: filters.pageSize,
    };
    employeesApi
      .getAll(params)
      .then((result) => {
        setData(result);
        setError('');
      })
      .catch(() => setError('No se pudieron cargar los empleados.'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(loadEmployees, 300); // debounce de búsqueda
    return () => clearTimeout(timeout);
  }, [loadEmployees]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value, pageNumber: key === 'pageNumber' ? value : 1 }));
  }

  async function confirmDelete() {
    try {
      await employeesApi.remove(toDelete.id);
      setToDelete(null);
      loadEmployees();
    } catch {
      setError('No se pudo dar de baja al empleado.');
      setToDelete(null);
    }
  }

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-paper-100">Empleados</h1>
          <p className="mt-1 text-sm text-paper-100/50">{data.totalCount} registrados</p>
        </div>
        {isAdmin && (
          <Link
            to="/empleados/nuevo"
            className="flex items-center gap-2 rounded-md bg-gold-500 px-4 py-2.5 text-sm font-medium text-ink-950 transition hover:bg-gold-400"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Nuevo empleado
          </Link>
        )}
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paper-100/40" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o puesto..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full rounded-md border border-ink-600 bg-ink-900 py-2.5 pl-9 pr-3 text-sm text-paper-100 outline-none transition focus:border-gold-500"
          />
        </div>

        <select
          value={filters.departmentId}
          onChange={(e) => updateFilter('departmentId', e.target.value)}
          className="rounded-md border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-paper-100 outline-none transition focus:border-gold-500"
        >
          <option value="">Todos los departamentos</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={filters.isActive}
          onChange={(e) => updateFilter('isActive', e.target.value)}
          className="rounded-md border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-paper-100 outline-none transition focus:border-gold-500"
        >
          <option value="">Activos e inactivos</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          className="rounded-md border border-ink-600 bg-ink-900 px-3 py-2.5 text-sm text-paper-100 outline-none transition focus:border-gold-500"
        >
          <option value="lastname">Ordenar: Apellido</option>
          <option value="salary">Ordenar: Salario</option>
          <option value="hiredate">Ordenar: Fecha de contratación</option>
          <option value="department">Ordenar: Departamento</option>
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-clay-500">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-paper-100/40">
              <th className="px-5 py-3 font-normal">Nombre</th>
              <th className="px-5 py-3 font-normal">Departamento</th>
              <th className="px-5 py-3 font-normal">Puesto</th>
              <th className="px-5 py-3 font-normal">Salario</th>
              <th className="px-5 py-3 font-normal">Estado</th>
              {isAdmin && <th className="px-5 py-3 font-normal text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="py-16 text-center"><Spinner size={24} /></td></tr>
            ) : data.items.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-paper-100/40">Sin resultados para este filtro.</td></tr>
            ) : (
              data.items.map((emp) => (
                <tr key={emp.id} className="border-b border-ink-700/60 last:border-0 hover:bg-ink-800/50">
                  <td className="px-5 py-3">
                    <p className="text-paper-100">{emp.fullName}</p>
                    <p className="text-xs text-paper-100/40">{emp.email}</p>
                  </td>
                  <td className="px-5 py-3 text-paper-100/70">{emp.departmentName}</td>
                  <td className="px-5 py-3 text-paper-100/70">{emp.position}</td>
                  <td className="px-5 py-3 text-paper-100/70">{currency.format(emp.salary)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${emp.isActive ? 'bg-sage-500/15 text-sage-500' : 'bg-ink-700 text-paper-100/40'}`}>
                      {emp.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/empleados/${emp.id}/editar`} className="rounded-md p-1.5 text-paper-100/50 transition hover:bg-ink-700 hover:text-gold-400">
                          <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        </Link>
                        <button onClick={() => setToDelete(emp)} className="rounded-md p-1.5 text-paper-100/50 transition hover:bg-ink-700 hover:text-clay-500">
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-paper-100/50">
          <span>Página {data.pageNumber} de {data.totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={data.pageNumber <= 1}
              onClick={() => updateFilter('pageNumber', data.pageNumber - 1)}
              className="rounded-md border border-ink-600 p-1.5 transition hover:bg-ink-800 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              disabled={data.pageNumber >= data.totalPages}
              onClick={() => updateFilter('pageNumber', data.pageNumber + 1)}
              className="rounded-md border border-ink-600 p-1.5 transition hover:bg-ink-800 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Dar de baja al empleado"
        message={toDelete ? `¿Confirmas dar de baja a ${toDelete.fullName}? Esta acción lo marca como inactivo, no borra su historial.` : ''}
        confirmLabel="Dar de baja"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
