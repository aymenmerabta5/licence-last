"use client"

import { useChat } from "@ai-sdk/react"
import { useQueryClient } from "@tanstack/react-query"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { orpc } from "@/server/orpc/client"

export interface AuthStatus {
  status: string | null
  url: string | null
}

interface UseConversationThreadOptions {
  conversationId: string
  initialMessages: UIMessage[]
}

export function useConversationThread({
  conversationId,
  initialMessages,
}: UseConversationThreadOptions) {
  const queryClient = useQueryClient()

  const [input, setInput] = useState("")
  const [authByTool, setAuthByTool] = useState<Record<string, AuthStatus>>({})
  const [showScrollButton, setShowScrollButton] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/assistant/chat",
        body: { conversationId },
      }),
    [conversationId],
  )

  const { messages, status, error, sendMessage, regenerate, stop } = useChat({
    transport,
    messages: initialMessages,
    onFinish: async () => {
      const listConversationsQuery =
        orpc.assistant.listConversations.queryOptions({
          input: { limit: 100 },
        })
      const listMessagesQuery = orpc.assistant.listMessages.queryOptions({
        input: { conversationId },
      })

      await queryClient.invalidateQueries({
        queryKey: listConversationsQuery.queryKey,
      })
      await queryClient.invalidateQueries({
        queryKey: listMessagesQuery.queryKey,
      })
    },
  })

  const isStreaming = status === "streaming" || status === "submitted"
  const canSendMessage = status === "ready" && input.trim().length > 0

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }, [])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  const checkAuth = useCallback(async (toolName: string) => {
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
  }, [])

  const submitMessage = useCallback(() => {
    const text = input.trim()
    if (!text || status !== "ready") return

    sendMessage({ text })
    setInput("")

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [input, sendMessage, status])

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      submitMessage()
    },
    [submitMessage],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        submitMessage()
      }
    },
    [submitMessage],
  )

  const handleTextareaChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value)
      const textarea = event.target
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    },
    [],
  )

  return {
    messages,
    status,
    error,
    input,
    authByTool,
    isStreaming,
    canSendMessage,
    messagesEndRef,
    messagesContainerRef,
    textareaRef,
    showScrollButton,
    checkAuth,
    scrollToBottom,
    regenerate,
    stop,
    handleSubmit,
    handleKeyDown,
    handleTextareaChange,
  }
}
