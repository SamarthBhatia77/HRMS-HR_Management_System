"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getSession } from "@/lib/auth-storage";

export function CelebrationModal() {
  const [showModal, setShowModal] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (!session) return;

    const flag = sessionStorage.getItem("wished_birthday_anniversary");
    if (flag) return;

    async function checkCelebrations() {
      try {
        const res = await apiFetch("/employees/profile");
        if (res.success && res.data) {
          const profile = res.data;
          
          // Get today's local date details
          const today = new Date();
          const currentMonth = today.getMonth() + 1; // 1-12
          const currentDay = today.getDate();

          let isBday = false;
          let isAnniv = false;
          let serviceYears = 0;

          if (profile.birthDate) {
            const bdate = new Date(profile.birthDate);
            // Handling timezone offsets safely
            if (bdate.getMonth() + 1 === currentMonth && bdate.getDate() === currentDay) {
              isBday = true;
            }
          }

          if (profile.joiningDate) {
            const jdate = new Date(profile.joiningDate);
            if (jdate.getMonth() + 1 === currentMonth && jdate.getDate() === currentDay) {
              serviceYears = today.getFullYear() - jdate.getFullYear();
              if (serviceYears > 0) {
                isAnniv = true;
              }
            }
          }

          if (isBday || isAnniv) {
            setCelebrationData({
              isBirthday: isBday,
              isAnniversary: isAnniv,
              years: serviceYears,
              fullName: profile.fullName
            });
            setShowModal(true);
          }
          // Mark as wished for this session
          sessionStorage.setItem("wished_birthday_anniversary", "true");
        }
      } catch (err) {
        console.error("Failed to check birthday/anniversary", err);
      }
    }

    // Delay checking slightly to ensure UI is ready and session is fully resolved
    const timer = setTimeout(checkCelebrations, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!showModal || !celebrationData) return null;

  const { isBirthday, isAnniversary, years, fullName } = celebrationData;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Semi-transparent blur backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={() => setShowModal(false)}
      />

      {/* Celebration Card */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Celebration Background Accents */}
        <div className="absolute -top-16 -left-16 w-32 h-32 rounded-full bg-violet-400/20 blur-2xl" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 rounded-full bg-indigo-400/20 blur-2xl" />

        {/* Confetti Animation Effect (pure CSS / emoji) */}
        <div className="text-5xl animate-bounce mb-6">
          {isBirthday && isAnniversary ? "🎉🎂✨🎊" : isBirthday ? "🎂🎉🎁" : "🎊🎖️⭐"}
        </div>

        {/* Warm Title */}
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-3">
          {isBirthday && isAnniversary ? (
            <>Double Celebration! 🎉</>
          ) : isBirthday ? (
            <>Happy Birthday! 🎂</>
          ) : (
            <>Work Anniversary! 🎖️</>
          )}
        </h2>

        {/* Personalized Message */}
        <p className="text-sm font-medium text-violet-750 dark:text-violet-400 uppercase tracking-widest mb-4">
          Dear {fullName}
        </p>

        <p className="text-slate-600 dark:text-slate-355 text-sm leading-relaxed mb-8">
          {isBirthday && isAnniversary ? (
            `Warmest wishes on your birthday and your ${years}${getOrdinalSuffix(years)} work anniversary today! Thank you for being such an integral part of HRMS.`
          ) : isBirthday ? (
            `Wishing you a fantastic birthday filled with happiness, success, and good health! Have an amazing day ahead.`
          ) : (
            `Congratulations on completing ${years} year${years > 1 ? "s" : ""} of dedicated service at our organization! Happy ${years}${getOrdinalSuffix(years)} work anniversary, and thank you for your contributions.`
          )}
        </p>

        {/* Action Button */}
        <button
          onClick={() => setShowModal(false)}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
        >
          Thank You!
        </button>

        {/* Close Icon */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          aria-label="Close celebration popup"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function getOrdinalSuffix(number) {
  const s = ["th", "st", "nd", "rd"];
  const v = number % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}
