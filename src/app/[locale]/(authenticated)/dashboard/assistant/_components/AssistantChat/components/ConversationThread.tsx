"use client"

import type { UIMessage } from "ai"
import { ChevronDown } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ConversationComposer } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/ConversationComposer"
import { MessageBubble } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/MessageBubble"
import { SaveNoteDialog } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/components/SaveNoteDialog"
import { useConversationThread } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/hooks/useConversationThread"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"

interface ConversationThreadProps {
  conversationId: string
  initialMessages: UIMessage[]
  messageCreatedAtById: Record<string, string | Date | undefined>
  isNoteDialogOpen: boolean
  onNoteDialogOpenChange: (open: boolean) => void
  onAppendNote: (
    note: string,
    onSuccess?: (savedText: string) => void,
  ) => Promise<void>
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-muted/30 border-s-2 border-primary/20">
      <div className="flex gap-1">
        <motion.span
          key="dot-1"
          className="w-2 h-2 bg-primary/60 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
        />
        <motion.span
          key="dot-2"
          className="w-2 h-2 bg-primary/60 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        <motion.span
          key="dot-3"
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
  isNoteDialogOpen,
  onNoteDialogOpenChange,
  onAppendNote,
}: ConversationThreadProps) {
  const t = useTranslations("dashboard.assistant")
  const [isSavingNote, setIsSavingNote] = useState(false)

  const {
    messages,
    setMessages,
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
  } = useConversationThread({ conversationId, initialMessages })

  const handleSaveNote = async (noteText: string) => {
    setIsSavingNote(true)
    try {
      await onAppendNote(noteText, (savedText) => {
        const noteMessage = {
          id: crypto.randomUUID(),
          role: "user" as const,
          parts: [
            { type: "text", text: savedText },
            { type: "note-marker" },
          ] as UIMessage["parts"],
        }
        setMessages((prev) => [...prev, noteMessage])
        scrollToBottom()
      })
    } finally {
      setIsSavingNote(false)
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-4 min-h-0 pe-2 pt-4"
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
                showRegenerate={
                  status === "ready" && message.role === "assistant"
                }
              />
            </motion.div>
          ))
        )}

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

      <ConversationComposer
        input={input}
        isStreaming={isStreaming}
        canSendMessage={canSendMessage}
        errorMessage={error?.message ?? null}
        textareaRef={textareaRef}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        onTextareaChange={handleTextareaChange}
        onStop={stop}
      />

      <SaveNoteDialog
        open={isNoteDialogOpen}
        onOpenChange={onNoteDialogOpenChange}
        onSave={handleSaveNote}
        isSaving={isSavingNote}
      />
    </div>
  )
}
