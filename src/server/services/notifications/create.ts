import "server-only"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/notifications/create")
import { notification } from "@/server/db/schema/notifications"

export interface CreateNotificationInput {
  userId: string
  type: string
  // jsonb payload (keep broadly typed at the service boundary)
  payload?: Record<string, unknown>
}

export async function createNotification(input: CreateNotificationInput) {
  const id = crypto.randomUUID()

  await db.insert(notification).values({
    id,
    userId: input.userId,
    type: input.type,
    payload: input.payload ?? {},
  })

  log.info({ notificationId: id, userId: input.userId, type: input.type, event: "notification_created" }, "Notification created")
  return { id }
}
