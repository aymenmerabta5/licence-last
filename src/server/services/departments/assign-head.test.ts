import { describe, test, expect, mock, beforeEach } from "bun:test"

// Separate mocks for select chain vs transaction update chain
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock((): any => Promise.resolve([]))
const mockSelectWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockTxUpdateWhere = mock(() => Promise.resolve())
const mockTxUpdateSet = mock(() => ({ where: mockTxUpdateWhere }))
const mockTxUpdate = mock(() => ({ set: mockTxUpdateSet }))

const mockTransaction = mock(async (callback: (tx: { update: typeof mockTxUpdate }) => Promise<unknown>) =>
  callback({
    update: mockTxUpdate,
  }),
)

mock.module("@/server/db", () => ({
  db: { select: mockSelect, transaction: mockTransaction },
}))

describe("assignDepartmentHead", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockSelectWhere.mockClear()
    mockLimit.mockClear()
    mockTxUpdate.mockClear()
    mockTxUpdateSet.mockClear()
    mockTxUpdateWhere.mockClear()
    mockTransaction.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockLimit })
    mockTxUpdate.mockReturnValue({ set: mockTxUpdateSet })
    mockTxUpdateSet.mockReturnValue({ where: mockTxUpdateWhere })
    mockTxUpdateWhere.mockResolvedValue(undefined)
  })

  test("should throw when department not found", async () => {
    mockLimit.mockResolvedValueOnce([])

    const { assignDepartmentHead } = await import("./assign-head")
    expect(assignDepartmentHead("dept-1", "user-1")).rejects.toThrow("Department not found")
  })

  test("should throw when user not found", async () => {
    mockLimit
      .mockResolvedValueOnce([{ id: "dept-1", universityId: "uni-1", name: "CS" }])
      .mockResolvedValueOnce([])

    const { assignDepartmentHead } = await import("./assign-head")
    expect(assignDepartmentHead("dept-1", "user-1")).rejects.toThrow("User not found")
  })

  test("should return success when both exist", async () => {
    mockLimit
      .mockResolvedValueOnce([{ id: "dept-1", universityId: "uni-1", name: "CS" }])
      .mockResolvedValueOnce([{ id: "user-1", role: "student" }])

    const { assignDepartmentHead } = await import("./assign-head")
    const result = await assignDepartmentHead("dept-1", "user-1")
    expect(result).toEqual({ success: true, departmentId: "dept-1", userId: "user-1" })
  })

  test("should update both user role and department headName in a transaction", async () => {
    mockLimit
      .mockResolvedValueOnce([{ id: "dept-1", universityId: "uni-1", name: "CS" }])
      .mockResolvedValueOnce([{ id: "user-1", role: "student" }])

    const { assignDepartmentHead } = await import("./assign-head")
    await assignDepartmentHead("dept-1", "user-1")

    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockTxUpdate).toHaveBeenCalledTimes(2)
    expect(mockTxUpdateSet).toHaveBeenCalledTimes(2)
    expect(mockTxUpdateWhere).toHaveBeenCalledTimes(2)
  })

  test("should make two select queries (dept + user)", async () => {
    mockLimit
      .mockResolvedValueOnce([{ id: "dept-1", universityId: "uni-1", name: "CS" }])
      .mockResolvedValueOnce([{ id: "user-1", role: "student" }])

    const { assignDepartmentHead } = await import("./assign-head")
    await assignDepartmentHead("dept-1", "user-1")

    expect(mockSelect).toHaveBeenCalledTimes(2)
    expect(mockLimit).toHaveBeenCalledTimes(2)
  })
})
