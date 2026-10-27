import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { employeesApi } from '../api/employees';
import { getErrorMessage } from '../utils/errors';
import Spinner from './Spinner';

const MAX_VISIBLE_PER_DEPARTMENT = 6;
const COMPANY_NAME = 'Gestor de Empleados';

export default function OrgChart({ departments }) {
  const navigate = useNavigate();
  const [employeesByDept, setEmployeesByDept] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Trae a todos los empleados activos de una sola vez y los agrupa en el cliente,
    // en vez de hacer una petición por departamento.
    employeesApi
      .getAll({ isActive: true, pageSize: 500, sortBy: 'lastname' })
      .then((result) => {
        const grouped = {};
        result.items.forEach((emp) => {
          grouped[emp.departmentId] = grouped[emp.departmentId] || [];
          grouped[emp.departmentId].push(emp);
        });
        setEmployeesByDept(grouped);
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar el organigrama.')));
  }, []);

  if (error) return <p className="text-sm text-danger-strong">{error}</p>;
  if (!employeesByDept) return <div className="flex justify-center pt-16"><Spinner size={24} /></div>;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max flex-col items-center px-4 pt-2">
        {/* Nodo raíz: la empresa */}
        <div className="flex items-center gap-2 rounded-lg border-2 border-primary bg-primary/5 px-5 py-3">
          <Building2 className="h-4 w-4 text-primary-strong" strokeWidth={1.75} />
          <p className="font-display text-sm text-foreground">{COMPANY_NAME}</p>
        </div>

        <div className="h-6 w-px bg-outline" />

        {/* Línea horizontal que conecta todas las ramas de departamentos */}
        <div className="flex gap-10 border-t border-outline pt-6">
          {departments.map((dept) => {
            const employees = employeesByDept[dept.id] || [];
            const visible = employees.slice(0, MAX_VISIBLE_PER_DEPARTMENT);
            const extra = employees.length - visible.length;

            return (
              <div key={dept.id} className="relative flex flex-col items-center">
                <div className="absolute -top-6 left-1/2 h-6 w-px -translate-x-1/2 bg-outline" />

                <button
                  onClick={() => navigate('/empleados')}
                  className="min-w-[160px] rounded-lg border border-subtle bg-muted px-4 py-2.5 text-center transition hover:border-primary"
                  title="Ver empleados"
                >
                  <p className="text-sm font-medium text-foreground">{dept.name}</p>
                  <p className="text-xs text-foreground-muted">
                    {dept.employeeCount} persona{dept.employeeCount !== 1 ? 's' : ''}
                  </p>
                </button>

                {employees.length > 0 && (
                  <>
                    <div className="h-4 w-px bg-outline" />
                    <div className="flex flex-col gap-1.5">
                      {visible.map((emp) => (
                        <div
                          key={emp.id}
                          className="min-w-[160px] rounded-md border border-subtle bg-white px-3 py-1.5 text-center"
                        >
                          <p className="truncate text-xs text-foreground">{emp.fullName}</p>
                          <p className="truncate text-[10px] text-foreground-muted">{emp.position}</p>
                        </div>
                      ))}
                      {extra > 0 && (
                        <p className="pt-0.5 text-center text-[11px] text-foreground-muted">+{extra} más</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
