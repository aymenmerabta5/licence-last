"use client"

import { useCallback, useEffect, useRef } from "react"
import * as motion from "motion/react-client"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCheck, Loader2 } from "lucide-react"

import { orpcClient } from "@/server/orpc/client"
import { Button } from "@/components/ui/button"

const reveal = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const ease = [0.4, 0, 0.2, 1] as const

export function NotificationsClient() {
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

  const notifications = data?.pages.flatMap((p) => p.notifications) ?? []
  const unreadCount = data?.pages[0]?.unreadCount ?? 0

  const markAllReadMutation = useMutation({
    mutationFn: async () => orpcClient.notifications.markAllRead(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications", "list"] })
    },
  })

  const sentinelRef = useRef<HTMLDivElement>(null)
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "200px",
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleIntersection])

  return (
    <div className="space-y-6">
      <motion.div {...reveal} transition={{ duration: 0.6, ease }} className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-3xl text-heading tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground font-light">
            {unreadCount} unread
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
          onClick={() => markAllReadMutation.mutate()}
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </motion.div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No notifications yet.
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
    </div>
  )
}
