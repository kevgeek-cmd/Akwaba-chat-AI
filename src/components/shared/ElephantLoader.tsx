"use client";

import React, { useState, useEffect } from "react";

export function ElephantLoader() {
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    // Simuler une progression fluide de 5% à 95% pendant l'attente
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 30) return prev + Math.floor(Math.random() * 8 + 4);
        if (prev < 70) return prev + Math.floor(Math.random() * 5 + 2);
        if (prev < 92) return prev + Math.floor(Math.random() * 3 + 1);
        return prev;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-start gap-3 py-2 px-1 animate-fade-in">
      {/* Animated Elephant & Progress Header */}
      <div className="flex items-center gap-3">
        {/* Animated Walking Elephant SVG */}
        <div className="relative w-12 h-10 flex items-center justify-center">
          <svg
            viewBox="0 0 100 80"
            className="w-12 h-10 animate-bounce"
            style={{ animationDuration: "1.2s" }}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Elephant Body */}
            <path
              d="M30 35 C30 18, 70 18, 75 35 C82 35, 90 42, 90 52 C90 62, 85 68, 78 68 L30 68 C20 68, 15 58, 15 48 C15 38, 22 35, 30 35 Z"
              fill="#057A55"
            />
            {/* Elephant Head & Ear */}
            <circle cx="28" cy="38" r="14" fill="#046C4E" />
            <path
              d="M35 28 C45 28, 45 48, 33 48 C30 48, 28 42, 35 28 Z"
              fill="#0E9F6E"
              className="animate-pulse"
            />
            {/* Elephant Eye */}
            <circle cx="24" cy="35" r="2.5" fill="#FFFFFF" />
            <circle cx="23.5" cy="35" r="1.2" fill="#111827" />

            {/* Elephant Trunk (Trompe relevée Akwaba) */}
            <path
              d="M18 42 C10 42, 8 32, 12 24 C14 20, 18 20, 16 26 C14 30, 16 36, 22 38 Z"
              fill="#046C4E"
              className="origin-bottom-right animate-spin"
              style={{ animationDuration: "3s" }}
            />

            {/* Elephant Tusk (Défense en Or / Ivoire) */}
            <path
              d="M20 45 Q 12 48, 15 40"
              stroke="#F39C12"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Elephant Walking Legs */}
            {/* Front Leg 1 */}
            <rect
              x="28"
              y="60"
              width="7"
              height="16"
              rx="3.5"
              fill="#03543F"
              className="animate-pulse"
            />
            {/* Front Leg 2 */}
            <rect
              x="42"
              y="60"
              width="7"
              height="16"
              rx="3.5"
              fill="#046C4E"
            />
            {/* Back Leg 1 */}
            <rect
              x="58"
              y="60"
              width="7"
              height="16"
              rx="3.5"
              fill="#03543F"
              className="animate-pulse"
            />
            {/* Back Leg 2 */}
            <rect
              x="70"
              y="60"
              width="7"
              height="16"
              rx="3.5"
              fill="#046C4E"
            />

            {/* Tail */}
            <path
              d="M78 50 Q 86 54, 84 62"
              stroke="#03543F"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Status text & percentage counter */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Akwaba IA prépare la réponse...
            </span>
            <span className="text-xs font-extrabold text-akwaba-green font-mono">
              {progress}%
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Analyse et réflexion en cours 🐘
          </span>
        </div>
      </div>

      {/* Smooth Progress Bar Indicator */}
      <div className="w-full max-w-xs h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-akwaba-green to-teal-400 transition-all duration-300 ease-out rounded-full shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
