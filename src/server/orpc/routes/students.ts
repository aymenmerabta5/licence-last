import { z } from "zod"
import { ORPCError } from "@orpc/server"

import { authedProcedure } from "../middleware"
import { getStudentProfile } from "@/server/services/students/get-profile"
import { getPublicStudentProfile } from "@/server/services/students/get-public-profile"
import { upsertStudentProfile } from "@/server/services/students/upsert-profile"
import { upsertStudentProfileDetails } from "@/server/services/students/upsert-profile-details"

/* ── Reads ── */

export const getStudentProfileProcedure = authedProcedure
  .input(
    z
      .object({
        userId: z.string().min(1),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    const targetUserId = input?.userId ?? context.user.id

    // Students can only view their own profile.
    // Admins/super_admins can view any profile.
    const isAdmin =
      context.user.role === "admin" || context.user.role === "super_admin"
    if (targetUserId !== context.user.id && !isAdmin) {
      throw new ORPCError("FORBIDDEN", {
        message: "You can only view your own profile",
      })
    }

    return getStudentProfile(targetUserId)
  })

export const getPublicStudentProfileProcedure = authedProcedure
  .input(
    z.object({
      userId: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    const isAdmin =
      context.user.role === "admin" || context.user.role === "super_admin"
    const isCompanyAdmin = context.user.role === "company_admin"
    const isStudentOwner =
      context.user.role === "student" && input.userId === context.user.id

    if (!isAdmin && !isCompanyAdmin && !isStudentOwner) {
      throw new ORPCError("FORBIDDEN", {
        message: "You do not have access to this profile",
      })
    }

    return getPublicStudentProfile(
      { id: context.user.id, role: context.user.role },
      input.userId,
    )
  })

/* ── Mutations ── */

export const upsertStudentProfileProcedure = authedProcedure
  .input(
    z.object({
      bio: z.string().optional(),
      phone: z.string().optional(),
      githubUrl: z.string().url().optional().or(z.literal("")),
      portfolioUrl: z.string().url().optional().or(z.literal("")),
      studentNumber: z.string().optional(),
      department: z.string().optional(),
      level: z.string().optional(),
      wilayaCode: z.coerce.number().int().min(1).max(58).optional().or(z.literal(0)),
      address: z.string().optional(),
      skillTagIds: z.array(z.string()).min(1).max(10),
    }),
  )
  .handler(async ({ input, context }) => {
    if (context.user.role !== "student") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only students can update their profile",
      })
    }

    const { skillTagIds, ...data } = input
    return upsertStudentProfile(data, skillTagIds, context.user.id)
  })

export const upsertStudentProfileDetailsProcedure = authedProcedure
  .input(
    z.object({
      bio: z.string().optional(),
      phone: z.string().optional(),
      githubUrl: z.string().url().optional().or(z.literal("")),
      portfolioUrl: z.string().url().optional().or(z.literal("")),
      studentNumber: z.string().optional(),
      department: z.string().optional(),
      level: z.string().optional(),
      wilayaCode: z.coerce.number().int().min(1).max(58).optional().or(z.literal(0)),
      address: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    if (context.user.role !== "student") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only students can update their profile",
      })
    }

    return upsertStudentProfileDetails(input, context.user.id)
  })
