import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { employeesApi } from '../api/employees';
import { departmentsApi } from '../api/departments';
import { useToast } from '../context/ToastContext';
import { getErrorMessage, normalizeValidationErrors } from '../utils/errors';
import Spinner from '../components/Spinner';

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '', position: '',
  salary: '', hireDate: '', birthDate: '', departmentId: '', isActive: true,
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
        isActive: emp.isActive,
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
        await employeesApi.update(id, payload);
      } else {
        await employeesApi.create(payload);
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

  if (loading) return <div className="flex justify-center pt-20"><Spinner size={28} /></div>;

  return (
    <div className="max-w-2xl">
      <Link to="/empleados" className="mb-6 inline-flex items-center gap-1.5 text-sm text-paper-100/50 transition hover:text-paper-100">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Volver a empleados
      </Link>

      <h1 className="font-display text-3xl text-paper-100">{isEditing ? 'Editar empleado' : 'Nuevo empleado'}</h1>

      <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-ink-700 bg-ink-900 p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Nombre" error={errors.firstName}>
            <input className="input" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
          </Field>
          <Field label="Apellido" error={errors.lastName}>
            <input className="input" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
          </Field>
          <Field label="Correo" error={errors.email}>
            <input type="email" className="input" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
          </Field>
          <Field label="Teléfono" error={errors.phone}>
            <input className="input" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </Field>
          <Field label="Puesto" error={errors.position}>
            <input className="input" value={form.position} onChange={(e) => handleChange('position', e.target.value)} required />
          </Field>
          <Field label="Salario mensual" error={errors.salary}>
            <input type="number" min="1" step="0.01" className="input" value={form.salary} onChange={(e) => handleChange('salary', e.target.value)} required />
          </Field>
          <Field label="Departamento" error={errors.departmentId}>
            <select className="input" value={form.departmentId} onChange={(e) => handleChange('departmentId', e.target.value)} required>
              <option value="">Selecciona...</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <Field label="Fecha de nacimiento" error={errors.birthDate}>
            <input type="date" className="input" value={form.birthDate} onChange={(e) => handleChange('birthDate', e.target.value)} required />
          </Field>
          {!isEditing && (
            <Field label="Fecha de contratación" error={errors.hireDate}>
              <input type="date" className="input" value={form.hireDate} onChange={(e) => handleChange('hireDate', e.target.value)} required />
            </Field>
          )}
          {isEditing && (
            <Field label="Estado">
              <select className="input" value={form.isActive} onChange={(e) => handleChange('isActive', e.target.value === 'true')}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </Field>
          )}
        </div>

        {generalError && (
          <div className="mt-5 flex items-start gap-2 rounded-md border border-clay-500/30 bg-clay-500/10 px-3 py-2.5 text-sm text-clay-500">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
            <span>{generalError}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Link to="/empleados" className="rounded-md px-4 py-2.5 text-sm text-paper-100/70 transition hover:text-paper-100">
            Cancelar
          </Link>
          <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-md bg-gold-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gold-400 disabled:opacity-60">
            {saving && <Spinner size={16} />}
            {isEditing ? 'Guardar cambios' : 'Crear empleado'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-paper-100/70">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-clay-500">{error}</span>}
    </label>
  );
}
