import "server-only"

import { eq, and } from "drizzle-orm"

import { db } from "@/server/db"
import { application } from "@/server/db/schema/applications"

/**
 * Withdraw an application.
 * Only allowed if status is "applied" (before company/admin action).
 */
export async function withdrawApplication(
  applicationId: string,
  studentUserId: string,
) {
  const [app] = await db
    .select()
    .from(application)
    .where(
      and(
        eq(application.id, applicationId),
        eq(application.studentUserId, studentUserId),
      ),
    )
    .limit(1)

  if (!app) {
    throw new Error("Application not found")
  }

  if (app.status !== "applied") {
    throw new Error("Only pending applications can be withdrawn")
  }

  await db
    .update(application)
    .set({ status: "withdrawn" })
    .where(eq(application.id, applicationId))

  return { applicationId, newStatus: "withdrawn" as const }
}
