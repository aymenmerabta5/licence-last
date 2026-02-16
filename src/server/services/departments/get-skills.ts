import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { departmentSkill } from "@/server/db/schema/departments"

export async function getDepartmentSkillIds(
  departmentId: string,
): Promise<string[]> {
  const rows = await db
    .select({ skillTagId: departmentSkill.skillTagId })
    .from(departmentSkill)
    .where(eq(departmentSkill.departmentId, departmentId))

  return rows.map((r) => r.skillTagId)
}
