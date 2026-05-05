"use cache"

import "server-only"

import { eq, or } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { CACHE_PROFILES, CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { field } from "@/server/db/schema/fields"
import { ServiceError } from "@/server/services/errors"

export async function getField(idOrSlug: string) {
  CACHE_PROFILES.REFERENCE()
  cacheTag(CACHE_TAGS.FIELDS)
  cacheTag(`${CACHE_TAGS.FIELDS}-${idOrSlug}`)

  const [row] = await db
    .select({
      id: field.id,
      name: field.name,
      slug: field.slug,
      description: field.description,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt,
    })
    .from(field)
    .where(or(eq(field.id, idOrSlug), eq(field.slug, idOrSlug)))
    .limit(1)

  if (!row) {
    throw new ServiceError("FIELD_NOT_FOUND", "Field not found")
  }

  return row
}
