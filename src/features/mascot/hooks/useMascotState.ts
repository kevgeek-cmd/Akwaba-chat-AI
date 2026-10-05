"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MascotState, MascotErrorCode } from "../types/mascot.types";
import {
  getMascotState,
  getMascotMessage,
  isValidStateTransition,
} from "../utils/mascot-state-machine";

export interface UseMascotStateProps {
  initialState?: MascotState;
  initialProgress?: number;
  initialMessage?: string;
  autoTimeoutMs?: number;
  onTimeout?: () => void;
  testModeState?: MascotState | null;
}

export function useMascotState({
  initialState = "idle",
  initialProgress = 0,
  initialMessage,
  autoTimeoutMs = 45000,
  onTimeout,
  testModeState,
}: UseMascotStateProps = {}) {
  const [internalState, setInternalState] = useState<MascotState>(initialState);
  const [internalProgress, setInternalProgress] = useState<number>(initialProgress);
  const [internalMessage, setInternalMessage] = useState<string>(
    initialMessage || getMascotMessage(initialState, initialProgress)
  );
  const [errorCode, setErrorCode] = useState<MascotErrorCode | string | undefined>();

  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  // État dérivé pur si un testModeState est spécifié (zéro cascade render)
  const state = testModeState || internalState;
  const progress = testModeState
    ? testModeState === "walking"
      ? 15
      : testModeState === "running"
      ? 35
      : testModeState === "searching"
      ? 72
      : testModeState === "success"
      ? 100
      : 0
    : internalProgress;
  const message = testModeState
    ? getMascotMessage(testModeState, progress)
    : internalMessage;

  // Surveillance du timeout de sécurité
  const resetTimeout = useCallback(() => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    if (autoTimeoutMs > 0 && state !== "idle" && state !== "success" && state !== "error") {
      timeoutTimerRef.current = setTimeout(() => {
        setInternalState("error");
        setErrorCode("TIMEOUT");
        setInternalMessage(getMascotMessage("error", progress, undefined, "TIMEOUT"));
        if (onTimeout) onTimeout();
      }, autoTimeoutMs);
    }
  }, [autoTimeoutMs, state, progress, onTimeout]);

  useEffect(() => {
    resetTimeout();
    return () => {
      if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
    };
  }, [resetTimeout]);

  // Émission d'un changement de progression
  const updateProgress = useCallback(
    (newProgress: number, explicitState?: MascotState, customMessage?: string) => {
      const clamped = Math.max(0, Math.min(100, newProgress));
      setInternalProgress(clamped);

      const targetState = explicitState || getMascotState(clamped);

      setInternalState((current) => {
        if (isValidStateTransition(current, targetState)) {
          setInternalMessage(getMascotMessage(targetState, clamped, customMessage));
          return targetState;
        }
        // Même si l'état ne change pas, mettre à jour le message si fourni
        setInternalMessage(getMascotMessage(current, clamped, customMessage));
        return current;
      });
    },
    []
  );

  // Déclencher une erreur explicite
  const triggerError = useCallback((code: MascotErrorCode | string = "UNKNOWN_ERROR", customMsg?: string) => {
    setInternalState("error");
    setErrorCode(code);
    setInternalMessage(getMascotMessage("error", 0, customMsg, code));
  }, []);

  // Déclencher le succès (100%)
  const triggerSuccess = useCallback((customMsg?: string) => {
    setInternalProgress(100);
    setInternalState("success");
    setInternalMessage(getMascotMessage("success", 100, customMsg));
  }, []);

  // Réinitialiser vers IDLE
  const resetToIdle = useCallback(() => {
    setInternalState("idle");
    setInternalProgress(0);
    setErrorCode(undefined);
    setInternalMessage(getMascotMessage("idle", 0));
    if (timeoutTimerRef.current) clearTimeout(timeoutTimerRef.current);
  }, []);

  return {
    state,
    progress,
    message,
    errorCode,
    isCompleted: state === "success",
    isError: state === "error",
    updateProgress,
    triggerError,
    triggerSuccess,
    resetToIdle,
  };
}
