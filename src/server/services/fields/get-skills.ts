"use cache"

import "server-only"

import { asc, eq } from "drizzle-orm"
import { cacheTag } from "next/cache"
import { CACHE_PROFILES, CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { fieldSkill } from "@/server/db/schema/fields"

export async function getFieldSkillIds(fieldId: string): Promise<string[]> {
  CACHE_PROFILES.REFERENCE()
  cacheTag(CACHE_TAGS.FIELDS)
  cacheTag(`${CACHE_TAGS.FIELDS}-${fieldId}`)

  const rows = await db
    .select({ skillTagId: fieldSkill.skillTagId })
    .from(fieldSkill)
    .where(eq(fieldSkill.fieldId, fieldId))
    .orderBy(asc(fieldSkill.skillTagId))

  return rows.map((r) => r.skillTagId)
}
