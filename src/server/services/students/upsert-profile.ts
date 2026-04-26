import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/students/upsert-profile")

import { normalizeLanguageEntries } from "@/lib/constants/languages"
import type { ProficiencyLevel } from "@/lib/schemas/enums"
import { user } from "@/server/db/schema/auth"
import { studentLanguage } from "@/server/db/schema/languages"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { ServiceError } from "@/server/services/errors"
import { validateSkillTagIds } from "@/server/services/skills/validate"

interface StudentLanguageInput {
  languageCode: string
  proficiency: ProficiencyLevel
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

export async function upsertStudentProfile(
  data: {
    bio?: string
    phone?: string
    githubUrl?: string
    portfolioUrl?: string
    studentNumber?: string
    department?: string
    departmentId?: string
    level?: string
    wilayaCode?: number
    address?: string
  },
  skillTagIds: string[],
  userId: string,
  languages?: StudentLanguageInput[],
) {
  log.info(
    { userId, skillCount: skillTagIds.length },
    "Upserting student profile",
  )

  if (skillTagIds.length > 10) {
    throw new ServiceError(
      "SKILL_LIMIT_EXCEEDED",
      "A maximum of 10 skills is allowed",
    )
  }

  if (skillTagIds.length > 0) {
    await validateSkillTagIds(skillTagIds)
  }

  const normalizedLanguages =
    languages === undefined ? undefined : normalizeLanguageEntries(languages)

  const profileChanges = pickDefinedFields({
    bio: normaliseOptionalString(data.bio),
    phone: normaliseOptionalString(data.phone),
    githubUrl: normaliseOptionalUrl(data.githubUrl),
    portfolioUrl: normaliseOptionalUrl(data.portfolioUrl),
    studentNumber: normaliseOptionalString(data.studentNumber),
    department: normaliseOptionalString(data.department),
    departmentId:
      data.departmentId === undefined
        ? undefined
        : data.departmentId.trim()
          ? data.departmentId.trim()
          : null,
    level: normaliseOptionalString(data.level),
    wilayaCode:
      data.wilayaCode === undefined
        ? undefined
        : data.wilayaCode === 0
          ? null
          : data.wilayaCode,
    address: normaliseOptionalString(data.address),
  })

  await db.transaction(async (tx) => {
    if (Object.keys(profileChanges).length > 0) {
      await tx
        .insert(studentProfile)
        .values({ userId, ...profileChanges })
        .onConflictDoUpdate({
          target: studentProfile.userId,
          set: profileChanges,
        })
    } else {
      await tx.insert(studentProfile).values({ userId }).onConflictDoNothing()
    }

    await tx.delete(studentSkill).where(eq(studentSkill.userId, userId))

    if (skillTagIds.length > 0) {
      await tx.insert(studentSkill).values(
        skillTagIds.map((skillTagId) => ({
          userId,
          skillTagId,
        })),
      )
    }

    if (normalizedLanguages !== undefined) {
      await tx.delete(studentLanguage).where(eq(studentLanguage.userId, userId))

      if (normalizedLanguages.length > 0) {
        await tx.insert(studentLanguage).values(
          normalizedLanguages.map((entry) => ({
            userId,
            languageCode: entry.languageCode,
            proficiency: entry.proficiency,
          })),
        )
      }
    }

    await tx
      .update(user)
      .set(
        pickDefinedFields({
          onboardingCompleted: true,
          departmentId:
            data.departmentId === undefined
              ? undefined
              : data.departmentId.trim()
                ? data.departmentId.trim()
                : null,
        }),
      )
      .where(eq(user.id, userId))
  })

  log.info(
    { userId, event: "student_profile_upserted" },
    "Student profile upserted",
  )
  return { userId }
}
