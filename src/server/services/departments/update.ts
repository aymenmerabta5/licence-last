import "server-only"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"

const log = createModuleLogger("services/departments/update")

export async function updateDepartment(
  departmentId: string,
  data: { name?: string; headName?: string | null },
) {
  const updates: Record<string, unknown> = {}
  if (data.name !== undefined) updates.name = data.name.trim()
  if (data.headName !== undefined) updates.headName = data.headName?.trim() || null

  if (Object.keys(updates).length === 0) {
    return { success: true }
  }

  log.info({ departmentId, updates }, "Updating department")

  await db
    .update(department)
    .set(updates)
    .where(eq(department.id, departmentId))

  return { success: true }
}
