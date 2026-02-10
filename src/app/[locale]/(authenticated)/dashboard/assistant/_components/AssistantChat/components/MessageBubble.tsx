"use client"

import { RefreshCw } from "lucide-react"

import type { UIMessage } from "ai"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { ToolInvocationView } from "./ToolInvocationView"

type AuthStatus = {
  status: string | null
  url: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function MessageBubble({
  message,
  authByTool,
  onCheckAuth,
  onRegenerateFrom,
  showRegenerate,
}: {
  message: UIMessage
  authByTool: Record<string, AuthStatus>
  onCheckAuth: (toolName: string) => void
  onRegenerateFrom: (messageId: string) => void
  showRegenerate: boolean
}) {
  return (
    <div
      className={cn(
        "flex",
        message.role === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[92%] sm:max-w-[80%] border px-4 py-3 text-sm leading-relaxed",
          message.role === "user"
            ? "bg-primary text-primary-foreground border-primary/20"
            : "bg-background border-border/70",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {message.parts.map((part, idx) => {
              if (isRecord(part) && part.type === "text" && typeof part.text === "string") {
                return (
                  <p key={idx} className="whitespace-pre-wrap">
                    {part.text}
                  </p>
                )
              }

              if (isRecord(part) && (part.type === "dynamic-tool" || (typeof part.type === "string" && part.type.startsWith("tool-")))) {
                const toolName =
                  part.type === "dynamic-tool"
                    ? (typeof part.toolName === "string" ? part.toolName : null)
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
          </div>

          {showRegenerate && message.role === "assistant" && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              onClick={() => onRegenerateFrom(message.id)}
              aria-label="Retry"
              title="Retry"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
