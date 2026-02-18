import "server-only"

import { z } from "zod"
import { ORPCError } from "@orpc/server"

import {
  authedProcedureGenerous,
  authedProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { listNotifications } from "@/server/services/notifications/list"
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/services/notifications/mark-read"
import { getNotificationPreferences } from "@/server/services/notifications/get-preferences"
import { updateNotificationPreferences } from "@/server/services/notifications/update-preferences"

function assertNotificationPreferencesEnabled() {
  if (!isFeatureEnabled("NOTIF_PREFERENCES")) {
    throw new ORPCError("FORBIDDEN", {
      message: "Notification preferences feature is disabled",
    })
  }
}

export const listNotificationsProcedure = authedProcedureGenerous
  .input(
    z
      .object({
        cursor: z.object({ createdAt: z.string(), id: z.string() }).optional(),
        limit: z.coerce.number().int().min(1).max(50).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) =>
    listNotifications(context.user.id, input),
  )

export const markNotificationReadProcedure = authedProcedureStandard
  .input(z.object({ notificationId: z.string().min(1) }))
  .handler(async ({ input, context }) =>
    markNotificationRead(context.user.id, input.notificationId),
  )

export const markAllNotificationsReadProcedure = authedProcedureStandard.handler(
  async ({ context }) => markAllNotificationsRead(context.user.id),
)

export const getNotificationPreferencesProcedure = authedProcedureGenerous.handler(
  async ({ context }) => {
    assertNotificationPreferencesEnabled()
    return getNotificationPreferences(context.user.id)
  },
)

export const updateNotificationPreferencesProcedure = authedProcedureStandard
  .input(
    z.object({
      inAppEnabled: z.boolean().optional(),
      emailEnabled: z.boolean().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    assertNotificationPreferencesEnabled()
    return updateNotificationPreferences(context.user.id, input)
  })
