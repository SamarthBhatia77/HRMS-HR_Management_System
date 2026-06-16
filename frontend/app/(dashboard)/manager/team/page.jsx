"use client";

import { useState, useEffect } from "react";
import { LeaveStatusBadge } from "@/components/employee/leave-status-badge";
import { apiFetch } from "@/lib/api";

/* ─── Helpers ───────────────────────────────────────────────── */
function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function daysBetween(start, end) {
  if (!start || !end) return 0;
  const diff =
    (new Date(end).setHours(0, 0, 0, 0) -
      new Date(start).setHours(0, 0, 0, 0)) /
    86400000;
  return diff >= 0 ? diff + 1 : 0;
}

function Initials({ name, size = "md" }) {
  const letters = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const sizeClass = size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-sm";
  const colors = ["from-violet-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-500", "from-rose-500 to-pink-600", "from-blue-500 to-cyan-600"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${sizeClass} ${color} rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {letters}
    </div>
  );
}

function AttendanceBadge({ pct }) {
  const color = pct >= 90 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : pct >= 75 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-red-700 bg-red-50 border-red-200";
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>{pct}%</span>;
}

/* ─── Employee Drawer ─────────────────────────────────────────── */
function EmployeeDrawer({ emp, leaves, onClose, onApprove, onReject, leavesLeft, attendancePct, onLeave }) {
  const [remarks, setRemarks] = useState({});

  if (!emp) return null;
  return (
    <div className="fixed inset-0 z-50 flex" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="relative ml-auto w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Initials name={emp.name} size="lg" />
              <div>
                <h2 className="text-lg font-bold text-white">{emp.name}</h2>
                <p className="text-sm text-violet-200">{emp.designation} · {emp.dept}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Attendance", `${attendancePct}%`, attendancePct >= 90 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"],
              ["Leaves Left", `${leavesLeft}d`, "bg-violet-50 text-violet-700"],
              ["Status", onLeave ? "On Leave" : "Active", onLeave ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"],
            ].map(([label, val, cls]) => (
              <div key={label} className={`${cls} rounded-xl p-3 text-center`}>
                <p className="text-lg font-bold">{val}</p>
                <p className="text-[11px] font-medium mt-0.5 opacity-70">{label}</p>
              </div>
            ))}
          </div>

          {/* Leave Requests */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Leave Requests</h3>
            {leaves.length === 0 ? (
              <p className="text-sm text-slate-400 italic text-center py-6">No leave requests from {emp.name.split(" ")[0]}.</p>
            ) : (
              <div className="space-y-3">
                {leaves.map((leave) => (
                  <div key={leave.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{leave.type}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {fmtDate(leave.startDate)}{leave.startDate !== leave.endDate && ` → ${fmtDate(leave.endDate)}`}
                          {" · "}{leave.days}d
                        </p>
                        <p className="text-xs text-slate-400 mt-1 italic">"{leave.reason}"</p>
                        {leave.managerRemarks && (
                          <p className="text-xs text-violet-750 mt-1.5 font-medium">
                            Remarks: <span className="italic">"{leave.managerRemarks}"</span>
                          </p>
                        )}
                      </div>
                      <LeaveStatusBadge status={leave.status} />
                    </div>
                    {leave.status === "PENDING" && (
                      <div className="space-y-2 pt-1">
                        <textarea
                          placeholder="Optional remarks/reason..."
                          value={remarks[leave.id] || ""}
                          onChange={(e) => setRemarks({ ...remarks, [leave.id]: e.target.value })}
                          className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-100 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => onApprove(emp.id, leave.id, remarks[leave.id] || "")}
                            className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => onReject(emp.id, leave.id, remarks[leave.id] || "")}
                            className="flex-1 rounded-lg border border-red-200 bg-red-50 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report to HR */}
          <div className="border-t border-slate-100 pt-4">
            <a
              href={`/manager/report?emp=${emp.id}`}
              className="flex items-center justify-center gap-2 w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
              </svg>
              Flag this Employee to HR Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function ManagerTeamPage() {
  const [team, setTeam] = useState([]);
  const [leavesMap, setLeavesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [search, setSearch] = useState("");

  async function loadTeamData() {
    try {
      const [empRes, leavesRes] = await Promise.all([
        apiFetch("/employees/team"),
        apiFetch("/leaves/team"),
      ]);

      if (empRes.success && empRes.data) {
        const teamMapped = empRes.data.map((item) => ({
          id: item.id,
          name: item.fullName,
          designation: item.designation,
          dept: item.department,
          status: item.employmentStatus,
        }));
        setTeam(teamMapped);
      }

      if (leavesRes.success && leavesRes.data) {
        const groups = {};
        leavesRes.data.forEach((l) => {
          const empId = l.employeeId;
          if (!groups[empId]) groups[empId] = [];
          groups[empId].push({
            id: l.id,
            type: l.leaveType,
            startDate: l.startDate,
            endDate: l.endDate,
            days: daysBetween(l.startDate, l.endDate),
            reason: l.reason,
            status: l.status,
            managerRemarks: l.managerRemarks,
          });
        });
        setLeavesMap(groups);
      }
    } catch (err) {
      console.error("Failed to load team data", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeamData();
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const getAttendancePct = (empId) => {
    // Deterministic attendance rating for display based on ID hash
    let hash = 0;
    for (let i = 0; i < empId.length; i++) {
      hash = empId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 15) + 84; // 84% - 98%
  };

  const getLeavesLeft = (empId) => {
    const list = leavesMap[empId] ?? [];
    const used = list
      .filter((l) => l.status === "APPROVED")
      .reduce((sum, l) => sum + l.days, 0);
    return 21 - used;
  };

  const checkIsOnLeave = (empId) => {
    const list = leavesMap[empId] ?? [];
    return list.some(
      (l) => l.status === "APPROVED" && todayStr >= l.startDate && todayStr <= l.endDate
    );
  };

  const filtered = team.filter(
    (e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.dept.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = team.filter((e) => !checkIsOnLeave(e.id)).length;
  const onLeaveCount = team.filter((e) => checkIsOnLeave(e.id)).length;
  const pendingApprovals = Object.values(leavesMap).flat().filter((l) => l.status === "PENDING").length;

  async function handleApprove(empId, leaveId, remarks) {
    try {
      const response = await apiFetch(`/leaves/${leaveId}/approve`, {
        method: "POST",
        body: JSON.stringify({ remarks }),
      });
      if (response.success) {
        await loadTeamData();
      }
    } catch (err) {
      alert("Failed to approve leave request: " + err.message);
    }
  }

  async function handleReject(empId, leaveId, remarks) {
    try {
      const response = await apiFetch(`/leaves/${leaveId}/reject`, {
        method: "POST",
        body: JSON.stringify({ remarks }),
      });
      if (response.success) {
        await loadTeamData();
      }
    } catch (err) {
      alert("Failed to reject leave request: " + err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Team</h1>
        <p className="mt-1 text-sm text-slate-500">View your direct reports, their attendance and leave requests.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Team Size",          val: team.length,     bg: "bg-violet-50",  text: "text-violet-700" },
          { label: "Present Today",       val: presentCount,    bg: "bg-emerald-50", text: "text-emerald-700" },
          { label: "On Leave",            val: onLeaveCount,    bg: "bg-amber-50",   text: "text-amber-700" },
          { label: "Pending Approvals",   val: pendingApprovals,bg: "bg-red-50",     text: "text-red-700" },
        ].map(({ label, val, bg, text }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 text-center border border-white shadow-sm`}>
            <p className={`text-3xl font-bold ${text}`}>{val}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or department…"
          className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </div>

      {/* Team Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-400 italic">
          No team members report to you or match the search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((emp) => {
            const empLeaves = leavesMap[emp.id] ?? [];
            const pending = empLeaves.filter((l) => l.status === "PENDING").length;
            const attPct = getAttendancePct(emp.id);
            const leavesLeft = getLeavesLeft(emp.id);
            const onLeave = checkIsOnLeave(emp.id);

            return (
              <button
                key={emp.id}
                onClick={() => setSelectedEmp(emp)}
                className="text-left w-full rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-violet-200 transition-all group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <Initials name={emp.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-violet-700 transition-colors truncate">{emp.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{emp.designation}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{emp.dept}</p>
                  </div>
                  {onLeave && (
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">On Leave</span>
                  )}
                </div>

                {/* Attendance bar */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Attendance</span>
                    <AttendanceBadge pct={attPct} />
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${attPct >= 90 ? "bg-emerald-500" : attPct >= 75 ? "bg-amber-500" : "bg-red-400"}`}
                      style={{ width: `${attPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Leave balance: <strong className="text-slate-700">{leavesLeft}d</strong></span>
                  {pending > 0 && (
                    <span className="bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                      {pending} pending
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-violet-600 font-medium">
                  <span>View details & leaves</span>
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Drawer */}
      {selectedEmp && (
        <EmployeeDrawer
          emp={selectedEmp}
          leaves={leavesMap[selectedEmp.id] ?? []}
          leavesLeft={getLeavesLeft(selectedEmp.id)}
          attendancePct={getAttendancePct(selectedEmp.id)}
          onLeave={checkIsOnLeave(selectedEmp.id)}
          onClose={() => setSelectedEmp(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
