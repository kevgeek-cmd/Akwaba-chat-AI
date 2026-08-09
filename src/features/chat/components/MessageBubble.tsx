"use client";

import React, { useState } from "react";
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Sparkles } from "lucide-react";

export interface MessageData {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  modelUsed?: string | null;
  executionTime?: number | null;
  feedback?: "LIKE" | "DISLIKE" | "NONE";
  attachments?: Array<{ fileUrl: string }>;
}

interface MessageBubbleProps {
  message: MessageData;
  onFeedback?: (messageId: string, feedback: "LIKE" | "DISLIKE" | "NONE") => void;
  onRegenerate?: () => void;
}

export function MessageBubble({ message, onFeedback, onRegenerate }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<"LIKE" | "DISLIKE" | "NONE">(
    message.feedback || "NONE"
  );

  const isUser = message.role === "USER";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: "LIKE" | "DISLIKE") => {
    const nextFeedback = currentFeedback === type ? "NONE" : type;
    setCurrentFeedback(nextFeedback);
    if (onFeedback) {
      onFeedback(message.id, nextFeedback);
    }
  };

  return (
    <div
      className={`flex gap-3 mb-6 animate-fade-in ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* AI Elephant Avatar Icon */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-akwaba-green text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M12 4c-4.4 0-8 3.6-8 8 0 2.2.9 4.2 2.3 5.7L6 20h3l.7-2.3c.7.2 1.5.3 2.3.3 4.4 0 8-3.6 8-8s-3.6-8-8-8z" />
          </svg>
        </div>
      )}

      {/* Bubble Container */}
      <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
        {/* Attachment Images */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((att, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={idx}
                src={att.fileUrl}
                alt="Image envoyée"
                className="max-w-xs rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              />
            ))}
          </div>
        )}

        {/* Message Content Box */}
        <div
          className={`p-4 rounded-3xl text-sm sm:text-base leading-relaxed ${
            isUser
              ? "bg-akwaba-green text-white rounded-tr-sm shadow-md shadow-emerald-900/10"
              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm"
          }`}
        >
          <div className="whitespace-pre-wrap wrap-break-word">{message.content}</div>
        </div>

        {/* AI Message Footer: Metadata & Actions */}
        {!isUser && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-400">
            {/* Metadata (Execution Time & Model Used) */}
            <div className="flex items-center gap-2">
              {message.modelUsed && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                  <Sparkles className="w-3 h-3 text-akwaba-green" />
                  {message.modelUsed}
                </span>
              )}
              {message.executionTime && (
                <span className="text-[11px] text-slate-400 font-mono">
                  • {(message.executionTime / 1000).toFixed(1)}s
                </span>
              )}
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                title="Copier le message"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleFeedback("LIKE")}
                title="J'aime cette réponse"
                className={`p-1.5 rounded-lg transition-colors ${
                  currentFeedback === "LIKE"
                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleFeedback("DISLIKE")}
                title="Je n'aime pas cette réponse"
                className={`p-1.5 rounded-lg transition-colors ${
                  currentFeedback === "DISLIKE"
                    ? "bg-red-50 text-red-600 dark:bg-red-950/40"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  title="Régénérer la réponse"
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
