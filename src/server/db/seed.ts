import { randomUUID } from "node:crypto"

import { eq } from "drizzle-orm"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

import { logger } from "@/server/logging"
import * as schema from "./schema"
import { university, universityDomain } from "./schema/universities"
import { user, account } from "./schema/auth"
import { skillTag } from "./schema/skills"

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

type SeedUniversity = { name: string; domains: string[] }

const SEED_UNIVERSITIES: SeedUniversity[] = [
  {
    name: "University Of Constantine 2",
    domains: ["univ-constantine2.dz"],
  },
]

async function seedUniversity(
  db: ReturnType<typeof drizzle>,
  entry: SeedUniversity,
) {
  const [existing] = await db
    .select({ id: university.id })
    .from(university)
    .where(eq(university.name, entry.name))
    .limit(1)

  const universityId = existing?.id ?? randomUUID()

  if (!existing) {
    await db.insert(university).values({ id: universityId, name: entry.name })
    logger.info({ event: "university_seeded", name: entry.name })
  }

  for (const domain of entry.domains) {
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
      })
      logger.info({ event: "domain_approved", domain })
      continue
    }

    if (existingDomain.status !== "approved") {
      await db
        .update(universityDomain)
        .set({
          status: "approved",
          universityId,
        })
        .where(eq(universityDomain.id, existingDomain.id))
      logger.info({ event: "domain_updated", domain, status: "approved" })
    }
  }
}

/* ── Skill tag data ── */

const SEED_SKILL_TAGS: { name: string; category: string }[] = [
  // Frontend
  { name: "React", category: "frontend" },
  { name: "Angular", category: "frontend" },
  { name: "Vue.js", category: "frontend" },
  { name: "HTML/CSS", category: "frontend" },
  { name: "TypeScript", category: "frontend" },
  { name: "JavaScript", category: "frontend" },
  { name: "Tailwind CSS", category: "frontend" },

  // Backend
  { name: "Node.js", category: "backend" },
  { name: "Express", category: "backend" },
  { name: "Django", category: "backend" },
  { name: "Flask", category: "backend" },
  { name: "Spring Boot", category: "backend" },
  { name: "Laravel", category: "backend" },
  { name: "FastAPI", category: "backend" },

  // Languages
  { name: "Python", category: "languages" },
  { name: "Java", category: "languages" },
  { name: "C/C++", category: "languages" },
  { name: "PHP", category: "languages" },
  { name: "Go", category: "languages" },
  { name: "Rust", category: "languages" },
  { name: "C#", category: "languages" },

  // Database
  { name: "PostgreSQL", category: "database" },
  { name: "MySQL", category: "database" },
  { name: "MongoDB", category: "database" },
  { name: "Redis", category: "database" },
  { name: "SQLite", category: "database" },

  // DevOps
  { name: "Docker", category: "devops" },
  { name: "Kubernetes", category: "devops" },
  { name: "Git", category: "devops" },
  { name: "CI/CD", category: "devops" },
  { name: "Linux", category: "devops" },
  { name: "AWS", category: "devops" },

  // Mobile
  { name: "React Native", category: "mobile" },
  { name: "Flutter", category: "mobile" },
  { name: "Swift", category: "mobile" },
  { name: "Kotlin", category: "mobile" },

  // Data & AI
  { name: "Machine Learning", category: "data_ai" },
  { name: "Data Science", category: "data_ai" },
  { name: "TensorFlow", category: "data_ai" },
  { name: "PyTorch", category: "data_ai" },

  // Other
  { name: "REST API", category: "other" },
  { name: "GraphQL", category: "other" },
  { name: "Microservices", category: "other" },
  { name: "Agile/Scrum", category: "other" },
]

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function seedSkillTags(db: ReturnType<typeof drizzle>) {
  for (const entry of SEED_SKILL_TAGS) {
    const slug = toSlug(entry.name)
    const [existing] = await db
      .select({ id: skillTag.id })
      .from(skillTag)
      .where(eq(skillTag.slug, slug))
      .limit(1)

    if (!existing) {
      await db.insert(skillTag).values({
        id: randomUUID(),
        name: entry.name,
        slug,
        category: entry.category,
      })
      logger.info({ event: "skill_tag_seeded", name: entry.name })
    }
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required")
  }

  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client, { schema })

  // ── Seed built-in universities ──
  for (const entry of SEED_UNIVERSITIES) {
    await seedUniversity(db, entry)
  }

  // ── Seed env-based university (optional extra) ──
  const envDomains = parseDomains(process.env.SEED_UNIVERSITY_DOMAINS)
  if (envDomains.length > 0) {
    const envName =
      process.env.SEED_UNIVERSITY_NAME?.trim() || "Example University"
    await seedUniversity(db, { name: envName, domains: envDomains })
  }

  // ── Seed skill tags ──
  await seedSkillTags(db)

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

      logger.info({ event: "admin_seeded", role: "super_admin" })
    } else {
      logger.info({ event: "admin_exists", role: "super_admin" })
    }
  }

  await client.end({ timeout: 5 })
}

// Only run main if this file is executed directly (not imported)
if (import.meta.main) {
  main()
    .then(() => {
      logger.info({ event: "seed_complete" })
    })
    .catch((err) => {
      logger.error({ err, event: "seed_failed" }, "Database seeding failed")
      process.exitCode = 1
    })
}
