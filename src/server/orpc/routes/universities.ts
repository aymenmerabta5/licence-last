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
import { university } from "@/server/db/schema/universities"
import UniversityApprovedEmail from "@/server/email/templates/UniversityApprovedEmail"
import { isAdminRole } from "@/server/orpc/authz"
import {
  adminProcedureStandard,
  authedProcedureGenerous,
  authedProcedureStandard,
  superAdminProcedureStandard,
  universityProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import {
  createServiceORPCError,
  throwCodedORPCError,
} from "@/server/orpc/utils/service-error"
import { emitNotification } from "@/server/services/notifications/emit"
import { uploadImageToS3 } from "@/server/services/uploads/upload-image"
import { addUniversityDomain } from "@/server/services/universities/add-domain"
import { approveUniversity } from "@/server/services/universities/approve"
import { createUniversity } from "@/server/services/universities/create"
import { deleteUniversity } from "@/server/services/universities/delete"
import { getUniversityById } from "@/server/services/universities/get"
import { listUniversities } from "@/server/services/universities/list"
import { listUniversityDomains } from "@/server/services/universities/list-domains"
import { rejectUniversity } from "@/server/services/universities/reject"
import { removeUniversityDomain } from "@/server/services/universities/remove-domain"
import { updateUniversity } from "@/server/services/universities/update"
import { deleteFile } from "@/server/storage/s3"

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
    const isAdmin = isAdminRole(
      context.user.role,
      context.user.universityMembershipRole,
    )
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
    if (
      !isAdminRole(context.user.role, context.user.universityMembershipRole) &&
      uni.status !== "approved"
    ) {
      return null
    }
    return uni
  })

/* ── Mutations ── */

export const createUniversityProcedure = authedProcedureStandard
  .use(async ({ context, next }) => {
    if (
      context.user.role !== "university_admin" ||
      context.user.universityMembershipRole === "department_head"
    ) {
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
    if (context.user.universityId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "University admin is already linked to a university",
      })
    }

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
      logoUrl: z.string().url().optional().or(z.literal("")),
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
        logoUrl: input.logoUrl || null,
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
    try {
      const result = await approveUniversity(
        input.universityId,
        context.user.id,
      )

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
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          UNIVERSITY_NOT_FOUND: "NOT_FOUND",
          UNIVERSITY_INVALID_STATUS_TRANSITION: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to approve university",
      })
    }
  })

export const rejectUniversityProcedure = superAdminProcedureStandard
  .input(
    z.object({
      universityId: z.string().min(1),
      reason: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
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
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          UNIVERSITY_NOT_FOUND: "NOT_FOUND",
          UNIVERSITY_INVALID_STATUS_TRANSITION: "BAD_REQUEST",
        },
        fallbackMessage: "Failed to reject university",
      })
    }
  })

/* ── University Self-Management ── */

export const updateMyUniversityProcedure = adminProcedureStandard
  .input(
    z.object({
      name: z.string().min(2).optional(),
      abbreviation: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      wilayaCode: z
        .union([z.coerce.number().int().min(1).max(58), z.null()])
        .optional(),
      city: z.string().nullable().optional(),
      address: z.string().nullable().optional(),
      logoUrl: z.string().url().optional().or(z.literal("")),
    }),
  )
  .handler(async ({ input, context }) => {
    const universityId =
      context.user.role === "super_admin"
        ? undefined
        : (context.user.universityId ?? undefined)

    if (context.user.role !== "super_admin" && !universityId) {
      throwCodedORPCError("BAD_REQUEST", "ADMIN_MUST_BELONG_TO_UNIVERSITY", {
        message: "You must be associated with a university to update it",
      })
    }

    try {
      const targetId = universityId ?? context.user.universityId
      if (!targetId) {
        throwCodedORPCError("BAD_REQUEST", "NO_UNIVERSITY_ASSIGNED", {
          message: "No university assigned",
        })
      }

      const result = await updateUniversity(targetId, {
        name: input.name,
        abbreviation: input.abbreviation,
        phone: input.phone,
        wilayaCode: input.wilayaCode,
        city: input.city,
        address: input.address,
        logoUrl: input.logoUrl || null,
      })

      revalidateTag(CACHE_TAGS.UNIVERSITIES, "max")
      revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-${targetId}`, "max")
      revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-user-${context.user.id}`, "max")

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

export const listMyUniversityDomainsProcedure = adminProcedureStandard.handler(
  async ({ context }) => {
    const universityId =
      context.user.role === "super_admin"
        ? undefined
        : (context.user.universityId ?? undefined)

    if (context.user.role !== "super_admin" && !universityId) {
      throwCodedORPCError("BAD_REQUEST", "ADMIN_MUST_BELONG_TO_UNIVERSITY", {
        message: "You must be associated with a university",
      })
    }

    const targetId = universityId ?? context.user.universityId
    if (!targetId) {
      throwCodedORPCError("BAD_REQUEST", "NO_UNIVERSITY_ASSIGNED", {
        message: "No university assigned",
      })
    }

    return listUniversityDomains(targetId)
  },
)

export const addUniversityDomainProcedure = adminProcedureStandard
  .input(
    z.object({
      domain: z.string().min(3).email().or(z.string().min(3)),
    }),
  )
  .handler(async ({ input, context }) => {
    const universityId =
      context.user.role === "super_admin"
        ? undefined
        : (context.user.universityId ?? undefined)

    if (context.user.role !== "super_admin" && !universityId) {
      throwCodedORPCError("BAD_REQUEST", "ADMIN_MUST_BELONG_TO_UNIVERSITY", {
        message: "You must be associated with a university",
      })
    }

    const targetId = universityId ?? context.user.universityId
    if (!targetId) {
      throwCodedORPCError("BAD_REQUEST", "NO_UNIVERSITY_ASSIGNED", {
        message: "No university assigned",
      })
    }

    // Normalize domain: if email was passed, extract the domain part
    const normalizedDomain = input.domain.includes("@")
      ? input.domain.split("@")[1]!
      : input.domain.toLowerCase().trim()

    try {
      const result = await addUniversityDomain(targetId, normalizedDomain)
      revalidateTag(CACHE_TAGS.UNIVERSITIES, "max")
      revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-${targetId}`, "max")
      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          DOMAIN_ALREADY_EXISTS: "CONFLICT",
        },
        fallbackMessage: "Failed to add domain",
      })
    }
  })

export const removeUniversityDomainProcedure = adminProcedureStandard
  .input(z.object({ domainId: z.string().min(1) }))
  .handler(async ({ input, context }) => {
    const universityId =
      context.user.role === "super_admin"
        ? undefined
        : (context.user.universityId ?? undefined)

    if (context.user.role !== "super_admin" && !universityId) {
      throwCodedORPCError("BAD_REQUEST", "ADMIN_MUST_BELONG_TO_UNIVERSITY", {
        message: "You must be associated with a university",
      })
    }

    const targetId = universityId ?? context.user.universityId
    if (!targetId) {
      throwCodedORPCError("BAD_REQUEST", "NO_UNIVERSITY_ASSIGNED", {
        message: "No university assigned",
      })
    }

    try {
      const result = await removeUniversityDomain(targetId, input.domainId)
      revalidateTag(CACHE_TAGS.UNIVERSITIES, "max")
      revalidateTag(`${CACHE_TAGS.UNIVERSITIES}-${targetId}`, "max")
      return result
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          DOMAIN_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to remove domain",
      })
    }
  })

export const uploadUniversityLogoProcedure = universityProcedureStandard
  .input(z.object({ file: z.file() }))
  .handler(async ({ input, context }) => {
    const universityId = context.user.universityId
    if (!universityId) {
      throwCodedORPCError("BAD_REQUEST", "NO_UNIVERSITY_ASSIGNED", {
        message: "No university assigned",
      })
    }

    const [current] = await db
      .select({ logoUrl: university.logoUrl })
      .from(university)
      .where(eq(university.id, universityId))
      .limit(1)

    const result = await uploadImageToS3({
      file: input.file,
      folder: "university-logos",
    })

    await updateUniversity(universityId, { logoUrl: result.url })

    if (current?.logoUrl) {
      try {
        const oldKey = new URL(current.logoUrl).pathname.slice(1)
        await deleteFile(oldKey)
      } catch {
        // Ignore cleanup errors
      }
    }

    return { url: result.url }
  })
