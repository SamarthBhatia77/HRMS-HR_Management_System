"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/lib/auth-storage";
import { AttendanceCalendar } from "@/components/employee/attendance-calendar";

/* ─── HR Admin dashboard (unchanged UI) ─────────────────────── */
const HR_METRICS = [
  { label: "Present Today",  value: "42", sub: "↑ 3 from yesterday",  accent: "emerald" },
  { label: "Pending Leaves", value: "8",  sub: "Needs review",        accent: "amber"   },
  { label: "Overtime Flags", value: "5",  sub: "This week",           accent: "red"     },
  { label: "Payroll Ready",  value: "91%",sub: "8 employees pending", accent: "blue"    },
];

const ACCENT = {
  emerald: "text-emerald-600 bg-emerald-50",
  amber:   "text-amber-600 bg-amber-50",
  red:     "text-red-600 bg-red-50",
  blue:    "text-blue-600 bg-blue-50",
};

function HrAdminDashboard() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Attendance, leave, payroll, and HR operations overview.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {HR_METRICS.map(({ label, value, sub, accent }) => (
          <article
            key={label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950 dark:text-slate-50">{value}</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ─── Employee / Manager dashboard ──────────────────────────── */
const MOCK_STATS = {
  attendancePct:  94,
  leavesTotal:    21,
  leavesUsed:     6,
  pendingLeaves:  1,
};

function StatCard({ icon, label, value, sub, colorClass }) {
  return (
    <article className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>
      </div>
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colorClass}`}>
        {icon}
      </div>
    </article>
  );
}

function QuickLink({ href, icon, title, sub, borderColor, bgHover, textHover, iconBg, iconHover }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-xl border bg-white dark:bg-slate-900 p-4 shadow-sm transition-all group ${borderColor} ${bgHover}`}
    >
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${iconBg} ${iconHover}`}>
        {icon}
      </div>
      <div>
        <p className={`text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors ${textHover}`}>{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
      </div>
      <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 ml-auto group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </a>
  );
}

function EmployeeDashboard({ session }) {
  const { attendancePct, leavesTotal, leavesUsed, pendingLeaves } = MOCK_STATS;
  const leavesLeft = leavesTotal - leavesUsed;
  const isManager = session?.role === "MANAGER";

  const statCards = [
    {
      icon: "📊",
      label: "Attendance Rate",
      value: `${attendancePct}%`,
      sub: "This month",
      colorClass: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: "🌿",
      label: "Leaves Remaining",
      value: String(leavesLeft),
      sub: `of ${leavesTotal} annual days`,
      colorClass: "bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400",
    },
    {
      icon: "📅",
      label: "Leaves Taken",
      value: String(leavesUsed),
      sub: "This calendar year",
      colorClass: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
    },
    {
      icon: "⏳",
      label: "Pending Requests",
      value: String(pendingLeaves),
      sub: "Awaiting approval",
      colorClass: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    },
  ];

  return (
    <section className="space-y-6">
      {/* Hero / greeting banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 via-violet-700 to-indigo-700 p-6 text-white shadow-lg shadow-violet-200">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-6 right-20 h-28 w-28 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute top-6 right-40 h-10 w-10 rounded-full bg-white/10" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isManager ? "Manager" : "Employee"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {getTimeGreeting()}, {session?.fullName?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="mt-1.5 text-sm text-violet-200 max-w-lg">
            {isManager
              ? "Your team's leave requests and attendance are ready for review."
              : "Here's your personal overview for today. Have a great day at work!"}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Calendar + Quick Links */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Attendance Calendar — wider */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Attendance This Month</h2>
          </div>
          <AttendanceCalendar />
        </div>

        {/* Quick Actions + Leave balance */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Quick Actions</h2>

          <QuickLink
            href="/employee/leaves"
            title="Apply for Leave"
            sub={`${leavesLeft} days remaining`}
            borderColor="border-violet-100 hover:border-violet-300 dark:border-violet-900/30 dark:hover:border-violet-850"
            bgHover="hover:bg-violet-50 dark:hover:bg-violet-950/10"
            textHover="group-hover:text-violet-700 dark:group-hover:text-violet-400"
            iconBg="bg-violet-100 dark:bg-violet-950/40"
            iconHover="group-hover:bg-violet-200 dark:group-hover:bg-violet-900/30"
            icon={
              <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            }
          />

          <QuickLink
            href="/employee/feedback"
            title="Submit Feedback"
            sub="Goes to manager & HR Admin"
            borderColor="border-indigo-100 hover:border-indigo-300 dark:border-indigo-900/30 dark:hover:border-indigo-850"
            bgHover="hover:bg-indigo-50 dark:hover:bg-indigo-950/10"
            textHover="group-hover:text-indigo-700 dark:group-hover:text-indigo-400"
            iconBg="bg-indigo-100 dark:bg-indigo-950/40"
            iconHover="group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/30"
            icon={
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
            }
          />

          {/* Leave balance visual */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Leave Balance</p>
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500 dark:text-slate-400">{leavesUsed} used of {leavesTotal}</span>
                <span className="font-semibold text-violet-700 dark:text-violet-400">{leavesLeft} left</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
                  style={{ width: `${(leavesUsed / leavesTotal) * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                ["Annual",    "15", "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400"],
                ["Sick",      "4",  "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"],
                ["Casual",    "2",  "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"],
              ].map(([type, days, cls]) => (
                <div key={type} className={`rounded-lg p-2 text-center ${cls}`}>
                  <p className="text-base font-bold">{days}</p>
                  <p className="text-[10px] font-medium opacity-70">{type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Root page ──────────────────────────────────────────────── */
export default function DashboardPage() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (session?.role === "HR_ADMIN") {
    return <HrAdminDashboard />;
  }

  return <EmployeeDashboard session={session} />;
}
