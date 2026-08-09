"use client";

import React from "react";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, Sparkles } from "lucide-react";

interface HeaderProps {
  currentModel?: string;
  availableModels?: Array<{ slug: string; name: string; provider: string }>;
  onSelectModel?: (modelSlug: string) => void;
  onToggleMobileSidebar: () => void;
}

export function Header({
  onToggleMobileSidebar,
}: HeaderProps) {


  return (
    <header className="h-16 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10">
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


      {/* Header Right Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* User Profile Avatar (Masqué pour la v1 - décommenter pour les versions futures) */}
        {/*
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm shadow-sm cursor-pointer">
            <UserIcon className="w-4 h-4 text-slate-500" />
          </div>
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
        </div>
        */}
      </div>

    </header>
  );
}
