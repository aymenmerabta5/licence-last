import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentResume } from "@/server/db/schema/student-cv"
import { StudentCvServiceError } from "@/server/services/students/cv-errors"

export async function deleteStudentResume(userId: string) {
  const deleted = await db
    .delete(studentResume)
    .where(eq(studentResume.userId, userId))
    .returning({ fileKey: studentResume.fileKey })

  if (deleted.length === 0) {
    throw new StudentCvServiceError("RESUME_NOT_FOUND", "Resume not found")
  }

  return { deleted: true, fileKey: deleted[0].fileKey }
}
