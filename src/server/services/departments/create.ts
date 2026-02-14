import "server-only"

import { randomUUID } from "node:crypto"

import { eq, and } from "drizzle-orm"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"

const log = createModuleLogger("services/departments/create")

export async function createDepartment(data: {
  universityId: string
  name: string
  headName?: string
}) {
  const existing = await db.query.department.findFirst({
    where: and(
      eq(department.universityId, data.universityId),
      eq(department.name, data.name.trim()),
    ),
  })

  if (existing) {
    throw new Error("Department with this name already exists")
  }

  const id = randomUUID()

  log.info({ universityId: data.universityId, name: data.name }, "Creating department")

  await db.insert(department).values({
    id,
    universityId: data.universityId,
    name: data.name.trim(),
    headName: data.headName?.trim() || null,
  })

  log.info({ id, event: "department_created" }, "Department created")
  return { departmentId: id }
}
