import * as motion from "motion/react-client"
import { Loader2, MessageCircleMore } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { reveal, revealWithDelay } from "@/lib/animations"
import { formatRelativeTime } from "@/lib/date"
import { cn } from "@/lib/utils"

import type {
  MessageThread,
  MessagesRole,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"

interface ThreadListPaneProps {
  role: MessagesRole
  threads: MessageThread[]
  selectedThreadId: string | null
  isLoading: boolean
  errorMessage: string | null
  onSelectThread: (threadId: string) => void
}

function getInitials(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return "?"
  }

  const parts = trimmed.split(/\s+/).slice(0, 2)
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function getThreadDisplayName(thread: MessageThread, role: MessagesRole): string {
  if (role === "student") {
    return thread.companyName?.trim() || "Company"
  }

  return thread.studentName?.trim() || "Student"
}

function getThreadImage(thread: MessageThread, role: MessagesRole): string | undefined {
  if (role === "student") {
    return thread.companyLogoUrl ?? undefined
  }

  return thread.studentImage ?? undefined
}

export function ThreadListPane({
  role,
  threads,
  selectedThreadId,
  isLoading,
  errorMessage,
  onSelectThread,
}: ThreadListPaneProps) {
  return (
    <Card className="rounded-none border-border/60 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/40 min-h-[34rem]">
      <div className="border-b border-border/60 px-4 py-3 sm:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Threads
        </p>
      </div>

      <div className="max-h-[34rem] overflow-y-auto p-2">
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
          <div className="px-4 py-12 text-center text-sm text-muted-foreground">
            No conversations yet.
          </div>
        )}

        {!isLoading && !errorMessage && threads.length > 0 && (
          <div className="space-y-1">
            {threads.map((thread, index) => {
              const displayName = getThreadDisplayName(thread, role)
              const isActive = thread.id === selectedThreadId

              return (
                <motion.button
                  key={thread.id}
                  type="button"
                  {...reveal}
                  transition={revealWithDelay(Math.min(index * 0.03, 0.22))}
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
                      <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {displayName}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatRelativeTime(thread.lastMessageAt)}
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {thread.offerTitle}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground/80">
                        <MessageCircleMore className="h-3 w-3" />
                        <span>Open thread</span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
