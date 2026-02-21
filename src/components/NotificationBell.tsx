"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCheck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "@/i18n/routing"
import { formatNotification } from "@/lib/notifications"
import { notificationsQueryKeys } from "@/lib/notifications-query"
import { orpc, orpcClient } from "@/server/orpc/client"

function formatRelative(date: Date) {
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d`
}

interface NotificationBellProps {
  viewerId: string
}

export function NotificationBell({ viewerId }: NotificationBellProps) {
  const queryClient = useQueryClient()

  const { data } = useQuery(
    {
      queryKey: notificationsQueryKeys.list(viewerId, 6),
      queryFn: () => orpcClient.notifications.list({ limit: 6 }),
    },
  )

  const unreadCount = data?.unreadCount ?? 0
  const notifications = data?.notifications ?? []

  const markReadMutation = useMutation(
    orpc.notifications.markRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.root(viewerId),
        })
      },
    }),
  )

  const markAllReadMutation = useMutation(
    orpc.notifications.markAllRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: notificationsQueryKeys.root(viewerId),
        })
      },
    }),
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative p-2.5 rounded-full hover:bg-secondary/80 transition-all group outline-none">
        <Bell className="h-5 w-5 text-foreground/60 group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold inline-flex items-center justify-center ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 mt-2 p-1.5 rounded-xl border-border/40 shadow-xl backdrop-blur-xl bg-background/95"
      >
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-2 py-1">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Notifications
            </DropdownMenuLabel>
            <button
              type="button"
              onClick={() => markAllReadMutation.mutate({})}
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-primary disabled:opacity-50 disabled:hover:text-muted-foreground transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 opacity-50" />

        {notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          <div className="max-h-96 overflow-auto">
            {notifications.map((n) => {
              const formatted = formatNotification({
                type: n.type,
                payload: n.payload,
              })

              return (
                <DropdownMenuItem
                  key={n.id}
                  className="rounded-lg cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors items-start gap-2"
                  onSelect={(e) => {
                    e.preventDefault()
                    markReadMutation.mutate({ notificationId: n.id })
                  }}
                >
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium truncate">
                        {formatted.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatRelative(new Date(n.createdAt))}
                      </span>
                    </div>
                    {formatted.message && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {formatted.message}
                      </p>
                    )}
                  </div>
                  {n.readAt === null && (
                    <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </div>
        )}

        <DropdownMenuSeparator className="my-1 opacity-50" />
        <DropdownMenuItem className="rounded-lg cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors">
          <Link
            href={"/dashboard/notifications" as "/dashboard"}
            className="w-full text-xs"
          >
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
