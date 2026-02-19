"use client"

import { useChat } from "@ai-sdk/react"

import { DefaultChatTransport } from "ai"
import { useMemo, useRef } from "react"

import { asRecord, findLatestToolOutput } from "@/lib/ai/tool-output"

/**
 * Shared AI copilot hook. Wraps `useChat` with `DefaultChatTransport`,
 * an `aiActiveRef` guard, and automatic tool-output extraction.
 *
 * Used by OfferDetail (cover letter), PlacementDetail (validation summary),
 * and ExploreClient (search parsing). OfferForm handles its own multi-intent
 * pattern separately.
 *
 * @example
 * const { sendMessage, status, error, reset, messages } = useCopilot({
 *   toolName: "student_cover_letter_draft",
 *   onResult: (output) => setCoverLetter(output.coverLetter as string),
 * })
 *
 * // Trigger
 * sendMessage("Draft a cover letter", { body: { context: { intent: "student_cover_letter_draft" } } })
 */
export function useCopilot(options: {
  toolName: string
  onResult: (output: Record<string, unknown>) => void
}) {
  const { toolName, onResult } = options
  const aiActiveRef = useRef(false)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/assistant/chat" }),
    [],
  )

  const {
    status,
    error,
    messages,
    sendMessage: rawSendMessage,
    setMessages,
  } = useChat({
    transport,
    onFinish: ({ messages }) => {
      if (!aiActiveRef.current) return
      aiActiveRef.current = false

      const out = asRecord(findLatestToolOutput(messages, toolName))
      if (!out) return

      onResult(out)
    },
  })

  const sendMessage: typeof rawSendMessage = (message, opts) => {
    aiActiveRef.current = true
    setMessages([])
    return rawSendMessage(message, opts)
  }

  const reset = () => {
    aiActiveRef.current = false
    setMessages([])
  }

  return { sendMessage, status, error, messages, reset }
}
