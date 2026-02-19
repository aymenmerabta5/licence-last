import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentExperience } from "@/server/db/schema/student-cv"
import { StudentCvServiceError } from "@/server/services/students/cv-errors"

interface UpdateStudentExperienceInput {
  title?: string
  organization?: string
  description?: string | null
  startDate?: Date
  endDate?: Date | null
  isCurrent?: boolean
}

export async function updateStudentExperience(
  experienceId: string,
  input: UpdateStudentExperienceInput,
  userId: string,
) {
  const [existing] = await db
    .select()
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

  const nextIsCurrent = input.isCurrent ?? existing.isCurrent
  const nextStartDate = input.startDate ?? existing.startDate
  const nextEndDate =
    input.endDate !== undefined ? input.endDate : existing.endDate

  if (nextEndDate && nextStartDate > nextEndDate) {
    throw new StudentCvServiceError(
      "INVALID_DATE_RANGE",
      "Experience start date must be before end date",
    )
  }

  await db
    .update(studentExperience)
    .set({
      title: input.title?.trim() ?? existing.title,
      organization: input.organization?.trim() ?? existing.organization,
      description:
        input.description !== undefined
          ? input.description?.trim()
            ? input.description.trim()
            : null
          : existing.description,
      startDate: nextStartDate,
      endDate: nextIsCurrent ? null : nextEndDate,
      isCurrent: nextIsCurrent,
    })
    .where(eq(studentExperience.id, experienceId))

  return { experienceId }
}
