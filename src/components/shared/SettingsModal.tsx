"use client";

import React, { useState } from "react";
import { X, Sparkles, Sliders } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: string;
  onSaveModel: (modelSlug: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  currentModel,
  onSaveModel,
}: SettingsModalProps) {
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [systemPrompt, setSystemPrompt] = useState(
    "Tu es Akwaba Chat, un assistant virtuel intelligent, courtois et chaleureux."
  );

  if (!isOpen) return null;

  const models = [
    { slug: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", desc: "Rapide et multimodal (Texte & Vision)" },
    { slug: "openrouter/free", name: "OpenRouter Free", provider: "OpenRouter (Free)", desc: "100% Gratuit - Support Vision & Texte" },
    { slug: "google/gemma-4-31b-it:free", name: "Gemma 4 31B Vision", provider: "Google (Free)", desc: "100% Gratuit - Analyse d'images et texte" },
    { slug: "nvidia/nemotron-nano-12b-v2-vl:free", name: "Nemotron 12B VL", provider: "NVIDIA (Free)", desc: "100% Gratuit - Vision-Language de NVIDIA" },
    { slug: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "Meta", desc: "Puissant modèle Open-Source pour le texte" },
    { slug: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", desc: "Excellent pour le code et l'analyse d'images" },
  ];

  const handleSave = () => {
    onSaveModel(selectedModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-akwaba-green" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Paramètres Akwaba Chat
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Selection */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Modèle IA par défaut
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {models.map((m) => (
              <button
                key={m.slug}
                type="button"
                onClick={() => setSelectedModel(m.slug)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedModel === m.slug
                    ? "border-akwaba-green bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-[#057A55]"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    {m.name}
                  </span>
                  <Sparkles className={`w-3.5 h-3.5 ${selectedModel === m.slug ? "text-akwaba-green" : "text-slate-400"}`} />
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* System Prompt Customizer */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Instructions Système (System Prompt)
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={3}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:border-akwaba-green"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-full text-sm font-medium bg-akwaba-green hover:bg-akwaba-green-hover text-white shadow-md transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
