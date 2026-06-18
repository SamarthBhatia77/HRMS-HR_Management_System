"use client";

import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial state from class on mount
    setIsDark(document.documentElement.classList.contains("dark"));

    const handleThemeUpdate = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    window.addEventListener("theme-update", handleThemeUpdate);
    return () => window.removeEventListener("theme-update", handleThemeUpdate);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    } else {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    }
    window.dispatchEvent(new Event("theme-update"));
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all duration-200 focus:outline-none"
      aria-label="Toggle dark mode"
      id="dark-mode-toggle-btn"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon */}
        <svg
          className={[
            "w-5 h-5 absolute transition-all duration-300 transform",
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
          ].join(" ")}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m0 13.5V21M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M3 12h2.25m13.5 0H21M9.75 9.75c0 1.242 1.008 2.25 2.25 2.25s2.25-1.008 2.25-2.25-1.008-2.25-2.25-2.25-2.25 1.008-2.25 2.25z"
          />
        </svg>

        {/* Moon Icon */}
        <svg
          className={[
            "w-5 h-5 absolute transition-all duration-300 transform",
            isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
          ].join(" ")}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.009c-.13-.01-.26-.02-.39-.02a9.75 9.75 0 109.03 9.03c.01-.13.02-.26.02-.39a9.75 9.75 0 01-8.66-8.62z"
          />
        </svg>
      </div>
    </button>
  );
}
