import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { departmentSkill } from "@/server/db/schema/departments"
import { createModuleLogger } from "@/server/logging"
import { validateSkillTagIds } from "@/server/services/skills/validate"

const log = createModuleLogger("services/departments/sync-skills")

export async function syncDepartmentSkills(
  departmentId: string,
  skillTagIds: string[],
) {
  if (skillTagIds.length > 200) {
    throw new Error("A maximum of 200 skills per department is allowed")
  }

  if (skillTagIds.length > 0) {
    await validateSkillTagIds(skillTagIds)
  }

  await db.transaction(async (tx) => {
    await tx
      .delete(departmentSkill)
      .where(eq(departmentSkill.departmentId, departmentId))

    if (skillTagIds.length > 0) {
      await tx.insert(departmentSkill).values(
        skillTagIds.map((skillTagId) => ({
          departmentId,
          skillTagId,
        })),
      )
    }
  })

  log.info(
    { departmentId, skillCount: skillTagIds.length },
    "Department skills synced",
  )

  return { departmentId, skillCount: skillTagIds.length }
}
