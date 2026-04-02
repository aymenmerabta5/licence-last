import "server-only"

import { and, eq, ne } from "drizzle-orm"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
import { universityMember } from "@/server/db/schema/university-memberships"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/departments/assign-head")

const ROLE_BLOCKLIST = new Set(["company_admin", "super_admin"])
const ELIGIBLE_ROLES = new Set(["university_admin"])

/**
 * Assign a user as department head for a department.
 * Uses a membership row for permissions while keeping the auth role on university_admin.
 */
export async function assignDepartmentHead(
  departmentId: string,
  userId: string,
) {
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

  if (!ELIGIBLE_ROLES.has(targetUser.role)) {
    throw new ServiceError(
      "USER_INELIGIBLE_FOR_DEPARTMENT_HEAD",
      "Existing account role cannot be reassigned as department head; create or use a dedicated department head account",
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
      .update(universityMember)
      .set({
        departmentId: null,
      })
      .where(
        and(
          eq(universityMember.role, "department_head"),
          eq(universityMember.departmentId, departmentId),
          ne(universityMember.userId, userId),
        ),
      )

    await tx
      .update(user)
      .set({
        role: "university_admin",
        departmentId: null,
        universityId: dept.universityId,
      })
      .where(eq(user.id, userId))

    await tx
      .insert(universityMember)
      .values({
        universityId: dept.universityId,
        userId,
        role: "department_head",
        departmentId,
      })
      .onConflictDoUpdate({
        target: universityMember.userId,
        set: {
          universityId: dept.universityId,
          role: "department_head",
          departmentId,
          updatedAt: new Date(),
        },
      })
  })

  log.info(
    { departmentId, userId, event: "dept_head_assigned" },
    "Department head assigned",
  )
  return { success: true, departmentId, userId }
}
