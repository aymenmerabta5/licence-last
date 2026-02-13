import "server-only"

import { randomUUID } from "node:crypto"

import { createModuleLogger } from "@/server/logging"
import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"

const log = createModuleLogger("services/departments/create")

export async function createDepartment(data: {
  universityId: string
  name: string
  headName?: string
}) {
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
