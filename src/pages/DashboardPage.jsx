import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Building2, Wallet, TrendingUp } from 'lucide-react';
import { departmentsApi } from '../api/departments';
import Spinner from '../components/Spinner';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

function StatCard({ icon: Icon, label, value, accent = 'gold' }) {
  const accentClasses = {
    gold: 'text-gold-500',
    sage: 'text-sage-500',
    clay: 'text-clay-500',
  };
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-paper-100/40">{label}</p>
        <Icon className={`h-4 w-4 ${accentClasses[accent]}`} strokeWidth={1.75} />
      </div>
      <p className="mt-3 font-display text-2xl text-paper-100">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    departmentsApi
      .summary()
      .then(setSummary)
      .catch(() => setError('No se pudo cargar el resumen por departamento.'));
  }, []);

  if (error) return <p className="text-sm text-clay-500">{error}</p>;
  if (!summary) return <div className="flex justify-center pt-20"><Spinner size={28} /></div>;

  const totalEmployees = summary.reduce((sum, d) => sum + d.totalEmployees, 0);
  const totalActive = summary.reduce((sum, d) => sum + d.activeEmployees, 0);
  const totalPayroll = summary.reduce((sum, d) => sum + d.totalPayroll, 0);

  const chartData = summary.map((d) => ({
    name: d.departmentName,
    nómina: Math.round(d.totalPayroll),
  }));

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl text-paper-100">Resumen general</h1>
        <p className="mt-1 text-sm text-paper-100/50">
          Datos agregados desde la vista <code className="text-paper-100/70">vw_DepartmentSummary</code>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Departamentos" value={summary.length} />
        <StatCard icon={Users} label="Empleados totales" value={totalEmployees} accent="sage" />
        <StatCard icon={TrendingUp} label="Empleados activos" value={totalActive} accent="sage" />
        <StatCard icon={Wallet} label="Nómina mensual total" value={currency.format(totalPayroll)} accent="clay" />
      </div>

      <div className="mt-8 rounded-lg border border-ink-700 bg-ink-900 p-6">
        <h2 className="font-display text-lg text-paper-100">Nómina por departamento</h2>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262A34" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#8B8F99', fontSize: 12 }} axisLine={{ stroke: '#343945' }} tickLine={false} />
              <YAxis tick={{ fill: '#8B8F99', fontSize: 12 }} axisLine={false} tickLine={false} width={70} />
              <Tooltip
                formatter={(value) => currency.format(value)}
                contentStyle={{ background: '#1C1F27', border: '1px solid #343945', borderRadius: 8, fontSize: 13 }}
                labelStyle={{ color: '#F6F4EF' }}
              />
              <Bar dataKey="nómina" fill="#C9A15A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
        <table className="w-full text-sm">
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
