import { beforeEach, describe, expect, mock, test } from "bun:test"

// Separate mocks for select chain vs transaction update chain
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectLimitQueue: unknown[][] = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock((): any => Promise.resolve(selectLimitQueue.shift() ?? []))
const mockSelectWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockSelectWhere }))
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
let moduleImportCounter = 0

function applyAssignHeadMocks() {
  mock.module("@/server/db", () => ({
    db: { select: mockSelect, transaction: mockTransaction },
  }))
}

async function loadAssignHeadModule() {
  moduleImportCounter += 1
  return import(`@/server/services/departments/assign-head?test=${moduleImportCounter}`)
}

describe("assignDepartmentHead", () => {
  beforeEach(() => {
    selectLimitQueue.length = 0
    applyAssignHeadMocks()
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
    selectLimitQueue.push([])

    const { assignDepartmentHead } = await loadAssignHeadModule()
    expect(assignDepartmentHead("dept-1", "user-1")).rejects.toThrow(
      "Department not found",
    )
  })

  test("should throw when user not found", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", universityId: "uni-1", name: "CS" }],
      [],
    )

    const { assignDepartmentHead } = await loadAssignHeadModule()
    expect(assignDepartmentHead("dept-1", "user-1")).rejects.toThrow(
      "User not found",
    )
  })

  test("should return success when both exist", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", universityId: "uni-1", name: "CS" }],
      [{ id: "user-1", role: "student" }],
    )

    const { assignDepartmentHead } = await loadAssignHeadModule()
    const result = await assignDepartmentHead("dept-1", "user-1")
    expect(result).toEqual({
      success: true,
      departmentId: "dept-1",
      userId: "user-1",
    })
  })

  test("should update user role and scope in a transaction", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", universityId: "uni-1", name: "CS" }],
      [{ id: "user-1", role: "student" }],
    )

    const { assignDepartmentHead } = await loadAssignHeadModule()
    await assignDepartmentHead("dept-1", "user-1")

    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockTxUpdate).toHaveBeenCalledTimes(1)
    expect(mockTxUpdateSet).toHaveBeenCalledTimes(1)
    expect(mockTxUpdateWhere).toHaveBeenCalledTimes(1)
  })

  test("should make two select queries (dept + user)", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", universityId: "uni-1", name: "CS" }],
      [{ id: "user-1", role: "student" }],
    )

    const { assignDepartmentHead } = await loadAssignHeadModule()
    await assignDepartmentHead("dept-1", "user-1")

    expect(mockSelect).toHaveBeenCalledTimes(2)
    expect(mockLimit).toHaveBeenCalledTimes(2)
  })
})
