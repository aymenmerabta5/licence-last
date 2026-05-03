import { Bell, Loader2 } from "lucide-react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import type { RefObject } from "react"

import { Link } from "@/i18n/routing"
import { ease } from "@/lib/animations"
import { formatNotification, getNotificationDestination } from "@/lib/notifications"
import { formatRelativeTime } from "@/lib/date"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: string
  createdAt: string | Date
  readAt: string | Date | null
  payload: unknown
}

interface NotificationsListProps {
  notifications: Notification[]
  isLoading: boolean
  isFetchingNextPage: boolean
  onMarkRead: (notificationId: string) => void
  sentinelRef: RefObject<HTMLDivElement | null>
}

export function NotificationsList({
  notifications,
  isLoading,
  isFetchingNextPage,
  onMarkRead,
  sentinelRef,
}: NotificationsListProps) {
  const t = useTranslations("dashboard.notifications")

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {t("loading")}
        </span>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease }}
        className="border border-dashed border-border/60 p-12 text-center space-y-4"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center border border-border/50 bg-muted/30">
          <Bell className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <div className="space-y-2">
          <p className="font-serif text-lg text-heading">{t("emptyTitle")}</p>
          <p className="text-sm font-light text-muted-foreground">
            {t("empty")}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="border-t border-border">
      {notifications.map((n, i) => {
        const formatted = formatNotification(
          {
            type: n.type,
            payload: n.payload,
          },
          t,
        )
        const isUnread = n.readAt === null
        const destination = getNotificationDestination({
          type: n.type,
          payload: n.payload,
        })

        return (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.4), ease }}
            className={cn(
              "group relative block w-full text-start border-b border-border/50 bg-background transition-colors",
              isUnread ? "hover:bg-muted/5" : "opacity-75",
            )}
          >
            <Link
              href={destination.href as "/dashboard"}
              className="block py-5 px-4 text-inherit no-underline sm:px-6"
              onClick={() => {
                if (isUnread) {
                  onMarkRead(n.id)
                }
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-semibold tracking-wide text-heading uppercase">
                    {formatted.title}
                  </p>
                  {formatted.message && (
                    <p className="text-sm text-muted-foreground font-light wrap-break-word">
                      {formatted.message}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                  {isUnread && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {t("loadingMore")}
          </span>
        </div>
      )}
    </div>
  )
}
