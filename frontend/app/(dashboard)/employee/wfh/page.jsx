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

function WfhStatusBadge({ status }) {
  const configs = {
    PENDING_MANAGER: {
      bg: "bg-amber-50 dark:bg-amber-950/20",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-900/30",
      label: "Pending Manager",
    },
    PENDING_HR: {
      bg: "bg-blue-50 dark:bg-blue-950/20",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-900/30",
      label: "Pending HR Admin",
    },
    APPROVED: {
      bg: "bg-emerald-50 dark:bg-emerald-950/20",
      text: "text-emerald-700 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-900/30",
      label: "Approved",
    },
    REJECTED: {
      bg: "bg-red-50 dark:bg-red-950/20",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-900/30",
      label: "Rejected",
    },
  };

  const cfg = configs[status] || configs.PENDING_MANAGER;

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

const todayStr = new Date().toISOString().split("T")[0];

export default function EmployeeWfhPage() {
  const [history, setHistory] = useState([]);
  const [info, setInfo] = useState({
    wfhQuota: 0,
    wfhThreshold: 0,
    wfhUsed: 0,
    wfhRemaining: 0,
    activeRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function loadData() {
    try {
      const [infoRes, historyRes] = await Promise.all([
        apiFetch("/wfh/info"),
        apiFetch("/wfh/my"),
      ]);
      if (infoRes.success && infoRes.data) {
        setInfo(infoRes.data);
      }
      if (historyRes.success && historyRes.data) {
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error("Failed to load WFH data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!date) {
      setErrorMsg("Please select a date.");
      return;
    }
    if (!reason.trim()) {
      setErrorMsg("Please provide a reason.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch("/wfh", {
        method: "POST",
        body: JSON.stringify({
          date,
          reason: reason.trim(),
        }),
      });

      if (res.success) {
        setSuccessMsg("WFH request submitted successfully!");
        setDate("");
        setReason("");
        setShowForm(false);
        await loadData();
      } else {
        setErrorMsg(res.message || "Failed to submit request.");
      }
    } catch (err) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(""), 5000);
    }
  }

  const isBlockedByThreshold = info.wfhQuota < info.wfhThreshold;
  const isBlockedByQuota = info.wfhRemaining <= 0;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Work From Home (WFH)</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Request to work remotely and track request status.
          </p>
        </div>
        {!isBlockedByThreshold && (
          <button
            id="apply-wfh-btn"
            onClick={() => {
              setShowForm(!showForm);
              setErrorMsg("");
            }}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 active:scale-95 transition-all"
          >
            {showForm ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close Form
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Apply for WFH
              </>
            )}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Monthly Quota",
            value: `${info.wfhQuota} days`,
            bg: "bg-violet-50 dark:bg-violet-950/20",
            text: "text-violet-700 dark:text-violet-400",
          },
          {
            label: "Approved WFH",
            value: `${info.wfhUsed} days`,
            bg: "bg-emerald-50 dark:bg-emerald-950/20",
            text: "text-emerald-700 dark:text-emerald-400",
          },
          {
            label: "Remaining Balance",
            value: `${info.wfhRemaining} days`,
            bg: "bg-amber-50 dark:bg-amber-950/20",
            text: "text-amber-700 dark:text-amber-400",
          },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center border border-white dark:border-slate-800/40 shadow-sm`}>
            <p className={`text-2xl font-bold ${text}`}>{value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}

      {isBlockedByThreshold && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium dark:bg-red-950/20 dark:border-red-900/50 dark:text-red-400">
          <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div>
            <p className="font-bold text-base">WFH Application Blocked</p>
            <p className="text-sm mt-1">
              Your monthly WFH quota ({info.wfhQuota}) is below the threshold limit ({info.wfhThreshold}) set by the HR Admin.
              Please contact HR to update your allowance.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && !isBlockedByThreshold && (
        <div className="rounded-2xl border border-violet-100 dark:border-violet-900 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4">
            <h2 className="text-base font-semibold text-white">New WFH Request</h2>
            <p className="text-xs text-violet-200 mt-0.5">
              Submit your request for remote work. Requests will go to your manager and HR for approval.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 px-4 py-2.5 text-sm text-red-700 dark:text-red-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {errorMsg}
              </div>
            )}

            {isBlockedByQuota && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/30 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-400">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                Warning: You have exhausted your remaining WFH balance. This request might fail.
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5">
                Requested Date <span className="text-red-450">*</span>
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-350 mb-1.5">
                Reason <span className="text-red-450">*</span>
              </label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Please explain the reason for working from home on this date..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-405 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setErrorMsg("");
                }}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 disabled:opacity-60 transition-all active:scale-95"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">WFH Request History</h2>
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="py-16 text-center text-slate-400 dark:text-slate-550">
              <p className="text-4xl mb-3">🏡</p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No WFH requests yet</p>
              <p className="text-xs mt-1">Your submitted requests will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Requested Date</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Reason</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Applied On</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                  {history.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4 font-semibold text-slate-850 dark:text-slate-100 whitespace-nowrap">
                        {fmtDate(req.date)}
                      </td>
                      <td className="px-5 py-4 text-slate-650 dark:text-slate-350 max-w-[200px]">
                        <div className="truncate" title={req.reason}>{req.reason}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 dark:text-slate-550 whitespace-nowrap">
                        {fmtDate(req.appliedOn)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <WfhStatusBadge status={req.status} />
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400">
                        {req.managerRemarks && (
                          <div className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                            <span className="font-semibold text-slate-600 dark:text-slate-405">Mgr:</span> "{req.managerRemarks}"
                          </div>
                        )}
                        {req.hrRemarks && (
                          <div className="text-[11px] text-indigo-650 dark:text-indigo-400 mt-1 font-medium">
                            <span className="font-semibold text-slate-600 dark:text-slate-405">HR:</span> "{req.hrRemarks}"
                          </div>
                        )}
                        {!req.managerRemarks && !req.hrRemarks && <span className="text-slate-400 italic">None</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
