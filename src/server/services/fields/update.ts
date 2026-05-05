import "server-only"

import { and, eq, ne } from "drizzle-orm"
import { db } from "@/server/db"
import { field } from "@/server/db/schema/fields"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/fields/update")

export async function updateField(
  fieldId: string,
  data: { name?: string; description?: string | null },
) {
  const updates: Record<string, unknown> = {}

  if (data.name !== undefined) {
    const trimmed = data.name.trim()
    if (trimmed.length < 1) {
      throw new ServiceError("FIELD_NAME_REQUIRED", "Field name is required")
    }
    if (trimmed.length > 100) {
      throw new ServiceError(
        "FIELD_NAME_TOO_LONG",
        "Field name must be at most 100 characters",
      )
    }

    const [existing] = await db
      .select({ id: field.id })
      .from(field)
      .where(and(eq(field.name, trimmed), ne(field.id, fieldId)))
      .limit(1)

    if (existing) {
      throw new ServiceError(
        "FIELD_NAME_EXISTS",
        "A field with this name already exists",
      )
    }

    updates.name = trimmed
  }

  if (data.description !== undefined) {
    updates.description = data.description?.trim() || null
  }

  if (Object.keys(updates).length === 0) {
    const [existing] = await db
      .select()
      .from(field)
      .where(eq(field.id, fieldId))
      .limit(1)

    if (!existing) {
      throw new ServiceError("FIELD_NOT_FOUND", "Field not found")
    }

    return existing
  }

  log.info({ fieldId, updates }, "Updating field")

  const [updated] = await db
    .update(field)
    .set(updates)
    .where(eq(field.id, fieldId))
    .returning()

  if (!updated) {
    throw new ServiceError("FIELD_NOT_FOUND", "Field not found")
  }

  return updated
}
