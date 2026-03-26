import "server-only"

import { eq, sql } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { department, departmentSkill } from "@/server/db/schema/departments"
import { universityMember } from "@/server/db/schema/university-memberships"

export async function listDepartments(universityId: string) {
  const departmentIdRef = sql.raw('"department"."id"')
  const departmentSkillDepartmentIdRef = sql.raw('"department_skill"."department_id"')
  const universityMemberDepartmentIdRef = sql.raw('"university_member"."department_id"')
  const universityMemberRoleRef = sql.raw('"university_member"."role"')
  const universityMemberUpdatedAtRef = sql.raw('"university_member"."updated_at"')
  const universityMemberUserIdRef = sql.raw('"university_member"."user_id"')
  const userEmailRef = sql.raw('"user"."email"')
  const userIdRef = sql.raw('"user"."id"')
  const userNameRef = sql.raw('"user"."name"')

  return db
    .select({
      id: department.id,
      name: department.name,
      headUserId: sql<string | null>`(
        select ${userIdRef}
        from ${universityMember}
        inner join ${user}
          on ${userIdRef} = ${universityMemberUserIdRef}
        where ${universityMemberDepartmentIdRef} = ${departmentIdRef}
          and ${universityMemberRoleRef} = 'department_head'
        order by ${universityMemberUpdatedAtRef} desc
        limit 1
      )`.as("head_user_id"),
      headUserName: sql<string | null>`(
        select ${userNameRef}
        from ${universityMember}
        inner join ${user}
          on ${userIdRef} = ${universityMemberUserIdRef}
        where ${universityMemberDepartmentIdRef} = ${departmentIdRef}
          and ${universityMemberRoleRef} = 'department_head'
        order by ${universityMemberUpdatedAtRef} desc
        limit 1
      )`.as("head_user_name"),
      headUserEmail: sql<string | null>`(
        select ${userEmailRef}
        from ${universityMember}
        inner join ${user}
          on ${userIdRef} = ${universityMemberUserIdRef}
        where ${universityMemberDepartmentIdRef} = ${departmentIdRef}
          and ${universityMemberRoleRef} = 'department_head'
        order by ${universityMemberUpdatedAtRef} desc
        limit 1
      )`.as("head_user_email"),
      createdAt: department.createdAt,
      skillCount: sql<number>`(
        select count(*)::int from ${departmentSkill}
        where ${departmentSkillDepartmentIdRef} = ${departmentIdRef}
      )`.as("skill_count"),
    })
    .from(department)
    .where(eq(department.universityId, universityId))
    .orderBy(department.name)
}
