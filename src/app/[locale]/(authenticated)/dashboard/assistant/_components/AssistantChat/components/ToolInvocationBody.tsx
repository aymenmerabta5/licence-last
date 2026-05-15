import { ExternalLink, Lock } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type {
  ToolAuthStatus,
  ToolState,
} from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/toolInvocationTypes"
import {
  getStringProp,
  isAuthorizationRequiredOutput,
  isRecord,
} from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/utils"
import { Button } from "@/components/ui/button"

interface ToolInvocationBodyProps {
  toolName: string
  state: ToolState
  input: unknown
  output: unknown
  errorText: string | null
  authStatus: ToolAuthStatus | null
  showRaw: boolean
  onToggleRaw: () => void
  onCheckAuth: (toolName: string) => void
  onRetry: () => void
}

export function ToolInvocationBody({
  toolName,
  state,
  input,
  output,
  errorText,
  authStatus,
  showRaw,
  onToggleRaw,
  onCheckAuth,
  onRetry,
}: ToolInvocationBodyProps) {
  const t = useTranslations("dashboard.assistant")
  const tTool = useTranslations("dashboard.assistant.tool")
  const isAuthRequired = isAuthorizationRequiredOutput(output)
  const toolOutputError =
    isRecord(output) && typeof output.error === "string" ? output.error : null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-border/60"
    >
      <div className="space-y-3 px-3 pb-3 pt-2">
        {isAuthRequired ? (
          <div className="space-y-3 rounded-none border border-border/60 bg-background/60 p-3">
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

            {authStatus ? (
              <p className="text-[11px] text-muted-foreground">
                {t("authStatus", { status: authStatus.status ?? t("unknown") })}
              </p>
            ) : null}
          </div>
        ) : null}

        {state === "output-error" && errorText ? (
          <p className="text-sm text-destructive">{errorText}</p>
        ) : null}

        {state === "output-available" && toolOutputError ? (
          <p className="text-sm text-destructive">{toolOutputError}</p>
        ) : null}

        <div className="flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {showRaw ? tTool("rawData") : tTool("summary")}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="editorial-sm"
            onClick={onToggleRaw}
            className="h-6 text-[10px]"
          >
            {showRaw ? tTool("showSummary") : tTool("showRaw")}
          </Button>
        </div>

        {showRaw ? (
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("toolInput")}
            </p>
            <pre className="overflow-x-auto rounded-none border border-border/60 bg-background/60 p-2.5 text-xs">
              {JSON.stringify(input ?? null, null, 2)}
            </pre>
          </div>
        ) : null}

        {showRaw && state === "output-available" && !isAuthRequired ? (
          <div>
            <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
              {t("toolOutput")}
            </p>
            <pre className="overflow-x-auto rounded-none border border-border/60 bg-background/60 p-2.5 text-xs">
              {JSON.stringify(output ?? null, null, 2)}
            </pre>
          </div>
        ) : null}

        {!showRaw &&
        state === "output-available" &&
        !isAuthRequired &&
        output &&
        !toolOutputError ? (
          <div className="text-sm text-muted-foreground">
            {isRecord(output) && typeof output.result === "string" ? (
              <p>{output.result}</p>
            ) : (
              <p>{tTool("executedSuccessfully")}</p>
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}
