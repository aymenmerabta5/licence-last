import "server-only"

import { randomUUID } from "node:crypto"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/companies/create")

import { user } from "@/server/db/schema/auth"
import { company, companyMember } from "@/server/db/schema/companies"

/**
 * Generate a URL-safe slug from a company name.
 * Appends a short random suffix to avoid collisions.
 */
function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  const suffix = randomUUID().slice(0, 12)
  return `${base}-${suffix}`
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  )
}

function isCompanyMembershipUniqueViolation(error: unknown): boolean {
  if (!isUniqueViolation(error)) {
    return false
  }

  const constraint =
    typeof error === "object" && error !== null && "constraint" in error
      ? (error as { constraint?: string }).constraint
      : undefined

  return (
    constraint === "company_member_userId_uidx" ||
    constraint === "company_member_pkey"
  )
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
    verificationDocument: {
      key: string
      fileName: string
      mimeType: string
      fileSizeBytes: number
    }
  },
  userId: string,
) {
  const companyId = randomUUID()
  const slug = generateSlug(data.name)
  log.info({ userId, companyId, slug }, "Creating company")

  try {
    await db.transaction(async (tx) => {
      await tx.insert(company).values({
        id: companyId,
        name: data.name,
        slug,
        description: data.description || null,
        websiteUrl: data.websiteUrl || null,
        wilayaCode: data.wilayaCode,
        address: data.address || null,
        verificationDocumentKey: data.verificationDocument.key,
        verificationDocumentName: data.verificationDocument.fileName,
        verificationDocumentMimeType: data.verificationDocument.mimeType,
        verificationDocumentSizeBytes: data.verificationDocument.fileSizeBytes,
        verificationDocumentUploadedAt: new Date(),
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
  } catch (error) {
    if (isCompanyMembershipUniqueViolation(error)) {
      throw new ServiceError(
        "COMPANY_MEMBERSHIP_ALREADY_EXISTS",
        "Company admin is already assigned to a company",
      )
    }

    throw error
  }

  log.info(
    { companyId, slug, event: "company_created" },
    "Company created successfully",
  )
  return { companyId, slug }
}
