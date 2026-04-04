import { useTranslations } from "next-intl"
import type {
  MessageConversationStarter,
  MessagesRole,
  MessageThread,
} from "@/app/[locale]/(authenticated)/dashboard/messages/_components/MessagesView/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ConversationThreadHeaderProps {
  role: MessagesRole
  selectedThread: MessageThread | null
  selectedStarter: MessageConversationStarter | null
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
  conversation: MessageThread | MessageConversationStarter | null,
  role: MessagesRole,
): string | undefined {
  if (!conversation) {
    return undefined
  }

  if (role === "student") {
    return conversation.companyLogoUrl ?? undefined
  }

  return conversation.studentImage ?? undefined
}

export function ConversationThreadHeader({
  role,
  selectedThread,
  selectedStarter,
  threadTitle,
}: ConversationThreadHeaderProps) {
  const t = useTranslations("dashboard.messages")

  const selectedConversation = selectedThread ?? selectedStarter

  return (
    <div className="border-b border-border/60 px-4 py-3 sm:px-5">
      <div className="flex items-center gap-3">
        <Avatar size="sm">
          <AvatarImage src={getThreadImage(selectedConversation, role)} alt="" />
          <AvatarFallback>{getInitials(threadTitle)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {threadTitle}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {selectedThread?.offerTitle ??
              selectedStarter?.offerTitle ??
              t("placeholderSubtitle")}
          </p>
        </div>
      </div>
    </div>
  )
}
