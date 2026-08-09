"use client";

import React, { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, Sparkles, ChevronDown, Image as ImageIcon, Check } from "lucide-react";

interface ModelOption {
  slug: string;
  name: string;
  provider: string;
  supportsVision?: boolean;
}

interface HeaderProps {
  currentModel?: string;
  availableModels?: ModelOption[];
  onSelectModel?: (modelSlug: string) => void;
  toneMode?: "nouchi" | "standard";
  onToggleToneMode?: (mode: "nouchi" | "standard") => void;
  onToggleMobileSidebar: () => void;
}

export function Header({
  currentModel = "openai/gpt-4o-mini",
  availableModels = [],
  onSelectModel,
  toneMode = "nouchi",
  onToggleToneMode,
  onToggleMobileSidebar,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedModelObj = availableModels.find((m) => m.slug === currentModel) || {
    slug: currentModel,
    name: currentModel.split("/").pop() || currentModel,
    provider: "OpenRouter",
    supportsVision: true,
  };

  return (
    <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Mobile Drawer Toggle + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          type="button"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Akwaba Chat Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-akwaba-green" />
          <span>Akwaba Chat</span>
        </div>
      </div>

      {/* Model Selector & Nouchi Tone Selector */}
      <div className="flex items-center gap-2">
        {/* Nouchi Mode Toggle Pill */}
        <button
          type="button"
          onClick={() => {
            if (onToggleToneMode) {
              onToggleToneMode(toneMode === "nouchi" ? "standard" : "nouchi");
            }
          }}
          title={toneMode === "nouchi" ? "Basculer en Français Standard" : "Basculer en Nouchi Ivoirien"}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-bold transition-all shadow-sm ${
            toneMode === "nouchi"
              ? "bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100"
              : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          }`}
        >
          <span>{toneMode === "nouchi" ? "🇨🇮 Mode Nouchi" : "🇫🇷 Standard"}</span>
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{selectedModelObj.name}</span>
            {selectedModelObj.slug.includes(":free") || selectedModelObj.slug === "openrouter/free" ? (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                GRATUIT
              </span>
            ) : null}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute right-1/2 translate-x-1/2 sm:right-0 sm:translate-x-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 p-1.5 space-y-1 animate-fade-in max-h-80 overflow-y-auto">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Sélectionner un Modèle IA
                </div>

                {availableModels.map((m) => {
                  const isSelected = m.slug === currentModel;
                  const isFree = m.slug.includes(":free") || m.slug === "openrouter/free";

                  return (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => {
                        if (onSelectModel) onSelectModel(m.slug);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-akwaba-green font-semibold"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">{m.name}</span>
                          {isFree && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/60 text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
                              GRATUIT
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          {m.provider}
                          {m.supportsVision && (
                            <span className="flex items-center gap-0.5 text-blue-500 dark:text-blue-400 font-medium">
                              • <ImageIcon className="w-2.5 h-2.5" /> Vision
                            </span>
                          )}
                        </span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-akwaba-green" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}

