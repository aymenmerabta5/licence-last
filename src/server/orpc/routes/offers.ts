import "server-only"

import { z } from "zod"
import { ORPCError } from "@orpc/server"
import { updateTag } from "next/cache"

import { isAdminRole } from "../middleware"
import {
  authedProcedureGenerous,
  companyAdminProcedureGenerous,
  companyAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { internshipTypeSchema, workModeSchema } from "@/lib/schemas/enums"
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
        const [membership] = await db
          .select()
          .from(companyMember)
          .where(eq(companyMember.userId, context.user.id))
          .limit(1)

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
    updateTag(CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId))
    updateTag(CACHE_TAGS.OFFER_SEARCH)
    updateTag(CACHE_TAGS.OFFERS_PUBLIC)

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
    const { offerId, ...data } = input
    const result = await updateOffer(offerId, context.companyMembership.companyId, data)

    // Invalidate offer caches
    updateTag(CACHE_TAGS.OFFER_DETAIL(offerId))
    updateTag(CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId))
    updateTag(CACHE_TAGS.OFFER_SEARCH)
    updateTag(CACHE_TAGS.OFFERS_PUBLIC)

    return result
  })

export const deleteOfferProcedure = companyAdminProcedureStandard
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const result = await deleteOffer(input.offerId, context.companyMembership.companyId)

    // Invalidate offer caches
    updateTag(CACHE_TAGS.OFFER_DETAIL(input.offerId))
    updateTag(CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId))
    updateTag(CACHE_TAGS.OFFER_SEARCH)
    updateTag(CACHE_TAGS.OFFERS_PUBLIC)

    return result
  })

export const updateOfferStatusProcedure = companyAdminProcedureStandard
  .input(
    z.object({
      offerId: z.string().min(1),
      action: z.enum(["publish", "close"]),
    }),
  )
  .handler(async ({ input, context }) => {
    const result = await updateOfferStatus(
      input.offerId,
      context.companyMembership.companyId,
      input.action,
    )

    // Invalidate offer caches when status changes
    updateTag(CACHE_TAGS.OFFER_DETAIL(input.offerId))
    updateTag(CACHE_TAGS.COMPANY_OFFERS(context.companyMembership.companyId))
    updateTag(CACHE_TAGS.OFFER_SEARCH)
    updateTag(CACHE_TAGS.OFFERS_PUBLIC)

    return result
  })
