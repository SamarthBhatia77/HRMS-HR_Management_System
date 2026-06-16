"use client";

import { useState, useEffect } from "react";
import { StarRating } from "@/components/employee/star-rating";
import { apiFetch } from "@/lib/api";

const CATEGORIES = [
  { value: "WORK_ENV",    label: "Work Environment",  icon: "🏢" },
  { value: "MANAGEMENT",  label: "Management",         icon: "👥" },
  { value: "HR",          label: "HR & Policies",      icon: "📋" },
  { value: "PROCESS",     label: "Processes & Tools",  icon: "⚙️" },
  { value: "GROWTH",      label: "Growth & Learning",  icon: "📈" },
  { value: "OTHER",       label: "Other",              icon: "💬" },
];

function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCatInfo(val) {
  return CATEGORIES.find((c) => c.value === val) ?? { label: val, icon: "💬" };
}

export default function ManagerFeedbackInbox() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("ALL");
  const [minRating, setMinRating] = useState("ALL");
  const [anonFilter, setAnonFilter] = useState("ALL"); // ALL, ANONYMOUS, PUBLIC

  async function loadFeedbacks() {
    try {
      const response = await apiFetch("/feedback");
      if (response.success && response.data) {
        setFeedbacks(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch feedbacks", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedbacks();
  }, []);

  // Filtering logic
  const filtered = feedbacks.filter((fb) => {
    if (catFilter !== "ALL" && fb.category !== catFilter) return false;
    if (minRating !== "ALL" && fb.rating < parseInt(minRating)) return false;
    if (anonFilter === "ANONYMOUS" && !fb.anonymous) return false;
    if (anonFilter === "PUBLIC" && fb.anonymous) return false;
    return true;
  });

  // Calculate statistics
  const totalCount = feedbacks.length;
  const filteredCount = filtered.length;
  const avgRating = totalCount > 0 
    ? (feedbacks.reduce((sum, item) => sum + item.rating, 0) / totalCount).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team Feedback</h1>
          <p className="mt-1 text-sm text-slate-500">
            View, filter and analyze suggestions and ratings submitted by your team members.
          </p>
        </div>
        
        {/* Quick Metrics */}
        <div className="flex gap-3 bg-white border border-slate-200 p-3 rounded-2xl shadow-sm">
          <div className="px-3 border-r border-slate-100 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Feedbacks</span>
            <p className="text-lg font-bold text-indigo-700">{totalCount}</p>
          </div>
          <div className="px-3 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">Avg Rating</span>
            <p className="text-lg font-bold text-amber-500">⭐ {avgRating}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Filter Feedbacks</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Category</label>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 focus:border-indigo-400 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.icon} {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 focus:border-indigo-400 focus:outline-none"
            >
              <option value="ALL">Any Rating</option>
              <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
              <option value="4">⭐⭐⭐⭐ (4/5 or more)</option>
              <option value="3">⭐⭐⭐ (3/5 or more)</option>
              <option value="2">⭐⭐ (2/5 or more)</option>
            </select>
          </div>

          {/* Anonymity */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Author Anonymity</label>
            <select
              value={anonFilter}
              onChange={(e) => setAnonFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 focus:border-indigo-400 focus:outline-none"
            >
              <option value="ALL">Show All</option>
              <option value="ANONYMOUS">Anonymous Only</option>
              <option value="PUBLIC">Identified Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedbacks Count */}
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span>Showing {filteredCount} of {totalCount} feedback entries</span>
      </div>

      {/* Feedbacks Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-400 italic">
          No feedback entries match your filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((fb) => {
            const cat = getCatInfo(fb.category);
            return (
              <div 
                key={fb.id} 
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center text-lg flex-shrink-0 text-violet-750 border border-violet-100">
                        {cat.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{fb.title}</h3>
                        <p className="text-[10px] text-slate-400 font-medium">{cat.label}</p>
                      </div>
                    </div>
                    {fb.anonymous ? (
                      <span className="text-[9px] font-bold tracking-wider uppercase bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">
                        Anonymous
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold tracking-wider uppercase bg-violet-50 text-violet-750 border border-violet-100 px-2 py-0.5 rounded-full">
                        {fb.employeeName}
                      </span>
                    )}
                  </div>

                  {/* Rating display */}
                  <div className="mb-3">
                    <StarRating value={fb.rating} readOnly />
                  </div>

                  {/* Body text */}
                  <p className="text-xs text-slate-600 leading-relaxed italic mb-4">
                    "{fb.details}"
                  </p>
                </div>

                {/* Card footer */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[10px] text-slate-400">
                  <span>Submitted on {fmtDate(fb.submittedOn)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
