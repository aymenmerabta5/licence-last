import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { user } from "@/server/db/schema/auth"
import { validateSkillTagIds } from "@/server/services/skills/validate"

export async function upsertStudentProfile(
  data: {
    bio?: string
    phone?: string
    githubUrl?: string
    portfolioUrl?: string
    studentNumber?: string
    department?: string
    level?: string
    wilayaCode?: number
    address?: string
  },
  skillTagIds: string[],
  userId: string,
) {
  if (skillTagIds.length > 10) {
    throw new Error("A maximum of 10 skills is allowed")
  }

  if (skillTagIds.length > 0) {
    await validateSkillTagIds(skillTagIds)
  }

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
        data.phone !== undefined ? data.phone || null : (existing?.phone ?? null),
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
      level: data.level !== undefined ? data.level || null : (existing?.level ?? null),
      wilayaCode:
        data.wilayaCode !== undefined
          ? data.wilayaCode || null
          : (existing?.wilayaCode ?? null),
      address:
        data.address !== undefined ? data.address || null : (existing?.address ?? null),
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
          level: nextProfile.level,
          wilayaCode: nextProfile.wilayaCode,
          address: nextProfile.address,
        },
      })

    await tx
      .delete(studentSkill)
      .where(eq(studentSkill.userId, userId))

    if (skillTagIds.length > 0) {
      await tx.insert(studentSkill).values(
        skillTagIds.map((skillTagId) => ({
          userId,
          skillTagId,
        })),
      )
    }

    await tx
      .update(user)
      .set({ onboardingCompleted: true })
      .where(eq(user.id, userId))
  })

  return { userId }
}
