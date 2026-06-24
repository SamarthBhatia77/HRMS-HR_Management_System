"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/auth-storage";
import { Button } from "@/components/ui/button";

export default function PayrollPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editing Drawer State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fetchingPayroll, setFetchingPayroll] = useState(false);
  const [savingPayroll, setSavingPayroll] = useState(false);
  const [drawerError, setDrawerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Payroll Form State
  const [baseSalary, setBaseSalary] = useState("");
  const [hra, setHra] = useState("0");
  const [transportAllowance, setTransportAllowance] = useState("0");
  const [otherAllowance, setOtherAllowance] = useState("0");

  useEffect(() => {
    const activeSession = getSession();
    if (!activeSession) {
      router.push("/login");
      return;
    }
    setSession(activeSession);
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch("/employees");
      if (res.success && res.data) {
        setEmployees(res.data);
      } else {
        setError(res.message || "Failed to fetch employees.");
      }
    } catch (err) {
      setError(err.message || "An error occurred while loading employees.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenEdit(employee) {
    setSelectedEmployee(employee);
    setIsDrawerOpen(true);
    setDrawerError("");
    setSuccessMsg("");
    setFetchingPayroll(true);
    setBaseSalary("");
    setHra("0");
    setTransportAllowance("0");
    setOtherAllowance("0");

    try {
      const res = await apiFetch(`/payroll/employee/${employee.id}`);
      if (res.success) {
        if (res.data) {
          setBaseSalary(res.data.baseSalary || "");
          setHra(res.data.hra || "0");
          setTransportAllowance(res.data.transportAllowance || "0");
          setOtherAllowance(res.data.otherAllowance || "0");
        } else {
          // If no salary structure exists yet, default base salary to empty or a basic value
          setBaseSalary("");
          setHra("0");
          setTransportAllowance("0");
          setOtherAllowance("0");
        }
      } else {
        setDrawerError(res.message || "Failed to load salary structure details.");
      }
    } catch (err) {
      setDrawerError(err.message || "Could not fetch salary structure.");
    } finally {
      setFetchingPayroll(false);
    }
  }

  async function handleSavePayroll(e) {
    e.preventDefault();
    if (!selectedEmployee) return;

    setSavingPayroll(true);
    setDrawerError("");
    setSuccessMsg("");

    if (!baseSalary || parseFloat(baseSalary) < 0) {
      setDrawerError("Base Salary is required and must be non-negative.");
      setSavingPayroll(false);
      return;
    }

    try {
      const payload = {
        baseSalary: parseFloat(baseSalary),
        hra: parseFloat(hra || "0"),
        transportAllowance: parseFloat(transportAllowance || "0"),
        otherAllowance: parseFloat(otherAllowance || "0"),
      };

      const res = await apiFetch(`/payroll/employee/${selectedEmployee.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccessMsg(`Salary structure for ${selectedEmployee.fullName} has been successfully updated!`);
        setTimeout(() => {
          setIsDrawerOpen(false);
          setSuccessMsg("");
          setSelectedEmployee(null);
        }, 3000);
      } else {
        setDrawerError(res.message || "Failed to update salary structure.");
      }
    } catch (err) {
      setDrawerError(err.message || "An error occurred while saving.");
    } finally {
      setSavingPayroll(false);
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500 dark:text-slate-400">
        Checking authentication session...
      </div>
    );
  }

  const isHrAdmin = session.role === "HR_ADMIN";

  if (!isHrAdmin) {
    return (
      <div className="p-6 text-center text-red-500 font-semibold">
        Access Denied: You do not have permissions to view this portal.
      </div>
    );
  }

  // Filter employees locally by name or email or department
  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      emp.fullName.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query) ||
      emp.designation.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 relative min-h-[80vh] animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Payroll Management</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Review company payroll details, search employees, and modify salary structure components.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="flex max-w-md items-center gap-2">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search employee by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
          />
          <svg className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Roster Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {loading ? (
          <div className="flex py-12 items-center justify-center text-slate-500 dark:text-slate-400">
            <div className="h-6 w-6 border-2 border-violet-650 border-t-transparent rounded-full animate-spin mr-2" />
            Loading employee payroll roster...
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex flex-col py-16 items-center justify-center text-slate-550 dark:text-slate-450 space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-slate-400 dark:text-slate-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <p className="font-semibold text-slate-900 dark:text-slate-100">No employees found</p>
            <p className="text-sm">Try broadening your search term or verifying the roster.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500 dark:text-slate-400">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-bold uppercase text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-4">Name</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Email</th>
                  <th scope="col" className="px-6 py-4">Department / Designation</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{emp.fullName}</td>
                    <td className="px-6 py-4">{emp.email}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900 dark:text-slate-100 font-medium">{emp.department}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">{emp.designation}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        emp.employmentStatus === "ACTIVE"
                          ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30"
                          : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30"
                      }`}>
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="px-3.5 py-1.5 rounded-xl border border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/30 text-brand-700 dark:text-brand-400 text-xs font-bold transition-all"
                      >
                        Edit Payroll
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side Edit Drawer */}
      {isDrawerOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => {
                if (!savingPayroll) setIsDrawerOpen(false);
              }}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-slate-900 py-6 shadow-2xl">
                  {/* Drawer Header */}
                  <div className="px-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100" id="slide-over-title">
                          Modify Payroll Structure
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {selectedEmployee.fullName} · {selectedEmployee.designation}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        disabled={savingPayroll}
                        className="rounded-md text-slate-400 hover:text-slate-500 dark:hover:text-slate-350 focus:outline-none"
                      >
                        <span className="sr-only">Close panel</span>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Drawer Content */}
                  <div className="relative mt-6 flex-1 px-6">
                    {drawerError && (
                      <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-3.5 text-xs text-red-750 dark:text-red-400 font-medium">
                        {drawerError}
                      </div>
                    )}
                    {successMsg && (
                      <div className="mb-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 p-3.5 text-xs text-green-700 dark:text-green-400 font-medium">
                        {successMsg}
                      </div>
                    )}

                    {fetchingPayroll ? (
                      <div className="flex py-16 items-center justify-center text-slate-500 dark:text-slate-400">
                        <div className="h-5 w-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-2" />
                        Fetching current salary details...
                      </div>
                    ) : (
                      <form onSubmit={handleSavePayroll} className="space-y-5">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Base Salary ($ / yr) *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={baseSalary}
                            onChange={(e) => setBaseSalary(e.target.value)}
                            placeholder="e.g. 85000"
                            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-950 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">HRA ($ / yr)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={hra}
                            onChange={(e) => setHra(e.target.value)}
                            placeholder="0"
                            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-950 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Transport Allowance ($ / yr)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={transportAllowance}
                            onChange={(e) => setTransportAllowance(e.target.value)}
                            placeholder="0"
                            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-950 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Other Allowance ($ / yr)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={otherAllowance}
                            onChange={(e) => setOtherAllowance(e.target.value)}
                            placeholder="0"
                            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 px-3.5 py-2.5 text-sm text-slate-950 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                          />
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setIsDrawerOpen(false)}
                            disabled={savingPayroll}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-350 text-sm font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingPayroll}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-700 to-indigo-700 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                          >
                            {savingPayroll && (
                              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            )}
                            Save Details
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
