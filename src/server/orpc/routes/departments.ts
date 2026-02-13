import "server-only"

import { z } from "zod"

import {
  authedProcedureGenerous,
  adminProcedureStandard,
} from "@/server/orpc/rate-limited-procedures"
import { createDepartment } from "@/server/services/departments/create"
import { listDepartments } from "@/server/services/departments/list"
import { updateDepartment } from "@/server/services/departments/update"
import { assignDepartmentHead } from "@/server/services/departments/assign-head"

/* ── List Departments (any authed user — for dropdowns) ── */

export const listDepartmentsProcedure = authedProcedureGenerous
  .input(z.object({ universityId: z.string().min(1) }))
  .handler(async ({ input }) => listDepartments(input.universityId))

/* ── Create Department (university admin) ── */

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

/* ── Update Department (university admin) ── */

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

/* ── Assign Department Head (university admin) ── */

export const assignDepartmentHeadProcedure = adminProcedureStandard
  .input(
    z.object({
      departmentId: z.string().min(1),
      userId: z.string().min(1),
    }),
  )
  .handler(async ({ input }) =>
    assignDepartmentHead(input.departmentId, input.userId),
  )
