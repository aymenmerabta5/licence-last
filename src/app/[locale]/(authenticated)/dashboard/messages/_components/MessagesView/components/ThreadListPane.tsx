import { Loader2, MessageCircleMore } from "lucide-react"
import { useTranslations } from "next-intl"

import { ConversationStarterList } from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/components/ConversationStarterList"
import type {
  MessageConversationStarter,
  MessagesRole,
  MessageThread,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatRelativeTime } from "@/lib/date"
import { cn } from "@/lib/utils"

interface ThreadListPaneProps {
  role: MessagesRole
  threads: MessageThread[]
  starters: MessageConversationStarter[]
  selectedThreadId: string | null
  selectedStarterId: string | null
  isLoading: boolean
  errorMessage: string | null
  starterErrorMessage: string | null
  onSelectThread: (threadId: string) => void
  onSelectStarter: (starterId: string) => void
}

function getInitials(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return "?"
  }

  const parts = trimmed.split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join("")
}

function getThreadDisplayName(
  thread: MessageThread,
  role: MessagesRole,
  fallbackCompanyName: string,
  fallbackStudentName: string,
): string {
  if (role === "student") {
    return thread.companyName?.trim() || fallbackCompanyName
  }

  return thread.studentName?.trim() || fallbackStudentName
}

function getThreadImage(
  thread: MessageThread,
  role: MessagesRole,
): string | undefined {
  if (role === "student") {
    return thread.companyLogoUrl ?? undefined
  }

  return thread.studentImage ?? undefined
}

function formatUnreadCount(unreadCount: number): string {
  if (unreadCount > 99) {
    return "99+"
  }

  return String(unreadCount)
}

export function ThreadListPane({
  role,
  threads,
  starters,
  selectedThreadId,
  selectedStarterId,
  isLoading,
  errorMessage,
  starterErrorMessage,
  onSelectThread,
  onSelectStarter,
}: ThreadListPaneProps) {
  const t = useTranslations("dashboard.messages")
  const fallbackCompanyName = t("fallbackCompanyName")
  const fallbackStudentName = t("fallbackStudentName")

  return (
    <div className="border border-border/50 bg-card/30 min-h-[34rem]">
      <div className="border-b border-border/50 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground [[dir=rtl]_&]:tracking-normal">
          {t("threadsLabel")}
        </p>
      </div>

      <div className="max-h-[34rem] overflow-y-auto p-3">
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="px-3 py-6 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {!isLoading && !errorMessage && threads.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center border border-dashed border-border/60">
              <MessageCircleMore className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              {starters.length === 0
                ? role === "student"
                  ? t("emptyStudent")
                  : t("emptyCompany")
                : t("pickStarter")}
            </p>
          </div>
        )}

        {!isLoading && !errorMessage && threads.length > 0 && (
          <div className="space-y-1">
            {threads.map((thread) => {
              const displayName = getThreadDisplayName(
                thread,
                role,
                fallbackCompanyName,
                fallbackStudentName,
              )
              const isActive = thread.id === selectedThreadId

              return (
                <button
                  key={thread.id}
                  type="button"
                  className={cn(
                    "w-full border px-3 py-3 text-start transition-colors",
                    "hover:border-primary/30 hover:bg-primary/5",
                    isActive
                      ? "border-primary/40 bg-primary/10"
                      : "border-transparent",
                  )}
                  onClick={() => onSelectThread(thread.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar size="sm">
                      <AvatarImage src={getThreadImage(thread, role)} alt="" />
                      <AvatarFallback>
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {displayName}
                        </p>
                        <div className="flex shrink-0 items-center gap-1.5">
                          {thread.hasUnread && thread.unreadCount > 0 && (
                            <span
                              aria-label={t("unreadAria", {
                                count: thread.unreadCount,
                              })}
                              className="inline-flex h-5 min-w-5 items-center justify-center bg-primary px-1 text-[10px] font-bold text-primary-foreground"
                            >
                              {formatUnreadCount(thread.unreadCount)}
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            {formatRelativeTime(thread.lastMessageAt)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {thread.offerTitle}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground/80">
                        <MessageCircleMore className="h-3 w-3" />
                        <span>
                          {thread.hasUnread
                            ? t("threadUnread")
                            : t("threadOpen")}
                        </span>
                        {thread.hasUnread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {!isLoading && !errorMessage && (
          <ConversationStarterList
            role={role}
            starters={starters}
            selectedStarterId={selectedStarterId}
            onSelectStarter={onSelectStarter}
          />
        )}

        {!isLoading && !errorMessage && starterErrorMessage && (
          <div className="px-3 py-3 text-xs text-destructive">
            {starterErrorMessage}
          </div>
        )}
      </div>
    </div>
  )
}
