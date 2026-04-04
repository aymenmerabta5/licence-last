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

  const changes: Partial<typeof existing> = {}

  if (input.title !== undefined) {
    changes.title = input.title.trim()
  }
  if (input.organization !== undefined) {
    changes.organization = input.organization.trim()
  }
  if (input.description !== undefined) {
    changes.description = input.description?.trim()
      ? input.description.trim()
      : null
  }
  if (input.startDate !== undefined) {
    changes.startDate = nextStartDate
  }
  if (input.isCurrent !== undefined) {
    changes.isCurrent = nextIsCurrent
  }
  if (input.endDate !== undefined || input.isCurrent !== undefined) {
    changes.endDate = nextIsCurrent ? null : nextEndDate
  }

  await db
    .update(studentExperience)
    .set(changes)
    .where(eq(studentExperience.id, experienceId))

  return { experienceId }
}
