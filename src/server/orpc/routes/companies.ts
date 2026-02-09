import { z } from "zod"
import { ORPCError } from "@orpc/server"

import {
  authedProcedure,
  adminProcedure,
  companyAdminProcedure,
} from "../middleware"
import { listCompanies } from "@/server/services/companies/list"
import { getCompanyById } from "@/server/services/companies/get"
import { createCompany } from "@/server/services/companies/create"
import { updateCompany } from "@/server/services/companies/update"
import { approveCompany } from "@/server/services/companies/approve"
import { rejectCompany } from "@/server/services/companies/reject"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { eq } from "drizzle-orm"

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
  .handler(async ({ input, context }) => {
    const company = await getCompanyById(input.companyId)
    if (!company) return null

    const isAdmin =
      context.user.role === "admin" || context.user.role === "super_admin"

    // Check if user is a member of this company
    let isOwner = false
    if (context.user.role === "company_admin") {
      const [membership] = await db
        .select()
        .from(companyMember)
        .where(eq(companyMember.userId, context.user.id))
        .limit(1)
      isOwner = membership?.companyId === company.id
    }

    // Admins and owners see full data
    if (isAdmin || isOwner) {
      return company
    }

    // Non-approved companies are not visible to regular users
    if (company.status !== "approved") {
      throw new ORPCError("FORBIDDEN", {
        message: "Company not found",
      })
    }

    // Regular users see only public fields (strip sensitive data)
    return {
      id: company.id,
      name: company.name,
      slug: company.slug,
      status: company.status,
      description: company.description,
      logoUrl: company.logoUrl,
      websiteUrl: company.websiteUrl,
      wilayaCode: company.wilayaCode,
      createdAt: company.createdAt,
      // Sensitive fields omitted: phone, contactEmail, address,
      // representativeName, rejectionReason
    }
  })

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

export const updateCompanyProcedure = companyAdminProcedure
  .input(
    z.object({
      description: z.string().optional(),
      logoUrl: z.string().url().optional().or(z.literal("")),
      websiteUrl: z.string().url().optional().or(z.literal("")),
      phone: z.string().optional(),
      contactEmail: z.string().email().optional().or(z.literal("")),
      representativeName: z.string().optional(),
      wilayaCode: z.coerce.number().int().min(1).max(58).optional(),
      address: z.string().optional(),
    }),
  )
  .handler(async ({ input, context }) =>
    updateCompany(context.companyMembership.companyId, input),
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
