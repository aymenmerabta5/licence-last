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

interface DepartmentListItem {
  id: string
  name: string
  headUserId: string | null
  headUserName: string | null
  headUserEmail: string | null
  createdAt: Date
  skillCount: number
}

const listDepartmentsMock = mock(async (): Promise<DepartmentListItem[]> => [])
const updateDepartmentMock = mock(async () => ({ success: true }))
const syncDepartmentSkillsMock = mock(async () => ({ success: true }))

const dbLimitMock = mock(async () => [{ universityId: "uni-1" }])
const dbWhereMock = mock(() => ({ limit: dbLimitMock }))
const dbFromMock = mock(() => ({ where: dbWhereMock }))
const dbSelectMock = mock(() => ({ from: dbFromMock }))

mock.module("@/server/orpc/rate-limited-procedures", () => ({
  authedProcedureGenerous: createProcedureMock(),
  adminProcedureStandard: createProcedureMock(),
  universityProcedureAssistant: createProcedureMock(),
  universityProcedureStandard: createProcedureMock(),
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
  listDepartments: listDepartmentsMock,
}))
mock.module("@/server/services/departments/sync-skills", () => ({
  syncDepartmentSkills: syncDepartmentSkillsMock,
}))
mock.module("@/server/services/departments/unassign-head", () => ({
  unassignDepartmentHead: mock(async () => ({ success: true })),
}))
mock.module("@/server/services/departments/update", () => ({
  updateDepartment: updateDepartmentMock,
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
    listDepartmentsMock.mockClear()
    updateDepartmentMock.mockClear()
    syncDepartmentSkillsMock.mockClear()
    dbSelectMock.mockClear()
    dbFromMock.mockClear()
    dbWhereMock.mockClear()
    dbLimitMock.mockClear()
    dbLimitMock.mockResolvedValue([{ universityId: "uni-1" }])
  })

  test("createDepartmentProcedure passes university context to service", async () => {
    const { createDepartmentProcedure } = await import(
      "@/server/orpc/routes/departments"
    )

    const result = await callProcedure(createDepartmentProcedure, {
      input: { name: "Computer Science" },
      context: { user: { role: "university_admin", universityId: "uni-1" } },
    })

    expect(result).toEqual({ departmentId: "dept-1" })
    expect(createDepartmentMock).toHaveBeenCalledWith({
      universityId: "uni-1",
      name: "Computer Science",
    })
  })

  test("createDepartmentProcedure maps duplicate-name service errors", async () => {
    createDepartmentMock.mockRejectedValueOnce(
      new ServiceError(
        "DEPARTMENT_NAME_EXISTS",
        "Department with this name already exists",
      ),
    )
    const { createDepartmentProcedure } = await import(
      "@/server/orpc/routes/departments"
    )

    await expect(
      callProcedure(createDepartmentProcedure, {
        input: { name: "Computer Science" },
        context: { user: { role: "university_admin", universityId: "uni-1" } },
      }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
      message: "Department with this name already exists",
    })
  })

  test("createDepartmentProcedure allows super admin with explicit university", async () => {
    const { createDepartmentProcedure } = await import(
      "@/server/orpc/routes/departments"
    )

    const result = await callProcedure(createDepartmentProcedure, {
      input: { name: "Computer Science", universityId: "uni-2" },
      context: { user: { role: "super_admin", universityId: null } },
    })

    expect(result).toEqual({ departmentId: "dept-1" })
    expect(createDepartmentMock).toHaveBeenCalledWith({
      universityId: "uni-2",
      name: "Computer Science",
    })
  })

  test("createDepartmentProcedure requires university selection for super admin without context", async () => {
    const { createDepartmentProcedure } = await import(
      "@/server/orpc/routes/departments"
    )

    await expect(
      callProcedure(createDepartmentProcedure, {
        input: { name: "Computer Science" },
        context: { user: { role: "super_admin", universityId: null } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      data: { code: "UNIVERSITY_REQUIRED_FOR_SUPER_ADMIN_ACTIONS" },
    })
  })

  test("assignDepartmentHeadProcedure delegates when department is manageable", async () => {
    const { assignDepartmentHeadProcedure } = await import(
      "@/server/orpc/routes/departments"
    )

    const result = await callProcedure(assignDepartmentHeadProcedure, {
      input: { departmentId: "dept-1", userId: "user-1" },
      context: { user: { role: "university_admin", universityId: "uni-1" } },
    })

    expect(result).toEqual({ success: true })
    expect(assignDepartmentHeadMock).toHaveBeenCalledWith("dept-1", "user-1")
  })

  test("listDepartmentsProcedure strips department-head contact details for students", async () => {
    listDepartmentsMock.mockResolvedValueOnce([
      {
        id: "dept-1",
        name: "Computer Science",
        headUserId: "head-1",
        headUserName: "Dr. Head",
        headUserEmail: "head@example.com",
        createdAt: new Date("2026-01-01"),
        skillCount: 12,
      },
    ])

    const { listDepartmentsProcedure } = await import(
      "@/server/orpc/routes/departments"
    )

    const result = await callProcedure(listDepartmentsProcedure, {
      input: { universityId: "uni-1" },
      context: { user: { role: "student", universityId: "uni-1" } },
    })

    expect(result).toEqual([
      {
        id: "dept-1",
        name: "Computer Science",
        headUserId: null,
        headUserName: null,
        headUserEmail: null,
        createdAt: new Date("2026-01-01"),
        skillCount: 12,
      },
    ])
  })

  test("listDepartmentsProcedure rejects cross-university requests for non-admins", async () => {
    const { listDepartmentsProcedure } = await import(
      "@/server/orpc/routes/departments"
    )

    await expect(
      callProcedure(listDepartmentsProcedure, {
        input: { universityId: "uni-2" },
        context: { user: { role: "student", universityId: "uni-1" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      data: { code: "DEPARTMENT_SCOPE_FORBIDDEN" },
    })

    await expect(
      callProcedure(listDepartmentsProcedure, {
        input: { universityId: "uni-2" },
        context: { user: { role: "university_admin", universityId: "uni-1" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      data: { code: "DEPARTMENT_SCOPE_FORBIDDEN" },
    })

    expect(listDepartmentsMock).not.toHaveBeenCalled()
  })

  test("updateDepartmentProcedure enforces department scope", async () => {
    const { updateDepartmentProcedure } = await import(
      "@/server/orpc/routes/departments"
    )

    await expect(
      callProcedure(updateDepartmentProcedure, {
        input: { departmentId: "dept-1", name: "New Name" },
        context: { user: { role: "dept_head", universityId: "uni-1" } },
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      data: { code: "DEPARTMENT_ADMIN_ACCESS_REQUIRED" },
    })

    expect(updateDepartmentMock).not.toHaveBeenCalled()
  })

  test("syncDepartmentSkillsProcedure maps invalid skill ids to a bad request", async () => {
    syncDepartmentSkillsMock.mockRejectedValueOnce(
      new ServiceError(
        "INVALID_SKILL_TAG_IDS",
        "Invalid skill tag IDs: stale-skill",
      ),
    )

    const { syncDepartmentSkillsProcedure } = await import(
      "@/server/orpc/routes/departments"
    )

    await expect(
      callProcedure(syncDepartmentSkillsProcedure, {
        input: {
          departmentId: "dept-1",
          skillTagIds: ["stale-skill"],
        },
        context: { user: { role: "university_admin", universityId: "uni-1" } },
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Invalid skill tag IDs: stale-skill",
    })
  })
})
