"use client"

import type { UIMessage } from "ai"
import { RefreshCw, Sparkles, User } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { MarkdownMessage } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/MarkdownMessage"
import { MessageToolInvocations } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/MessageToolInvocations"
import { NoteBubble } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/NoteBubble"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuthStatus = {
  status: string | null
  url: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

interface MessageBubbleProps {
  message: UIMessage
  createdAt?: string | Date
  authByTool: Record<string, AuthStatus>
  onCheckAuth: (toolName: string) => void
  onRegenerateFrom: (messageId: string) => void
  showRegenerate: boolean
}

export function MessageBubble({
  message,
  createdAt,
  authByTool,
  onCheckAuth,
  onRegenerateFrom,
  showRegenerate,
}: MessageBubbleProps) {
  const t = useTranslations("dashboard.assistant")
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"
  const isNote = message.parts.some(
    (part) => (part as Record<string, unknown>).type === "note-marker",
  )
  const relativeTimestamp = useMemo(() => {
    if (!createdAt) return null

    const date = typeof createdAt === "string" ? new Date(createdAt) : createdAt
    if (Number.isNaN(date.getTime())) return null

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t("relativeNow")
    if (diffMins < 60) return t("relativeMinutesAgo", { count: diffMins })
    if (diffHours < 24) return t("relativeHoursAgo", { count: diffHours })
    if (diffDays < 7) return t("relativeDaysAgo", { count: diffDays })
    return date.toLocaleDateString()
  }, [createdAt, t])

  // Get text content from message parts
  const textContent = message.parts
    .map((part) =>
      isRecord(part) && part.type === "text" ? (part.text as string) : "",
    )
    .join("")

  if (isNote) {
    return (
      <NoteBubble
        textContent={textContent}
        relativeTimestamp={relativeTimestamp}
      />
    )
  }

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "group relative max-w-[92%] sm:max-w-[80%]",
          isUser && "max-w-[85%] sm:max-w-[75%]",
        )}
      >
        {/* Avatar/icon */}
        <div
          className={cn(
            "absolute -top-3 flex items-center gap-1.5",
            isUser ? "end-0" : "start-0",
          )}
        >
          {isAssistant && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/50 rounded-none">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {t("assistantActor")}
              </span>
            </div>
          )}
          {isUser && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary rounded-none">
              <User className="h-3 w-3 text-primary-foreground" />
              <span className="text-[10px] font-medium text-primary-foreground uppercase tracking-wider">
                {t("userActor")}
              </span>
            </div>
          )}
        </div>

        {/* Message content */}
        <div
          className={cn(
            "mt-3",
            isAssistant && [
              "bg-muted/30 border-s-2 border-primary/20",
              "px-4 py-3",
            ],
            isUser && ["bg-primary text-primary-foreground", "px-4 py-3"],
          )}
        >
          {/* Text content */}
          {isAssistant ? (
            <MarkdownMessage content={textContent} />
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {textContent}
            </p>
          )}

          {/* Tool invocations */}
          <MessageToolInvocations
            parts={message.parts}
            authByTool={authByTool}
            onCheckAuth={onCheckAuth}
            onRegenerateFrom={onRegenerateFrom}
            messageId={message.id}
          />

          {/* Regenerate button */}
          {showRegenerate && isAssistant && (
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="editorial-sm"
                className="h-7 px-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                onClick={() => onRegenerateFrom(message.id)}
                aria-label={t("retry")}
              >
                <RefreshCw className="h-3.5 w-3.5 me-1.5" />
                {t("retry")}
              </Button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {relativeTimestamp && (
          <p
            className={cn(
              "mt-1 text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity",
              isUser ? "text-end" : "text-start",
            )}
          >
            {relativeTimestamp}
          </p>
        )}
      </div>
    </div>
  )
}
