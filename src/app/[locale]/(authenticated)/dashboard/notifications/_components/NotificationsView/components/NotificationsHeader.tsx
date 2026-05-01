import { CheckCheck, Sparkles } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { ease, reveal, revealWithDelay } from "@/lib/animations"

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
    <header className="space-y-4">
      <motion.div
        {...reveal}
        transition={{ duration: 0.6, ease }}
        className="h-0.5 bg-primary"
      />

      <div className="space-y-3">
        <motion.div
          {...reveal}
          transition={revealWithDelay(0.1)}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6"
        >
          <div className="space-y-2">
            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight text-heading">
              {t("title")}
            </h1>
            <p className="text-sm font-light tracking-wide text-muted-foreground">
              {t("unreadCount", { count: unreadCount })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-sm"
              disabled={!canSummarize}
              onClick={onSummarize}
            >
              <Sparkles className="h-4 w-4" />
              {t("summarize")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-sm"
              disabled={unreadCount === 0 || isMarkingRead}
              onClick={onMarkAllRead}
            >
              <CheckCheck className="h-4 w-4" />
              {t("markAllRead")}
            </Button>
          </div>
        </motion.div>
      </div>
    </header>
  )
}
