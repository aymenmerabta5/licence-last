"use client"

import { useEffect, useMemo, useRef } from "react"
import { Loader2, Send } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime } from "@/lib/date"
import { cn } from "@/lib/utils"

import type {
  MessageThread,
  MessagesRole,
  ThreadMessage,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"

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

function getInitials(value: string | null | undefined): string {
  const normalized = value?.trim()
  if (!normalized) {
    return "?"
  }

  const parts = normalized.split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join("")
}

function getThreadTitle(thread: MessageThread | null, role: MessagesRole): string {
  if (!thread) {
    return "Conversation"
  }

  if (role === "student") {
    return thread.companyName?.trim() || "Company"
  }

  return thread.studentName?.trim() || "Student"
}

function getThreadImage(thread: MessageThread | null, role: MessagesRole): string | undefined {
  if (!thread) {
    return undefined
  }

  if (role === "student") {
    return thread.companyLogoUrl ?? undefined
  }

  return thread.studentImage ?? undefined
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
  }, [selectedThread?.id, messages.length])

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
      <div className="border-b border-border/60 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarImage src={getThreadImage(selectedThread, role)} alt="" />
            <AvatarFallback>{getInitials(threadTitle)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {threadTitle}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {selectedThread?.offerTitle ?? "Select a thread to start messaging."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex-1 space-y-3 overflow-y-auto pe-1">
          {!selectedThread && (
            <div className="flex h-full min-h-[16rem] items-center justify-center text-center text-sm text-muted-foreground">
              Choose a thread to open the conversation.
            </div>
          )}

          {selectedThread && isLoading && (
            <div className="flex h-full min-h-[16rem] items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}

          {selectedThread && !isLoading && errorMessage && (
            <div className="py-10 text-center text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {selectedThread && !isLoading && !errorMessage && messages.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No messages yet. Start the conversation.
            </div>
          )}

          {selectedThread && !isLoading && !errorMessage && messages.length > 0 && (
            <div className="space-y-3">
              {messages.map((message) => {
                const isOwnMessage = message.senderUserId === currentUserId

                return (
                  <div
                    key={message.id}
                    className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] border px-3 py-2 text-sm",
                        isOwnMessage
                          ? "border-primary/50 bg-primary/10 text-foreground"
                          : "border-border/80 bg-background/70 text-foreground",
                      )}
                    >
                      {!isOwnMessage && (
                        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                          {message.senderName || "Sender"}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words leading-relaxed">
                        {message.body}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {formatDateTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-3 border-t border-border/60 pt-3">
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
            <p className="mt-2 text-xs text-destructive">
              {sendErrorMessage}
            </p>
          )}
        </form>
      </div>
    </Card>
  )
}
