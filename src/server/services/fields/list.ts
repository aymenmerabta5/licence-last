"use cache"

import "server-only"

import { asc, sql } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { CACHE_PROFILES, CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { field, fieldSkill } from "@/server/db/schema/fields"

export interface ListFieldsInput {
  limit?: number
  offset?: number
}

export interface ListFieldsResult {
  fields: {
    id: string
    name: string
    slug: string
    description: string | null
    skillCount: number
  }[]
  hasMore: boolean
}

export async function listFields(
  input?: ListFieldsInput,
): Promise<ListFieldsResult> {
  CACHE_PROFILES.REFERENCE()
  cacheTag(CACHE_TAGS.FIELDS)

  const limit = Math.min(input?.limit ?? 100, 500)
  const offset = input?.offset ?? 0

  const rows = await db
    .select({
      id: field.id,
      name: field.name,
      slug: field.slug,
      description: field.description,
      skillCount: sql<number>`(
        select count(*)::int from ${fieldSkill}
        where "field_skill"."field_id" = "field"."id"
      )`.as("skill_count"),
    })
    .from(field)
    .orderBy(asc(field.name))
    .limit(limit + 1)
    .offset(offset)

  return {
    fields: rows.slice(0, limit),
    hasMore: rows.length > limit,
  }
}
