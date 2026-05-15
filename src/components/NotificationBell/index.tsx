"use client"

import { useTranslations } from "next-intl"

import { useNotificationData } from "@/components/NotificationBell/hooks/useNotificationData"
import { NAVBAR_ICON_CONTROL_CLASS } from "@/components/navbar-control-styles"
import { NotificationDropdownContent } from "@/components/NotificationBell/components/NotificationDropdownContent"
import { NotificationTrigger } from "@/components/NotificationBell/components/NotificationTrigger"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface NotificationBellProps {
  viewerId: string
}

export function NotificationBell({ viewerId }: NotificationBellProps) {
  const t = useTranslations("dashboard.notifications")
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    isMarkAllReadPending,
  } = useNotificationData(viewerId)

  const handleOpenChange = (open: boolean) => {
    if (!open || unreadCount === 0 || isMarkAllReadPending) {
      return
    }
    markAllRead()
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-lg"
            className={`${NAVBAR_ICON_CONTROL_CLASS} overflow-visible`}
          />
        }
      >
        <NotificationTrigger unreadCount={unreadCount} />
      </DropdownMenuTrigger>

      <NotificationDropdownContent
        t={t}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
        isMarkAllReadPending={isMarkAllReadPending}
      />
    </DropdownMenu>
  )
}
