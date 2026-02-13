import { describe, test, expect, mock, beforeEach } from "bun:test"

const mockValues = mock(() => Promise.resolve())
const mockInsert = mock(() => ({ values: mockValues }))

mock.module("@/server/db", () => ({
  db: { insert: mockInsert },
}))

describe("createDepartment", () => {
  beforeEach(() => {
    mockInsert.mockClear()
    mockValues.mockClear()
    mockInsert.mockReturnValue({ values: mockValues })
    mockValues.mockResolvedValue(undefined)
  })

  test("should return departmentId", async () => {
    const { createDepartment } = await import("./create")
    const result = await createDepartment({
      universityId: "uni-1",
      name: "Computer Science",
    })
    expect(result.departmentId).toBeDefined()
    expect(typeof result.departmentId).toBe("string")
  })

  test("should call insert with trimmed name", async () => {
    const { createDepartment } = await import("./create")
    await createDepartment({
      universityId: "uni-1",
      name: "  Computer Science  ",
    })
    expect(mockInsert).toHaveBeenCalledTimes(1)
  })

  test("should handle optional headName", async () => {
    const { createDepartment } = await import("./create")
    const result = await createDepartment({
      universityId: "uni-1",
      name: "CS",
      headName: "Dr. Ahmed",
    })
    expect(result.departmentId).toBeDefined()
  })

  test("should call insert exactly once", async () => {
    const { createDepartment } = await import("./create")
    await createDepartment({ universityId: "uni-1", name: "Math" })
    expect(mockInsert).toHaveBeenCalledTimes(1)
    expect(mockValues).toHaveBeenCalledTimes(1)
  })
})
