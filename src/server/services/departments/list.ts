import "server-only"

import { eq, sql } from "drizzle-orm"

import { db } from "@/server/db"
import { department, departmentSkill } from "@/server/db/schema/departments"

export async function listDepartments(universityId: string) {
  return db
    .select({
      id: department.id,
      name: department.name,
      headName: department.headName,
      createdAt: department.createdAt,
      skillCount: sql<number>`(
        select count(*)::int from ${departmentSkill}
        where ${departmentSkill.departmentId} = ${department.id}
      )`.as("skill_count"),
    })
    .from(department)
    .where(eq(department.universityId, universityId))
    .orderBy(department.name)
}
