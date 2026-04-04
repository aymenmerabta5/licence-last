import "server-only"

import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/students/upsert-profile-details")

import { studentProfile } from "@/server/db/schema/students"

type StudentProfileDetailsInput = {
  bio?: string
  phone?: string
  githubUrl?: string
  portfolioUrl?: string
  studentNumber?: string
  department?: string
  level?: string
  wilayaCode?: number
  address?: string
}

function normaliseOptionalString(
  value: string | undefined,
): string | null | undefined {
  if (value === undefined) return undefined
  return value.trim() ? value.trim() : null
}

function normaliseOptionalUrl(
  value: string | undefined,
): string | null | undefined {
  if (value === undefined) return undefined
  return value.trim() ? value.trim() : null
}

function pickDefinedFields<T extends Record<string, unknown>>(fields: T) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}

/**
 * Create or update a student profile WITHOUT touching skills.
 * Missing (undefined) fields are preserved by updating only provided fields.
 */
export async function upsertStudentProfileDetails(
  input: StudentProfileDetailsInput,
  userId: string,
) {
  log.info({ userId }, "Upserting student profile details")

  const profileChanges = pickDefinedFields({
    bio: normaliseOptionalString(input.bio),
    phone: normaliseOptionalString(input.phone),
    githubUrl: normaliseOptionalUrl(input.githubUrl),
    portfolioUrl: normaliseOptionalUrl(input.portfolioUrl),
    studentNumber: normaliseOptionalString(input.studentNumber),
    department: normaliseOptionalString(input.department),
    level: normaliseOptionalString(input.level),
    wilayaCode:
      input.wilayaCode === undefined
        ? undefined
        : input.wilayaCode === 0
          ? null
          : input.wilayaCode,
    address: normaliseOptionalString(input.address),
  })

  if (Object.keys(profileChanges).length > 0) {
    await db
      .insert(studentProfile)
      .values({ userId, ...profileChanges })
      .onConflictDoUpdate({
        target: studentProfile.userId,
        set: profileChanges,
      })
  } else {
    await db.insert(studentProfile).values({ userId }).onConflictDoNothing()
  }

  log.info(
    { userId, event: "student_profile_details_upserted" },
    "Student profile details upserted",
  )
  return { userId }
}
