import "server-only"

import { z } from "zod"
import { ORPCError } from "@orpc/server"

import { isAdminRole } from "../middleware"
import {
  authedProcedureGenerous,
  authedProcedureStandard,
  superAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { universityStatusSchema } from "@/lib/schemas/enums"
import { listUniversities } from "@/server/services/universities/list"
import { getUniversityById } from "@/server/services/universities/get"
import { createUniversity } from "@/server/services/universities/create"
import { approveUniversity } from "@/server/services/universities/approve"
import { rejectUniversity } from "@/server/services/universities/reject"

/* ── Reads ── */

export const listUniversitiesProcedure = authedProcedureGenerous
  .input(
    z
      .object({
        status: universityStatusSchema.optional(),
        limit: z.coerce.number().int().min(1).max(200).optional(),
        offset: z.coerce.number().int().min(0).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    const isAdmin = isAdminRole(context.user.role)
    const effectiveStatus = isAdmin ? input?.status : ("approved" as const)
    return listUniversities({
      status: effectiveStatus,
      limit: input?.limit,
      offset: input?.offset,
    })
  })

export const getUniversityByIdProcedure = authedProcedureGenerous
  .input(z.object({ universityId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const uni = await getUniversityById(input.universityId)
    if (!uni) return null
    // Non-admin users can only see approved universities
    if (!isAdminRole(context.user.role) && uni.status !== "approved") {
      return null
    }
    return uni
  })

/* ── Mutations ── */

export const createUniversityProcedure = authedProcedureStandard
  .use(async ({ context, next }) => {
    if (context.user.role !== "university_admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "University admin access required",
      })
    }
    return next({ context })
  })
  .input(
    z.object({
      name: z.string().min(2),
      abbreviation: z.string().optional(),

      deanName: z.string().optional(),
      phone: z.string().optional(),
      wilayaCode: z.coerce.number().int().min(1).max(58).optional(),
      city: z.string().optional(),
      address: z.string().optional(),
      domains: z.array(z.string().min(3)).min(1),
      departments: z.array(z.object({ name: z.string().min(2) })).optional(),
    }),
  )
  .handler(async ({ input, context }) =>
    createUniversity(input, context.user.id),
  )

export const approveUniversityProcedure = superAdminProcedureStandard
  .input(z.object({ universityId: z.string().min(1) }))
  .handler(async ({ input, context }) =>
    approveUniversity(input.universityId, context.user.id),
  )

export const rejectUniversityProcedure = superAdminProcedureStandard
  .input(
    z.object({
      universityId: z.string().min(1),
      reason: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) =>
    rejectUniversity(input.universityId, input.reason, context.user.id),
  )
