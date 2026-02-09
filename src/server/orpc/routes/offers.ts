import { z } from "zod"
import { ORPCError } from "@orpc/server"

import { authedProcedure, companyAdminProcedure } from "../middleware"
import { getOfferById } from "@/server/services/offers/get"
import { listOffersByCompany } from "@/server/services/offers/list-by-company"
import { createOffer } from "@/server/services/offers/create"
import { updateOffer } from "@/server/services/offers/update"
import { deleteOffer } from "@/server/services/offers/delete"
import { updateOfferStatus } from "@/server/services/offers/update-status"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { eq } from "drizzle-orm"

/* ── Reads ── */

export const getOfferByIdProcedure = authedProcedure
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const offer = await getOfferById(input.offerId)
    if (!offer) return null

    // Published offers are visible to everyone.
    // Draft/closed offers are only visible to the owning company or admins.
    if (offer.status !== "published") {
      const isAdmin =
        context.user.role === "admin" || context.user.role === "super_admin"

      if (!isAdmin) {
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

export const listOffersByCompanyProcedure = companyAdminProcedure
  .handler(async ({ context }) =>
    listOffersByCompany(context.companyMembership.companyId),
  )

/* ── Mutations ── */

export const createOfferProcedure = companyAdminProcedure
  .input(
    z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      internshipType: z.enum(["pfe", "immersion", "summer", "practical"]),
      workMode: z.enum(["on_site", "hybrid", "remote"]).optional(),
      wilayaCode: z.coerce.number().int().min(1).max(58).optional(),
      durationWeeks: z.coerce.number().int().min(1).max(52).optional(),
      maxPositions: z.coerce.number().int().min(1).max(100).optional(),
      skillTagIds: z.array(z.string()).max(20).default([]),
    }),
  )
  .handler(async ({ input, context }) =>
    createOffer({
      companyId: context.companyMembership.companyId,
      ...input,
    }),
  )

export const updateOfferProcedure = companyAdminProcedure
  .input(
    z.object({
      offerId: z.string().min(1),
      title: z.string().min(3).optional(),
      description: z.string().min(10).optional(),
      internshipType: z.enum(["pfe", "immersion", "summer", "practical"]).optional(),
      workMode: z.enum(["on_site", "hybrid", "remote"]).nullable().optional(),
      wilayaCode: z.coerce.number().int().min(1).max(58).nullable().optional(),
      durationWeeks: z.coerce.number().int().min(1).max(52).nullable().optional(),
      maxPositions: z.coerce.number().int().min(1).max(100).optional(),
      skillTagIds: z.array(z.string()).max(20).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const { offerId, ...data } = input
    return updateOffer(offerId, context.companyMembership.companyId, data)
  })

export const deleteOfferProcedure = companyAdminProcedure
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) =>
    deleteOffer(input.offerId, context.companyMembership.companyId),
  )

export const updateOfferStatusProcedure = companyAdminProcedure
  .input(
    z.object({
      offerId: z.string().min(1),
      action: z.enum(["publish", "close"]),
    }),
  )
  .handler(async ({ input, context }) =>
    updateOfferStatus(
      input.offerId,
      context.companyMembership.companyId,
      input.action,
    ),
  )
