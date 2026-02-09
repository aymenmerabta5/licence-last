import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { user } from "@/server/db/schema/auth"

/**
 * Create or update a student profile and replace their skills.
 * Also marks the user's onboarding as completed.
 */
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

  await db.transaction(async (tx) => {
    // Upsert student profile
    await tx
      .insert(studentProfile)
      .values({
        userId,
        bio: data.bio || null,
        phone: data.phone || null,
        githubUrl: data.githubUrl || null,
        portfolioUrl: data.portfolioUrl || null,
        studentNumber: data.studentNumber || null,
        department: data.department || null,
        level: data.level || null,
        wilayaCode: data.wilayaCode || null,
        address: data.address || null,
      })
      .onConflictDoUpdate({
        target: studentProfile.userId,
        set: {
          bio: data.bio || null,
          phone: data.phone || null,
          githubUrl: data.githubUrl || null,
          portfolioUrl: data.portfolioUrl || null,
          studentNumber: data.studentNumber || null,
          department: data.department || null,
          level: data.level || null,
          wilayaCode: data.wilayaCode || null,
          address: data.address || null,
        },
      })

    // Replace skills: delete all existing, insert new
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

    // Mark onboarding as completed
    await tx
      .update(user)
      .set({ onboardingCompleted: true })
      .where(eq(user.id, userId))
  })

  return { userId }
}
