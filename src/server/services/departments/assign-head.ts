import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"
import { user } from "@/server/db/schema/auth"

const log = createModuleLogger("services/departments/assign-head")

/**
 * Assign a user as dept_head for a department.
 * Sets user.role = "dept_head", user.departmentId, and user.universityId.
 */
export async function assignDepartmentHead(
  departmentId: string,
  userId: string,
) {
  // Verify department exists and get its universityId
  const [dept] = await db
    .select({
      id: department.id,
      universityId: department.universityId,
      name: department.name,
    })
    .from(department)
    .where(eq(department.id, departmentId))
    .limit(1)

  if (!dept) {
    throw new Error("Department not found")
  }

  // Verify user exists
  const [targetUser] = await db
    .select({ id: user.id, role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!targetUser) {
    throw new Error("User not found")
  }

  log.info(
    { departmentId, userId, universityId: dept.universityId },
    "Assigning department head",
  )

  await db
    .update(user)
    .set({
      role: "dept_head",
      departmentId,
      universityId: dept.universityId,
    })
    .where(eq(user.id, userId))

  log.info(
    { departmentId, userId, event: "dept_head_assigned" },
    "Department head assigned",
  )
  return { success: true, departmentId, userId }
}
