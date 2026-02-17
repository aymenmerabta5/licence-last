"use client"

import { useState } from "react"
import { ChevronDown, ExternalLink, RefreshCw, Lock, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import * as motion from "motion/react-client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getStringProp, isAuthorizationRequiredOutput, isRecord } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/utils"

type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied"

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
  const state = part.state
  return typeof state === "string" ? (state as ToolState) : null
}

function formatToolName(name: string): string {
  // Convert snake_case or camelCase to readable text
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
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
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
  authStatus: { status: string | null; url: string | null } | null
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
  const errorText = isRecord(part) && typeof part.errorText === "string" ? part.errorText : null

  const formattedName = formatToolName(toolName)
  const isAuthRequired = isAuthorizationRequiredOutput(output)

  return (
    <div className="mt-3 border border-border/60 bg-muted/10 rounded-none overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-3 py-2.5",
          "hover:bg-muted/30 transition-colors",
          "text-start"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          {getStatusIcon(state)}
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {formattedName}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {getStatusBadge(state)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(state === "output-available" || state === "output-error") && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="h-7 w-7 shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onRetry()
              }}
              aria-label={t("retry")}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border/60"
        >
          <div className="px-3 pb-3 pt-2 space-y-3">
            {/* Authentication required state */}
            {isAuthRequired && (
              <div className="rounded-none border border-border/60 bg-background/60 p-3 space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <p className="text-sm">{t("authRequired")}</p>
                </div>

                {(() => {
                  const url = getStringProp(output, "url")
                  if (!url) return null

                  return (
                    <a
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {t("openAuthLink")}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )
                })()}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onCheckAuth(toolName)}
                  >
                    {t("checkStatus")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                  >
                    {t("retryTool")}
                  </Button>
                </div>

                {authStatus && (
                  <p className="text-[11px] text-muted-foreground">
                    {t("authStatus", { status: authStatus.status ?? t("unknown") })}
                  </p>
                )}
              </div>
            )}

            {/* Error state */}
            {state === "output-error" && errorText && (
              <p className="text-sm text-destructive">{errorText}</p>
            )}

            {/* Show raw data toggle */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {showRaw ? "Raw Data" : "Summary"}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="editorial-sm"
                onClick={() => setShowRaw(!showRaw)}
                className="h-6 text-[10px]"
              >
                {showRaw ? "Show Summary" : "Show Raw"}
              </Button>
            </div>

            {/* Input section */}
            {showRaw && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t("toolInput")}
                </p>
                <pre className="text-xs border border-border/60 bg-background/60 p-2.5 overflow-x-auto rounded-none">
                  {JSON.stringify(input ?? null, null, 2)}
                </pre>
              </div>
            )}

            {/* Output section */}
            {showRaw && state === "output-available" && !isAuthRequired && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t("toolOutput")}
                </p>
                <pre className="text-xs border border-border/60 bg-background/60 p-2.5 overflow-x-auto rounded-none">
                  {JSON.stringify(output ?? null, null, 2)}
                </pre>
              </div>
            )}

            {/* Summary view (when not showing raw) */}
            {!showRaw && state === "output-available" && !isAuthRequired && output ? (
              <div className="text-sm text-muted-foreground">
                {isRecord(output) && typeof output.result === "string" ? (
                  <p>{output.result}</p>
                ) : (
                  <p>Tool executed successfully</p>
                )}
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </div>
  )
}
