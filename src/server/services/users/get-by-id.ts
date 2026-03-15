import "server-only"

import { eq } from "drizzle-orm"

import { deriveEffectiveUserRole } from "@/lib/effective-role"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { getUniversityMembership } from "@/server/services/universities/membership"

export interface UserPublicRecord {
  id: string
  name: string | null
  email: string
  role: string | null
  effectiveRole?: string | null
  rawRole?: string | null
  image: string | null
  universityId: string | null
  createdAt: Date
}

export async function getUserById(
  userId: string,
): Promise<UserPublicRecord | null> {
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      universityId: user.universityId,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!row) {
    return null
  }

  const membership =
    row.role === "university_admin" || row.role === "dept_head"
      ? await getUniversityMembership(userId)
      : null

  const effectiveRole =
    deriveEffectiveUserRole({
      userRole: row.role,
      universityMembershipRole:
        membership?.role ??
        (row.role === "dept_head" ? "department_head" : null),
    }) ?? row.role

  return {
    ...row,
    rawRole: row.role,
    role: effectiveRole,
    effectiveRole,
    universityId: membership?.universityId ?? row.universityId,
  }
}
