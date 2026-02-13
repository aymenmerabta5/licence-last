import "server-only"

import { eq } from "drizzle-orm"

import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"

export async function listDepartments(universityId: string) {
  return db
    .select({
      id: department.id,
      name: department.name,
      headName: department.headName,
      createdAt: department.createdAt,
    })
    .from(department)
    .where(eq(department.universityId, universityId))
    .orderBy(department.name)
}
