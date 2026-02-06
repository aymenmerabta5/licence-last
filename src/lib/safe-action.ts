import { createSafeActionClient } from "next-safe-action"
import { z } from "zod"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

/**
 * Base action client — shared config for all action types.
 *
 * - `defineMetadataSchema`: every action must declare an `actionName` for
 *   logging / tracing.
 * - `handleServerError`: logs the real error server-side; returns a generic
 *   message to the client so internal details are never leaked.
 */
const actionClient = createSafeActionClient({
  defineMetadataSchema: () => z.object({ actionName: z.string() }),
  handleServerError: (e) => {
    console.error("Action error:", e.message)
    return "Something went wrong. Please try again."
  },
})

/**
 * Public action client — no authentication required.
 *
 * Use for mutations that don't need a session (contact forms, public
 * submissions, etc.).
 */
export const publicAction = actionClient

/**
 * Authenticated action client — requires a valid session.
 *
 * Reads the session from request cookies via Better Auth's server API.
 * If no session exists the middleware throws, which `next-safe-action`
 * catches and returns as a `serverError` to the client.
 *
 * On success, `{ session, user }` are injected into `ctx` so the action
 * handler can use them without additional lookups.
 */
export const authAction = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("Unauthorized")
  }

  return next({ ctx: { session: session.session, user: session.user } })
})
