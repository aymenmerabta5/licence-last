import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/users/update-me")
import { user } from "@/server/db/schema/auth"

/**
 * Update the current user's own profile fields.
 * Pure business logic — caller must provide an authenticated user id.
 */
export async function updateMe(userId: string, data: { name: string | null }) {
  log.info({ userId }, "Updating user profile")
  const [updated] = await db
    .update(user)
    .set({ name: data.name })
    .where(eq(user.id, userId))
    .returning({ id: user.id, name: user.name, email: user.email })

  if (!updated) {
    throw new Error("User not found")
  }

  log.info({ userId: updated.id, event: "user_updated" }, "User profile updated")
  return updated
}
