import "server-only"

import { desc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentExperience } from "@/server/db/schema/student-cv"

export async function listStudentExperiences(userId: string) {
  return db
    .select({
      id: studentExperience.id,
      title: studentExperience.title,
      organization: studentExperience.organization,
      description: studentExperience.description,
      startDate: studentExperience.startDate,
      endDate: studentExperience.endDate,
      isCurrent: studentExperience.isCurrent,
      createdAt: studentExperience.createdAt,
      updatedAt: studentExperience.updatedAt,
    })
    .from(studentExperience)
    .where(eq(studentExperience.userId, userId))
    .orderBy(
      desc(studentExperience.startDate),
      desc(studentExperience.createdAt),
    )
}
