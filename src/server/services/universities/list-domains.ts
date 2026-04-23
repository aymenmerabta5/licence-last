import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { universityDomain } from "@/server/db/schema/universities"

export interface UniversityDomain {
  id: string
  domain: string
  status: string
  createdAt: Date
}

/**
 * List all domains for a given university.
 */
export async function listUniversityDomains(
  universityId: string,
): Promise<UniversityDomain[]> {
  const rows = await db
    .select({
      id: universityDomain.id,
      domain: universityDomain.domain,
      status: universityDomain.status,
      createdAt: universityDomain.createdAt,
    })
    .from(universityDomain)
    .where(eq(universityDomain.universityId, universityId))

  return rows
}
