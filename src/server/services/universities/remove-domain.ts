import "server-only"

import { and, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { universityDomain } from "@/server/db/schema/universities"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/universities/remove-domain")

/**
 * Remove a domain from a university.
 * Ensures the domain actually belongs to the specified university.
 */
export async function removeUniversityDomain(
  universityId: string,
  domainId: string,
) {
  log.info({ universityId, domainId }, "Removing university domain")

  const [existing] = await db
    .select({ id: universityDomain.id })
    .from(universityDomain)
    .where(
      and(
        eq(universityDomain.id, domainId),
        eq(universityDomain.universityId, universityId),
      ),
    )
    .limit(1)

  if (!existing) {
    throw new ServiceError(
      "DOMAIN_NOT_FOUND",
      "Domain not found for this university",
    )
  }

  await db
    .delete(universityDomain)
    .where(eq(universityDomain.id, domainId))

  log.info({ universityId, domainId }, "University domain removed")

  return { success: true }
}
