"use client"

import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { formatConversationTitle } from "../utils"

type ConversationListItem = {
  id: string
  title: string | null
  model: string
  updatedAt: string | Date
}

function formatUpdatedAt(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  isLoading,
  onSelect,
  onCreate,
}: {
  conversations: ConversationListItem[]
  selectedConversationId: string | null
  isLoading: boolean
  onSelect: (conversationId: string) => void
  onCreate: () => void
}) {
  const t = useTranslations("dashboard.assistant")

  return (
    <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
      <div className="p-4 border-b border-border/60 flex items-center justify-between gap-3">
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

      <div className="p-2">
        {isLoading ? (
          <div className="p-3 text-xs text-muted-foreground">{t("loadingConversations")}</div>
        ) : conversations.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground">{t("noConversations")}</div>
        ) : (
          <div className="max-h-[58vh] overflow-y-auto">
            {conversations.map((c) => {
              const active = c.id === selectedConversationId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelect(c.id)}
                  className={cn(
                    "w-full text-start border border-transparent px-3 py-2 transition-colors",
                    "hover:border-border/70 hover:bg-muted/20",
                    active && "border-primary/30 bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-foreground truncate">
                      {formatConversationTitle(c.title)}
                    </p>
                    <p className="text-[10px] text-muted-foreground shrink-0">
                      {formatUpdatedAt(c.updatedAt)}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground truncate">{c.model}</p>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
