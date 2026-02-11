"use client"

import { RefreshCw, Sparkles, User } from "lucide-react"
import { useTranslations } from "next-intl"

import type { UIMessage } from "ai"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { ToolInvocationView } from "./ToolInvocationView"
import { MarkdownMessage } from "./MarkdownMessage"

type AuthStatus = {
  status: string | null
  url: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

interface MessageBubbleProps {
  message: UIMessage
  authByTool: Record<string, AuthStatus>
  onCheckAuth: (toolName: string) => void
  onRegenerateFrom: (messageId: string) => void
  showRegenerate: boolean
}

export function MessageBubble({
  message,
  authByTool,
  onCheckAuth,
  onRegenerateFrom,
  showRegenerate,
}: MessageBubbleProps) {
  const t = useTranslations("dashboard.assistant")
  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"

  // Get text content from message parts
  const textContent = message.parts
    .map((part) => (isRecord(part) && part.type === "text" ? (part.text as string) : ""))
    .join("")

  return (
    <div
      className={cn(
        "flex",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "group relative max-w-[92%] sm:max-w-[80%]",
          isUser && "max-w-[85%] sm:max-w-[75%]"
        )}
      >
        {/* Avatar/icon */}
        <div
          className={cn(
            "absolute -top-3 flex items-center gap-1.5",
            isUser ? "right-0" : "left-0"
          )}
        >
          {isAssistant && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/50 rounded-none">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                AI
              </span>
            </div>
          )}
          {isUser && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary rounded-none">
              <User className="h-3 w-3 text-primary-foreground" />
              <span className="text-[10px] font-medium text-primary-foreground uppercase tracking-wider">
                You
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
            isUser && [
              "bg-primary text-primary-foreground",
              "px-4 py-3",
            ]
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
          {message.parts.map((part, idx) => {
            if (
              isRecord(part) &&
              (part.type === "dynamic-tool" ||
                (typeof part.type === "string" && part.type.startsWith("tool-")))
            ) {
              const toolName =
                part.type === "dynamic-tool"
                  ? typeof part.toolName === "string"
                    ? part.toolName
                    : null
                  : typeof part.type === "string"
                    ? part.type.slice("tool-".length)
                    : null

              const authStatus = toolName ? authByTool[toolName] ?? null : null

              return (
                <ToolInvocationView
                  key={idx}
                  part={part}
                  authStatus={authStatus}
                  onCheckAuth={onCheckAuth}
                  onRetry={() => onRegenerateFrom(message.id)}
                />
              )
            }
            return null
          })}

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
        <p
          className={cn(
            "mt-1 text-[10px] text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser ? "text-end" : "text-start"
          )}
        >
          {formatRelativeTime(new Date())}
        </p>
      </div>
    </div>
  )
}
