import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentExperience } from "@/server/db/schema/student-cv"
import { StudentCvServiceError } from "@/server/services/students/cv-errors"

export async function deleteStudentExperience(
  experienceId: string,
  userId: string,
) {
  const [existing] = await db
    .select({
      id: studentExperience.id,
      userId: studentExperience.userId,
    })
    .from(studentExperience)
    .where(eq(studentExperience.id, experienceId))
    .limit(1)

  if (!existing) {
    throw new StudentCvServiceError(
      "EXPERIENCE_NOT_FOUND",
      "Experience not found",
    )
  }

  if (existing.userId !== userId) {
    throw new StudentCvServiceError(
      "EXPERIENCE_FORBIDDEN",
      "You do not have access to this experience",
    )
  }

  await db
    .delete(studentExperience)
    .where(eq(studentExperience.id, experienceId))

  return { experienceId, deleted: true }
}
