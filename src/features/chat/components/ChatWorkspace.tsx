"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar, ConversationItem } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { WelcomeView } from "./WelcomeView";
import { MessageBubble, MessageData } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { SettingsModal } from "@/components/shared/SettingsModal";

export function ChatWorkspace() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [currentModel, setCurrentModel] = useState("gemini-2.0-flash");
  const [isLoading, setIsLoading] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const availableModels = [
    { slug: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "Google AI Studio" },
    { slug: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "Google AI Studio" },
    { slug: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google AI Studio" },
    { slug: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "Google AI Studio" },
  ];

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
    }
  };

  // Load conversations on mount
  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok && !ignore) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (err) {
        console.error("Erreur chargement conversations:", err);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const loadConversationMessages = async (id: string) => {
    setCurrentConversationId(id);
    setIsMobileSidebarOpen(false);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setIsMobileSidebarOpen(false);
  };

  const handleSendMessage = async (text: string, imageUrl?: string) => {
    if (!text.trim() && !imageUrl) return;

    // 1. Optimistic User Message
    const userMessageId = `temp-user-${crypto.randomUUID()}`;
    const userMsg: MessageData = {
      id: userMessageId,
      role: "USER",
      content: text,
      attachments: imageUrl ? [{ fileUrl: imageUrl }] : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // 2. Prepare AI Message Placeholder
    const aiMessageId = `temp-ai-${crypto.randomUUID()}`;
    const aiMsgPlaceholder: MessageData = {
      id: aiMessageId,
      role: "ASSISTANT",
      content: "",
      modelUsed: availableModels.find((m) => m.slug === currentModel)?.name || currentModel,
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
                          modelUsed: availableModels.find((mod) => mod.slug === data.modelUsed)?.name || data.modelUsed,
                        }
                      : m
                  )
                );
              }
            } catch {
              // Ignore line parse error
            }
          }
        }
      }
    } catch (err: unknown) {
      const isAbort = err && typeof err === "object" && "name" in err && err.name === "AbortError";
      if (!isAbort) {
        const errorMessage = err instanceof Error ? err.message : "Désolé, une erreur est survenue lors de la réponse. Veuillez réessayer.";
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
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (currentConversationId === id) {
        handleNewConversation();
      }
      fetchConversations();
    } catch (err) {
      console.error("Erreur suppression conversation:", err);
    }
  };

  const handleDeleteAllConversations = async () => {
    if (confirm("Voulez-vous vraiment supprimer toutes les conversations ?")) {
      try {
        await fetch("/api/conversations", { method: "DELETE" });
        handleNewConversation();
        fetchConversations();
      } catch (err) {
        console.error("Erreur suppression globale:", err);
      }
    }
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
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
  };

  const handleFeedback = async (messageId: string, feedback: "LIKE" | "DISLIKE" | "NONE") => {
    try {
      await fetch(`/api/messages/${messageId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback }),
      });
    } catch (err) {
      console.error("Erreur feedback:", err);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-akwaba-bg-light dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={loadConversationMessages}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onDeleteAllConversations={handleDeleteAllConversations}
          onRenameConversation={handleRenameConversation}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-80 h-full">
            <Sidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={loadConversationMessages}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              onDeleteAllConversations={handleDeleteAllConversations}
              onRenameConversation={handleRenameConversation}
              onOpenSettings={() => {
                setIsSettingsOpen(true);
                setIsMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Central Chat Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top Header */}
        <Header
          currentModel={currentModel}
          availableModels={availableModels}
          onSelectModel={setCurrentModel}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Scrollable Message History or Welcome Screen */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <WelcomeView />
          ) : (
            <div className="max-w-3xl mx-auto w-full pt-2">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onFeedback={handleFeedback}
                  onRegenerate={
                    msg.role === "ASSISTANT" && msg.id === messages[messages.length - 1]?.id
                      ? () => {
                          const lastUserMsg = [...messages].reverse().find((m) => m.role === "USER");
                          if (lastUserMsg) {
                            handleSendMessage(lastUserMsg.content);
                          }
                        }
                      : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopGeneration={handleStopGeneration}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentModel={currentModel}
        onSaveModel={setCurrentModel}
      />
    </div>
  );
}
