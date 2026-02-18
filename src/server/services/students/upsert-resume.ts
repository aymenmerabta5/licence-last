import "server-only"

import { db } from "@/server/db"
import { studentResume } from "@/server/db/schema/student-cv"

interface UpsertStudentResumeInput {
  fileKey: string
  fileName: string
  fileUrl: string
  fileSizeBytes: number
  mimeType: string
}

export async function upsertStudentResume(
  userId: string,
  input: UpsertStudentResumeInput,
) {
  const now = new Date()

  const [resume] = await db
    .insert(studentResume)
    .values({
      userId,
      fileKey: input.fileKey,
      fileName: input.fileName,
      fileUrl: input.fileUrl,
      fileSizeBytes: input.fileSizeBytes,
      mimeType: input.mimeType,
      uploadedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: studentResume.userId,
      set: {
        fileKey: input.fileKey,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileSizeBytes: input.fileSizeBytes,
        mimeType: input.mimeType,
        uploadedAt: now,
        updatedAt: now,
      },
    })
    .returning({
      fileKey: studentResume.fileKey,
      fileName: studentResume.fileName,
      fileUrl: studentResume.fileUrl,
      fileSizeBytes: studentResume.fileSizeBytes,
      mimeType: studentResume.mimeType,
      uploadedAt: studentResume.uploadedAt,
    })

  return resume
}
