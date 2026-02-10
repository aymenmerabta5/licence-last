"use client"

import { ExternalLink, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { getStringProp, isAuthorizationRequiredOutput, isRecord } from "../utils"

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

export function ToolInvocationView({
  part,
  authStatus,
  onCheckAuth,
  onRetry,
}: {
  part: unknown
  authStatus: { status: string | null; url: string | null } | null
  onCheckAuth: (toolName: string) => void
  onRetry: () => void
}) {
  const t = useTranslations("dashboard.assistant")

  const toolName = getToolName(part)
  const state = getToolState(part)

  if (!toolName || !state) return null

  const input = isRecord(part) ? (part.input as unknown) : undefined
  const output = isRecord(part) ? (part.output as unknown) : undefined
  const errorText = isRecord(part) && typeof part.errorText === "string" ? part.errorText : null

  return (
    <details className="mt-3 border border-border/60 bg-muted/10">
      <summary className={cn(
        "cursor-pointer select-none list-none px-3 py-2",
        "flex items-center justify-between gap-3",
      )}>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground truncate">
            {t("toolLabel", { toolName })}
          </p>
          <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{t("toolState", { state })}</p>
        </div>

        <div className="flex items-center gap-2">
          {(state === "output-available" || state === "output-error") && (
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={onRetry}>
              <RefreshCw className="h-3.5 w-3.5" />
              {t("retry")}
            </Button>
          )}
        </div>
      </summary>

      <div className="px-3 pb-3 pt-1 space-y-2">
        {state === "input-streaming" && (
          <p className="text-xs text-muted-foreground">{t("toolPreparing")}</p>
        )}

        {(state === "input-available" || state === "output-available" || state === "output-error" || state === "output-denied" || state === "approval-requested" || state === "approval-responded") && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("toolInput")}</p>
            <pre className="mt-1 text-xs border border-border/60 bg-background/60 p-2 overflow-x-auto">
              {JSON.stringify(input ?? null, null, 2)}
            </pre>
          </div>
        )}

        {state === "output-error" && errorText && (
          <p className="text-xs text-destructive">{errorText}</p>
        )}

        {state === "output-available" && (
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t("toolOutput")}</p>

            {isAuthorizationRequiredOutput(output) ? (
              <div className="rounded-none border border-border/60 bg-background/60 p-3 space-y-2">
                <p className="text-xs text-muted-foreground">{t("authRequired")}</p>

                {(() => {
                  const url = getStringProp(output, "url")
                  if (!url) return null

                  return (
                    <a
                      className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline"
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
                  <Button type="button" variant="outline" size="sm" onClick={() => onCheckAuth(toolName)}>
                    {t("checkStatus")}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                    {t("retryTool")}
                  </Button>
                </div>

                {authStatus && (
                  <p className="text-[11px] text-muted-foreground">
                    {t("authStatus", { status: authStatus.status ?? t("unknown") })}
                  </p>
                )}
              </div>
            ) : (
              <pre className="text-xs border border-border/60 bg-background/60 p-2 overflow-x-auto">
                {JSON.stringify(output ?? null, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </details>
  )
}
