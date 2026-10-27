import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, AlertCircle } from 'lucide-react';
import { leaveApi } from '../api/leave';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { formatDate, leaveStatuses, leaveTypes } from '../utils/labels';
import Spinner from '../components/Spinner';
import { SkeletonCards, SkeletonRows } from '../components/Skeleton';

const filters = [
  { value: 'Pending', label: 'Pendientes' },
  { value: 'Approved', label: 'Aprobadas' },
  { value: 'Rejected', label: 'Rechazadas' },
  { value: '', label: 'Todas' },
];

export default function LeaveRequestsPage() {
  const { showToast } = useToast();
  const [status, setStatus] = useState('Pending');
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(null); // { request, action: 'approve' | 'reject' }

  const load = useCallback(() => {
    setLoading(true);
    leaveApi.getAll(status)
      .then(setRequests)
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar las solicitudes.')))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { load(); }, [load]);

  async function submitReview(comment) {
    const { request, action } = reviewing;
    if (action === 'approve') await leaveApi.approve(request.id, comment);
    else await leaveApi.reject(request.id, comment);
    showToast(`Solicitud de ${request.employeeName} ${action === 'approve' ? 'aprobada' : 'rechazada'}.`, 'success');
    setReviewing(null);
    load();
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl text-paper-100">Solicitudes de ausencia</h1>
        <p className="mt-1 text-sm text-paper-100/50">Vacaciones, incapacidades y permisos de la plantilla</p>
      </header>

      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm transition ${
              status === f.value ? 'bg-gold-500 text-white' : 'border border-ink-600 text-paper-100/70 hover:border-gold-500'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-clay-500">{error}</p>}

      <ul className={`space-y-3 transition-opacity sm:hidden ${loading && requests ? 'opacity-50' : ''}`} aria-busy={loading}>
        {!requests ? (
          <SkeletonCards count={3} withActions />
        ) : requests.length === 0 ? (
          <li className="rounded-lg border border-ink-700 bg-ink-900 py-10 text-center text-sm text-paper-100/50">No hay solicitudes en esta vista.</li>
        ) : (
          requests.map((r) => {
            const st = leaveStatuses[r.status] ?? leaveStatuses.Pending;
            return (
              <li key={r.id} className="rounded-lg border border-ink-700 bg-ink-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link to={`/empleados/${r.employeeId}`} className="font-medium text-paper-100">{r.employeeName}</Link>
                    <p className="text-sm text-paper-100/70">{leaveTypes[r.type] ?? r.type}</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs ${st.classes}`}>{st.label}</span>
                </div>
                <p className="mt-1 text-sm text-paper-100/70">{formatDate(r.startDate)} – {formatDate(r.endDate)} · {r.days} {r.days === 1 ? 'día' : 'días'}</p>
                {r.reason && <p className="mt-1 text-sm text-paper-100/60">{r.reason}</p>}
                {r.reviewedBy && <p className="mt-1 text-xs text-paper-100/60">por {r.reviewedBy}{r.reviewComment ? `: “${r.reviewComment}”` : ''}</p>}
                {r.status === 'Pending' && (
                  <div className="mt-3 flex gap-2 border-t border-ink-700 pt-3">
                    <button onClick={() => setReviewing({ request: r, action: 'approve' })} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ink-600 py-2.5 text-sm text-sage-600">
                      <Check className="h-4 w-4" strokeWidth={2} /> Aprobar
                    </button>
                    <button onClick={() => setReviewing({ request: r, action: 'reject' })} className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-ink-600 py-2.5 text-sm text-clay-600">
                      <X className="h-4 w-4" strokeWidth={2} /> Rechazar
                    </button>
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border border-ink-700 bg-ink-900 sm:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-paper-100/40">
              <th className="px-5 py-3 font-normal">Empleado</th>
              <th className="px-5 py-3 font-normal">Tipo</th>
              <th className="px-5 py-3 font-normal">Fechas</th>
              <th className="px-5 py-3 font-normal">Días</th>
              <th className="px-5 py-3 font-normal">Estado</th>
              <th className="px-5 py-3 font-normal text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className={`transition-opacity ${loading && requests ? 'opacity-50' : ''}`} aria-busy={loading}>
            {!requests ? (
              <SkeletonRows rows={4} cols={6} />
            ) : requests.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-paper-100/40">No hay solicitudes en esta vista.</td></tr>
            ) : (
              requests.map((r) => {
                const st = leaveStatuses[r.status] ?? leaveStatuses.Pending;
                return (
                  <tr key={r.id} className="border-b border-ink-700/60 last:border-0">
                    <td className="px-5 py-3">
                      <Link to={`/empleados/${r.employeeId}`} className="text-paper-100 transition hover:text-gold-600">{r.employeeName}</Link>
                      {r.reason && <p className="text-xs text-paper-100/40">{r.reason}</p>}
                    </td>
                    <td className="px-5 py-3 text-paper-100/70">{leaveTypes[r.type] ?? r.type}</td>
                    <td className="px-5 py-3 text-paper-100/70">{formatDate(r.startDate)} – {formatDate(r.endDate)}</td>
                    <td className="px-5 py-3 text-paper-100/70">{r.days}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${st.classes}`}>{st.label}</span>
                      {r.reviewedBy && <p className="mt-1 text-xs text-paper-100/40">por {r.reviewedBy}{r.reviewComment ? `: “${r.reviewComment}”` : ''}</p>}
                    </td>
                    <td className="px-5 py-3">
                      {r.status === 'Pending' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setReviewing({ request: r, action: 'approve' })} title="Aprobar" className="rounded-md p-1.5 text-paper-100/50 transition hover:bg-ink-700 hover:text-sage-500">
                            <Check className="h-4 w-4" strokeWidth={2} />
                          </button>
                          <button onClick={() => setReviewing({ request: r, action: 'reject' })} title="Rechazar" className="rounded-md p-1.5 text-paper-100/50 transition hover:bg-ink-700 hover:text-clay-500">
                            <X className="h-4 w-4" strokeWidth={2} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {reviewing && <ReviewDialog reviewing={reviewing} onSubmit={submitReview} onCancel={() => setReviewing(null)} />}
    </div>
  );
}

function ReviewDialog({ reviewing, onSubmit, onCancel }) {
  const { request, action } = reviewing;
  const isReject = action === 'reject';
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSubmit(comment);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar la revisión.'));
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-ink-700 bg-ink-900 p-6 shadow-xl">
        <h3 className="font-display text-lg text-paper-100">{isReject ? 'Rechazar solicitud' : 'Aprobar solicitud'}</h3>
        <p className="mt-2 text-sm text-paper-100/70">
          {leaveTypes[request.type]} de {request.employeeName}: {formatDate(request.startDate)} – {formatDate(request.endDate)} ({request.days} días hábiles).
        </p>
        <label className="mt-4 block text-sm">
          <span className="mb-1.5 block text-paper-100/70">Comentario {isReject ? '(obligatorio)' : '(opcional)'}</span>
          <textarea className="input min-h-[80px]" maxLength={300} value={comment} onChange={(e) => setComment(e.target.value)} required={isReject} />
        </label>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-clay-500/30 bg-clay-500/10 px-3 py-2.5 text-sm text-clay-500">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-sm text-paper-100/70 transition hover:text-paper-100">Cancelar</button>
          <button
            type="submit"
            disabled={saving}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:opacity-60 ${
              isReject ? 'bg-clay-500 hover:bg-clay-600' : 'bg-sage-500 hover:bg-sage-600'
            }`}
          >
            {saving && <Spinner size={14} />}
            {isReject ? 'Rechazar' : 'Aprobar'}
          </button>
        </div>
      </form>
    </div>
  );
}
