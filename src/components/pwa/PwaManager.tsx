"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Smartphone, Share2, PlusSquare } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 1. Enregistrement du Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker enregistré avec succès :", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Échec de l'enregistrement du Service Worker :", err);
          });
      });
    }

    // 2. Détection du mode standalone (déjà installé)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 3. Détection iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // 4. Capture de l'événement beforeinstallprompt (Android / Chrome / PC)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Événement appinstalled
    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log("[PWA] Akwaba Chat a été installé avec succès !");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("[PWA] Erreur lors de l'installation :", err);
    }
  };

  // Ne pas afficher si déjà installé ou si l'utilisateur a fermé la bannière
  if (isStandalone || dismissed) {
    return null;
  }

  // N'afficher que si installable (Android/PC) ou si appareil iOS non installé
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      {/* Bannière discrète d'installation en bas à droite */}
      <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 dark:border-emerald-500/20 rounded-2xl shadow-xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            <Image
              src="/icons/icon-192x192.png"
              alt="Akwaba Chat App"
              width={40}
              height={40}
              className="object-contain"
              unoptimized
            />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              Installer Akwaba Chat
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Accès rapide et hors-ligne sur votre écran d&apos;accueil
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 bg-akwaba-green hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              aria-label="Fermer"
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal d'instructions pour iOS Safari */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <Smartphone className="w-5 h-5 text-akwaba-green" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Installer sur iPhone / iPad
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Pour installer Akwaba Chat sur votre appareil Apple en tant qu&apos;application native, suivez ces 2 étapes simples :
            </p>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div className="text-slate-700 dark:text-slate-200">
                  Appuyez sur le bouton <strong>Partager</strong>{" "}
                  <Share2 className="w-4 h-4 inline-block text-blue-500 mx-1 align-sub" /> en bas de l&apos;écran Safari.
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div className="text-slate-700 dark:text-slate-200">
                  Faites défiler vers le bas et sélectionnez <strong>Sur l&apos;écran d&apos;accueil</strong>{" "}
                  <PlusSquare className="w-4 h-4 inline-block text-slate-600 dark:text-slate-300 mx-1 align-sub" />.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-akwaba-green hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-sm"
            >
              C&apos;est compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
}
