import "server-only"

import { eq, asc } from "drizzle-orm"

import { db } from "@/server/db"
import { skillTag } from "@/server/db/schema/skills"

/** List all skill tags, optionally filtered by category. */
export async function listSkillTags(category?: string) {
  const query = db
    .select({
      id: skillTag.id,
      name: skillTag.name,
      slug: skillTag.slug,
      category: skillTag.category,
    })
    .from(skillTag)
    .orderBy(asc(skillTag.name))

  if (category) {
    return query.where(eq(skillTag.category, category))
  }

  return query
}
