import { beforeEach, describe, expect, mock, test } from "bun:test"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectLimitQueue: unknown[][] = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockLimit = mock((): any => Promise.resolve(selectLimitQueue.shift() ?? []))
const mockWhere = mock(() => ({ limit: mockLimit }))
const mockFrom = mock(() => ({ where: mockWhere }))
const mockSelect = mock(() => ({ from: mockFrom }))

const mockUpdateWhere = mock(() => Promise.resolve())
const mockSet = mock(() => ({ where: mockUpdateWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

// Transaction mocks — used by assignDepartmentHead (called internally)
const mockTxUpdateWhere = mock(() => Promise.resolve())
const mockTxUpdateSet = mock(() => ({ where: mockTxUpdateWhere }))
const mockTxUpdate = mock(() => ({ set: mockTxUpdateSet }))

const mockTransaction = mock(
  async (callback: (tx: { update: typeof mockTxUpdate }) => Promise<unknown>) =>
    callback({
      update: mockTxUpdate,
    }),
)

const mockCreateUser = mock(() =>
  Promise.resolve({ user: { id: "new-user-id" } }),
)
const mockRequestPasswordReset = mock(() => Promise.resolve(undefined))

const pendingWelcomeEmails = new Map<
  string,
  { name: string; departmentName: string; universityName: string }
>()
let moduleImportCounter = 0

function applyAssignHeadByEmailMocks() {
  mock.module("@/server/db", () => ({
    db: {
      select: mockSelect,
      update: mockUpdate,
      transaction: mockTransaction,
    },
  }))

  mock.module("@/lib/auth", () => ({
    auth: {
      api: {
        createUser: mockCreateUser,
        requestPasswordReset: mockRequestPasswordReset,
      },
    },
    pendingWelcomeEmails,
  }))
}

async function loadAssignHeadByEmailModule() {
  moduleImportCounter += 1
  return import(
    `@/server/services/departments/assign-head-by-email?test=${moduleImportCounter}`
  )
}

describe("assignDepartmentHeadByEmail", () => {
  beforeEach(() => {
    selectLimitQueue.length = 0
    applyAssignHeadByEmailMocks()
    mockSelect.mockClear()
    mockFrom.mockClear()
    mockWhere.mockClear()
    mockLimit.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockUpdateWhere.mockClear()
    mockTxUpdate.mockClear()
    mockTxUpdateSet.mockClear()
    mockTxUpdateWhere.mockClear()
    mockTransaction.mockClear()
    mockCreateUser.mockClear()
    mockRequestPasswordReset.mockClear()
    pendingWelcomeEmails.clear()

    mockSelect.mockReturnValue({ from: mockFrom })
    mockFrom.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ limit: mockLimit })
    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockUpdateWhere })
    mockUpdateWhere.mockResolvedValue(undefined)
    mockTxUpdate.mockReturnValue({ set: mockTxUpdateSet })
    mockTxUpdateSet.mockReturnValue({ where: mockTxUpdateWhere })
    mockTxUpdateWhere.mockResolvedValue(undefined)
  })

  test("should assign existing user and trigger password reset", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", name: "Computer Science", universityId: "uni-1" }],
      [{ name: "University of Algiers" }],
      [{ id: "user-1", name: "Existing Head" }],
      [{ id: "dept-1", name: "Computer Science", universityId: "uni-1" }],
      [{ id: "user-1", role: "dept_head", name: "Existing Head" }],
    )

    const { assignDepartmentHeadByEmail } = await loadAssignHeadByEmailModule()
    const result = await assignDepartmentHeadByEmail({
      departmentId: "dept-1",
      headEmail: "head@university.dz",
    })

    expect(result).toEqual({
      success: true,
      departmentId: "dept-1",
      userId: "user-1",
      email: "head@university.dz",
    })
    expect(mockCreateUser).not.toHaveBeenCalled()
    expect(mockRequestPasswordReset).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resetCall = (mockRequestPasswordReset.mock.calls as any)[0][0]
    expect(resetCall.body.redirectTo).toBe("/reset-password/verify")
  })

  test("should create missing user, assign head, and trigger reset", async () => {
    selectLimitQueue.push(
      [{ id: "dept-1", name: "Computer Science", universityId: "uni-1" }],
      [{ name: "University of Algiers" }],
      [],
      [{ id: "dept-1", name: "Computer Science", universityId: "uni-1" }],
      [{ id: "new-user-id", role: "dept_head", name: "Dr. New Head" }],
    )

    const { assignDepartmentHeadByEmail } = await loadAssignHeadByEmailModule()
    const result = await assignDepartmentHeadByEmail({
      departmentId: "dept-1",
      headEmail: "new-head@university.dz",
    })

    expect(result.userId).toBe("new-user-id")
    expect(mockCreateUser).toHaveBeenCalledTimes(1)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const call = (mockCreateUser.mock.calls as any)[0][0]
    expect(call.body.name).toBe("New Head")
    expect(call.body.data.emailVerified).toBe(true)
    expect(mockRequestPasswordReset).toHaveBeenCalledTimes(1)
    expect(pendingWelcomeEmails.has("new-head@university.dz")).toBe(true)
  })

  test("should throw when department is not found", async () => {
    selectLimitQueue.push([])

    const { assignDepartmentHeadByEmail } = await loadAssignHeadByEmailModule()
    expect(
      assignDepartmentHeadByEmail({
        departmentId: "missing-dept",
        headEmail: "head@university.dz",
      }),
    ).rejects.toThrow("Department not found")
  })
})
