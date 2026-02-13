import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/users/promote")
import { user } from "@/server/db/schema/auth"

type UserRole = "student" | "company_admin" | "university_admin" | "super_admin"

/**
 * Promote a user to a new role.
 * Pure business logic — caller must verify super_admin role.
 */
export async function promoteUser(userId: string, newRole: UserRole) {
  log.info({ userId, newRole }, "Promoting user")
  const [updated] = await db
    .update(user)
    .set({ role: newRole })
    .where(eq(user.id, userId))
    .returning({ id: user.id, email: user.email, role: user.role })

  if (!updated) {
    throw new Error("User not found")
  }

  log.info({ userId: updated.id, role: updated.role, event: "user_promoted" }, "User promoted")
  return updated
}
