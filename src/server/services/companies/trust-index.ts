import "server-only"

import { and, count, desc, eq, inArray } from "drizzle-orm"

import { db } from "@/server/db"
import { company } from "@/server/db/schema/companies"
import { internshipOffer } from "@/server/db/schema/internships"
import { application } from "@/server/db/schema/applications"
import { companyQualityFeedback, companyReport } from "@/server/db/schema/trust"

export interface CompanyTrustIndex {
  companyId: string
  trustScore: number
  tier: "low" | "watch" | "good" | "excellent"
  factors: {
    responseRate: number
    completionRate: number
    feedbackScore: number
    reportPenalty: number
  }
  alerts: string[]
}

const REPORT_SEVERITY_WEIGHT: Record<string, number> = {
  low: 4,
  medium: 8,
  high: 16,
  critical: 24,
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function toTier(score: number): CompanyTrustIndex["tier"] {
  if (score >= 80) return "excellent"
  if (score >= 65) return "good"
  if (score >= 45) return "watch"
  return "low"
}

export async function getCompanyTrustIndex(companyId: string): Promise<CompanyTrustIndex> {
  const [existingCompany] = await db
    .select({ id: company.id })
    .from(company)
    .where(eq(company.id, companyId))
    .limit(1)

  if (!existingCompany) {
    throw new Error("Company not found")
  }

  const offers = await db
    .select({ id: internshipOffer.id })
    .from(internshipOffer)
    .where(eq(internshipOffer.companyId, companyId))

  const offerIds = offers.map((offer) => offer.id)
  const alerts: string[] = []

  let responseRate = 100
  let completionRate = 100

  if (offerIds.length > 0) {
    const [totalApplications, respondedApplications, acceptedApplications, validatedApplications] =
      await Promise.all([
        db
          .select({ value: count() })
          .from(application)
          .where(inArray(application.offerId, offerIds))
          .then((rows) => rows[0]?.value ?? 0),
        db
          .select({ value: count() })
          .from(application)
          .where(
            and(
              inArray(application.offerId, offerIds),
              inArray(application.status, [
                "company_accepted",
                "company_refused",
                "admin_validated",
                "admin_rejected",
              ]),
            ),
          )
          .then((rows) => rows[0]?.value ?? 0),
        db
          .select({ value: count() })
          .from(application)
          .where(
            and(
              inArray(application.offerId, offerIds),
              inArray(application.status, ["company_accepted", "admin_validated"]),
            ),
          )
          .then((rows) => rows[0]?.value ?? 0),
        db
          .select({ value: count() })
          .from(application)
          .where(
            and(
              inArray(application.offerId, offerIds),
              eq(application.status, "admin_validated"),
            ),
          )
          .then((rows) => rows[0]?.value ?? 0),
      ])

    responseRate =
      totalApplications > 0
        ? clamp((respondedApplications / totalApplications) * 100)
        : 100
    completionRate =
      acceptedApplications > 0
        ? clamp((validatedApplications / acceptedApplications) * 100)
        : 100
  } else {
    alerts.push("No published pipeline data yet.")
  }

  const [feedbackRows, reports] = await Promise.all([
    db
      .select({
        rating: companyQualityFeedback.rating,
        wouldRecommend: companyQualityFeedback.wouldRecommend,
      })
      .from(companyQualityFeedback)
      .where(eq(companyQualityFeedback.companyId, companyId)),
    db
      .select({
        id: companyReport.id,
        severity: companyReport.severity,
        status: companyReport.status,
      })
      .from(companyReport)
      .where(eq(companyReport.companyId, companyId)),
  ])

  const avgRating =
    feedbackRows.length > 0
      ? feedbackRows.reduce((sum, row) => sum + row.rating, 0) / feedbackRows.length
      : 0
  const recommendRate =
    feedbackRows.length > 0
      ? feedbackRows.filter((row) => row.wouldRecommend).length / feedbackRows.length
      : 0
  const feedbackScore =
    feedbackRows.length > 0
      ? clamp((avgRating / 5) * 70 + recommendRate * 30)
      : 60

  const unresolvedReports = reports.filter(
    (report) => report.status === "open" || report.status === "reviewing",
  )
  const reportPenalty = unresolvedReports.reduce((sum, report) => {
    const weight = REPORT_SEVERITY_WEIGHT[report.severity] ?? 8
    return sum + weight
  }, 0)

  if (unresolvedReports.length >= 3) {
    alerts.push("Multiple unresolved reports are open.")
  }
  if (responseRate < 45) {
    alerts.push("Response rate is below platform expectations.")
  }

  const trustScore = clamp(
    responseRate * 0.3 +
      completionRate * 0.3 +
      feedbackScore * 0.3 -
      Math.min(40, reportPenalty) +
      10,
  )

  return {
    companyId,
    trustScore,
    tier: toTier(trustScore),
    factors: {
      responseRate,
      completionRate,
      feedbackScore,
      reportPenalty: Math.min(100, reportPenalty),
    },
    alerts,
  }
}

export async function listCompanyTrustIndices(limit = 50) {
  const companies = await db
    .select({ id: company.id, name: company.name, status: company.status })
    .from(company)
    .orderBy(desc(company.createdAt))
    .limit(limit)

  const rows = await Promise.all(
    companies.map(async (entry) => ({
      companyName: entry.name,
      companyStatus: entry.status,
      ...(await getCompanyTrustIndex(entry.id)),
    })),
  )

  return rows.sort((a, b) => b.trustScore - a.trustScore)
}
