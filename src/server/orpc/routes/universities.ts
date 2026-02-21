import "server-only"

import { ORPCError } from "@orpc/server"
import { eq } from "drizzle-orm"
import { revalidateTag } from "next/cache"
import { z } from "zod"
import { env } from "@/env"
import { CACHE_TAGS } from "@/lib/cache"
import { universityStatusSchema } from "@/lib/schemas/enums"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import UniversityApprovedEmail from "@/server/email/templates/UniversityApprovedEmail"
import { isAdminRole } from "@/server/orpc/middleware"
import {
  authedProcedureGenerous,
  authedProcedureStandard,
  superAdminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { emitNotification } from "@/server/services/notifications/emit"
import { approveUniversity } from "@/server/services/universities/approve"
import { createUniversity } from "@/server/services/universities/create"
import { deleteUniversity } from "@/server/services/universities/delete"
import { getUniversityById } from "@/server/services/universities/get"
import { listUniversities } from "@/server/services/universities/list"
import { rejectUniversity } from "@/server/services/universities/reject"
import { updateUniversity } from "@/server/services/universities/update"

/* ── Reads ── */

export const listUniversitiesProcedure = authedProcedureGenerous
  .input(
    z
      .object({
        status: universityStatusSchema.optional(),
        search: z.string().trim().min(1).max(120).optional(),
        limit: z.coerce.number().int().min(1).max(200).optional(),
        offset: z.coerce.number().int().min(0).max(10000).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    const isAdmin = isAdminRole(context.user.role)
    const effectiveStatus = isAdmin ? input?.status : ("approved" as const)
    const effectiveSearch =
      context.user.role === "super_admin" ? input?.search : undefined

    return listUniversities({
      status: effectiveStatus,
      search: effectiveSearch,
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
  .handler(async ({ input, context }) => {
    const result = await createUniversity(input, context.user.id)

    revalidateTag(CACHE_TAGS.UNIVERSITIES, "max")
    revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-${result.universityId}`, "max")
    revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-user-${context.user.id}`, "max")

    return result
  })

export const updateUniversityProcedure = superAdminProcedureStandard
  .input(
    z.object({
      universityId: z.string().min(1),
      name: z.string().min(2).optional(),
      abbreviation: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      wilayaCode: z
        .union([z.coerce.number().int().min(1).max(58), z.null()])
        .optional(),
      city: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      const result = await updateUniversity(input.universityId, {
        name: input.name,
        abbreviation: input.abbreviation,
        phone: input.phone,
        wilayaCode: input.wilayaCode,
        city: input.city,
        address: input.address,
      })

      revalidateTag(CACHE_TAGS.UNIVERSITIES, "max")
      revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-${input.universityId}`, "max")

      const linkedUsers = await db
        .select({ userId: user.id })
        .from(user)
        .where(eq(user.universityId, input.universityId))

      for (const linkedUser of linkedUsers) {
        revalidateTag(
          `${CACHE_TAGS.UNIVERSITIES}-user-${linkedUser.userId}`,
          "max",
        )
      }

      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          UNIVERSITY_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to update university",
      })
    }
  })

export const deleteUniversityProcedure = superAdminProcedureStandard
  .input(z.object({ universityId: z.string().min(1) }))
  .handler(async ({ input }) => {
    try {
      const result = await deleteUniversity(input.universityId)

      revalidateTag(CACHE_TAGS.UNIVERSITIES, "max")
      revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-${input.universityId}`, "max")

      for (const affectedUserId of result.affectedUserIds) {
        revalidateTag(
          `${CACHE_TAGS.UNIVERSITIES}-user-${affectedUserId}`,
          "max",
        )
      }

      return {
        success: result.success,
        universityId: result.universityId,
        affectedUsers: result.affectedUserIds.length,
      }
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          UNIVERSITY_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to delete university",
      })
    }
  })

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
      await emitNotification({
        userId: admin.userId,
        type: "university_approved",
        payload: {
          universityId: input.universityId,
          universityName: result.name,
        },
        email: {
          to: admin.email,
          subject: `${result.name} has been approved - Stag`,
          component: UniversityApprovedEmail,
          props: { universityName: result.name, dashboardUrl },
        },
      })
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
