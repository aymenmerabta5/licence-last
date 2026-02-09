import { z } from "zod"
import { ORPCError } from "@orpc/server"

import { authedProcedure, studentProcedure } from "../middleware"
import {
  searchOffersSchema,
  applyToOfferSchema,
  listStudentApplicationsSchema,
} from "@/lib/schemas/search"
import { searchOffers } from "@/server/services/offers/search"
import { getStudentApplicationForOffer } from "@/server/services/offers/get"
import { applyToOffer } from "@/server/services/applications/apply"
import { listApplicationsByStudent } from "@/server/services/applications/list-by-student"
import { withdrawApplication } from "@/server/services/applications/withdraw"

/* ── Offer Search (any authenticated user) ── */

export const searchOffersProcedure = authedProcedure
  .input(searchOffersSchema)
  .handler(async ({ input }) => searchOffers(input))

/* ── Application Procedures (student only) ── */

export const checkApplicationProcedure = studentProcedure
  .input(z.object({ offerId: z.string().min(1) }))
  .handler(async ({ input, context }) =>
    getStudentApplicationForOffer(input.offerId, context.user.id),
  )

export const applyToOfferProcedure = studentProcedure
  .input(applyToOfferSchema)
  .handler(async ({ input, context }) => {
    try {
      return await applyToOffer(
        input.offerId,
        context.user.id,
        input.coverLetter,
      )
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error ? error.message : "Failed to apply",
      })
    }
  })

export const listStudentApplicationsProcedure = studentProcedure
  .input(listStudentApplicationsSchema)
  .handler(async ({ input, context }) =>
    listApplicationsByStudent(context.user.id, input),
  )

export const withdrawApplicationProcedure = studentProcedure
  .input(z.object({ applicationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      return await withdrawApplication(input.applicationId, context.user.id)
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error ? error.message : "Failed to withdraw",
      })
    }
  })
