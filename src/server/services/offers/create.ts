import "server-only"

import { randomUUID } from "node:crypto"

import { db } from "@/server/db"
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
  skillTagIds?: string[]
}) {
  const offerId = randomUUID()

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

  return { offerId }
}
