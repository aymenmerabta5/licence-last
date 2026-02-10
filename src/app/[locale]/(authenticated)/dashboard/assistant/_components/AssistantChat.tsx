"use client"

import { useMemo, useState } from "react"
import { DefaultChatTransport } from "ai"
import { useChat } from "@ai-sdk/react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { ExternalLink, RefreshCw, Send, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type AuthStatus = {
  status: string | null
  url: string | null
}

const reveal = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

const ease = [0.4, 0, 0.2, 1] as const

function getObjectStringProp(value: unknown, key: string): string | null {
  if (typeof value !== "object" || value === null) return null
  const record = value as Record<string, unknown>
  const prop = record[key]
  return typeof prop === "string" ? prop : null
}

function isAuthorizationRequiredOutput(output: unknown): boolean {
  if (typeof output !== "object" || output === null) return false
  return "authorization_required" in (output as Record<string, unknown>)
}

export function AssistantChat() {
  const t = useTranslations("dashboard.assistant")
  const [input, setInput] = useState("")
  const [authByTool, setAuthByTool] = useState<Record<string, AuthStatus>>({})

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant/chat",
      }),
    [],
  )

  const { messages, status, error, sendMessage, regenerate } = useChat({
    transport,
  })

  async function checkAuth(toolName: string) {
    const res = await fetch("/api/assistant/auth/status", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ toolName }),
    })

    if (!res.ok) {
      setAuthByTool((prev) => ({
        ...prev,
        [toolName]: { status: "error", url: null },
      }))
      return
    }

    const json = (await res.json()) as AuthStatus
    setAuthByTool((prev) => ({
      ...prev,
      [toolName]: { status: json.status ?? null, url: json.url ?? null },
    }))
  }

  return (
    <div className="space-y-8">
      <motion.header
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="space-y-3"
      >
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          {t("kicker")}
        </p>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="font-serif text-[clamp(2rem,4.5vw,2.75rem)] leading-none tracking-tight text-heading">
              {t.rich("title", {
                accent: (chunks) => <span className="text-primary">{chunks}</span>,
              })}
            </h1>
            <p className="text-sm text-muted-foreground font-light tracking-wide max-w-2xl">
              {t("subtitle")}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs tracking-wide">{t("badge")}</span>
          </div>
        </div>
      </motion.header>

      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
          <div className="p-5 sm:p-6">
            <div className="h-[52vh] min-h-[380px] overflow-y-auto pe-2 space-y-4">
              {messages.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  {t("empty")}
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
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
                      {message.parts.map((part, idx) => {
                        if (part.type === "text") {
                          return (
                            <p key={idx} className="whitespace-pre-wrap">
                              {part.text}
                            </p>
                          )
                        }

                        if (part.type === "dynamic-tool") {
                          const statusForTool = authByTool[part.toolName]

                          return (
                            <div key={idx} className="mt-3 border-t border-border/60 pt-3 space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                                  {t("toolLabel", { toolName: part.toolName })}
                                </p>

                                {part.state === "output-available" && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2"
                                    onClick={() => regenerate({ messageId: message.id })}
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    {t("retry")}
                                  </Button>
                                )}
                              </div>

                              {part.state === "input-streaming" && (
                                <p className="text-xs text-muted-foreground">{t("toolPreparing")}</p>
                              )}

                              {part.state === "input-available" && (
                                <pre className="text-xs rounded-md border border-border/60 bg-muted/20 p-2 overflow-x-auto">
                                  {JSON.stringify(part.input, null, 2)}
                                </pre>
                              )}

                              {part.state === "output-error" && (
                                <p className="text-xs text-destructive">{part.errorText}</p>
                              )}

                              {part.state === "output-available" && (
                                <div className="space-y-2">
                                  {isAuthorizationRequiredOutput(part.output) ? (
                                    <div className="rounded-md border border-border/60 bg-muted/20 p-3 space-y-2">
                                      <p className="text-xs text-muted-foreground">
                                        {t("authRequired")}
                                      </p>

                                      {(() => {
                                        const url = getObjectStringProp(part.output, "url")
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
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => checkAuth(part.toolName)}
                                        >
                                          {t("checkStatus")}
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => regenerate({ messageId: message.id })}
                                        >
                                          {t("retryTool")}
                                        </Button>
                                      </div>

                                        {statusForTool && (
                                          <p className="text-[11px] text-muted-foreground">
                                            {t("authStatus", {
                                              status: statusForTool.status ?? t("unknown"),
                                            })}
                                          </p>
                                        )}
                                    </div>
                                  ) : (
                                    <pre className="text-xs rounded-md border border-border/60 bg-muted/20 p-2 overflow-x-auto">
                                      {JSON.stringify(part.output, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        }

                        return null
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                const text = input.trim()
                if (!text) return
                sendMessage({ text })
                setInput("")
              }}
            >
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("inputPlaceholder")}
                className="rounded-none min-h-24"
              />

              <div className="flex items-center justify-between gap-3">
                <p className="text-[11px] text-muted-foreground">{t("chatStatus", { status })}</p>
                <Button
                  type="submit"
                  variant="editorial"
                  size="editorial"
                  disabled={status !== "ready"}
                >
                  <Send className="h-4 w-4" />
                  {t("send")}
                </Button>
              </div>

              {error && <p className="text-xs text-destructive">{error.message}</p>}
            </form>
          </div>
        </Card>

        <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40">
          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground border-b border-border/60 pb-2">
              {t("promptIdeas.title")}
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                {t.rich("promptIdeas.idea1", {
                  highlight: (chunks) => <span className="text-foreground">{chunks}</span>,
                })}
              </p>
              <p>{t("promptIdeas.idea2")}</p>
              <p>{t("promptIdeas.idea3")}</p>
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              {t("promptIdeas.note")}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
