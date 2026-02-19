import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock((): any => Promise.resolve([]))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockTxUpdateWhere = mock(() => Promise.resolve())
const mockTxUpdateSet = mock(() => ({ where: mockTxUpdateWhere }))
const mockTxUpdate = mock(() => ({ set: mockTxUpdateSet }))

const mockTransaction = mock(
  async (callback: (tx: { update: typeof mockTxUpdate }) => Promise<unknown>) =>
    callback({
      update: mockTxUpdate,
    }),
)

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    transaction: mockTransaction,
  },
}))

describe("unassignDepartmentHead", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockTxUpdate.mockClear()
    mockTxUpdateSet.mockClear()
    mockTxUpdateWhere.mockClear()
    mockTransaction.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockTxUpdate.mockReturnValue({ set: mockTxUpdateSet })
    mockTxUpdateSet.mockReturnValue({ where: mockTxUpdateWhere })
    mockTxUpdateWhere.mockResolvedValue(undefined)
  })

  test("should throw when department is not found", async () => {
    mockLimit.mockResolvedValueOnce([])

    const { unassignDepartmentHead } = await import(
      "@/server/services/departments/unassign-head"
    )
    expect(unassignDepartmentHead("missing-department")).rejects.toThrow(
      "Department not found",
    )
  })

  test("should clear department head and demote dept head users", async () => {
    mockLimit.mockResolvedValueOnce([{ id: "dept-1" }])

    const { unassignDepartmentHead } = await import(
      "@/server/services/departments/unassign-head"
    )
    const result = await unassignDepartmentHead("dept-1")

    expect(result).toEqual({ success: true, departmentId: "dept-1" })
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockTxUpdate).toHaveBeenCalledTimes(2)
    expect(mockTxUpdateSet).toHaveBeenCalledTimes(2)
    expect(mockTxUpdateWhere).toHaveBeenCalledTimes(2)
  })
})
