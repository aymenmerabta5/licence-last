import "server-only"

import { and, eq, isNull } from "drizzle-orm"

import { db } from "@/server/db"
import { notification } from "@/server/db/schema/notifications"

export async function markNotificationRead(
  userId: string,
  notificationId: string,
) {
  const now = new Date()

  const updated = await db
    .update(notification)
    .set({ readAt: now })
    .where(
      and(
        eq(notification.userId, userId),
        eq(notification.id, notificationId),
        isNull(notification.readAt),
      ),
    )
    .returning({ id: notification.id })

  return { success: true, updated: updated.length }
}

export async function markAllNotificationsRead(userId: string) {
  const now = new Date()

  const updated = await db
    .update(notification)
    .set({ readAt: now })
    .where(and(eq(notification.userId, userId), isNull(notification.readAt)))
    .returning({ id: notification.id })

  return { success: true, updated: updated.length }
}
