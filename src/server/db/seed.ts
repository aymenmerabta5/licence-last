import { randomUUID } from "node:crypto"

import { eq } from "drizzle-orm"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

import * as schema from "./schema"
import { university, universityDomain } from "./schema/universities"
import { user, account } from "./schema/auth"

/**
 * Parse a comma-separated string of domains into an array of normalized domains.
 * Trims whitespace and converts to lowercase.
 */
export function parseDomains(input: string | undefined): string[] {
  if (!input) return []
  return input
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required")
  }

  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client, { schema })

  const name = process.env.SEED_UNIVERSITY_NAME?.trim() || "Example University"
  const domains = parseDomains(process.env.SEED_UNIVERSITY_DOMAINS)

  if (domains.length === 0) {
    console.info(
      "Seed skipped: set SEED_UNIVERSITY_DOMAINS (comma-separated), e.g. univ.edu.dz,umc.edu.dz",
    )
    return
  }

  const [existingUniversity] = await db
    .select({ id: university.id })
    .from(university)
    .where(eq(university.name, name))
    .limit(1)

  const universityId = existingUniversity?.id ?? randomUUID()

  if (!existingUniversity) {
    await db.insert(university).values({ id: universityId, name })
    console.info(`Seeded university: ${name}`)
  }

  for (const domain of domains) {
    const [existingDomain] = await db
      .select({ id: universityDomain.id, status: universityDomain.status })
      .from(universityDomain)
      .where(eq(universityDomain.domain, domain))
      .limit(1)

    if (!existingDomain) {
      await db.insert(universityDomain).values({
        id: randomUUID(),
        universityId,
        domain,
        status: "approved",
        requestNote: "seed",
      })
      console.info(`Approved domain: ${domain}`)
      continue
    }

    if (existingDomain.status !== "approved") {
      await db
        .update(universityDomain)
        .set({
          status: "approved",
          universityId,
          reviewedAt: new Date(),
          reviewReason: "seed",
        })
        .where(eq(universityDomain.id, existingDomain.id))
      console.info(`Updated domain to approved: ${domain}`)
    }
  }

  // ── Seed super_admin user ──
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim()
  const adminPassword = process.env.SEED_ADMIN_PASSWORD?.trim()

  if (adminEmail && adminPassword) {
    const [existingAdmin] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, adminEmail))
      .limit(1)

    if (!existingAdmin) {
      const userId = randomUUID()
      // Hash the password using Bun's built-in bcrypt
      const hashedPassword = await Bun.password.hash(adminPassword, {
        algorithm: "bcrypt",
        cost: 10,
      })

      await db.insert(user).values({
        id: userId,
        email: adminEmail,
        name: "Super Admin",
        role: "super_admin",
        emailVerified: true,
        onboardingCompleted: true,
      })

      await db.insert(account).values({
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password: hashedPassword,
      })

      console.info(`Seeded super_admin: ${adminEmail}`)
    } else {
      console.info(`Super admin already exists: ${adminEmail}`)
    }
  }

  await client.end({ timeout: 5 })
}

// Only run main if this file is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.info("Seed complete")
    })
    .catch((err) => {
      console.error(err)
      process.exitCode = 1
    })
}
