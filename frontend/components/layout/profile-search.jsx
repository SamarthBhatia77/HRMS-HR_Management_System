"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, API_BASE_URL } from "@/lib/api";

export function ProfileSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

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

  // Debounced search fetching
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`/employees/search?query=${encodeURIComponent(query)}`);
        if (response.success && response.data) {
          setResults(response.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Failed to search profiles", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectProfile = (id) => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    router.push(`/profile?id=${id}`);
  };

  return (
    <div className="relative w-64 md:w-80" ref={dropdownRef}>
      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search profiles (e.g. name, title)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="w-full pl-9 pr-8 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 hover:bg-slate-50/80 dark:hover:bg-slate-950/60 focus:bg-white focus:dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-xs font-medium text-slate-700 dark:text-slate-200 transition-all placeholder-slate-400 dark:placeholder-slate-500"
        />
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
          </svg>
        </div>

        {/* Loading Spinner / Clear button */}
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
          {loading ? (
            <div className="h-3.5 w-3.5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 focus:outline-none"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Floating suggestion dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl z-50 divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
          {results.length === 0 ? (
            <div className="px-4 py-4 text-center text-xs text-slate-400 dark:text-slate-500 italic">
              No matching profiles found
            </div>
          ) : (
            results.map((emp) => {
              const initials = emp.fullName
                ? emp.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "U";

              return (
                <div
                  key={emp.id}
                  onClick={() => handleSelectProfile(emp.id)}
                  className="px-4 py-2.5 flex items-center gap-3 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 cursor-pointer transition-colors text-left"
                >
                  {emp.profilePic ? (
                    <img
                      src={`${API_BASE_URL}/employees/profile/avatar/${emp.profilePic}`}
                      alt={emp.fullName}
                      className="h-8 w-8 rounded-full object-cover border border-violet-100 dark:border-violet-900/50 flex-shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm">
                      {initials}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {emp.fullName}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                      {emp.designation} · {emp.department}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
