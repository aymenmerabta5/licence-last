"use cache"

import "server-only"

import { and, count, eq } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"
import { CACHE_TAGS } from "@/lib/cache"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
import { universityMember } from "@/server/db/schema/university-memberships"

export interface UniversityDashboardStats {
  totalStudents: number
  totalDepartments: number
  totalDeptHeads: number
  totalApplications: number
  pendingValidations: number
  validatedPlacements: number
  placementRate: number
}

export async function getUniversityDashboardStats(
  universityId: string,
): Promise<UniversityDashboardStats> {
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.UNIVERSITY_STATS(universityId))

  const [
    studentsRow,
    departmentsRow,
    deptHeadsRow,
    applicationsRow,
    pendingRow,
    validatedRow,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(user)
      .where(
        and(eq(user.role, "student"), eq(user.universityId, universityId)),
      ),
    db
      .select({ value: count() })
      .from(department)
      .where(eq(department.universityId, universityId)),
    db
      .select({ value: count() })
      .from(universityMember)
      .where(
        and(
          eq(universityMember.role, "department_head"),
          eq(universityMember.universityId, universityId),
        ),
      ),
    db
      .select({ value: count() })
      .from(application)
      .innerJoin(user, eq(application.studentUserId, user.id))
      .where(eq(user.universityId, universityId)),
    db
      .select({ value: count() })
      .from(application)
      .innerJoin(user, eq(application.studentUserId, user.id))
      .where(
        and(
          eq(user.universityId, universityId),
          eq(application.status, "company_accepted"),
        ),
      ),
    db
      .select({ value: count() })
      .from(application)
      .innerJoin(user, eq(application.studentUserId, user.id))
      .where(
        and(
          eq(user.universityId, universityId),
          eq(application.status, "admin_validated"),
        ),
      ),
  ])

  const totalStudents = studentsRow[0]?.value ?? 0
  const validatedPlacements = validatedRow[0]?.value ?? 0
  const placementRate =
    totalStudents > 0
      ? Math.round((validatedPlacements / totalStudents) * 100)
      : 0

  return {
    totalStudents,
    totalDepartments: departmentsRow[0]?.value ?? 0,
    totalDeptHeads: deptHeadsRow[0]?.value ?? 0,
    totalApplications: applicationsRow[0]?.value ?? 0,
    pendingValidations: pendingRow[0]?.value ?? 0,
    validatedPlacements,
    placementRate,
  }
}
