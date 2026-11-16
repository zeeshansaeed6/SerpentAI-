import React from 'react';

// Brand mark: an S-curve serpent with a thermal-orange eye (replaces the emoji logo)
export default function SerpentMark({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="serpent-mark-grad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bef264" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path
        className="mark-body"
        pathLength="1"
        d="M21.5 6.5c-5.5-2.8-12.5-.2-11.5 4.7 1 4.8 9.2 4.4 12 8.6 2.4 3.6-3.6 7.4-10.5 5.2"
        stroke="url(#serpent-mark-grad)"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle className="mark-eye" cx="22.6" cy="6.9" r="1.5" fill="#fb923c" />
    </svg>
  );
}
