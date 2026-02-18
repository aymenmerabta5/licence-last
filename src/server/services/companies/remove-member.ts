import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { companyMember } from "@/server/db/schema/companies"
import { createNotification } from "@/server/services/notifications/create"
import { ServiceError } from "@/server/services/errors"

interface RemoveCompanyMemberInput {
  companyId: string
  memberUserId: string
  removedByUserId: string
}

export async function removeCompanyMember(input: RemoveCompanyMemberInput) {
  if (input.memberUserId === input.removedByUserId) {
    throw new ServiceError(
      "COMPANY_MEMBER_CANNOT_REMOVE_SELF",
      "You cannot remove yourself from the company",
    )
  }

  const [targetMembership] = await db
    .select({
      userId: companyMember.userId,
      role: companyMember.role,
    })
    .from(companyMember)
    .where(
      and(
        eq(companyMember.companyId, input.companyId),
        eq(companyMember.userId, input.memberUserId),
      ),
    )
    .limit(1)

  if (!targetMembership) {
    throw new ServiceError("COMPANY_MEMBER_NOT_FOUND", "Company member not found")
  }

  if (targetMembership.role === "owner") {
    throw new ServiceError(
      "COMPANY_MEMBER_OWNER_IMMUTABLE",
      "Company owner cannot be removed",
    )
  }

  await db
    .delete(companyMember)
    .where(
      and(
        eq(companyMember.companyId, input.companyId),
        eq(companyMember.userId, input.memberUserId),
      ),
    )

  await createNotification({
    userId: input.memberUserId,
    type: "company_member_removed",
    payload: { companyId: input.companyId },
  })

  return {
    removed: true,
    userId: input.memberUserId,
  }
}
