import { z } from "zod"

import {
  authedProcedure,
  adminProcedure,
  companyAdminProcedure,
} from "../middleware"
import { listCompanies } from "@/server/services/companies/list"
import { getCompanyById } from "@/server/services/companies/get"
import { createCompany } from "@/server/services/companies/create"
import { approveCompany } from "@/server/services/companies/approve"
import { rejectCompany } from "@/server/services/companies/reject"

/* ── Reads ── */

export const listCompaniesProcedure = authedProcedure
  .input(
    z
      .object({
        status: z
          .enum(["pending", "approved", "rejected", "suspended"])
          .optional(),
      })
      .optional(),
  )
  .handler(async ({ input, context }) => {
    const isAdmin = context.user.role === "admin" || context.user.role === "super_admin"
    const effectiveStatus = isAdmin ? input?.status : "approved"
    return listCompanies(effectiveStatus)
  })

export const getCompanyByIdProcedure = authedProcedure
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input }) => getCompanyById(input.companyId))

/* ── Mutations ── */

export const createCompanyProcedure = companyAdminProcedure
  .input(
    z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      websiteUrl: z.string().url().optional().or(z.literal("")),
      wilayaCode: z.coerce.number().int().min(1).max(58),
      address: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) =>
    createCompany(input, context.user.id),
  )

export const approveCompanyProcedure = adminProcedure
  .input(z.object({ companyId: z.string().min(1) }))
  .handler(async ({ input, context }) =>
    approveCompany(input.companyId, context.user.id),
  )

export const rejectCompanyProcedure = adminProcedure
  .input(
    z.object({
      companyId: z.string().min(1),
      reason: z.string().min(1),
    }),
  )
  .handler(async ({ input }) =>
    rejectCompany(input.companyId, input.reason),
  )
