import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { skillTag } from "@/server/db/schema/skills"
import { user } from "@/server/db/schema/auth"

/** Get a student's profile with their skills. Returns null if no profile exists. */
export async function getStudentProfile(userId: string) {
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

  return {
    profile,
    user: studentUser ?? null,
    skills,
  }
}
