"use cache"

import "server-only"

import { and, desc, eq, gt, isNull, or } from "drizzle-orm"
import { cacheLife, cacheTag } from "next/cache"

import { CACHE_TAGS } from "@/lib/cache"
import { db } from "@/server/db"
import { internshipOffer } from "@/server/db/schema/internships"

export async function listPublicOffersByCompany(
  companyId: string,
  limit = 6,
) {
  cacheLife({ expire: 60 })
  cacheTag(CACHE_TAGS.COMPANY_OFFERS(companyId))
  cacheTag(CACHE_TAGS.OFFERS_PUBLIC)

  const safeLimit = Math.max(1, Math.min(limit, 24))

  return db
    .select({
      id: internshipOffer.id,
      title: internshipOffer.title,
      internshipType: internshipOffer.internshipType,
      workMode: internshipOffer.workMode,
      wilayaCode: internshipOffer.wilayaCode,
      maxPositions: internshipOffer.maxPositions,
      createdAt: internshipOffer.createdAt,
      applicationDeadlineAt: internshipOffer.applicationDeadlineAt,
    })
    .from(internshipOffer)
    .where(
      and(
        eq(internshipOffer.companyId, companyId),
        eq(internshipOffer.status, "published"),
        or(
          isNull(internshipOffer.applicationDeadlineAt),
          gt(internshipOffer.applicationDeadlineAt, new Date()),
        ),
      ),
    )
    .orderBy(desc(internshipOffer.createdAt), desc(internshipOffer.id))
    .limit(safeLimit)
}
