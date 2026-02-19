import "server-only"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { notification } from "@/server/db/schema/notifications"
import {
  getNotificationPreferences,
  type NotificationPreferences,
} from "@/server/services/notifications/get-preferences"

const log = createModuleLogger("services/notifications/create")

export interface CreateNotificationInput {
  userId: string
  type: string
  // jsonb payload (keep broadly typed at the service boundary)
  payload?: Record<string, unknown>
  preferences?: NotificationPreferences
}

export async function createNotification(input: CreateNotificationInput) {
  const preferences =
    input.preferences ?? (await getNotificationPreferences(input.userId))

  if (!preferences.inAppEnabled) {
    log.info(
      {
        userId: input.userId,
        type: input.type,
        event: "notification_skipped_in_app_disabled",
      },
      "Skipping in-app notification because user disabled in-app notifications",
    )

    return { id: null, skipped: true }
  }

  const id = crypto.randomUUID()

  await db.insert(notification).values({
    id,
    userId: input.userId,
    type: input.type,
    payload: input.payload ?? {},
  })

  log.info({ notificationId: id, userId: input.userId, type: input.type, event: "notification_created" }, "Notification created")
  return { id, skipped: false }
}
