"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Bell, CheckCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { NAVBAR_ICON_CONTROL_CLASS } from "@/components/navbar-control-styles"
import { Button } from "@/components/ui/button"
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

type NotificationTranslationFn = (
  key: string,
  values?: Record<string, string | number>,
) => string

function formatRelative(date: Date, t: NotificationTranslationFn) {
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return t("relativeNow")
  if (diffMin < 60) return t("relativeMinutesShort", { count: diffMin })
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return t("relativeHoursShort", { count: diffH })
  const diffD = Math.floor(diffH / 24)
  return t("relativeDaysShort", { count: diffD })
}

interface NotificationBellProps {
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
            className={NAVBAR_ICON_CONTROL_CLASS}
          />
        }
      >
        <Bell className="h-5 w-5 text-current opacity-80 transition-[color,opacity] duration-300 group-hover:opacity-100" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold inline-flex items-center justify-center ring-2 ring-background">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-2 py-1">
            <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {t("title")}
            </DropdownMenuLabel>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate({})}
              disabled={unreadCount === 0 || markAllReadMutation.isPending}
              className="h-auto gap-1.5 px-1 py-1 text-[11px] text-muted-foreground hover:bg-transparent hover:text-primary"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {t("markAllRead")}
            </Button>
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 opacity-50" />

        {notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          <div className="max-h-96 overflow-auto">
            {notifications.map((n) => {
              const formatted = formatNotification(
                {
                  type: n.type,
                  payload: n.payload,
                },
                t,
              )

              return (
                <DropdownMenuItem
                  key={n.id}
                  className="cursor-pointer focus:bg-primary/5 focus:text-primary transition-colors items-start gap-2"
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
                        {formatRelative(new Date(n.createdAt), t)}
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
        <DropdownMenuItem className="cursor-pointer transition-colors">
          <Link
            href={"/dashboard/notifications" as "/dashboard"}
            className="w-full text-xs"
          >
            {t("viewAll")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
