import "server-only"

import { z } from "zod"

import {
  authedProcedureGenerous,
  authedProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { listNotifications } from "@/server/services/notifications/list"
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/services/notifications/mark-read"

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
