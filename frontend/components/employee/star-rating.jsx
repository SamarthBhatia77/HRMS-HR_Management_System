"use client";

import { useState } from "react";

const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export function StarRating({ value, onChange, readOnly = false }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
          className={[
            "transition-transform duration-100 focus:outline-none",
            !readOnly ? "hover:scale-125 cursor-pointer" : "cursor-default",
          ].join(" ")}
        >
          <svg
            className={[
              "transition-colors duration-100",
              readOnly ? "w-5 h-5" : "w-7 h-7",
              star <= active ? "text-amber-400" : "text-slate-200",
            ].join(" ")}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-sm font-medium text-slate-500">
          {LABELS[value]}
        </span>
      )}
    </div>
  );
}
