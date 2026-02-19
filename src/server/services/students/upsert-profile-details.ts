import "server-only"

import { eq } from "drizzle-orm"
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
  return value.trim() ? value : null
}

function normaliseOptionalUrl(
  value: string | undefined,
): string | null | undefined {
  if (value === undefined) return undefined
  return value.trim() ? value : null
}

/**
 * Create or update a student profile WITHOUT touching skills.
 * Missing (undefined) fields are preserved from the existing profile.
 */
export async function upsertStudentProfileDetails(
  input: StudentProfileDetailsInput,
  userId: string,
) {
  log.info({ userId }, "Upserting student profile details")

  const [existing] = await db
    .select()
    .from(studentProfile)
    .where(eq(studentProfile.userId, userId))
    .limit(1)

  const next = {
    userId,
    bio:
      normaliseOptionalString(input.bio) ??
      (input.bio === undefined ? (existing?.bio ?? null) : null),
    phone:
      normaliseOptionalString(input.phone) ??
      (input.phone === undefined ? (existing?.phone ?? null) : null),
    githubUrl:
      normaliseOptionalUrl(input.githubUrl) ??
      (input.githubUrl === undefined ? (existing?.githubUrl ?? null) : null),
    portfolioUrl:
      normaliseOptionalUrl(input.portfolioUrl) ??
      (input.portfolioUrl === undefined
        ? (existing?.portfolioUrl ?? null)
        : null),
    studentNumber:
      normaliseOptionalString(input.studentNumber) ??
      (input.studentNumber === undefined
        ? (existing?.studentNumber ?? null)
        : null),
    department:
      normaliseOptionalString(input.department) ??
      (input.department === undefined ? (existing?.department ?? null) : null),
    level:
      normaliseOptionalString(input.level) ??
      (input.level === undefined ? (existing?.level ?? null) : null),
    wilayaCode:
      input.wilayaCode === undefined
        ? (existing?.wilayaCode ?? null)
        : input.wilayaCode === 0
          ? null
          : input.wilayaCode,
    address:
      normaliseOptionalString(input.address) ??
      (input.address === undefined ? (existing?.address ?? null) : null),
  }

  await db
    .insert(studentProfile)
    .values(next)
    .onConflictDoUpdate({
      target: studentProfile.userId,
      set: {
        bio: next.bio,
        phone: next.phone,
        githubUrl: next.githubUrl,
        portfolioUrl: next.portfolioUrl,
        studentNumber: next.studentNumber,
        department: next.department,
        level: next.level,
        wilayaCode: next.wilayaCode,
        address: next.address,
      },
    })

  log.info(
    { userId, event: "student_profile_details_upserted" },
    "Student profile details upserted",
  )
  return { userId }
}
