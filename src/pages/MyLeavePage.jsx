import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CalendarPlus } from 'lucide-react';
import { meApi } from '../api/me';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { formatDate, leaveStatuses, leaveTypes, todayInputValue } from '../utils/labels';
import Spinner from '../components/Spinner';
import { Loading, Skeleton, SkeletonStat } from '../components/Skeleton';

const emptyForm = { type: 'Vacation', startDate: '', endDate: '', reason: '' };

function BalanceCard({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 p-5">
      <p className="text-xs uppercase tracking-wide text-paper-100/70">{label}</p>
      <p className="mt-2 font-display text-2xl text-paper-100">{value}</p>
      {hint && <p className="mt-1 text-xs text-paper-100/70">{hint}</p>}
    </div>
  );
}

export default function MyLeavePage() {
  const { showToast } = useToast();
  const [balance, setBalance] = useState(null);
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    Promise.all([meApi.getVacationBalance(), meApi.getLeaveRequests()])
      .then(([b, r]) => { setBalance(b); setRequests(r); })
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar tus ausencias.')));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      await meApi.createLeaveRequest({ ...form, reason: form.reason || undefined });
      showToast('Solicitud enviada a RH.', 'success');
      setForm(emptyForm);
      load();
    } catch (err) {
      const validation = err.response?.data?.validationErrors;
      setFormError(validation ? Object.values(validation)[0][0] : getErrorMessage(err, 'No se pudo enviar la solicitud.'));
    } finally {
      setSaving(false);
    }
  }

  async function cancel(id) {
    try {
      await meApi.cancelLeaveRequest(id);
      showToast('Solicitud cancelada.', 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo cancelar la solicitud.'), 'error');
    }
  }

  if (error) return <p className="text-sm text-clay-600">{error}</p>;
  const loaded = balance && requests;

  const today = todayInputValue();
  const canCancel = (r) => r.status === 'Pending' || (r.status === 'Approved' && r.startDate.slice(0, 10) > today);
  // Una incapacidad se puede registrar hasta 30 días después; el resto, desde hoy.
  const minStart = form.type === 'Sick'
    ? new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10)
    : today;

  return (
    <div className="max-w-4xl">
      <header className="mb-6">
        <h1 className="font-display text-3xl text-paper-100">Mis ausencias</h1>
        <p className="mt-1 text-sm text-paper-100/70">
          {balance ? `Periodo de vacaciones del ${formatDate(balance.periodStart)} al ${formatDate(balance.periodEnd)}` : 'Tu saldo de vacaciones y tus solicitudes'}
        </p>
      </header>

{!loaded ? (
        <Loading>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <SkeletonStat key={i} />)}
          </div>
          <div className="mt-6 rounded-lg border border-ink-700 bg-ink-900 p-6">
            <Skeleton className="h-5 w-40" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
            <Skeleton className="mt-4 h-10 w-full" />
          </div>
        </Loading>
      ) : (
      <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <BalanceCard label="Disponibles" value={balance.availableDays} hint="días hábiles" />
        <BalanceCard label="Corresponden" value={balance.entitledDays} hint={`${balance.yearsOfService} años de servicio (LFT)`} />
        <BalanceCard label="Aprobados" value={balance.approvedDays} />
        <BalanceCard label="Pendientes" value={balance.pendingDays} hint="en revisión por RH" />
      </div>
      {balance.entitledDays === 0 && (
        <p className="mt-3 text-xs text-paper-100/70">Las vacaciones se generan al cumplir tu primer año de servicio. Mientras tanto puedes pedir permisos o registrar incapacidades.</p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 rounded-lg border border-ink-700 bg-ink-900 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg text-paper-100">
          <CalendarPlus className="h-5 w-5 text-gold-500" strokeWidth={1.75} />
          Nueva solicitud
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1.5 block text-paper-100/70">Tipo</span>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(leaveTypes).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-paper-100/70">Desde</span>
            <input type="date" className="input" min={minStart} value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value, endDate: form.endDate && form.endDate < e.target.value ? e.target.value : form.endDate })} required />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-paper-100/70">Hasta</span>
            <input type="date" className="input" min={form.startDate || minStart} value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          </label>
        </div>
        <label className="mt-4 block text-sm">
          <span className="mb-1.5 block text-paper-100/70">Motivo (opcional)</span>
          <input className="input" maxLength={300} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </label>

        {formError && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-clay-500/30 bg-clay-500/10 px-3 py-2.5 text-sm text-clay-600">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" strokeWidth={1.75} />
            <span>{formError}</span>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-paper-100/70">Solo se cuentan días hábiles (lunes a viernes).</p>
          <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-gold-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gold-400 disabled:opacity-60">
            {saving && <Spinner size={16} />}
            Enviar a RH
          </button>
        </div>
      </form>

      <h2 className="mt-8 font-display text-lg text-paper-100">Mis solicitudes</h2>

      {/* Móvil: tarjetas; en una tabla de 640 px el estado y "Cancelar" quedaban fuera de la pantalla. */}
      <ul className="mt-3 space-y-3 sm:hidden">
        {requests.length === 0 ? (
          <li className="rounded-lg border border-ink-700 bg-ink-900 py-10 text-center text-sm text-paper-100/70">Aún no tienes solicitudes.</li>
        ) : (
          requests.map((r) => {
            const status = leaveStatuses[r.status] ?? leaveStatuses.Pending;
            return (
              <li key={r.id} className="rounded-lg border border-ink-700 bg-ink-900 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-paper-100">{leaveTypes[r.type] ?? r.type}</p>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs ${status.classes}`}>{status.label}</span>
                </div>
                <p className="mt-1 text-sm text-paper-100/70">{formatDate(r.startDate)} – {formatDate(r.endDate)} · {r.days} {r.days === 1 ? 'día' : 'días'}</p>
                {r.reason && <p className="mt-1 text-sm text-paper-100/70">{r.reason}</p>}
                {r.reviewComment && <p className="mt-2 rounded-md bg-ink-800 px-3 py-2 text-sm text-paper-100/70">RH: “{r.reviewComment}”</p>}
                {canCancel(r) && (
                  <button onClick={() => cancel(r.id)} className="mt-3 w-full rounded-md border border-ink-600 py-2.5 text-sm text-clay-600">Cancelar solicitud</button>
                )}
              </li>
            );
          })
        )}
      </ul>

      <div className="mt-3 hidden overflow-x-auto rounded-lg border border-ink-700 bg-ink-900 sm:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-paper-100/70">
              <th className="px-5 py-3 font-normal">Tipo</th>
              <th className="px-5 py-3 font-normal">Fechas</th>
              <th className="px-5 py-3 font-normal">Días</th>
              <th className="px-5 py-3 font-normal">Estado</th>
              <th className="px-5 py-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan={5} className="py-10 text-center text-paper-100/70">Aún no tienes solicitudes.</td></tr>
            ) : (
              requests.map((r) => {
                const status = leaveStatuses[r.status] ?? leaveStatuses.Pending;
                return (
                  <tr key={r.id} className="border-b border-ink-700/60 last:border-0">
                    <td className="px-5 py-3 text-paper-100">
                      {leaveTypes[r.type] ?? r.type}
                      {r.reason && <p className="text-xs text-paper-100/70">{r.reason}</p>}
                    </td>
                    <td className="px-5 py-3 text-paper-100/70">{formatDate(r.startDate)} – {formatDate(r.endDate)}</td>
                    <td className="px-5 py-3 text-paper-100/70">{r.days}</td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${status.classes}`}>{status.label}</span>
                      {r.reviewComment && <p className="mt-1 text-xs text-paper-100/70">“{r.reviewComment}”</p>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {canCancel(r) && (
                        <button onClick={() => cancel(r.id)} className="text-xs text-paper-100/70 transition hover:text-clay-600">Cancelar</button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
}
