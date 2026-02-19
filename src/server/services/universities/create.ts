import "server-only"

import { randomUUID } from "node:crypto"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/universities/create")

import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
import { university, universityDomain } from "@/server/db/schema/universities"

/**
 * Create a new university and assign the admin user.
 * Sets university status to "pending" — requires super_admin approval.
 */
export async function createUniversity(
  data: {
    name: string
    abbreviation?: string
    phone?: string
    wilayaCode?: number
    city?: string
    address?: string
    domains: string[]
    departments?: { name: string }[]
  },
  userId: string,
) {
  const universityId = randomUUID()
  log.info({ userId, universityId }, "Creating university")

  await db.transaction(async (tx) => {
    await tx.insert(university).values({
      id: universityId,
      name: data.name,
      abbreviation: data.abbreviation || null,
      phone: data.phone || null,
      wilayaCode: data.wilayaCode ?? null,
      city: data.city || null,
      address: data.address || null,
      status: "pending",
    })

    // Insert domains with pending status
    if (data.domains.length > 0) {
      await tx.insert(universityDomain).values(
        data.domains.map((domain) => ({
          id: randomUUID(),
          universityId,
          domain: domain.toLowerCase().trim(),
          status: "pending" as const,
        })),
      )
    }

    // Insert departments
    if (data.departments && data.departments.length > 0) {
      await tx.insert(department).values(
        data.departments.map((dept) => ({
          id: randomUUID(),
          universityId,
          name: dept.name.trim(),
        })),
      )
    }

    // Link user to university and mark onboarding complete
    await tx
      .update(user)
      .set({ universityId, onboardingCompleted: true })
      .where(eq(user.id, userId))
  })

  log.info(
    { universityId, event: "university_created" },
    "University created successfully",
  )
  return { universityId }
}
