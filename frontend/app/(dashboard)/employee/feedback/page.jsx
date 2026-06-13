"use client";

import { useState } from "react";
import { StarRating } from "@/components/employee/star-rating";

/* ─── Constants ─────────────────────────────────────────────── */
const CATEGORIES = [
  { value: "WORK_ENV",    label: "Work Environment",  icon: "🏢" },
  { value: "MANAGEMENT",  label: "Management",         icon: "👥" },
  { value: "HR",          label: "HR & Policies",      icon: "📋" },
  { value: "PROCESS",     label: "Processes & Tools",  icon: "⚙️" },
  { value: "GROWTH",      label: "Growth & Learning",  icon: "📈" },
  { value: "OTHER",       label: "Other",              icon: "💬" },
];

const INITIAL_FEEDBACK = [
  {
    id: 1,
    category: "WORK_ENV",
    title: "Great team collaboration",
    details:
      "The team has been very supportive and collaborative throughout the project. I genuinely enjoy coming to work every day. The open-door policy makes it easy to raise concerns.",
    rating: 5,
    anonymous: false,
    submittedOn: "2026-05-20",
  },
];

/* ─── Helpers ───────────────────────────────────────────────── */
function fmtDate(str) {
  return new Date(str).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCat(value) {
  return CATEGORIES.find((c) => c.value === value) ?? { label: value, icon: "💬" };
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function EmployeeFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState(INITIAL_FEEDBACK);

  // Form state
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const charCount = details.length;
  const MAX_CHARS = 1000;

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!category)      { setFormError("Please choose a feedback category."); return; }
    if (rating === 0)   { setFormError("Please give an overall rating."); return; }
    if (!title.trim())  { setFormError("Please add a short feedback title."); return; }
    if (!details.trim()){ setFormError("Please write your feedback details."); return; }
    if (charCount > MAX_CHARS) { setFormError(`Details must be under ${MAX_CHARS} characters.`); return; }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));

    setFeedbackList((prev) => [
      {
        id: Date.now(),
        category,
        title: title.trim(),
        details: details.trim(),
        rating,
        anonymous,
        submittedOn: new Date().toISOString().slice(0, 10),
      },
      ...prev,
    ]);

    setSuccessMsg(
      anonymous
        ? "Feedback sent anonymously to your manager and HR Admin. Thank you!"
        : "Feedback sent to your manager and HR Admin. Thank you for sharing!"
    );
    setCategory(""); setRating(0); setTitle(""); setDetails(""); setAnonymous(false);
    setSubmitting(false);
    setTimeout(() => setSuccessMsg(""), 5000);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Page Header ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Feedback Portal</h1>
        <p className="mt-1 text-sm text-slate-500">
          Share your thoughts openly. All feedback is reviewed by your manager and the HR Admin.
        </p>
      </div>

      {/* ── Info Banner ─────────────────────────────────────── */}
      <div className="flex items-start gap-3 rounded-2xl bg-indigo-50 border border-indigo-100 px-5 py-4">
        <div className="h-9 w-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-800">Your feedback makes a difference</p>
          <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">
            Submissions go directly to your reporting manager and the HR Admin. You can choose to remain anonymous.
            Constructive feedback helps build a better workplace.
          </p>
        </div>
      </div>

      {/* ── Success toast ───────────────────────────────────── */}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* ── Feedback Form ───────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* Form header strip */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4">
          <h2 className="text-base font-semibold text-white">Submit New Feedback</h2>
          <p className="text-xs text-indigo-200 mt-0.5">
            Be honest and constructive — it helps everyone grow.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6" id="feedback-form">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              {formError}
            </div>
          )}

          {/* Category grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {CATEGORIES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  id={`cat-${value}`}
                  onClick={() => setCategory(value)}
                  className={[
                    "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-[11px] font-medium transition-all duration-150",
                    category === value
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm scale-[1.03]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/40 hover:scale-[1.02]",
                  ].join(" ")}
                >
                  <span className="text-xl leading-none">{icon}</span>
                  <span className="leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Overall Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <StarRating value={rating} onChange={setRating} />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Feedback Title <span className="text-red-400">*</span>
            </label>
            <input
              id="feedback-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Summarise your feedback in a sentence…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Details <span className="text-red-400">*</span>
              </label>
              <span
                className={`text-xs ${charCount > MAX_CHARS ? "text-red-500 font-semibold" : "text-slate-400"}`}
              >
                {charCount} / {MAX_CHARS}
              </span>
            </div>
            <textarea
              id="feedback-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              placeholder="Describe your feedback in detail. What worked well? What could be better? Be specific and constructive."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          {/* Anonymous toggle */}
          <label
            htmlFor="anon-toggle"
            className="flex items-start gap-3 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-indigo-50/30 hover:border-indigo-200 transition-colors"
          >
            <input
              id="anon-toggle"
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <div>
              <p className="text-sm font-semibold text-slate-700">Submit anonymously</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Your name will not be shown to the feedback recipient. HR can still trace submissions if required by policy.
              </p>
            </div>
          </label>

          {/* Submit button */}
          <div className="flex justify-end pt-1 border-t border-slate-100">
            <button
              type="submit"
              id="feedback-submit-btn"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-500 disabled:opacity-60 active:scale-95 transition-all"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Send Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Past Feedback ────────────────────────────────────── */}
      {feedbackList.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-800 mb-3">
            Your Submitted Feedback
          </h2>
          <div className="space-y-3" id="feedback-history">
            {feedbackList.map((fb) => {
              const cat = getCat(fb.category);
              return (
                <div
                  key={fb.id}
                  className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Category icon bubble */}
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl flex-shrink-0">
                      {cat.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">{fb.title}</p>
                        {fb.anonymous && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                            Anonymous
                          </span>
                        )}
                      </div>

                      {/* Meta */}
                      <p className="text-xs text-slate-400 mt-0.5">
                        {cat.label} &nbsp;·&nbsp; {fmtDate(fb.submittedOn)}
                      </p>

                      {/* Details */}
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {fb.details}
                      </p>
                    </div>

                    {/* Stars (read-only) */}
                    <div className="flex-shrink-0 pt-0.5">
                      <StarRating value={fb.rating} readOnly />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
