import "server-only"

import { and, count, desc, eq, isNull, lt, or } from "drizzle-orm"

import { db } from "@/server/db"
import { notification } from "@/server/db/schema/notifications"

export interface NotificationItem {
  id: string
  type: string
  payload: Record<string, unknown>
  readAt: Date | null
  createdAt: Date
}

export interface ListNotificationsInput {
  cursor?: { createdAt: string; id: string }
  limit?: number
}

export interface ListNotificationsResult {
  notifications: NotificationItem[]
  unreadCount: number
  nextCursor: { createdAt: string; id: string } | undefined
  hasMore: boolean
}

export async function listNotifications(
  userId: string,
  input: ListNotificationsInput = {},
): Promise<ListNotificationsResult> {
  const { cursor, limit = 12 } = input

  const conditions = [eq(notification.userId, userId)]
  if (cursor) {
    const cursorDate = new Date(cursor.createdAt)
    conditions.push(
      or(
        lt(notification.createdAt, cursorDate),
        and(
          eq(notification.createdAt, cursorDate),
          lt(notification.id, cursor.id),
        ),
      )!,
    )
  }

  const rows = await db
    .select({
      id: notification.id,
      type: notification.type,
      payload: notification.payload,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    })
    .from(notification)
    .where(and(...conditions))
    .orderBy(desc(notification.createdAt), desc(notification.id))
    .limit(limit + 1)

  const hasMore = rows.length > limit
  const notifications = (hasMore ? rows.slice(0, limit) : rows).map((r) => ({
    id: r.id,
    type: r.type,
    payload: (r.payload ?? {}) as Record<string, unknown>,
    readAt: r.readAt,
    createdAt: r.createdAt,
  }))

  const last = notifications[notifications.length - 1]
  const nextCursor =
    hasMore && last
      ? { createdAt: last.createdAt.toISOString(), id: last.id }
      : undefined

  const [unread] = await db
    .select({ value: count() })
    .from(notification)
    .where(and(eq(notification.userId, userId), isNull(notification.readAt)))

  return {
    notifications,
    unreadCount: unread?.value ?? 0,
    nextCursor,
    hasMore,
  }
}
