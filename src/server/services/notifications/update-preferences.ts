import "server-only"

import { db } from "@/server/db"
import { notificationPreference } from "@/server/db/schema/notifications"
import { getNotificationPreferences } from "@/server/services/notifications/get-preferences"

export interface UpdateNotificationPreferencesInput {
  inAppEnabled?: boolean
  emailEnabled?: boolean
}

export async function updateNotificationPreferences(
  userId: string,
  input: UpdateNotificationPreferencesInput,
) {
  if (input.inAppEnabled === undefined && input.emailEnabled === undefined) {
    return getNotificationPreferences(userId)
  }

  const insertValues = {
    userId,
    ...(input.inAppEnabled !== undefined
      ? { inAppEnabled: input.inAppEnabled }
      : {}),
    ...(input.emailEnabled !== undefined
      ? { emailEnabled: input.emailEnabled }
      : {}),
  }
  const nextUpdate = {
    ...(input.inAppEnabled !== undefined
      ? { inAppEnabled: input.inAppEnabled }
      : {}),
    ...(input.emailEnabled !== undefined
      ? { emailEnabled: input.emailEnabled }
      : {}),
    updatedAt: new Date(),
  }

  const [preferences] = await db
    .insert(notificationPreference)
    .values(insertValues)
    .onConflictDoUpdate({
      target: notificationPreference.userId,
      set: nextUpdate,
    })
    .returning({
      inAppEnabled: notificationPreference.inAppEnabled,
      emailEnabled: notificationPreference.emailEnabled,
    })

  return {
    inAppEnabled: preferences.inAppEnabled,
    emailEnabled: preferences.emailEnabled,
  }
}
