import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { studentSkill } from "@/server/db/schema/students"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"
import { validateSkillTagIds } from "@/server/services/skills/validate"

const log = createModuleLogger("services/students/upsert-skills")

export async function upsertStudentSkills(
  skillTagIds: string[],
  userId: string,
) {
  log.info({ userId, skillCount: skillTagIds.length }, "Upserting student skills")

  if (skillTagIds.length < 1) {
    throw new ServiceError("SKILL_MIN_REQUIRED", "At least one skill is required")
  }

  if (skillTagIds.length > 10) {
    throw new ServiceError(
      "SKILL_LIMIT_EXCEEDED",
      "A maximum of 10 skills is allowed",
    )
  }

  await validateSkillTagIds(skillTagIds)

  await db.transaction(async (tx) => {
    await tx.delete(studentSkill).where(eq(studentSkill.userId, userId))

    await tx.insert(studentSkill).values(
      skillTagIds.map((skillTagId) => ({
        userId,
        skillTagId,
      })),
    )
  })

  log.info({ userId, event: "student_skills_upserted" }, "Student skills updated")
  return { userId }
}
