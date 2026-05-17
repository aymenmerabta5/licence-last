"use client"

import type { InfiniteData } from "@tanstack/react-query"
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { toast } from "sonner"
import { useInfiniteScroll } from "@/hooks"
import { notificationsQueryKeys } from "@/lib/notifications-query"
import { orpc, orpcClient } from "@/server/orpc/client"

const PAGE_SIZE = 20

interface NotificationsCursor {
  createdAt: string
  id: string
}

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

type NotificationsInfiniteData = InfiniteData<
  ClientNotificationListData,
  NotificationsCursor
>

export function useNotifications(viewerId: string) {
  const t = useTranslations("dashboard.notifications")
  const queryClient = useQueryClient()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: notificationsQueryKeys.list(viewerId, PAGE_SIZE),
      queryFn: ({ pageParam }) =>
        orpcClient.notifications.list({
          cursor: pageParam as NotificationsCursor | undefined,
          limit: PAGE_SIZE,
        }),
      initialPageParam: undefined as NotificationsCursor | undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    })

  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.notifications) ?? [],
    [data],
  )
  const unreadCount = data?.pages[0]?.unreadCount ?? 0

  const sentinelRef = useInfiniteScroll(
    () => {
      void fetchNextPage()
    },
    hasNextPage,
    isFetchingNextPage,
  )

  const markAllReadMutation = useMutation({
    ...orpc.notifications.markAllRead.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.root(viewerId),
        })
        toast.success(t("markAllReadSuccess"))
      },
      onError: () => {
        toast.error(t("markAllReadError"))
      },
    }),
    onMutate: async () => {
      const queryKey = notificationsQueryKeys.list(viewerId, PAGE_SIZE)
      await queryClient.cancelQueries({ queryKey })
      const previousData =
        queryClient.getQueryData<NotificationsInfiniteData>(queryKey)
      queryClient.setQueryData<NotificationsInfiniteData>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) =>
              n.readAt === null
                ? { ...n, readAt: new Date().toISOString() }
                : n,
            ),
            unreadCount: 0,
          })),
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          notificationsQueryKeys.list(viewerId, PAGE_SIZE),
          context.previousData,
        )
      }
      toast.error(t("markAllReadError"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationsQueryKeys.root(viewerId),
      })
    },
  })

  const markReadMutation = useMutation({
    ...orpc.notifications.markRead.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.root(viewerId),
        })
      },
    }),
    onMutate: async (variables) => {
      const queryKey = notificationsQueryKeys.list(viewerId, PAGE_SIZE)
      await queryClient.cancelQueries({ queryKey })
      const previousData =
        queryClient.getQueryData<NotificationsInfiniteData>(queryKey)
      queryClient.setQueryData<NotificationsInfiniteData>(queryKey, (old) => {
        if (!old) return old
        const wasUnread = old.pages.some((page) =>
          page.notifications.some(
            (n) => n.id === variables.notificationId && n.readAt === null,
          ),
        )
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) =>
              n.id === variables.notificationId
                ? { ...n, readAt: new Date().toISOString() }
                : n,
            ),
            unreadCount: wasUnread
              ? Math.max(0, page.unreadCount - 1)
              : page.unreadCount,
          })),
        }
      })
      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          notificationsQueryKeys.list(viewerId, PAGE_SIZE),
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

  return {
    notifications,
    unreadCount,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
    markRead: (notificationId: string) =>
      markReadMutation.mutate({ notificationId }),
    markAllRead: () => markAllReadMutation.mutate({}),
    isMarkingRead: markAllReadMutation.isPending,
  }
}
