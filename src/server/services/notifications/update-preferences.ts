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
  const current = await getNotificationPreferences(userId)
  const next = {
    inAppEnabled: input.inAppEnabled ?? current.inAppEnabled,
    emailEnabled: input.emailEnabled ?? current.emailEnabled,
  }

  const [preferences] = await db
    .insert(notificationPreference)
    .values({
      userId,
      inAppEnabled: next.inAppEnabled,
      emailEnabled: next.emailEnabled,
    })
    .onConflictDoUpdate({
      target: notificationPreference.userId,
      set: {
        inAppEnabled: next.inAppEnabled,
        emailEnabled: next.emailEnabled,
        updatedAt: new Date(),
      },
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
