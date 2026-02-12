import "server-only"

import { z } from "zod"

import { authedProcedure } from "../middleware"
import { listNotifications } from "@/server/services/notifications/list"
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/services/notifications/mark-read"

export const listNotificationsProcedure = authedProcedure
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

export const markNotificationReadProcedure = authedProcedure
  .input(z.object({ notificationId: z.string().min(1) }))
  .handler(async ({ input, context }) =>
    markNotificationRead(context.user.id, input.notificationId),
  )

export const markAllNotificationsReadProcedure = authedProcedure.handler(
  async ({ context }) => markAllNotificationsRead(context.user.id),
)
