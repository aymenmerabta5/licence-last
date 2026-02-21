import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/departments/update")

export async function updateDepartment(
  departmentId: string,
  data: { name?: string },
) {
  const updates: Record<string, unknown> = {}
  if (data.name !== undefined) updates.name = data.name.trim()

  if (Object.keys(updates).length === 0) {
    return { success: true }
  }

  log.info({ departmentId, updates }, "Updating department")

  const [updatedDepartment] = await db
    .update(department)
    .set(updates)
    .where(eq(department.id, departmentId))
    .returning({ id: department.id })

  if (!updatedDepartment) {
    throw new ServiceError("DEPARTMENT_NOT_FOUND", "Department not found")
  }

  return { success: true }
}
