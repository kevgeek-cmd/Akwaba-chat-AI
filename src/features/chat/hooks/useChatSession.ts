"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ConversationItem } from "@/components/shared/Sidebar";
import { MessageData } from "@/features/chat/components/MessageBubble";

export interface ModelItem {
  slug: string;
  name: string;
  provider: string;
  supportsVision?: boolean;
}

const DEFAULT_MODELS: ModelItem[] = [
  { slug: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI", supportsVision: true },
  { slug: "openrouter/free", name: "OpenRouter Free", provider: "OpenRouter (Free)", supportsVision: true },
  { slug: "google/gemma-4-31b-it:free", name: "Gemma 4 31B Vision", provider: "Google (Free)", supportsVision: true },
  { slug: "nvidia/nemotron-nano-12b-v2-vl:free", name: "Nemotron 12B VL", provider: "NVIDIA (Free)", supportsVision: true },
  { slug: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "Meta", supportsVision: false },
  { slug: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic", supportsVision: true },
];

export function useChatSession() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [currentModel, setCurrentModel] = useState("openai/gpt-4o-mini");
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
    async (text: string, imageUrl?: string) => {
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

      // 2. Placeholder Message IA
      const aiMessageId = `temp-ai-${crypto.randomUUID()}`;
      const aiMsgPlaceholder: MessageData = {
        id: aiMessageId,
        role: "ASSISTANT",
        content: "",
        modelUsed: modelsList.find((m) => m.slug === currentModel)?.name || currentModel,
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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "meta" && data.conversationId) {
                  setCurrentConversationId(data.conversationId);
                  fetchConversations();
                } else if (data.type === "chunk" && data.text) {
                  currentStreamText += data.text;
                  const newText = currentStreamText;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMessageId ? { ...m, content: newText } : m
                    )
                  );
                } else if (data.type === "done") {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === aiMessageId
                        ? {
                            ...m,
                            id: data.messageId || aiMessageId,
                            executionTime: data.executionTime,
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
                    content: `Erreur : ${errorMessage}`,
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
