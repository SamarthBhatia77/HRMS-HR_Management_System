"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth-storage";
import officeImg from "@/components/ui/office.png";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Force light mode on login page even if the user has dark mode enabled elsewhere.
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    document.documentElement.classList.remove("dark");
    return () => {
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await loginUser(email.trim(), password);
      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(submitError.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Left side: Premium Image and Branding Panel */}
      <section className="hidden md:flex md:w-1/2 relative bg-slate-600 overflow-hidden items-center justify-center">
        {/* Background office image with reduced opacity and blend mode */}
        <img
          src={officeImg.src}
          alt="Modern Office Space"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-overlay scale-105"
        />
        {/* Soft linear gradient to darken bottom left */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        
        {/* Content on top of image */}
        <div className="relative z-10 p-12 text-white max-w-lg space-y-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21l16.5-9L3.75 3v7.5l11.25 1.5L3.75 13.5V21z" />
            </svg>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              Empower Your Workforce, <br />Simplify HR Operations.
            </h2>
            <p className="text-slate-305 text-slate-300 text-sm leading-relaxed font-medium">
              Seamlessly manage attendance, verify timesheets, request remote work, and track team schedules inside our unified employee platform.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-7 w-7 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 font-medium">Trusted by teams across the enterprise.</p>
          </div>
        </div>
      </section>

      {/* Right side: Login Panel (Forced Light Mode) */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white sm:px-12 md:w-1/2">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md mb-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21l16.5-9L3.75 3v7.5l11.25 1.5L3.75 13.5V21z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome To HRMS!
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Sign in with your organizational email and password.
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800 font-medium">
                <svg className="w-4 h-4 flex-shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-650 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-violet-650 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-violet-650 bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white px-5 py-3 text-sm font-semibold shadow-md shadow-violet-100 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          {/* Footer info */}
          <div className="text-center text-xs text-slate-450 text-slate-400 pt-6 border-t border-slate-100">
            <p>© {new Date().getFullYear()} HRMS Inc. All rights reserved.</p>
            <p className="mt-1 text-[10px] text-slate-400/80">Authorized access only. Logins are monitored.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
