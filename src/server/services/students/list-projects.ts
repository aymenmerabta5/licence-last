import "server-only"

import { desc, eq } from "drizzle-orm"

import { db } from "@/server/db"
import { studentProject } from "@/server/db/schema/student-cv"

export async function listStudentProjects(userId: string) {
  return db
    .select({
      id: studentProject.id,
      name: studentProject.name,
      summary: studentProject.summary,
      projectUrl: studentProject.projectUrl,
      repositoryUrl: studentProject.repositoryUrl,
      startDate: studentProject.startDate,
      endDate: studentProject.endDate,
      createdAt: studentProject.createdAt,
      updatedAt: studentProject.updatedAt,
    })
    .from(studentProject)
    .where(eq(studentProject.userId, userId))
    .orderBy(
      desc(studentProject.startDate),
      desc(studentProject.createdAt),
    )
}
