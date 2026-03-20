import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"
import { universityMember } from "@/server/db/schema/university-memberships"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/departments/delete")

export async function deleteDepartment(departmentId: string) {
  const [existingDepartment] = await db
    .select({ id: department.id })
    .from(department)
    .where(eq(department.id, departmentId))
    .limit(1)

  if (!existingDepartment) {
    throw new ServiceError("DEPARTMENT_NOT_FOUND", "Department not found")
  }

  log.info({ departmentId }, "Deleting department")

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
        ),
      )

    await tx.delete(department).where(eq(department.id, departmentId))
  })

  log.info({ departmentId, event: "department_deleted" }, "Department deleted")

  return { success: true, departmentId }
}
