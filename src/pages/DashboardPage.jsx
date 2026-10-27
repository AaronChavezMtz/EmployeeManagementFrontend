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

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
// Montos cortos para ejes y etiquetas de barras ($70.5 mil). Intl con notation: 'compact' da "70.5 k$" en es-MX.
const shortNumber = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 });
function compactMoney(value) {
  if (Math.abs(value) >= 1_000_000) return `$${shortNumber.format(value / 1_000_000)} M`;
  if (Math.abs(value) >= 1_000) return `$${shortNumber.format(value / 1_000)} mil`;
  return `$${shortNumber.format(value)}`;
}

const chartAxisStyle = { fill: '#6B7280', fontSize: 12 };
const chartTooltipStyle = { background: '#FFFFFF', border: '1px solid #E3E6EC', borderRadius: 8, fontSize: 13, boxShadow: '0 4px 12px rgba(28,36,51,0.08)' };

function StatCard({ icon: Icon, label, value, hint, accent = 'gold' }) {
  const accentClasses = { gold: 'text-gold-500', sage: 'text-sage-500', clay: 'text-clay-500' };
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-paper-100/40">{label}</p>
        <Icon className={`h-4 w-4 ${accentClasses[accent]}`} strokeWidth={1.75} />
      </div>
      <p className="mt-3 font-display text-2xl text-paper-100">{value}</p>
      {hint && <p className="mt-1 text-xs text-paper-100/40">{hint}</p>}
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

  if (error) return <p className="text-sm text-clay-500">{error}</p>;
  if (!summary || !kpis) return <div className="flex justify-center pt-20"><Spinner size={28} /></div>;

  const totalPayroll = summary.reduce((sum, d) => sum + d.totalPayroll, 0);
  const payrollChartData = summary.map((d) => ({ name: d.departmentName, nómina: Math.round(d.totalPayroll) }));
  const hiringChartData = kpis.hiringTrend.map((h) => ({ mes: h.monthLabel, altas: h.hires, bajas: h.terminations }));

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-paper-100">Resumen general</h1>
          <p className="mt-1 text-sm text-paper-100/50">Datos agregados por departamento y tendencias de los últimos 12 meses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting !== ''}
            className="flex items-center gap-2 rounded-md border border-ink-600 bg-ink-900 px-3.5 py-2 text-sm text-paper-100/80 transition hover:border-gold-500 hover:text-gold-500 disabled:opacity-50"
          >
            {exporting === 'excel' ? <Spinner size={14} /> : <FileSpreadsheet className="h-4 w-4" strokeWidth={1.75} />}
            Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== ''}
            className="flex items-center gap-2 rounded-md border border-ink-600 bg-ink-900 px-3.5 py-2 text-sm text-paper-100/80 transition hover:border-gold-500 hover:text-gold-500 disabled:opacity-50"
          >
            {exporting === 'pdf' ? <Spinner size={14} /> : <FileText className="h-4 w-4" strokeWidth={1.75} />}
            PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="rounded-lg border border-ink-700 bg-ink-900 p-6">
          <h2 className="font-display text-lg text-paper-100">Altas y bajas por mes</h2>
          <p className="mt-0.5 text-xs text-paper-100/40">Últimos 12 meses</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hiringChartData} margin={{ left: -10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" vertical={false} />
                <XAxis dataKey="mes" tick={chartAxisStyle} axisLine={{ stroke: '#E3E6EC' }} tickLine={false} />
                <YAxis allowDecimals={false} tick={chartAxisStyle} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: '#1C2433' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="linear" dataKey="altas" stroke="#2F5BD1" strokeWidth={2.5} dot={{ r: 3, fill: '#2F5BD1' }} />
                <Line type="linear" dataKey="bajas" stroke="#D64545" strokeWidth={2.5} dot={{ r: 3, fill: '#D64545' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {kpis.terminationsByReason.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="text-paper-100/40">Bajas por motivo:</span>
              {kpis.terminationsByReason.map((r) => (
                <span key={r.reason} className="rounded-full bg-clay-500/10 px-2.5 py-0.5 text-clay-600">
                  {terminationReasons[r.reason] ?? r.reason}: {r.count}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-ink-700 bg-ink-900 p-6">
          <h2 className="font-display text-lg text-paper-100">Nómina por departamento</h2>
          <p className="mt-0.5 text-xs text-paper-100/40">Solo empleados activos</p>
          <div className="mt-5" style={{ height: Math.max(payrollChartData.length * 44, 160) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={payrollChartData} layout="vertical" margin={{ left: 0, right: 56 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" horizontal={false} />
                <XAxis type="number" tickFormatter={compactMoney} tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={118} interval={0} tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => currency.format(value)} contentStyle={chartTooltipStyle} labelStyle={{ color: '#1C2433' }} cursor={{ fill: '#F1F3F7' }} />
                <Bar dataKey="nómina" fill="#2F5BD1" radius={[0, 4, 4, 0]} barSize={20}>
                  <LabelList dataKey="nómina" position="right" formatter={compactMoney} style={{ fill: '#4B5563', fontSize: 12 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-ink-700 bg-ink-900">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-left text-xs uppercase tracking-wide text-paper-100/40">
              <th className="px-5 py-3 font-normal">Departamento</th>
              <th className="px-5 py-3 font-normal">Total</th>
              <th className="px-5 py-3 font-normal">Activos</th>
              <th className="px-5 py-3 font-normal">Salario promedio</th>
              <th className="px-5 py-3 font-normal">Nómina total</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((d) => (
              <tr key={d.departmentId} className="border-b border-ink-700/60 last:border-0">
                <td className="px-5 py-3 text-paper-100">{d.departmentName}</td>
                <td className="px-5 py-3 text-paper-100/70">{d.totalEmployees}</td>
                <td className="px-5 py-3 text-paper-100/70">{d.activeEmployees}</td>
                <td className="px-5 py-3 text-paper-100/70">{currency.format(d.averageSalary)}</td>
                <td className="px-5 py-3 text-paper-100/70">{currency.format(d.totalPayroll)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
