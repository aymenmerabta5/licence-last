"use client"

import { Loader2, Send } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"
import { ConversationMessages } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ConversationMessages"
import { ConversationThreadHeader } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ConversationThreadHeader"
import type {
  MessagesRole,
  MessageThread,
  ThreadMessage,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface ConversationPaneProps {
  role: MessagesRole
  currentUserId: string
  selectedThread: MessageThread | null
  messages: ThreadMessage[]
  isLoading: boolean
  errorMessage: string | null
  draft: string
  onDraftChange: (value: string) => void
  onSendMessage: () => Promise<void>
  sendPending: boolean
  sendErrorMessage: string | null
}

function getThreadTitle(
  thread: MessageThread | null,
  role: MessagesRole,
): string {
  if (!thread) {
    return "Conversation"
  }

  if (role === "student") {
    return thread.companyName?.trim() || "Company"
  }

  return thread.studentName?.trim() || "Student"
}

export function ConversationPane({
  role,
  currentUserId,
  selectedThread,
  messages,
  isLoading,
  errorMessage,
  draft,
  onDraftChange,
  onSendMessage,
  sendPending,
  sendErrorMessage,
}: ConversationPaneProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const threadTitle = useMemo(
    () => getThreadTitle(selectedThread, role),
    [selectedThread, role],
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSendMessage()
  }

  const handleTextareaKeyDown = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      await onSendMessage()
    }
  }

  return (
    <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 min-h-[34rem]">
      <ConversationThreadHeader
        role={role}
        selectedThread={selectedThread}
        threadTitle={threadTitle}
      />

      <div className="flex flex-1 flex-col px-4 py-3 sm:px-5 sm:py-4">
        <ConversationMessages
          selectedThread={selectedThread}
          messages={messages}
          isLoading={isLoading}
          errorMessage={errorMessage}
          currentUserId={currentUserId}
          messagesEndRef={messagesEndRef}
        />

        <form
          onSubmit={handleSubmit}
          className="mt-3 border-t border-border/60 pt-3"
        >
          <Textarea
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder={
              selectedThread
                ? "Write a message..."
                : "Select a thread first to send a message."
            }
            disabled={!selectedThread || sendPending}
            className="min-h-[84px] resize-none rounded-none bg-background/70"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground">
              Press Enter to send, Shift+Enter for a new line.
            </p>
            <Button
              type="submit"
              variant="editorial"
              size="editorial-sm"
              className="gap-2"
              disabled={!selectedThread || !draft.trim() || sendPending}
            >
              {sendPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Send
            </Button>
          </div>

          {sendErrorMessage && (
            <p className="mt-2 text-xs text-destructive">{sendErrorMessage}</p>
          )}
        </form>
      </div>
    </Card>
  )
}
