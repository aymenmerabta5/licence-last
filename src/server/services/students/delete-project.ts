import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentProject } from "@/server/db/schema/student-cv"
import { StudentCvServiceError } from "@/server/services/students/cv-errors"

export async function deleteStudentProject(projectId: string, userId: string) {
  const [existing] = await db
    .select({
      id: studentProject.id,
      userId: studentProject.userId,
    })
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

  await db.delete(studentProject).where(eq(studentProject.id, projectId))

  return { projectId, deleted: true }
}
