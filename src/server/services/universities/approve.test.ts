import { beforeEach, describe, expect, mock, test } from "bun:test"

const mockReturning = mock(() =>
  Promise.resolve([{ id: "uni-1", name: "Test Uni" }]),
)
const mockWhere = mock(() => ({ returning: mockReturning }))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

const mockTx = { update: mockUpdate }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockTransaction = mock(async (fn: (tx: any) => Promise<any>) => {
  return await fn(mockTx)
})

function applyApproveUniversityMocks() {
  mock.module("@/server/db", () => ({
    db: { transaction: mockTransaction },
  }))
}

let approveUniversityImportCounter = 0
async function importApproveUniversity() {
  approveUniversityImportCounter += 1
  return import(
    `@/server/services/universities/approve?test=${approveUniversityImportCounter}`
  )
}

describe("approveUniversity", () => {
  beforeEach(() => {
    applyApproveUniversityMocks()

    mockTransaction.mockClear()
    mockUpdate.mockClear()
    mockSet.mockClear()
    mockWhere.mockClear()
    mockReturning.mockClear()

    mockUpdate.mockReturnValue({ set: mockSet })
    mockSet.mockReturnValue({ where: mockWhere })
    mockWhere.mockReturnValue({ returning: mockReturning })
    mockReturning.mockResolvedValue([{ id: "uni-1", name: "Test Uni" }])
    mockTransaction.mockImplementation(async (fn) => {
      return await fn(mockTx)
    })
  })

  test("should return universityId on success", async () => {
    const { approveUniversity } = await importApproveUniversity()
    const result = await approveUniversity("uni-1", "admin-1")
    expect(result).toEqual({ universityId: "uni-1", name: "Test Uni" })
  })

  test("should use transaction", async () => {
    const { approveUniversity } = await importApproveUniversity()
    await approveUniversity("uni-1", "admin-1")
    expect(mockTransaction).toHaveBeenCalledTimes(1)
  })

  test("should update both university and domains", async () => {
    const { approveUniversity } = await importApproveUniversity()
    await approveUniversity("uni-1", "admin-1")
    // 1 university update (with returning) + 1 domain update
    expect(mockUpdate).toHaveBeenCalledTimes(2)
  })

  test("should throw when university not found", async () => {
    mockReturning.mockResolvedValue([])

    const { approveUniversity } = await importApproveUniversity()
    expect(approveUniversity("nonexistent", "admin-1")).rejects.toThrow(
      "University not found",
    )
  })
})
