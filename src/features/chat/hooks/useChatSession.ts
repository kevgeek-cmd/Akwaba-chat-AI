"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ConversationItem } from "@/components/shared/Sidebar";
import { MessageData } from "@/features/chat/components/MessageBubble";

export interface ModelItem {
  slug: string;
  name: string;
  provider: string;
  supportsVision?: boolean;
  isDefault?: boolean;
}

const DEFAULT_MODELS: ModelItem[] = [
  { slug: "minimax/minimax-m2.7:free", name: "MiniMax M2.7 (Recommandé)", provider: "MiniMax (Free)", supportsVision: false },
  { slug: "dots-studio/dots-3-note-preview:free", name: "Dots 3 Vision", provider: "Dots Studio (Free)", supportsVision: true },
  { slug: "openrouter/free", name: "Auto-Router Free", provider: "OpenRouter (Free)", supportsVision: true },
  { slug: "nvidia/nemotron-3.5-lightning:free", name: "Nemotron 3.5 Lightning", provider: "NVIDIA (Free)", supportsVision: false },
];

export function useChatSession() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [currentModel, setCurrentModel] = useState("minimax/minimax-m2.7:free");
  const [isLoading, setIsLoading] = useState(false);
  const [toneMode, setToneMode] = useState<"nouchi" | "standard">("nouchi");
  const [modelsList, setModelsList] = useState<ModelItem[]>(DEFAULT_MODELS);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Charger la liste des conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
    }
  }, []);

  // Initialisation : charger conversations & modèles
  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const [convRes, modelsRes] = await Promise.all([
          fetch("/api/conversations"),
          fetch("/api/models"),
        ]);

        if (convRes.ok && !ignore) {
          const data = await convRes.json();
          setConversations(data);
        }

        if (modelsRes.ok && !ignore) {
          const mData = await modelsRes.json();
          if (Array.isArray(mData) && mData.length > 0) {
            setModelsList(mData);
            setCurrentModel((prev) => {
              // Si le modèle précédent était l'ancien modèle défaillant minimax-m3, basculer sur m2.7
              if (prev === "minimax/minimax-m3:free") {
                return "minimax/minimax-m2.7:free";
              }
              const exists = mData.some((m: ModelItem) => m.slug === prev);
              return exists ? prev : (mData.find((m: ModelItem) => m.isDefault)?.slug || mData[0]?.slug || "minimax/minimax-m2.7:free");
            });
          }
        }
      } catch (err) {
        console.error("Erreur chargement données:", err);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  // Défilement automatique vers le bas à chaque nouveau message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Charger une conversation spécifique
  const loadConversationMessages = useCallback(async (id: string) => {
    setCurrentConversationId(id);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    }
  }, []);

  // Démarrer une nouvelle conversation
  const handleNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  // Envoi d'un message utilisateur + streaming réponse IA
  const handleSendMessage = useCallback(
    async (
      text: string,
      imageUrl?: string,
      workMode: "normal" | "deep-research" | "scraping" = "normal",
      targetUrl?: string
    ) => {
      if (!text.trim() && !imageUrl) return;

      // 1. Message Optimiste Utilisateur
      const userMessageId = `temp-user-${crypto.randomUUID()}`;
      const userMsg: MessageData = {
        id: userMessageId,
        role: "USER",
        content: text,
        attachments: imageUrl ? [{ fileUrl: imageUrl }] : undefined,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      // 2. Placeholder Message IA avec état initial Mascot adapté au mode
      const aiMessageId = `temp-ai-${crypto.randomUUID()}`;
      const initialMascotMsg =
        workMode === "deep-research"
          ? "Analyse de la question..."
          : workMode === "scraping"
          ? "Vérification de la page..."
          : "Je commence la recherche...";

      const aiMsgPlaceholder: MessageData = {
        id: aiMessageId,
        role: "ASSISTANT",
        content: "",
        modelUsed: modelsList.find((m) => m.slug === currentModel)?.name || currentModel,
        mascotState: "walking",
        mascotProgress: workMode === "deep-research" ? 10 : 15,
        mascotMessage: initialMascotMsg,
      };

      setMessages((prev) => [...prev, aiMsgPlaceholder]);
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: text,
            conversationId: currentConversationId || undefined,
            model: currentModel,
            imageUrl,
            mode: toneMode,
            workMode,
            targetUrl,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorJson = await response.json().catch(() => null);
          const serverError = errorJson?.error || "Erreur serveur lors de la réponse IA";
          throw new Error(serverError);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) return;

        let currentStreamText = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(":")) continue;

            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.type === "meta" && data.conversationId) {
                  setCurrentConversationId(data.conversationId);
                  fetchConversations();
                } else if (data.type === "progress") {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMessageId
                        ? {
                            ...m,
                            mascotState: data.state,
                            mascotProgress: data.progress,
                            mascotMessage: data.message,
                            mascotErrorCode: data.errorCode,
                          }
                        : m
                    )
                  );
                } else if (data.type === "chunk" && data.text) {
                  currentStreamText += data.text;
                  const newText = currentStreamText;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMessageId ? { ...m, content: newText } : m
                    )
                  );
                } else if (data.type === "done") {
                  const verifiedContent = currentStreamText || data.content || "";
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMessageId
                        ? {
                            ...m,
                            id: data.messageId || aiMessageId,
                            content: m.content || verifiedContent,
                            executionTime: data.executionTime,
                            mascotState: "success",
                            mascotProgress: 100,
                            mascotMessage: "Réponse trouvée !",
                            modelUsed:
                              modelsList.find((mod) => mod.slug === data.modelUsed)?.name ||
                              data.modelUsed,
                          }
                        : m
                    )
                  );
                }
              } catch {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
      } catch (err: unknown) {
        const isAbort =
          err && typeof err === "object" && "name" in err && err.name === "AbortError";
        if (!isAbort) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : "Désolé, une erreur est survenue lors de la réponse. Veuillez réessayer.";
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMessageId
                ? {
                    ...m,
                    content: "",
                    mascotState: "error",
                    mascotProgress: 0,
                    mascotErrorCode: "NETWORK_ERROR",
                    mascotMessage: errorMessage.includes("timeout")
                      ? "Le traitement a pris trop de temps. Réessaie dans un instant."
                      : "Un problème est survenu. Réessaie dans un instant.",
                  }
                : m
            )
          );
        }
      } finally {
        setIsLoading(false);
        fetchConversations();
      }
    },
    [currentConversationId, currentModel, modelsList, toneMode, fetchConversations]
  );

  // Annuler la génération en cours
  const handleStopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  // Supprimer une conversation
  const handleDeleteConversation = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/conversations/${id}`, { method: "DELETE" });
        if (currentConversationId === id) {
          handleNewConversation();
        }
        fetchConversations();
      } catch (err) {
        console.error("Erreur suppression conversation:", err);
      }
    },
    [currentConversationId, handleNewConversation, fetchConversations]
  );

  // Supprimer toutes les conversations
  const handleDeleteAllConversations = useCallback(async () => {
    if (confirm("Voulez-vous vraiment supprimer toutes les conversations ?")) {
      try {
        await fetch("/api/conversations", { method: "DELETE" });
        handleNewConversation();
        fetchConversations();
      } catch (err) {
        console.error("Erreur suppression globale:", err);
      }
    }
  }, [handleNewConversation, fetchConversations]);

  // Renommer une conversation
  const handleRenameConversation = useCallback(
    async (id: string, newTitle: string) => {
      try {
        await fetch(`/api/conversations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
        fetchConversations();
      } catch (err) {
        console.error("Erreur renommage conversation:", err);
      }
    },
    [fetchConversations]
  );

  // Envoi du feedback utilisateur
  const handleFeedback = useCallback(
    async (messageId: string, feedback: "LIKE" | "DISLIKE" | "NONE") => {
      try {
        await fetch(`/api/messages/${messageId}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback }),
        });
      } catch (err) {
        console.error("Erreur feedback:", err);
      }
    },
    []
  );

  return {
    conversations,
    currentConversationId,
    messages,
    currentModel,
    setCurrentModel,
    isLoading,
    toneMode,
    setToneMode,
    modelsList,
    messagesEndRef,
    loadConversationMessages,
    handleNewConversation,
    handleSendMessage,
    handleStopGeneration,
    handleDeleteConversation,
    handleDeleteAllConversations,
    handleRenameConversation,
    handleFeedback,
  };
}
