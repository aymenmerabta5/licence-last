"use client"

import { useMemo, useState } from "react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useChat } from "@ai-sdk/react"
import { useQueryClient } from "@tanstack/react-query"
import { Send } from "lucide-react"
import { useTranslations } from "next-intl"

import { orpc } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { MessageBubble } from "./MessageBubble"

type AuthStatus = {
  status: string | null
  url: string | null
}

export function ConversationThread({
  conversationId,
  initialMessages,
}: {
  conversationId: string
  initialMessages: UIMessage[]
}) {
  const t = useTranslations("dashboard.assistant")
  const queryClient = useQueryClient()

  const [input, setInput] = useState("")
  const [authByTool, setAuthByTool] = useState<Record<string, AuthStatus>>({})

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant/chat",
        body: { conversationId },
      }),
    [conversationId],
  )

  const { messages, status, error, sendMessage, regenerate } = useChat({
    transport,
    messages: initialMessages,
    onFinish: async () => {
      const listConversationsQuery = orpc.assistant.listConversations.queryOptions({
        input: { limit: 100 },
      })
      const listMessagesQuery = orpc.assistant.listMessages.queryOptions({
        input: { conversationId },
      })

      await queryClient.invalidateQueries({ queryKey: listConversationsQuery.queryKey })
      await queryClient.invalidateQueries({ queryKey: listMessagesQuery.queryKey })
    },
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
    <>
      <div className="h-[52vh] min-h-[380px] overflow-y-auto pe-2 space-y-4">
        {messages.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">{t("empty")}</div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              authByTool={authByTool}
              onCheckAuth={checkAuth}
              onRegenerateFrom={(messageId) => regenerate({ messageId })}
              showRegenerate={status === "ready"}
            />
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
          className={cn("rounded-none min-h-24", "bg-background/60")}
        />

        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">{t("chatStatus", { status })}</p>
          <Button type="submit" variant="editorial" size="editorial" disabled={status !== "ready"}>
            <Send className="h-4 w-4" />
            {t("send")}
          </Button>
        </div>

        {error && <p className="text-xs text-destructive">{error.message}</p>}
      </form>
    </>
  )
}
