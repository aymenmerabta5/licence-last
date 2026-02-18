import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentProject } from "@/server/db/schema/student-cv"
import { StudentCvServiceError } from "@/server/services/students/cv-errors"

interface UpdateStudentProjectInput {
  name?: string
  summary?: string
  projectUrl?: string | null
  repositoryUrl?: string | null
  startDate?: Date | null
  endDate?: Date | null
}

export async function updateStudentProject(
  projectId: string,
  input: UpdateStudentProjectInput,
  userId: string,
) {
  const [existing] = await db
    .select()
    .from(studentProject)
    .where(eq(studentProject.id, projectId))
    .limit(1)

  if (!existing) {
    throw new StudentCvServiceError("PROJECT_NOT_FOUND", "Project not found")
  }

  if (existing.userId !== userId) {
    throw new StudentCvServiceError(
      "PROJECT_FORBIDDEN",
      "You do not have access to this project",
    )
  }

  const nextStartDate =
    input.startDate !== undefined ? input.startDate : existing.startDate
  const nextEndDate = input.endDate !== undefined ? input.endDate : existing.endDate

  if (nextStartDate && nextEndDate && nextStartDate > nextEndDate) {
    throw new StudentCvServiceError(
      "INVALID_DATE_RANGE",
      "Project start date must be before end date",
    )
  }

  await db
    .update(studentProject)
    .set({
      name: input.name?.trim() ?? existing.name,
      summary: input.summary?.trim() ?? existing.summary,
      projectUrl:
        input.projectUrl !== undefined
          ? (input.projectUrl?.trim() ? input.projectUrl.trim() : null)
          : existing.projectUrl,
      repositoryUrl:
        input.repositoryUrl !== undefined
          ? (input.repositoryUrl?.trim() ? input.repositoryUrl.trim() : null)
          : existing.repositoryUrl,
      startDate: nextStartDate,
      endDate: nextEndDate,
    })
    .where(eq(studentProject.id, projectId))

  return { projectId }
}
