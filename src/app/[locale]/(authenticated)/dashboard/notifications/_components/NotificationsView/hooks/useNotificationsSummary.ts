"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useTranslations } from "next-intl"
import { useRef, useState } from "react"

import {
  asRecord,
  findLatestToolOutput,
  getStringArray,
} from "@/lib/ai/tool-output"

type NotificationsSummary = {
  summaryBullets: string[]
  suggestedNextActions: string[]
}

interface Notification {
  id: string
  type: string
  createdAt: string | Date
  readAt: string | Date | null
  payload: unknown
}

export function useNotificationsSummary() {
  const t = useTranslations("dashboard.notifications")

  const [aiSummary, setAiSummary] = useState<NotificationsSummary | null>(null)
  const aiActiveRef = useRef(false)

  const aiTransport = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant/chat",
      }),
  )[0]

  const {
    status: aiStatus,
    error: aiError,
    sendMessage: sendAiMessage,
    setMessages: setAiMessages,
  } = useChat({
    transport: aiTransport,
    onFinish: ({ messages }) => {
      if (!aiActiveRef.current) return
      aiActiveRef.current = false

      const out = asRecord(
        findLatestToolOutput(messages, "notifications_summarize"),
      )
      if (!out) return

      setAiSummary({
        summaryBullets: getStringArray(out.summaryBullets),
        suggestedNextActions: getStringArray(out.suggestedNextActions),
      })
    },
  })

  const summarize = (role: string, notifications: Notification[]) => {
    aiActiveRef.current = true
    setAiSummary(null)
    setAiMessages([])

    const context = {
      intent: "notifications_summarize",
      role,
      notifications: notifications.slice(0, 50).map((n) => ({
        id: n.id,
        type: n.type,
        createdAt: n.createdAt,
        readAt: n.readAt,
        payload: n.payload,
      })),
    }

    void sendAiMessage({ text: t("prompts.summarize") }, { body: { context } })
  }

  return {
    aiSummary,
    aiStatus,
    aiError,
    summarize,
  }
}
