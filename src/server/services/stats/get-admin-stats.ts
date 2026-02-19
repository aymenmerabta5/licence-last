import "server-only"

import { count, eq, sql } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { user } from "@/server/db/schema/auth"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement } from "@/server/db/schema/placements"

export interface AdminStats {
  totalStudents: number
  placedStudents: number
  unplacedStudents: number
  placementRate: number
  totalCompaniesApproved: number
  totalOffersPublished: number
  totalApplications: number
  applicationsByStatus: Record<string, number>
}

export async function getAdminStats(): Promise<AdminStats> {
  const [studentsRow] = await db
    .select({ value: count() })
    .from(user)
    .where(eq(user.role, "student"))

  const [placedRow] = await db
    .select({
      value: sql<number>`count(distinct ${application.studentUserId})`,
    })
    .from(placement)
    .innerJoin(application, eq(placement.applicationId, application.id))

  const [companiesRow] = await db
    .select({ value: count() })
    .from(company)
    .where(eq(company.status, "approved"))

  const [offersRow] = await db
    .select({ value: count() })
    .from(internshipOffer)
    .where(eq(internshipOffer.status, "published"))

  const statusRows = await db
    .select({ status: application.status, value: count() })
    .from(application)
    .groupBy(application.status)

  const applicationsByStatus: Record<string, number> = {}
  let totalApplications = 0
  for (const row of statusRows) {
    const key = String(row.status)
    const value = row.value ?? 0
    applicationsByStatus[key] = value
    totalApplications += value
  }

  const totalStudents = studentsRow?.value ?? 0
  const placedStudents = placedRow?.value ?? 0
  const unplacedStudents = Math.max(0, totalStudents - placedStudents)
  const placementRate =
    totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0

  return {
    totalStudents,
    placedStudents,
    unplacedStudents,
    placementRate,
    totalCompaniesApproved: companiesRow?.value ?? 0,
    totalOffersPublished: offersRow?.value ?? 0,
    totalApplications,
    applicationsByStatus,
  }
}
