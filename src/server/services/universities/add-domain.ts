import "server-only"

import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { universityDomain } from "@/server/db/schema/universities"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/universities/add-domain")

/**
 * Add a domain to a university.
 * Returns the existing domain if it already belongs to this university.
 * Throws if the domain is already claimed by another university.
 */
export async function addUniversityDomain(
  universityId: string,
  domain: string,
) {
  const normalized = domain.toLowerCase().trim()

  log.info({ universityId, domain: normalized }, "Adding university domain")

  // Check if domain already exists for any university
  const [existing] = await db
    .select({
      id: universityDomain.id,
      universityId: universityDomain.universityId,
    })
    .from(universityDomain)
    .where(eq(universityDomain.domain, normalized))
    .limit(1)

  if (existing) {
    if (existing.universityId === universityId) {
      return { domainId: existing.id, created: false }
    }
    throw new ServiceError(
      "DOMAIN_ALREADY_EXISTS",
      "This domain is already registered to another university",
    )
  }

  const [inserted] = await db
    .insert(universityDomain)
    .values({
      id: randomUUID(),
      universityId,
      domain: normalized,
      status: "pending",
    })
    .returning({ id: universityDomain.id })

  log.info(
    { universityId, domainId: inserted.id, domain: normalized },
    "University domain added",
  )

  return { domainId: inserted.id, created: true }
}
