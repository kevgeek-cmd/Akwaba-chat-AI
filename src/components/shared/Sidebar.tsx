"use client";

import React, { useState } from "react";
import { Logo } from "./Logo";
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  ChevronLeft,
  Search,
  MoreVertical,
  Edit2,
} from "lucide-react";
import { format } from "date-fns";

export interface ConversationItem {
  id: string;
  title: string;
  updatedAt: string | Date;
}

interface SidebarProps {
  conversations: ConversationItem[];
  currentConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onDeleteAllConversations: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onDeleteAllConversations,
  onRenameConversation,
  onOpenSettings,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditingTitle(currentTitle);
    setActiveMenuId(null);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const formatTimestamp = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return format(date, "HH:mm");
    }
    
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `${diffInDays} j`;
    
    return format(date, "dd/MM");
  };

  return (
    <aside
      className={`h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-80"
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between">
        <Logo showText={!isCollapsed} size="md" />
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title={isCollapsed ? "Développer la sidebar" : "Réduire la sidebar"}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {/* New Conversation Action Button */}
      <div className="px-4 py-2">
        <button
          onClick={onNewConversation}
          type="button"
          className="w-full flex items-center justify-center gap-2 bg-akwaba-orange hover:bg-akwaba-orange-hover text-white font-medium py-3 px-4 rounded-full shadow-md shadow-orange-500/20 transition-all duration-200 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span>Nouvelle conversation</span>}
        </button>
      </div>

      {/* Search Input Filter */}
      {!isCollapsed && (
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une discussion..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 border border-slate-200/60 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-[#057A55]"
            />
          </div>
        </div>
      )}

      {/* Section Header */}
      {!isCollapsed && (
        <div className="px-5 pt-4 pb-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Conversations récentes
          </span>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        {filteredConversations.map((conv) => {
          const isActive = conv.id === currentConversationId;
          const isEditing = editingId === conv.id;

          return (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`group relative flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-[#FFF6F0] dark:bg-orange-950/30 text-slate-900 dark:text-slate-100 font-medium shadow-sm"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <MessageSquare
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-akwaba-orange" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {isEditing ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveRename(conv.id)}
                    onBlur={() => handleSaveRename(conv.id)}
                    autoFocus
                    className="w-full px-2 py-0.5 text-sm rounded bg-white dark:bg-slate-700 border border-akwaba-green focus:outline-none"
                  />
                ) : (
                  <span className={`text-sm truncate ${isActive ? "font-semibold text-akwaba-orange" : ""}`}>
                    {conv.title}
                  </span>
                )}
              </div>

              {!isCollapsed && !isEditing && (
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span
                    className={`text-xs ${
                      isActive ? "text-akwaba-orange font-semibold" : "text-slate-400"
                    }`}
                  >
                    {formatTimestamp(conv.updatedAt)}
                  </span>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === conv.id ? null : conv.id);
                      }}
                      className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-opacity"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {activeMenuId === conv.id && (
                      <div className="absolute right-0 top-6 z-20 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 py-1 text-xs text-slate-700 dark:text-slate-200">
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(conv.id, conv.title, e)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          Renommer
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredConversations.length === 0 && !isCollapsed && (
          <div className="text-center py-8 text-xs text-slate-400">
            Aucune conversation trouvée
          </div>
        )}
      </div>

      {/* Sidebar Footer Actions */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <button
          onClick={onDeleteAllConversations}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-medium transition-colors"
        >
          <Trash2 className="w-4 h-4 shrink-0 text-slate-400 hover:text-red-500" />
          {!isCollapsed && <span>Supprimer toutes les conversations</span>}
        </button>

        <button
          onClick={onOpenSettings}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
        >
          <Settings className="w-4 h-4 shrink-0 text-slate-400" />
          {!isCollapsed && <span>Paramètres & Modèles IA</span>}
        </button>
      </div>
    </aside>
  );
}
