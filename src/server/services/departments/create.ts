import "server-only"

import { randomUUID } from "node:crypto"

import { and, eq } from "drizzle-orm"
import { db } from "@/server/db"
import { department } from "@/server/db/schema/departments"
import { createModuleLogger } from "@/server/logging"
import { ServiceError } from "@/server/services/errors"

const log = createModuleLogger("services/departments/create")

export async function createDepartment(data: {
  universityId: string
  name: string
}) {
  const existing = await db.query.department.findFirst({
    where: and(
      eq(department.universityId, data.universityId),
      eq(department.name, data.name.trim()),
    ),
  })

  if (existing) {
    throw new ServiceError(
      "DEPARTMENT_NAME_EXISTS",
      "Department with this name already exists",
    )
  }

  const id = randomUUID()

  log.info(
    { universityId: data.universityId, name: data.name },
    "Creating department",
  )

  await db.insert(department).values({
    id,
    universityId: data.universityId,
    name: data.name.trim(),
  })

  log.info({ id, event: "department_created" }, "Department created")
  return { departmentId: id }
}
