"use client";

import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { MascotState, MascotErrorCode } from "../types/mascot.types";
import { mascotAssets } from "../constants/mascot-assets";
import { MascotProgress } from "./MascotProgress";
import { MascotStatus } from "./MascotStatus";
import { getMascotMessage } from "../utils/mascot-state-machine";

export interface AkwabaMascotProps {
  state: MascotState;
  progress: number;
  message?: string;
  errorCode?: MascotErrorCode | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AkwabaMascot({
  state,
  progress,
  message,
  errorCode,
  className = "",
  size = "md",
}: AkwabaMascotProps) {
  const shouldReduceMotion = useReducedMotion();

  // Pré-chargement des 5 images pour éliminer tout clignotement lors des transitions
  useEffect(() => {
    Object.values(mascotAssets).forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  const activeSrc = useMemo(() => {
    switch (state) {
      case "walking":
        return mascotAssets.walking;
      case "running":
        return mascotAssets.running;
      case "searching":
        return mascotAssets.searching;
      case "success":
        return mascotAssets.success;
      case "error":
        return mascotAssets.error;
      case "idle":
      default:
        return mascotAssets.walking;
    }
  }, [state]);

  const displayMessage = useMemo(() => {
    return getMascotMessage(state, progress, message, errorCode);
  }, [state, progress, message, errorCode]);

  // Dimensionnements adaptés
  const dimensions = useMemo(() => {
    switch (size) {
      case "sm":
        return { container: "w-40", imageSize: 130, height: "h-36" };
      case "lg":
        return { container: "w-64", imageSize: 210, height: "h-56" };
      case "md":
      default:
        return { container: "w-52 sm:w-56", imageSize: 175, height: "h-48" };
    }
  }, [size]);

  // Variantes d'animations pour chaque état
  const stateVariants: Variants = {
    walking: {
      opacity: 1,
      scale: 1,
      y: [0, -6, 0],
      x: [-3, 3, -3],
      rotate: [-1.5, 1.5, -1.5],
      transition: {
        y: { duration: 0.8, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
      },
    },
    running: {
      opacity: 1,
      scale: 1,
      y: [0, -10, 0],
      x: [-5, 5, -5],
      rotate: [3, 7, 3],
      transition: {
        y: { duration: 0.45, repeat: Infinity, ease: "easeOut" },
        x: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 0.45, repeat: Infinity, ease: "easeInOut" },
      },
    },
    searching: {
      opacity: 1,
      scale: [1, 1.01, 1],
      y: [0, -2, 0],
      rotate: [0, 0.8, 0],
      transition: {
        y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
      },
    },
    success: {
      opacity: 1,
      y: [0, -16, 0],
      rotate: [-2, 3, -2],
      scale: [1, 1.04, 1],
      transition: {
        y: { duration: 0.65, repeat: Infinity, ease: "easeOut" },
        rotate: { duration: 0.65, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.65, repeat: Infinity, ease: "easeInOut" },
      },
    },
    error: {
      opacity: 1,
      scale: 1,
      y: [0, 2, 0],
      rotate: [0, -1, 0],
      transition: {
        y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      },
    },
    idle: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: 0,
    },
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 select-none ${dimensions.container} mx-auto ${className}`}
      data-mascot-state={state}
    >
      {/* 1. Badge Indicateur au-dessus de la tête de l'éléphant */}
      <div className="mb-2">
        <MascotProgress
          progress={progress}
          state={state}
          isReducedMotion={Boolean(shouldReduceMotion)}
        />
      </div>

      {/* 2. Scène visuelle de l'éléphant avec ombre de sol */}
      <div className={`relative flex items-center justify-center ${dimensions.height} w-full`}>
        {/* Ombre portée dynamique sous l'éléphant */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : state === "running"
              ? { scaleX: [1, 0.75, 1], opacity: [0.35, 0.2, 0.35] }
              : state === "success"
              ? { scaleX: [1, 0.65, 1], opacity: [0.4, 0.15, 0.4] }
              : state === "walking"
              ? { scaleX: [1, 0.85, 1], opacity: [0.3, 0.22, 0.3] }
              : { scaleX: [1, 0.95, 1], opacity: [0.25, 0.2, 0.25] }
          }
          transition={{
            duration: state === "running" ? 0.45 : state === "success" ? 0.65 : 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1 w-28 sm:w-32 h-3.5 bg-slate-900/15 dark:bg-black/40 rounded-full blur-xs pointer-events-none"
        />

        {/* Personnage Akwaba animé avec transition fluide AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            variants={stateVariants}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : state}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: -4 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="relative z-1 flex items-center justify-center"
          >
            <Image
              src={activeSrc}
              alt={`Akwaba Chat - État ${state}`}
              width={dimensions.imageSize}
              height={dimensions.imageSize}
              priority
              className="object-contain drop-shadow-md pointer-events-none select-none"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Texte d'état dynamique accessible */}
      <div className="mt-2 w-full">
        <MascotStatus
          message={displayMessage}
          state={state}
          isReducedMotion={Boolean(shouldReduceMotion)}
        />
      </div>
    </div>
  );
}
