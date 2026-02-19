"use client"

import { MessageSquare, Search, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { ConversationSidebarItem } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/ConversationSidebarItem"
import type { ConversationListItem } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/types"
import {
  formatConversationTitle,
  formatRelativeUpdatedAt,
} from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ConversationSidebarProps {
  conversations: ConversationListItem[]
  selectedConversationId: string | null
  isLoading: boolean
  onSelect: (conversationId: string) => void
  onCreate: () => void
  onDelete: (conversationId: string) => void
}

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  isLoading,
  onSelect,
  onCreate,
  onDelete,
}: ConversationSidebarProps) {
  const t = useTranslations("dashboard.assistant")
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    const query = searchQuery.toLowerCase()
    return conversations.filter((conversation) =>
      formatConversationTitle(conversation.title).toLowerCase().includes(query),
    )
  }, [conversations, searchQuery])

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      setDeletingId(id)
      await onDelete(id)
      setDeletingId(null)
      setConfirmDeleteId(null)
      return
    }

    setConfirmDeleteId(id)
    setTimeout(() => {
      setConfirmDeleteId((current) => (current === id ? null : current))
    }, 3000)
  }

  const formatUpdatedAt = (value: string | Date) =>
    formatRelativeUpdatedAt(value, t)

  return (
    <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 flex h-full flex-col">
      <div className="space-y-3 border-b border-border/60 p-4">
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

        {conversations.length > 5 && (
          <div className="relative">
            <Search className="absolute start-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("searchConversations")}
              className="h-8 rounded-none bg-background/60 ps-8 text-sm"
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

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="p-3 text-xs text-muted-foreground">
            {t("loadingConversations")}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {t("noConversations")}
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {t("noSearchResults")}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation, index) => (
              <ConversationSidebarItem
                key={conversation.id}
                conversation={conversation}
                index={index}
                isActive={conversation.id === selectedConversationId}
                isDeleting={deletingId === conversation.id}
                isConfirmingDelete={confirmDeleteId === conversation.id}
                confirmDeleteLabel={t("confirmDelete")}
                deleteConversationAria={t("deleteConversation")}
                onSelect={onSelect}
                onDelete={handleDelete}
                onCancelDelete={() => setConfirmDeleteId(null)}
                formatUpdatedAt={formatUpdatedAt}
              />
            ))}
          </div>
        )}
      </div>

      {!isLoading && conversations.length > 0 && (
        <div className="border-t border-border/60 p-3 text-center">
          <p className="text-[10px] text-muted-foreground">
            {filteredConversations.length} / {conversations.length}{" "}
            {t("conversations")}
          </p>
        </div>
      )}
    </Card>
  )
}
