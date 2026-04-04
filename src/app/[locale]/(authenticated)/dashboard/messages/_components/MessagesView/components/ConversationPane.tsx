"use client"

import { Loader2, Send } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useRef } from "react"
import { ConversationMessages } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ConversationMessages"
import { ConversationThreadHeader } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ConversationThreadHeader"
import type {
  MessageConversationStarter,
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
  selectedStarter: MessageConversationStarter | null
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
  starter: MessageConversationStarter | null,
  role: MessagesRole,
  fallbackConversation: string,
  fallbackCompanyName: string,
  fallbackStudentName: string,
): string {
  const conversation = thread ?? starter

  if (!conversation) {
    return fallbackConversation
  }

  if (role === "student") {
    return conversation.companyName?.trim() || fallbackCompanyName
  }

  return conversation.studentName?.trim() || fallbackStudentName
}

export function ConversationPane({
  role,
  currentUserId,
  selectedThread,
  selectedStarter,
  messages,
  isLoading,
  errorMessage,
  draft,
  onDraftChange,
  onSendMessage,
  sendPending,
  sendErrorMessage,
}: ConversationPaneProps) {
  const t = useTranslations("dashboard.messages")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const canCompose = Boolean(selectedThread || selectedStarter)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const threadTitle = useMemo(
    () =>
      getThreadTitle(
        selectedThread,
        selectedStarter,
        role,
        t("placeholderTitle"),
        t("fallbackCompanyName"),
        t("fallbackStudentName"),
      ),
    [role, selectedStarter, selectedThread, t],
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
        selectedStarter={selectedStarter}
        threadTitle={threadTitle}
      />

      <div className="flex flex-1 flex-col px-4 py-3 sm:px-5 sm:py-4">
        <ConversationMessages
          role={role}
          selectedThread={selectedThread}
          selectedStarter={selectedStarter}
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
                ? t("composerPlaceholderThread")
                : selectedStarter
                  ? role === "student"
                    ? t("composerPlaceholderStarterStudent")
                    : t("composerPlaceholderStarterCompany")
                  : t("composerPlaceholderEmpty")
            }
            disabled={!canCompose || sendPending}
            className="min-h-[84px] resize-none rounded-none bg-background/70"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground">
              {t("composerHint")}
            </p>
            <Button
              type="submit"
              variant="editorial"
              size="editorial-sm"
              className="gap-2"
              disabled={!canCompose || !draft.trim() || sendPending}
            >
              {sendPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {t("send")}
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
