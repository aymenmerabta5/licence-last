import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { department, departmentSkill } from "@/server/db/schema/departments"
import { fieldSkill } from "@/server/db/schema/fields"

export async function getEffectiveDepartmentSkillIds(
  departmentId: string,
): Promise<string[]> {
  // 1. Get department's fieldId
  const [deptRow] = await db
    .select({ fieldId: department.fieldId })
    .from(department)
    .where(eq(department.id, departmentId))
    .limit(1)

  const fieldId = deptRow?.fieldId ?? null

  // 2. Legacy mode: no field assignment
  if (!fieldId) {
    const rows = await db
      .select({ skillTagId: departmentSkill.skillTagId })
      .from(departmentSkill)
      .where(eq(departmentSkill.departmentId, departmentId))

    return rows.map((r) => r.skillTagId).sort()
  }

  // 3. Template mode: compute effective skills
  const fieldSkillRows = await db
    .select({ skillTagId: fieldSkill.skillTagId })
    .from(fieldSkill)
    .where(eq(fieldSkill.fieldId, fieldId))

  const effectiveIds = new Set(fieldSkillRows.map((r) => r.skillTagId))

  const addRows = await db
    .select({ skillTagId: departmentSkill.skillTagId })
    .from(departmentSkill)
    .where(
      and(
        eq(departmentSkill.departmentId, departmentId),
        eq(departmentSkill.action, "add"),
      ),
    )

  for (const row of addRows) {
    effectiveIds.add(row.skillTagId)
  }

  const removeRows = await db
    .select({ skillTagId: departmentSkill.skillTagId })
    .from(departmentSkill)
    .where(
      and(
        eq(departmentSkill.departmentId, departmentId),
        eq(departmentSkill.action, "remove"),
      ),
    )

  for (const row of removeRows) {
    effectiveIds.delete(row.skillTagId)
  }

  return Array.from(effectiveIds).sort()
}
