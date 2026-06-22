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
    "from-violet-500 to-indigo-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-650",
    "from-blue-500 to-cyan-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`h-10 w-10 ${color} rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}>
      {letters}
    </div>
  );
}

export default function ManagerWfhRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" }); // success, error

  async function loadRequests() {
    try {
      const res = await apiFetch("/wfh/team");
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error("Failed to load team WFH requests", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleReview(id, approve) {
    setSubmittingId(id);
    setMessage({ text: "", type: "" });
    try {
      const reqRemarks = remarks[id] || "";
      const res = await apiFetch(`/wfh/${id}/manager-review?approve=${approve}`, {
        method: "POST",
        body: JSON.stringify({ remarks: reqRemarks }),
      });

      if (res.success) {
        setMessage({
          text: approve 
            ? "Request approved and forwarded to HR Admin successfully." 
            : "Request rejected successfully.",
          type: "success",
        });
        setRemarks((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        await loadRequests();
      }
    } catch (err) {
      setMessage({ text: err.message || "Failed to process request.", type: "error" });
    } finally {
      setSubmittingId(null);
      setTimeout(() => setMessage({ text: "", type: "" }), 5000);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Team WFH Requests</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Review and approve/deny Work From Home requests submitted by your team members.
        </p>
      </div>

      {/* Messages */}
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

      {/* Pending list */}
      {requests.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-400 dark:text-slate-550">
          <p className="text-4xl mb-3">✅</p>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">All caught up!</p>
          <p className="text-xs mt-1">No pending WFH requests from your team.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests.map((req) => (
            <div key={req.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Initials name={req.employeeName} />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{req.employeeName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{req.department}</p>
                  </div>
                </div>

                <div className="mt-3 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/60 dark:border-violet-900/30 rounded-xl p-3 text-xs space-y-1">
                  <div>
                    <span className="font-semibold text-violet-800 dark:text-violet-400">Requested WFH Date:</span>{" "}
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{fmtDate(req.date)}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-violet-800 dark:text-violet-400">Applied On:</span>{" "}
                    <span className="text-slate-650 dark:text-slate-400">{fmtDate(req.appliedOn)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-violet-100/40 dark:border-violet-900/20 mt-1.5">
                    <span className="font-semibold text-violet-800 dark:text-violet-400 block mb-0.5">Reason:</span>
                    <p className="text-slate-700 dark:text-slate-300 italic">"{req.reason}"</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <textarea
                  placeholder="Optional remarks/reason..."
                  value={remarks[req.id] || ""}
                  onChange={(e) => setRemarks({ ...remarks, [req.id]: e.target.value })}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-405 focus:border-violet-400 focus:outline-none focus:ring-1 focus:ring-violet-100 resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReview(req.id, true)}
                    disabled={submittingId === req.id}
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-500 active:scale-95 disabled:opacity-60 transition-all shadow-sm"
                  >
                    {submittingId === req.id ? "Processing..." : "✓ Approve"}
                  </button>
                  <button
                    onClick={() => handleReview(req.id, false)}
                    disabled={submittingId === req.id}
                    className="flex-1 rounded-xl border border-red-200 dark:border-red-900/35 bg-red-50 dark:bg-red-955/25 py-2 text-xs font-semibold text-red-700 dark:text-red-400 hover:bg-red-100/60 dark:hover:bg-red-900/30 active:scale-95 disabled:opacity-60 transition-all"
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
  );
}
