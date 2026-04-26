import { execSync } from "node:child_process"
import { randomUUID } from "node:crypto"

import { hashPassword } from "better-auth/crypto"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { getMaintenancePostgresOptions } from "../../src/server/db/postgres-options"

function createNeonCompatibleClient(databaseUrl: string) {
  return postgres(databaseUrl, {
    ...getMaintenancePostgresOptions(),
    connectTimeout: 30,
    idleTimeout: 0,
    max: 1,
  })
}

import * as schema from "../../src/server/db/schema"
import { account, user } from "../../src/server/db/schema/auth"
import { company, companyMember } from "../../src/server/db/schema/companies"
import { department } from "../../src/server/db/schema/departments"
import { studentProfile } from "../../src/server/db/schema/students"
import {
  university,
  universityDomain,
} from "../../src/server/db/schema/universities"
import { TEST_CREDENTIALS, type TestCredential } from "./credentials"
import {
  assertSafeE2EDatabaseResetTarget,
  resolveE2EDatabaseUrl,
} from "./database"
import { generateId } from "./factories"

type E2EApplicationStatus =
  | "applied"
  | "company_accepted"
  | "company_refused"
  | "admin_validated"
  | "admin_rejected"
  | "withdrawn"

type E2EPipelineStage =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected"

interface SeededPrincipalIds {
  studentUserId: string
  companyUserId: string
  adminUserId: string
  companyId: string
}

export interface SeededOfferFixture extends SeededPrincipalIds {
  offerId: string
  offerTitle: string
  searchToken: string
}

export interface SeededApplicationFixture extends SeededOfferFixture {
  applicationId: string
  status: E2EApplicationStatus
  pipelineStage: E2EPipelineStage
}

interface SeedOfferFixtureOptions {
  titlePrefix?: string
}

interface SeedApplicationFixtureOptions extends SeedOfferFixtureOptions {
  status?: E2EApplicationStatus
  pipelineStage?: E2EPipelineStage
  includeCompanyAction?: boolean
  coverLetter?: string
}

export interface SeededPlacementFixture extends SeededApplicationFixture {
  placementId: string
}

export interface SeededDocumentFixture {
  documentId: string
  placementId: string
  type: "agreement" | "certificate"
  status: "pending" | "generated" | "failed"
  verificationCode: string | null
}

interface SeedPlacementFixtureOptions {
  applicationOptions?: SeedApplicationFixtureOptions
  startDate?: Date
  endDate?: Date
  seedAgreement?: boolean
  seedCertificate?: boolean
}

export interface SeedBaseReferenceData {
  universityId: string
  departmentId: string
}

export interface SeededTestUsers {
  studentUserId: string
  companyAdminUserId: string
  universityAdminUserId: string
  deptHeadUserId: string
  superAdminUserId: string
  companyId: string
  universityId: string
  departmentId: string
}

interface SeedTestUsersOptions {
  databaseUrl?: string
  universityId?: string
  departmentId?: string
}

const SKILL_TAGS = [
  { name: "React", category: "frontend", slug: "react" },
  { name: "TypeScript", category: "frontend", slug: "typescript" },
  { name: "Node.js", category: "backend", slug: "nodejs" },
  { name: "Python", category: "languages", slug: "python" },
  { name: "PostgreSQL", category: "database", slug: "postgresql" },
] as const

function resolveDatabaseUrl(databaseUrl?: string): string {
  const resolvedDatabaseUrl = databaseUrl ?? resolveE2EDatabaseUrl()
  assertSafeE2EDatabaseResetTarget(resolvedDatabaseUrl)

  return resolvedDatabaseUrl
}

async function withE2EDatabase<T>(
  run: (sql: ReturnType<typeof postgres>) => Promise<T>,
  databaseUrl?: string,
): Promise<T> {
  const sql = createNeonCompatibleClient(resolveDatabaseUrl(databaseUrl))

  try {
    return await run(sql)
  } finally {
    await sql.end({ timeout: 5 })
  }
}

export async function resetE2EDatabase(databaseUrl?: string): Promise<void> {
  await withE2EDatabase(async (sql) => {
    const typesResult = await sql<{ typname: string }[]>`
      SELECT typname
      FROM pg_type
      WHERE typtype = 'e'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    `

    for (const type of typesResult) {
      await sql.unsafe(`DROP TYPE IF EXISTS "${type.typname}" CASCADE;`)
    }

    const tablesResult = await sql<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `

    for (const table of tablesResult) {
      await sql.unsafe(`DROP TABLE IF EXISTS "${table.table_name}" CASCADE;`)
    }

    await sql`DROP SCHEMA IF EXISTS "drizzle" CASCADE;`
  }, databaseUrl)
}

export function syncE2EDatabaseSchema(databaseUrl?: string): void {
  const targetDatabaseUrl = resolveDatabaseUrl(databaseUrl)

  execSync("bun x --bun drizzle-kit push", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: targetDatabaseUrl,
    },
  })
}

async function seedWithRetry(
  databaseUrl: string,
  maxAttempts = 3,
): Promise<SeedBaseReferenceData> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const client = createNeonCompatibleClient(databaseUrl)
    const db = drizzle(client, { schema })
    try {
      return await seedBaseReferenceDataCore(db)
    } catch (error) {
      console.warn(`Seed attempt ${attempt}/${maxAttempts} failed:`, error)
      if (attempt === maxAttempts) throw error
      const delay = attempt * 2000
      console.info(`Retrying in ${delay}ms...`)
      await new Promise((r) => setTimeout(r, delay))
    } finally {
      await client.end({ timeout: 5 }).catch(() => {})
    }
  }
  throw new Error("Seed failed after all retry attempts")
}

export async function seedBaseReferenceData(
  databaseUrl?: string,
): Promise<SeedBaseReferenceData> {
  const targetDatabaseUrl = resolveDatabaseUrl(databaseUrl)
  return seedWithRetry(targetDatabaseUrl)
}

async function seedBaseReferenceDataCore(
  db: ReturnType<typeof drizzle>,
): Promise<SeedBaseReferenceData> {
  const universityId = randomUUID()
  const departmentId = randomUUID()

  await db.insert(university).values({
    id: universityId,
    name: "Test University",
  })

  await db.insert(universityDomain).values({
    id: randomUUID(),
    universityId,
    domain: "example.com",
    status: "approved",
  })

  for (const tag of SKILL_TAGS) {
    await db.insert(schema.skillTag).values({
      id: randomUUID(),
      ...tag,
    })
  }

  await db.insert(department).values({
    id: departmentId,
    universityId,
    name: "Computer Science",
  })

  return {
    universityId,
    departmentId,
  }
}

async function seedCredentialUser(
  db: ReturnType<typeof drizzle>,
  credential: TestCredential,
  options: {
    universityId?: string
    departmentId?: string
  } = {},
): Promise<string> {
  const userId = randomUUID()
  const passwordHash = await hashPassword(credential.password)
  const userValues: typeof user.$inferInsert = {
    id: userId,
    email: credential.email,
    name: credential.name,
    role: credential.role,
    emailVerified: true,
    onboardingCompleted: true,
  }

  if (options.universityId) {
    userValues.universityId = options.universityId
  }

  if (options.departmentId) {
    userValues.departmentId = options.departmentId
  }

  await db.insert(user).values(userValues)

  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: passwordHash,
  })

  return userId
}

async function resolveSeedContext(
  db: ReturnType<typeof drizzle>,
  options: SeedTestUsersOptions,
): Promise<{ universityId: string; departmentId: string }> {
  const seededUniversityId = options.universityId
    ? { id: options.universityId }
    : (
        await db
          .select({ id: university.id })
          .from(university)
          .orderBy(university.createdAt)
          .limit(1)
      )[0]

  if (!seededUniversityId) {
    throw new Error(
      "No university found while seeding test users. Run seedBaseReferenceData first.",
    )
  }

  const seededDepartmentId = options.departmentId
    ? { id: options.departmentId }
    : (
        await db
          .select({ id: department.id })
          .from(department)
          .where(eq(department.universityId, seededUniversityId.id))
          .orderBy(department.createdAt)
          .limit(1)
      )[0]

  if (!seededDepartmentId) {
    throw new Error(
      "No department found while seeding test users. Run seedBaseReferenceData first.",
    )
  }

  return {
    universityId: seededUniversityId.id,
    departmentId: seededDepartmentId.id,
  }
}

export async function seedTestUsers(
  options: SeedTestUsersOptions = {},
): Promise<SeededTestUsers> {
  const targetDatabaseUrl = resolveDatabaseUrl(options.databaseUrl)
  const client = postgres(targetDatabaseUrl, getMaintenancePostgresOptions())
  const db = drizzle(client, { schema })

  try {
    const { universityId, departmentId } = await resolveSeedContext(db, options)

    const studentUserId = await seedCredentialUser(
      db,
      TEST_CREDENTIALS.student,
      {
        universityId,
      },
    )

    await db.insert(studentProfile).values({
      userId: studentUserId,
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

    const companyAdminUserId = await seedCredentialUser(
      db,
      TEST_CREDENTIALS.companyAdmin,
    )

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

    await db.insert(companyMember).values({
      companyId,
      userId: companyAdminUserId,
      role: "owner",
    })

    const universityAdminUserId = await seedCredentialUser(
      db,
      TEST_CREDENTIALS.universityAdmin,
      { universityId },
    )

    const deptHeadUserId = await seedCredentialUser(
      db,
      TEST_CREDENTIALS.deptHead,
      {
        universityId,
        departmentId,
      },
    )

    const superAdminUserId = await seedCredentialUser(
      db,
      TEST_CREDENTIALS.superAdmin,
    )

    return {
      studentUserId,
      companyAdminUserId,
      universityAdminUserId,
      deptHeadUserId,
      superAdminUserId,
      companyId,
      universityId,
      departmentId,
    }
  } finally {
    await client.end({ timeout: 5 })
  }
}

export async function seedPasswordResetToken(options: {
  databaseUrl?: string
  email: string
  token?: string
  expiresInMs?: number
}): Promise<string> {
  const token =
    options.token ?? `e2e-reset-${Date.now().toString(36)}-${randomUUID()}`
  const expiresInMs = options.expiresInMs ?? 60 * 60 * 1000

  await withE2EDatabase(async (sql) => {
    await sql`
      INSERT INTO verification (id, identifier, value, expires_at)
      VALUES (${randomUUID()}, ${options.email}, ${token}, ${new Date(Date.now() + expiresInMs)})
    `
  }, options.databaseUrl)

  return token
}

export async function restoreUserPassword(options: {
  email: string
  password: string
  databaseUrl?: string
}): Promise<void> {
  const passwordHash = await hashPassword(options.password)

  await withE2EDatabase(async (sql) => {
    const [found] = await sql<{ id: string }[]>`
      SELECT id FROM "user" WHERE email = ${options.email} LIMIT 1
    `
    if (!found) return
    await sql`
      UPDATE account SET password = ${passwordHash}, updated_at = NOW()
      WHERE user_id = ${found.id} AND provider_id = 'credential'
    `
  }, options.databaseUrl)
}

export async function createFreshStudentUser(options?: {
  databaseUrl?: string
}): Promise<{ email: string; password: string; userId: string }> {
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const email = `fresh-student.${suffix}@example.com`
  const password = "FreshStudent123!"
  const userId = randomUUID()

  return withE2EDatabase(async (sql) => {
    const [uni] = await sql<{ id: string }[]>`
      SELECT id FROM university LIMIT 1
    `
    const passwordHash = await hashPassword(password)

    await sql`
      INSERT INTO "user" (id, email, name, role, email_verified, onboarding_completed, university_id, created_at, updated_at)
      VALUES (${userId}, ${email}, 'Fresh Student', 'student', true, false, ${uni?.id ?? null}, NOW(), NOW())
    `

    await sql`
      INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
      VALUES (${randomUUID()}, ${userId}, 'credential', ${userId}, ${passwordHash}, NOW(), NOW())
    `

    return { email, password, userId }
  }, options?.databaseUrl)
}

export async function createFreshCompanyAdminUser(options?: {
  databaseUrl?: string
}): Promise<{ email: string; password: string; userId: string }> {
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
  const email = `fresh-company.${suffix}@example.com`
  const password = "FreshCompany123!"
  const userId = randomUUID()

  return withE2EDatabase(async (sql) => {
    const passwordHash = await hashPassword(password)

    await sql`
      INSERT INTO "user" (id, email, name, role, email_verified, onboarding_completed, created_at, updated_at)
      VALUES (${userId}, ${email}, 'Fresh Company Admin', 'company_admin', true, false, NOW(), NOW())
    `

    await sql`
      INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
      VALUES (${randomUUID()}, ${userId}, 'credential', ${userId}, ${passwordHash}, NOW(), NOW())
    `

    return { email, password, userId }
  }, options?.databaseUrl)
}

function createFixtureToken(): string {
  return `e2e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

async function getSeededPrincipalIds(
  sql: ReturnType<typeof postgres>,
): Promise<SeededPrincipalIds> {
  const [student] = await sql<{ id: string }[]>`
    SELECT id
    FROM "user"
    WHERE email = ${TEST_CREDENTIALS.student.email}
    LIMIT 1
  `

  const [companyUser] = await sql<{ id: string }[]>`
    SELECT id
    FROM "user"
    WHERE email = ${TEST_CREDENTIALS.companyAdmin.email}
    LIMIT 1
  `

  const [adminUser] = await sql<{ id: string }[]>`
    SELECT id
    FROM "user"
    WHERE email = ${TEST_CREDENTIALS.universityAdmin.email}
    LIMIT 1
  `

  if (!student || !companyUser || !adminUser) {
    throw new Error(
      "Seeded E2E users are missing. Run Playwright global setup.",
    )
  }

  const [membership] = await sql<{ company_id: string }[]>`
    SELECT company_id
    FROM company_member
    WHERE user_id = ${companyUser.id}
    LIMIT 1
  `

  if (!membership) {
    throw new Error(
      "Seeded company membership is missing for E2E company user.",
    )
  }

  return {
    studentUserId: student.id,
    companyUserId: companyUser.id,
    adminUserId: adminUser.id,
    companyId: membership.company_id,
  }
}

export async function seedOfferFixture(
  options: SeedOfferFixtureOptions = {},
): Promise<SeededOfferFixture> {
  return withE2EDatabase(async (sql) => {
    const principals = await getSeededPrincipalIds(sql)
    const searchToken = createFixtureToken()
    const offerId = generateId()
    const offerTitle = `${options.titlePrefix ?? "E2E Internship Offer"} ${searchToken}`
    const now = new Date()
    const applicationDeadline = new Date(
      now.getTime() + 14 * 24 * 60 * 60 * 1000,
    )
    const expectedStartDate = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000)
    const expectedEndDate = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000)

    await sql`
      INSERT INTO internship_offer (
        id,
        company_id,
        title,
        description,
        internship_type,
        work_mode,
        wilaya_code,
        duration_weeks,
        max_positions,
        status,
        published_at,
        application_deadline_at,
        expected_start_date,
        expected_end_date,
        created_at,
        updated_at
      ) VALUES (
        ${offerId},
        ${principals.companyId},
        ${offerTitle},
        ${`Deterministic E2E offer for ${searchToken}.`},
        ${"pfe"},
        ${"hybrid"},
        ${16},
        ${24},
        ${2},
        ${"published"},
        ${now},
        ${applicationDeadline},
        ${expectedStartDate},
        ${expectedEndDate},
        ${now},
        ${now}
      )
    `

    return {
      ...principals,
      offerId,
      offerTitle,
      searchToken,
    }
  })
}

export async function seedApplicationFixture(
  options: SeedApplicationFixtureOptions = {},
): Promise<SeededApplicationFixture> {
  const status = options.status ?? "applied"
  const pipelineStage =
    options.pipelineStage ??
    (status === "company_accepted" ? "offer" : "applied")
  const offerFixture = await seedOfferFixture({
    titlePrefix: options.titlePrefix,
  })

  return withE2EDatabase(async (sql) => {
    const now = new Date()
    const applicationId = generateId()
    const includeCompanyAction =
      options.includeCompanyAction ?? status === "company_accepted"

    await sql`
      INSERT INTO application (
        id,
        offer_id,
        student_user_id,
        status,
        pipeline_stage,
        cover_letter,
        company_action_by_user_id,
        company_action_at,
        created_at,
        pipeline_stage_updated_at,
        updated_at
      ) VALUES (
        ${applicationId},
        ${offerFixture.offerId},
        ${offerFixture.studentUserId},
        ${status},
        ${pipelineStage},
        ${options.coverLetter ?? `Deterministic E2E application for ${offerFixture.searchToken}.`},
        ${includeCompanyAction ? offerFixture.companyUserId : null},
        ${includeCompanyAction ? now : null},
        ${now},
        ${now},
        ${now}
      )
    `

    return {
      ...offerFixture,
      applicationId,
      status,
      pipelineStage,
    }
  })
}

export async function seedPlacementFixture(
  options: SeedPlacementFixtureOptions = {},
): Promise<SeededPlacementFixture> {
  const applicationFixture = await seedApplicationFixture({
    status: "company_accepted",
    pipelineStage: "offer",
    includeCompanyAction: true,
    ...options.applicationOptions,
  })

  const now = new Date()
  const startDate =
    options.startDate ?? new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  const endDate =
    options.endDate ?? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return withE2EDatabase(async (sql) => {
    const placementId = generateId()

    await sql`
      INSERT INTO placement (id, application_id, validated_by_user_id, validated_at, start_date, end_date, created_at, updated_at)
      VALUES (${placementId}, ${applicationFixture.applicationId}, ${applicationFixture.adminUserId}, ${now}, ${startDate}, ${endDate}, ${now}, ${now})
    `

    await sql`
      UPDATE application SET status = 'admin_validated', pipeline_stage = 'accepted', updated_at = ${now}
      WHERE id = ${applicationFixture.applicationId}
    `

    if (options.seedAgreement !== false) {
      const agreementDocId = generateId()
      await sql`
        INSERT INTO "document" (id, placement_id, type, status, created_at)
        VALUES (${agreementDocId}, ${placementId}, 'agreement', 'pending', ${now})
      `
    }

    if (options.seedCertificate) {
      const certDocId = generateId()
      await sql`
        INSERT INTO "document" (id, placement_id, type, status, created_at)
        VALUES (${certDocId}, ${placementId}, 'certificate', 'pending', ${now})
      `
    }

    return {
      ...applicationFixture,
      placementId,
    }
  })
}

export async function seedGeneratedDocument(options: {
  placementId: string
  type: "agreement" | "certificate"
  verificationCode?: string
  status?: "generated" | "pending" | "failed"
}): Promise<SeededDocumentFixture> {
  const documentId = generateId()
  const code =
    options.verificationCode ??
    `INTX-${randomUUID().slice(0, 4).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`
  const status = options.status ?? "generated"
  const snapshotData = JSON.stringify({
    studentName: "Test Student",
    studentEmail: "test.student@example.com",
    companyName: "Test Company",
    offerTitle: "Test Offer",
    internshipType: "pfe",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    universityName: "Test University",
  })
  const meta = JSON.stringify({
    generatedAt: new Date().toISOString(),
    fileName: `${options.type}.pdf`,
  })

  return withE2EDatabase(async (sql) => {
    const [existing] = await sql<{ id: string }[]>`
      SELECT id FROM "document" WHERE placement_id = ${options.placementId} AND type = ${options.type} LIMIT 1
    `

    if (existing) {
      await sql`
        UPDATE "document" SET
          status = ${status},
          verification_code = ${code},
          snapshot_data = ${snapshotData},
          meta = ${meta}
        WHERE id = ${existing.id}
      `
      return {
        documentId: existing.id,
        placementId: options.placementId,
        type: options.type,
        status,
        verificationCode: code,
      }
    }

    await sql`
      INSERT INTO "document" (id, placement_id, type, status, verification_code, snapshot_data, meta, created_at)
      VALUES (
        ${documentId},
        ${options.placementId},
        ${options.type},
        ${status},
        ${code},
        ${snapshotData},
        ${meta},
        ${new Date()}
      )
    `

    return {
      documentId,
      placementId: options.placementId,
      type: options.type,
      status,
      verificationCode: code,
    }
  })
}
