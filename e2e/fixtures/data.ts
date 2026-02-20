import { randomUUID } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import postgres from "postgres"

// Generate a unique timestamp-based suffix for test data uniqueness
function generateUniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
}

// Generate a random ID
export function generateId(): string {
  return randomUUID()
}

export interface TestUserData {
  id: string
  email: string
  name: string
  password: string
  role: "student" | "company_admin" | "admin"
  emailVerified: boolean
  onboardingCompleted: boolean
}

export interface TestStudentProfileData {
  userId: string
  wilayaCode: number
  bio: string
  phone: string
  githubUrl: string
  portfolioUrl: string
  studentNumber: string
  department: string
  level: string
  address: string
}

export interface TestCompanyData {
  id: string
  name: string
  slug: string
  description: string
  websiteUrl: string
  phone: string
  contactEmail: string
  representativeName: string
  wilayaCode: number
  address: string
  status: "pending" | "approved" | "rejected"
}

export interface TestOfferData {
  id: string
  companyId: string
  title: string
  description: string
  internshipType: "pfe" | "stage" | "alternance"
  workMode: "remote" | "onsite" | "hybrid" | null
  wilayaCode: number
  durationWeeks: number
  maxPositions: number
  status: "draft" | "published" | "closed" | "archived"
}

export interface TestApplicationData {
  id: string
  offerId: string
  studentUserId: string
  status:
    | "applied"
    | "shortlisted"
    | "interview"
    | "accepted"
    | "rejected"
    | "withdrawn"
  pipelineStage:
    | "applied"
    | "screening"
    | "interview"
    | "offer"
    | "hired"
    | "rejected"
  coverLetter: string
}

/**
 * Creates test user data with unique identifiers
 * @param role - The role for the test user
 * @returns Test user data object
 */
export function createTestUser(
  role: "student" | "company_admin" | "admin" = "student",
): TestUserData {
  const suffix = generateUniqueSuffix()

  return {
    id: generateId(),
    email: `test.${role}.${suffix}@example.com`,
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)} ${suffix.slice(-6)}`,
    password: "TestPassword123!",
    role,
    emailVerified: true,
    onboardingCompleted: true,
  }
}

/**
 * Creates test student profile data
 * @param userId - The user ID to associate with the profile
 * @returns Test student profile data
 */
export function createTestStudentProfile(
  userId: string,
): TestStudentProfileData {
  const suffix = generateUniqueSuffix()

  return {
    userId,
    wilayaCode: 16, // Algiers
    bio: `Passionate computer science student looking for internship opportunities. Created at ${suffix}.`,
    phone: "+213555123456",
    githubUrl: "https://github.com/teststudent",
    portfolioUrl: "https://teststudent.dev",
    studentNumber: `STU${suffix.slice(-8)}`,
    department: "Computer Science",
    level: "Master 1",
    address: "123 University Street, Algiers",
  }
}

/**
 * Creates test company data with unique identifiers
 * @returns Test company data object
 */
export function createTestCompany(): TestCompanyData {
  const suffix = generateUniqueSuffix()

  return {
    id: generateId(),
    name: `Test Company ${suffix.slice(-6)}`,
    slug: `test-company-${suffix}`,
    description: `A test company for E2E testing. Created at ${suffix}. We are a technology company focused on innovation.`,
    websiteUrl: "https://testcompany.example.com",
    phone: "+213555987654",
    contactEmail: `contact.${suffix}@testcompany.example.com`,
    representativeName: `John Doe ${suffix.slice(-4)}`,
    wilayaCode: 16, // Algiers
    address: "456 Business District, Algiers",
    status: "approved",
  }
}

/**
 * Creates test internship offer data
 * @param companyId - The company ID to associate with the offer
 * @returns Test offer data object
 */
export function createTestOffer(companyId: string): TestOfferData {
  const suffix = generateUniqueSuffix()

  return {
    id: generateId(),
    companyId,
    title: `Software Engineering Intern ${suffix.slice(-6)}`,
    description: `We are looking for a motivated software engineering intern to join our team. 
    
Requirements:
- Knowledge of React and TypeScript
- Good problem-solving skills
- Willingness to learn

This is a test internship offer created at ${suffix}.`,
    internshipType: "pfe",
    workMode: "hybrid",
    wilayaCode: 16, // Algiers
    durationWeeks: 24,
    maxPositions: 2,
    status: "published",
  }
}

/**
 * Creates test application data
 * @param offerId - The offer ID to apply to
 * @param studentUserId - The student user ID making the application
 * @returns Test application data object
 */
export function createTestApplication(
  offerId: string,
  studentUserId: string,
): TestApplicationData {
  const suffix = generateUniqueSuffix()

  return {
    id: generateId(),
    offerId,
    studentUserId,
    status: "applied",
    pipelineStage: "applied",
    coverLetter: `Dear Hiring Manager,

I am writing to express my interest in this internship position. I believe my skills and enthusiasm make me a strong candidate for this role.

This is a test application created at ${suffix}.

Best regards,
Test Student`,
  }
}

/**
 * Creates a complete test scenario with related entities
 * @returns Object containing all related test data
 */
export function createTestScenario() {
  const student = createTestUser("student")
  const studentProfile = createTestStudentProfile(student.id)
  const companyAdmin = createTestUser("company_admin")
  const company = createTestCompany()
  const offer = createTestOffer(company.id)
  const application = createTestApplication(offer.id, student.id)

  return {
    student,
    studentProfile,
    companyAdmin,
    company,
    offer,
    application,
  }
}

/**
 * Creates test credentials for predefined test accounts
 * These are used in the auth fixtures for consistent login testing
 */
export const TEST_CREDENTIALS = {
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
} as const

/**
 * Wilaya codes for testing (Algeria)
 */
export const WILAYA_CODES = {
  algiers: 16,
  oran: 31,
  constantine: 25,
  annaba: 23,
  blida: 9,
} as const

/**
 * Common skill tags for testing
 */
export const TEST_SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "Git",
  "Docker",
  "AWS",
  "Figma",
] as const

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

function loadDatabaseUrlFromEnvFile(): string | undefined {
  const envPath = join(process.cwd(), ".env.development")
  if (!existsSync(envPath)) {
    return undefined
  }

  const envLines = readFileSync(envPath, "utf8").split(/\r?\n/)
  const databaseLine = envLines.find((line) => line.startsWith("DATABASE_URL="))
  if (!databaseLine) {
    return undefined
  }

  const rawValue = databaseLine.slice("DATABASE_URL=".length).trim()
  return rawValue.replace(/^['"]|['"]$/g, "")
}

function resolveDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL ?? loadDatabaseUrlFromEnvFile()

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for E2E fixture seeding")
  }

  return databaseUrl
}

async function withE2EDatabase<T>(
  run: (sql: ReturnType<typeof postgres>) => Promise<T>,
): Promise<T> {
  const sql = postgres(resolveDatabaseUrl(), { max: 1 })

  try {
    return await run(sql)
  } finally {
    await sql.end({ timeout: 5 })
  }
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
    WHERE email = ${TEST_CREDENTIALS.company.email}
    LIMIT 1
  `

  const [adminUser] = await sql<{ id: string }[]>`
    SELECT id
    FROM "user"
    WHERE email = ${TEST_CREDENTIALS.admin.email}
    LIMIT 1
  `

  if (!student || !companyUser || !adminUser) {
    throw new Error("Seeded E2E users are missing. Run Playwright global setup.")
  }

  const [membership] = await sql<{ company_id: string }[]>`
    SELECT company_id
    FROM company_member
    WHERE user_id = ${companyUser.id}
    LIMIT 1
  `

  if (!membership) {
    throw new Error("Seeded company membership is missing for E2E company user.")
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
    const applicationDeadline = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
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
  const offerFixture = await seedOfferFixture({ titlePrefix: options.titlePrefix })

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
