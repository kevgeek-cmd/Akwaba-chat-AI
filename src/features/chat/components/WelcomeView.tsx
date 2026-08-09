"use client";

import React from "react";

export function WelcomeView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      {/* Central Elephant Avatar Circle with Decorative Dots */}
      <div className="relative mb-6">
        {/* Decorative Orange Dot */}
        <span className="absolute -top-1 -left-4 w-2.5 h-2.5 rounded-full bg-akwaba-orange" />
        
        {/* Decorative Green Dot */}
        <span className="absolute bottom-2 -right-4 w-2 h-2 rounded-full bg-akwaba-green" />

        {/* Outer Soft Ring */}
        <div className="w-24 h-24 rounded-full bg-emerald-50/80 dark:bg-emerald-950/20 p-2 flex items-center justify-center ring-8 ring-emerald-50/30 dark:ring-emerald-950/10 shadow-lg shadow-emerald-900/5">
          {/* Inner Green Circle with Elephant */}
          <div className="w-full h-full rounded-full bg-akwaba-green flex items-center justify-center text-white shadow-inner">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10"
            >
              <path d="M12 4c-4.4 0-8 3.6-8 8 0 2.2.9 4.2 2.3 5.7L6 20h3l.7-2.3c.7.2 1.5.3 2.3.3 4.4 0 8-3.6 8-8s-3.6-8-8-8z" />
              <path d="M15 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              <path d="M9 16c0 1.5-1 3-3 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Greeting Headline */}
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
        Bonjour ! 👋
      </h1>

      {/* Subtitle */}
      <p className="text-slate-500 dark:text-slate-400 text-base max-w-md">
        Comment puis-je vous aider aujourd&apos;hui ?
      </p>
    </div>
  );
}
