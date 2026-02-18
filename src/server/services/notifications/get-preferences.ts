import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { notificationPreference } from "@/server/db/schema/notifications"

export interface NotificationPreferences {
  inAppEnabled: boolean
  emailEnabled: boolean
}

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  inAppEnabled: true,
  emailEnabled: true,
}

export async function getNotificationPreferences(
  userId: string,
): Promise<NotificationPreferences> {
  const [preferences] = await db
    .select({
      inAppEnabled: notificationPreference.inAppEnabled,
      emailEnabled: notificationPreference.emailEnabled,
    })
    .from(notificationPreference)
    .where(eq(notificationPreference.userId, userId))
    .limit(1)

  return preferences ?? { ...DEFAULT_NOTIFICATION_PREFERENCES }
}
