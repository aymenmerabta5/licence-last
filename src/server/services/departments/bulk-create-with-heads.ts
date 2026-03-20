import "server-only"

import { randomBytes } from "node:crypto"

import { eq } from "drizzle-orm"
import { auth, pendingWelcomeEmails } from "@/lib/auth"
import type { BulkDepartmentRow } from "@/lib/schemas/department"
import { db } from "@/server/db"
import { user } from "@/server/db/schema/auth"
import { createModuleLogger } from "@/server/logging"
import { assignDepartmentHead } from "@/server/services/departments/assign-head"
import { createDepartment } from "@/server/services/departments/create"
import { deriveHeadNameFromEmail } from "@/server/services/departments/derive-head-name"

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
    const normalizedEmail = row.headEmail.trim().toLowerCase()
    const derivedHeadName = deriveHeadNameFromEmail(normalizedEmail)

    try {
      const { departmentId } = await createDepartment({
        universityId,
        name: row.departmentName,
      })

      let userId: string

      const [existingUser] = await db
        .select({ id: user.id, name: user.name })
        .from(user)
        .where(eq(user.email, normalizedEmail))
        .limit(1)

      const existingName = existingUser?.name?.trim() ?? ""
      const resolvedHeadName = existingName || derivedHeadName

      if (existingUser) {
        userId = existingUser.id
      } else {
        // Create user with a random password; they set their own via reset link.
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
        departmentName: row.departmentName,
        universityName,
      })

      await auth.api.requestPasswordReset({
        body: {
          email: normalizedEmail,
          redirectTo: "/reset-password/verify",
        },
      })

      result.created.push({
        departmentName: row.departmentName,
        headEmail: normalizedEmail,
        departmentId,
        userId,
      })

      log.info(
        { departmentId, userId, email: normalizedEmail, event: "row_created" },
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
        headEmail: normalizedEmail,
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
