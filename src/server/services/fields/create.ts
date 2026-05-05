import "server-only"

import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { field } from "@/server/db/schema/fields"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/fields/create")

function generateSlug(name: string): string {
  let slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (slug.length === 0) {
    slug = "field"
  }

  return slug
}

export async function createField(name: string, description?: string | null) {
  const trimmed = name.trim()
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
    .where(eq(field.name, trimmed))
    .limit(1)

  if (existing) {
    throw new ServiceError(
      "FIELD_NAME_EXISTS",
      "A field with this name already exists",
    )
  }

  let slug = generateSlug(trimmed)

  let attempt = 0
  const maxAttempts = 10
  while (attempt < maxAttempts) {
    const [slugCollision] = await db
      .select({ id: field.id })
      .from(field)
      .where(eq(field.slug, slug))
      .limit(1)

    if (!slugCollision) break

    slug = `${generateSlug(trimmed)}-${randomUUID().slice(0, 6)}`
    attempt++
  }

  const [inserted] = await db
    .insert(field)
    .values({
      id: randomUUID(),
      name: trimmed,
      slug,
      description: description?.trim() || null,
    })
    .returning({ id: field.id })

  log.info({ fieldId: inserted.id, name: trimmed, slug }, "Field created")

  return { fieldId: inserted.id }
}
