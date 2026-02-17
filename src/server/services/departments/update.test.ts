import { describe, test, expect, mock, beforeEach } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockReturningResult: any[] = []

const mockReturning = mock(() => Promise.resolve(mockReturningResult))
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

mock.module("@/server/db", () => ({
  db: { update: mockUpdate },
}))

describe("updateDepartment", () => {
  beforeEach(() => {
    mockReturningResult = [{ id: "dept-1" }]
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
    mockReturning.mockImplementation(() => Promise.resolve(mockReturningResult))
  })

  test("should update name when provided", async () => {
    const { updateDepartment } = await import("./update")
    const result = await updateDepartment("dept-1", { name: "New Name" })
    expect(result).toEqual({ success: true })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should update headName when provided", async () => {
    const { updateDepartment } = await import("./update")
    const result = await updateDepartment("dept-1", { headName: "Dr. New" })
    expect(result).toEqual({ success: true })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should set headName to null when explicitly set to null", async () => {
    const { updateDepartment } = await import("./update")
    const result = await updateDepartment("dept-1", { headName: null })
    expect(result).toEqual({ success: true })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should return success without DB call when no updates provided", async () => {
    const { updateDepartment } = await import("./update")
    const result = await updateDepartment("dept-1", {})
    expect(result).toEqual({ success: true })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  test("should update both fields when both provided", async () => {
    const { updateDepartment } = await import("./update")
    const result = await updateDepartment("dept-1", { name: "X", headName: "Dr. X" })
    expect(result).toEqual({ success: true })
    expect(mockUpdate).toHaveBeenCalledTimes(1)
  })

  test("should throw when department does not exist", async () => {
    mockReturningResult = []

    const { updateDepartment } = await import("./update")

    await expect(updateDepartment("missing-dept", { name: "New Name" })).rejects.toMatchObject({
      code: "DEPARTMENT_NOT_FOUND",
      message: "Department not found",
    })
  })
})
