import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { companyMember } from "@/server/db/schema/companies"
import type { ToolAuthContext, AssistantRole } from "./types"

const VALID_ROLES = new Set<AssistantRole>([
  "student",
  "company_admin",
  "university_admin",
  "dept_head",
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
  }
}): Promise<ToolAuthContext | null> {
  const role = session.user.role as AssistantRole | null
  if (!role || !VALID_ROLES.has(role)) return null

  const ctx: ToolAuthContext = {
    userId: session.user.id,
    role,
    companyId: null,
    universityId: session.user.universityId ?? null,
    departmentId: null,
  }

  // Resolve companyId for company_admin
  if (role === "company_admin") {
    const [membership] = await db
      .select({ companyId: companyMember.companyId })
      .from(companyMember)
      .where(eq(companyMember.userId, session.user.id))
      .limit(1)

    ctx.companyId = membership?.companyId ?? null
  }

  // Resolve departmentId for dept_head
  if (role === "dept_head") {
    const [row] = await db
      .select({
        departmentId: user.departmentId,
        universityId: user.universityId,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    ctx.departmentId = row?.departmentId ?? null
    ctx.universityId = row?.universityId ?? ctx.universityId
  }

  return ctx
}
