import "server-only"

import { eq, sql } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { department, departmentSkill } from "@/server/db/schema/departments"
import { universityMember } from "@/server/db/schema/university-memberships"

export async function listDepartments(universityId: string) {
  return db
    .select({
      id: department.id,
      name: department.name,
      headUserId: sql<string | null>`(
        select ${user.id}
        from ${universityMember}
        inner join ${user}
          on ${user.id} = ${universityMember.userId}
        where ${universityMember.departmentId} = ${department.id}
          and ${universityMember.role} = 'department_head'
        order by ${universityMember.updatedAt} desc
        limit 1
      )`.as("head_user_id"),
      headUserName: sql<string | null>`(
        select ${user.name}
        from ${universityMember}
        inner join ${user}
          on ${user.id} = ${universityMember.userId}
        where ${universityMember.departmentId} = ${department.id}
          and ${universityMember.role} = 'department_head'
        order by ${universityMember.updatedAt} desc
        limit 1
      )`.as("head_user_name"),
      headUserEmail: sql<string | null>`(
        select ${user.email}
        from ${universityMember}
        inner join ${user}
          on ${user.id} = ${universityMember.userId}
        where ${universityMember.departmentId} = ${department.id}
          and ${universityMember.role} = 'department_head'
        order by ${universityMember.updatedAt} desc
        limit 1
      )`.as("head_user_email"),
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
