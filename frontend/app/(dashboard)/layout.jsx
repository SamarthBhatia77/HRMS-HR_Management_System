"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth-storage";
import { AppShell } from "@/components/layout/app-shell";
import { EmployeeShell } from "@/components/layout/employee-shell";

export default function DashboardLayout({ children }) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const session = getSession();
    // Default to EMPLOYEE if no session role found (graceful fallback)
    setRole(session?.role ?? "EMPLOYEE");
  }, []);

  // Show a minimal loader while the role resolves from localStorage
  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-[3px] border-violet-200 border-t-violet-600 animate-spin" />
          <p className="text-sm text-slate-400">Loading your workspace…</p>
        </div>
      </div>
    );
  }

  if (role === "HR_ADMIN") {
    return <AppShell>{children}</AppShell>;
  }

  // EMPLOYEE or MANAGER
  return <EmployeeShell>{children}</EmployeeShell>;
}
