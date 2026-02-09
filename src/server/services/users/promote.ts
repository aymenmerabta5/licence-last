import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"

type UserRole = "student" | "company_admin" | "admin" | "super_admin"

/**
 * Promote a user to a new role.
 * Pure business logic — caller must verify super_admin role.
 */
export async function promoteUser(userId: string, newRole: UserRole) {
  const [updated] = await db
    .update(user)
    .set({ role: newRole })
    .where(eq(user.id, userId))
    .returning({ id: user.id, email: user.email, role: user.role })

  if (!updated) {
    throw new Error("User not found")
  }

  return updated
}
