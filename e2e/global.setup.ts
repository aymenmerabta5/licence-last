import { test as setup } from "@playwright/test"
import { randomUUID } from "crypto"
import { execSync } from "child_process"
import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"

import * as schema from "../src/server/db/schema"
import { user, account } from "../src/server/db/schema/auth"
import { company, companyMember } from "../src/server/db/schema/companies"
import { studentProfile } from "../src/server/db/schema/students"
import { university } from "../src/server/db/schema/universities"

// Test credentials for E2E tests - these match the auth fixtures
const TEST_USERS = {
  student: {
    email: "test.student@example.com",
    password: "TestPassword123!",
    name: "Test Student",
  },
  company: {
    email: "test.company@example.com",
    password: "TestPassword123!",
    name: "Test Company Admin",
  },
  admin: {
    email: "test.admin@example.com",
    password: "TestPassword123!",
    name: "Test Admin",
  },
}

/**
 * Hash password using Bun's built-in bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  })
}

/**
 * Global setup for E2E tests
 * - Resets the database
 * - Seeds required test data (universities, skill tags)
 * - Creates test users for each role
 */
setup("setup test database", async () => {
  console.info("\n🧪 Setting up E2E test environment...\n")

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for E2E tests")
  }

  const client = postgres(databaseUrl, { max: 1 })
  const db = drizzle(client, { schema })

  try {
    // ─────────────────────────────────────────────────────────
    // STEP 1: Reset Database
    // ─────────────────────────────────────────────────────────
    console.info("📦 Resetting database...")
    
    // Drop all enum types using raw SQL through postgres client
    const typesResult = await client<{ typname: string }[]>`
      SELECT typname
      FROM pg_type
      WHERE typtype = 'e'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `
    
    for (const type of typesResult) {
      await client.unsafe(`DROP TYPE IF EXISTS "${type.typname}" CASCADE;`)
    }

    // Drop all tables
    const tablesResult = await client<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `

    for (const table of tablesResult) {
      await client.unsafe(`DROP TABLE IF EXISTS "${table.table_name}" CASCADE;`)
    }
    
    console.info("✅ Database reset complete\n")

    // ─────────────────────────────────────────────────────────
    // STEP 2: Run Migrations
    // ─────────────────────────────────────────────────────────
    console.info("📊 Running database migrations...")
    
    // We need to run migrations to recreate tables
    // This uses the drizzle-kit migrate command
    try {
      execSync("bun run db:migrate:dev", {
        stdio: "inherit",
        env: process.env,
      })
      console.info("✅ Migrations complete\n")
    } catch (error) {
      console.error("❌ Migration failed:", error)
      throw error
    }

    // ─────────────────────────────────────────────────────────
    // STEP 3: Seed Required Data
    // ─────────────────────────────────────────────────────────
    console.info("🌱 Seeding required data...")

    // Seed test university
    const universityId = randomUUID()
    await db.insert(university).values({
      id: universityId,
      name: "Test University",
    })
    console.info("  ✓ Seeded test university")

    // Seed skill tags
    const skillTags = [
      { name: "React", category: "frontend", slug: "react" },
      { name: "TypeScript", category: "frontend", slug: "typescript" },
      { name: "Node.js", category: "backend", slug: "nodejs" },
      { name: "Python", category: "languages", slug: "python" },
      { name: "PostgreSQL", category: "database", slug: "postgresql" },
    ]

    for (const tag of skillTags) {
      await db.insert(schema.skillTag).values({
        id: randomUUID(),
        ...tag,
      })
    }
    console.info("  ✓ Seeded skill tags")

    // ─────────────────────────────────────────────────────────
    // STEP 4: Create Test Users
    // ─────────────────────────────────────────────────────────
    console.info("\n👥 Creating test users...")

    // Create test student
    const studentId = randomUUID()
    const studentPasswordHash = await hashPassword(TEST_USERS.student.password)
    
    await db.insert(user).values({
      id: studentId,
      email: TEST_USERS.student.email,
      name: TEST_USERS.student.name,
      role: "student",
      emailVerified: true,
      onboardingCompleted: true,
      universityId,
    })
    
    await db.insert(account).values({
      id: randomUUID(),
      accountId: studentId,
      providerId: "credential",
      userId: studentId,
      password: studentPasswordHash,
    })

    // Create student profile
    await db.insert(studentProfile).values({
      userId: studentId,
      wilayaCode: 16,
      bio: "Test student bio for E2E testing",
      phone: "+213555123456",
      githubUrl: "https://github.com/teststudent",
      portfolioUrl: "https://teststudent.dev",
      studentNumber: "STU2024001",
      department: "Computer Science",
      level: "Master 1",
      address: "123 Test Street, Algiers",
    })
    
    console.info("  ✓ Created test student")

    // Create test company admin
    const companyAdminId = randomUUID()
    const companyPasswordHash = await hashPassword(TEST_USERS.company.password)
    
    await db.insert(user).values({
      id: companyAdminId,
      email: TEST_USERS.company.email,
      name: TEST_USERS.company.name,
      role: "company_admin",
      emailVerified: true,
      onboardingCompleted: true,
    })
    
    await db.insert(account).values({
      id: randomUUID(),
      accountId: companyAdminId,
      providerId: "credential",
      userId: companyAdminId,
      password: companyPasswordHash,
    })

    // Create test company
    const companyId = randomUUID()
    await db.insert(company).values({
      id: companyId,
      name: "Test Company",
      slug: "test-company",
      description: "A test company for E2E testing",
      websiteUrl: "https://testcompany.example.com",
      phone: "+213555987654",
      contactEmail: "contact@testcompany.example.com",
      representativeName: "John Doe",
      wilayaCode: 16,
      address: "456 Business District, Algiers",
      status: "approved",
      approvedAt: new Date(),
    })

    // Link company admin to company with correct role type
    await db.insert(companyMember).values({
      companyId,
      userId: companyAdminId,
      role: "owner",
    })
    
    console.info("  ✓ Created test company admin")

    // Create test admin
    const adminId = randomUUID()
    const adminPasswordHash = await hashPassword(TEST_USERS.admin.password)
    
    await db.insert(user).values({
      id: adminId,
      email: TEST_USERS.admin.email,
      name: TEST_USERS.admin.name,
      role: "admin",
      emailVerified: true,
      onboardingCompleted: true,
    })
    
    await db.insert(account).values({
      id: randomUUID(),
      accountId: adminId,
      providerId: "credential",
      userId: adminId,
      password: adminPasswordHash,
    })
    
    console.info("  ✓ Created test admin")

    console.info("\n✅ E2E test environment setup complete!\n")
    console.info("Test Users:")
    console.info(`  Student: ${TEST_USERS.student.email} / ${TEST_USERS.student.password}`)
    console.info(`  Company: ${TEST_USERS.company.email} / ${TEST_USERS.company.password}`)
    console.info(`  Admin:   ${TEST_USERS.admin.email} / ${TEST_USERS.admin.password}`)
    console.info("")

  } catch (error) {
    console.error("\n❌ Failed to setup E2E test environment:", error)
    throw error
  } finally {
    await client.end({ timeout: 5 })
  }
})
