import Link from "next/link";

export function AuthCard({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-10">
      <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-brand-700">HRMS</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
        {children}
        {footer ? <div className="mt-6 border-t border-slate-100 pt-4 text-center text-sm text-slate-600">{footer}</div> : null}
      </section>
    </main>
  );
}

export function AuthLink({ href, children }) {
  return (
    <Link href={href} className="font-medium text-brand-700 hover:text-brand-900">
      {children}
    </Link>
  );
}
