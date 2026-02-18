import "server-only"

import { db } from "@/server/db"
import { studentExperience } from "@/server/db/schema/student-cv"
import { StudentCvServiceError } from "@/server/services/students/cv-errors"

interface CreateStudentExperienceInput {
  title: string
  organization: string
  description?: string | null
  startDate: Date
  endDate?: Date | null
  isCurrent?: boolean
}

export async function createStudentExperience(
  input: CreateStudentExperienceInput,
  userId: string,
) {
  if (input.endDate && input.startDate > input.endDate) {
    throw new StudentCvServiceError(
      "INVALID_DATE_RANGE",
      "Experience start date must be before end date",
    )
  }

  const experienceId = crypto.randomUUID()
  const isCurrent = input.isCurrent ?? false

  await db.insert(studentExperience).values({
    id: experienceId,
    userId,
    title: input.title.trim(),
    organization: input.organization.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    startDate: input.startDate,
    endDate: isCurrent ? null : (input.endDate ?? null),
    isCurrent,
  })

  return { experienceId }
}
