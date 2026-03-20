import { beforeEach, describe, expect, mock, test } from "bun:test"

// Separate mocks for select chain vs transaction update chain
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectLimitQueue: unknown[][] = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock((): any =>
  Promise.resolve(selectLimitQueue.shift() ?? []),
)
const mockSelectWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockTxUpdateWhere = mock(() => Promise.resolve())
const mockTxUpdateSet = mock(() => ({ where: mockTxUpdateWhere }))
const mockTxUpdate = mock(() => ({ set: mockTxUpdateSet }))
const mockTxInsertConflict = mock(() => Promise.resolve())
const mockTxInsertValues = mock(() => ({
  onConflictDoUpdate: mockTxInsertConflict,
}))
const mockTxInsert = mock(() => ({ values: mockTxInsertValues }))

const mockTransaction = mock(
  async (
    callback: (tx: {
      update: typeof mockTxUpdate
      insert: typeof mockTxInsert
    }) => Promise<unknown>,
  ) =>
    callback({
      update: mockTxUpdate,
      insert: mockTxInsert,
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
  return import(
    `@/server/services/departments/assign-head?test=${moduleImportCounter}`
  )
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
    mockTxInsert.mockClear()
    mockTxInsertValues.mockClear()
    mockTxInsertConflict.mockClear()
    mockTransaction.mockClear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockSelectWhere })
    mockSelectWhere.mockReturnValue({ limit: mockLimit })
    mockTxUpdate.mockReturnValue({ set: mockTxUpdateSet })
    mockTxUpdateSet.mockReturnValue({ where: mockTxUpdateWhere })
    mockTxUpdateWhere.mockResolvedValue(undefined)
    mockTxInsert.mockReturnValue({ values: mockTxInsertValues })
    mockTxInsertValues.mockReturnValue({
      onConflictDoUpdate: mockTxInsertConflict,
    })
    mockTxInsertConflict.mockResolvedValue(undefined)
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

  test("should throw when user role is ineligible", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", universityId: "uni-1", name: "CS" }],
      [{ id: "user-1", role: "company_admin", universityId: null }],
    )

    const { assignDepartmentHead } = await loadAssignHeadModule()
    expect(assignDepartmentHead("dept-1", "user-1")).rejects.toThrow(
      "User role cannot be assigned as department head",
    )
  })

  test("should throw when user belongs to another university", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", universityId: "uni-1", name: "CS" }],
      [{ id: "user-1", role: "university_admin", universityId: "uni-2" }],
    )

    const { assignDepartmentHead } = await loadAssignHeadModule()
    expect(assignDepartmentHead("dept-1", "user-1")).rejects.toThrow(
      "User belongs to a different university",
    )
  })

  test("should reject reassignment of non-dept-head roles", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", universityId: "uni-1", name: "CS" }],
      [{ id: "user-1", role: "student", universityId: "uni-1" }],
    )

    const { assignDepartmentHead } = await loadAssignHeadModule()
    expect(assignDepartmentHead("dept-1", "user-1")).rejects.toThrow(
      "Existing account role cannot be reassigned as department head; create or use a dedicated department head account",
    )
  })

  test("should return success when the target already is a university admin", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", universityId: "uni-1", name: "CS" }],
      [{ id: "user-1", role: "university_admin", universityId: "uni-1" }],
    )

    const { assignDepartmentHead } = await loadAssignHeadModule()
    const result = await assignDepartmentHead("dept-1", "user-1")

    expect(result).toEqual({
      success: true,
      departmentId: "dept-1",
      userId: "user-1",
    })
  })

  test("should upsert membership and update carrier role in a transaction", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", universityId: "uni-1", name: "CS" }],
      [{ id: "user-1", role: "university_admin", universityId: "uni-1" }],
    )

    const { assignDepartmentHead } = await loadAssignHeadModule()
    await assignDepartmentHead("dept-1", "user-1")

    expect(mockTransaction).toHaveBeenCalledTimes(1)
    expect(mockTxUpdate.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(mockTxInsert).toHaveBeenCalledTimes(1)
    expect(mockTxUpdateSet.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(mockTxUpdateWhere.mock.calls.length).toBeGreaterThanOrEqual(2)

    const updatePayloads = (
      mockTxUpdateSet.mock.calls as unknown as Array<
        [
          | {
              role?: string
              universityId?: string | null
              departmentId?: string | null
            }
          | undefined,
        ]
      >
    ).map(([payload]) => payload ?? null)

    expect(
      updatePayloads.some(
        (payload) =>
          payload?.role === "university_admin" &&
          payload.universityId === "uni-1" &&
          payload.departmentId === null,
      ),
    ).toBe(true)
  })

  test("should make two select queries (dept + user)", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", universityId: "uni-1", name: "CS" }],
      [{ id: "user-1", role: "university_admin", universityId: "uni-1" }],
    )

    const { assignDepartmentHead } = await loadAssignHeadModule()
    await assignDepartmentHead("dept-1", "user-1")

    expect(mockSelect).toHaveBeenCalledTimes(2)
    expect(mockLimit).toHaveBeenCalledTimes(2)
  })
})
