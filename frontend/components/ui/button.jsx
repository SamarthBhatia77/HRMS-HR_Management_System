import { cn } from "@/lib/cn";

export function Button({ className, ...props }) {
  return (
    <button
      className={cn("rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900", className)}
      {...props}
    />
  );
}
