import "server-only"

import { eq, sql } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { department, departmentSkill } from "@/server/db/schema/departments"

export async function listDepartments(universityId: string) {
  const departmentIdRef = sql.raw('"department"."id"')

  return db
    .select({
      id: department.id,
      name: department.name,
      headUserId: sql<string | null>`(
        select ${user.id}
        from ${user}
        where ${user.departmentId} = ${departmentIdRef}
          and ${user.role} = 'dept_head'
        order by ${user.createdAt} desc
        limit 1
      )`.as("head_user_id"),
      headUserName: sql<string | null>`(
        select ${user.name}
        from ${user}
        where ${user.departmentId} = ${departmentIdRef}
          and ${user.role} = 'dept_head'
        order by ${user.createdAt} desc
        limit 1
      )`.as("head_user_name"),
      headUserEmail: sql<string | null>`(
        select ${user.email}
        from ${user}
        where ${user.departmentId} = ${departmentIdRef}
          and ${user.role} = 'dept_head'
        order by ${user.createdAt} desc
        limit 1
      )`.as("head_user_email"),
      createdAt: department.createdAt,
      skillCount: sql<number>`(
        select count(*)::int from ${departmentSkill}
        where ${departmentSkill.departmentId} = ${departmentIdRef}
      )`.as("skill_count"),
    })
    .from(department)
    .where(eq(department.universityId, universityId))
    .orderBy(department.name)
}
