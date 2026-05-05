import "server-only"

import { getEffectiveDepartmentSkillIds } from "./get-effective-skills"

export async function getDepartmentSkillIds(
  departmentId: string,
): Promise<string[]> {
  return getEffectiveDepartmentSkillIds(departmentId)
}
