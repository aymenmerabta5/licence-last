import "server-only"

import { eq } from "drizzle-orm"
import { z } from "zod"

import { bulkCreateDepartmentsSchema } from "@/lib/schemas/department"
import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"
import { university } from "@/server/db/schema/universities"
import {
  adminProcedureStandard,
  authedProcedureGenerous,
} from "@/server/orpc/rate-limited-procedures"
import {
  createServiceORPCError,
  throwCodedORPCError,
} from "@/server/orpc/utils/service-error"
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

interface DepartmentAdminContext {
  user: {
    role: string | null | undefined
    universityId?: string | null
  }
}

function assertDepartmentAdminRole(role: string | null | undefined) {
  if (role !== "university_admin" && role !== "super_admin") {
    throwCodedORPCError("FORBIDDEN", "DEPARTMENT_ADMIN_ACCESS_REQUIRED", {
      message: "Only university admins can manage departments",
    })
  }
}

function resolveTargetUniversityId(args: {
  context: DepartmentAdminContext
  inputUniversityId?: string
}) {
  const { context, inputUniversityId } = args
  assertDepartmentAdminRole(context.user.role)

  if (context.user.role === "super_admin") {
    const universityId = inputUniversityId ?? context.user.universityId ?? null
    if (!universityId) {
      throwCodedORPCError("BAD_REQUEST", "UNIVERSITY_REQUIRED_FOR_SUPER_ADMIN_ACTIONS", {
        message: "University is required for super admin actions",
      })
    }
    return universityId
  }

  const universityId = context.user.universityId
  if (!universityId) {
    throwCodedORPCError("BAD_REQUEST", "ADMIN_MUST_BELONG_TO_UNIVERSITY", {
      message: "Admin must belong to a university",
    })
  }

  if (inputUniversityId && inputUniversityId !== universityId) {
    throwCodedORPCError("FORBIDDEN", "UNIVERSITY_SCOPE_FORBIDDEN", {
      message: "University admins can only manage their own university",
    })
  }

  return universityId
}

async function assertCanManageDepartment(
  departmentId: string,
  context: DepartmentAdminContext,
) {
  assertDepartmentAdminRole(context.user.role)

  const [dept] = await db
    .select({ universityId: department.universityId })
    .from(department)
    .where(eq(department.id, departmentId))
    .limit(1)

  if (!dept) {
    throwCodedORPCError("NOT_FOUND", "DEPARTMENT_NOT_FOUND", {
      message: "Department not found",
    })
  }

  if (context.user.role !== "super_admin") {
    const universityId = context.user.universityId
    if (!universityId || dept.universityId !== universityId) {
      throwCodedORPCError("FORBIDDEN", "DEPARTMENT_SCOPE_FORBIDDEN", {
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
      universityId: z.string().min(1).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const universityId = resolveTargetUniversityId({
      context,
      inputUniversityId: input.universityId,
    })

    try {
      return await createDepartment({
        universityId,
        name: input.name,
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
    }),
  )
  .handler(async ({ input, context }) => {
    await assertCanManageDepartment(input.departmentId, context)

    try {
      return await updateDepartment(input.departmentId, {
        name: input.name,
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
      })
      .refine((value) => Boolean(value.userId || value.headEmail), {
        message: "DEPARTMENT_HEAD_TARGET_REQUIRED",
      }),
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
      })
    } catch (error) {
      createServiceORPCError(error, {
        codeMap: {
          DEPARTMENT_NOT_FOUND: "NOT_FOUND",
          USER_NOT_FOUND: "NOT_FOUND",
          USER_INELIGIBLE_FOR_DEPARTMENT_HEAD: "FORBIDDEN",
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
  .input(
    bulkCreateDepartmentsSchema.extend({
      universityId: z.string().min(1).optional(),
    }),
  )
  .handler(async ({ input, context }) => {
    const universityId = resolveTargetUniversityId({
      context,
      inputUniversityId: input.universityId,
    })

    const [uni] = await db
      .select({ name: university.name })
      .from(university)
      .where(eq(university.id, universityId))
      .limit(1)

    if (!uni) {
      throwCodedORPCError("NOT_FOUND", "UNIVERSITY_NOT_FOUND", {
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
    await assertCanManageDepartment(input.departmentId, context)
    return syncDepartmentSkills(input.departmentId, input.skillTagIds)
  })

export const getDepartmentSkillsProcedure = authedProcedureGenerous
  .input(z.object({ departmentId: z.string().min(1) }))
  .handler(async ({ input }) => getDepartmentSkillIds(input.departmentId))
