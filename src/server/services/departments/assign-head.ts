import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/departments/assign-head")

const ROLE_BLOCKLIST = new Set(["company_admin", "super_admin"])

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
    throw new ServiceError("DEPARTMENT_NOT_FOUND", "Department not found")
  }

  // Verify user exists
  const [targetUser] = await db
    .select({ id: user.id, role: user.role, universityId: user.universityId })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!targetUser) {
    throw new ServiceError("USER_NOT_FOUND", "User not found")
  }

  if (ROLE_BLOCKLIST.has(targetUser.role)) {
    throw new ServiceError(
      "USER_INELIGIBLE_FOR_DEPARTMENT_HEAD",
      "User role cannot be assigned as department head",
    )
  }

  if (
    targetUser.universityId &&
    targetUser.universityId !== dept.universityId
  ) {
    throw new ServiceError(
      "USER_INELIGIBLE_FOR_DEPARTMENT_HEAD",
      "User belongs to a different university",
    )
  }

  log.info(
    { departmentId, userId, universityId: dept.universityId },
    "Assigning department head",
  )

  await db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({
        role: "dept_head",
        departmentId,
        universityId: dept.universityId,
      })
      .where(eq(user.id, userId))
  })

  log.info(
    { departmentId, userId, event: "dept_head_assigned" },
    "Department head assigned",
  )
  return { success: true, departmentId, userId }
}
