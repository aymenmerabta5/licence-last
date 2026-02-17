import "server-only"

import { z } from "zod"
import { ORPCError } from "@orpc/server"
import { revalidateTag } from "next/cache"

import { isAdminRole } from "../middleware"
import {
  authedProcedureGenerous,
  companyAdminProcedureAssistant,
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { internshipTypeSchema, workModeSchema } from "@/lib/schemas/enums"
import { authedProcedureStrict } from "@/server/orpc/rate-limited-procedures"
import { getOfferById } from "@/server/services/offers/get"
import { listOffersByCompany } from "@/server/services/offers/list-by-company"
import { createOffer } from "@/server/services/offers/create"
import { updateOffer } from "@/server/services/offers/update"
import { deleteOffer } from "@/server/services/offers/delete"
import { updateOfferStatus } from "@/server/services/offers/update-status"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { eq } from "drizzle-orm"
import { CACHE_TAGS } from "@/lib/cache"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"

/* ── Reads ── */

export const getOfferByIdProcedure = authedProcedureGenerous
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const offer = await getOfferById(input.offerId)
    if (!offer) return null

    // Published offers are visible to everyone.
    // Draft/closed offers are only visible to the owning company or admins.
    if (offer.status !== "published") {
      if (!isAdminRole(context.user.role)) {
        // Check if the user is a member of the owning company
        const memberships = await db
          .select()
          .from(companyMember)
          .where(eq(companyMember.userId, context.user.id))
          .limit(2)

        if (memberships.length > 1) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Multiple company memberships found for user",
          })
        }

        const membership = memberships[0]

        if (!membership || membership.companyId !== offer.companyId) {
          throw new ORPCError("FORBIDDEN", {
            message: "You do not have access to this offer",
          })
        }
      }
    }

    return offer
  })

export const listOffersByCompanyProcedure = companyAdminProcedureGenerous
  .handler(async ({ context }) =>
    listOffersByCompany(context.companyMembership.companyId),
  )

/* ── Mutations ── */

export const createOfferProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      internshipType: internshipTypeSchema,
      workMode: workModeSchema.optional(),
      wilayaCode: z.coerce.number().int().min(1).max(58).optional(),
      durationWeeks: z.coerce.number().int().min(1).max(52).optional(),
      maxPositions: z.coerce.number().int().min(1).max(100).optional(),
      skillTagIds: z.array(z.string()).max(20).default([]),
    }),
  )
  .handler(async ({ input, context }) => {
    const result = await createOffer({
      companyId: context.companyMembership.companyId,
      ...input,
    })

    // Invalidate company offers cache and public offer search
    revalidateTag(CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId), { expire: 0 })
    revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
    revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })

    return result
  })

export const updateOfferProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      offerId: z.string().min(1),
      title: z.string().min(3).optional(),
      description: z.string().min(10).optional(),
      internshipType: internshipTypeSchema.optional(),
      workMode: workModeSchema.nullable().optional(),
      wilayaCode: z.coerce.number().int().min(1).max(58).nullable().optional(),
      durationWeeks: z.coerce.number().int().min(1).max(52).nullable().optional(),
      maxPositions: z.coerce.number().int().min(1).max(100).optional(),
      skillTagIds: z.array(z.string()).max(20).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const { offerId, ...data } = input
      const result = await updateOffer(offerId, context.companyMembership.companyId, data)

      // Invalidate offer caches
      revalidateTag(CACHE_TAGS.OFFER_DETAIL(offerId), { expire: 0 })
      revalidateTag(CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId), { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          OFFER_NOT_FOUND: "NOT_FOUND",
          OFFER_CLOSED: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to update offer",
      })
    }
  })

export const deleteOfferProcedure = companyAdminProcedureStandard
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      const result = await deleteOffer(input.offerId, context.companyMembership.companyId)

      // Invalidate offer caches
      revalidateTag(CACHE_TAGS.OFFER_DETAIL(input.offerId), { expire: 0 })
      revalidateTag(CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId), { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          OFFER_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to delete offer",
      })
    }
  })

export const updateOfferStatusProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      offerId: z.string().min(1),
      action: z.enum(["publish", "close"]),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const result = await updateOfferStatus(
        input.offerId,
        context.companyMembership.companyId,
        input.action,
      )

      // Invalidate offer caches when status changes
      revalidateTag(CACHE_TAGS.OFFER_DETAIL(input.offerId), { expire: 0 })
      revalidateTag(CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId), { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFER_SEARCH, { expire: 0 })
      revalidateTag(CACHE_TAGS.OFFERS_PUBLIC, { expire: 0 })

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          OFFER_NOT_FOUND: "NOT_FOUND",
          OFFER_INVALID_PUBLISH_STATUS: "BAD_REQUEST",
          OFFER_INVALID_CLOSE_STATUS: "BAD_REQUEST",
          OFFER_INVALID_ACTION: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to update offer status",
      })
    }
  })

/* ── AI Offer Copilot ── */

const offerFormContextSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  internshipType: z.string().optional(),
  workMode: z.string().nullable().optional(),
  wilayaCode: z.number().int().nullable().optional(),
  durationWeeks: z.number().int().nullable().optional(),
  maxPositions: z.number().int().optional(),
})

const availableSkillTagsSchema = z
  .array(z.object({ id: z.string(), name: z.string() }))
  .max(300)
  .default([])

export const generateOfferDraftProcedure = companyAdminProcedureAssistant
  .input(
    offerFormContextSchema.extend({
      prompt: z.string().max(500).optional(),
      availableSkillTags: availableSkillTagsSchema,
    }),
  )
  .handler(async ({ input }) => {
    const { generateOfferDraft } = await import(
      "@/server/services/offers/generate-draft"
    )
    return generateOfferDraft(input)
  })

export const improveOfferDescriptionProcedure = companyAdminProcedureAssistant
  .input(offerFormContextSchema)
  .handler(async ({ input }) => {
    const { improveOfferDescription } = await import(
      "@/server/services/offers/improve-description"
    )
    return improveOfferDescription(input)
  })

export const suggestOfferSkillsProcedure = companyAdminProcedureAssistant
  .input(
    offerFormContextSchema
      .pick({ title: true, description: true, internshipType: true, workMode: true })
      .extend({ availableSkillTags: availableSkillTagsSchema }),
  )
  .handler(async ({ input }) => {
    const { suggestOfferSkills } = await import(
      "@/server/services/offers/suggest-skills"
    )
    return suggestOfferSkills(input)
  })

/* ── AI Search Parsing ── */

export const parseSearchQueryProcedure = authedProcedureStrict
  .input(
    z.object({
      query: z.string().min(1).max(500),
      availableSkillTags: z
        .array(z.object({ id: z.string(), name: z.string() }))
        .max(300)
        .default([]),
    }),
  )
  .handler(async ({ input }) => {
    const { parseSearchQuery } = await import(
      "@/server/services/offers/parse-search"
    )
    return parseSearchQuery(input)
  })
