"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Initials({ name }) {
  const letters = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "from-indigo-500 to-blue-600",
    "from-emerald-500 to-teal-650",
    "from-violet-500 to-purple-600",
    "from-rose-500 to-orange-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`h-8 w-8 ${color} rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm`}>
      {letters}
    </div>
  );
}

export default function HrWfhAdminPage() {
  const [activeTab, setActiveTab] = useState("pending"); // pending, employees
  const [threshold, setThreshold] = useState(1);
  const [savingThreshold, setSavingThreshold] = useState(false);

  // Search Employees
  const [searchQuery, setSearchQuery] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [editQuotaValue, setEditQuotaValue] = useState("");
  const [savingQuotaId, setSavingQuotaId] = useState(null);

  // Pending requests for HR final review
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [hrRemarks, setHrRemarks] = useState({});
  const [submittingRequestId, setSubmittingRequestId] = useState(null);

  const [message, setMessage] = useState({ text: "", type: "" }); // success, error

  async function loadThreshold() {
    try {
      const res = await apiFetch("/wfh/settings");
      if (res.success && res.data) {
        setThreshold(res.data.threshold);
      }
    } catch (err) {
      console.error("Failed to load WFH settings", err);
    }
  }

  async function loadPendingRequests() {
    setLoadingPending(true);
    try {
      const res = await apiFetch("/wfh/admin/pending");
      if (res.success && res.data) {
        setPendingRequests(res.data);
      }
    } catch (err) {
      console.error("Failed to load pending requests", err);
    } finally {
      setLoadingPending(false);
    }
  }

  async function searchEmployees(query) {
    setLoadingEmployees(true);
    try {
      const res = await apiFetch(`/wfh/admin/employees?query=${encodeURIComponent(query)}`);
      if (res.success && res.data) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error("Failed to search employees", err);
    } finally {
      setLoadingEmployees(false);
    }
  }

  useEffect(() => {
    loadThreshold();
    loadPendingRequests();
    searchEmployees("");
  }, []);

  async function handleSaveThreshold(e) {
    e.preventDefault();
    setSavingThreshold(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await apiFetch("/wfh/settings", {
        method: "PUT",
        body: JSON.stringify({ threshold: parseInt(String(threshold), 10) }),
      });
      if (res.success) {
        setMessage({ text: "Global WFH threshold updated successfully.", type: "success" });
      }
    } catch (err) {
      setMessage({ text: err.message || "Failed to update threshold.", type: "error" });
    } finally {
      setSavingThreshold(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    }
  }

  async function handleSaveQuota(employeeId) {
    setSavingQuotaId(employeeId);
    setMessage({ text: "", type: "" });
    try {
      const res = await apiFetch(`/wfh/admin/employees/${employeeId}/quota`, {
        method: "PUT",
        body: JSON.stringify({ quota: parseInt(editQuotaValue, 10) }),
      });
      if (res.success) {
        setMessage({ text: `Quota updated successfully to ${editQuotaValue} days.`, type: "success" });
        setEditingEmployeeId(null);
        // Refresh search list
        await searchEmployees(searchQuery);
      }
    } catch (err) {
      setMessage({ text: err.message || "Failed to update quota.", type: "error" });
    } finally {
      setSavingQuotaId(null);
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    }
  }

  async function handleHrReview(id, approve) {
    setSubmittingRequestId(id);
    setMessage({ text: "", type: "" });
    try {
      const remarksText = hrRemarks[id] || "";
      const res = await apiFetch(`/wfh/${id}/hr-review?approve=${approve}`, {
        method: "POST",
        body: JSON.stringify({ remarks: remarksText }),
      });

      if (res.success) {
        setMessage({
          text: approve 
            ? "WFH request approved successfully. User marked as Present on that date." 
            : "WFH request rejected successfully.",
          type: "success",
        });
        setHrRemarks((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        await loadPendingRequests();
      }
    } catch (err) {
      setMessage({ text: err.message || "Failed to process request.", type: "error" });
    } finally {
      setSubmittingRequestId(null);
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Work From Home (WFH) Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure employee WFH quotas, thresholds, and review pending final approvals.
        </p>
      </div>

      {/* Message feedback */}
      {message.text && (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium ${
          message.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
            : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400"
        }`}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {message.type === "success" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            )}
          </svg>
          {message.text}
        </div>
      )}

      {/* Global Config Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Global WFH Rules</h2>
        <form onSubmit={handleSaveThreshold} className="flex flex-col sm:flex-row items-end gap-4 max-w-lg">
          <div className="flex-1 space-y-1 w-full">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Minimum Allowed Quota Threshold</label>
            <input
              type="number"
              min="0"
              required
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus:border-indigo-450 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              If an employee's quota is set below this threshold, they cannot apply for WFH requests.
            </p>
          </div>
          <button
            type="submit"
            disabled={savingThreshold}
            className="rounded-xl bg-indigo-655 bg-indigo-600 hover:bg-indigo-500 font-semibold text-white px-5 py-2.5 text-xs shadow-sm disabled:opacity-60 transition-all active:scale-95 whitespace-nowrap w-full sm:w-auto"
          >
            {savingThreshold ? "Saving..." : "Save Threshold"}
          </button>
        </form>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        {[
          { id: "pending", label: `Pending Approvals (${pendingRequests.length})` },
          { id: "employees", label: "Employee Quotas" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.id
                ? "border-violet-600 text-violet-650 font-bold dark:text-violet-400"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          {loadingPending ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-400 dark:text-slate-500">
              <p className="text-4xl mb-2">🎉</p>
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs mt-0.5">No WFH requests pending HR approval.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pendingRequests.map((req) => (
                <div key={req.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Initials name={req.employeeName} />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{req.employeeName}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{req.department} · {req.employeeEmail}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl p-3 text-xs space-y-1.5">
                      <div>
                        <span className="font-semibold text-slate-505 dark:text-slate-400">Date Requested:</span>{" "}
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{fmtDate(req.date)}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-505 dark:text-slate-400">Reason:</span>{" "}
                        <span className="text-slate-750 dark:text-slate-300 italic">"{req.reason}"</span>
                      </div>
                      {req.managerRemarks && (
                        <div className="pt-1.5 border-t border-slate-150 dark:border-slate-800">
                          <span className="font-semibold text-violet-755 dark:text-violet-400">Manager Remarks:</span>{" "}
                          <span className="text-slate-700 dark:text-slate-350 italic">"{req.managerRemarks}"</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      placeholder="Optional HR remarks/reason..."
                      value={hrRemarks[req.id] || ""}
                      onChange={(e) => setHrRemarks({ ...hrRemarks, [req.id]: e.target.value })}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-950 dark:text-slate-100 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none resize-none"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleHrReview(req.id, true)}
                        disabled={submittingRequestId === req.id}
                        className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500 active:scale-95 disabled:opacity-60 transition-all shadow-sm"
                      >
                        {submittingRequestId === req.id ? "Processing..." : "✓ Approve"}
                      </button>
                      <button
                        onClick={() => handleHrReview(req.id, false)}
                        disabled={submittingRequestId === req.id}
                        className="flex-1 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-955/20 py-2 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-900/30 active:scale-95 disabled:opacity-60 transition-all"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "employees" && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm dark:bg-slate-900 dark:border-slate-800 overflow-hidden space-y-4 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Employee List & WFH Quotas</h2>
          
          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchEmployees(e.target.value);
              }}
              placeholder="Search by employee name or email…"
              className="w-full text-xs rounded-xl border border-slate-200 bg-white px-9 py-2.5 focus:border-indigo-400 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          {/* List table */}
          {loadingEmployees ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
            </div>
          ) : employees.length === 0 ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 italic text-xs">
              No employees found matching query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                    <th className="px-6 py-3.5">Employee</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5 text-center">WFH Quota (Days / Month)</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 dark:divide-slate-800 dark:text-slate-300">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-200">
                        {emp.fullName}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {emp.email}
                      </td>
                      <td className="px-6 py-4">
                        {emp.department}
                      </td>
                      <td className="px-6 py-4 text-center font-bold">
                        {editingEmployeeId === emp.id ? (
                          <input
                            type="number"
                            min="0"
                            value={editQuotaValue}
                            onChange={(e) => setEditQuotaValue(e.target.value)}
                            className="w-16 rounded border border-slate-200 bg-slate-50 px-2 py-1 text-center text-xs dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:border-indigo-400 font-bold"
                          />
                        ) : (
                          <span className={emp.wfhQuota < threshold ? "text-red-500 font-bold" : "text-violet-750 dark:text-violet-400 font-bold"}>
                            {emp.wfhQuota} days
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingEmployeeId === emp.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSaveQuota(emp.id)}
                              disabled={savingQuotaId === emp.id}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-500 disabled:opacity-60 transition-all"
                            >
                              {savingQuotaId === emp.id ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={() => setEditingEmployeeId(null)}
                              className="px-2.5 py-1 border border-slate-200 text-slate-500 rounded text-xs font-semibold hover:bg-slate-50 transition-all dark:border-slate-850 dark:hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingEmployeeId(emp.id);
                              setEditQuotaValue(String(emp.wfhQuota));
                            }}
                            className="px-3 py-1 bg-violet-50 text-violet-755 border border-violet-200 rounded-xl text-xs font-semibold hover:bg-violet-100 transition-all dark:bg-violet-955/20 dark:text-violet-400 dark:border-violet-905/30"
                          >
                            Edit Quota
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
