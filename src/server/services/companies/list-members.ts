import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { companyMember } from "@/server/db/schema/companies"

export interface CompanyMemberListItem {
  userId: string
  email: string
  name: string | null
  role: "owner" | "recruiter"
  joinedAt: Date
}

export async function listCompanyMembers(
  companyId: string,
): Promise<CompanyMemberListItem[]> {
  const rows = await db
    .select({
      userId: companyMember.userId,
      email: user.email,
      name: user.name,
      role: companyMember.role,
      joinedAt: companyMember.createdAt,
    })
    .from(companyMember)
    .innerJoin(user, eq(companyMember.userId, user.id))
    .where(eq(companyMember.companyId, companyId))

  return rows.sort((a, b) => {
    if (a.role === b.role) {
      return a.joinedAt.getTime() - b.joinedAt.getTime()
    }
    return a.role === "owner" ? -1 : 1
  })
}
