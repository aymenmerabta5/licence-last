import "server-only"

import { and, desc, eq, gte } from "drizzle-orm"

import { db } from "@/server/db"
import { studentOfferReadinessSnapshot } from "@/server/db/schema/matching"

import { getSkillGapRoadmap } from "./skill-gap"

export interface ReadinessPoint {
  id: string
  readyPercent: number
  missingSkillsCount: number
  capturedAt: Date
  source: string
}

export async function listReadinessHistory(
  studentUserId: string,
  offerId: string,
  limit = 20,
) {
  const rows = await db
    .select({
      id: studentOfferReadinessSnapshot.id,
      readyPercent: studentOfferReadinessSnapshot.readyPercent,
      missingSkillsCount: studentOfferReadinessSnapshot.missingSkillsCount,
      capturedAt: studentOfferReadinessSnapshot.capturedAt,
      source: studentOfferReadinessSnapshot.source,
    })
    .from(studentOfferReadinessSnapshot)
    .where(
      and(
        eq(studentOfferReadinessSnapshot.studentUserId, studentUserId),
        eq(studentOfferReadinessSnapshot.offerId, offerId),
      ),
    )
    .orderBy(desc(studentOfferReadinessSnapshot.capturedAt))
    .limit(limit)

  return rows
}

export async function captureReadinessSnapshot(
  studentUserId: string,
  offerId: string,
  source: string,
  meta?: Record<string, unknown>,
) {
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [todaySnapshot] = await db
    .select({ id: studentOfferReadinessSnapshot.id })
    .from(studentOfferReadinessSnapshot)
    .where(
      and(
        eq(studentOfferReadinessSnapshot.studentUserId, studentUserId),
        eq(studentOfferReadinessSnapshot.offerId, offerId),
        gte(studentOfferReadinessSnapshot.capturedAt, startOfDay),
      ),
    )
    .limit(1)

  if (todaySnapshot) {
    return { snapshotId: todaySnapshot.id, skipped: true as const }
  }

  const roadmap = await getSkillGapRoadmap(studentUserId, offerId)
  const snapshotId = crypto.randomUUID()

  await db.insert(studentOfferReadinessSnapshot).values({
    id: snapshotId,
    studentUserId,
    offerId,
    readyPercent: roadmap.readyPercent,
    missingSkillsCount: roadmap.missingSkills.length,
    source,
    meta: meta ?? {},
  })

  return { snapshotId, skipped: false as const }
}
