"use client"

import { CheckCheck } from "lucide-react"

import { Link } from "@/i18n/routing"
import { formatNotification, getNotificationDestination } from "@/lib/notifications"
import { Button } from "@/components/ui/button"
import {
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

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

interface Notification {
  id: string
  type: string
  payload: Record<string, unknown>
  createdAt: Date
  readAt: Date | null
}

interface NotificationDropdownContentProps {
  t: NotificationTranslationFn
  notifications: Notification[]
  unreadCount: number
  onMarkRead: (notificationId: string) => void
  onMarkAllRead: () => void
  isMarkAllReadPending: boolean
}

export function NotificationDropdownContent({
  t,
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  isMarkAllReadPending,
}: NotificationDropdownContentProps) {
  return (
    <DropdownMenuContent align="end" className="w-80">
      <DropdownMenuGroup>
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {t("title")}
          </DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0 || isMarkAllReadPending}
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
            const destination = getNotificationDestination({
              type: n.type,
              payload: n.payload,
            })
            const isUnread = n.readAt === null

            return (
              <DropdownMenuItem
                key={n.id}
                className="focus:bg-primary/5 focus:text-primary transition-colors items-start gap-2 p-0"
              >
                <Link
                  href={destination.href as "/dashboard"}
                  className="flex w-full items-start gap-2 px-1.5 py-1 text-inherit no-underline"
                  onClick={() => {
                    if (isUnread) {
                      onMarkRead(n.id)
                    }
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
                  {isUnread && (
                    <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </Link>
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
  )
}
