import "server-only"

import { randomUUID } from "node:crypto"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { company, companyMember } from "@/server/db/schema/companies"
import { user } from "@/server/db/schema/auth"

/**
 * Generate a URL-safe slug from a company name.
 * Appends a short random suffix to avoid collisions.
 */
function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  const suffix = randomUUID().slice(0, 6)
  return `${base}-${suffix}`
}

/**
 * Create a new company and assign the user as owner.
 * Pure business logic — no auth checks here.
 */
export async function createCompany(
  data: {
    name: string
    description?: string
    websiteUrl?: string
    wilayaCode: number
    address?: string
  },
  userId: string,
) {
  const companyId = randomUUID()
  const slug = generateSlug(data.name)

  await db.transaction(async (tx) => {
    await tx.insert(company).values({
      id: companyId,
      name: data.name,
      slug,
      description: data.description || null,
      websiteUrl: data.websiteUrl || null,
      wilayaCode: data.wilayaCode,
      address: data.address || null,
      status: "pending",
    })

    await tx.insert(companyMember).values({
      companyId,
      userId,
      role: "owner",
    })

    await tx
      .update(user)
      .set({ onboardingCompleted: true })
      .where(eq(user.id, userId))
  })

  return { companyId, slug }
}
