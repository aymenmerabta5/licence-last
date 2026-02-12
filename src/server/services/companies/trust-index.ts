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

  if (companies.length === 0) {
    return []
  }

  const companyIds = companies.map((c) => c.id)

  const [offers, feedbackRows, reports] = await Promise.all([
    db
      .select({
        companyId: internshipOffer.companyId,
        offerId: internshipOffer.id,
      })
      .from(internshipOffer)
      .where(inArray(internshipOffer.companyId, companyIds)),
    db
      .select({
        companyId: companyQualityFeedback.companyId,
        rating: companyQualityFeedback.rating,
        wouldRecommend: companyQualityFeedback.wouldRecommend,
      })
      .from(companyQualityFeedback)
      .where(inArray(companyQualityFeedback.companyId, companyIds)),
    db
      .select({
        companyId: companyReport.companyId,
        severity: companyReport.severity,
        status: companyReport.status,
      })
      .from(companyReport)
      .where(inArray(companyReport.companyId, companyIds)),
  ])

  const offersByCompany = new Map<string, string[]>()
  for (const offer of offers) {
    const existing = offersByCompany.get(offer.companyId) ?? []
    existing.push(offer.offerId)
    offersByCompany.set(offer.companyId, existing)
  }

  const feedbackByCompany = new Map<
    string,
    { rating: number; wouldRecommend: boolean }[]
  >()
  for (const fb of feedbackRows) {
    const existing = feedbackByCompany.get(fb.companyId) ?? []
    existing.push({ rating: fb.rating, wouldRecommend: fb.wouldRecommend })
    feedbackByCompany.set(fb.companyId, existing)
  }

  const reportsByCompany = new Map<
    string,
    { severity: string; status: string }[]
  >()
  for (const report of reports) {
    const existing = reportsByCompany.get(report.companyId) ?? []
    existing.push({ severity: report.severity, status: report.status })
    reportsByCompany.set(report.companyId, existing)
  }

  const allOfferIds = offers.map((o) => o.offerId)

  const applicationCounts = await db
    .select({
      offerId: application.offerId,
      status: application.status,
      count: count(),
    })
    .from(application)
    .where(inArray(application.offerId, allOfferIds))
    .groupBy(application.offerId, application.status)

  const appCountsByOffer = new Map<string, Map<string, number>>()
  for (const row of applicationCounts) {
    const existing = appCountsByOffer.get(row.offerId) ?? new Map()
    existing.set(row.status, row.count)
    appCountsByOffer.set(row.offerId, existing)
  }

  function computeTrustIndex(companyId: string): CompanyTrustIndex {
    const alerts: string[] = []
    let responseRate = 100
    let completionRate = 100

    const companyOffers = offersByCompany.get(companyId) ?? []

    if (companyOffers.length > 0) {
      let totalApplications = 0
      let respondedApplications = 0
      let acceptedApplications = 0
      let validatedApplications = 0

      for (const offerId of companyOffers) {
        const counts = appCountsByOffer.get(offerId)
        if (!counts) continue

        for (const [status, cnt] of counts) {
          totalApplications += cnt
          if (
            ["company_accepted", "company_refused", "admin_validated", "admin_rejected"].includes(
              status,
            )
          ) {
            respondedApplications += cnt
          }
          if (["company_accepted", "admin_validated"].includes(status)) {
            acceptedApplications += cnt
          }
          if (status === "admin_validated") {
            validatedApplications += cnt
          }
        }
      }

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

    const companyFeedback = feedbackByCompany.get(companyId) ?? []
    const avgRating =
      companyFeedback.length > 0
        ? companyFeedback.reduce((sum, fb) => sum + fb.rating, 0) / companyFeedback.length
        : 0
    const recommendRate =
      companyFeedback.length > 0
        ? companyFeedback.filter((fb) => fb.wouldRecommend).length / companyFeedback.length
        : 0
    const feedbackScore =
      companyFeedback.length > 0
        ? clamp((avgRating / 5) * 70 + recommendRate * 30)
        : 60

    const companyReports = reportsByCompany.get(companyId) ?? []
    const unresolvedReports = companyReports.filter(
      (r) => r.status === "open" || r.status === "reviewing",
    )
    const reportPenalty = unresolvedReports.reduce((sum, r) => {
      const weight = REPORT_SEVERITY_WEIGHT[r.severity] ?? 8
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

  const rows = companies.map((entry) => ({
    companyName: entry.name,
    companyStatus: entry.status,
    ...computeTrustIndex(entry.id),
  }))

  return rows.sort((a, b) => b.trustScore - a.trustScore)
}
