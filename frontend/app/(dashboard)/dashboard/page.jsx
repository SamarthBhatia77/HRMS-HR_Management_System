const metrics = [
  ["Present Today", "42"],
  ["Pending Leaves", "8"],
  ["Overtime Flags", "5"],
  ["Payroll Ready", "91%"],
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Attendance, leave, payroll, and HR operations overview.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {metrics.map(([label, value]) => (
          <article key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
