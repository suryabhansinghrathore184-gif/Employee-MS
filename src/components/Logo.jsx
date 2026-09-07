import React from 'react';

export default function Logo({ variant = 'full', dark = false }) {
  const isDark = dark;

  // Modern SVG Icon combining 3 connected people figures inside a shield + green growth arrow
  const BrandIcon = (
    <div className="relative w-10 h-10 shrink-0">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xs">
        {/* Shield Outer Container */}
        <path
          d="M50 8L85 22V50C85 71.5 69.8 90.8 50 96C30.2 90.8 15 71.5 15 50V22L50 8Z"
          className={isDark ? "fill-blue-600" : "fill-slate-900"}
        />
        <path
          d="M50 14L78 26V49C78 66.8 65.5 82.7 49.5 87.2C33.5 82.7 21 66.8 21 49V26L50 14Z"
          className="fill-blue-600"
        />

        {/* 3 Connected Team Figures (White) */}
        {/* Center Figure */}
        <circle cx="50" cy="36" r="6" fill="white" />
        <path d="M41 54C41 48 45 44 50 44C55 44 59 48 59 54V64H41V54Z" fill="white" />

        {/* Left Figure */}
        <circle cx="36" cy="40" r="5" fill="white" fillOpacity="0.9" />
        <path d="M29 56C29 51 32.5 48 36.5 48C39.5 48 42 50 43 53V64H29V56Z" fill="white" fillOpacity="0.9" />

        {/* Right Figure */}
        <circle cx="64" cy="40" r="5" fill="white" fillOpacity="0.9" />
        <path d="M57 53C58 50 60.5 48 63.5 48C67.5 48 71 51 71 56V64H57V53Z" fill="white" fillOpacity="0.9" />

        {/* Dynamic Upward Growth Arrow (Green Accent) */}
        <path
          d="M26 68L44 54L58 64L76 42"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M66 42H76V52"
          stroke="#10B981"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  if (variant === 'icon') {
    return BrandIcon;
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 select-none">
        {BrandIcon}
        <span className={`font-extrabold text-2xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          EMS
        </span>
      </div>
    );
  }

  if (variant === 'medium') {
    return (
      <div className="flex items-center gap-3 select-none">
        {BrandIcon}
        <div>
          <span className={`font-extrabold text-2xl tracking-tight leading-none block ${isDark ? 'text-white' : 'text-slate-900'}`}>
            EMS
          </span>
          <span className={`text-xs font-semibold block ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            Employee Management System
          </span>
        </div>
      </div>
    );
  }

  // Full Variant
  return (
    <div className="flex items-center gap-3.5 select-none">
      {BrandIcon}
      <div className="space-y-0.5">
        <span className={`font-extrabold text-2xl tracking-tight leading-none block ${isDark ? 'text-white' : 'text-slate-900'}`}>
          EMS
        </span>
        <span className={`text-xs font-bold block ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
          Employee Management System
        </span>
        <span className={`text-[10px] font-medium tracking-tight block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Manage People • Improve Productivity • Grow Together
        </span>
      </div>
    </div>
  );
}
