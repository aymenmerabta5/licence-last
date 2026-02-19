import "server-only"

import { and, desc, eq, type SQL } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/companies/trust-actions")

import { application } from "@/server/db/schema/applications"
import { companyMember } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { placement } from "@/server/db/schema/placements"
import { companyQualityFeedback, companyReport } from "@/server/db/schema/trust"

async function hasRelationshipWithCompany(
  userId: string,
  companyId: string,
): Promise<boolean> {
  const [asApplicant] = await db
    .select({ id: application.id })
    .from(application)
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .where(
      and(
        eq(application.studentUserId, userId),
        eq(internshipOffer.companyId, companyId),
      ),
    )
    .limit(1)

  if (asApplicant) return true

  const [asPlacement] = await db
    .select({ id: placement.id })
    .from(placement)
    .innerJoin(application, eq(placement.applicationId, application.id))
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .where(
      and(
        eq(application.studentUserId, userId),
        eq(internshipOffer.companyId, companyId),
      ),
    )
    .limit(1)

  if (asPlacement) return true

  const [asCompanyMember] = await db
    .select({ companyId: companyMember.companyId })
    .from(companyMember)
    .where(
      and(
        eq(companyMember.userId, userId),
        eq(companyMember.companyId, companyId),
      ),
    )
    .limit(1)

  return !!asCompanyMember
}

export async function submitCompanyQualityFeedback(input: {
  studentUserId: string
  placementId: string
  rating: number
  wouldRecommend: boolean
  comment?: string
}) {
  const [placementRow] = await db
    .select({
      placementId: placement.id,
      applicationId: placement.applicationId,
      studentUserId: application.studentUserId,
      applicationStatus: application.status,
      companyId: internshipOffer.companyId,
    })
    .from(placement)
    .innerJoin(application, eq(placement.applicationId, application.id))
    .innerJoin(internshipOffer, eq(application.offerId, internshipOffer.id))
    .where(eq(placement.id, input.placementId))
    .limit(1)

  if (!placementRow) {
    throw new Error("Placement not found")
  }

  if (placementRow.studentUserId !== input.studentUserId) {
    throw new Error("You can only submit feedback for your own placement")
  }

  if (placementRow.applicationStatus !== "admin_validated") {
    throw new Error("Feedback can only be submitted for validated placements")
  }

  log.info(
    { studentUserId: input.studentUserId, placementId: input.placementId },
    "Submitting quality feedback",
  )

  const nextFeedbackId = crypto.randomUUID()
  const [feedback] = await db
    .insert(companyQualityFeedback)
    .values({
      id: nextFeedbackId,
      placementId: placementRow.placementId,
      companyId: placementRow.companyId,
      studentUserId: input.studentUserId,
      rating: Math.max(1, Math.min(5, Math.round(input.rating))),
      wouldRecommend: input.wouldRecommend,
      comment: input.comment?.trim() ? input.comment.trim() : null,
    })
    .onConflictDoUpdate({
      target: companyQualityFeedback.placementId,
      set: {
        rating: Math.max(1, Math.min(5, Math.round(input.rating))),
        wouldRecommend: input.wouldRecommend,
        comment: input.comment?.trim() ? input.comment.trim() : null,
      },
    })
    .returning({ id: companyQualityFeedback.id })

  log.info(
    {
      feedbackId: feedback?.id ?? nextFeedbackId,
      companyId: placementRow.companyId,
      event: "feedback_submitted",
    },
    "Quality feedback submitted",
  )
  return {
    feedbackId: feedback?.id ?? nextFeedbackId,
    companyId: placementRow.companyId,
  }
}

export async function submitCompanyReport(input: {
  reporterUserId: string
  companyId: string
  category: string
  severity: "low" | "medium" | "high" | "critical"
  description: string
}) {
  const hasRelationship = await hasRelationshipWithCompany(
    input.reporterUserId,
    input.companyId,
  )

  if (!hasRelationship) {
    throw new Error(
      "You can only report companies you have applied to, worked with, or are a member of",
    )
  }

  log.info(
    {
      reporterUserId: input.reporterUserId,
      companyId: input.companyId,
      severity: input.severity,
    },
    "Submitting company report",
  )

  const reportId = crypto.randomUUID()
  await db.insert(companyReport).values({
    id: reportId,
    companyId: input.companyId,
    reporterUserId: input.reporterUserId,
    category: input.category,
    severity: input.severity,
    description: input.description,
  })

  log.info({ reportId, event: "report_submitted" }, "Company report submitted")
  return { reportId }
}

export async function resolveCompanyReport(input: {
  reportId: string
  adminUserId: string
  status: "resolved" | "dismissed"
  resolutionNote?: string
}) {
  const [existing] = await db
    .select({ id: companyReport.id, status: companyReport.status })
    .from(companyReport)
    .where(eq(companyReport.id, input.reportId))
    .limit(1)

  if (!existing) {
    throw new Error("Report not found")
  }

  if (existing.status === "resolved" || existing.status === "dismissed") {
    throw new Error("Report is already closed")
  }

  log.info(
    {
      reportId: input.reportId,
      adminUserId: input.adminUserId,
      newStatus: input.status,
    },
    "Resolving company report",
  )

  await db
    .update(companyReport)
    .set({
      status: input.status,
      resolvedAt: new Date(),
      resolvedByUserId: input.adminUserId,
      resolutionNote: input.resolutionNote?.trim()
        ? input.resolutionNote.trim()
        : null,
    })
    .where(eq(companyReport.id, input.reportId))

  log.info(
    { reportId: input.reportId, event: "report_resolved" },
    "Company report resolved",
  )
  return { reportId: input.reportId, status: input.status }
}

export async function listCompanyReports(input?: {
  companyId?: string
  status?: "open" | "reviewing" | "resolved" | "dismissed"
  limit?: number
}) {
  const limit = input?.limit ?? 50
  const conditions: SQL[] = []
  if (input?.companyId)
    conditions.push(eq(companyReport.companyId, input.companyId))
  if (input?.status) conditions.push(eq(companyReport.status, input.status))

  const baseQuery = db
    .select({
      id: companyReport.id,
      companyId: companyReport.companyId,
      reporterUserId: companyReport.reporterUserId,
      category: companyReport.category,
      severity: companyReport.severity,
      description: companyReport.description,
      status: companyReport.status,
      resolutionNote: companyReport.resolutionNote,
      resolvedAt: companyReport.resolvedAt,
      resolvedByUserId: companyReport.resolvedByUserId,
      createdAt: companyReport.createdAt,
    })
    .from(companyReport)
    .orderBy(desc(companyReport.createdAt))
    .limit(limit)

  const rows =
    conditions.length > 0
      ? await baseQuery.where(and(...conditions))
      : await baseQuery

  return rows
}
