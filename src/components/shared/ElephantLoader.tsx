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
        {/* Animated Majestic Elephant Image */}
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/elephant-majestueux-isole_23-2151857816.png"
            alt="Éléphant Akwaba"
            className="w-14 h-14 object-contain animate-bounce drop-shadow-md"
            style={{ animationDuration: "1.4s" }}
          />
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
          className="h-full bg-linear-to-r from-emerald-500 via-akwaba-green to-teal-400 transition-all duration-300 ease-out rounded-full shadow-sm"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
