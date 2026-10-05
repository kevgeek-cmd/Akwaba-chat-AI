"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import { MascotState } from "../types/mascot.types";

interface MascotProgressProps {
  progress: number;
  state: MascotState;
  isReducedMotion?: boolean;
}

export function MascotProgress({ progress, state, isReducedMotion }: MascotProgressProps) {
  const isSuccess = state === "success" || progress >= 100;
  const isError = state === "error";

  return (
    <motion.div
      initial={isReducedMotion ? undefined : { opacity: 0, y: -6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={isReducedMotion ? undefined : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 shadow-md shadow-emerald-950/5 select-none"
      aria-label={`Progression : ${progress}%`}
    >
      {/* Anneau de progression circulaire discret */}
      {!isSuccess && !isError && (
        <div className="relative w-3.5 h-3.5 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-slate-200 dark:text-slate-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-500 dark:text-emerald-400 transition-all duration-300 ease-out"
              strokeDasharray={`${progress}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
        </div>
      )}

      {/* Contenu textuel / icône */}
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success-badge"
            initial={isReducedMotion ? undefined : { scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs"
          >
            <Check className="w-3.5 h-3.5 stroke-3" />
            <span>Prêt</span>
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error-badge"
            initial={isReducedMotion ? undefined : { scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-bold text-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Erreur</span>
          </motion.div>
        ) : (
          <motion.span
            key="progress-text"
            className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-mono tracking-tight"
          >
            {Math.round(progress)} %
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
