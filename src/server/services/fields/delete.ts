import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"
import { field } from "@/server/db/schema/fields"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/fields/delete")

export async function deleteField(fieldId: string) {
  const [existing] = await db
    .select({ id: field.id })
    .from(field)
    .where(eq(field.id, fieldId))
    .limit(1)

  if (!existing) {
    throw new ServiceError("FIELD_NOT_FOUND", "Field not found")
  }

  const [deptRef] = await db
    .select({ id: department.id })
    .from(department)
    .where(eq(department.fieldId, fieldId))
    .limit(1)

  if (deptRef) {
    throw new ServiceError(
      "FIELD_IN_USE",
      "Cannot delete field that is assigned to departments",
    )
  }

  log.info({ fieldId }, "Deleting field")

  await db.delete(field).where(eq(field.id, fieldId))

  log.info({ fieldId, event: "field_deleted" }, "Field deleted")

  return { success: true, fieldId }
}
