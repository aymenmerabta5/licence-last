"use cache"

import "server-only"

import { and, count, eq, sql } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"

import { CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { placement } from "@/server/db/schema/placements"
import { studentProfile } from "@/server/db/schema/students"

export interface DepartmentDashboardStats {
  totalStudents: number
  pendingValidations: number
  activeInternships: number
  studentsWithoutInternship: number
}

export async function getDepartmentDashboardStats(
  departmentId: string,
): Promise<DepartmentDashboardStats> {
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.DEPARTMENT_STATS(departmentId))

  const [totalStudentsRow, pendingRow, activeRow] = await Promise.all([
    db
      .select({ value: count() })
      .from(studentProfile)
      .where(eq(studentProfile.departmentId, departmentId)),

    db
      .select({
        value: count(sql`DISTINCT ${application.studentUserId}`),
      })
      .from(application)
      .innerJoin(
        studentProfile,
        eq(application.studentUserId, studentProfile.userId),
      )
      .where(
        and(
          eq(studentProfile.departmentId, departmentId),
          eq(application.status, "company_accepted"),
        ),
      ),

    db
      .select({
        value: count(sql`DISTINCT ${application.studentUserId}`),
      })
      .from(application)
      .innerJoin(
        studentProfile,
        eq(application.studentUserId, studentProfile.userId),
      )
      .innerJoin(placement, eq(placement.applicationId, application.id))
      .where(eq(studentProfile.departmentId, departmentId)),
  ])

  const totalStudents = totalStudentsRow[0]?.value ?? 0
  const pendingValidations = pendingRow[0]?.value ?? 0
  const activeInternships = activeRow[0]?.value ?? 0
  const studentsWithoutInternship = Math.max(
    0,
    totalStudents - pendingValidations - activeInternships,
  )

  return {
    totalStudents,
    pendingValidations,
    activeInternships,
    studentsWithoutInternship,
  }
}
