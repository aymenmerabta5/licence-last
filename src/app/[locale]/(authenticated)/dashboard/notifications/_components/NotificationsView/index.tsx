"use client"

import { useNotifications } from "@/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView/hooks/useNotifications"
import { useNotificationsSummary } from "@/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView/hooks/useNotificationsSummary"
import { NotificationsHeader } from "@/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView/components/NotificationsHeader"
import { AiSummaryBox } from "@/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView/components/AiSummaryBox"
import { NotificationsList } from "@/app/[locale]/(authenticated)/dashboard/notifications/_components/NotificationsView/components/NotificationsList"

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
