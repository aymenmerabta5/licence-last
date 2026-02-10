import { z } from "zod"
import { ORPCError } from "@orpc/server"

import { authedProcedure, studentProcedure, companyAdminProcedure } from "../middleware"
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
import { listApplicationsByOffer } from "@/server/services/applications/list-by-offer"
import { companyAcceptApplication } from "@/server/services/applications/company-accept"
import { companyRefuseApplication } from "@/server/services/applications/company-refuse"

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

/* ── Company Admin Procedures ── */

const applicationStatusSchema = z.enum([
  "applied",
  "company_accepted",
  "company_refused",
  "admin_validated",
  "admin_rejected",
  "withdrawn",
])

export const listByOfferProcedure = companyAdminProcedure
  .input(
    z.object({
      offerId: z.string().min(1),
      status: applicationStatusSchema.optional(),
      cursor: z.object({ createdAt: z.string(), id: z.string() }).optional(),
      limit: z.coerce.number().int().min(1).max(50).optional(),
    }),
  )
  .handler(async ({ input, context }) =>
    listApplicationsByOffer(
      input.offerId,
      context.companyMembership.companyId,
      {
        status: input.status,
        cursor: input.cursor,
        limit: input.limit,
      },
    ),
  )

export const companyAcceptProcedure = companyAdminProcedure
  .input(z.object({ applicationId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    try {
      return await companyAcceptApplication(
        input.applicationId,
        context.companyMembership.companyId,
        context.user.id,
      )
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error ? error.message : "Failed to accept application",
      })
    }
  })

export const companyRefuseProcedure = companyAdminProcedure
  .input(
    z.object({
      applicationId: z.string().min(1),
      note: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await companyRefuseApplication(
        input.applicationId,
        context.companyMembership.companyId,
        context.user.id,
        input.note,
      )
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error ? error.message : "Failed to refuse application",
      })
    }
  })
