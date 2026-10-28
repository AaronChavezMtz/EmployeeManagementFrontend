import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { employeesApi } from '../api/employees';
import { departmentsApi } from '../api/departments';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, normalizeValidationErrors } from '../utils/errors';
import Spinner from '../components/Spinner';
import { Loading, Skeleton } from '../components/Skeleton';
import CredentialsDialog from '../components/CredentialsDialog';

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '', position: '',
  salary: '', hireDate: '', birthDate: '', departmentId: '', grantPortalAccess: true,
};

export default function EmployeeFormPage() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [createdAccess, setCreatedAccess] = useState(null); // { access, name }

  useEffect(() => {
    departmentsApi.getAll().then(setDepartments).catch((err) => showToast(getErrorMessage(err, 'No se pudieron cargar los departamentos.'), 'error'));
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    employeesApi.getById(id).then((emp) => {
      setForm({
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: emp.phone || '',
        position: emp.position,
        salary: emp.salary,
        hireDate: emp.hireDate?.slice(0, 10) || '',
        birthDate: emp.birthDate?.slice(0, 10) || '',
        departmentId: emp.departmentId,
      });
      setLoading(false);
    }).catch((err) => {
      showToast(getErrorMessage(err, 'No se pudo cargar la información del empleado.'), 'error');
      navigate('/empleados');
    });
  }, [id, isEditing, navigate, showToast]);

  function handleChange(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    setSaving(true);

    const payload = {
      ...form,
      salary: Number(form.salary),
      departmentId: Number(form.departmentId),
      hireDate: form.hireDate ? new Date(form.hireDate).toISOString() : undefined,
      birthDate: new Date(form.birthDate).toISOString(),
    };

    try {
      if (isEditing) {
        delete payload.hireDate; // no editable tras la creación
        delete payload.grantPortalAccess;
        await employeesApi.update(id, payload);
      } else {
        const created = await employeesApi.create(payload);
        if (created.portalAccess) {
          // Se muestran las credenciales antes de salir: la API no las vuelve a devolver.
          showToast('Empleado creado correctamente.', 'success');
          setCreatedAccess({ access: created.portalAccess, name: created.fullName });
          return;
        }
      }
      showToast(isEditing ? 'Empleado actualizado correctamente.' : 'Empleado creado correctamente.', 'success');
      navigate('/empleados');
    } catch (err) {
      const data = err.response?.data;
      if (data?.validationErrors) {
        setErrors(normalizeValidationErrors(data.validationErrors));
        setGeneralError('Revisa los campos marcados abajo.');
      } else {
        setGeneralError(getErrorMessage(err, 'No se pudo guardar el empleado.'));
      }
    } finally {
      setSaving(false);
    }
  }

  const loaded = !loading;

  return (
    <div className="max-w-2xl">
      <Link to="/empleados" className="mb-6 inline-flex items-center gap-1.5 text-sm text-foreground-muted transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Volver a empleados
      </Link>

      <h1 className="membrete font-display text-3xl text-foreground">{isEditing ? 'Editar empleado' : 'Nuevo empleado'}</h1>

{!loaded ? (
        <Loading className="mt-6 rounded-lg border border-outline bg-surface p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-10 w-full" />
              </div>
            ))}
          </div>
        </Loading>
      ) : (
      <>
      <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-outline bg-surface p-6">
        <p className="mb-5 text-xs text-foreground-muted"><span aria-hidden="true">*</span> Campo obligatorio</p>

        <Section title="Datos personales">
          <Field label="Nombre" required error={errors.firstName}>
            <input className="input" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
          </Field>
          <Field label="Apellido" required error={errors.lastName}>
            <input className="input" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
          </Field>
          <Field label="Correo" required error={errors.email}>
            <input type="email" className="input" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
          </Field>
          <Field label="Teléfono" hint="10 dígitos" error={errors.phone}>
            <input type="tel" inputMode="tel" className="input" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </Field>
          <Field label="Fecha de nacimiento" required hint="Debe tener al menos 18 años" error={errors.birthDate}>
            <input type="date" className="input" value={form.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} required />
          </Field>
        </Section>

        <Section title="Puesto y contrato">
          <Field label="Departamento" required error={errors.departmentId}>
            <select className="input" value={form.departmentId} onChange={(e) => handleChange('departmentId', e.target.value)} required>
              <option value="">Selecciona...</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Puesto" required error={errors.position}>
            <input className="input" value={form.position} onChange={(e) => handleChange('position', e.target.value)} required />
          </Field>
          <Field label="Salario mensual" required error={errors.salary}>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-muted" aria-hidden="true">$</span>
              <input type="number" min="1" step="0.01" inputMode="decimal" className="input pl-7 pr-14 tabular-nums" value={form.salary} onChange={(e) => handleChange('salary', e.target.value)} required />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted" aria-hidden="true">MXN</span>
            </div>
          </Field>
          {!isEditing && (
            <Field label="Fecha de contratación" required error={errors.hireDate}>
              <input type="date" className="input" value={form.hireDate} onChange={(e) => handleChange('hireDate', e.target.value)} required />
            </Field>
          )}
        </Section>

        {!isEditing && (
          <label className="mt-5 flex items-start gap-2.5 text-sm">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" checked={form.grantPortalAccess}
              onChange={(e) => handleChange('grantPortalAccess', e.target.checked)} />
            <span>
              <span className="block text-foreground">Dar acceso al portal del empleado</span>
              <span className="block text-xs text-foreground-muted">Se crea su usuario con el correo y una contraseña temporal que verás al guardar.</span>
            </span>
          </label>
        )}

        {generalError && (
          <div className="mt-5 flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger-strong">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
            <span>{generalError}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Link to="/empleados" className="rounded-md px-4 py-2.5 text-sm text-foreground-muted transition hover:text-foreground">
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover disabled:opacity-60">
            {saving && <Spinner size={16} />}
            {isEditing ? 'Guardar cambios' : 'Crear empleado'}
          </button>
        </div>
      </form>

      <CredentialsDialog
        access={createdAccess?.access}
        employeeName={createdAccess?.name}
        onClose={() => navigate('/empleados')}
      />
      </>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <fieldset className="mb-6 last-of-type:mb-0">
      <legend className="mb-4 text-xs font-medium font-medium text-foreground-muted">{title}</legend>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({ label, required = false, hint, error, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-foreground">
        {label}
        {required && <span className="ml-0.5 text-danger-strong" aria-hidden="true">*</span>}
      </span>
      {children}
      {error
        ? <span className="mt-1 block text-xs text-danger-strong">{error}</span>
        : hint && <span className="mt-1 block text-xs text-foreground-muted">{hint}</span>}
    </label>
  );
}
