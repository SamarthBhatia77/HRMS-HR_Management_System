"use client";

import { useState, useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function fetchNotifications() {
    try {
      const response = await apiFetch("/notifications");
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  }

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleMarkAllRead() {
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMarkSingleRead(id) {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: "POST" });
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  }

  function formatTime(dateStr) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) + 
             " · " + 
             d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all duration-150 focus:outline-none"
        aria-label="View notifications"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center justify-between">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-violet-100 hover:text-white transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs italic">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkSingleRead(n.id)}
                  className={[
                    "p-3.5 text-left text-xs transition-colors cursor-pointer",
                    n.isRead 
                      ? "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60" 
                      : "bg-violet-50/50 dark:bg-violet-950/20 hover:bg-violet-50 dark:hover:bg-violet-950/30",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Icon based on type */}
                    <div className="text-base pt-0.5">
                      {n.type === "LEAVE_REQUEST" ? "📅" : "💬"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={[
                        "text-slate-700 dark:text-slate-200 leading-normal",
                        !n.isRead ? "font-semibold" : "font-normal",
                      ].join(" ")}>
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        {formatTime(n.createdAt)}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-400 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
