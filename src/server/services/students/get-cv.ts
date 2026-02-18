import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentResume } from "@/server/db/schema/student-cv"
import { listStudentExperiences } from "@/server/services/students/list-experiences"
import { listStudentProjects } from "@/server/services/students/list-projects"

export async function getStudentCv(userId: string) {
  const [experiences, projects, resume] = await Promise.all([
    listStudentExperiences(userId),
    listStudentProjects(userId),
    db
      .select({
        fileKey: studentResume.fileKey,
        fileName: studentResume.fileName,
        fileUrl: studentResume.fileUrl,
        fileSizeBytes: studentResume.fileSizeBytes,
        mimeType: studentResume.mimeType,
        uploadedAt: studentResume.uploadedAt,
      })
      .from(studentResume)
      .where(eq(studentResume.userId, userId))
      .limit(1)
      .then((rows) => rows[0] ?? null),
  ])

  return {
    experiences,
    projects,
    resume,
  }
}
