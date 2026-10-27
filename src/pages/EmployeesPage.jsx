import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Pencil, UserMinus, UserPlus, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { employeesApi } from '../api/employees';
import { departmentsApi } from '../api/departments';
import { reportsApi } from '../api/reports';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import Spinner from '../components/Spinner';
import { Skeleton, SkeletonCards, SkeletonRows } from '../components/Skeleton';
import { TerminateDialog, RehireDialog } from '../components/EmploymentDialogs';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export default function EmployeesPage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [data, setData] = useState({ items: [], totalCount: 0, pageNumber: 1, pageSize: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toTerminate, setToTerminate] = useState(null);
  const [toRehire, setToRehire] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);

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
    departmentsApi.getAll().then(setDepartments).catch((err) => showToast(getErrorMessage(err, 'No se pudieron cargar los departamentos.'), 'error'));
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
        setLoadedOnce(true);
        setError('');
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar los empleados.')))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(loadEmployees, 300); // debounce de búsqueda
    return () => clearTimeout(timeout);
  }, [loadEmployees]);

  // Primera carga: esqueleto. Después (filtros, páginas): se atenúan los datos anteriores, sin vaciar la tabla.
  const firstLoad = loading && !loadedOnce;
  const refreshing = loading && loadedOnce;

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value, pageNumber: key === 'pageNumber' ? value : 1 }));
  }

  async function handleExport() {
    setExporting(true);
    try {
      await reportsApi.exportEmployeesExcel({
        search: filters.search || undefined,
        departmentId: filters.departmentId || undefined,
        isActive: filters.isActive === '' ? undefined : filters.isActive === 'true',
        sortBy: filters.sortBy,
        descending: filters.descending,
      });
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo generar el Excel.'), 'error');
    } finally {
      setExporting(false);
    }
  }

  // Los diálogos muestran el error dentro del formulario, por eso se relanza como Error con el mensaje.
  async function confirmTerminate(payload) {
    try {
      await employeesApi.terminate(toTerminate.id, payload);
    } catch (err) {
      throw new Error(getErrorMessage(err, 'No se pudo dar de baja al empleado.'));
    }
    showToast(`${toTerminate.fullName} fue dado de baja.`, 'success');
    setToTerminate(null);
    loadEmployees();
  }

  async function confirmRehire(payload) {
    try {
      await employeesApi.rehire(toRehire.id, payload);
    } catch (err) {
      throw new Error(getErrorMessage(err, 'No se pudo recontratar al empleado.'));
    }
    showToast(`${toRehire.fullName} fue recontratado.`, 'success');
    setToRehire(null);
    loadEmployees();
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-foreground">Empleados</h1>
          {firstLoad
            ? <Skeleton className="mt-2 h-4 w-24" />
            : <p className="mt-1 text-sm text-foreground-muted">{data.totalCount} registrados</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-md border border-outline bg-surface px-3.5 py-2 text-sm text-foreground/80 transition hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {exporting ? <Spinner size={14} /> : <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} />}
            Excel
          </button>
          {isAdmin && (
            <Link
              to="/empleados/nuevo"
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Nuevo empleado
            </Link>
          )}
        </div>
      </header>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative sm:min-w-[220px] sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o puesto..."
            aria-label="Buscar empleados"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full rounded-md border border-outline bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </div>

        <select
          value={filters.departmentId}
          onChange={(e) => updateFilter('departmentId', e.target.value)}
          aria-label="Filtrar por departamento"
          className="w-full rounded-md border border-outline bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary sm:w-auto"
        >
          <option value="">Todos los departamentos</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <select
          value={filters.isActive}
          onChange={(e) => updateFilter('isActive', e.target.value)}
          aria-label="Filtrar por estado"
          className="w-full rounded-md border border-outline bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary sm:w-auto"
        >
          <option value="">Activos e inactivos</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
          aria-label="Ordenar por"
          className="w-full rounded-md border border-outline bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary sm:w-auto"
        >
          <option value="lastname">Ordenar: Apellido</option>
          <option value="salary">Ordenar: Salario</option>
          <option value="hiredate">Ordenar: Fecha de contratación</option>
          <option value="department">Ordenar: Departamento</option>
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-danger-strong">{error}</p>}

      {/* Móvil: una tarjeta por empleado, con todas las acciones a la vista. */}
      <ul className={`space-y-3 transition-opacity sm:hidden ${refreshing ? 'opacity-50' : ''}`} aria-busy={loading}>
        {firstLoad ? (
          <SkeletonCards count={5} withActions={isAdmin} />
        ) : data.items.length === 0 ? (
          <li className="rounded-lg border border-subtle bg-surface py-10 text-center text-sm text-foreground-muted">Sin resultados para este filtro.</li>
        ) : (
          data.items.map((emp) => (
            <li key={emp.id} className="rounded-lg border border-subtle bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/empleados/${emp.id}`} className="font-medium text-foreground">{emp.fullName}</Link>
                  <p className="truncate text-sm text-foreground-muted">{emp.position} · {emp.departmentName}</p>
                </div>
                <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs ${emp.isActive ? 'bg-success/15 text-success-ink' : 'bg-subtle text-foreground-muted'}`}>
                  {emp.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="mt-2 text-sm text-foreground">{currency.format(emp.salary)} <span className="text-foreground-muted">mensual</span></p>
              {isAdmin && (
                <div className="mt-3 flex gap-2 border-t border-subtle pt-3">
                  <Link to={`/empleados/${emp.id}/editar`} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-outline py-2.5 text-sm text-foreground/80">
                    <Pencil className="h-4 w-4" strokeWidth={1.75} /> Editar
                  </Link>
                  {emp.isActive ? (
                    <button onClick={() => setToTerminate(emp)} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-outline py-2.5 text-sm text-foreground/80">
                      <UserMinus className="h-4 w-4 text-danger-strong" strokeWidth={1.75} /> Dar de baja
                    </button>
                  ) : (
                    <button onClick={() => setToRehire(emp)} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-outline py-2.5 text-sm text-success-strong">
                      <UserPlus className="h-4 w-4" strokeWidth={1.75} /> Recontratar
                    </button>
                  )}
                </div>
              )}
            </li>
          ))
        )}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-subtle bg-surface sm:block">
        <table className="w-full tabular-nums min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-subtle text-left text-xs uppercase tracking-wide text-foreground-muted">
              <th className="px-5 py-3 font-normal">Nombre</th>
              <th className="px-5 py-3 font-normal">Departamento</th>
              <th className="px-5 py-3 font-normal">Puesto</th>
              <th className="px-5 py-3 font-normal">Salario</th>
              <th className="px-5 py-3 font-normal">Estado</th>
              {isAdmin && <th className="px-5 py-3 font-normal text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className={`transition-opacity ${refreshing ? 'opacity-50' : ''}`} aria-busy={loading}>
            {firstLoad ? (
              <SkeletonRows rows={8} cols={isAdmin ? 6 : 5} />
            ) : data.items.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-foreground-muted">Sin resultados para este filtro.</td></tr>
            ) : (
              data.items.map((emp) => (
                <tr key={emp.id} className="border-b border-subtle/60 last:border-0 hover:bg-muted/50">
                  <td className="px-5 py-3">
                    <Link to={`/empleados/${emp.id}`} className="text-foreground transition hover:text-primary-strong">
                      {emp.fullName}
                    </Link>
                    <p className="text-xs text-foreground-muted">{emp.email}</p>
                  </td>
                  <td className="px-5 py-3 text-foreground-muted">{emp.departmentName}</td>
                  <td className="px-5 py-3 text-foreground-muted">{emp.position}</td>
                  <td className="px-5 py-3 text-foreground-muted">{currency.format(emp.salary)}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${emp.isActive ? 'bg-success/15 text-success-ink' : 'bg-subtle text-foreground-muted'}`}>
                      {emp.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Link to={`/empleados/${emp.id}/editar`} aria-label={`Editar a ${emp.fullName}`} className="rounded-md p-2.5 text-foreground-muted transition hover:bg-subtle hover:text-primary-hover">
                          <Pencil className="h-4 w-4" strokeWidth={1.75} />
                        </Link>
                        {emp.isActive ? (
                          <button onClick={() => setToTerminate(emp)} title="Dar de baja" aria-label={`Dar de baja a ${emp.fullName}`} className="rounded-md p-2.5 text-foreground-muted transition hover:bg-subtle hover:text-danger-strong">
                            <UserMinus className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        ) : (
                          <button onClick={() => setToRehire(emp)} title="Recontratar" aria-label={`Recontratar a ${emp.fullName}`} className="rounded-md p-2.5 text-foreground-muted transition hover:bg-subtle hover:text-success-strong">
                            <UserPlus className="h-4 w-4" strokeWidth={1.75} />
                          </button>
                        )}
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
        <div className="mt-4 flex items-center justify-between text-sm text-foreground-muted">
          <span>Página {data.pageNumber} de {data.totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={data.pageNumber <= 1}
              onClick={() => updateFilter('pageNumber', data.pageNumber - 1)}
              aria-label="Página anterior"
              className="rounded-md border border-outline p-1.5 transition hover:bg-muted disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              disabled={data.pageNumber >= data.totalPages}
              onClick={() => updateFilter('pageNumber', data.pageNumber + 1)}
              aria-label="Página siguiente"
              className="rounded-md border border-outline p-1.5 transition hover:bg-muted disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      )}

      <TerminateDialog employee={toTerminate} onConfirm={confirmTerminate} onCancel={() => setToTerminate(null)} />
      <RehireDialog employee={toRehire} onConfirm={confirmRehire} onCancel={() => setToRehire(null)} />
    </div>
  );
}
