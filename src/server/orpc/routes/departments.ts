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
import { deleteDepartment } from "@/server/services/departments/delete"
import { getDepartmentSkillIds } from "@/server/services/departments/get-skills"
import { listDepartments } from "@/server/services/departments/list"
import { syncDepartmentSkills } from "@/server/services/departments/sync-skills"
import { unassignDepartmentHead } from "@/server/services/departments/unassign-head"
import { updateDepartment } from "@/server/services/departments/update"
import { createServiceORPCError } from "@/server/orpc/utils/service-error"

interface DepartmentAdminContext {
  user: {
    role: string | null | undefined
    universityId?: string | null
  }
}

async function assertCanManageDepartment(
  departmentId: string,
  context: DepartmentAdminContext,
) {
  if (context.user.role !== "university_admin" && context.user.role !== "super_admin") {
    throw new ORPCError("FORBIDDEN", {
      message: "Only university admins can manage departments",
    })
  }

  const [dept] = await db
    .select({ universityId: department.universityId })
    .from(department)
    .where(eq(department.id, departmentId))
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
}

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
      throw new ORPCError("BAD_REQUEST", {
        message: "Admin must belong to a university",
      })
    }

    try {
      return await createDepartment({
        universityId,
        name: input.name,
        headName: input.headName,
      })
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          DEPARTMENT_NAME_EXISTS: "CONFLICT",
        },
        fallbackMessage: "Failed to create department",
      })
    }
  })

export const updateDepartmentProcedure = adminProcedureStandard
  .input(
    z.object({
      departmentId: z.string().min(1),
      name: z.string().min(2).max(200).optional(),
      headName: z.string().max(200).nullable().optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    await assertCanManageDepartment(input.departmentId, context)

    try {
      return await updateDepartment(input.departmentId, {
        name: input.name,
        headName: input.headName,
      })
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          DEPARTMENT_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to update department",
      })
    }
  })

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
    await assertCanManageDepartment(input.departmentId, context)

    try {
      if (input.userId) {
        return await assignDepartmentHead(input.departmentId, input.userId)
      }

      return await assignDepartmentHeadByEmail({
        departmentId: input.departmentId,
        headEmail: input.headEmail!,
        headName: input.headName!,
      })
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          DEPARTMENT_NOT_FOUND: "NOT_FOUND",
          USER_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to assign department head",
      })
    }
  })

export const unassignDepartmentHeadProcedure = adminProcedureStandard
  .input(
    z.object({
      departmentId: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    await assertCanManageDepartment(input.departmentId, context)
    try {
      return await unassignDepartmentHead(input.departmentId)
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          DEPARTMENT_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to unassign department head",
      })
    }
  })

export const deleteDepartmentProcedure = adminProcedureStandard
  .input(
    z.object({
      departmentId: z.string().min(1),
    }),
  )
  .handler(async ({ input, context }) => {
    await assertCanManageDepartment(input.departmentId, context)
    try {
      return await deleteDepartment(input.departmentId)
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          DEPARTMENT_NOT_FOUND: "NOT_FOUND",
        },
        fallbackMessage: "Failed to delete department",
      })
    }
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
