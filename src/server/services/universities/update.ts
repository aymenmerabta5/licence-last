import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { university } from "@/server/db/schema/universities"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/universities/update")

export interface UpdateUniversityInput {
  name?: string
  abbreviation?: string | null
  phone?: string | null
  wilayaCode?: number | null
  city?: string | null
  address?: string | null
}

/**
 * Update editable university profile fields.
 * Pure business logic — no auth checks here.
 */
export async function updateUniversity(
  universityId: string,
  data: UpdateUniversityInput,
) {
  const updates: Record<string, string | number | null> = {}

  if (data.name !== undefined) updates.name = data.name.trim()
  if (data.abbreviation !== undefined) {
    updates.abbreviation = data.abbreviation?.trim() || null
  }
  if (data.phone !== undefined) updates.phone = data.phone?.trim() || null
  if (data.wilayaCode !== undefined) updates.wilayaCode = data.wilayaCode
  if (data.city !== undefined) updates.city = data.city?.trim() || null
  if (data.address !== undefined) updates.address = data.address?.trim() || null

  if (Object.keys(updates).length === 0) {
    return { universityId }
  }

  log.info({ universityId, updates }, "Updating university profile")

  const [updated] = await db
    .update(university)
    .set(updates)
    .where(eq(university.id, universityId))
    .returning({ universityId: university.id })

  if (!updated) {
    throw new ServiceError("UNIVERSITY_NOT_FOUND", "University not found")
  }

  log.info({ universityId, event: "university_updated" }, "University profile updated")
  return { universityId: updated.universityId }
}
