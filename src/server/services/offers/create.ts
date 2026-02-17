import "server-only"

import { randomUUID } from "node:crypto"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"

const log = createModuleLogger("services/offers/create")
import { internshipOffer, internshipOfferSkill } from "@/server/db/schema/internships"
import { validateSkillTagIds } from "@/server/services/skills/validate"

export async function createOffer(data: {
  companyId: string
  title: string
  description: string
  internshipType: "pfe" | "immersion" | "summer" | "practical"
  workMode?: "on_site" | "hybrid" | "remote"
  wilayaCode?: number
  durationWeeks?: number
  maxPositions?: number
  applicationDeadlineAt?: Date | null
  expectedStartDate?: Date | null
  expectedEndDate?: Date | null
  skillTagIds?: string[]
}) {
  const offerId = randomUUID()
  log.info({ companyId: data.companyId, offerId, title: data.title }, "Creating offer")

  await db.transaction(async (tx) => {
    await tx.insert(internshipOffer).values({
      id: offerId,
      companyId: data.companyId,
      title: data.title,
      description: data.description,
      internshipType: data.internshipType,
      workMode: data.workMode || null,
      wilayaCode: data.wilayaCode || null,
      durationWeeks: data.durationWeeks || null,
      maxPositions: data.maxPositions || 1,
      applicationDeadlineAt: data.applicationDeadlineAt ?? null,
      expectedStartDate: data.expectedStartDate ?? null,
      expectedEndDate: data.expectedEndDate ?? null,
      status: "draft",
    })

    if (data.skillTagIds && data.skillTagIds.length > 0) {
      await validateSkillTagIds(data.skillTagIds)
      await tx.insert(internshipOfferSkill).values(
        data.skillTagIds.map((skillTagId) => ({
          offerId,
          skillTagId,
        })),
      )
    }
  })

  log.info({ offerId, event: "offer_created" }, "Offer created successfully")
  return { offerId }
}
