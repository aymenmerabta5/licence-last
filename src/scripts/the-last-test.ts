import { mock } from "bun:test"

// Neutralise server-only so we can import Next.js server modules outside the framework
mock.module("server-only", () => ({}))

import { randomBytes, randomUUID, scryptSync } from "node:crypto"
import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { account, user } from "@/server/db/schema/auth"
import { internshipOffer } from "@/server/db/schema/internships"
import { placementDocument } from "@/server/db/schema/placements"
import { studentProfile } from "@/server/db/schema/students"

import { applyToOffer } from "@/server/services/applications/apply"
import { companyAcceptApplication } from "@/server/services/applications/company-accept"
import { generateAgreement } from "@/server/services/documents/generate-agreement"
import { generateCertificate } from "@/server/services/documents/generate-certificate"
import { validatePlacement } from "@/server/services/placements/validate"

const logger = console

/* ── Hardcoded prod-like dev DB references discovered via query-db.ts ── */
const EXISTING = {
  companyId: "0b813593-31cf-4188-9724-abfafc5a7c7a",
  offerId: "995b96f8-caa1-4053-8851-af402282badd",
  universityId: "9f549578-d350-4794-8e2b-eb5bd43c7167",
  departmentId: "1d293d63-2b5d-4150-b4ce-42eff7da2f1c",
  companyAdminUserId: "EzFAXkLAAbUezpKZP58VvJUHUvaolBAY",
  universityAdminUserId: "0eb61126-c133-4580-b4f3-eeb9e6e7c789",
} as const

const TEST_STUDENT_EMAIL = `the-last-test-${Date.now()}@example.com`

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const key = scryptSync(password.normalize("NFKC"), salt, 64, {
    N: 16384,
    r: 16,
    p: 1,
    maxmem: 128 * 16384 * 16 * 2,
  })
  return `${salt}:${key.toString("hex")}`
}

async function createFakeStudent() {
  const userId = randomUUID()
  const now = new Date()

  await db.insert(user).values({
    id: userId,
    email: TEST_STUDENT_EMAIL,
    emailVerified: true,
    role: "student",
    universityId: EXISTING.universityId,
    departmentId: EXISTING.departmentId,
    onboardingCompleted: true,
    name: "THE LAST TEST Student",
    image: null,
    createdAt: now,
    updatedAt: now,
  })

  await db.insert(account).values({
    id: randomUUID(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashPassword("TestPassword123!"),
    createdAt: now,
    updatedAt: now,
  })

  await db.insert(studentProfile).values({
    userId,
    wilayaCode: 25,
    bio: "A fake student created for THE LAST TEST end-to-end validation.",
    phone: "+213555000000",
    githubUrl: "https://github.com/test-student",
    portfolioUrl: "https://test-student.dev",
    studentNumber: `TST-${Date.now()}`,
    departmentId: EXISTING.departmentId,
    level: "Master 2",
    address: "Ali Mendjeli, Constantine, Algeria",
    createdAt: now,
    updatedAt: now,
  })

  logger.info({ userId, email: TEST_STUDENT_EMAIL }, "Fake student created")
  return userId
}

async function runTheLastTest() {
  logger.info("\n========================================")
  logger.info("  THE LAST TEST — Starting")
  logger.info("========================================\n")

  /* ── 1. Verify preconditions ── */
  const [offer] = await db
    .select()
    .from(internshipOffer)
    .where(eq(internshipOffer.id, EXISTING.offerId))
    .limit(1)

  if (!offer || offer.status !== "published") {
    throw new Error("Precondition failed: offer is not published or missing")
  }
  logger.info({ offerId: offer.id, title: offer.title }, "Offer verified")

  /* ── 2. Create fake student ── */
  const studentUserId = await createFakeStudent()

  /* ── 3. Student applies to offer ── */
  logger.info("Applying to offer...")
  const { applicationId } = await applyToOffer(
    EXISTING.offerId,
    studentUserId,
    "I am very excited to apply for this internship as part of THE LAST TEST.",
  )
  logger.info({ applicationId }, "Application submitted")

  /* ── 4. Company accepts application ── */
  logger.info("Company accepting application...")
  await companyAcceptApplication(
    applicationId,
    EXISTING.companyId,
    EXISTING.companyAdminUserId,
    "We would love to have you on board for THE LAST TEST!",
  )
  logger.info("Application accepted by company")

  /* ── 5. University admin validates placement with PAST dates ──
     This makes the internship "over" immediately so the certificate
     can be generated straight away.                               */
  const startDate = new Date("2024-01-01T00:00:00Z")
  const endDate = new Date("2024-03-01T00:00:00Z")

  logger.info("Validating placement (internship already over)...")
  const { placementId } = await validatePlacement({
    applicationId,
    adminUserId: EXISTING.universityAdminUserId,
    adminRole: "university_admin",
    adminUniversityId: EXISTING.universityId,
    startDate,
    endDate,
  })
  logger.info({ placementId, startDate, endDate }, "Placement validated")

  /* ── 6. Generate Agreement ── */
  logger.info("Generating agreement...")
  const agreementResult = await generateAgreement({
    placementId,
    locale: "en",
    issuer: {
      userId: EXISTING.universityAdminUserId,
      role: "university_admin",
      universityId: EXISTING.universityId,
      departmentId: null,
    },
  })
  logger.info(
    {
      documentId: agreementResult.documentId,
      success: agreementResult.success,
    },
    "Agreement generated",
  )

  /* ── 7. Generate Certificate ── */
  logger.info("Generating certificate...")
  const certificateResult = await generateCertificate({
    placementId,
    locale: "en",
    borderStyle: "classic",
  })
  logger.info(
    {
      documentId: certificateResult.documentId,
      success: certificateResult.success,
    },
    "Certificate generated",
  )

  /* ── 8. Verify documents in DB ── */
  const docs = await db
    .select()
    .from(placementDocument)
    .where(eq(placementDocument.placementId, placementId))

  logger.info(
    {
      placementId,
      applicationId,
      studentUserId,
      documents: docs.map((d) => ({
        type: d.type,
        status: d.status,
        locale: d.locale,
        borderStyle: d.borderStyle,
        verificationCode: d.verificationCode,
        storageKey: d.storageKey,
      })),
    },
    "Final state",
  )

  logger.info("\n========================================")
  logger.info("  THE LAST TEST — COMPLETE")
  logger.info("========================================\n")

  return {
    studentUserId,
    applicationId,
    placementId,
    agreementDocumentId: agreementResult.documentId,
    certificateDocumentId: certificateResult.documentId,
  }
}

runTheLastTest()
  .then((result) => {
    logger.info({ result }, "All done")
    process.exit(0)
  })
  .catch((err) => {
    logger.error({ err }, "THE LAST TEST FAILED")
    process.exit(1)
  })
