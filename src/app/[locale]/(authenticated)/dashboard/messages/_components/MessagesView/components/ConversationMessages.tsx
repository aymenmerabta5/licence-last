import type { RefObject } from "react"

import { Loader2 } from "lucide-react"

import { formatDateTime } from "@/lib/date"
import { cn } from "@/lib/utils"

import type {
  MessageThread,
  ThreadMessage,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"

interface ConversationMessagesProps {
  selectedThread: MessageThread | null
  messages: ThreadMessage[]
  isLoading: boolean
  errorMessage: string | null
  currentUserId: string
  messagesEndRef: RefObject<HTMLDivElement | null>
}

export function ConversationMessages({
  selectedThread,
  messages,
  isLoading,
  errorMessage,
  currentUserId,
  messagesEndRef,
}: ConversationMessagesProps) {
  return (
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
  )
}
