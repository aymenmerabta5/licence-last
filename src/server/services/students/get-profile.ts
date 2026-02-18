"use cache"

import "server-only"

import { eq } from "drizzle-orm"
import { cacheTag, cacheLife } from "next/cache"

import { db } from "@/server/db"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { studentLanguage } from "@/server/db/schema/languages"
import { skillTag } from "@/server/db/schema/skills"
import { user } from "@/server/db/schema/auth"
import { CACHE_TAGS } from "@/lib/cache"

/**
 * Get a student's profile with their skills. Returns null if no profile exists.
 * Cached for 15 minutes per user.
 */
export async function getStudentProfile(userId: string) {
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.STUDENT_PROFILE(userId))
  cacheTag(CACHE_TAGS.PUBLIC_PROFILE(userId))
  const [profile] = await db
    .select()
    .from(studentProfile)
    .where(eq(studentProfile.userId, userId))
    .limit(1)

  if (!profile) return null

  const [studentUser] = await db
    .select({
      name: user.name,
      email: user.email,
      universityId: user.universityId,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  const skills = await db
    .select({
      id: skillTag.id,
      name: skillTag.name,
      slug: skillTag.slug,
      category: skillTag.category,
    })
    .from(studentSkill)
    .innerJoin(skillTag, eq(studentSkill.skillTagId, skillTag.id))
    .where(eq(studentSkill.userId, userId))

  const languages = await db
    .select({
      languageCode: studentLanguage.languageCode,
      proficiency: studentLanguage.proficiency,
    })
    .from(studentLanguage)
    .where(eq(studentLanguage.userId, userId))

  return {
    profile,
    user: studentUser ?? null,
    skills,
    languages,
  }
}
