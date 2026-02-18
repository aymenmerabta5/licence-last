import "server-only"

import { and, eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { internshipOffer, internshipOfferSkill } from "@/server/db/schema/internships"
import { internshipOfferLanguageRequirement } from "@/server/db/schema/languages"
import { ServiceError } from "@/server/services/errors"
import { validateSkillTagIds } from "@/server/services/skills/validate"
import type { ProficiencyLevel } from "@/lib/schemas/enums"
import { normalizeLanguageEntries } from "@/lib/constants/languages"

const log = createModuleLogger("services/offers/update")

interface OfferLanguageRequirementInput {
  languageCode: string
  minimumProficiency: ProficiencyLevel
}

export async function updateOffer(
  offerId: string,
  companyId: string,
  data: {
    title?: string
    description?: string
    internshipType?: "pfe" | "immersion" | "summer" | "practical"
    workMode?: "on_site" | "hybrid" | "remote" | null
    wilayaCode?: number | null
    durationWeeks?: number | null
    maxPositions?: number
    applicationDeadlineAt?: Date | null
    expectedStartDate?: Date | null
    expectedEndDate?: Date | null
    skillTagIds?: string[]
    languageRequirements?: OfferLanguageRequirementInput[]
  },
) {
  const [existing] = await db
    .select({ id: internshipOffer.id, companyId: internshipOffer.companyId, status: internshipOffer.status })
    .from(internshipOffer)
    .where(and(eq(internshipOffer.id, offerId), eq(internshipOffer.companyId, companyId)))
    .limit(1)

  if (!existing) {
    throw new ServiceError("OFFER_NOT_FOUND", "Offer not found or access denied")
  }

  log.info({ offerId, companyId }, "Updating offer")

  if (existing.status === "closed") {
    throw new ServiceError("OFFER_CLOSED", "Cannot update a closed offer")
  }

  const normalizedLanguageRequirements =
    data.languageRequirements === undefined
      ? undefined
      : normalizeLanguageEntries(data.languageRequirements)

  await db.transaction(async (tx) => {
    await tx
      .update(internshipOffer)
      .set({
        title: data.title,
        description: data.description,
        internshipType: data.internshipType,
        workMode: data.workMode,
        wilayaCode: data.wilayaCode,
        durationWeeks: data.durationWeeks,
        maxPositions: data.maxPositions,
        applicationDeadlineAt: data.applicationDeadlineAt,
        expectedStartDate: data.expectedStartDate,
        expectedEndDate: data.expectedEndDate,
      })
      .where(eq(internshipOffer.id, offerId))

    if (data.skillTagIds !== undefined) {
      await tx
        .delete(internshipOfferSkill)
        .where(eq(internshipOfferSkill.offerId, offerId))

      if (data.skillTagIds.length > 0) {
        await validateSkillTagIds(data.skillTagIds)
        await tx.insert(internshipOfferSkill).values(
          data.skillTagIds.map((skillTagId) => ({
            offerId,
            skillTagId,
          })),
        )
      }
    }

    if (normalizedLanguageRequirements !== undefined) {
      await tx
        .delete(internshipOfferLanguageRequirement)
        .where(eq(internshipOfferLanguageRequirement.offerId, offerId))

      if (normalizedLanguageRequirements.length > 0) {
        await tx.insert(internshipOfferLanguageRequirement).values(
          normalizedLanguageRequirements.map((entry) => ({
            offerId,
            languageCode: entry.languageCode,
            minimumProficiency: entry.minimumProficiency,
            isRequired: true,
            weight: 1,
          })),
        )
      }
    }
  })

  log.info({ offerId, event: "offer_updated" }, "Offer updated successfully")
  return { offerId }
}
