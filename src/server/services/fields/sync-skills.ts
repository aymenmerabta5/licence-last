import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { fieldSkill } from "@/server/db/schema/fields"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"
import { validateSkillTagIds } from "@/server/services/skills/validate"

const log = createModuleLogger("services/fields/sync-skills")

export async function syncFieldSkills(
  fieldId: string,
  skills: { skillTagId: string; isCore?: boolean }[],
) {
  if (skills.length > 200) {
    throw new ServiceError(
      "SKILL_LIMIT_EXCEEDED",
      "A maximum of 200 skills per field is allowed",
    )
  }

  const skillTagIds = skills.map((s) => s.skillTagId)

  if (skillTagIds.length > 0) {
    await validateSkillTagIds(skillTagIds)
  }

  await db.transaction(async (tx) => {
    await tx.delete(fieldSkill).where(eq(fieldSkill.fieldId, fieldId))

    if (skills.length > 0) {
      await tx.insert(fieldSkill).values(
        skills.map((skill) => ({
          fieldId,
          skillTagId: skill.skillTagId,
          isCore: skill.isCore ?? false,
        })),
      )
    }
  })

  log.info({ fieldId, skillCount: skills.length }, "Field skills synced")

  return { fieldId, skillCount: skills.length }
}
