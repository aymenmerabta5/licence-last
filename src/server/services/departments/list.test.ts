import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockChain: any = {
  select: mock(() => mockChain),
  from: mock(() => mockChain),
  where: mock(() => mockChain),
  orderBy: mock(() => Promise.resolve([])),
}
let moduleImportCounter = 0

function applyListDepartmentsMocks() {
  mock.module("@/server/db", () => ({ db: mockChain }))
}

async function loadListDepartmentsModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/departments/list?test=${moduleImportCounter}`
  )
}

describe("listDepartments", () => {
  beforeEach(() => {
    applyListDepartmentsMocks()
    for (const fn of Object.values(mockChain))
      (fn as ReturnType<typeof mock>).mockClear()
    mockChain.select.mockReturnValue(mockChain)
    mockChain.from.mockReturnValue(mockChain)
    mockChain.where.mockReturnValue(mockChain)
  })

  test("should return list of departments", async () => {
    const depts = [
      {
        id: "d1",
        name: "CS",
        headUserId: "u-1",
        headUserName: "Dr. A",
        headUserEmail: "a@example.com",
        skillCount: 2,
        createdAt: new Date(),
      },
      {
        id: "d2",
        name: "Math",
        headUserId: null,
        headUserName: null,
        headUserEmail: null,
        skillCount: 0,
        createdAt: new Date(),
      },
    ]
    mockChain.orderBy.mockResolvedValue(depts)

    const { listDepartments } = await loadListDepartmentsModule()
    const result = await listDepartments("uni-1")

    expect(result).toHaveLength(2)
    expect(result[0].name).toBe("CS")
  })

  test("should return empty array when no departments exist", async () => {
    mockChain.orderBy.mockResolvedValue([])

    const { listDepartments } = await loadListDepartmentsModule()
    const result = await listDepartments("uni-1")

    expect(result).toHaveLength(0)
  })

  test("should call select and filter by universityId", async () => {
    mockChain.orderBy.mockResolvedValue([])

    const { listDepartments } = await loadListDepartmentsModule()
    await listDepartments("uni-1")

    expect(mockChain.select).toHaveBeenCalled()
    expect(mockChain.where).toHaveBeenCalled()
  })
})
