import "server-only"

import { and, eq } from "drizzle-orm"
import { normalizeLanguageEntries } from "@/lib/constants/languages"
import type { ProficiencyLevel } from "@/lib/schemas/enums"
import { db } from "@/server/db"
import {
  internshipOffer,
  internshipOfferSkill,
} from "@/server/db/schema/internships"
import { internshipOfferLanguageRequirement } from "@/server/db/schema/languages"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"
import { validateSkillTagIds } from "@/server/services/skills/validate"

const log = createModuleLogger("services/offers/update")

interface OfferLanguageRequirementInput {
  languageCode: string
  minimumProficiency: ProficiencyLevel
  isRequired?: boolean
  weight?: number
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
    .select({
      id: internshipOffer.id,
      companyId: internshipOffer.companyId,
      status: internshipOffer.status,
    })
    .from(internshipOffer)
    .where(
      and(
        eq(internshipOffer.id, offerId),
        eq(internshipOffer.companyId, companyId),
      ),
    )
    .limit(1)

  if (!existing) {
    throw new ServiceError(
      "OFFER_NOT_FOUND",
      "Offer not found or access denied",
    )
  }

  log.info({ offerId, companyId }, "Updating offer")

  if (existing.status === "closed") {
    throw new ServiceError("OFFER_CLOSED", "Cannot update a closed offer")
  }

  const normalizedLanguageRequirements =
    data.languageRequirements === undefined
      ? undefined
      : normalizeLanguageEntries(data.languageRequirements)

  const offerChanges = {
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
    updatedAt: new Date(),
  }

  await db.transaction(async (tx) => {
    const [updatedOffer] = await tx
      .update(internshipOffer)
      .set(offerChanges)
      .where(
        and(
          eq(internshipOffer.id, offerId),
          eq(internshipOffer.companyId, companyId),
          eq(internshipOffer.status, existing.status),
        ),
      )
      .returning({ id: internshipOffer.id })

    if (!updatedOffer) {
      throw new ServiceError(
        "OFFER_STATE_CONFLICT",
        "Offer status changed while it was being updated",
      )
    }

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
            isRequired: entry.isRequired ?? true,
            weight: entry.weight ?? 1,
          })),
        )
      }
    }
  })

  log.info({ offerId, event: "offer_updated" }, "Offer updated successfully")
  return { offerId }
}
