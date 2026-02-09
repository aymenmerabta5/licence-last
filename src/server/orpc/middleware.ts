import { os, ORPCError } from "@orpc/server"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"

/** Public — no auth required. */
export const publicProcedure = os

/** Authenticated — requires a valid session. */
export const authedProcedure = os.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new ORPCError("UNAUTHORIZED")
  }

  return next({ context: { session: session.session, user: session.user } })
})

/** Admin — requires admin or super_admin role. */
export const adminProcedure = authedProcedure.use(
  async ({ context, next }) => {
    if (context.user.role !== "admin" && context.user.role !== "super_admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "Admin access required",
      })
    }
    return next({ context })
  },
)

/** Super admin only. */
export const superAdminProcedure = authedProcedure.use(
  async ({ context, next }) => {
    if (context.user.role !== "super_admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "Super admin access required",
      })
    }
    return next({ context })
  },
)

/** Company admin — injects company membership into context. */
export const companyAdminProcedure = authedProcedure.use(
  async ({ context, next }) => {
    if (context.user.role !== "company_admin") {
      throw new ORPCError("FORBIDDEN", {
        message: "Company admin access required",
      })
    }

    const [membership] = await db
      .select()
      .from(companyMember)
      .where(eq(companyMember.userId, context.user.id))
      .limit(1)

    return next({ context: { ...context, companyMembership: membership ?? null } })
  },
)
