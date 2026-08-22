"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { WelcomeView } from "./WelcomeView";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { SettingsModal } from "@/components/shared/SettingsModal";
import { useChatSession } from "../hooks/useChatSession";

export function ChatWorkspace() {
  const {
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
  } = useChatSession();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-80 h-full">
            <Sidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={(id) => {
                loadConversationMessages(id);
                setIsMobileSidebarOpen(false);
              }}
              onNewConversation={() => {
                handleNewConversation();
                setIsMobileSidebarOpen(false);
              }}
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
          availableModels={modelsList}
          onSelectModel={setCurrentModel}
          toneMode={toneMode}
          onToggleToneMode={setToneMode}
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
