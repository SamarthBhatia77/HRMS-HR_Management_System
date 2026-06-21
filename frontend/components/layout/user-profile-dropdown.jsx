"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSession, logoutUser } from "@/lib/auth-storage";
import { API_BASE_URL } from "@/lib/api";

export function UserProfileDropdown() {
  const [session, setSession] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  function loadSession() {
    setSession(getSession());
  }

  useEffect(() => {
    loadSession();

    // Listen for custom session-update events
    window.addEventListener("session-update", loadSession);
    return () => {
      window.removeEventListener("session-update", loadSession);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  // Get user initials for the fallback avatar
  const initials = session.fullName
    ? session.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  function handleLogout() {
    logoutUser();
    router.push("/login");
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none group focus:ring-2 focus:ring-violet-500 rounded-full p-0.5 transition-all duration-200"
        aria-label="User menu"
      >
        {session.profilePic ? (
          <img
            src={`${API_BASE_URL}/employees/profile/avatar/${session.profilePic}`}
            alt={session.fullName}
            className="h-9 w-9 rounded-full object-cover border-2 border-violet-100 dark:border-violet-900/50 group-hover:border-violet-300 dark:group-hover:border-violet-850 shadow-sm transition-all duration-150"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 flex items-center justify-center text-white text-sm font-bold shadow-sm transition-all duration-150">
            {initials}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 dark:from-violet-950/10 dark:to-indigo-950/10">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {session.fullName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {session.email}
            </p>
            <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 rounded-full border border-violet-100 dark:border-violet-900/40 uppercase">
              {session.role}
            </span>
          </div>

          {/* Links */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/profile");
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-slate-350 hover:text-violet-700 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors text-left font-medium"
            >
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Your Profile
            </button>
          </div>

          {/* Sign Out */}
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left font-medium"
            >
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
