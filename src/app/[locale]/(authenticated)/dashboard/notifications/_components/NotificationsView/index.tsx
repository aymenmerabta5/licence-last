"use client"

import { useNotifications } from "./hooks/useNotifications"
import { useNotificationsSummary } from "./hooks/useNotificationsSummary"
import { NotificationsHeader } from "./components/NotificationsHeader"
import { AiSummaryBox } from "./components/AiSummaryBox"
import { NotificationsList } from "./components/NotificationsList"

interface NotificationsViewProps {
  role: string
}

export function NotificationsView({ role }: NotificationsViewProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
    markAllRead,
    isMarkingRead,
  } = useNotifications()

  const { aiSummary, aiStatus, aiError, summarize } =
    useNotificationsSummary()

  return (
    <div className="space-y-6">
      <NotificationsHeader
        unreadCount={unreadCount}
        canSummarize={aiStatus === "ready" && notifications.length > 0}
        isMarkingRead={isMarkingRead}
        onSummarize={() => summarize(role, notifications)}
        onMarkAllRead={markAllRead}
      />

      {aiError && (
        <p className="text-xs text-destructive">{aiError.message}</p>
      )}

      {aiSummary && (
        <AiSummaryBox
          summaryBullets={aiSummary.summaryBullets}
          suggestedNextActions={aiSummary.suggestedNextActions}
        />
      )}

      <NotificationsList
        notifications={notifications}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        sentinelRef={sentinelRef}
      />
    </div>
  )
}
