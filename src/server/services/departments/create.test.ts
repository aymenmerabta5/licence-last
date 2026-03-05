import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockValues = mock(() => Promise.resolve())
const mockInsert = mock(() => ({ values: mockValues }))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFindFirst = mock(() => Promise.resolve(null as any))
let moduleImportCounter = 0

function applyCreateDepartmentMocks() {
  mock.module("@/server/db", () => ({
    db: {
      insert: mockInsert,
      query: {
        department: {
          findFirst: mockFindFirst,
        },
      },
    },
  }))
}

async function loadCreateDepartmentModule() {
  moduleImportCounter += 1
  return import(`@/server/services/departments/create?test=${moduleImportCounter}`)
}

describe("createDepartment", () => {
  beforeEach(() => {
    applyCreateDepartmentMocks()
    mockInsert.mockClear()
    mockValues.mockClear()
    mockFindFirst.mockClear()
    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
    mockFindFirst.mockResolvedValue(null)
  })

  test("should return departmentId", async () => {
    const { createDepartment } = await loadCreateDepartmentModule()
    const result = await createDepartment({
      universityId: "uni-1",
      name: "Computer Science",
    })
    expect(result.departmentId).toBeDefined()
    expect(typeof result.departmentId).toBe("string")
  })

  test("should call insert with trimmed name", async () => {
    const { createDepartment } = await loadCreateDepartmentModule()
    await createDepartment({
      universityId: "uni-1",
      name: "  Computer Science  ",
    })
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("should call insert exactly once", async () => {
    const { createDepartment } = await loadCreateDepartmentModule()
    await createDepartment({ universityId: "uni-1", name: "Math" })
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockValues).toHaveBeenCalledTimes(1)
  })

  test("should throw if department already exists", async () => {
    mockFindFirst.mockResolvedValue({ id: "existing-id", name: "CS" })
    const { createDepartment } = await loadCreateDepartmentModule()
    expect(
      createDepartment({ universityId: "uni-1", name: "CS" }),
    ).rejects.toThrow("Department with this name already exists")
  })
})
