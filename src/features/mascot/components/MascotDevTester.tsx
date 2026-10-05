"use client";

import React, { useState } from "react";
import { MascotState } from "../types/mascot.types";
import { AkwabaMascot } from "./AkwabaMascot";

export function MascotDevTester() {
  const [testState, setTestState] = useState<MascotState>("walking");
  const [testProgress, setTestProgress] = useState(15);
  const [isOpen, setIsOpen] = useState(false);

  const selectState = (state: MascotState, progress: number) => {
    setTestState(state);
    setTestProgress(progress);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {isOpen ? (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 w-72 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              🧪 Mascot Tester
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-1"
            >
              ✕
            </button>
          </div>

          <div className="w-full flex justify-center py-1">
            <AkwabaMascot state={testState} progress={testProgress} size="sm" />
          </div>

          <div className="grid grid-cols-3 gap-1.5 w-full mt-3">
            <button
              onClick={() => selectState("walking", 15)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                testState === "walking"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              Walking
            </button>
            <button
              onClick={() => selectState("running", 38)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                testState === "running"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              Running
            </button>
            <button
              onClick={() => selectState("searching", 73)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                testState === "searching"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              Searching
            </button>
            <button
              onClick={() => selectState("success", 100)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                testState === "success"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              Success
            </button>
            <button
              onClick={() => selectState("error", 0)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                testState === "error"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              Error
            </button>
            <button
              onClick={() => selectState("idle", 0)}
              className={`px-2 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                testState === "idle"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              Idle
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="px-3 py-1.5 rounded-full bg-slate-900/80 dark:bg-white/10 hover:bg-slate-900 text-white text-[11px] font-semibold backdrop-blur-sm border border-white/20 shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          title="Ouvrir le panneau de test Mascot"
        >
          <span>🐘</span>
          <span>Test Mascot</span>
        </button>
      )}
    </div>
  );
}
