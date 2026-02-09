import "server-only"

import { eq, and, count, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"
import { studentSkill } from "@/server/db/schema/students"

export async function getStudentDashboardStats(userId: string) {
  const [totalResult, pendingResult, acceptedResult, skillsResult] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(application)
        .where(eq(application.studentUserId, userId)),

      db
        .select({ count: count() })
        .from(application)
        .where(
          and(
            eq(application.studentUserId, userId),
            eq(application.status, "applied"),
          ),
        ),

      db
        .select({ count: count() })
        .from(application)
        .where(
          and(
            eq(application.studentUserId, userId),
            inArray(application.status, [
              "company_accepted",
              "admin_validated",
            ]),
          ),
        ),

      db
        .select({ count: count() })
        .from(studentSkill)
        .where(eq(studentSkill.userId, userId)),
    ])

  return {
    totalApplications: totalResult[0]?.count ?? 0,
    pendingApplications: pendingResult[0]?.count ?? 0,
    acceptedApplications: acceptedResult[0]?.count ?? 0,
    skillsCount: skillsResult[0]?.count ?? 0,
  }
}
