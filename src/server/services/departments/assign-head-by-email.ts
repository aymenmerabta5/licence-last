import "server-only"

import { randomBytes } from "node:crypto"

import { eq } from "drizzle-orm"

import { auth, pendingWelcomeEmails } from "@/lib/auth"
import { db } from "@/server/db"
import { ServiceError } from "@/server/services/errors"
import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
import { university } from "@/server/db/schema/universities"

import { assignDepartmentHead } from "@/server/services/departments/assign-head"
import { deriveHeadNameFromEmail } from "@/server/services/departments/derive-head-name"

interface AssignDepartmentHeadByEmailInput {
  departmentId: string
  headEmail: string
}

export async function assignDepartmentHeadByEmail({
  departmentId,
  headEmail,
}: AssignDepartmentHeadByEmailInput) {
  const normalizedEmail = headEmail.trim().toLowerCase()

  if (!normalizedEmail) {
    throw new ServiceError("HEAD_EMAIL_REQUIRED", "Head email is required")
  }

  const [dept] = await db
    .select({
      id: department.id,
      name: department.name,
      universityId: department.universityId,
    })
    .from(department)
    .where(eq(department.id, departmentId))
    .limit(1)

  if (!dept) {
    throw new ServiceError("DEPARTMENT_NOT_FOUND", "Department not found")
  }

  const [uni] = await db
    .select({ name: university.name })
    .from(university)
    .where(eq(university.id, dept.universityId))
    .limit(1)

  if (!uni) {
    throw new ServiceError("UNIVERSITY_NOT_FOUND", "University not found")
  }

  const [existingUser] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.email, normalizedEmail))
    .limit(1)

  const existingName = existingUser?.name?.trim() ?? ""
  const resolvedHeadName =
    existingName || deriveHeadNameFromEmail(normalizedEmail)

  let userId = existingUser?.id

  if (!userId) {
    const password = randomBytes(18).toString("base64url")
    const created = await auth.api.createUser({
      body: {
        email: normalizedEmail,
        password,
        name: resolvedHeadName,
        role: "university_admin",
        data: {
          emailVerified: true,
        },
      },
    })
    userId = created.user.id
  }

  await assignDepartmentHead(departmentId, userId)

  await db
    .update(user)
    .set({
      onboardingCompleted: true,
      ...(existingName ? {} : { name: resolvedHeadName }),
    })
    .where(eq(user.id, userId))

  pendingWelcomeEmails.set(normalizedEmail, {
    name: resolvedHeadName,
    departmentName: dept.name,
    universityName: uni.name,
  })

  await auth.api.requestPasswordReset({
    body: {
      email: normalizedEmail,
      redirectTo: "/reset-password/verify",
    },
  })

  return { success: true, departmentId, userId, email: normalizedEmail }
}
