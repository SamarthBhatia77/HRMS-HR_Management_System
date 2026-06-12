import { cn } from "@/lib/cn";

const inputClassName =
  "mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function AuthField({ label, error, className, children, ...props }) {
  if (children) {
    return (
      <label className={cn("block text-sm font-medium text-slate-700", className)}>
        {label}
        {children}
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </label>
    );
  }

  return (
    <label className={cn("block text-sm font-medium text-slate-700", className)}>
      {label}
      <input className={inputClassName} {...props} />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}

export function AuthTextarea({ label, error, className, ...props }) {
  return (
    <label className={cn("block text-sm font-medium text-slate-700", className)}>
      {label}
      <textarea className={cn(inputClassName, "min-h-[88px] resize-y")} {...props} />
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}

export function AuthSelect({ label, error, className, children, ...props }) {
  return (
    <label className={cn("block text-sm font-medium text-slate-700", className)}>
      {label}
      <select className={inputClassName} {...props}>
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}
