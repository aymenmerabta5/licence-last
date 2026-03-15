import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { universityMember } from "@/server/db/schema/university-members"
import { ServiceError } from "@/server/services/errors"

export async function getUniversityMembership(userId: string) {
  const memberships = await db
    .select()
    .from(universityMember)
    .where(eq(universityMember.userId, userId))
    .limit(2)

  if (memberships.length > 1) {
    throw new ServiceError(
      "UNIVERSITY_MEMBERSHIP_CONFLICT",
      "User belongs to multiple university memberships",
    )
  }

  const membership = memberships[0]

  return membership ?? null
}
