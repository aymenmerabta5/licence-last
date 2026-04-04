import "server-only"

import { eq } from "drizzle-orm"
import { getEffectiveRole } from "@/lib/effective-role"
import type { AssistantRole, ToolAuthContext } from "@/server/ai/types"
import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { universityMember } from "@/server/db/schema/university-memberships"

const VALID_ROLES = new Set<AssistantRole>([
  "student",
  "company_admin",
  "university_admin",
  "super_admin",
])

/**
 * Resolves auth context needed by data-retrieval tools.
 * Called once per chat request — result is passed to tool factories.
 */
export async function resolveToolAuthContext(session: {
  user: {
    id: string
    role: string | null | undefined
    universityId?: string | null
    departmentId?: string | null
  }
}): Promise<ToolAuthContext | null> {
  const rawRole = session.user.role
  if (!rawRole) return null

  const ctx: ToolAuthContext = {
    userId: session.user.id,
    role: "student",
    companyId: null,
    universityId: session.user.universityId ?? null,
    departmentId: null,
    universityMembershipRole: null,
  }

  if (rawRole === "company_admin") {
    const memberships = await db
      .select({ companyId: companyMember.companyId })
      .from(companyMember)
      .where(eq(companyMember.userId, session.user.id))
      .limit(2)

    if (memberships.length > 1) {
      throw new Error("Multiple company memberships found for user")
    }

    const membership = memberships[0]
    ctx.companyId = membership?.companyId ?? null
  }

  if (rawRole === "university_admin" || rawRole === "dept_head") {
    const memberships = await db
      .select({
        departmentId: universityMember.departmentId,
        universityId: universityMember.universityId,
        role: universityMember.role,
      })
      .from(universityMember)
      .where(eq(universityMember.userId, session.user.id))
      .limit(2)

    if (memberships.length > 1) {
      throw new Error("Multiple university memberships found for user")
    }

    const membership = memberships[0]
    ctx.departmentId = membership?.departmentId ?? null
    ctx.universityId = membership?.universityId ?? ctx.universityId
    ctx.universityMembershipRole =
      membership?.role === "department_head" ? membership.role : null
  }

  const resolvedRole = getEffectiveRole({ role: rawRole })

  if (!VALID_ROLES.has(resolvedRole)) {
    return null
  }

  ctx.role = resolvedRole

  return ctx
}
