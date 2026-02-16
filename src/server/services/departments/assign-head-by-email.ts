import "server-only"

import { randomBytes } from "node:crypto"

import { eq } from "drizzle-orm"

import { auth, pendingWelcomeEmails } from "@/lib/auth"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { department } from "@/server/db/schema/departments"
import { university } from "@/server/db/schema/universities"

import { assignDepartmentHead } from "./assign-head"

interface AssignDepartmentHeadByEmailInput {
  departmentId: string
  headEmail: string
  headName: string
}

export async function assignDepartmentHeadByEmail({
  departmentId,
  headEmail,
  headName,
}: AssignDepartmentHeadByEmailInput) {
  const normalizedEmail = headEmail.trim().toLowerCase()
  const normalizedName = headName.trim()

  if (!normalizedEmail) {
    throw new Error("Head email is required")
  }

  if (!normalizedName) {
    throw new Error("Head name is required")
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
    throw new Error("Department not found")
  }

  const [uni] = await db
    .select({ name: university.name })
    .from(university)
    .where(eq(university.id, dept.universityId))
    .limit(1)

  if (!uni) {
    throw new Error("University not found")
  }

  const [existingUser] = await db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.email, normalizedEmail))
    .limit(1)

  let userId = existingUser?.id

  if (!userId) {
    const password = randomBytes(18).toString("base64url")
    const created = await auth.api.createUser({
      body: {
        email: normalizedEmail,
        password,
        name: normalizedName,
        role: "dept_head",
      },
    })
    userId = created.user.id
  }

  await assignDepartmentHead(departmentId, userId)

  await db
    .update(user)
    .set({
      onboardingCompleted: true,
      ...(existingUser?.name ? {} : { name: normalizedName }),
    })
    .where(eq(user.id, userId))

  pendingWelcomeEmails.set(normalizedEmail, {
    name: normalizedName,
    departmentName: dept.name,
    universityName: uni.name,
  })

  await auth.api.requestPasswordReset({
    body: {
      email: normalizedEmail,
      redirectTo: "/login",
    },
  })

  return { success: true, departmentId, userId, email: normalizedEmail }
}
