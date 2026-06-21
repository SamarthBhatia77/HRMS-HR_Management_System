"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

/* ─── Mock Data ──────────────────────────────────────────────── */
const TEAM = [
  { id: "t1", name: "Priya Sharma", designation: "Senior Developer", dept: "Engineering" },
  { id: "t2", name: "Arjun Mehta", designation: "UI/UX Designer", dept: "Design" },
  { id: "t3", name: "Kavya Nair", designation: "QA Engineer", dept: "Engineering" },
  { id: "t4", name: "Rohan Gupta", designation: "Backend Developer", dept: "Engineering" },
  { id: "t5", name: "Sneha Pillai", designation: "Product Analyst", dept: "Product" },
];

const INITIAL_REPORTS = [
  {
    id: "r1",
    employeeId: "t4",
    employeeName: "Rohan Gupta",
    category: "Attendance",
    severity: "MEDIUM",
    incidentDate: "2026-06-10",
    reason: "Frequently late logging into the backend shift (past 4 consecutive days) with no prior warning or email notice.",
    createdAt: "2026-06-11",
    status: "UNDER_REVIEW",
  }
];

function ReportForm() {
  const searchParams = useSearchParams();
  const [reports, setReports] = useState(INITIAL_REPORTS);
  
  // Form state
  const [employeeId, setEmployeeId] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");
  const [category, setCategory] = useState("Performance");
  const [incidentDate, setIncidentDate] = useState("");
  const [reason, setReason] = useState("");
  
  // Feedback state
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Pre-select employee if provided in search params
  useEffect(() => {
    const empParam = searchParams.get("emp");
    if (empParam && TEAM.some((t) => t.id === empParam)) {
      setEmployeeId(empParam);
    }
  }, [searchParams]);

  function handleSubmit(e) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!employeeId) {
      setErrorMsg("Please select an employee.");
      return;
    }
    if (!incidentDate) {
      setErrorMsg("Please select an incident date.");
      return;
    }
    if (!reason || reason.trim().length < 10) {
      setErrorMsg("Please provide a detailed reason (minimum 10 characters).");
      return;
    }

    const selectedEmployee = TEAM.find((t) => t.id === employeeId);
    
    const newReport = {
      id: "r_" + Date.now(),
      employeeId,
      employeeName: selectedEmployee ? selectedEmployee.name : "Unknown Employee",
      category,
      severity,
      incidentDate,
      reason: reason.trim(),
      createdAt: new Date().toISOString().split("T")[0],
      status: "UNDER_REVIEW",
    };

    setReports([newReport, ...reports]);
    setSuccessMsg(`Report against ${newReport.employeeName} submitted to HR Admin.`);
    
    // Reset form
    setEmployeeId("");
    setIncidentDate("");
    setReason("");
    setSeverity("MEDIUM");
    setCategory("Performance");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Report Employee</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Flag performance, behavioral, or policy compliance issues directly to HR Administration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Form Column - Span 2 */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Incident & Complaint Form</h2>
            
            {successMsg && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3.5 text-xs text-emerald-800 font-medium flex items-start gap-2 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
                <span className="text-emerald-500 text-sm">✓</span>
                <div>{successMsg}</div>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-3.5 text-xs text-red-800 font-medium flex items-start gap-2 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
                <span className="text-red-500 text-sm">✕</span>
                <div>{errorMsg}</div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Employee selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Employee under review</label>
                <select
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-violet-900/30"
                >
                  <option value="">Select team member...</option>
                  {TEAM.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Incident Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Incident Date</label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-violet-900/30"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Incident Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-violet-900/30"
                >
                  <option value="Performance">Performance Issue</option>
                  <option value="Behaviour">Inappropriate Behaviour</option>
                  <option value="Policy Violation">Policy Violation</option>
                  <option value="Attendance">Attendance & Lateness</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Severity Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["LOW", "Low", "border-green-200 text-green-700 bg-[#d0f7dd] hover:bg-green-100 dark:border-green-900/50 dark:text-green-400 dark:bg-green-950/20 dark:hover:bg-green-900/30"],
                    ["MEDIUM", "Medium", "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:border-amber-900/50 dark:text-amber-400 dark:bg-amber-950/20 dark:hover:bg-amber-900/30"],
                    ["HIGH", "High", "border-red-200 text-red-700 bg-red-50 hover:bg-red-100 dark:border-red-900/50 dark:text-red-400 dark:bg-red-950/20 dark:hover:bg-red-900/30"],
                  ].map(([val, label, cls]) => {
                    const active = severity === val;
                    let activeCls = "";
                    if (active) {
                      if (val === "LOW") activeCls = "bg-yellow-100 border-yellow-400 ring-2 ring-yellow-100 dark:bg-yellow-950 dark:border-yellow-600 dark:ring-yellow-900/50";
                      if (val === "MEDIUM") activeCls = "bg-amber-100 border-amber-400 ring-2 ring-amber-100 dark:bg-amber-950 dark:border-amber-600 dark:ring-amber-900/50";
                      if (val === "HIGH") activeCls = "bg-red-100 border-red-400 ring-2 ring-red-100 dark:bg-red-950 dark:border-red-600 dark:ring-red-900/50";
                    }
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSeverity(val)}
                        className={`rounded-xl border py-2.5 text-xs font-semibold transition-all ${cls} ${activeCls}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Detailed Statement</label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{reason.length}/1000 chars</span>
              </div>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value.slice(0, 1000))}
                rows={4}
                placeholder="Describe the incident, context, and any prior verbal warnings or action items discussed..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-violet-900/30"
              />
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 dark:shadow-none hover:opacity-95 transition-opacity"
              >
                Submit Report to HR
              </button>
            </div>
          </form>
        </div>

        {/* Helpful Info sidebar panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-violet-50 to-indigo-50/30 p-5 space-y-3 dark:border-slate-800 dark:from-violet-950/20 dark:to-indigo-950/10">
            <h3 className="text-xs font-bold text-violet-800 uppercase tracking-widest dark:text-violet-400">Incident Filing Rules</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex gap-2">
                <span className="text-violet-600 dark:text-violet-400">🔹</span>
                <span>Reports go directly to HR Admin inbox and are kept highly confidential.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-600 dark:text-violet-400">🔹</span>
                <span>Factual logs are preferred over speculative summaries. Include dates.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-600 dark:text-violet-400">🔹</span>
                <span>HR will review the complaint and might schedule a tripartite meeting with you and the employee.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submission History Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Your Filed Reports ({reports.length})</h2>
        {reports.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500 italic">
            You haven't filed any complaints yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                    <th className="px-5 py-3.5">Employee</th>
                    <th className="px-5 py-3.5">Category</th>
                    <th className="px-5 py-3.5">Severity</th>
                    <th className="px-5 py-3.5">Incident Date</th>
                    <th className="px-5 py-3.5">Reason & Statement</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                  {reports.map((r) => {
                    let sevClass = "";
                    if (r.severity === "LOW") sevClass = "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900/50";
                    if (r.severity === "MEDIUM") sevClass = "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50";
                    if (r.severity === "HIGH") sevClass = "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50";

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
                        <td className="px-5 py-4 font-semibold text-slate-950 dark:text-white">{r.employeeName}</td>
                        <td className="px-5 py-4">{r.category}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${sevClass}`}>
                            {r.severity}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {new Date(r.incidentDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-4 max-w-xs truncate" title={r.reason}>
                          {r.reason}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-900/50">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Under Review
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 dark:text-slate-100">Loading...</div>}>
      <ReportForm />
    </Suspense>
  );
}
