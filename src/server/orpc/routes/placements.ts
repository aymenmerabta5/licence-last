import { z } from "zod"
import { ORPCError } from "@orpc/server"

import { adminProcedure } from "../middleware"
import { listPendingApplications } from "@/server/services/placements/list-pending"
import { validatePlacement } from "@/server/services/placements/validate"
import { rejectPlacement } from "@/server/services/placements/reject"

/* ── List Pending Placements (admin only) ── */

export const listPendingProcedure = adminProcedure
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
        role: context.user.role === "super_admin" ? "super_admin" : "admin",
        universityId: context.user.universityId ?? null,
      },
    ),
  )

/* ── Validate Placement (admin only) ── */

export const validateProcedure = adminProcedure
  .input(
    z.object({
      applicationId: z.string().min(1),
      startDate: z.string().transform((val) => new Date(val)),
      endDate: z.string().transform((val) => new Date(val)),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      // Validate dates
      if (input.startDate >= input.endDate) {
        throw new Error("Start date must be before end date")
      }
      if (input.startDate < new Date()) {
        throw new Error("Start date cannot be in the past")
      }

      return await validatePlacement({
        applicationId: input.applicationId,
        adminUserId: context.user.id,
        adminRole: context.user.role === "super_admin" ? "super_admin" : "admin",
        adminUniversityId: context.user.universityId ?? null,
        startDate: input.startDate,
        endDate: input.endDate,
      })
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error ? error.message : "Failed to validate placement",
      })
    }
  })

/* ── Reject Placement (admin only) ── */

export const rejectProcedure = adminProcedure
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
            context.user.role === "super_admin" ? "super_admin" : "admin",
          adminUniversityId: context.user.universityId ?? null,
          reason: input.reason,
        },
      )
    } catch (error) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          error instanceof Error ? error.message : "Failed to reject placement",
      })
    }
  })
