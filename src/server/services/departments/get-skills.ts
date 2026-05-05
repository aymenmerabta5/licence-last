import "server-only"

import { getEffectiveDepartmentSkillIds } from "@/server/services/departments/get-effective-skills"

export async function getDepartmentSkillIds(
  departmentId: string,
): Promise<string[]> {
  return getEffectiveDepartmentSkillIds(departmentId)
}
