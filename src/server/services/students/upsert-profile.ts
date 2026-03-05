import "server-only"

import { eq } from "drizzle-orm"
import { db } from "@/server/db"
import { createModuleLogger } from "@/server/logging"

const log = createModuleLogger("services/students/upsert-profile")

import { ServiceError } from "@/server/services/errors"
import { normalizeLanguageEntries } from "@/lib/constants/languages"
import type { ProficiencyLevel } from "@/lib/schemas/enums"
import { user } from "@/server/db/schema/auth"
import { studentLanguage } from "@/server/db/schema/languages"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { validateSkillTagIds } from "@/server/services/skills/validate"

interface StudentLanguageInput {
  languageCode: string
  proficiency: ProficiencyLevel
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

  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(studentProfile)
      .where(eq(studentProfile.userId, userId))
      .limit(1)

    const nextProfile = {
      userId,
      bio: data.bio !== undefined ? data.bio || null : (existing?.bio ?? null),
      phone:
        data.phone !== undefined
          ? data.phone || null
          : (existing?.phone ?? null),
      githubUrl:
        data.githubUrl !== undefined
          ? data.githubUrl || null
          : (existing?.githubUrl ?? null),
      portfolioUrl:
        data.portfolioUrl !== undefined
          ? data.portfolioUrl || null
          : (existing?.portfolioUrl ?? null),
      studentNumber:
        data.studentNumber !== undefined
          ? data.studentNumber || null
          : (existing?.studentNumber ?? null),
      department:
        data.department !== undefined
          ? data.department || null
          : (existing?.department ?? null),
      departmentId:
        data.departmentId !== undefined
          ? data.departmentId || null
          : (existing?.departmentId ?? null),
      level:
        data.level !== undefined
          ? data.level || null
          : (existing?.level ?? null),
      wilayaCode:
        data.wilayaCode !== undefined
          ? data.wilayaCode || null
          : (existing?.wilayaCode ?? null),
      address:
        data.address !== undefined
          ? data.address || null
          : (existing?.address ?? null),
    }

    await tx
      .insert(studentProfile)
      .values({
        userId: nextProfile.userId,
        bio: nextProfile.bio,
        phone: nextProfile.phone,
        githubUrl: nextProfile.githubUrl,
        portfolioUrl: nextProfile.portfolioUrl,
        studentNumber: nextProfile.studentNumber,
        department: nextProfile.department,
        departmentId: nextProfile.departmentId,
        level: nextProfile.level,
        wilayaCode: nextProfile.wilayaCode,
        address: nextProfile.address,
      })
      .onConflictDoUpdate({
        target: studentProfile.userId,
        set: {
          bio: nextProfile.bio,
          phone: nextProfile.phone,
          githubUrl: nextProfile.githubUrl,
          portfolioUrl: nextProfile.portfolioUrl,
          studentNumber: nextProfile.studentNumber,
          department: nextProfile.department,
          departmentId: nextProfile.departmentId,
          level: nextProfile.level,
          wilayaCode: nextProfile.wilayaCode,
          address: nextProfile.address,
        },
      })

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
      .set({ onboardingCompleted: true })
      .where(eq(user.id, userId))
  })

  log.info(
    { userId, event: "student_profile_upserted" },
    "Student profile upserted",
  )
  return { userId }
}
