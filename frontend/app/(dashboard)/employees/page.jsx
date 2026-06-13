"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/auth-storage";
import { Button } from "@/components/ui/button";

export default function EmployeesPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [managerId, setManagerId] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
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
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const empRes = await apiFetch("/employees");
      if (empRes.success) {
        setEmployees(empRes.data);
      }
      
      const mgrRes = await apiFetch("/employees/managers");
      if (mgrRes.success) {
        setManagers(mgrRes.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOnboard(e) {
    e.preventDefault();
    setFormError("");
    setSuccessMsg("");
    setSubmitting(true);

    if (!fullName || !email || !department || !designation || !joiningDate || !baseSalary) {
      setFormError("All required fields must be filled.");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        fullName,
        email,
        department,
        designation,
        joiningDate,
        managerId: managerId || null,
        role,
        baseSalary: parseFloat(baseSalary),
        hra: parseFloat(hra || "0"),
        transportAllowance: parseFloat(transportAllowance || "0"),
        otherAllowance: parseFloat(otherAllowance || "0"),
      };

      const res = await apiFetch("/employees", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccessMsg(`Employee ${fullName} successfully onboarded!\n\nCheck the backend server console/logs for the activation link.`);
        // Refresh employees list
        fetchData();
        // Reset form
        setFullName("");
        setEmail("");
        setDepartment("");
        setDesignation("");
        setJoiningDate("");
        setManagerId("");
        setRole("EMPLOYEE");
        setBaseSalary("");
        setHra("0");
        setTransportAllowance("0");
        setOtherAllowance("0");
        
        // Close drawer after short delay
        setTimeout(() => {
          setIsDrawerOpen(false);
          setSuccessMsg("");
        }, 5000);
      } else {
        setFormError(res.message || "Failed to onboard employee.");
      }
    } catch (err) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!session) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
        Checking authentication session...
      </div>
    );
  }

  const isHrAdmin = session.role === "HR_ADMIN";

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      {/* Header section */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employees Directory</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your company roster, roles, departments, and basic salaries.
          </p>
        </div>
        {isHrAdmin && (
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Onboard Employee
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Roster table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex py-12 items-center justify-center text-slate-500">
            Loading employees directory...
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col py-16 items-center justify-center text-slate-500 space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m0 0L6 18c0-3.37 2.73-6.1 6.1-6.1 2.21 0 4.19 1.18 5.3 2.95m-11.4 0A6.07 6.07 0 0112 11.9m0-3.82a3.82 3.82 0 100-7.64 3.82 3.82 0 000 7.64zm7.64 7.64a3.82 3.82 0 100-7.64 3.82 3.82 0 000 7.64z" />
            </svg>
            <p className="font-medium text-slate-900">No employees found</p>
            <p className="text-sm">HR Admins can onboard new employees using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-4">Name</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4">Department / Designation</th>
                  <th scope="col" className="px-6 py-4">Role</th>
                  <th scope="col" className="px-6 py-4">Manager</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 border-t border-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{emp.fullName}</td>
                    <td className="px-6 py-4">{emp.email}</td>
                    <td className="px-6 py-4">
                      <div className="text-slate-900">{emp.department}</div>
                      <div className="text-xs text-slate-400">{emp.designation}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 uppercase">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{emp.managerName || "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          emp.employmentStatus === "ACTIVE"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setIsDrawerOpen(false)}
            />

            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-lg">
                <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-2xl">
                  <div className="px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-semibold text-slate-900" id="slide-over-title">
                        Onboard New Employee
                      </h2>
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
                      >
                        <span className="sr-only">Close panel</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      Fill in the details. A temporary password and password setup link will be generated.
                    </p>
                  </div>

                  {/* Onboarding Form */}
                  <form onSubmit={handleOnboard} className="relative mt-6 flex-1 px-6 space-y-5">
                    {formError && (
                      <div className="rounded-md bg-red-50 p-3 text-xs text-red-700 font-medium">
                        {formError}
                      </div>
                    )}
                    {successMsg && (
                      <div className="rounded-md bg-green-50 p-4 text-xs text-green-700 font-medium whitespace-pre-line border border-green-200">
                        {successMsg}
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Basic Information</h3>
                      <div>
                        <label className="block text-xs font-medium text-slate-700">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Jane Doe"
                          className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="jane.doe@company.com"
                          className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700">Department *</label>
                          <input
                            type="text"
                            required
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Engineering"
                            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700">Designation *</label>
                          <input
                            type="text"
                            required
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="Software Engineer"
                            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700">Joining Date *</label>
                          <input
                            type="date"
                            required
                            value={joiningDate}
                            onChange={(e) => setJoiningDate(e.target.value)}
                            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700">Role *</label>
                          <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                            <option value="HR_ADMIN">HR Admin</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700">Reporting Manager</label>
                        <select
                          value={managerId}
                          onChange={(e) => setManagerId(e.target.value)}
                          className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">Select Reporting Manager (Optional)</option>
                          {managers.map((mgr) => (
                            <option key={mgr.id} value={mgr.id}>
                              {mgr.fullName} ({mgr.designation} - {mgr.department})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Base Salary Components</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700">Base Salary ($ / yr) *</label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={baseSalary}
                            onChange={(e) => setBaseSalary(e.target.value)}
                            placeholder="80000"
                            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700">HRA ($ / yr)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={hra}
                            onChange={(e) => setHra(e.target.value)}
                            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-700">Transport Allowance ($ / yr)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={transportAllowance}
                            onChange={(e) => setTransportAllowance(e.target.value)}
                            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700">Other Allowances ($ / yr)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={otherAllowance}
                            onChange={(e) => setOtherAllowance(e.target.value)}
                            className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                      <Button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        className="rounded-md border border-slate-300 bg-[#bd0d00] px-4 py-2 text-sm font-medium text-red shadow-sm hover:bg-[#cf4238]"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-400"
                      >
                        {submitting ? "Onboarding..." : "Onboard Employee"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
