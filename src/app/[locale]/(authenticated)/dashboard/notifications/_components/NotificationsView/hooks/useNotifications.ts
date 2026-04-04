"use client"

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
  })

  const markReadMutation = useMutation(
    orpc.notifications.markRead.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.root(viewerId),
        })
      },
    }),
  )

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
