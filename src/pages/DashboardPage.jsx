import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { Users, Wallet, TrendingDown, Hourglass, FileSpreadsheet, FileText } from 'lucide-react';
import { terminationReasons } from '../utils/labels';
import { departmentsApi } from '../api/departments';
import { dashboardApi } from '../api/dashboard';
import { reportsApi } from '../api/reports';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import Spinner from '../components/Spinner';
import { colors } from '../theme';
import { Loading, Skeleton, SkeletonStat } from '../components/Skeleton';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
// Montos cortos para ejes y etiquetas de barras ($70.5 mil). Intl con notation: 'compact' da "70.5 k$" en es-MX.
const shortNumber = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 });
function compactMoney(value) {
  if (Math.abs(value) >= 1_000_000) return `$${shortNumber.format(value / 1_000_000)} M`;
  if (Math.abs(value) >= 1_000) return `$${shortNumber.format(value / 1_000)} mil`;
  return `$${shortNumber.format(value)}`;
}

// Sin animación de entrada en las gráficas si el sistema pide reducir el movimiento.
const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const chartAxisStyle = { fill: colors.foreground.muted, fontSize: 12 };
const chartTooltipStyle = { background: colors.surface, border: `1px solid ${colors.subtle}`, borderRadius: 8, fontSize: 13, boxShadow: '0 4px 12px rgba(28,36,51,0.08)' };

function StatCard({ icon: Icon, label, value, hint, accent = 'gold' }) {
  const accentClasses = { gold: 'text-primary', sage: 'text-success-strong', clay: 'text-danger-strong' };
  return (
    <div className="bg-surface p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-foreground-muted">{label}</p>
        <Icon className={`h-4 w-4 ${accentClasses[accent]}`} strokeWidth={1.75} />
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums text-foreground sm:mt-3 sm:text-2xl">{value}</p>
      {hint && <p className="mt-1 text-xs text-foreground-muted">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    Promise.all([departmentsApi.summary(), dashboardApi.getKpis()])
      .then(([summaryData, kpisData]) => {
        setSummary(summaryData);
        setKpis(kpisData);
      })
      .catch((err) => setError(getErrorMessage(err, 'No se pudo cargar el resumen general.')));
  }, []);

  async function handleExport(type) {
    setExporting(type);
    try {
      if (type === 'excel') await reportsApi.exportDepartmentsExcel();
      if (type === 'pdf') await reportsApi.exportDepartmentsPdf();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo generar el archivo de exportación.'), 'error');
    } finally {
      setExporting('');
    }
  }

  if (error) return <p className="text-sm text-danger-strong">{error}</p>;
  const loaded = summary && kpis;

  const totalPayroll = loaded ? summary.reduce((sum, d) => sum + d.totalPayroll, 0) : 0;
  const payrollChartData = (summary ?? []).map((d) => ({ name: d.departmentName, nómina: Math.round(d.totalPayroll) }));
  const hiringChartData = (kpis?.hiringTrend ?? []).map((h) => ({ mes: h.monthLabel, altas: h.hires, bajas: h.terminations }));

  return (
    <div>
      <header className="membrete mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-foreground">Resumen general</h1>
          <p className="mt-1 text-sm text-foreground-muted">Datos agregados por departamento y tendencias de los últimos 12 meses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting !== ''}
            className="flex items-center gap-2 rounded-md border border-outline bg-surface px-3.5 py-2 text-sm text-foreground/80 transition hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {exporting === 'excel' ? <Spinner size={14} /> : <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} />}
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== ''}
            className="flex items-center gap-2 rounded-md border border-outline bg-surface px-3.5 py-2 text-sm text-foreground/80 transition hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {exporting === 'pdf' ? <Spinner size={14} /> : <FileText className="h-4 w-4" strokeWidth={1.75} />}
            PDF
          </button>
        </div>
      </header>

{!loaded ? (
        <Loading>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-outline bg-outline lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <SkeletonStat key={i} />)}
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-lg border border-outline bg-surface p-6">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="mt-2 h-3 w-24" />
                <Skeleton className="mt-5 h-64 w-full" />
              </div>
            ))}
          </div>
        </Loading>
      ) : (
      <>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-outline bg-outline lg:grid-cols-4">
        <StatCard icon={Users} label="Plantilla activa" value={kpis.activeHeadcount} hint={`${summary.length} departamentos`} accent="sage" />
        <StatCard
          icon={TrendingDown}
          label="Rotación 12 meses"
          value={`${kpis.turnoverRatePercent}%`}
          hint={kpis.averageHeadcount != null
            ? `${kpis.terminationsLast12Months} bajas · plantilla promedio ${kpis.averageHeadcount}`
            : `${kpis.terminationsLast12Months} bajas sobre la plantilla promedio`}
          accent="clay"
        />
        <StatCard icon={Hourglass} label="Antigüedad promedio" value={`${kpis.averageTenureYears} años`} hint="Empleados activos" />
        <StatCard icon={Wallet} label="Nómina mensual total" value={currency.format(totalPayroll)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-outline bg-surface p-6">
          <h2 className="font-display text-lg text-foreground">Altas y bajas por mes</h2>
          <p className="mt-0.5 text-xs text-foreground-muted">Últimos 12 meses</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hiringChartData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.subtle} vertical={false} />
                <XAxis dataKey="mes" tick={chartAxisStyle} axisLine={{ stroke: colors.subtle }} tickLine={false} />
                <YAxis allowDecimals={false} tick={chartAxisStyle} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: colors.foreground.DEFAULT }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line isAnimationActive={!reduceMotion} type="linear" dataKey="altas" stroke={colors.primary.DEFAULT} strokeWidth={2.5} dot={{ r: 3, fill: colors.primary.DEFAULT }} />
                <Line isAnimationActive={!reduceMotion} type="linear" dataKey="bajas" stroke={colors.danger.strong} strokeWidth={2.5} dot={{ r: 3, fill: colors.danger.strong }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {kpis.terminationsByReason.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="text-foreground-muted">Bajas por motivo:</span>
              {kpis.terminationsByReason.map((r) => (
                <span key={r.reason} className="rounded-full bg-danger/10 px-2.5 py-0.5 text-danger-strong">
                  {terminationReasons[r.reason] ?? r.reason}: {r.count}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-outline bg-surface p-6">
          <h2 className="font-display text-lg text-foreground">Nómina por departamento</h2>
          <p className="mt-0.5 text-xs text-foreground-muted">Solo empleados activos</p>
          <div className="mt-5" style={{ height: Math.max(payrollChartData.length * 44, 160) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollChartData} layout="vertical" margin={{ left: 0, right: 56 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.subtle} horizontal={false} />
                <XAxis type="number" tickFormatter={compactMoney} tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={118} interval={0} tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => currency.format(value)} contentStyle={chartTooltipStyle} labelStyle={{ color: colors.foreground.DEFAULT }} cursor={{ fill: colors.muted }} />
                <Bar isAnimationActive={!reduceMotion} dataKey="nómina" fill={colors.primary.DEFAULT} radius={[0, 4, 4, 0]} barSize={20}>
                  <LabelList dataKey="nómina" position="right" formatter={compactMoney} style={{ fill: colors.foreground.muted, fontSize: 12 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-outline bg-surface">
        <table className="w-full tabular-nums min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink/60 bg-muted/60 text-left text-xs font-medium text-foreground-muted">
              <th className="px-5 py-3 font-normal">Departamento</th>
              <th className="px-5 py-3 font-normal">Total</th>
              <th className="px-5 py-3 font-normal">Activos</th>
              <th className="px-5 py-3 font-normal">Salario promedio</th>
              <th className="px-5 py-3 font-normal">Nómina total</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((d) => (
              <tr key={d.departmentId} className="border-b border-subtle/60 last:border-0">
                <td className="px-5 py-3 text-foreground">{d.departmentName}</td>
                <td className="px-5 py-3 text-foreground-muted">{d.totalEmployees}</td>
                <td className="px-5 py-3 text-foreground-muted">{d.activeEmployees}</td>
                <td className="px-5 py-3 text-foreground-muted">{currency.format(d.averageSalary)}</td>
                <td className="px-5 py-3 text-foreground-muted">{currency.format(d.totalPayroll)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
}
