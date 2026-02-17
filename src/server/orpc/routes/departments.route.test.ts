import { beforeEach, describe, expect, mock, test } from "bun:test"

import { ServiceError } from "@/server/services/errors"

function createProcedureMock() {
  return {
    use() {
      return this
    },
    input() {
      return this
    },
    handler<T>(fn: T) {
      return fn
    },
  }
}

async function callProcedure<T>(procedure: unknown, args: unknown): Promise<T> {
  return (procedure as (input: unknown) => Promise<T>)(args)
}

const createDepartmentMock = mock(async () => ({ departmentId: "dept-1" }))
const assignDepartmentHeadMock = mock(async () => ({ success: true }))

const dbLimitMock = mock(async () => [{ universityId: "uni-1" }])
const dbWhereMock = mock(() => ({ limit: dbLimitMock }))
const dbFromMock = mock(() => ({ where: dbWhereMock }))
const dbSelectMock = mock(() => ({ from: dbFromMock }))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedProcedureGenerous: createProcedureMock(),
  adminProcedureStandard: createProcedureMock(),
}))

mock.module("@/server/services/departments/create", () => ({
  createDepartment: createDepartmentMock,
}))
mock.module("@/server/services/departments/assign-head", () => ({
  assignDepartmentHead: assignDepartmentHeadMock,
}))
mock.module("@/server/services/departments/assign-head-by-email", () => ({
  assignDepartmentHeadByEmail: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/departments/bulk-create-with-heads", () => ({
  bulkCreateDepartmentsWithHeads: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/departments/delete", () => ({
  deleteDepartment: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/departments/get-skills", () => ({
  getDepartmentSkillIds: mock(async () => []),
}))
mock.module("@/server/services/departments/list", () => ({
  listDepartments: mock(async () => []),
}))
mock.module("@/server/services/departments/sync-skills", () => ({
  syncDepartmentSkills: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/departments/unassign-head", () => ({
  unassignDepartmentHead: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/departments/update", () => ({
  updateDepartment: mock(async () => ({ success: true })),
}))

mock.module("@/server/db", () => ({
  db: {
    select: dbSelectMock,
  },
}))

describe("src/server/orpc/routes/departments", () => {
  beforeEach(() => {
    createDepartmentMock.mockClear()
    assignDepartmentHeadMock.mockClear()
    dbSelectMock.mockClear()
    dbFromMock.mockClear()
    dbWhereMock.mockClear()
    dbLimitMock.mockClear()
    dbLimitMock.mockResolvedValue([{ universityId: "uni-1" }])
  })

  test("createDepartmentProcedure passes university context to service", async () => {
    const { createDepartmentProcedure } = await import("./departments")

    const result = await callProcedure(createDepartmentProcedure, {
      input: { name: "Computer Science", headName: "Head" },
      context: { user: { universityId: "uni-1" } },
    })

    expect(result).toEqual({ departmentId: "dept-1" })
    expect(createDepartmentMock).toHaveBeenCalledWith({
      universityId: "uni-1",
      name: "Computer Science",
      headName: "Head",
    })
  })

  test("createDepartmentProcedure maps duplicate-name service errors", async () => {
    createDepartmentMock.mockRejectedValueOnce(
      new ServiceError(
        "DEPARTMENT_NAME_EXISTS",
        "Department with this name already exists",
      ),
    )
    const { createDepartmentProcedure } = await import("./departments")

    await expect(
      callProcedure(createDepartmentProcedure, {
        input: { name: "Computer Science" },
        context: { user: { universityId: "uni-1" } },
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Department with this name already exists",
    })
  })

  test("assignDepartmentHeadProcedure delegates when department is manageable", async () => {
    const { assignDepartmentHeadProcedure } = await import("./departments")

    const result = await callProcedure(assignDepartmentHeadProcedure, {
      input: { departmentId: "dept-1", userId: "user-1" },
      context: { user: { role: "university_admin", universityId: "uni-1" } },
    })

    expect(result).toEqual({ success: true })
    expect(assignDepartmentHeadMock).toHaveBeenCalledWith("dept-1", "user-1")
  })
})
