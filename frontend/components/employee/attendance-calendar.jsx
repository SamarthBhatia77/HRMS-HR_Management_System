"use client";

import { useState } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/** Stable deterministic hash of a date string → number */
function hashDate(dateStr) {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = Math.imul(31, h) + dateStr.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Returns "present" | "absent" | "weekend" | "future" | "today"
 * Mock: ~82 % of past weekdays = present, rest = absent.
 */
function getMockStatus(date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const dow = d.getDay();
  if (dow === 0 || dow === 6) return "weekend";
  if (d.getTime() === now.getTime()) return "today";
  if (d > now) return "future";

  const dateStr = d.toISOString().slice(0, 10);
  return hashDate(dateStr) % 6 === 0 ? "absent" : "present";
}

export function AttendanceCalendar() {
  const now = new Date();
  const [viewDate, setViewDate] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth();

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    const next = new Date(year, month + 1, 1);
    if (next <= new Date(now.getFullYear(), now.getMonth(), 1)) {
      setViewDate(next);
    }
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();

  // Build flat array: null = empty lead cell, number = day
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Compute present/absent counts for the banner
  let presentCount = 0;
  let absentCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const s = getMockStatus(new Date(year, month, d));
    if (s === "present") presentCount++;
    if (s === "absent") absentCount++;
  }

  return (
    <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 select-none">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
          {MONTH_NAMES[month]} {year}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Day-of-week labels ──────────────────────────────────── */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((l) => (
          <div key={l} className="text-center text-[10px] font-semibold text-slate-400 dark:text-slate-500 py-1">
            {l}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} />;

          const status = getMockStatus(new Date(year, month, day));
          const isToday = status === "today";

          return (
            <div key={day} className="flex flex-col items-center py-0.5 group">
              <div
                className={[
                  "w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-medium transition-all",
                  isToday
                    ? "bg-violet-600 text-white font-bold shadow-sm shadow-violet-300 dark:shadow-none"
                    : status === "weekend"
                    ? "text-slate-300 dark:text-slate-600"
                    : status === "future"
                    ? "text-slate-400 dark:text-slate-500"
                    : "text-slate-700 dark:text-slate-300 group-hover:bg-slate-100 dark:group-hover:bg-slate-800",
                ].join(" ")}
              >
                {day}
              </div>
              {/* Status dot */}
              <div className="h-1.5 mt-0.5">
                {status === "present" && (
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                )}
                {status === "absent" && (
                  <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Stats + Legend ─────────────────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-emerald-700 dark:text-emerald-400">{presentCount}</span> Present
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <span className="font-medium text-red-600 dark:text-red-400">{absentCount}</span> Absent
          </div>
        </div>
        <div className="text-[10px] text-slate-400 dark:text-slate-500 italic">Mock data</div>
      </div>
    </div>
  );
}
