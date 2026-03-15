import "server-only"

import { ORPCError } from "@orpc/server"
import { z } from "zod"

import {
  adminProcedureGenerous,
  adminProcedureStandard,
  deptHeadProcedureGenerous,
  deptHeadProcedureStandard,
  universityProcedureAssistant,
} from "@/server/orpc/rate-limited-procedures"
import {
  parseInputDate,
  validatePlacementDateRange,
} from "@/server/orpc/utils/date"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"
import { getPendingApplicationById } from "@/server/services/placements/get-pending-by-id"
import { listPendingApplications } from "@/server/services/placements/list-pending"
import { rejectPlacement } from "@/server/services/placements/reject"
import { validatePlacement } from "@/server/services/placements/validate"

const PLACEMENT_ERROR_MAP = {
  APPLICATION_NOT_FOUND: "NOT_FOUND",
  APPLICATION_NOT_COMPANY_ACCEPTED: "BAD_REQUEST",
  ADMIN_DEPARTMENT_NOT_SET: "FORBIDDEN",
  ADMIN_UNIVERSITY_NOT_SET: "FORBIDDEN",
  PLACEMENT_SCOPE_FORBIDDEN_DEPARTMENT: "FORBIDDEN",
  PLACEMENT_SCOPE_FORBIDDEN_UNIVERSITY: "FORBIDDEN",
  PLACEMENT_ALREADY_EXISTS: "CONFLICT",
} as const

function assertUniversityAdminRole(role: string | null | undefined): void {
  if (role !== "university_admin") {
    throw new ORPCError("FORBIDDEN", {
      message: "University admin access required",
    })
  }
}

function assertNotSuperAdmin(role: string | null | undefined): void {
  if (role === "super_admin") {
    throw new ORPCError("FORBIDDEN", {
      message: "Super admin cannot access placement validations",
    })
  }
}

/* List pending placements (university admin only) */

export const listPendingProcedure = adminProcedureGenerous
  .input(
    z
      .object({
        cursor: z
          .object({ companyActionAt: z.string(), id: z.string() })
          .optional(),
        limit: z.coerce.number().int().min(1).max(50).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    assertUniversityAdminRole(context.user.effectiveRole ?? context.user.role)

    return listPendingApplications(input ?? {}, {
      role: "university_admin",
      universityId: context.user.universityId ?? null,
    })
  })

export const getPendingByIdProcedure = adminProcedureGenerous
  .input(
    z.object({
      applicationId: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    assertUniversityAdminRole(context.user.effectiveRole ?? context.user.role)

    return {
      application: await getPendingApplicationById(input.applicationId, {
        role: "university_admin",
        universityId: context.user.universityId ?? null,
      }),
    }
  })

/* Validate placement (university admin only) */

export const validateProcedure = adminProcedureStandard
  .input(
    z.object({
      applicationId: z.string().min(1),
      startDate: z.string().min(1),
      endDate: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    assertUniversityAdminRole(context.user.effectiveRole ?? context.user.role)

    // Validate dates first; these throw user-facing messages.
    let startDate: Date
    let endDate: Date
    try {
      startDate = parseInputDate(input.startDate, "Start date")
      endDate = parseInputDate(input.endDate, "End date")
      validatePlacementDateRange(startDate, endDate)
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message: error instanceof Error ? error.message : "Invalid date input",
      })
    }

    try {
      return await validatePlacement({
        applicationId: input.applicationId,
        adminUserId: context.user.id,
        adminRole: "university_admin",
        adminUniversityId: context.user.universityId ?? null,
        startDate,
        endDate,
      })
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: PLACEMENT_ERROR_MAP,
        fallbackMessage: "Failed to validate placement",
        fallbackCode: "BAD_REQUEST",
      })
    }
  })

/* Reject placement (university admin only) */

export const rejectProcedure = adminProcedureStandard
  .input(
    z.object({
      applicationId: z.string().min(1),
      reason: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    assertUniversityAdminRole(context.user.effectiveRole ?? context.user.role)

    try {
      return await rejectPlacement({
        applicationId: input.applicationId,
        adminUserId: context.user.id,
        adminRole: "university_admin",
        adminUniversityId: context.user.universityId ?? null,
        reason: input.reason,
      })
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: PLACEMENT_ERROR_MAP,
        fallbackMessage: "Failed to reject placement",
        fallbackCode: "BAD_REQUEST",
      })
    }
  })

/* Dept head: list pending placements */

export const deptHeadListPendingProcedure = deptHeadProcedureGenerous
  .input(
    z
      .object({
        cursor: z
          .object({ companyActionAt: z.string(), id: z.string() })
          .optional(),
        limit: z.coerce.number().int().min(1).max(50).optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) =>
    listPendingApplications(input ?? {}, {
      role: "dept_head",
      universityId: context.universityId,
      departmentId: context.departmentId,
    }),
  )

export const deptHeadGetPendingByIdProcedure = deptHeadProcedureGenerous
  .input(
    z.object({
      applicationId: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => ({
    application: await getPendingApplicationById(input.applicationId, {
      role: "dept_head",
      universityId: context.universityId,
      departmentId: context.departmentId,
    }),
  }))

/* Dept head: validate placement */

export const deptHeadValidateProcedure = deptHeadProcedureStandard
  .input(
    z.object({
      applicationId: z.string().min(1),
      startDate: z.string().min(1),
      endDate: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    let startDate: Date
    let endDate: Date
    try {
      startDate = parseInputDate(input.startDate, "Start date")
      endDate = parseInputDate(input.endDate, "End date")
      validatePlacementDateRange(startDate, endDate)
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message: error instanceof Error ? error.message : "Invalid date input",
      })
    }

    try {
      return await validatePlacement({
        applicationId: input.applicationId,
        adminUserId: context.user.id,
        adminRole: "dept_head",
        adminUniversityId: context.universityId,
        adminDepartmentId: context.departmentId,
        startDate,
        endDate,
      })
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: PLACEMENT_ERROR_MAP,
        fallbackMessage: "Failed to validate placement",
        fallbackCode: "BAD_REQUEST",
      })
    }
  })

/* AI validation summary (university_admin + dept_head; super_admin blocked) */

export const generateValidationSummaryProcedure = universityProcedureAssistant
  .input(
    z.object({
      application: z.record(z.string(), z.unknown()),
    }),
  )
  .handler(async ({ input, context }) => {
    assertNotSuperAdmin(context.user.effectiveRole ?? context.user.role)

    const { generateValidationSummary } = await import(
      "@/server/services/placements/generate-validation-summary"
    )
    return generateValidationSummary(input)
  })

/* Dept head: reject placement */

export const deptHeadRejectProcedure = deptHeadProcedureStandard
  .input(
    z.object({
      applicationId: z.string().min(1),
      reason: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await rejectPlacement({
        applicationId: input.applicationId,
        adminUserId: context.user.id,
        adminRole: "dept_head",
        adminUniversityId: context.universityId,
        adminDepartmentId: context.departmentId,
        reason: input.reason,
      })
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: PLACEMENT_ERROR_MAP,
        fallbackMessage: "Failed to reject placement",
        fallbackCode: "BAD_REQUEST",
      })
    }
  })
