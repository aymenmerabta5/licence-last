"use client"

import {
  CheckCircle2,
  ChevronDown,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ToolInvocationBody } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/ToolInvocationBody"
import type {
  ToolAuthStatus,
  ToolState,
} from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/toolInvocationTypes"
import { isRecord } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function getToolName(part: unknown): string | null {
  if (!isRecord(part)) return null

  if (part.type === "dynamic-tool") {
    return typeof part.toolName === "string" ? part.toolName : null
  }

  if (typeof part.type === "string" && part.type.startsWith("tool-")) {
    return part.type.slice("tool-".length)
  }

  return null
}

function getToolState(part: unknown): ToolState | null {
  if (!isRecord(part)) return null
  return typeof part.state === "string" ? (part.state as ToolState) : null
}

function formatToolName(name: string): string {
  return name
    .replace(/[_-]/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^\s+/, "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

function getStatusIcon(state: ToolState) {
  switch (state) {
    case "input-streaming":
    case "input-available":
    case "approval-requested":
    case "approval-responded":
      return (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      )
    case "output-available":
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
    case "output-error":
    case "output-denied":
      return <XCircle className="h-3.5 w-3.5 text-destructive" />
    default:
      return null
  }
}

function getStatusBadge(state: ToolState): string {
  switch (state) {
    case "input-streaming":
      return "Preparing..."
    case "input-available":
      return "Ready"
    case "approval-requested":
      return "Waiting for approval..."
    case "approval-responded":
      return "Processing..."
    case "output-available":
      return "Complete"
    case "output-error":
      return "Error"
    case "output-denied":
      return "Denied"
    default:
      return ""
  }
}

interface ToolInvocationViewProps {
  part: unknown
  authStatus: ToolAuthStatus | null
  onCheckAuth: (toolName: string) => void
  onRetry: () => void
}

export function ToolInvocationView({
  part,
  authStatus,
  onCheckAuth,
  onRetry,
}: ToolInvocationViewProps) {
  const t = useTranslations("dashboard.assistant")
  const [isExpanded, setIsExpanded] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const toolName = getToolName(part)
  const state = getToolState(part)

  if (!toolName || !state) return null

  const input = isRecord(part) ? (part.input as unknown) : undefined
  const output = isRecord(part) ? (part.output as unknown) : undefined
  const errorText =
    isRecord(part) && typeof part.errorText === "string" ? part.errorText : null

  return (
    <div className="mt-3 overflow-hidden rounded-none border border-border/60 bg-muted/10">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setIsExpanded((current) => !current)
          }
        }}
        className={cn(
          "w-full text-start",
          "flex items-center justify-between gap-3 px-3 py-2.5",
          "transition-colors hover:bg-muted/30",
          "cursor-pointer",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {getStatusIcon(state)}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {formatToolName(toolName)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {getStatusBadge(state)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {state === "output-available" || state === "output-error" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 shrink-0"
              onClick={(event) => {
                event.stopPropagation()
                onRetry()
              }}
              aria-label={t("retry")}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          ) : null}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isExpanded ? "rotate-180" : null,
            )}
          />
        </div>
      </div>

      {isExpanded ? (
        <ToolInvocationBody
          toolName={toolName}
          state={state}
          input={input}
          output={output}
          errorText={errorText}
          authStatus={authStatus}
          showRaw={showRaw}
          onToggleRaw={() => setShowRaw((current) => !current)}
          onCheckAuth={onCheckAuth}
          onRetry={onRetry}
        />
      ) : null}
    </div>
  )
}
