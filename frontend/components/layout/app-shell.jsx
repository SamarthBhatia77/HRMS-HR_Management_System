const navItems = [
  ["Dashboard", "/dashboard"],
  ["Attendance", "/attendance"],
  ["Leaves", "/leaves"],
  ["Payroll", "/payroll"],
  ["Employees", "/employees"],
];

export function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white p-5 md:block">
        <div className="text-lg font-semibold text-brand-900">HRMS</div>
        <nav className="mt-8 space-y-1">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              {label}
            </a>
          ))}
        </nav>
      </aside>
      <div className="md:pl-64">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">HR Operations Workspace</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">HR Admin</span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
