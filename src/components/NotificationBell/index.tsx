"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { NAVBAR_ICON_CONTROL_CLASS } from "@/components/navbar-control-styles"
import { NotificationDropdownContent } from "@/components/NotificationBell/components/NotificationDropdownContent"
import { NotificationTrigger } from "@/components/NotificationBell/components/NotificationTrigger"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationsQueryKeys } from "@/lib/notifications-query"
import { orpc, orpcClient } from "@/server/orpc/client"

interface ClientNotification {
  id: string
  type: string
  payload: Record<string, unknown>
  readAt: string | Date | null
  createdAt: Date
}

interface ClientNotificationListData {
  notifications: ClientNotification[]
  unreadCount: number
  nextCursor: { createdAt: string; id: string } | undefined
  hasMore: boolean
}

export interface NotificationBellProps {
  viewerId: string
}

export function NotificationBell({ viewerId }: NotificationBellProps) {
  const t = useTranslations("dashboard.notifications")
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: notificationsQueryKeys.list(viewerId, 6),
    queryFn: () => orpcClient.notifications.list({ limit: 6 }),
  })

  const unreadCount = data?.unreadCount ?? 0
  const notifications = data?.notifications ?? []

  const markReadMutation = useMutation({
    ...orpc.notifications.markRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.root(viewerId),
        })
      },
    }),
    onMutate: async (variables) => {
      const queryKey = notificationsQueryKeys.list(viewerId, 6)
      await queryClient.cancelQueries({ queryKey })
      const previousData =
        queryClient.getQueryData<ClientNotificationListData>(queryKey)
      queryClient.setQueryData<ClientNotificationListData>(queryKey, (old) => {
        if (!old) return old
        const target = old.notifications.find(
          (n) => n.id === variables.notificationId,
        )
        const wasUnread = target && target.readAt === null
        return {
          ...old,
          notifications: old.notifications.map((n) =>
            n.id === variables.notificationId
              ? { ...n, readAt: new Date().toISOString() }
              : n,
          ),
          unreadCount: wasUnread
            ? Math.max(0, old.unreadCount - 1)
            : old.unreadCount,
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          notificationsQueryKeys.list(viewerId, 6),
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.root(viewerId),
      })
    },
  })

  const markAllReadMutation = useMutation({
    ...orpc.notifications.markAllRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.root(viewerId),
        })
      },
    }),
    onMutate: async () => {
      const queryKey = notificationsQueryKeys.list(viewerId, 6)
      await queryClient.cancelQueries({ queryKey })
      const previousData =
        queryClient.getQueryData<ClientNotificationListData>(queryKey)
      queryClient.setQueryData<ClientNotificationListData>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          notifications: old.notifications.map((n) =>
            n.readAt === null ? { ...n, readAt: new Date().toISOString() } : n,
          ),
          unreadCount: 0,
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          notificationsQueryKeys.list(viewerId, 6),
          context.previousData,
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.root(viewerId),
      })
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (!open || unreadCount === 0 || markAllReadMutation.isPending) {
      return
    }

    markAllReadMutation.mutate({})
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
        onMarkRead={(notificationId) =>
          markReadMutation.mutate({ notificationId })
        }
        onMarkAllRead={() => markAllReadMutation.mutate({})}
        isMarkAllReadPending={markAllReadMutation.isPending}
      />
    </DropdownMenu>
  )
}
