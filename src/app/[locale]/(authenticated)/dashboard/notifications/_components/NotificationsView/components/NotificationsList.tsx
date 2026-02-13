import type { RefObject } from "react"
import * as motion from "motion/react-client"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"

import { reveal, ease } from "@/lib/animations"

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
  sentinelRef: RefObject<HTMLDivElement | null>
}

export function NotificationsList({
  notifications,
  isLoading,
  isFetchingNextPage,
  sentinelRef,
}: NotificationsListProps) {
  const t = useTranslations("dashboard.notifications")

  return (
    <>
      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          {t("empty")}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              {...reveal}
              transition={{ duration: 0.4, ease, delay: 0.02 * i }}
              className="border border-border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-wide text-heading">
                    {n.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 break-words">
                    {JSON.stringify(n.payload)}
                  </p>
                </div>
                {n.readAt === null && (
                  <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </>
  )
}
