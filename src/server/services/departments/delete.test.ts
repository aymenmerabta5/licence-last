import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock((): any => Promise.resolve([]))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockTxUpdateWhere = mock(() => Promise.resolve())
const mockTxUpdateSet = mock(() => ({ where: mockTxUpdateWhere }))
const mockTxUpdate = mock(() => ({ set: mockTxUpdateSet }))

const mockTxDeleteWhere = mock(() => Promise.resolve())
const mockTxDelete = mock(() => ({ where: mockTxDeleteWhere }))

const mockTransaction = mock(
  async (callback: (tx: { update: typeof mockTxUpdate; delete: typeof mockTxDelete }) => Promise<unknown>) =>
    callback({
      update: mockTxUpdate,
      delete: mockTxDelete,
    }),
)

mock.module("@/server/db", () => ({
  db: {
    select: mockSelect,
    transaction: mockTransaction,
  },
}))

describe("deleteDepartment", () => {
  beforeEach(() => {
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockTxUpdate.mockClear()
    mockTxUpdateSet.mockClear()
    mockTxUpdateWhere.mockClear()
    mockTxDelete.mockClear()
    mockTxDeleteWhere.mockClear()
    mockTransaction.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockTxUpdate.mockReturnValue({ set: mockTxUpdateSet })
    mockTxUpdateSet.mockReturnValue({ where: mockTxUpdateWhere })
    mockTxUpdateWhere.mockResolvedValue(undefined)
    mockTxDelete.mockReturnValue({ where: mockTxDeleteWhere })
    mockTxDeleteWhere.mockResolvedValue(undefined)
  })

  test("should throw when department is not found", async () => {
    mockLimit.mockResolvedValueOnce([])

    const { deleteDepartment } = await import("./delete")
    expect(deleteDepartment("missing-department")).rejects.toThrow("Department not found")
  })

  test("should demote dept heads and delete the department", async () => {
    mockLimit.mockResolvedValueOnce([{ id: "dept-1" }])

    const { deleteDepartment } = await import("./delete")
    const result = await deleteDepartment("dept-1")

    expect(result).toEqual({ success: true, departmentId: "dept-1" })
    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockTxUpdate).toHaveBeenCalledTimes(1)
    expect(mockTxDelete).toHaveBeenCalledTimes(1)
  })
})
