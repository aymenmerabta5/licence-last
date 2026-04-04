import "server-only"

import { inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { skillTag } from "@/server/db/schema/skills"
import { ServiceError } from "@/server/services/errors"

export async function validateSkillTagIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return

  const existing = await db
    .select({ id: skillTag.id })
    .from(skillTag)
    .where(inArray(skillTag.id, ids))

  const existingIds = new Set(existing.map((s) => s.id))
  const missingIds = ids.filter((id) => !existingIds.has(id))

  if (missingIds.length > 0) {
    throw new ServiceError(
      "INVALID_SKILL_TAG_IDS",
      `Invalid skill tag IDs: ${missingIds.join(", ")}`,
    )
  }
}
