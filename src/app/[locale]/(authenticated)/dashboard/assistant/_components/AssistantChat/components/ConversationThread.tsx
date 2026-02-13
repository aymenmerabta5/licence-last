"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useChat } from "@ai-sdk/react"
import { useQueryClient } from "@tanstack/react-query"
import { Send, Square, ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import * as motion from "motion/react-client"

import { orpc } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { reveal, ease } from "@/lib/animations"

import { MessageBubble } from "./MessageBubble"

type AuthStatus = {
  status: string | null
  url: string | null
}

interface ConversationThreadProps {
  conversationId: string
  initialMessages: UIMessage[]
  messageCreatedAtById: Record<string, string | Date | undefined>
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-muted/30 border-s-2 border-primary/20">
      <div className="flex gap-1">
        <motion.span
          className="w-2 h-2 bg-primary/60 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          className="w-2 h-2 bg-primary/60 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          className="w-2 h-2 bg-primary/60 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
        />
      </div>
    </div>
  )
}

export function ConversationThread({
  conversationId,
  initialMessages,
  messageCreatedAtById,
}: ConversationThreadProps) {
  const t = useTranslations("dashboard.assistant")
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
    [conversationId]
  )

  const { messages, status, error, sendMessage, regenerate, stop } = useChat({
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

  // Auto-scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Show scroll-to-bottom button when user scrolls up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
    setShowScrollButton(!isNearBottom)
  }, [])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  // Check auth status for tools
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

  // Handle form submission
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || status !== "ready") return
    sendMessage({ text })
    setInput("")
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  // Handle Enter key (send on Enter, newline on Shift+Enter)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  // Auto-resize textarea
  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    const textarea = e.target
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
  }

  const isStreaming = status === "streaming" || status === "submitted"

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-4 min-h-0 pe-2"
      >
        {messages.length === 0 ? (
          <motion.div
            {...reveal}
            transition={{ duration: 0.5, ease }}
            className="py-12 text-center text-sm text-muted-foreground"
          >
            {t("empty")}
          </motion.div>
        ) : (
          messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease, delay: index * 0.05 }}
            >
              <MessageBubble
                message={message}
                createdAt={messageCreatedAtById[message.id]}
                authByTool={authByTool}
                onCheckAuth={checkAuth}
                onRegenerateFrom={(messageId) => regenerate({ messageId })}
                showRegenerate={status === "ready" && message.role === "assistant"}
              />
            </motion.div>
          ))
        )}

        {/* Typing indicator */}
        {status === "submitted" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <TypingIndicator />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-24 end-6"
        >
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={scrollToBottom}
            className="rounded-full shadow-lg"
            aria-label={t("scrollToBottom")}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
            disabled={isStreaming}
            className={cn(
              "rounded-none min-h-[56px] max-h-[200px] bg-background/60 resize-none",
              "pe-14 pb-8", // Space for button and hint
              "focus-visible:ring-1 focus-visible:ring-primary/30"
            )}
            rows={1}
          />

          {/* Send/Stop button */}
          <div className="absolute end-2 bottom-2">
            {isStreaming ? (
              <Button
                type="button"
                variant="destructive"
                size="icon-sm"
                onClick={stop}
                aria-label={t("stop")}
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="default"
                size="icon-sm"
                disabled={!input.trim() || status !== "ready"}
                aria-label={t("send")}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* Keyboard hint */}
          <p className="absolute start-3 bottom-2 text-[10px] text-muted-foreground/70">
            {t("enterToSend")}
          </p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-destructive"
          >
            {error.message}
          </motion.p>
        )}
      </form>
    </div>
  )
}
