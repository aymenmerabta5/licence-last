import "server-only"

import { db } from "@/server/db"
import { studentProject } from "@/server/db/schema/student-cv"
import { StudentCvServiceError } from "@/server/services/students/cv-errors"

interface CreateStudentProjectInput {
  name: string
  summary: string
  projectUrl?: string | null
  repositoryUrl?: string | null
  startDate?: Date | null
  endDate?: Date | null
}

export async function createStudentProject(
  input: CreateStudentProjectInput,
  userId: string,
) {
  if (input.startDate && input.endDate && input.startDate > input.endDate) {
    throw new StudentCvServiceError(
      "INVALID_DATE_RANGE",
      "Project start date must be before end date",
    )
  }

  const projectId = crypto.randomUUID()

  await db.insert(studentProject).values({
    id: projectId,
    userId,
    name: input.name.trim(),
    summary: input.summary.trim(),
    projectUrl: input.projectUrl?.trim() ? input.projectUrl.trim() : null,
    repositoryUrl: input.repositoryUrl?.trim()
      ? input.repositoryUrl.trim()
      : null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
  })

  return { projectId }
}
