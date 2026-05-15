import "server-only"

import { randomUUID } from "node:crypto"
import { sql } from "drizzle-orm"
import { db } from "@/server/db"
import { skillTag } from "@/server/db/schema/skills"
import { ServiceError } from "@/server/services/errors"

const SIMILARITY_THRESHOLD = 0.6

export async function createSkill(
  input: { name: string; categoryId: number; force?: boolean },
  userId: string,
  _createdByRole: string,
) {
  const { name, categoryId, force } = input

  const trimmed = name.trim()
  if (trimmed.length < 1) {
    throw new ServiceError("SKILL_NAME_REQUIRED", "Skill name is required")
  }
  if (trimmed.length > 100) {
    throw new ServiceError(
      "SKILL_NAME_TOO_LONG",
      "Skill name must be at most 100 characters",
    )
  }

  // Check exact match (case-insensitive)
  const exact = await db
    .select()
    .from(skillTag)
    .where(sql`LOWER(${skillTag.name}) = LOWER(${trimmed})`)
    .limit(1)

  if (exact.length > 0) {
    return { status: "exists" as const, skill: exact[0] }
  }

  // Fuzzy similarity search using pg_trgm
  const similar = await db
    .select()
    .from(skillTag)
    .where(
      sql`similarity(${skillTag.name}, ${trimmed}) > ${SIMILARITY_THRESHOLD}`,
    )
    .limit(5)

  if (similar.length > 0 && !force) {
    return { status: "similar_exists" as const, similar }
  }

  // Generate slug
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  // Create the skill
  const [skill] = await db
    .insert(skillTag)
    .values({
      id: randomUUID(),
      name: trimmed,
      slug: slug || "skill",
      categoryId,
      createdBy: userId,
    })
    .returning()

  return { status: "created" as const, skill }
}
