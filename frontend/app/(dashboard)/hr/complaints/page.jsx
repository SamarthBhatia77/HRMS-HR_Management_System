"use client";

import { useState } from "react";

const INITIAL_COMPLAINTS = [
  {
    id: "c1",
    employeeName: "Rohan Gupta",
    employeeDept: "Engineering",
    managerName: "Vikram Sen",
    category: "Attendance",
    severity: "MEDIUM",
    incidentDate: "2026-06-10",
    reason: "Frequently late logging into the backend shift (past 4 consecutive days) with no prior warning or email notice.",
    status: "UNDER_REVIEW",
    createdAt: "2026-06-11",
  },
  {
    id: "c2",
    employeeName: "Kavya Nair",
    employeeDept: "Engineering",
    managerName: "Vikram Sen",
    category: "Performance",
    severity: "HIGH",
    incidentDate: "2026-06-02",
    reason: "Refusal to take up the critical bug fixing task during deployment week, causing a 2-day delivery slip.",
    status: "RESOLVED",
    createdAt: "2026-06-03",
  },
  {
    id: "c3",
    employeeName: "Arjun Mehta",
    employeeDept: "Design",
    managerName: "Vikram Sen",
    category: "Behaviour",
    severity: "LOW",
    incidentDate: "2026-05-28",
    reason: "Strong verbal argument with the product team in public Slack channel, breaching team communication guidelines.",
    status: "DISMISSED",
    createdAt: "2026-05-30",
  }
];

function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HrComplaintsPortal() {
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [filter, setFilter] = useState("ALL"); // ALL, UNDER_REVIEW, RESOLVED, DISMISSED

  function updateStatus(id, newStatus) {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  }

  const filtered = complaints.filter((c) => {
    if (filter === "ALL") return true;
    return c.status === filter;
  });

  // Calculate statistics
  const total = complaints.length;
  const underReview = complaints.filter((c) => c.status === "UNDER_REVIEW").length;
  const resolved = complaints.filter((c) => c.status === "RESOLVED").length;
  const highSeverity = complaints.filter((c) => c.severity === "HIGH").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Complaints & Flags</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review and take action on employees flagged by managers for behavioral, policy, or performance issues.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Incidents", val: total, bg: "bg-slate-50", text: "text-slate-700" },
          { label: "Under Review", val: underReview, bg: "bg-amber-50", text: "text-amber-700" },
          { label: "Resolved Cases", val: resolved, bg: "bg-emerald-50", text: "text-emerald-700" },
          { label: "High Severity", val: highSeverity, bg: "bg-red-50", text: "text-red-700" },
        ].map(({ label, val, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center border border-white shadow-sm`}>
            <p className={`text-3xl font-bold ${text}`}>{val}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          ["ALL", "All Flags"],
          ["UNDER_REVIEW", "Under Review"],
          ["RESOLVED", "Resolved"],
          ["DISMISSED", "Dismissed"],
        ].map(([val, label]) => {
          const active = filter === val;
          return (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                active
                  ? "border-brand-600 text-brand-700 bg-brand-50/20"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">
          No complaints in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => {
            // Colors
            let sevClass = "";
            if (c.severity === "LOW") sevClass = "bg-yellow-50 text-yellow-700 border-yellow-200";
            if (c.severity === "MEDIUM") sevClass = "bg-amber-50 text-amber-700 border-amber-200";
            if (c.severity === "HIGH") sevClass = "bg-red-50 text-red-700 border-red-200";

            let statusClass = "";
            let statusLabel = "";
            if (c.status === "UNDER_REVIEW") {
              statusClass = "bg-amber-100 text-amber-800 border-amber-200";
              statusLabel = "Under Review";
            } else if (c.status === "RESOLVED") {
              statusClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
              statusLabel = "Resolved";
            } else {
              statusClass = "bg-slate-100 text-slate-800 border-slate-200";
              statusLabel = "Dismissed";
            }

            return (
              <div
                key={c.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-start md:justify-between gap-4"
              >
                {/* Details */}
                <div className="space-y-3 flex-1">
                  <div className="flex items-start flex-wrap gap-2.5">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        Flagged: {c.employeeName} ({c.employeeDept})
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Reported by Manager: <strong className="text-slate-700">{c.managerName}</strong>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${sevClass}`}>
                        {c.severity} Severity
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Manager Statement</p>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      "{c.reason}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-slate-400">
                    <span>Incident Date: {fmtDate(c.incidentDate)}</span>
                    <span>•</span>
                    <span>Filed on: {fmtDate(c.createdAt)}</span>
                  </div>
                </div>

                {/* Actions Panel */}
                <div className="flex md:flex-col gap-2 flex-shrink-0 justify-end pt-1 md:pt-0">
                  {c.status === "UNDER_REVIEW" && (
                    <>
                      <button
                        onClick={() => updateStatus(c.id, "RESOLVED")}
                        className="flex-1 md:flex-none rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-sm"
                      >
                        ✓ Mark Resolved
                      </button>
                      <button
                        onClick={() => updateStatus(c.id, "DISMISSED")}
                        className="flex-1 md:flex-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        ✕ Dismiss Case
                      </button>
                    </>
                  )}
                  {c.status !== "UNDER_REVIEW" && (
                    <button
                      onClick={() => updateStatus(c.id, "UNDER_REVIEW")}
                      className="w-full md:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Re-open Investigation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
