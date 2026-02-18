"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

import { orpcClient } from "@/server/orpc/client"
import { useInfiniteScroll } from "@/hooks"

export function useNotifications() {
  const t = useTranslations("dashboard.notifications")
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["notifications", "list"],
    queryFn: async ({ pageParam }) =>
      orpcClient.notifications.list({
        cursor: pageParam as { createdAt: string; id: string } | undefined,
        limit: 20,
      }),
    initialPageParam: undefined as { createdAt: string; id: string } | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const notifications = useMemo(
    () => data?.pages.flatMap((p) => p.notifications) ?? [],
    [data],
  )
  const unreadCount = data?.pages[0]?.unreadCount ?? 0

  const markAllReadMutation = useMutation({
    mutationFn: async () => orpcClient.notifications.markAllRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
      toast.success(t("markAllReadSuccess"))
    },
    onError: () => {
      toast.error(t("markAllReadError"))
    },
  })

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) =>
      orpcClient.notifications.markRead({ notificationId }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
    },
  })

  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage)

  return {
    notifications,
    unreadCount,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
    isMarkingRead: markAllReadMutation.isPending,
  }
}
