import "server-only"

import { randomBytes } from "node:crypto"

import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { company, companyMember } from "@/server/db/schema/companies"
import { ServiceError } from "@/server/services/errors"
import { createNotification } from "@/server/services/notifications/create"

interface InviteCompanyMemberInput {
  companyId: string
  invitedByUserId: string
  email: string
  name?: string
}

interface InviteCompanyMemberResult {
  userId: string
  email: string
  role: "owner" | "recruiter"
  createdUser: boolean
  alreadyMember: boolean
}

const FORBIDDEN_EXISTING_ROLES = new Set([
  "student",
  "super_admin",
  "university_admin",
])

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

function normalizeDisplayName(name: string | undefined, email: string) {
  const trimmedName = name?.trim()
  if (trimmedName) {
    return trimmedName
  }

  const localPart = email.split("@")[0] ?? "Recruiter"
  return localPart.replace(/[._-]+/g, " ").trim() || "Recruiter"
}

export async function inviteCompanyMember(
  input: InviteCompanyMemberInput,
): Promise<InviteCompanyMemberResult> {
  const normalizedEmail = input.email.trim().toLowerCase()
  if (!normalizedEmail) {
    throw new ServiceError("COMPANY_MEMBER_EMAIL_REQUIRED", "Email is required")
  }

  const [companyRow] = await db
    .select({
      id: company.id,
      name: company.name,
    })
    .from(company)
    .where(eq(company.id, input.companyId))
    .limit(1)

  if (!companyRow) {
    throw new ServiceError("COMPANY_NOT_FOUND", "Company not found")
  }

  const [existingUser] = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      onboardingCompleted: user.onboardingCompleted,
    })
    .from(user)
    .where(eq(user.email, normalizedEmail))
    .limit(1)

  if (existingUser?.id === input.invitedByUserId) {
    throw new ServiceError(
      "COMPANY_MEMBER_CANNOT_INVITE_SELF",
      "You cannot invite yourself",
    )
  }

  if (existingUser) {
    const [existingMembership] = await db
      .select({
        companyId: companyMember.companyId,
        role: companyMember.role,
      })
      .from(companyMember)
      .where(eq(companyMember.userId, existingUser.id))
      .limit(1)

    if (existingMembership?.companyId === input.companyId) {
      // Allow re-invites to resend the access email if the original
      // onboarding/reset delivery failed or the link expired.
      await auth.api.requestPasswordReset({
        body: {
          email: normalizedEmail,
          redirectTo: "/reset-password/verify",
        },
      })

      return {
        userId: existingUser.id,
        email: normalizedEmail,
        role: existingMembership.role,
        createdUser: false,
        alreadyMember: true,
      }
    }

    if (existingMembership) {
      throw new ServiceError(
        "COMPANY_MEMBER_ALREADY_ASSIGNED",
        "User is already assigned to another company",
      )
    }

    if (FORBIDDEN_EXISTING_ROLES.has(existingUser.role)) {
      throw new ServiceError(
        "COMPANY_MEMBER_ROLE_NOT_ELIGIBLE",
        "Existing account role cannot be reassigned as a company member; invite using a dedicated company account",
      )
    }

    try {
      await db.transaction(async (tx) => {
        await tx.insert(companyMember).values({
          companyId: input.companyId,
          userId: existingUser.id,
          role: "recruiter",
        })

        const nextName =
          existingUser.name ?? normalizeDisplayName(input.name, normalizedEmail)
        await tx
          .update(user)
          .set({
            onboardingCompleted: true,
            ...(existingUser.name ? {} : { name: nextName }),
          })
          .where(eq(user.id, existingUser.id))
      })
    } catch (error) {
      if (isCompanyMembershipUniqueViolation(error)) {
        throw new ServiceError(
          "COMPANY_MEMBER_ALREADY_ASSIGNED",
          "User is already assigned to another company",
        )
      }

      throw error
    }

    await createNotification({
      userId: existingUser.id,
      type: "company_member_invited",
      payload: {
        companyId: input.companyId,
        companyName: companyRow.name,
      },
    })

    return {
      userId: existingUser.id,
      email: normalizedEmail,
      role: "recruiter",
      createdUser: false,
      alreadyMember: false,
    }
  }

  const name = normalizeDisplayName(input.name, normalizedEmail)
  const password = randomBytes(18).toString("base64url")

  const created = await auth.api.createUser({
    body: {
      email: normalizedEmail,
      password,
      name,
      role: "company_admin",
      data: {
        emailVerified: true,
      },
    },
  })

  const createdUserId = created.user.id

  try {
    await db.transaction(async (tx) => {
      await tx.insert(companyMember).values({
        companyId: input.companyId,
        userId: createdUserId,
        role: "recruiter",
      })

      await tx
        .update(user)
        .set({ onboardingCompleted: true })
        .where(eq(user.id, createdUserId))
    })
  } catch (error) {
    if (isCompanyMembershipUniqueViolation(error)) {
      throw new ServiceError(
        "COMPANY_MEMBER_ALREADY_ASSIGNED",
        "User is already assigned to another company",
      )
    }

    throw error
  }

  await auth.api.requestPasswordReset({
    body: {
      email: normalizedEmail,
      redirectTo: "/reset-password/verify",
    },
  })

  await createNotification({
    userId: createdUserId,
    type: "company_member_invited",
    payload: {
      companyId: input.companyId,
      companyName: companyRow.name,
    },
  })

  return {
    userId: createdUserId,
    email: normalizedEmail,
    role: "recruiter",
    createdUser: true,
    alreadyMember: false,
  }
}
