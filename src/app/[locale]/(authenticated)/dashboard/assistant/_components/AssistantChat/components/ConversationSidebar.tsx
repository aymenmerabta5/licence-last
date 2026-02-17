"use client";

import { useState, useMemo } from "react";
import { Trash2, Search, X, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import * as motion from "motion/react-client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { formatConversationTitle } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/utils";

type ConversationListItem = {
  id: string;
  title: string | null;
  model: string;
  updatedAt: string | Date;
};

interface ConversationSidebarProps {
  conversations: ConversationListItem[];
  selectedConversationId: string | null;
  isLoading: boolean;
  onSelect: (conversationId: string) => void;
  onCreate: () => void;
  onDelete: (conversationId: string) => void;
}

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  isLoading,
  onSelect,
  onCreate,
  onDelete,
}: ConversationSidebarProps) {
  const t = useTranslations("dashboard.assistant");
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      formatConversationTitle(c.title).toLowerCase().includes(query),
    );
  }, [conversations, searchQuery]);

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      setDeletingId(id);
      await onDelete(id);
      setDeletingId(null);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      // Auto-clear confirmation after 3 seconds
      setTimeout(() => {
        setConfirmDeleteId((current) => (current === id ? null : current));
      }, 3000);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const formatUpdatedAt = (value: string | Date): string => {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return "";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("relativeNow");
    if (diffMins < 60) return t("relativeMinutesShort", { count: diffMins });
    if (diffHours < 24) return t("relativeHoursShort", { count: diffHours });
    if (diffDays < 7) return t("relativeDaysShort", { count: diffDays });
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/60 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
            {t("conversations")}
          </p>
          <Button
            type="button"
            variant="editorial-outline"
            size="editorial-sm"
            onClick={onCreate}
          >
            {t("newConversation")}
          </Button>
        </div>

        {/* Search */}
        {conversations.length > 5 && (
          <div className="relative">
            <Search className="absolute start-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchConversations")}
              className="h-8 ps-8 text-sm rounded-none bg-background/60"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute end-2 top-1/2 -translate-y-1/2"
                aria-label={t("clearSearch")}
              >
                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="p-3 text-xs text-muted-foreground">
            {t("loadingConversations")}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {t("noConversations")}
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {t("noSearchResults")}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((c, index) => {
              const active = c.id === selectedConversationId;
              const isConfirmingDelete = confirmDeleteId === c.id;
              const isDeleting = deletingId === c.id;

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "group relative flex items-center gap-2",
                    "border border-transparent px-3 py-2.5 transition-all",
                    "hover:border-border/70 hover:bg-muted/20",
                    active && "border-primary/30 bg-primary/5",
                    isDeleting && "opacity-50 pointer-events-none",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="flex-1 min-w-0 text-start"
                    disabled={isDeleting}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-foreground truncate font-medium">
                        {formatConversationTitle(c.title)}
                      </p>
                      <p className="text-[10px] text-muted-foreground shrink-0">
                        {formatUpdatedAt(c.updatedAt)}
                      </p>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
                      {c.model}
                    </p>
                  </button>

                  {/* Delete button / confirmation */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {isConfirmingDelete ? (
                      <div key="confirm" className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={handleCancelDelete}
                          className="h-6 w-6"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="editorial-sm"
                          onClick={() => handleDelete(c.id)}
                          className="h-6 px-2 text-[10px]"
                        >
                          {t("confirmDelete")}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        key="delete"
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(c.id)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        aria-label={t("deleteConversation")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer with count */}
      {!isLoading && conversations.length > 0 && (
        <div className="p-3 border-t border-border/60 text-center">
          <p className="text-[10px] text-muted-foreground">
            {filteredConversations.length} / {conversations.length}{" "}
            {t("conversations")}
          </p>
        </div>
      )}
    </Card>
  );
}
