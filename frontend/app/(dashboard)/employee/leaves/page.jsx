"use client";

import { useState } from "react";
import { LeaveStatusBadge } from "@/components/employee/leave-status-badge";

/* ─── Constants ─────────────────────────────────────────────── */
const LEAVE_TYPES = [
  { value: "Annual Leave",                icon: "🌴" },
  { value: "Sick Leave",                  icon: "🏥" },
  { value: "Casual Leave",               icon: "☕" },
  { value: "Maternity / Paternity Leave", icon: "👶" },
  { value: "Compensatory Off",           icon: "🔄" },
  { value: "Unpaid Leave",               icon: "📋" },
];

const INITIAL_LEAVES = [
  {
    id: 1,
    type: "Annual Leave",
    startDate: "2026-05-12",
    endDate: "2026-05-14",
    days: 3,
    reason: "Family vacation trip to the hills.",
    status: "APPROVED",
    appliedOn: "2026-05-05",
  },
  {
    id: 2,
    type: "Sick Leave",
    startDate: "2026-04-03",
    endDate: "2026-04-03",
    days: 1,
    reason: "High fever and cold.",
    status: "APPROVED",
    appliedOn: "2026-04-03",
  },
  {
    id: 3,
    type: "Casual Leave",
    startDate: "2026-06-20",
    endDate: "2026-06-21",
    days: 2,
    reason: "Personal errand and bank work.",
    status: "PENDING",
    appliedOn: "2026-06-10",
  },
];

/* ─── Helpers ───────────────────────────────────────────────── */
function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const diff =
    (new Date(end).setHours(0, 0, 0, 0) -
      new Date(start).setHours(0, 0, 0, 0)) /
    86400000;
  return diff >= 0 ? diff + 1 : 0;
}

const today = new Date().toISOString().slice(0, 10);

/* ─── Page ──────────────────────────────────────────────────── */
export default function EmployeeLeavesPage() {
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const leavesUsed = leaves
    .filter((l) => l.status === "APPROVED")
    .reduce((s, l) => s + l.days, 0);
  const pendingCount = leaves.filter((l) => l.status === "PENDING").length;
  const leavesLeft = 21 - leavesUsed;
  const duration = daysBetween(startDate, endDate);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!leaveType)      { setFormError("Please select a leave type."); return; }
    if (!startDate)      { setFormError("Please select a start date."); return; }
    if (!endDate)        { setFormError("Please select an end date."); return; }
    if (duration === 0)  { setFormError("End date must be on or after start date."); return; }
    if (!reason.trim())  { setFormError("Please enter a reason for your leave."); return; }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));

    setLeaves((prev) => [
      {
        id: Date.now(),
        type: leaveType,
        startDate,
        endDate,
        days: duration,
        reason: reason.trim(),
        status: "PENDING",
        appliedOn: today,
      },
      ...prev,
    ]);

    setSuccessMsg("Leave request submitted! Your manager and HR have been notified.");
    setLeaveType(""); setStartDate(""); setEndDate(""); setReason("");
    setSubmitting(false);
    setShowForm(false);
    setTimeout(() => setSuccessMsg(""), 5000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Leaves</h1>
          <p className="mt-1 text-sm text-slate-500">
            Request time off and track your leave history.
          </p>
        </div>
        <button
          id="apply-leave-btn"
          onClick={() => { setShowForm(!showForm); setFormError(""); }}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 hover:bg-violet-500 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4.5v15m7.5-7.5h-15"} />
          </svg>
          {showForm ? "Close Form" : "Apply for Leave"}
        </button>
      </div>

      {/* ── Summary Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Allocated",   value: "21 days", bg: "bg-violet-50",  text: "text-violet-700" },
          { label: "Used This Year",    value: `${leavesUsed} days`, bg: "bg-emerald-50", text: "text-emerald-700" },
          { label: "Pending Approval",  value: String(pendingCount), bg: "bg-amber-50",   text: "text-amber-700" },
        ].map(({ label, value, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center border border-white shadow-sm`}>
            <p className={`text-2xl font-bold ${text}`}>{value}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Leave Balance Bar ───────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium text-slate-600">Leave Balance</span>
          <span className="font-semibold text-violet-700">{leavesLeft} days remaining</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
            style={{ width: `${Math.min((leavesUsed / 21) * 100, 100)}%` }}
          />
        </div>
        <div className="mt-2 text-[11px] text-slate-400">{leavesUsed} of 21 days used</div>
      </div>

      {/* ── Success toast ───────────────────────────────────── */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium animate-pulse-once">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* ── Application Form ────────────────────────────────── */}
      {showForm && (
        <div className="rounded-2xl border border-violet-100 bg-white shadow-md shadow-violet-100 overflow-hidden">
          {/* Form header */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-4">
            <h2 className="text-base font-semibold text-white">New Leave Request</h2>
            <p className="text-xs text-violet-200 mt-0.5">
              Submitted requests are forwarded to your reporting manager for approval.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5" id="leave-form">
            {formError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {formError}
              </div>
            )}

            {/* Leave type — icon grid */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Leave Type <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {LEAVE_TYPES.map(({ value, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLeaveType(value)}
                    className={[
                      "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center text-[11px] font-medium transition-all",
                      leaveType === value
                        ? "border-violet-400 bg-violet-50 text-violet-700 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-violet-200 hover:bg-violet-50/40",
                    ].join(" ")}
                  >
                    <span className="text-lg">{icon}</span>
                    <span className="leading-tight">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <input
                  id="leave-start-date"
                  type="date"
                  value={startDate}
                  min={today}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) setEndDate("");
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  End Date <span className="text-red-400">*</span>
                </label>
                <input
                  id="leave-end-date"
                  type="date"
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
            </div>

            {/* Duration pill */}
            {startDate && endDate && duration > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-violet-50 border border-violet-100 px-4 py-2.5">
                <span className="text-lg">📅</span>
                <p className="text-sm text-violet-700">
                  Duration:{" "}
                  <span className="font-bold">
                    {duration} day{duration !== 1 ? "s" : ""}
                  </span>{" "}
                  &nbsp;·&nbsp;{" "}
                  <span className="text-violet-500 text-xs">
                    {fmtDate(startDate)} → {fmtDate(endDate)}
                  </span>
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                id="leave-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Briefly describe the reason for your leave request…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(""); }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="leave-submit-btn"
                disabled={submitting}
                className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-500 disabled:opacity-60 transition-all active:scale-95"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Submitting…
                  </span>
                ) : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Leave History ───────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Leave History</h2>
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          {leaves.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <p className="text-4xl mb-3">🌴</p>
              <p className="text-sm font-medium text-slate-500">No leave requests yet</p>
              <p className="text-xs mt-1">Your submitted requests will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left" id="leaves-table">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Leave Type", "Dates", "Duration", "Reason", "Applied", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {LEAVE_TYPES.find((t) => t.value === leave.type)?.icon ?? "📋"}{" "}
                        {leave.type}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {fmtDate(leave.startDate)}
                        {leave.startDate !== leave.endDate && (
                          <span className="text-slate-400"> → {fmtDate(leave.endDate)}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {leave.days}d
                      </td>
                      <td className="px-5 py-4 text-slate-500 max-w-[200px] truncate">
                        {leave.reason}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                        {fmtDate(leave.appliedOn)}
                      </td>
                      <td className="px-5 py-4">
                        <LeaveStatusBadge status={leave.status} />
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
