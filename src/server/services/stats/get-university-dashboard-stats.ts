import "server-only"

import { and, count, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"

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
      .from(user)
      .where(
        and(eq(user.role, "dept_head"), eq(user.universityId, universityId)),
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
