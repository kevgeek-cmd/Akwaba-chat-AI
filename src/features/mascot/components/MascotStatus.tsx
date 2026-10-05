"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MascotState } from "../types/mascot.types";

interface MascotStatusProps {
  message: string;
  state: MascotState;
  isReducedMotion?: boolean;
}

export function MascotStatus({ message, state, isReducedMotion }: MascotStatusProps) {
  const isError = state === "error";
  const isSuccess = state === "success";

  return (
    <div
      role="status"
      aria-live="polite"
      className="text-center select-none max-w-xs mx-auto px-2"
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={`${state}-${message}`}
          initial={isReducedMotion ? undefined : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={isReducedMotion ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className={`text-xs sm:text-sm font-medium transition-colors ${
            isError
              ? "text-rose-600 dark:text-rose-400 font-semibold"
              : isSuccess
              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
              : "text-slate-600 dark:text-slate-300"
          }`}
        >
          {message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
