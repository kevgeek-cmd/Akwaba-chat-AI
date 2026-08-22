"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, Sparkles, ExternalLink, Download } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ElephantLoader } from "@/components/shared/ElephantLoader";

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
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);
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

  const handleDownloadImage = async (url: string) => {
    try {
      setDownloadingUrl(url);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `akwaba-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Erreur de téléchargement d'image:", err);
      window.open(url, "_blank");
    } finally {
      setDownloadingUrl(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-3 mb-6 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* AI Elephant Avatar Icon */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-sm mt-1 overflow-hidden p-0.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/elephant.png"
            alt="Akwaba IA"
            className="w-full h-full object-contain"
          />
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
          {message.content ? (
            <div className="prose dark:prose-invert max-w-none wrap-break-word text-sm sm:text-base leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 font-semibold underline underline-offset-2 transition-colors ${
                        isUser
                          ? "text-white hover:text-emerald-100"
                          : "text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                      }`}
                    >
                      <span>{children}</span>
                      <ExternalLink className="w-3.5 h-3.5 inline-block shrink-0 opacity-80" />
                    </a>
                  ),
                  img: ({ src, alt }) => {
                    const imageSrc = typeof src === "string" ? src : undefined;
                    return (
                      <span className="block my-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageSrc}
                          alt={alt || "Image générée"}
                          loading="lazy"
                          className="max-w-full h-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300"
                        />
                        {imageSrc && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDownloadImage(imageSrc)}
                              disabled={downloadingUrl === imageSrc}
                              className="px-3 py-1.5 rounded-xl bg-akwaba-green hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{downloadingUrl === imageSrc ? "Téléchargement..." : "Télécharger l'image"}</span>
                            </button>
                            <a
                              href={imageSrc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all duration-200 flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Voir en grand</span>
                            </a>
                          </div>
                        )}
                      </span>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <ElephantLoader />
          )}
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
    </motion.div>
  );
}
