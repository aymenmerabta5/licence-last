import "server-only"

import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { skillTag } from "@/server/db/schema/skills"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/skills/create")

function generateSlug(name: string): string {
  // Lowercase, replace spaces/special chars with hyphens, remove trailing hyphens
  let slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  if (slug.length === 0) {
    slug = "skill"
  }

  return slug
}

/**
 * Create a new global skill tag.
 * Auto-generates a unique slug from the name.
 * Returns the existing skill if the exact name already exists (case-insensitive).
 */
export async function createSkill(
  name: string,
  category?: string | null,
) {
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

  // Check if exact name already exists (case-insensitive)
  const [existing] = await db
    .select({ id: skillTag.id, name: skillTag.name, slug: skillTag.slug })
    .from(skillTag)
    .where(eq(skillTag.name, trimmed))
    .limit(1)

  if (existing) {
    return { ...existing, created: false as const }
  }

  let slug = generateSlug(trimmed)

  // Ensure slug uniqueness by appending a short suffix if needed
  let attempt = 0
  const maxAttempts = 10
  while (attempt < maxAttempts) {
    const [slugCollision] = await db
      .select({ id: skillTag.id })
      .from(skillTag)
      .where(eq(skillTag.slug, slug))
      .limit(1)

    if (!slugCollision) break

    slug = `${generateSlug(trimmed)}-${randomUUID().slice(0, 6)}`
    attempt++
  }

  const [inserted] = await db
    .insert(skillTag)
    .values({
      id: randomUUID(),
      name: trimmed,
      slug,
      category: category?.trim() || null,
    })
    .returning({ id: skillTag.id, name: skillTag.name, slug: skillTag.slug })

  log.info({ skillId: inserted.id, name: trimmed, slug }, "Skill tag created")

  return { ...inserted, category: category?.trim() || null, created: true as const }
}
