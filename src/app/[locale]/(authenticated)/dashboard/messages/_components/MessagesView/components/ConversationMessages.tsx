"use client"

import { Loader2, MessageSquare } from "lucide-react"
import { useTranslations } from "next-intl"
import type { RefObject } from "react"
import type {
  MessageConversationStarter,
  MessagesRole,
  MessageThread,
  ThreadMessage,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"
import { formatDateTime } from "@/lib/date"
import { cn } from "@/lib/utils"

interface ConversationMessagesProps {
  role: MessagesRole
  selectedThread: MessageThread | null
  selectedStarter: MessageConversationStarter | null
  messages: ThreadMessage[]
  isLoading: boolean
  errorMessage: string | null
  currentUserId: string
  messagesEndRef: RefObject<HTMLDivElement | null>
}

export function ConversationMessages({
  role,
  selectedThread,
  selectedStarter,
  messages,
  isLoading,
  errorMessage,
  currentUserId,
  messagesEndRef,
}: ConversationMessagesProps) {
  const t = useTranslations("dashboard.messages")

  return (
    <div className="flex-1 space-y-3 overflow-y-auto pe-1">
      {!selectedThread && !selectedStarter && (
        <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center border border-dashed border-border/60">
            <MessageSquare className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground">{t("emptySelection")}</p>
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

      {!selectedThread && selectedStarter && (
        <div className="flex h-full min-h-[16rem] items-center justify-center text-center text-sm text-muted-foreground">
          {role === "student"
            ? t("starterPreviewStudent", {
                name: selectedStarter.companyName ?? t("fallbackCompanyName"),
                offerTitle: selectedStarter.offerTitle,
              })
            : t("starterPreviewCompany", {
                name: selectedStarter.studentName ?? t("fallbackStudentName"),
                offerTitle: selectedStarter.offerTitle,
              })}
        </div>
      )}

      {selectedThread &&
        !isLoading &&
        !errorMessage &&
        messages.length === 0 && (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-dashed border-border/60">
              <MessageSquare className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">{t("emptyThread")}</p>
          </div>
        )}

      {selectedThread && !isLoading && !errorMessage && messages.length > 0 && (
        <div className="space-y-3">
          {messages.map((message) => {
            const isOwnMessage = message.senderUserId === currentUserId

            return (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  isOwnMessage ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] border px-3 py-2.5 text-sm",
                    isOwnMessage
                      ? "border-primary/40 bg-primary/5 text-foreground"
                      : "border-border/60 bg-background/70 text-foreground",
                  )}
                >
                  {!isOwnMessage && (
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      {message.senderName || t("fallbackSenderName")}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words leading-relaxed">
                    {message.body}
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground/70">
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
