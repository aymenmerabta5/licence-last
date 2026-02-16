import "server-only"

import { eq } from "drizzle-orm"
import { ORPCError } from "@orpc/server"
import { z } from "zod"

import { bulkCreateDepartmentsSchema } from "@/lib/schemas/department"
import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"
import { university } from "@/server/db/schema/universities"
import {
  authedProcedureGenerous,
  adminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { assignDepartmentHead } from "@/server/services/departments/assign-head"
import { assignDepartmentHeadByEmail } from "@/server/services/departments/assign-head-by-email"
import { bulkCreateDepartmentsWithHeads } from "@/server/services/departments/bulk-create-with-heads"
import { createDepartment } from "@/server/services/departments/create"
import { getDepartmentSkillIds } from "@/server/services/departments/get-skills"
import { listDepartments } from "@/server/services/departments/list"
import { syncDepartmentSkills } from "@/server/services/departments/sync-skills"
import { updateDepartment } from "@/server/services/departments/update"

export const listDepartmentsProcedure = authedProcedureGenerous
  .input(z.object({ universityId: z.string().min(1) }))
  .handler(async ({ input }) => listDepartments(input.universityId))

export const createDepartmentProcedure = adminProcedureStandard
  .input(
    z.object({
      name: z.string().min(2).max(200),
      headName: z.string().max(200).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const universityId = context.user.universityId
    if (!universityId) {
      throw new Error("Admin must belong to a university")
    }

    return createDepartment({
      universityId,
      name: input.name,
      headName: input.headName,
    })
  })

export const updateDepartmentProcedure = adminProcedureStandard
  .input(
    z.object({
      departmentId: z.string().min(1),
      name: z.string().min(2).max(200).optional(),
      headName: z.string().max(200).nullable().optional(),
    }),
  )
  .handler(async ({ input }) =>
    updateDepartment(input.departmentId, {
      name: input.name,
      headName: input.headName,
    }),
  )

export const assignDepartmentHeadProcedure = adminProcedureStandard
  .input(
    z
      .object({
        departmentId: z.string().min(1),
        userId: z.string().min(1).optional(),
        headEmail: z.string().email().optional(),
        headName: z.string().min(2).max(120).optional(),
      })
      .refine(
        (value) => Boolean(value.userId || (value.headEmail && value.headName)),
        { message: "Provide either userId or headEmail + headName" },
      ),
  )
  .handler(async ({ input, context }) => {
    if (context.user.role !== "university_admin" && context.user.role !== "super_admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only university admins can assign department heads",
      })
    }

    const [dept] = await db
      .select({ universityId: department.universityId })
      .from(department)
      .where(eq(department.id, input.departmentId))
      .limit(1)

    if (!dept) {
      throw new ORPCError("NOT_FOUND", {
        message: "Department not found",
      })
    }

    if (context.user.role !== "super_admin") {
      const universityId = context.user.universityId
      if (!universityId || dept.universityId !== universityId) {
        throw new ORPCError("FORBIDDEN", {
          message: "Department does not belong to your university",
        })
      }
    }

    if (input.userId) {
      return assignDepartmentHead(input.departmentId, input.userId)
    }

    return assignDepartmentHeadByEmail({
      departmentId: input.departmentId,
      headEmail: input.headEmail!,
      headName: input.headName!,
    })
  })

export const bulkCreateDepartmentsProcedure = adminProcedureStandard
  .input(bulkCreateDepartmentsSchema)
  .handler(async ({ input, context }) => {
    if (context.user.role !== "university_admin" && context.user.role !== "super_admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "Only university admins can bulk-create departments",
      })
    }

    const universityId = context.user.universityId
    if (!universityId) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Admin must belong to a university",
      })
    }

    const [uni] = await db
      .select({ name: university.name })
      .from(university)
      .where(eq(university.id, universityId))
      .limit(1)

    if (!uni) {
      throw new ORPCError("NOT_FOUND", {
        message: "University not found",
      })
    }

    return bulkCreateDepartmentsWithHeads(universityId, uni.name, input.rows)
  })

export const syncDepartmentSkillsProcedure = adminProcedureStandard
  .input(
    z.object({
      departmentId: z.string().min(1),
      skillTagIds: z.array(z.string().min(1)).max(200),
    }),
  )
  .handler(async ({ input, context }) => {
    if (context.user.role !== "super_admin") {
      const universityId = context.user.universityId
      if (!universityId) {
        throw new ORPCError("FORBIDDEN", {
          message: "Admin must belong to a university",
        })
      }

      const [dept] = await db
        .select({ universityId: department.universityId })
        .from(department)
        .where(eq(department.id, input.departmentId))
        .limit(1)

      if (!dept || dept.universityId !== universityId) {
        throw new ORPCError("FORBIDDEN", {
          message: "Department does not belong to your university",
        })
      }
    }

    return syncDepartmentSkills(input.departmentId, input.skillTagIds)
  })

export const getDepartmentSkillsProcedure = authedProcedureGenerous
  .input(z.object({ departmentId: z.string().min(1) }))
  .handler(async ({ input }) => getDepartmentSkillIds(input.departmentId))
