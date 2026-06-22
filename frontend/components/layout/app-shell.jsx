"use client";

import { usePathname, useRouter } from "next/navigation";
import { logoutUser } from "@/lib/auth-storage";
import { NotificationBell } from "./notification-bell";
import { UserProfileDropdown } from "./user-profile-dropdown";
import { ProfileSearch } from "./profile-search";
import { DarkModeToggle } from "./dark-mode-toggle";

const HR_NAV = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: "Circulars",
    href: "/circulars",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: "Work From Home",
    href: "/leaves",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: "Payroll",
    href: "/payroll",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    label: "Employees",
    href: "/employees",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
];

const HR_TOOLS_NAV = [
  {
    label: "Feedback Inbox",
    href: "/hr/feedback",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    label: "Complaints",
    href: "/hr/complaints",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
      </svg>
    ),
  },
];

function NavLink({ label, href, icon, pathname }) {
  const active = pathname === href;
  return (
    <a
      href={href}
      className={[
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
        active
          ? "bg-brand-700 text-white shadow-sm"
          : "text-slate-600 dark:text-slate-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-700 dark:hover:text-brand-300",
      ].join(" ")}
    >
      <span className={["transition-colors", active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400"].join(" ")}>
        {icon}
      </span>
      {label}
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/60" />}
    </a>
  );
}

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logoutUser();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-200">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-col md:flex transition-colors duration-200">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-100 dark:border-slate-800/30 flex-shrink-0">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-700 to-brand-500 flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21l16.5-9L3.75 3v7.5l11.25 1.5L3.75 13.5V21z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">HRMS</p>
            <p className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-widest mt-0.5">HR Operations</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {HR_NAV.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} />
          ))}

          {/* HR Tools section */}
          <div className="px-3 pt-5 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">HR Tools</p>
          </div>
          {HR_TOOLS_NAV.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} />
          ))}
        </nav>

        {/* Bottom logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/40 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
          >
            <svg className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 h-16 border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between transition-colors duration-200">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">HR Operations Workspace</span>
          <ProfileSearch />
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900/30 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-400">HR Admin</span>
            <DarkModeToggle />
            <NotificationBell />
            <UserProfileDropdown />
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
