"use client";

import React, { useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Send, Square, X } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string, imageUrl?: string) => void;
  isLoading?: boolean;
  onStopGeneration?: () => void;
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  onStopGeneration,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 2000;

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if ((!message.trim() && !imageUrl) || isLoading) return;
    onSendMessage(message.trim(), imageUrl || undefined);
    setMessage("");
    setImageUrl(null);
    setImagePreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Image Preview Tag */}
      {imagePreview && (
        <div className="mb-2 relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Aperçu"
            className="w-16 h-16 object-cover rounded-xl border-2 border-akwaba-green shadow-md"
          />
          <button
            type="button"
            onClick={() => {
              setImageUrl(null);
              setImagePreview(null);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow hover:bg-red-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Input Card Floating Container */}
      <div className="relative bg-white dark:bg-slate-800 rounded-[28px] border border-slate-200/80 dark:border-slate-700/80 shadow-lg shadow-slate-200/50 dark:shadow-none p-2.5 flex items-center gap-3 transition-all focus-within:border-akwaba-green focus-within:ring-2 focus-within:ring-[#057A55]/10">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageFileChange}
          className="hidden"
        />

        {/* Image Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Ajouter une image"
          className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/60 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 transition-colors shrink-0"
        >
          <ImageIcon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez votre message..."
          rows={1}
          className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none resize-none min-h-6 max-h-40 py-1"
        />

        {/* Character Count Display */}
        {message.length > 50 && (
          <span className="text-[10px] text-slate-400 shrink-0 font-mono">
            {message.length}/{MAX_CHARS}
          </span>
        )}

        {/* Action Button: Send or Stop */}
        {isLoading ? (
          <button
            type="button"
            onClick={onStopGeneration}
            title="Arrêter la génération"
            className="p-3 rounded-full bg-slate-800 text-white hover:bg-slate-900 transition-transform active:scale-95 shrink-0 shadow-md"
          >
            <Square className="w-4 h-4 fill-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim() && !imageUrl}
            title="Envoyer"
            className={`p-3 rounded-full text-white transition-all duration-200 shrink-0 shadow-md ${
              message.trim() || imageUrl
                ? "bg-akwaba-orange hover:bg-akwaba-orange-hover shadow-orange-500/30 active:scale-95 cursor-pointer"
                : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="mt-2 text-center">
        <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <span>🛡️</span> Akwaba Chat peut faire des erreurs. Vérifiez les informations importantes.
        </span>
      </div>
    </div>
  );
}
