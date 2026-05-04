import { Loader2, Trash2, X } from "lucide-react"
import * as motion from "motion/react-client"
import type { ConversationListItem } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/types"
import { formatConversationTitle } from "@/app/[locale]/(authenticated)/dashboard/assistant/_components/AssistantChat/utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ConversationSidebarItemProps {
  conversation: ConversationListItem
  index: number
  isActive: boolean
  isDeleting: boolean
  isConfirmingDelete: boolean
  isGeneratingTitle?: boolean
  confirmDeleteLabel: string
  deleteConversationAria: string
  onSelect: (conversationId: string) => void
  onDelete: (conversationId: string) => void
  onCancelDelete: () => void
  formatUpdatedAt: (value: string | Date) => string
}

export function ConversationSidebarItem({
  conversation,
  index,
  isActive,
  isDeleting,
  isConfirmingDelete,
  isGeneratingTitle,
  confirmDeleteLabel,
  deleteConversationAria,
  onSelect,
  onDelete,
  onCancelDelete,
  formatUpdatedAt,
}: ConversationSidebarItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative flex items-center gap-2",
        "border border-transparent px-3 py-2.5 transition-all",
        "hover:border-border/70 hover:bg-muted/20",
        isActive && "border-primary/30 bg-primary/5",
        isDeleting && "opacity-50 pointer-events-none",
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        className="flex-1 min-w-0 text-start"
        disabled={isDeleting}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-foreground truncate font-medium">
            {isGeneratingTitle ? (
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                {formatConversationTitle(conversation.title)}
              </span>
            ) : (
              formatConversationTitle(conversation.title)
            )}
          </p>
          <p className="text-[10px] text-muted-foreground shrink-0">
            {formatUpdatedAt(conversation.updatedAt)}
          </p>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
          {conversation.model}
        </p>
      </button>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onCancelDelete}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="editorial-sm"
              onClick={() => onDelete(conversation.id)}
              className="h-6 px-2 text-[10px]"
            >
              {confirmDeleteLabel}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(conversation.id)}
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            aria-label={deleteConversationAria}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}
