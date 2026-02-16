import "server-only"

import { randomBytes } from "node:crypto"

import { eq } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { auth, pendingWelcomeEmails } from "@/lib/auth"
import { createDepartment } from "./create"
import { assignDepartmentHead } from "./assign-head"
import type { BulkDepartmentRow } from "@/lib/schemas/department"

const log = createModuleLogger("services/departments/bulk-create-with-heads")

interface BulkCreateResult {
  created: Array<{
    departmentName: string
    headEmail: string
    departmentId: string
    userId: string
  }>
  errors: Array<{
    index: number
    departmentName: string
    headEmail: string
    message: string
  }>
}

export async function bulkCreateDepartmentsWithHeads(
  universityId: string,
  universityName: string,
  rows: BulkDepartmentRow[],
): Promise<BulkCreateResult> {
  const result: BulkCreateResult = { created: [], errors: [] }

  log.info(
    { universityId, rowCount: rows.length },
    "Starting bulk department creation",
  )

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    try {
      // 1. Create department
      const { departmentId } = await createDepartment({
        universityId,
        name: row.departmentName,
        headName: row.headName,
      })

      // 2. Find or create user
      let userId: string

      const [existingUser] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, row.headEmail.toLowerCase()))
        .limit(1)

      if (existingUser) {
        userId = existingUser.id
      } else {
        // Create user with a random password — they'll set their own via reset link
        const password = randomBytes(18).toString("base64url")
        const created = await auth.api.createUser({
          body: {
            email: row.headEmail.toLowerCase(),
            password,
            name: row.headName,
            role: "dept_head",
            data: {
              emailVerified: true,
            },
          },
        })
        userId = created.user.id
      }

      // 3. Assign as department head (sets role, departmentId, universityId)
      await assignDepartmentHead(departmentId, userId)

      // 4. Mark onboarding as completed (dept_heads have no onboarding flow)
      await db
        .update(user)
        .set({ onboardingCompleted: true })
        .where(eq(user.id, userId))

      // 5. Queue welcome email data and trigger password reset
      pendingWelcomeEmails.set(row.headEmail.toLowerCase(), {
        name: row.headName,
        departmentName: row.departmentName,
        universityName,
      })

      await auth.api.requestPasswordReset({
        body: {
          email: row.headEmail.toLowerCase(),
          redirectTo: "/login",
        },
      })

      result.created.push({
        departmentName: row.departmentName,
        headEmail: row.headEmail,
        departmentId,
        userId,
      })

      log.info(
        { departmentId, userId, email: row.headEmail, event: "row_created" },
        `Bulk row ${i + 1}/${rows.length} created`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      log.warn(
        { index: i, departmentName: row.departmentName, error: message },
        `Bulk row ${i + 1}/${rows.length} failed`,
      )
      result.errors.push({
        index: i,
        departmentName: row.departmentName,
        headEmail: row.headEmail,
        message,
      })
    }
  }

  log.info(
    {
      created: result.created.length,
      errors: result.errors.length,
      event: "bulk_create_completed",
    },
    "Bulk department creation completed",
  )

  return result
}
