import "server-only"

import { z } from "zod"
import { eq } from "drizzle-orm"
import { ORPCError } from "@orpc/server"
import { revalidateTag } from "next/cache"

import { isAdminRole } from "@/server/orpc/middleware"
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
import { createNotification } from "@/server/services/notifications/create"
import { sendEmail } from "@/server/email/sendEmail"
import UniversityApprovedEmail from "@/server/email/templates/UniversityApprovedEmail"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { env } from "@/env"
import { CACHE_TAGS } from "@/lib/cache"

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
  .handler(async ({ input, context }) => {
    const result = await approveUniversity(input.universityId, context.user.id)

    // Invalidate university caches so status page updates immediately
    revalidateTag(CACHE_TAGS.UNIVERSITIES, "max")
    revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-${input.universityId}`, "max")

    // Find the university_admin user(s) linked to this university
    const admins = await db
      .select({ userId: user.id, email: user.email })
      .from(user)
      .where(eq(user.universityId, input.universityId))

    const dashboardUrl = `${env.NEXT_PUBLIC_BETTER_AUTH_URL}/dashboard`
    for (const admin of admins) {
      await createNotification({
        userId: admin.userId,
        type: "university_approved",
        payload: {
          universityId: input.universityId,
          universityName: result.name,
        },
      })
      sendEmail(
        admin.email,
        `${result.name} has been approved — Internex`,
        UniversityApprovedEmail,
        { universityName: result.name, dashboardUrl },
      )
      // Invalidate user-specific university cache
      revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-user-${admin.userId}`, "max")
    }

    return result
  })

export const rejectUniversityProcedure = superAdminProcedureStandard
  .input(
    z.object({
      universityId: z.string().min(1),
      reason: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const result = await rejectUniversity(
      input.universityId,
      input.reason,
      context.user.id,
    )

    // Invalidate university caches
    revalidateTag(CACHE_TAGS.UNIVERSITIES, "max")
    revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-${input.universityId}`, "max")

    // Invalidate user-specific caches
    const admins = await db
      .select({ userId: user.id })
      .from(user)
      .where(eq(user.universityId, input.universityId))

    for (const admin of admins) {
      revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-user-${admin.userId}`, "max")
    }

    return result
  })
