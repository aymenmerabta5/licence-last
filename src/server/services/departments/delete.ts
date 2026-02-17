import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
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
      .update(user)
      .set({
        role: "student",
        departmentId: null,
      })
      .where(
        and(
          eq(user.role, "dept_head"),
          eq(user.departmentId, departmentId),
        ),
      )

    await tx
      .delete(department)
      .where(eq(department.id, departmentId))
  })

  log.info({ departmentId, event: "department_deleted" }, "Department deleted")

  return { success: true, departmentId }
}
