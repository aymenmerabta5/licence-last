import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/users/update-me")
import { user } from "@/server/db/schema/auth"

/**
 * Update the current user's own profile fields.
 * Pure business logic — caller must provide an authenticated user id.
 */
export async function updateMe(
  userId: string,
  data: { name?: string | null; image?: string | null },
) {
  log.info({ userId }, "Updating user profile")

  const setFields: Record<string, unknown> = {}
  if ("name" in data) setFields.name = data.name
  if ("image" in data) setFields.image = data.image

  const [updated] = await db
    .update(user)
    .set(setFields)
    .where(eq(user.id, userId))
    .returning({ id: user.id, name: user.name, email: user.email, image: user.image })

  if (!updated) {
    throw new ServiceError("USER_NOT_FOUND", "User not found")
  }

  log.info({ userId: updated.id, event: "user_updated" }, "User profile updated")
  return updated
}
