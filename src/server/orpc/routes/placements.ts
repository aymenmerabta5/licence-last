import "server-only"

import { z } from "zod"
import { ORPCError } from "@orpc/server"

import {
  adminProcedureGenerous,
  adminProcedureStandard,
  deptHeadProcedureGenerous,
  deptHeadProcedureStandard,
  assistantProcedureLimited,
} from "@/server/orpc/rate-limited-procedures"
import {
  parseInputDate,
  validatePlacementDateRange,
} from "@/server/orpc/utils/date"
import { listPendingApplications } from "@/server/services/placements/list-pending"
import { validatePlacement } from "@/server/services/placements/validate"
import { rejectPlacement } from "@/server/services/placements/reject"

/* ── List Pending Placements (admin only) ── */

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
  .handler(async ({ input, context }) =>
    listPendingApplications(
      input ?? {},
      {
        role: context.user.role === "super_admin" ? "super_admin" : "university_admin",
        universityId: context.user.universityId ?? null,
      },
    ),
  )

/* ── Validate Placement (admin only) ── */

export const validateProcedure = adminProcedureStandard
  .input(
    z.object({
      applicationId: z.string().min(1),
      startDate: z.string().min(1),
      endDate: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    // Validate dates first — these throw user-facing messages
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
        adminRole: context.user.role === "super_admin" ? "super_admin" : "university_admin",
        adminUniversityId: context.user.universityId ?? null,
        startDate,
        endDate,
      })
    } catch (error) {
      if (error instanceof ORPCError) throw error
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "An unexpected error occurred",
      })
    }
  })

/* ── Reject Placement (admin only) ── */

export const rejectProcedure = adminProcedureStandard
  .input(
    z.object({
      applicationId: z.string().min(1),
      reason: z.string().max(500).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      return await rejectPlacement(
        {
          applicationId: input.applicationId,
          adminUserId: context.user.id,
          adminRole:
            context.user.role === "super_admin" ? "super_admin" : "university_admin",
          adminUniversityId: context.user.universityId ?? null,
          reason: input.reason,
        },
      )
    } catch (error) {
      if (error instanceof ORPCError) throw error
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "An unexpected error occurred",
      })
    }
  })

/* ── Dept Head: List Pending Placements ── */

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
    listPendingApplications(
      input ?? {},
      {
        role: "dept_head",
        universityId: context.universityId,
        departmentId: context.departmentId,
      },
    ),
  )

/* ── Dept Head: Validate Placement ── */

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
      if (error instanceof ORPCError) throw error
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "An unexpected error occurred",
      })
    }
  })

/* ── AI Validation Summary (any authenticated admin/dept_head) ── */

export const generateValidationSummaryProcedure = assistantProcedureLimited
  .input(
    z.object({
      application: z.record(z.string(), z.unknown()),
    }),
  )
  .handler(async ({ input }) => {
    const { generateValidationSummary } = await import(
      "@/server/services/placements/generate-validation-summary"
    )
    return generateValidationSummary(input)
  })

/* ── Dept Head: Reject Placement ── */

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
      if (error instanceof ORPCError) throw error
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "An unexpected error occurred",
      })
    }
  })
