import { CheckCheck, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ease, reveal } from "@/lib/animations"

interface NotificationsHeaderProps {
  unreadCount: number
  canSummarize: boolean
  isMarkingRead: boolean
  onSummarize: () => void
  onMarkAllRead: () => void
}

export function NotificationsHeader({
  unreadCount,
  canSummarize,
  isMarkingRead,
  onSummarize,
  onMarkAllRead,
}: NotificationsHeaderProps) {
  const t = useTranslations("dashboard.notifications")

  return (
    <motion.div
      {...reveal}
      transition={{ duration: 0.6, ease }}
      className="flex items-end justify-between gap-4"
    >
      <div className="space-y-1">
        <h1 className="font-serif text-3xl text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground font-light">
          {t("unreadCount", { count: unreadCount })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!canSummarize}
          onClick={onSummarize}
        >
          <Sparkles className="h-4 w-4" />
          {t("summarize")}
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={unreadCount === 0 || isMarkingRead}
          onClick={onMarkAllRead}
        >
          <CheckCheck className="h-4 w-4" />
          {t("markAllRead")}
        </Button>
      </div>
    </motion.div>
  )
}
