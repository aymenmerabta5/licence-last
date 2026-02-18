import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import type {
  MessageThread,
  MessagesRole,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"

interface ConversationThreadHeaderProps {
  role: MessagesRole
  selectedThread: MessageThread | null
  threadTitle: string
}

function getInitials(value: string | null | undefined): string {
  const normalized = value?.trim()
  if (!normalized) {
    return "?"
  }

  const parts = normalized.split(/\s+/).slice(0, 2)
  return parts.map((part) => part.charAt(0).toUpperCase()).join("")
}

function getThreadImage(
  thread: MessageThread | null,
  role: MessagesRole,
): string | undefined {
  if (!thread) {
    return undefined
  }

  if (role === "student") {
    return thread.companyLogoUrl ?? undefined
  }

  return thread.studentImage ?? undefined
}

export function ConversationThreadHeader({
  role,
  selectedThread,
  threadTitle,
}: ConversationThreadHeaderProps) {
  return (
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
  )
}
