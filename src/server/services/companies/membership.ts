import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"

export async function getCompanyMembership(userId: string) {
  const [membership] = await db
    .select()
    .from(companyMember)
    .where(eq(companyMember.userId, userId))
    .limit(1)

  return membership ?? null
}
